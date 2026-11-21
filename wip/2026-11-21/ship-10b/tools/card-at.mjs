// Ship 10b: open the card of a word by its place (verse:word, marks not counted) with a default source set first,
// and print what the card says: its label, each source's line on it, the line under the word, the pill pressed.
// node card-at.mjs <reader dir> <base url of zone.html> <book> <source> <place> [place ...]
import { join } from "node:path";
const [reader, base, book, source, ...places] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(join(reader, "tools/playwright-v1.mjs"));
const { linesOnPage } = await import(join(reader, "tools/resting-lines-v1.mjs"));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.addInitScript((src) => { try { localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); if (src !== "step") localStorage.setItem("fh.defaults", src); } catch { /* none */ } }, source);
let errors = 0;
p.on("pageerror", (e) => { errors += 1; console.log("PAGE ERROR:", e.message); });
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await linesOnPage(p, {});
for (const pl of places) {
  const cut = pl.lastIndexOf(":"), label = pl.slice(0, cut), k = Number(pl.slice(cut + 1));
  const ok = await p.evaluate(([label, k]) => {
    const s = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "") === label);
    if (!s) return false;
    const w = [...s.querySelectorAll(".he-text .wb")].filter((x) => !x.classList.contains("mark"))[k - 1];
    if (!w) return false;
    w.scrollIntoView({ block: "center" });
    (w.querySelector(".w") || w).click();
    return true;
  }, [label, k]);
  await p.waitForTimeout(700);
  const got = await p.evaluate(() => {
    const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
    const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
    const wb = document.querySelector("section.seg .he-text .wb.active");
    const cell = wb ? wb.closest(".wjoin") || wb : null;
    const g = cell ? cell.querySelector(":scope > .g") : null;
    return { label: t(h.querySelector(".r-now .k")), now: t(h.querySelector(".r-now")), dflt: [...h.querySelectorAll(".r-dflt")].map(t), piece: [...h.querySelectorAll(".r-piece")].map(t), line: t(g), pressed: t(h.querySelector(".r-pills button.on, .r-pills button[aria-pressed='true']")), pills: h.querySelectorAll(".r-pills button").length };
  });
  console.log(`${book} ${pl} under ${source}: ${ok ? "" : "(word not found) "}${JSON.stringify(got, null, 1)}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
}
console.log("page errors", errors);
await b.close();
