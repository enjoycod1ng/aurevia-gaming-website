import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
export function loadModule(file) {
  const filename = path.resolve(root, file);
  if (cache.has(filename)) return cache.get(filename).exports;
  if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const nativeRequire = createRequire(filename);
  function require(specifier) {
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return nativeRequire(specifier);
    const base = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`].find(candidate => fs.existsSync(candidate));
    if (!resolved) throw new Error(`Cannot resolve ${specifier}`);
    return loadModule(resolved);
  }
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename })(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
