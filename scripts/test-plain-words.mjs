// Tests for lib/plain-words.ts: what a bot's words and steps say to someone who isn't a developer.
// Usage: node --experimental-strip-types scripts/test-plain-words.mjs
import assert from "node:assert/strict";
import { dropCitations, isLocalLink, localOnlyLine, plainStep, plainTitle } from "../lib/plain-words.ts";

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
  assert.equal(plainStep("ran git log --oneline -5"), "Looked at the code history");
  assert.equal(plainStep("ran npm test"), "Ran a command", "a test run isn't setting the app up");
  assert.equal(plainStep("ran git commit -m fix"), "Ran a command", "nor is a commit looking at history");
  assert.equal(plainStep("Read https://fourcorners.brandlord.agency/start?redirect=%2F"), "Read fourcorners.brandlord.agency");
  assert.equal(plainStep("Check the corrected draft itinerary"), "Check the corrected draft itinerary", "a step already in words stays");
});

check("a thread's title says where an app's copy runs, its computer, not Local or localhost; the rest stays", () => {
  assert.equal(plainTitle("Run Four Corners Local"), "Run Four Corners on its computer");
  assert.equal(plainTitle("Show Four Corners locally"), "Show Four Corners on its computer");
  assert.equal(plainTitle("Open the brochure on localhost:3101"), "Open the brochure on its computer");
  assert.equal(plainTitle("Check http://localhost:3000/start for the cover"), "Check its computer for the cover");
  assert.equal(plainTitle("Four Corners draft brochure"), "Four Corners draft brochure", "already plain");
  assert.equal(plainTitle("Local news digest"), "Local news digest", "Local only where it ends the title");
  assert.equal(plainTitle("Call the local printer"), "Call the local printer");
});

check("a localhost link is one to the computer it runs on, and says so", () => {
  for (const href of ["http://localhost:3101/", "http://localhost", "https://127.0.0.1:8080/x?y", "http://LOCALHOST:3000#a"]) assert.ok(isLocalLink(href), href);
  for (const href of ["https://fourcorners.brandlord.agency", "http://localhost.example.com/", "/api/pages/x", "http://127.0.0.12/"]) assert.ok(!isLocalLink(href), href);
  assert.equal(localOnlyLine("Orgo team"), "opens only on Orgo team's computer");
  assert.equal(localOnlyLine(undefined), "opens only on the bot's computer");
});

console.log(`\nplain words: ${passed} passed`);
