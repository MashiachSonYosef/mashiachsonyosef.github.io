// A picture of a page's first sections, as a reader's phone draws them.
// node shot-sections.mjs <reader dir> <zone url base> <book> <out.png> [--en] [--nums] [--from N] [--count N] [--scale 2]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const has = (f) => { const i = argv.indexOf(f); if (i < 0) return false; argv.splice(i, 1); return true; };
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const EN = has("--en"), NUMS = has("--nums"), FROM = Number(flag("--from", "0")), COUNT = Number(flag("--count", "3")), SCALE = Number(flag("--scale", "2"));
const [reader, base, book, out] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: SCALE });
const p = await ctx.newPage();
await p.goto(`${base}?b=${book}${EN ? "&mode=en" : ""}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate((on) => { const pill = document.getElementById("numsPill"); if (pill && (pill.getAttribute("aria-pressed") === "true") !== on) pill.click(); }, NUMS);
for (let i = FROM; i < FROM + COUNT; i += 1) await p.evaluate(async (i) => { const s = document.getElementById(`s${i}`); if (!s) return; s.scrollIntoView({ block: "center" }); for (let g = 0; g < 200 && !s.querySelector(".he-text .wb"); g += 1) await new Promise((r) => setTimeout(r, 20)); }, i);
await p.waitForTimeout(1500);
const clip = await p.evaluate(({ FROM, COUNT }) => {
  const a = document.getElementById(`s${FROM}`), z = document.getElementById(`s${FROM + COUNT - 1}`) || a;
  a.scrollIntoView({ block: "start" });
  const qa = a.getBoundingClientRect(), qz = z.getBoundingClientRect();
  return { x: 0, y: qa.top + window.scrollY, width: document.documentElement.clientWidth, height: qz.bottom - qa.top };
}, { FROM, COUNT });
await p.waitForTimeout(700);
await p.screenshot({ path: out, clip, fullPage: true });
await b.close();
console.log(`${out} · ${Math.round(clip.width)} x ${Math.round(clip.height)} css px at ${SCALE}x`);
