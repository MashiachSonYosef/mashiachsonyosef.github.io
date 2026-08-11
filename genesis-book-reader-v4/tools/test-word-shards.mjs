#!/usr/bin/env node
// Local proof: Rashi 1:1:1 words wake as exact K/D/M modules from the
// generated shards, the lemma presentation rides without text mutation,
// and the audit stays PASS.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(
  "/home/claude/.npm-global/lib/node_modules/playwright",
);

const BASE = "http://localhost:8321/genesis-book-reader-v4.html";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
// Open with the Rashi rail and comment 1 active via share-link params.
await page.goto(
  `${BASE}?v5work=${encodeURIComponent("Rashi on Genesis")}&v5unit=${encodeURIComponent("Rashi on Genesis 1:1:1")}&v5ref=${encodeURIComponent("Genesis 1:1")}`,
);
await page.waitForTimeout(3400);

const report = await page.evaluate(() => {
  const audit = window.V4_BOOK_READER_AUDIT || {};
  const registry = window.NESTED_RASHI_HUD_WORDS || {};
  const active = [...document.querySelectorAll(".v5-rail-item")].find(item => item.dataset.commentaryUnitRef === "Rashi on Genesis 1:1:1");
  const run = active?.querySelector(".v3-commentary-word-run");
  const buttons = [...(run?.querySelectorAll(".v3-word-module") || [])];
  const usable = buttons.filter(
    (button) => !button.classList.contains("is-hud-held"),
  );
  const held = buttons.filter((button) =>
    button.classList.contains("is-hud-held"),
  );
  const lemmaButtons = run?.querySelectorAll(".v5-lemma-word") || [];
  const firstGlosses = usable
    .slice(0, 6)
    .map(
      (button) =>
        `${button.querySelector(".v3-word-source")?.textContent} → ${button.querySelector(".v3-word-gloss")?.textContent}`,
    );
  return {
    audit_status: audit.status,
    audit_shards: audit.commentary_word_shards,
    audit_lemma: audit.lemma_presentation,
    registry_words: Object.keys(registry).length,
    run_present: Boolean(run),
    buttons: buttons.length,
    usable: usable.length,
    held: held.length,
    lemma_marked_buttons: lemmaButtons.length,
    first_glosses: firstGlosses,
  };
});

// Tap the first usable word → shelf must show pills + D card + M records.
const shelfReport = await page.evaluate(async () => {
  const active = [...document.querySelectorAll(".v5-rail-item")].find(item => item.dataset.commentaryUnitRef === "Rashi on Genesis 1:1:1");
  const run = active?.querySelector(".v3-commentary-word-run");
  const button = [...(run?.querySelectorAll(".v3-word-module") || [])].find(
    (candidate) => !candidate.classList.contains("is-hud-held"),
  );
  if (!button) return { tapped: false };
  button.click();
  await new Promise((resolve) => setTimeout(resolve, 700));
  const shelf = active.querySelector(".v3-commentary-hud-shelf");
  const pills = shelf?.querySelectorAll(".v3-route-choices button") || [];
  const dCard = shelf?.querySelector(".v4-hud-d-card");
  const records = shelf?.querySelectorAll(".v6-record") || [];
  const attribution = shelf?.querySelector("[data-v4-route-attribution]");
  return {
    tapped: true,
    shelf_open: Boolean(shelf && !shelf.hidden),
    pill_count: pills.length,
    d_card: Boolean(dCard),
    d_card_text: dCard?.textContent?.slice(0, 220) || "",
    record_stack_count: records.length,
    attribution_status: attribution?.dataset?.status || null,
    attribution_text: attribution?.textContent?.slice(0, 200) || "",
  };
});

// Held word → status shelf must show the recorded hold reason.
const heldReport = await page.evaluate(async () => {
  const active = [...document.querySelectorAll(".v5-rail-item")].find(item => item.dataset.commentaryUnitRef === "Rashi on Genesis 1:1:1");
  const run = active?.querySelector(".v3-commentary-word-run");
  const button = [...(run?.querySelectorAll(".v3-word-module") || [])].find(
    (candidate) => candidate.classList.contains("is-hud-held"),
  );
  if (!button) return { tapped: false };
  button.click();
  await new Promise((resolve) => setTimeout(resolve, 400));
  const shelf = active.querySelector(".v3-commentary-hud-shelf");
  return {
    tapped: true,
    text: shelf?.textContent?.slice(0, 260) || "",
  };
});

// Lemma in a proof text (Ramban keeps whole proof text).
await page.goto(
  `${BASE}?v5work=${encodeURIComponent("Ramban on Genesis")}&v5ref=${encodeURIComponent("Genesis 1:1")}`,
);
await page.waitForTimeout(2600);
const proofLemma = await page.evaluate(() => {
  const lemmas = [...document.querySelectorAll(".v4-commentary-raw-proof .v5-lemma")];
  const audit = window.V4_BOOK_READER_AUDIT || {};
  return {
    audit_lemma: audit.lemma_presentation,
    samples: lemmas.slice(0, 3).map((node) => ({
      lemma: node.textContent,
      parent_starts: node.parentElement.textContent.slice(0, 46),
    })),
  };
});

console.log(JSON.stringify({ report, shelfReport, heldReport, proofLemma, errors: errors.slice(0, 6) }, null, 1));
await browser.close();
