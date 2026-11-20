import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
B = chr(92)
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:100])
    s = s.replace(old, new)
rep('''//   A6  the reader opens the dictionaries that rest shut from a card: the
//       card stays, and the places set aside are cells once it is closed
''', '''//   A6  the reader opens the dictionaries that rest shut from a card: the
//       card stays, and the places set aside are cells once it is closed
//   A7  a word of a sign's cell is one word: landed on as a search's hit
//       lands (the word's own opener) or pressed, its card has no chain at
//       its top and wears the word's own address, never the cell's first to
//       last (the independent review of 20 November 2026: the landing opened
//       a chain's card whose rungs had no key, and both words of 6,586 cells
//       wore a two-word address)
//   A8  nothing is laid under an open card, and what a switch moved is paid
//       when the card closes by any road: the dictionaries opened from a
//       card, the card closed by the English pill, and the places set aside
//       are cells (the review: only a press away and Escape paid)
//   A9  the cells follow a source's switch: the source that alone stands at
//       the most places, switched off on the rail, sets those places aside,
//       and on again brings them back (the review: they stayed until a load)
''')
rep('''if (errs.length) check("  no page error", false, errs[0].slice(0, 160));
await b.close();''', '''// A7, A8, A9 · the review's findings of 20 November 2026, on a fresh visit
{
  const ctx3 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p3 = await ctx3.newPage();
  p3.on("pageerror", (e) => errs.push(e.message));
  await open(p3, urlFor());
  await p3.waitForFunction(() => !!window.__hudToggles, null, { timeout: 60000 });
  await p3.waitForTimeout(1000);
  // A7
  const a7 = [];
  const cellWords = await p3.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const cell = [...document.querySelectorAll("section.seg .he-text .wjoin")].find((j) => !j.__key && j.__ink);
    if (!cell) return null;
    const sec = cell.closest("section.seg"), all = [...sec.querySelectorAll(".he-text .wb:not(.mark)")], h = document.getElementById("hud");
    const said = () => ({ chain: !!h.querySelector(".b-chain"), wn: ((h.querySelector(".wn") || {}).textContent || "").trim(), open: !h.hidden });
    const out = [];
    for (const wb of cell.__ink.querySelectorAll(":scope > .wb")) {
      const j = [...cell.__ink.querySelectorAll(":scope > .wb")].indexOf(wb), n = all.indexOf(wb) + 1;
      wb.scrollIntoView({ block: "center" });
      wb.__openWord(j); await sleep(900);
      out.push({ how: "landed on", n, label: sec.__sec ? String(sec.__sec.label) : "", ...said() });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(200);
      (wb.querySelector(":scope > .w span") || wb.querySelector(":scope > .w")).click(); await sleep(900);
      out.push({ how: "pressed", n, label: sec.__sec ? String(sec.__sec.label) : "", ...said() });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(200);
    }
    return out;
  });
  if (!cellWords || !cellWords.length) a7.push("no cell without a key among the sections built at the page's opening");
  else for (const w of cellWords) {
    if (!w.open) a7.push(`${w.label}:${w.n} ${w.how}: no card`);
    else if (w.chain) a7.push(`${w.label}:${w.n} ${w.how}: a chain stands at the top of its card`);
    else if (!w.wn.startsWith(`${w.label}:${w.n} `)) a7.push(`${w.label}:${w.n} ${w.how}: its card wears the address «${w.wn}»`);
  }
  check("A7  a word of a sign's cell, landed on or pressed, opens its own card under its own address", a7.length === 0, a7.length ? few(a7) : `${cellWords.length / 2} words of the cell at ${cellWords[0].label}, each landed on and pressed`);
  // A8
  const a8 = [];
  const cellsNow = () => p3.evaluate(() => ({ rested: window.__spanStore ? window.__spanStore.rested : null, cells: [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((j) => j.__run && j.__run.spanKey).length, open: !document.getElementById("hud").hidden, kinds: window.__kinds }));
  const before = await cellsNow();
  const pressed = await p3.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const wb of [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")].slice(0, 30)) {
      if (wb.closest(".wjoin")) continue;
      const t = wb.querySelector(":scope > .w span") || wb.querySelector(":scope > .w");
      t.scrollIntoView({ block: "center" }); t.click(); await sleep(900);
      const sw = document.querySelector("#hud .kinds-switch");
      if (sw) { sw.click(); await sleep(1500); return true; }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await sleep(150);
    }
    return false;
  });
  if (!pressed) a8.push("no card among the first words offers the dictionaries that rest shut");
  else {
    const mid = await cellsNow();
    if (!mid.open) a8.push("the card closed under its own switch");
    if (mid.rested !== before.rested || mid.cells !== before.cells) a8.push(`the lanes were laid under an open card (${before.rested} set aside and ${before.cells} cells before, ${mid.rested} and ${mid.cells} with the card open)`);
    await p3.evaluate(() => document.getElementById("modeEn").click());
    await p3.waitForTimeout(2500);
    const after = await cellsNow();
    if (after.open) a8.push("the English pill left the card open");
    if (after.rested !== 0) a8.push(`${after.rested} places still set aside once the English pill closed the card`);
    if (aside.length && !(after.cells > before.cells)) a8.push(`the built sections were not laid again: ${before.cells} cells before, ${after.cells} after`);
    if (!a8.length) a8.ok = `${before.rested} set aside and ${before.cells} cells with the card open, none set aside and ${after.cells} cells once the English pill closed it`;
  }
  check("A8  nothing is laid under an open card, and the cells follow when it closes by another road than a press away or Escape", a8.length === 0, a8.length ? few(a8) : a8.ok);
  await ctx3.close();
  // A9, on its own visit
  const a9 = [];
  const mKey = (() => { const out = new Map(); for (const f of [join(K3, "data", "route-store", "index.json"), join(K3, "data", "span-store", "index.json")]) { if (!existsSync(f)) continue; const ms = JSON.parse(readFileSync(f, "utf8")).m_sources || {}; for (const [m, v] of Object.entries(ms)) if (v && v.key && !out.has(m)) out.set(m, v.key); } return out; })();
  const sole = new Map();
  for (const pl of standing) {
    const open = new Set(rest.openRows[pl.key] || []);
    const ks = new Set((span.keys[pl.key] || []).filter((r) => open.has(r.row_id) && !r.form_of && !(rest.masorah === "only" && pl.held && HELD.has(pl.held[r.row_id]))).map((r) => mKey.get(r.slots[3]) || r.slots[3]));
    if (ks.size === 1) { const k = [...ks][0]; sole.set(k, (sole.get(k) || 0) + 1); }
  }
  const pick = [...sole.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0] || null;
  if (!pick) console.log(`  --  A9  not judged here: no place of ${BOOK} stands on one source alone`);
  else {
    const ctx4 = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p4 = await ctx4.newPage();
    p4.on("pageerror", (e) => errs.push(e.message));
    await open(p4, urlFor());
    await p4.waitForFunction(() => !!window.__hudToggles && document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp').length > 0, null, { timeout: 60000 }).catch(() => {});
    await p4.waitForTimeout(800);
    const restedNow = () => p4.evaluate(() => (window.__spanStore ? window.__spanStore.rested : null));
    const press = () => p4.evaluate((key) => { const c = [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')].find((x) => x.dataset.key === key); if (c) c.click(); return !!c; }, pick[0]);
    const r0 = await restedNow();
    if (!(await press())) a9.push(`the rail offers no switch for ${pick[0]}`);
    else {
      await p4.waitForTimeout(2500);
      const r1 = await restedNow();
      if (r1 !== r0 + pick[1]) a9.push(`${pick[0]} off: ${r1} places set aside, and ${r0} + the ${pick[1]} it alone stands at were owed`);
      await press(); await p4.waitForTimeout(2500);
      const r2 = await restedNow();
      if (r2 !== r0) a9.push(`${pick[0]} on again: ${r2} places set aside, ${r0} before`);
    }
    await ctx4.close();
    check("A9  a source switched off on the rail sets aside the places it alone stands at, and on again brings them back", a9.length === 0, a9.length ? few(a9) : `${pick[0]}, alone at ${pick[1]} places`);
  }
}
if (errs.length) check("  no page error", false, errs[0].slice(0, 160));
await b.close();''')
rep('''// so (it reads one book, Isaiah, whole: 139 places and 1,761 chains); what''', '''// so (it reads one book, Isaiah, whole: 139 places and 1,761 chains); that
// a switch moved by itself is followed (the pointing settling at «keep»
// under another switch: read by hand, Deuteronomy 8:2); what''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
