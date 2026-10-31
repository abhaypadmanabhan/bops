// Tests for a reply flowing in (components/app/chat-view.tsx Rich's `flow`, the motion-flow-word animation in
// app/globals.css): each word, code span, bold run or link of a reply that came in while the chat was open fades in
// a step after the one before, in reading order across paragraphs, headings and code blocks; a long reply's steps
// are closer so it's all there in about a second; a very long one, and any reply without flow (history), has none.
// Rendered to HTML. Usage: node scripts/test-flowing-reply.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) specifier = pathToFileURL(`${root}/${specifier.slice(2)}`).href;
    try {
      return next(specifier, context);
    } catch (e) {
      if (/^(\.{1,2}\/|\/|file:)/.test(specifier))
        for (const ext of [".ts", ".tsx"])
          try {
            return next(specifier + ext, context);
          } catch {}
      throw e;
    }
  },
  load(url, context, next) {
    if (url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
    if (!url.endsWith(".tsx")) return next(url, context);
    const source = readFileSync(fileURLToPath(url), "utf8");
    const out = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false }, fileName: url });
    return { format: "module", source: out.outputText, shortCircuit: true };
  },
});
const emitWarning = process.emitWarning.bind(process);
process.emitWarning = (warning, ...rest) => (rest[0]?.code === "MODULE_TYPELESS_PACKAGE_JSON" ? undefined : emitWarning(warning, ...rest));

// A window, enough of one (nothing here runs effects: it's rendered to HTML).
globalThis.window = globalThis;
globalThis.location = { origin: "http://localhost:3210" };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {}, getElementById: () => null };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const { createElement: h } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const { Rich } = await import("../components/app/chat-view.tsx");

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`ok - ${name}`);
};
const render = (text, flow) => renderToStaticMarkup(h(Rich, { text, botId: "b1", flow }));
/** Each flowing element's text and its delay in ms, in the order they're drawn. */
const flowing = (html) =>
  [...html.matchAll(/<\w+([^>]*)>([^<]*)/g)].filter((m) => /class="[^"]*motion-flow-word/.test(m[1])).map((m) => [m[2], Number(/animation-delay:(\d+)ms/.exec(m[1])?.[1])]);

check("each word a step after the one before, 50ms apart for a short reply, the spaces between them kept", () => {
  const html = render("Booked for Tuesday at noon.", true);
  assert.deepEqual(flowing(html), [["Booked", 0], ["for", 50], ["Tuesday", 100], ["at", 150], ["noon.", 200]]);
  assert.match(html.replace(/<[^>]+>/g, ""), /^Booked for Tuesday at noon\.$/, "the same words, read the same");
});

check("in reading order across a paragraph, a heading, a code span, a link and a code block", () => {
  const html = render("Two steps.\n\n# Next\nRun `npm ci` then [open it](https://example.com).\n```\nnpm run dev\n```\nDone.", true);
  assert.deepEqual(
    flowing(html).map(([t]) => t),
    ["Two", "steps.", "Next", "Run", "npm ci", "then", "open it", ".", "npm run dev", "Done."],
  );
  const delays = flowing(html).map(([, d]) => d);
  assert.deepEqual(delays, [...delays].sort((a, b) => a - b), "never a step back");
});

check("never a step back when marks and punctuation sit between words: each part starts after all the steps above it", () => {
  assert.deepEqual(flowing(render("Use `git`, `ls`, and `pwd`.\n# Next\nDone.", true)), [
    ["Use", 0], ["git", 50], [",", 100], ["ls", 150], [",", 200], ["and", 250], ["pwd", 300], [".", 350], ["Next", 400], ["Done.", 450],
  ]);
  assert.deepEqual(flowing(render("See `a` and `b`.\n```\nx\n```\nAfter.", true)).map(([, d]) => d), [0, 50, 100, 150, 200, 250, 300]);
});

check("a long reply's steps are closer, so it's all there in about a second; a very long one just appears", () => {
  const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
  const long = flowing(render(words(300), true));
  assert.equal(long.length, 300);
  assert.equal(long[1][1], 3, "900ms over 300 words: 3ms apart");
  assert.ok(long.at(-1)[1] <= 900);
  assert.equal(flowing(render(words(401), true)).length, 0);
  assert.equal(flowing(render(`**${words(401)}**`, true)).length, 0, "counted in words, however they're marked");
});

check("history, and any reply without flow, is drawn as it always was", () => {
  const html = render("Booked for Tuesday at **noon**.", false);
  assert.equal(flowing(html).length, 0);
  assert.ok(!html.includes("motion-flow-word"));
  assert.match(html, /^Booked for Tuesday at <strong class="font-semibold ">noon<\/strong>\.$/);
});

console.log(`\nflowing reply: ${passed} passed`);
