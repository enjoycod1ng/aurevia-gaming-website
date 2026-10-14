import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/scroll-reveal-init.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ reduced = false, supported = true } = {}) {
  class Element {
    constructor(top = 1000, target = true) {
      this.top = top;
      this.target = target;
      this.isConnected = true;
      this.children = [];
      this.classes = new Set();
      this.classList = {
        add: (name) => this.classes.add(name),
        remove: (name) => this.classes.delete(name),
      };
    }
    matches() { return this.target; }
    querySelectorAll() {
      return this.children.flatMap((child) => [
        ...(child.target ? [child] : []), ...child.querySelectorAll(),
      ]);
    }
    getBoundingClientRect() { return { top: this.top }; }
  }
  const hero = new Element(0);
  const below = new Element(1200);
  const body = new Element(0, false);
  body.children = [hero, below];
  const observed = new Set();
  let intersect, mutate, cleanup, motionChanged;
  const media = {
    matches: reduced,
    addEventListener: (_, callback) => { motionChanged = callback; },
    removeEventListener: () => {},
  };
  class IntersectionObserver {
    constructor(callback) { intersect = callback; }
    observe(element) { observed.add(element); }
    unobserve(element) { observed.delete(element); }
    disconnect() { observed.clear(); }
  }
  class MutationObserver {
    constructor(callback) { mutate = callback; }
    observe() {}
    disconnect() {}
  }
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: () => ({ useEffect: (effect) => { cleanup = effect(); } }),
    window: { innerHeight: 800, matchMedia: () => media, ...(supported ? { IntersectionObserver } : {}) },
    document: { body }, Element, IntersectionObserver, MutationObserver,
  });
  exports.ScrollRevealInit();
  return {
    hero, below, body, observed, Element,
    intersect: (target) => intersect([{ target, isIntersecting: true }]),
    add: (node) => mutate([{ addedNodes: [node], removedNodes: [] }]),
    remove: (node) => { node.isConnected = false; mutate([{ addedNodes: [], removedNodes: [node] }]); },
    reduce: () => { media.matches = true; motionChanged(); },
    cleanup: () => cleanup?.(),
  };
}

test("content remains visible with reduced motion or no observer support", () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const app = setup(options);
    assert.equal(app.observed.size, 0);
    assert.equal(app.hero.classes.size, 0);
    assert.equal(app.below.classes.size, 0);
  }
});

test("first-screen content stays visible; offscreen content reveals on entry", () => {
  const app = setup();
  assert.equal(app.hero.classes.size, 0);
  assert.equal(app.observed.has(app.hero), false);
  assert.equal(app.below.classes.has("scroll-reveal-pending"), true);
  app.intersect(app.below);
  assert.equal(app.below.classes.size, 0);
  assert.equal(app.observed.size, 0);
});

test("filtered cards and client navigation observe added subtrees and release removed nodes", () => {
  const app = setup();
  const wrapper = new app.Element(0, false);
  const card = new app.Element();
  wrapper.children = [card];
  app.add(wrapper);
  assert.equal(app.observed.has(card), true);
  app.remove(wrapper);
  assert.equal(app.observed.has(card), false);
  assert.equal(card.classes.size, 0);
  wrapper.isConnected = true;
  app.add(wrapper);
  assert.equal(app.observed.has(card), true);
  app.cleanup();
  assert.equal(app.observed.size, 0);
  assert.equal(card.classes.size, 0);
  assert.equal(app.below.classes.size, 0);
});

test("changing motion preference reveals all pending content", () => {
  const app = setup();
  app.reduce();
  assert.equal(app.observed.size, 0);
  assert.equal(app.below.classes.size, 0);
});
