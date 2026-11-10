// Whether two builds lay the same page out the same: the box of every word, run, ink row and English line of the first
// sections, each card number's seat, and each blob's drawn outline, in both readers with the card numbers off and on.
// node geometry-same.mjs <reader dir> <url base A> <url base B> <book> [--sections N]
// Prints, per reader and numbers setting, how many boxes were compared and where the first differences stand.
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const SECTIONS = Number(flag("--sections", "40"));
const [reader, baseA, baseB, book] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const read = async (base, en, nums) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(`${base}?b=${book}${en ? "&mode=en" : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate((on) => { const pill = document.getElementById("numsPill"); if (pill && (pill.getAttribute("aria-pressed") === "true") !== on) pill.click(); }, nums);
  // bring the first sections into being, one at a time, and let each be laid
  for (let i = 0; i < SECTIONS; i += 1) {
    const there = await p.evaluate(async (i) => { const s = document.getElementById(`s${i}`); if (!s) return false; s.scrollIntoView({ block: "center" }); for (let g = 0; g < 200 && !s.querySelector(".he-text .wb"); g += 1) await new Promise((r) => setTimeout(r, 20)); return true; }, i);
    if (!there) break;
    await p.waitForTimeout(60);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  const snap = () => p.evaluate((N) => {
    const f = (n) => Math.round(n * 100) / 100;
    const out = [];
    const sy = window.scrollY, sx = window.scrollX;
    const box = (el) => { const q = el.getBoundingClientRect(); return [f(q.left + sx), f(q.top + sy), f(q.width), f(q.height)].join(","); };
    for (let i = 0; i < N; i += 1) {
      const s = document.getElementById(`s${i}`); if (!s) break;
      let n = 0;
      for (const el of s.querySelectorAll(".he-text .wb, .he-text .wjoin, .he-text .wj-ink, .he-text .w, .he-text .g")) {
        n += 1;
        const kind = el.classList.contains("wjoin") ? "run" : el.classList.contains("wj-ink") ? "ink" : el.classList.contains("wb") ? "wb" : el.classList.contains("w") ? "w" : "g";
        let extra = "";
        if (kind === "wb") { const cs = getComputedStyle(el, "::after"); extra = `|cn ${el.style.getPropertyValue("--cn-x") || "-"}${el.classList.contains("cn-out") ? " out" : ""}|${cs.content === "none" ? "" : `${cs.left} ${cs.top} ${cs.bottom}`}`; }
        out.push(`s${i}.${n} ${kind} ${box(el)}${extra}`);
      }
      let t = 0;
      for (const path of s.querySelectorAll(".he-text svg.wj-tie > path")) { t += 1; out.push(`s${i}.tie${t} ${path.getAttribute("class") || ""} ${path.getAttribute("d")}${path.getAttribute("mask") ? " masked" : ""}`); }
      let m = 0;
      for (const mask of s.querySelectorAll(".he-text svg.wj-tie > mask.cn-mask")) { m += 1; out.push(`s${i}.mask${m} ${mask.innerHTML}`); }
    }
    return out;
  }, SECTIONS);
  // wait until the layout stands still (blobs and numbers are laid in slices)
  let a = await snap();
  for (let tries = 0; tries < 40; tries += 1) { await p.waitForTimeout(350); const c = await snap(); if (c.length === a.length && c.every((x, i) => x === a[i])) break; a = c; }
  await ctx.close();
  return { rows: a, errors };
};
let allSame = true;
for (const en of [false, true]) for (const nums of [false, true]) {
  const A = await read(baseA, en, nums), B = await read(baseB, en, nums);
  const diffs = [];
  const n = Math.max(A.rows.length, B.rows.length);
  for (let i = 0; i < n; i += 1) if (A.rows[i] !== B.rows[i]) diffs.push([A.rows[i], B.rows[i]]);
  if (diffs.length) allSame = false;
  const kinds = {}; for (const r of A.rows) { const k = r.split(" ")[1] || "tie"; kinds[k] = (kinds[k] || 0) + 1; }
  console.log(`${book} · ${en ? "the English reader" : "the Hebrew reader"} · card numbers ${nums ? "on" : "off"} · ${A.rows.length} and ${B.rows.length} boxes and outlines read (${Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(", ").slice(0, 160)}) · ${diffs.length ? `${diffs.length} DIFFER` : "every one the same"}${A.errors.length || B.errors.length ? ` · PAGE ERRORS ${[...A.errors, ...B.errors].slice(0, 2).join(" | ")}` : ""}`);
  for (const [x, y] of diffs.slice(0, 4)) console.log(`     A ${String(x).slice(0, 170)}\n     B ${String(y).slice(0, 170)}`);
}
await b.close();
console.log(allSame ? "the two builds lay these sections out the same" : "the two builds differ");
