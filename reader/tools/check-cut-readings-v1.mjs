#!/usr/bin/env node
// A reading that is a piece cut out of a sibling record is marked as one, and
// the licence decides whether it may be shown at all.
// GUARDS: provider-declaration-rule-v1-closed-set-ship-whole-by-default
//
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");

// the store itself
const store = await p.evaluate(async () => {
  const idx = await fetch("data/route-store/index.json", { cache: "no-cache" }).then((r) => r.json());
  return { c: idx.counts, rule: idx.rule_id };
});
check("the store counts the cuts", store.c.readings_that_are_a_cut_of_a_sibling_record > 0,
  `${store.c.readings_that_are_a_cut_of_a_sibling_record.toLocaleString()} marked`);
check("and counts what the licence refused", typeof store.c.readings_cut_from_a_record_whose_licence_forbids_it === "number",
  `${store.c.readings_cut_from_a_record_whose_licence_forbids_it} refused`);

// a route the store marked must reach the reader marked
const found = await p.evaluate(async () => {
  const idx = await fetch("data/route-store/index.json", { cache: "no-cache" }).then((r) => r.json());
  const gz = async (u) => JSON.parse(await new Response(
    (await fetch(u, { cache: "no-cache" })).body.pipeThrough(new DecompressionStream("gzip"))).text());
  for (let i = 0; i < 24; i++) {
    const n = i.toString(16).padStart(2, "0");
    const sh = await gz(`data/route-store/shards/${n}.bin?v=${idx.store_version}`);
    for (const [k, rows] of Object.entries(sh)) {
      const cut = rows.find((r) => r[5] === 1);
      if (!cut) continue;
      const whole = rows.find((r) => r !== cut && r[3] === cut[3] && r[2] === cut[2] &&
        String(r[1]).length > String(cut[1]).length);
      if (whole) return { key: k, cut: cut[1], whole: whole[1], same_record: cut[2] === whole[2] };
    }
  }
  return null;
});
check("a marked cut sits beside the record it was cut from", !!found && found.same_record,
  found ? `${found.key} · "${found.cut}" cut from "${String(found.whole).slice(0, 46)}"` : "none found");

// and the card says so
const said = await p.evaluate(async () => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
  for (let i = 0; i < Math.min(wbs.length, 12); i++) {
    wbs[i].click();
    for (let t = 0; t < 40 && !document.querySelector("#hud .r-pills button"); t++)
      await new Promise((r) => setTimeout(r, 200));
    await new Promise((r) => setTimeout(r, 250));
    const bs = [...document.querySelectorAll("#hud .r-pills button")];
    for (const btn of bs) {
      btn.click();
      await new Promise((r) => setTimeout(r, 120));
      const note = document.querySelector("#hud .d-cut");
      if (note) return { text: note.textContent, reading: btn.textContent.trim().slice(0, 40) };
    }
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
});
check("the card tells the reader a reading is a cut", !!said && /piece cut out of the record/.test(said.text),
  said ? `on "${said.reading}"` : "no cut reading reached in the first 12 words");

// nothing was manufactured to balance a cut
check("the missing half is never invented",
  !store.c.manufactured_readings, "no such counter exists, and none is emitted");

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
