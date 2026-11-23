// read-only (23 November 2026): the first card of every chapter of the books the lattice tags, as a first visit finds
// it (nothing kept on the device, the page's own defaults), read off the page of one reader tree, which is served here
// on a port the machine gives (tools/serve-tree-v1.mjs) and stopped after. For each chapter: its first word (the first
// word that is no mark in the section of its first verse), the line under it, and its card: each pill with the
// sources behind it, which is pressed, and what each gate says it held back. Writes <out>.json.
// Usage: node first-cards-19.mjs <reader dir> <out.json> [book,...]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, OUT, ONLY] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const { linesOnPage } = await import(join(R, "tools", "resting-lines-v1.mjs"));
const { cardInPage } = await import(join(R, "tools", "gated-card-v1.mjs"));
const { zonesServed } = await import(join(R, "tools", "zones-on-disk-v1.mjs"));
const Z = join(R, "data", "zones");
const books = ONLY ? ONLY.split(",") : zonesServed(Z).filter((z) => existsSync(join(Z, `${z}.lattice.bin`)));
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const tree = await serveTree(R);
const out = {};
try {
  for (const z of books) {
    const zone = gz(join(Z, `${z}.bin`));
    const firsts = [];   // [section index, entry, chapter, label]
    let ch = null;
    (zone.sections || []).forEach((sec, si) => {
      const c = String(sec.label).split(":")[0];
      if (c === ch) return;
      ch = c;
      const e = (sec.words || []).findIndex((w) => !w.mark);
      if (e >= 0) firsts.push([si, e, c, sec.label]);
    });
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.goto(`${tree.base}/zone.html?b=${z}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    const lines = await linesOnPage(p);
    out[z] = [];
    for (const [si, e, c, label] of firsts) {
      const sec = lines.sections[si] || {};
      const unit = (sec.units || []).find((u) => u[0] <= e && e < u[0] + Math.max(1, u[1])) || null;
      const got = await p.evaluate(cardInPage, { section: si, entry: e });
      // which pill the card pressed, read once more with the card open again (cardInPage closes it)
      const pressed = await p.evaluate(async ({ section, entry }) => {
        const wb = document.querySelectorAll("section.seg")[section].querySelectorAll(".he-text .wb")[entry];
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const hud = document.getElementById("hud");
        const ready = () => { const r = hud.querySelector(":scope > .rows > .b-read"); return !!(r && r.children.length && !r.querySelector(":scope > .r-wait")); };
        while (!ready() && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 20));
        const b = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")].find((x) => x.getAttribute("aria-pressed") === "true");
        const said = b ? b.textContent : null;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        return said;
      }, { section: si, entry: e });
      out[z].push({ chapter: c, label, section: si, entry: e, s: zone.sections[si].words[e].s, line: unit ? [unit[2], unit[3]] : null,
        pills: (got.said || []).map((x) => [x[0], x[1]]), pressed, data: got.data || null, withheld_line: got.line || "", fault: got.fault || null, joined: !!got.joined });
    }
    if (errors.length) out[z].push({ page_errors: errors.slice(0, 3) });
    await ctx.close();
    process.stdout.write(`${z} ${firsts.length} · `);
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`\nwritten ${OUT}`);
