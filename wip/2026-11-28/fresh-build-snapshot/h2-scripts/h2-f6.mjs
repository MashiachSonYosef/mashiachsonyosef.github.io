// Scratch (builder H2): the 141 words whose resting line the place answers do not give, each opened on the live
// reader at rest: whether the card presses the line's reading first (where it is among the pills), opens on the
// place's own reading (no resting line), or presses nothing and says so in one sentence (where it is not). Read only.
// node h2-f6.mjs <site root> <resting-among-pills.tsv> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [SITE, TABLE, OUT] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const rows = readFileSync(TABLE, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
const rep = { words: rows.length, among: { words: 0, pressed_first: 0, other: [] }, no_line: { words: 0, opened_on_a_pill: 0, other: [] }, not_among: { words: 0, nothing_pressed_and_said: 0, other: [] }, sentences: [], errors: [] };
const key = (t) => String(t || "").replace(/[​¿]/gu, "").split(/\s*\+\s*|\//u).map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
try {
  let page = null, open = null;
  for (const [book, verse, entry, today, among] of rows) {
    if (open !== book) {
      if (page) await page.context().close();
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      page = await ctx.newPage(); page.on("pageerror", (e) => rep.errors.push(e.message));
      await page.goto(`${tree.base}/reader/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await page.waitForSelector("section.seg", { timeout: 60000 });
      await page.waitForFunction(() => window.__placeCard && typeof window.__materialise === "function", null, { timeout: 60000 });
      await page.waitForTimeout(800); open = book;
    }
    const got = await page.evaluate(async ([verse, entry]) => {
      const z = window.__zone, si = z.sections.findIndex((s) => s.label === verse);
      if (si < 0) return { err: "no verse" };
      const all = [...document.querySelectorAll("section.seg")]; const i = all.findIndex((s) => s.__sec && s.__sec.label === verse);
      window.__materialise(Math.max(0, i - 1), i + 2); await new Promise((r) => setTimeout(r, 300));
      const el = document.getElementById(`s${si}`); const word = z.sections[si].words[Number(entry)];
      const wb = el ? [...el.querySelectorAll(".he-text .wb")].find((x) => x.__word === word) : null;
      if (!wb) return { err: "no word" };
      const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") && wb.closest(".wjoin").querySelector(":scope > .g"));
      const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
      const line = c ? c.textContent.trim() : null;
      wb.scrollIntoView({ block: "center" });
      (wb.querySelector(".w .wr.backs-en") || wb.querySelector(".w span") || wb.querySelector(".w")).click();
      const t0 = Date.now();
      while (Date.now() - t0 < 12000) { const b = document.querySelector("#hud .b-read"); if (b && !b.querySelector(".r-wait") && (b.querySelector(".r-pills button") || b.querySelector("p:not(.r-label)"))) break; await new Promise((r) => setTimeout(r, 60)); }
      await new Promise((r) => setTimeout(r, 500));
      const pills = [...document.querySelectorAll("#hud .b-read .r-pills button")];
      const out = { line, first: pills[0] ? pills[0].textContent : null, pressed: (pills.find((x) => x.getAttribute("aria-pressed") === "true") || {}).textContent || null, n: pills.length,
        say: (document.querySelector("#hud .line-unoffered") || {}).textContent || ([...document.querySelectorAll("#hud .b-read > p:not(.r-label)")].map((x) => x.textContent).find((x) => /^No source|The line here/u.test(x) && /The line here/u.test(x)) || null), cell: (document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') || {}).textContent || null };
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 150));
      return out;
    }, [verse, entry]);
    const at = `${book} ${verse} entry ${entry}`;
    if (got.err) { rep.errors.push(`${at}: ${got.err}`); continue; }
    const noLine = !today || !String(today).trim() || today === "(no line)";
    if (noLine) { rep.no_line.words += 1; if (got.pressed) rep.no_line.opened_on_a_pill += 1; else if (!got.n) { rep.no_line.no_pill_at_all = (rep.no_line.no_pill_at_all || 0) + 1; rep.no_line.other.push(`${at}: ${JSON.stringify(got)}`); } else rep.no_line.other.push(`${at}: ${JSON.stringify(got)}`); }
    else if (among === "yes") { rep.among.words += 1; if (got.pressed && got.pressed === got.first) rep.among.pressed_first += 1; else rep.among.other.push(`${at}: «${today}» ${JSON.stringify(got)}`); }
    else { rep.not_among.words += 1; if (got.pressed && got.pressed === got.first) rep.not_among.offered_after_all_pressed_first = (rep.not_among.offered_after_all_pressed_first || 0) + 1; if (!got.pressed && got.say) { rep.not_among.nothing_pressed_and_said += 1; if (rep.sentences.length < 80) rep.sentences.push(`${at}: ${got.say}`); } else rep.not_among.other.push(`${at}: «${today}» ${JSON.stringify(got)}`); }
  }
  if (page) await page.context().close();
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(rep, null, 1));
console.log(JSON.stringify({ words: rep.words, among: { ...rep.among, other: rep.among.other.length }, no_line: { ...rep.no_line, other: rep.no_line.other.length }, not_among: { ...rep.not_among, other: rep.not_among.other.length }, errors: rep.errors.length }));
