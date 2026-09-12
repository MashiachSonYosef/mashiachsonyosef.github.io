#!/usr/bin/env node
// GUARDS: hoh-sidecar-rule-v1-a-hebrew-definition-is-served-by-volume-and-quotes-only-from-the-floor
//
// The Hebrew-on-Hebrew panel draws on the card, and says the right thing in
// each of its states. A dictionary entry is laid out like the verse — a run
// of blocks, Hebrew over its English — with a quoted line in a gold box that
// names what it quotes; every word of it opens the same card the verse's
// words do. A held entry prints its headword and its reason and no text. A
// word with no entry is told which of two things is true: past the floor of
// the served volumes, or simply not delivered.
//
// This runs against a fixture (data/zones/fixture-hoh.bin with its own
// fixture-hoh.hoh.bin), a test instrument never served, because nothing of
// the dictionary's has been delivered and the check has to press something.
// It SKIPS, by name, when no zone on disk carries a sidecar.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesWithHoh } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const WITH = zonesWithHoh();
if (!WITH.length) { console.log("SKIPPED — no zone on disk carries a Hebrew-on-Hebrew sidecar, so check-hoh-in-card-v1 has nothing to press"); process.exit(3); }
const ZONE = WITH[0];
const store = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.hoh.bin`)).toString("utf8"));
const entries = store.entries || {};
const servedKey = Object.keys(entries).find((k) => entries[k].served && (entries[k].strata || []).some((s) => s.kind === "quote"));
const heldVolumeKey = Object.keys(entries).find((k) => (entries[k].held || []).includes("VOLUME_NOT_DECLARED"));
const heldStarKey = Object.keys(entries).find((k) => (entries[k].held || []).includes("ASTERISK_PENDING_READ"));

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());

// press words of the first sections until the panel is in the wanted state;
// the page is asked for its own words, nothing is typed here
const pressUntil = async (p, want, limit = 80) => {
  const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
  for (let i = 0; i < Math.min(n, limit); i += 1) {
    await p.evaluate((j) => { const w = document.querySelectorAll("section.seg .he-text .wb")[j]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, i);
    await p.waitForTimeout(250);
    const state = await p.evaluate(() => {
      const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
      const hoh = h.querySelector(".hoh"); if (!hoh) return { none: true };
      return { hw: hoh.querySelector(".hoh-hw")?.textContent || "", served: !!hoh.querySelector(".hoh-head .lic-chip.on"),
        held: hoh.querySelector(".hoh-held")?.textContent || "", silent: hoh.querySelector(".hoh-silent")?.textContent || "",
        runs: hoh.querySelectorAll(".hoh-run").length, quotes: hoh.querySelectorAll(".hoh-quote").length,
        ref: hoh.querySelector(".hoh-ref")?.textContent || "", blocks: hoh.querySelectorAll(".hoh-run .wb").length,
        withReading: [...hoh.querySelectorAll(".hoh-run .wb")].filter((w) => (w.querySelector(".g")?.textContent || "").trim()).length,
        src: hoh.querySelector(".hoh-src")?.textContent || "", inCard: h.contains(hoh),
        visible: hoh.getBoundingClientRect().top < h.getBoundingClientRect().bottom,
        dir: hoh.querySelector(".hoh-run") ? getComputedStyle(hoh.querySelector(".hoh-run")).direction : "-" };
    });
    if (state && !state.none && want(state)) return { at: i, ...state };
  }
  return null;
};

for (const [mode, reader] of [["", "the Hebrew reader"], ["&mode=en", "the English reader"]]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=${ZONE}${mode}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(600);
  console.log(`— ${ZONE}, ${reader} —`);
  const loaded = await p.evaluate(() => ({ store: !!window.__hohStore, refused: window.__hohRefused || null,
    receipts: (document.querySelector("#meta .receipts-full")?.textContent || "") }));
  check("  the sidecar loaded and passed its seal", loaded.store && !loaded.refused, loaded.refused || "");
  check("  and the receipts say what it defines", /defines \d+ of this book's headwords in Hebrew/.test(loaded.receipts));

  // a served entry with a quote
  const served = await pressUntil(p, (s) => s.served && s.quotes > 0);
  check("  a served entry draws on the card, under the record", !!served && served.inCard && served.visible, served ? `word ${served.at + 1} · ${served.hw}` : "none found");
  if (served) {
    const e = servedKey ? entries[servedKey] : null;
    check("  it prints the headword, the volume and the ruling it serves under", served.hw.length > 0 && /vol\./.test(served.src) && /ruling/.test(served.src));
    check("  a quoted line stands in a gold box and names what it quotes", served.quotes >= 1 && /^quotes \d+:\d+/.test(served.ref), served.ref);
    check("  every word of the quote is a block", e ? served.blocks === e.strata.filter((s) => s.kind === "quote").reduce((n, s) => n + s.words.length, 0) : served.blocks > 0,
      `${served.blocks} blocks`);
    check("  most of them carry a reading", served.withReading > served.blocks / 2, `${served.withReading} of ${served.blocks}`);
    check(`  it reads ${mode ? "left to right" : "right to left"}`, served.dir === (mode ? "ltr" : "rtl"), served.dir);
    check("  and it names no license it was not given", /no license declared/.test(served.src));
    // a word of the entry opens the card for itself
    const pressed = await p.evaluate(() => {
      const w = [...document.querySelectorAll("#hud .hoh-run .wb")].find((x) => (x.querySelector(".g")?.textContent || "").trim());
      if (!w) return null;
      const t = w.querySelector(".w").textContent.trim();
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      return t;
    });
    await p.waitForTimeout(500);
    const after = await p.evaluate(() => { const h = document.querySelector("#hud"); return { open: !!h && !h.hidden, head: (h?.querySelector(".r-head, .head, h2, .hw")?.textContent || h?.textContent || "").replace(/\s+/g, " ").slice(0, 80), pills: h ? h.querySelectorAll(".r-pills button, .r-pills .r-pill").length : 0 }; });
    check("  pressing a word of the entry opens the card for that word", !!pressed && after.open && after.pills > 0, `${pressed} · ${after.pills} routes`);
  }
  // held by volume: headword and reason, no text
  const heldV = await pressUntil(p, (s) => /not declared served/.test(s.held));
  check("  an entry from an undeclared volume prints its headword and its reason, and no text", !!heldV && heldV.runs === 0 && heldV.hw.length > 0,
    heldV ? heldV.held.slice(0, 80) : heldVolumeKey ? "none found on the page" : "no such entry in the fixture");
  // held by asterisk
  const heldA = await pressUntil(p, (s) => /asterisk/.test(s.held));
  check("  an asterisked entry is held for that reason, and no text", !!heldA && heldA.runs === 0,
    heldA ? heldA.held.slice(0, 80) : heldStarKey ? "none found on the page" : "no such entry in the fixture");
  // silence, past the floor
  const past = await pressUntil(p, (s) => /past the last one/.test(s.silent));
  check("  a headword past the floor is told it stands in a volume not served", !!past, past ? past.silent.slice(0, 90) : "none found");
  const none = await pressUntil(p, (s) => /no entry in what was delivered/.test(s.silent));
  check("  a headword under the floor with no entry is told it was not delivered", !!none, none ? none.silent.slice(0, 90) : "none found");
  await p.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
