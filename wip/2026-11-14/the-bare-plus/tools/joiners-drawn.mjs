// The joiners as the page draws them, under its own signs switch: in every maqaf run laid in cells (.g.parts) and
// every line laid in its pieces (.g-pcs), each separator is shown exactly where a joiner stands between two pieces
// that print, and hidden beside a gap; and every gap keeps its slot. It measures; it changes nothing.
// node joiners-drawn.mjs <reader dir> <reader base url> <work> [...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, ...works] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
for (const w of works) {
  const t0 = Date.now();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/zone.html?b=${w}`, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.evaluate(() => window.__materialise());
  await p.waitForTimeout(1500);
  const got = await p.evaluate(() => {
    const GAP = String.fromCharCode(0x200b);
    const shown = (el) => getComputedStyle(el).display !== "none";
    const r = { signs: window.__signs || null, runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, seps: 0, faults: [], gapsHidden: 0 };
    const judge = (kids, isPiece, isSep, isGapEl, want, where) => {
      const pieces = kids.filter(isPiece);
      const gap = pieces.map(isGapEl);
      let i = 0;
      kids.forEach((k) => {
        if (isPiece(k)) { if (gap[i] && !shown(k)) r.gapsHidden += 1; i += 1; return; }
        if (!isSep(k)) return;
        r.seps += 1;
        const joiner = !gap[i] && gap.slice(0, i).some((g) => !g);
        const drawn = shown(k) && (k.textContent || "") === want;
        const hidden = !shown(k) || (k.textContent || "") === "";
        if (joiner ? !drawn : !hidden) if (r.faults.length < 6) r.faults.push(`${where()}: separator before piece ${i} ${joiner ? "should stand and does not" : "stands beside a gap"} «${pieces.map((x, j) => (gap[j] ? "[gap]" : x.textContent)).join("|")}»`);
      });
      return gap.some(Boolean);
    };
    const at = (g) => () => { const s = g.closest("section.seg"); return (s && s.querySelector(".vnum") || {}).textContent || "?"; };
    for (const g of document.querySelectorAll(".he-text .g.parts")) {
      r.runs += 1;
      if (judge([...g.children], (k) => k.classList.contains("g-part"), (k) => k.classList.contains("g-sep"), (k) => k.classList.contains("gap") || (k.textContent || "").trim() === GAP, "+", at(g))) r.runsWithGap += 1;
    }
    for (const row of document.querySelectorAll(".he-text .g > .g-pcs")) {
      r.laid += 1;
      if (judge([...row.children], (k) => k.classList.contains("g-pc"), (k) => k.classList.contains("g-pp"), (k) => k.classList.contains("gap") || (k.textContent || "").trim() === GAP, " + ", at(row))) r.laidWithGap += 1;
    }
    return r;
  });
  console.log(`${w}: signs ${got.signs} · ${got.runs} runs, ${got.runsWithGap} with a gap · ${got.laid} laid lines, ${got.laidWithGap} with a gap · ${got.seps} separators judged · ${got.faults.length} faults · ${got.gapsHidden} gaps not drawn · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  for (const f of got.faults) console.log("   ", f.split(String.fromCharCode(0x200b)).join("[gap]"));
  await ctx.close();
}
await browser.close();
