// The card's readings rows, with one word placed at every screen height in steps: where the word
// really stood, how many whole rows of readings showed, where the card stood. Read-only probe.
// node rows-scan.mjs <tools dir> <url> <width> <height> <word index> [step=10]
const [TOOLS, URL, W, H, IDX, STEP = "10"] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(`${TOOLS}/playwright-v1.mjs`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: Number(W), height: Number(H) } })).newPage();
p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(1500);
const out = [];
for (let at = 100; at <= Number(H) - 40; at += Number(STEP)) {
  await p.evaluate(({ i, at }) => {
    const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i];
    wb.scrollIntoView({ block: "center" });
    window.scrollBy(0, wb.getBoundingClientRect().bottom - at);
    window.__before = Math.round(wb.getBoundingClientRect().bottom);
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
  }, { i: Number(IDX), at });
  await p.waitForTimeout(900);
  const r = await p.evaluate((i) => {
    const box = document.querySelector("#hud > .rows .b-read .r-pills");
    if (!box || !box.children.length) return null;
    const top = box.getBoundingClientRect().top, rows = [];
    for (const el of box.children) {
      const q = el.getBoundingClientRect(), t = q.top - top + box.scrollTop, bt = q.bottom - top + box.scrollTop;
      const row = rows.find((x) => Math.abs(x.t - t) < 2);
      if (row) row.b = Math.max(row.b, bt); else rows.push({ t, b: bt });
    }
    const hud = document.getElementById("hud"), hr = hud.getBoundingClientRect();
    const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i].getBoundingClientRect();
    return { rows: rows.length, whole: rows.filter((x) => x.b <= box.clientHeight + 1).length, rowH: Math.round(rows[0].b - rows[0].t), boxH: box.clientHeight,
      hudTop: Math.round(hr.top), hudBottom: Math.round(hr.bottom), wordBottom: Math.round(wb.bottom), wordTop: Math.round(wb.top), before: window.__before,
      moved: Number(hud.dataset.moved || 0), floor: hud.dataset.readFloor || "", scrollY: Math.round(window.scrollY) };
  }, Number(IDX));
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  if (r) out.push({ at, ...r });
}
await b.close();
for (const r of out) console.log(`${r.whole < Math.min(3, r.rows) ? "SHORT" : "     "} asked ${String(r.at).padStart(3)} · word stood ${String(r.before).padStart(4)} then ${String(r.wordTop).padStart(4)}–${String(r.wordBottom).padStart(4)} · card ${String(r.hudTop).padStart(4)}–${String(r.hudBottom).padStart(4)} · ${r.whole} of ${r.rows} rows whole (row ${r.rowH}px, box ${r.boxH}px) · moved ${r.moved} · scrollY ${r.scrollY}`);
console.log(`${out.filter((r) => r.whole < Math.min(3, r.rows)).length} short of ${out.length}`);
