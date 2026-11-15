// RUN: tree
// GUARDS: wordmark-rule-v2-the-name-is-the-mark-woven-of-the-dyes-and-the-metals-with-a-flame-and-a-hailstone-for-its-dots
//
// The woven name is drawn once, by tools/build-wordmark-v1.py, and shown on
// the door, on the census and in the home button of every built reader page.
// Before this check nothing opened the drawing: a wrong redraw, an orange
// thread or a missing file passed the whole suite. So this holds the drawing
// to what the owner chose (2026-11-15: "gold/bronze woven on and, and purple
// and silver woven on .com", "x steep tighter still looks cool") and to the
// page it stands on ("my main point is uniform coloring between logo and
// site", 2026-10-10): every thread's edge is the page's own value, read from
// zone.html, and its body one light of it.
//
//   W1 the drawing is the one the color record pins (sha256)
//   W2 it is woven of the threads and nothing else: no orange gold
//   W3 «and» crosses gold with bronze, «.com» and its dot purple with silver,
//      fire and the flame scarlet, hail and the hailstone blue, the flame's
//      heart gold, each edge the page's own value
//   W4 every page that shows the name names a drawing that exists
//
// Run: node tools/check-woven-name-v1.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const CC = JSON.parse(readFileSync(join(HERE, "..", "data", "color-contract-v1.json"), "utf8"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const pin = CC.the_woven_name && CC.the_woven_name.drawing;
if (!pin || !pin.file || !pin.sha256) { console.log("FAIL  the color record pins no drawing of the woven name (the_woven_name.drawing)"); process.exit(1); }
const FILE = join(ROOT, pin.file);
if (!existsSync(FILE)) { console.log(`FAIL  the drawing the record pins is not here: ${pin.file}`); process.exit(1); }
const svg = readFileSync(FILE, "utf8");
const sha = createHash("sha256").update(readFileSync(FILE)).digest("hex");
check("W1 the drawing is the one the color record pins", sha === pin.sha256, `${pin.file} · sha256 ${sha.slice(0, 16)}… · the record pins ${pin.sha256.slice(0, 16)}…`);

// the page's values, read from the reader's :root
const zone = readFileSync(join(HERE, "..", "zone.html"), "utf8");
const root = zone.slice(zone.indexOf(":root {"), zone.indexOf("}", zone.indexOf(":root {")));
const tok = (n) => { const m = root.match(new RegExp(`--${n}:\\s*(#[0-9a-f]{6})`, "iu")); return m ? m[1].toLowerCase() : null; };
// each thread: its edge (the page's value) and its body (one light of it, the name's own)
const THREADS = {
  shani: [tok("shani"), tok("shani-dim")], tekhelet: [tok("tekhelet"), tok("tekhelet-dim")], argaman: [tok("argaman"), tok("argaman-dim")],
  gold: [tok("gold"), "#d3af37"], bronze: [tok("bronze-dim"), "#9a7656"], silver: [tok("silver-dim"), "#b4b8bd"],
};
const missing = Object.entries(THREADS).filter(([, v]) => !v[0]).map(([k]) => k);
if (missing.length) { console.log(`FAIL  zone.html declares no value for: ${missing.join(", ")}`); process.exit(1); }
const ALLOWED = new Set(Object.values(THREADS).flat());
const used = new Set((svg.match(/#[0-9a-f]{6}\b/giu) || []).map((h) => h.toLowerCase()));
const stray = [...used].filter((h) => !ALLOWED.has(h));
const orange = ["#93661a", "#a06c10"].filter((h) => used.has(h));
check("W2 the drawing is woven of the threads and nothing else, and no orange gold", stray.length === 0 && orange.length === 0,
  `${used.size} colors, all threads' edges and lights${stray.length ? ` · stray: ${stray.join(", ")}` : ""}${orange.length ? ` · orange: ${orange.join(", ")}` : ""}`);

// W3: each pattern's two threads (warp and weft gradients) by its stops
const stops = (id) => { const m = svg.match(new RegExp(`<linearGradient id="${id}"[^>]*>(.*?)</linearGradient>`, "su")); return m ? new Set((m[1].match(/#[0-9a-f]{6}/giu) || []).map((h) => h.toLowerCase())) : null; };
const of = (s, thread) => s && s.size > 0 && [...s].every((h) => THREADS[thread].includes(h));
const fills = (id) => (svg.match(new RegExp(`<path [^>]*fill="url\\(#${id}\\)"`, "gu")) || []).length;
const WORDS = [
  ["«and» (the a, the n, the d)", "pwA", "gold", "bronze", 3],
  ["«.com» and its dot", "pwU", "argaman", "silver", 2],
  ["fire and the flame", "pwS", "shani", "shani", 2],
  ["hail and the hailstone", "pwB", "tekhelet", "tekhelet", 2],
  ["the flame's heart", "pwG", "gold", "gold", 1],
];
const wrong = [];
for (const [say, id, warp, weft, n] of WORDS) {
  if (!of(stops(`${id}w`), warp) || !of(stops(`${id}f`), weft)) wrong.push(`${say}: not ${warp} crossed with ${weft}`);
  if (fills(id) !== n) wrong.push(`${say}: ${fills(id)} shapes wear it, not ${n}`);
}
check("W3 «and» crosses gold with bronze, «.com» and its dot purple with silver, fire scarlet, hail blue, the flame's heart gold, each edge the page's own",
  wrong.length === 0, wrong.join(" · ") || WORDS.map(([say, , warp, weft]) => `${say} ${warp}×${weft}`).join(" · "));

// W4: the door, the census, and every built reader page's home button
const want = `/${pin.file}`;
const pages = [];
for (const top of readdirSync(ROOT, { withFileTypes: true })) {
  if (!top.isDirectory() || top.name.startsWith(".") || top.name === "reader" || top.name === "wip") continue;
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && depth < 2) walk(join(dir, e.name), depth + 1);
      else if (e.name === "index.html") pages.push(join(dir, e.name));
    }
  };
  walk(join(ROOT, top.name), 0);
}
const metas = pages.filter((f) => readFileSync(f, "utf8").includes('name="site-mark"'));
const off = metas.filter((f) => !readFileSync(f, "utf8").includes(`name="site-mark" content="${want}"`));
const door = readFileSync(join(ROOT, "index.html"), "utf8").includes(`src="${want}"`);
const census = existsSync(join(ROOT, "census", "index.html")) && readFileSync(join(ROOT, "census", "index.html"), "utf8").includes(want);
check("W4 every page that shows the name names the drawing, and it exists", door && census && metas.length > 0 && off.length === 0,
  `the door ${door ? "names it" : "does not"} · the census ${census ? "names it" : "does not"} · ${metas.length} reader pages' home buttons, ${off.length} naming another${off.length ? `: ${off.slice(0, 3).join(", ")}` : ""}`);

console.log();
process.exit(bad ? 1 : 0);
