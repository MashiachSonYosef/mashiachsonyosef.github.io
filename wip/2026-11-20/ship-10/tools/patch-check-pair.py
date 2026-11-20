import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:70])
    s = s.replace(old, new)
rep('''// GUARDS: exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf, maqaf-rule-v2-one-c0-per-word, megacompspan-rule-v1-one-maqaf-run-one-card
''', '''// GUARDS: exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf, maqaf-rule-v2-one-c0-per-word, megacompspan-rule-v1-one-maqaf-run-one-card, words-stand-alone-rule-v1-at-rest-each-word-is-its-own-cell-and-card-and-a-joined-cell-stands-only-where-a-dictionary-that-stands-files-it
''')
rep('''//   L4  no word of a split pair is drawn as pieces (no lattice over a pair)
//
''', '''//   L4  no word of a split pair is drawn as pieces (no lattice over a pair)
//   L5  AT REST THE WORDS STAND ALONE (the owner, 20 November 2026: «follow
//       their convention to not do run words at all»; words-stand-alone-
//       rule-v1). On a first visit no wrapper joins a pair: each word is its
//       own cell, the joiner rides as ink on the word before, and each word
//       opens its own card, headed by that word alone, with no chain at the
//       top of it. L2 to L4 are the laws of the switch's other position
//       («joined words: as written»), and are held on the page asked with
//       ?maqaf=maqaf.
//
''')
rep('''await page.goto(URL_ARG, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
const drawn = await page.evaluate(''', '''// L5 · at rest, as a first visit opens the page
const l5 = [];
await page.goto(URL_ARG, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
{
  const rest = await page.evaluate((exp) => {
    const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
    const text = (wb) => { const w = wb.querySelector(":scope > .w"); return w ? w.textContent : ""; };
    return { toggles: window.__hudToggles || null, chains: [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((j) => j.__chain).length,
      runs: exp.map((e) => { const i = wbs.findIndex((wb, n) => text(wb) === e.first && wbs[n + 1] && text(wbs[n + 1]) === e.second); return i < 0 ? null : { i, joined: !!wbs[i].closest(".wjoin") || !!wbs[i + 1].closest(".wjoin"), sameParent: wbs[i].parentElement === wbs[i + 1].parentElement }; }) };
  }, expected);
  if (!rest.toggles || rest.toggles.maqaf !== "pieces") l5.push(`the page says the joined words rest ${rest.toggles ? rest.toggles.maqaf : "(nothing)"}, not as separate words`);
  if (rest.chains) l5.push(`${rest.chains} chain(s) drawn joined on a first visit`);
  const cardNow = () => page.evaluate(() => {
    const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
    return { b: ((h.querySelector(".head b") || {}).textContent || "").trim(), chain: !!h.querySelector(".b-chain") };
  });
  let opened = 0;
  for (let n = 0; n < expected.length && opened < 2; n += 1) {
    const e = expected[n], r = rest.runs[n];
    if (!e.second) continue;
    if (!r) { l5.push(`run ${n + 1} ${esc(e.text)}: its two words are not drawn one after the other`); continue; }
    // a pair a dictionary that stands files as one entry is one cell (check-words-stand-alone-v1 holds those)
    if (r.joined) continue;
    if (!r.sameParent) l5.push(`run ${n + 1} ${esc(e.text)}: its words stand in two hosts`);
    const heads = [];
    for (const k of [0, 1]) {
      const wb = page.locator("section.seg .he-text .wb").nth(r.i + k);
      await wb.scrollIntoViewIfNeeded();
      await wb.locator(":scope > .w").first().click();
      await page.waitForTimeout(1200);
      const c = await cardNow();
      if (!c) { l5.push(`run ${n + 1}: no card opened on word ${k + 1}`); continue; }
      const want = k === 0 ? e.first : e.second;
      if (c.b !== want && c.b !== want.replace(/\\u05be[\\u0591-\\u05c7]*$/u, "")) l5.push(`run ${n + 1}: word ${k + 1}'s card is headed ${esc(c.b)}, not the word ${esc(want)}`);
      if (c.chain) l5.push(`run ${n + 1}: word ${k + 1}'s card carries the chain at its top`);
      heads.push(c.b);
      await page.keyboard.press("Escape"); await page.waitForTimeout(250);
    }
    if (heads.length === 2 && heads[0] === heads[1]) l5.push(`run ${n + 1}: both words opened one card (${esc(heads[0])})`);
    opened += 1;
  }
  if (!opened && !l5.length) l5.push("no pair of the first runs stands as two words to open");
  check("L5  at rest no wrapper joins a pair: each word its own cell and its own card, headed by that word, no chain at its top", l5.length === 0, l5.length ? few(l5) : `${opened} pair(s) opened word by word`);
}
// L2 to L4 · the switch's other position, asked for this load
await page.goto(`${URL_ARG}${URL_ARG.includes("?") ? "&" : "?"}maqaf=maqaf`, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
const drawn = await page.evaluate(''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
