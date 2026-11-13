// A word's card under the entry gate: the entry the place stands under, what each gate withheld, the line that
// says so, the line under the word, and the first pills with the source each is credited to.
// node entry-gate-card.mjs <reader dir> <zone url base> <book> <section label>:<word number> [more places ...] [--pills N]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
let PILLS = 12;
const at = argv.indexOf("--pills"); if (at >= 0) { PILLS = Number(argv[at + 1]); argv.splice(at, 2); }
const wh = argv.indexOf("--whole"); const WHOLE = wh >= 0; if (WHOLE) argv.splice(wh, 1);
const [reader, base, book, ...places] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
const faults = [];
p.on("pageerror", (e) => faults.push(String(e && e.stack || e).slice(0, 600)));
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => window.__materialise());
await p.waitForTimeout(1500);
for (const place of places) {
  const cut = place.lastIndexOf(":");
  const label = place.slice(0, cut), n = Number(place.slice(cut + 1));
  const got = await p.evaluate(async ({ label, n, PILLS, WHOLE }) => {
    const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && String(s.__sec.label) === label);
    if (!sec) return { fault: "no such section" };
    const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
    if (!wb) return { fault: "no such word" };
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    const hud = document.getElementById("hud");
    for (let i = 0; i < 400; i += 1) { const read = hud.querySelector(":scope > .rows > .b-read"); if (read && read.children.length && !read.querySelector(".r-wait")) break; await new Promise((r) => setTimeout(r, 25)); }
    await new Promise((r) => setTimeout(r, 150));
    // with --whole: the whole-form division of a word its place divides, the one button of the divisions' row that joins nothing
    const cuts = [...hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")].map((x) => x.textContent);
    if (WHOLE) {
      const whole = [...hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")].find((x) => !x.textContent.includes("+"));
      if (!whole) return { fault: `the card offers no whole-form division (its divisions: ${cuts.join(" | ") || "none"})` };
      whole.click();
      await new Promise((r) => setTimeout(r, 700));
    }
    const pillsEl = hud.querySelector(":scope > .rows > .b-read > .r-pills");
    const pills = pillsEl ? [...pillsEl.querySelectorAll(":scope > button")] : [];
    const line = hud.querySelector(".withheld-line");
    const under = wb.querySelector(".g, .gl, .gloss, .en") || null;
    const w = wb.__word || {};
    const out = {
      s: w.s, k: w.k, tg: w.tg || null, pairTags: (w.w || []).map((x) => x.tg || null),
      cardEntry: window.__cardEntry, cardName: window.__cardName, np: w.np || 0,
      data: pillsEl ? { ...pillsEl.dataset } : null,
      line: line ? line.textContent : "",
      cuts, none: (hud.querySelector(":scope > .rows > .b-read > p.sources-withheld") || {}).textContent || "",
      under: under ? under.textContent : wb.textContent.replace(/\s+/gu, " ").trim().slice(0, 80),
      pills: pills.slice(0, PILLS).map((x, i) => ({ text: x.textContent.slice(0, 70), by: (window.__poolLead || [])[i] })),
      count: pills.length,
    };
    const close = hud.querySelector(".close, .x, [data-close]"); if (close) close.click(); else document.body.click();
    await new Promise((r) => setTimeout(r, 80));
    return out;
  }, { label, n, PILLS, WHOLE });
  if (got.fault) { console.log(`${book} ${place}: ${got.fault}`); continue; }
  if (got.cuts.length) console.log(`   divisions offered: ${got.cuts.join(" | ")}${WHOLE ? " (the whole form pressed)" : ""}`);
  if (got.none) console.log(`   no record: ${JSON.stringify(got.none)}`);
  const d = got.data || {};
  console.log(`${book} ${place} · ${got.s} · key ${got.k} · tags on the word ${JSON.stringify(got.tg)}${got.pairTags.some(Boolean) ? ` · on its halves ${JSON.stringify(got.pairTags)}` : ""}`);
  console.log(`   the card's entry ${JSON.stringify(got.cardEntry)} · its place is ${JSON.stringify(got.cardName)} (np ${got.np}) · data-entry ${JSON.stringify(d.entry)} · rows ${d.rows} · withheld: entry ${d.entryWithheld}, name ${d.nameWithheld}, pointing ${d.withheld}, stem ${d.stemWithheld}, sources ${d.withheldBySources}`);
  console.log(`   line: ${JSON.stringify(got.line)}`);
  console.log(`   under the word: ${JSON.stringify(got.under)}`);
  console.log(`   ${got.count} pills: ${got.pills.map((x) => `${JSON.stringify(x.text)} (${x.by})`).join(" · ")}`);
}
await b.close();
for (const f of faults) console.log(`UNCAUGHT: ${f}`);
