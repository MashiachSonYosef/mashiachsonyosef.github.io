// The commentary index on a plain page and on a page that asks for commentary: press a hit, see what opens.
// node probe-cindex.mjs <reader dir> <zone url base> <book>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, book] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
for (const q of ["", "&commentary=on"]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(`${base}?b=${book}${q}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const r = await p.evaluate(async () => {
    const box = document.getElementById("cIndex"); if (!box) return { box: false };
    box.querySelector(".ci-head").click(); await new Promise((x) => setTimeout(x, 400));
    const hits = [...box.querySelectorAll(".ci-hit")];
    const y0 = window.scrollY; const hit = hits[3] || hits[0];
    const text = hit ? hit.textContent.replace(/\s+/g, " ").trim().slice(0, 90) : null;
    if (hit) hit.click(); await new Promise((x) => setTimeout(x, 1500));
    return { box: true, hits: hits.length, pressed: text, scrolled: Math.round(window.scrollY - y0), inline: document.querySelectorAll(".c-inline").length, bars: document.querySelectorAll(".c-bar").length, slotsFilled: [...document.querySelectorAll(".c-slot")].filter((s) => s.childElementCount).length };
  });
  console.log(`${book}${q || " (plain)"}:`, JSON.stringify(r), errors.length ? `errors: ${errors.join(" | ")}` : "");
  await p.close();
}
await b.close();
