// Tests for lib/plain-words.ts: what a bot's words and steps say to someone who isn't a developer.
// Usage: node --experimental-strip-types scripts/test-plain-words.mjs
import assert from "node:assert/strict";
import { dropCitations, plainStep } from "../lib/plain-words.ts";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`ok - ${name}`);
};
const cite = (id) => `cite${id}`;

check("citation markers go, with the space before them, and nothing else changes", () => {
  assert.equal(dropCitations(`I found the logo files. ${cite("turn0search3")}`), "I found the logo files.");
  assert.equal(dropCitations(`seven walking days ${cite("turn1view0")}${cite("turn1view5")}.`), "seven walking days.");
  assert.equal(dropCitations(`From the guide fileciteturn2file0, page 3.`), "From the guide, page 3.");
  assert.equal(dropCitations("Plain words, kept: a, b; c. Run `cd .` first."), "Plain words, kept: a, b; c. Run `cd .` first.");
});

check("steps are said as a person would", () => {
  assert.equal(plainStep("clicked (666, 115)"), "Clicked on the screen");
  assert.equal(plainStep("ran python3 - <<'PY' from urllib.request import urlopen"), "Looked things up online");
  assert.equal(plainStep("ran python3 - <<'PY' from pathlib import Path import json"), "Worked on the files");
  assert.equal(plainStep("ran npx playwright install --with-deps chromium"), "Set up the app");
  assert.equal(plainStep("ran pdftoppm -png camino-DRAFT.pdf page"), "Checked the PDF");
  assert.equal(plainStep("Read https://fourcorners.brandlord.agency/start?redirect=%2F"), "Read fourcorners.brandlord.agency");
  assert.equal(plainStep("Check the corrected draft itinerary"), "Check the corrected draft itinerary", "a step already in words stays");
});

console.log(`\nplain words: ${passed} passed`);
