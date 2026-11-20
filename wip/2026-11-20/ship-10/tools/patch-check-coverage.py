import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)
rep('''  // C4: a chain's word carries the chain at the top of its card, its words
  // one by one pressed among the rungs, this word pressed among the words
  if (c.chain) {
    const top = await p.evaluate(() => ({
      rung: (document.querySelector('#hud .b-chain .s-pills button[aria-pressed="true"]') || {}).textContent || null,
      rungs: document.querySelectorAll("#hud .b-chain .s-pills button").length,
      word: (document.querySelector('#hud .b-chain-cell .s-pills button[aria-pressed="true"]') || {}).textContent || null }));
    // the chain's rungs: as written and the words at least; the closed-up
    // form only where a source wrote it (the owner, 2026-10-17)
    if (top.rungs < 2 || !top.rung || !top.rung.includes("+")) chainBad.push(`${c.label} ${c.s}: chain row ${top.rungs} rungs, pressed ${top.rung}`);
    else if (top.word !== c.k) chainBad.push(`${c.label} ${c.s}: chain word pressed ${top.word}, owed ${c.k}`);
  }
''', '''  // C4, at rest: a chain's word is a word (words-stand-alone-rule-v1, 20 November 2026): its card is its own and
  // carries no chain at its top. The chain's lattice at the top is the «as written» position's (below, asked once)
  if (c.chain) {
    const rungs = await p.evaluate(() => document.querySelectorAll("#hud .b-chain .s-pills button").length);
    if (rungs) chainBad.push(`${c.label} ${c.s}: at rest the card carries the chain's ${rungs} rungs at its top`);
  }
''')
rep('''const chainPicks = picks.filter((c) => c.chain);
''', '''const chainPicks = picks.filter((c) => c.chain);
// C4, asked «as written»: a chain's word carries the chain at the top of its card, its words one by one pressed among
// the rungs, this word pressed among the words
if (chainPicks.length) {
  await p.goto(`${URL}${URL.includes("?") ? "&" : "?"}maqaf=maqaf`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__zone && document.querySelector("section.seg"), null, { timeout: 30000 });
  for (const c of chainPicks) {
    await p.evaluate(([si, wi]) => { const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); s.querySelectorAll(".he-text .wb")[wi].querySelector(".w").click(); }, [c.si, c.wi]);
    try { await p.waitForSelector("#hud .r-pills button, #hud .b-cut .s-pills button", { timeout: 20000 }); } catch { chainBad.push(`${c.label} ${c.s}: asked as written, the card did not open`); continue; }
    await p.waitForTimeout(400);
    const top = await p.evaluate(() => ({
      rung: (document.querySelector('#hud .b-chain .s-pills button[aria-pressed="true"]') || {}).textContent || null,
      rungs: document.querySelectorAll("#hud .b-chain .s-pills button").length,
      word: (document.querySelector('#hud .b-chain-cell .s-pills button[aria-pressed="true"]') || {}).textContent || null }));
    // the chain's rungs: as written and the words at least; the closed-up
    // form only where a source wrote it (the owner, 2026-10-17)
    if (top.rungs < 2 || !top.rung || !top.rung.includes("+")) chainBad.push(`${c.label} ${c.s}: asked as written, chain row ${top.rungs} rungs, pressed ${top.rung}`);
    else if (top.word !== c.k) chainBad.push(`${c.label} ${c.s}: asked as written, chain word pressed ${top.word}, owed ${c.k}`);
    await p.keyboard.press("Escape");
    await p.waitForTimeout(150);
  }
}
''')
rep('''check("C4  a word of a chain opens its own divisions under the chain's lattice: the chain's rungs with the words one by one pressed, and this word pressed among its words",''',
    '''check("C4  a word of a chain opens its own divisions: at rest with no chain at the top of its card, and asked as written under the chain's lattice, the chain's rungs with the words one by one pressed and this word pressed among its words",''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
