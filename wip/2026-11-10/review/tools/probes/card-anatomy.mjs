// One card opened once, cold or after a warm-up, and everything about how it was sized. Read-only probe.
// node card-anatomy.mjs <tools dir> <url> <width> <height> <word index> <at> [warm=0]
const [TOOLS, URL, W, H, IDX, AT, WARM = "0"] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(`${TOOLS}/playwright-v1.mjs`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: Number(W), height: Number(H) } })).newPage();
p.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const openAt = async (i, at) => {
  await p.evaluate(({ i, at }) => {
    const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i];
    wb.scrollIntoView({ block: "center" });
    if (at != null) window.scrollBy(0, wb.getBoundingClientRect().bottom - at);
    (wb.querySelector(".w span") || wb.querySelector(".w")).click();
  }, { i, at });
  await p.waitForTimeout(900);
};
for (let i = 0; i < Number(WARM); i += 1) { await openAt(i, null); await p.keyboard.press("Escape"); await p.waitForTimeout(150); }
await openAt(Number(IDX), Number(AT));
const r = await p.evaluate((i) => {
  const hud = document.getElementById("hud"), hr = hud.getBoundingClientRect();
  const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i].getBoundingClientRect();
  const kids = [...hud.children].map((c) => `${c.tagName.toLowerCase()}.${String(c.className).replace(/\s+/g, ".")} ${Math.round(c.getBoundingClientRect().height)}px`);
  const rows = hud.querySelector(":scope > .rows");
  const bands = rows ? [...rows.children].map((c) => `${String(c.className).replace(/\s+/g, ".")} h=${Math.round(c.getBoundingClientRect().height)} client=${c.clientHeight} scroll=${c.scrollHeight} max=${c.style.maxHeight || "-"}`) : [];
  const box = hud.querySelector(":scope > .rows .b-read .r-pills");
  return { word: `${Math.round(wb.top)}–${Math.round(wb.bottom)}`, card: `${Math.round(hr.top)}–${Math.round(hr.bottom)} (${Math.round(hr.height)}px)`, styleMax: hud.style.maxHeight || "-", cssMax: getComputedStyle(hud).maxHeight,
    dataset: JSON.stringify({ ...hud.dataset }), kids, rowsBox: rows ? `client=${rows.clientHeight} scroll=${rows.scrollHeight} max=${rows.style.maxHeight || "-"}` : "", bands,
    pills: box ? `children=${box.children.length} client=${box.clientHeight} scroll=${box.scrollHeight} max=${box.style.maxHeight || "-"}` : "none",
    docH: document.documentElement.scrollHeight, scrollY: Math.round(scrollY), inner: innerHeight };
}, Number(IDX));
await b.close();
for (const [k, v] of Object.entries(r)) console.log(`${k}: ${Array.isArray(v) ? "\n  " + v.join("\n  ") : v}`);
