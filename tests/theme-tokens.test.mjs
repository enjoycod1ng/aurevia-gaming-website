import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function block(prelude) {
  const start = css.indexOf(`${prelude} {`);
  assert.notEqual(start, -1, `missing ${prelude}`);
  return css.slice(start, css.indexOf("}", start));
}

// The light or dark half of each light-dark() colour token in :root.
function palette(scheme) {
  return Object.fromEntries(
    [...block(":root").matchAll(/(--[\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\);/g)].map(
      ([, name, light, dark]) => [name, scheme === "light" ? light : dark],
    ),
  );
}

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((part) => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test("form control boundaries reach 3:1 against the backgrounds they sit on", () => {
  for (const scheme of ["light", "dark"]) {
    const colors = palette(scheme);
    for (const background of ["--canvas", "--canvas-soft", "--surface"]) {
      const ratio = contrast(colors["--line-control"], colors[background]);
      assert.ok(ratio >= 3, `${scheme} --line-control on ${background} is ${ratio.toFixed(2)}:1`);
    }
  }
  assert.match(block(".form-field"), /border: 1px solid var\(--color-line-control\)/);
  assert.match(block(".portal-input"), /border: 1px solid var\(--line-control\)/);
});
