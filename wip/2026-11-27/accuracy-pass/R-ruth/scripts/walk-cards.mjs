// Read-only walk: each chapter page of Ruth opened as a first visit; for every word of that chapter the line
// drawn under it and the card a press opens (its head, the reading said on top, the block pills, the readings
// row, every pill with its sources, grade, title and whether pressed, the notes above the pills, the record
// under them). One browser, one page at a time; writes one JSON line per word. Presses no pill, keeps nothing.
// Usage: node walk-cards.mjs <tree root> <out dir> <chapters e.g. 1,2,3,4> [every Nth word, default 1]
import { writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [ROOT, OUT, CHS = "1,2,3,4", NTH = "1"] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const zone = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones/ruth.bin"))).toString("utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const every = Number(NTH) || 1;
try {
  for (const ch of CHS.split(",")) {
    const outFile = join(OUT, `cards-ch${ch}.jsonl`);
    writeFileSync(outFile, "");
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [];
    const missing = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url().replace(tree.base, "")}`); });
    const t0 = Date.now();
    await page.goto(`${tree.base}/ruth/${ch}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const loadMs = Date.now() - t0;
    const scrollY = await page.evaluate(() => window.scrollY);
    let n = 0, count = 0;
    for (let si = 0; si < zone.sections.length; si += 1) {
      const sec = zone.sections[si];
      if (!sec.label.startsWith(`${ch}:`)) continue;
      for (let e = 0; e < sec.words.length; e += 1) {
        const w = sec.words[e];
        if (w.mark) continue;
        n += 1;
        if ((n - 1) % every) continue;
        const got = await page.evaluate(async ({ si, e }) => {
          const turn = (ms) => new Promise((r) => setTimeout(r, ms));
          const txt = (el) => (el ? el.textContent.replace(/\s+/gu, " ").trim() : null);
          const hud = document.getElementById("hud");
          const sec = document.querySelectorAll("section.seg")[si];
          if (!sec) return { fault: `no section ${si}` };
          const wbs = [...sec.querySelectorAll(".he-text .wb")];
          const wb = wbs[e];
          if (!wb) return { fault: `no entry ${e} of ${wbs.length}` };
          wb.scrollIntoView({ block: "center" }); await turn(60);
          const g = wb.querySelector(":scope > .g");
          const line = g ? g.textContent : null;
          const credit = g ? (g.dataset.by || g.title || "") : "";
          const lineShown = g ? (getComputedStyle(g).display !== "none" && g.getClientRects().length > 0) : false;
          const ink = txt(wb.querySelector(".w"));
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t0 = performance.now();
          const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          while (!settled() && performance.now() - t0 < 20000) await turn(40);
          await turn(220);
          const ms = Math.round(performance.now() - t0);
          const read = hud.querySelector(":scope > .rows > .b-read");
          const pillsBox = read ? read.querySelector(":scope > .r-pills") : null;
          const pills = pillsBox ? [...pillsBox.querySelectorAll(":scope > button")].map((x) => ({ t: txt(x), by: x.dataset.by || "", gr: x.dataset.grade || "", ti: x.title || "", on: x.getAttribute("aria-pressed") === "true" ? 1 : 0, cls: x.className || "", ptr: x.dataset.pointer || "" })) : [];
          const res = {
            ink, line, credit, lineShown, ms, settled: settled(),
            wbs: wbs.length,
            head: txt(hud.querySelector(":scope > .head .wn")),
            headHe: txt(hud.querySelector(":scope > .head b")),
            now: [...hud.querySelectorAll(":scope > .r-now")].map((p) => [txt(p.querySelector(".k")), txt(p.querySelector(".v"))]),
            bands: [...hud.querySelectorAll(":scope > .rows > .band")].filter((b) => !b.classList.contains("b-read")).map((b) => ({ cls: b.className, label: txt(b.querySelector(".r-label")), pills: [...b.querySelectorAll("button")].map((x) => [txt(x), x.getAttribute("aria-pressed") === "true" ? 1 : 0]), text: txt(b) })).filter((b) => b.text),
            label: read ? txt(read.querySelector(":scope > .r-label")) : null,
            kindsTitle: read && read.querySelector(".kinds-switch") ? read.querySelector(".kinds-switch").title : "",
            notes: read ? [...read.querySelectorAll(":scope > p")].filter((p) => !p.classList.contains("r-label")).map((p) => [p.className, txt(p)]) : [],
            pillsData: pillsBox ? { ...pillsBox.dataset } : null,
            pills,
            dcard: [...hud.querySelectorAll(".d-slot .d-card")].map((d) => ({ row: d.dataset.row || "", key: d.dataset.key || "", text: txt(d.querySelector(".d-text")), also: txt(d.querySelector(".d-also")), att: txt(d.querySelector(".att")) })),
            parts: txt(hud.querySelector(".parts-slot")),
            hoh: txt(hud.querySelector(".hoh-slot")),
            prov: hud.querySelector(":scope > .prov") && !hud.querySelector(":scope > .prov").hidden ? txt(hud.querySelector(":scope > .prov")) : "",
          };
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          await turn(40);
          return res;
        }, { si, e });
        appendFileSync(outFile, JSON.stringify({ verse: sec.label, si, e, word_no: n, s: w.s, k: w.k || "", tg: w.tg || "", ...got }) + "\n");
        count += 1;
      }
    }
    appendFileSync(join(OUT, "walk-log.txt"), `chapter ${ch}: load ${loadMs} ms, scrollY at open ${scrollY}, words ${n}, cards opened ${count}, page errors ${JSON.stringify(errors.slice(0, 5))}, failed requests ${JSON.stringify([...new Set(missing)].slice(0, 10))}, ${new Date().toISOString()}\n`);
    console.log(`chapter ${ch}: words ${n}, cards ${count}, load ${loadMs} ms, errors ${errors.length}, failed requests ${[...new Set(missing)].join(" | ")}`);
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
