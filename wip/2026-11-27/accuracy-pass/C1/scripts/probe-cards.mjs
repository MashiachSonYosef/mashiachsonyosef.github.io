// Read-only probe: for each place (book, section index si, entry index e), the page as a first visit opens it,
// the line under the word, and the card a press on the word opens: its pills (text, who carries each, its title),
// what the card says STEP and MACULA read here, what it withholds, and, where a pill's text is named (press),
// the record and credit the card shows when that pill is pressed. Serves the frozen reader on a port the machine gives.
// Usage: node probe-cards.mjs <reader dir> <places.json> <out.json> [rest|open]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [R, PLACES, OUT, STATE = "rest"] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
const out = [];
const byBook = new Map();
for (const p of places) (byBook.get(p.book) || byBook.set(p.book, []).get(p.book)).push(p);
try {
  for (const [book, ps] of byBook) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${tree.base}/zone.html?b=${book}${STATE === "open" ? "&kinds=open" : ""}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
    await page.waitForTimeout(1000);
    for (const p of ps) {
      let got;
      try {
        got = await page.evaluate(async ({ si, e, press, block }) => {
          const turn = (ms) => new Promise((r) => setTimeout(r, ms));
          const hud = document.getElementById("hud");
          const sec = document.querySelectorAll("section.seg")[si];
          if (!sec) return { fault: `no section ${si}` };
          sec.scrollIntoView(); await turn(300);
          const wbs = [...sec.querySelectorAll(".he-text .wb")];
          const wb = wbs[e];
          if (!wb) return { fault: `no entry ${e} of ${wbs.length}` };
          const g = wb.querySelector(":scope > .g");
          const lic = g ? g.querySelector(".g-lic") : null;
          const line = g ? [...g.childNodes].filter((n) => !(n.classList && n.classList.contains("g-lic"))).map((n) => n.textContent).join("") : null;
          const credit = lic ? (lic.dataset.line || "") + " | " + (lic.title || "") + " | " + lic.textContent : "";
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          let t0 = performance.now();
          while (!settled() && performance.now() - t0 < 20000) await turn(50);
          await turn(350);
          const txt = (x) => (x ? x.textContent.replace(/\s+/gu, " ").trim() : "");
          if (block !== undefined && block !== null) {
            const bs = [...hud.querySelectorAll(".b-cell .s-pills button")];
            const b = bs.find((x) => x.textContent.trim() === block);
            if (b) { b.click(); t0 = performance.now(); await turn(200); while (!settled() && performance.now() - t0 < 20000) await turn(50); await turn(300); }
          }
          const read = hud.querySelector(":scope > .rows > .b-read");
          const pillEls = read ? [...read.querySelectorAll(":scope > .r-pills > button")] : [];
          const pills = pillEls.map((x) => [txt(x), x.dataset.by || "", x.title || "", x.getAttribute("aria-pressed") === "true" ? 1 : 0]);
          const rp = read ? read.querySelector(":scope > .r-pills") : null;
          const res = {
            word: txt(hud.querySelector(":scope > .head b")), head: txt(hud.querySelector(":scope > .head .wn")),
            line, credit, now: txt(hud.querySelector(".r-now")),
            cuts: [...hud.querySelectorAll(".b-cut .s-pills button")].map((x) => txt(x) + (x.getAttribute("aria-pressed") === "true" ? "*" : "")),
            blocks: [...hud.querySelectorAll(".b-cell .s-pills button")].map((x) => txt(x) + ":" + (x.title || "") + (x.getAttribute("aria-pressed") === "true" ? "*" : "")),
            rlabel: txt(read && read.querySelector(":scope > .r-label")),
            here: read ? [...read.querySelectorAll(":scope > .r-piece, :scope > .r-dflt")].map((x) => txt(x) + " {" + ((x.querySelector(".g-lic") || {}).title || "") + "}") : [],
            roles: read ? [...read.querySelectorAll(":scope > .kq-role")].map(txt) : [],
            data: rp ? { ...rp.dataset } : null, pills, settled: settled(), prov: txt(hud.querySelector(".prov")),
          };
          if (press) {
            const el = pillEls.find((x) => txt(x) === press);
            if (el) {
              el.click(); await turn(500);
              const card = hud.querySelector(".d-slot .d-card");
              res.pressed = { text: press, row: card ? card.dataset.row : null, body: txt(card && card.querySelector(".d-text")).slice(0, 400), att: txt(card && card.querySelector(".att")), links: card ? [...card.querySelectorAll(".att a")].map((a) => a.textContent.trim() + " -> " + a.href) : [], notes: card ? [...card.querySelectorAll(".sense-notes")].map(txt) : [] };
            } else res.pressed = { text: press, missing: true };
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          await turn(120);
          return res;
        }, { si: p.si, e: p.e, press: p.press || null, block: p.block ?? null });
      } catch (err) { got = { fault: String(err).slice(0, 300) }; }
      out.push({ ...p, state: STATE, ...got });
    }
    if (errors.length) out.push({ book, pageerror: errors.slice(0, 3) });
    await ctx.close();
    writeFileSync(OUT, JSON.stringify(out, null, 1));
  }
} finally { await browser.close(); await tree.close(); }
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log("places", places.length, "read", out.length);
