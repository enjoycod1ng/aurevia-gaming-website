#!/usr/bin/env node

// Captures a page at an exact CSS viewport with a local Chrome or Edge through the
// DevTools protocol. Used for gameplay captures and the link-preview images.
//
//   node scripts/capture-page.mjs <url> <output.png|.jpg> <width>x<height>
//     [--fill <selector>]   stretch one element (such as the demo iframe) over the viewport
//     [--wait <seconds>]    wait before clicking or capturing (default 2)
//     [--click <x>,<y>]     click a viewport point, then wait again (repeatable)
//
// Set CHROME_PATH when the browser is not in a standard location.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const [url, output, size, ...options] = process.argv.slice(2);
const [width, height] = (size ?? "").split("x").map(Number);
if (!url || !output || !width || !height) {
  console.error("Usage: capture-page.mjs <url> <output.png> <width>x<height> [--fill <selector>] [--wait <seconds>] [--click <x>,<y>]");
  process.exit(1);
}
const values = (name) => options.flatMap((value, index) => (options[index - 1] === name ? [value] : []));
const fill = values("--fill")[0];
const waitMs = Number(values("--wait")[0] ?? 2) * 1000;
const clicks = values("--click").map((point) => point.split(",").map(Number));

const browser = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((candidate) => candidate && existsSync(candidate));
if (!browser) throw new Error("No Chrome or Edge found; set CHROME_PATH");

const profile = mkdtempSync(path.join(tmpdir(), "aurevia-capture-"));
const port = 9300 + Math.floor(Math.random() * 600);
const child = spawn(
  browser,
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--mute-audio", "--no-first-run", "about:blank"],
  { stdio: "ignore" },
);

try {
  let target;
  for (let attempt = 0; attempt < 50 && !target; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = targets.find((candidate) => candidate.type === "page");
    } catch { /* The browser is still starting. */ }
    if (!target) await delay(200);
  }
  if (!target) throw new Error("The browser did not open a DevTools page target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (request) {
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    } else {
      for (const listener of listeners) listener(message);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  };

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  // Headless Chrome names itself in its user agent; present the regular browser.
  const { userAgent } = await send("Browser.getVersion");
  await send("Network.setUserAgentOverride", { userAgent: userAgent.replace("HeadlessChrome", "Chrome") });
  const loaded = new Promise((resolve) => listeners.add((message) => message.method === "Page.loadEventFired" && resolve()));
  await send("Page.navigate", { url });
  await loaded;
  await evaluate("document.fonts.ready.then(() => true)");

  if (fill) {
    await evaluate(`(async () => {
      for (let attempt = 0; attempt < 120; attempt++) {
        const element = document.querySelector(${JSON.stringify(fill)});
        if (element) {
          element.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;margin:0;border:0;z-index:2147483647";
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error("No element matches the --fill selector");
    })()`);
  }
  await delay(waitMs);
  for (const [x, y] of clicks) {
    // Canvas games react to pointer events, which need a move and the pressed-button state.
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await delay(120);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
    await delay(waitMs);
  }

  const jpeg = /\.jpe?g$/i.test(output);
  const { data } = await send("Page.captureScreenshot", {
    format: jpeg ? "jpeg" : "png",
    ...(jpeg ? { quality: 88 } : {}),
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  writeFileSync(output, Buffer.from(data, "base64"));
  console.log(`${output}: ${width}x${height} from ${url}`);
  // Leave the page normally so it can run its unload work before the browser
  // stops. This does not reliably release a demo session (assets/README.md).
  await send("Page.navigate", { url: "about:blank" });
  await delay(1500);
  socket.close();
} finally {
  child.kill();
  await delay(500);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
