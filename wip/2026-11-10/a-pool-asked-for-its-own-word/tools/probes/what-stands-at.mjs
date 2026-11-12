// What stands on a page between two scroll heights: the verses, and every kind of element inside them counted by its
// classes, so that an unusual one (a written-and-read pair, a letter the scribes wrote large, a run that wraps, a
// frame) can be seen where a page stalls.
// node what-stands-at.mjs <reader dir> <zone url with its query> <from px> <to px>
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, fromArg, toArg] = process.argv.slice(2);
const FROM = Number(fromArg), TO = Number(toArg);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
for (let y = 0; y <= TO + 1500; y += 750) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
await p.waitForTimeout(600);
const r = await p.evaluate(({ FROM, TO }) => {
  const out = { doc: document.documentElement.scrollHeight, secs: [], kinds: {}, wide: [] };
  for (const s of document.querySelectorAll("section.seg")) {
    const q = s.getBoundingClientRect(), top = q.top + window.scrollY, bottom = q.bottom + window.scrollY;
    if (bottom < FROM || top > TO) continue;
    out.secs.push({ id: s.id, label: (s.querySelector(".vnum") || {}).textContent || "", top: Math.round(top), h: Math.round(q.height), built: !!s.querySelector(".he-text .wb"), words: s.querySelectorAll(".he-text .wb").length });
    for (const el of s.querySelectorAll(".he-text *")) {
      const k = `${el.tagName.toLowerCase()}${[...el.classList].sort().map((c) => `.${c}`).join("")}`;
      out.kinds[k] = (out.kinds[k] || 0) + 1;
    }
    for (const j of s.querySelectorAll(".he-text .wjoin")) { const w = j.getBoundingClientRect(); const lines = new Set([...j.querySelectorAll(".wj-ink .wb")].map((x) => Math.round(x.getBoundingClientRect().top))).size; if (lines > 1 || w.width > 380) out.wide.push(`${(s.querySelector(".vnum") || {}).textContent} a run ${Math.round(w.width)}px wide on ${lines} line${lines === 1 ? "" : "s"}, ${j.querySelectorAll(".wb").length} words`); }
  }
  return out;
}, { FROM, TO });
console.log(`${url.split("/").pop()} · the page is ${r.doc}px tall · between ${FROM}px and ${TO}px stand ${r.secs.length} verses: ${r.secs.map((s) => `${s.label}@${s.top}${s.built ? "" : " (not built)"}`).join(" · ")}`);
console.log(`  elements by kind, fewest first: ${Object.entries(r.kinds).sort((a, c) => a[1] - c[1]).map(([k, n]) => `${k} ${n}`).join(" · ")}`);
console.log(`  runs that wrap or are wide: ${r.wide.join(" · ") || "none"}`);
await b.close();
