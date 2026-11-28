
// ---- P16 to P18: the pills of the live reader's card (THE PILLS, in placeCardOf) ------------------------------------
// The live reader's card keeps its frame and fills each cell's pills from these files (pillsAt). Every fifth word of
// the chapters P6 runs over (every word with --every) is drawn whole, its whole entries opened, and its cells asked
// for their pills: each STEP part, each MACULA part, the whole word, each form. What the listing prints as a
// meaning is read off the drawn listing (a «» run of a meaning or an opening, a gloss, a <def>); what must be a pill
// is worked out here again from the files and the listing, by code the block does not share.
{
  const UNA = "unabridged_bdb_1906";
  const NAME_KEY = { "STEP Bible": "step", "MACULA Hebrew": "macula" };
  for (const [k, nm] of Object.entries(SOURCE_NAMES)) NAME_KEY[nm] = k;
  const LET = (s) => [...String(s || "")].filter((c) => c >= "א" && c <= "ת").length;
  const spans = (hebs) => { let a = 0; return hebs.map((h) => { const n = LET(h); const r = n ? [a, a + n - 1] : null; a += n; return r; }); };
  const runs = (s) => { const t = String(s); const q = [...t.matchAll(/«([^»]*)»/gu)].map((m) => oneLine(m[1])).filter(Boolean); return q.length ? q : [oneLine(t)].filter(Boolean); };
  const tagOf = (s) => (/H\d{4}[A-Za-z]?/u.exec(s || "") || [null])[0];
  const fail = { P16: [], P17: [], P18: [] }; let wordsJ = 0, cellsJ = 0, pillsJ = 0, meaningsJ = 0, maculaOtherwise = 0, emptyCells = 0;
  const words = [];
  for (const key of P6_CHAPTERS) {
    const [book, ch] = key.split("/");
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, book, `${ch}.json.gz`))).toString("utf8"));
    for (const v of mine.verses) { let n = 0; for (const e of v.e) { if (e.m !== undefined) continue; n += 1; if (EVERY || (wordsJ++ % 5 === 0)) words.push({ book, ch, v, e, n, doc: mine }); } }
  }
  wordsJ = 0;
  for (let k = 0; k < words.length; k += 300) {
    const part = words.slice(k, k + 300);
    for (const w of part) { w.body = STAND_IN.createElement("div"); card.draw(w.body, w.doc, w.v, w.e, () => true); }
    for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (part.every((w) => w.body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; }
    for (const w of part) for (const btn of w.body.all((x) => x.tagName === "button" && x.is("open"))) for (const fn of btn.listeners.click || []) await fn();
    for (const w of part) {
      wordsJ += 1;
      const where = `${w.book} ${w.v.l} word ${w.n}`;
      // what the listing prints as a meaning, by source: every row's lines, and every whole entry opened
      const printed = new Map(); const said = (src, s) => { if (!printed.has(src)) printed.set(src, new Set()); printed.get(src).add(s); };
      for (const row of w.body.all((x) => x.is("row"))) {
        const src = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (!src) continue;
        for (const x of row.all((y) => y.is("rd") || y.is("def") || (y.tagName === "em" && y.is("gl")))) {
          // a part's reading in its row stands whole; a quoted meaning is each of its «» runs
          for (const s of (y => (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)]))(x)) said(src, s);
        }
      }
      // the records each dictionary shows as this word's, under each number: [tag, key, the one line's meanings]
      const shownLines = [];
      for (const h of w.body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries")) {
        const box = h.parent; const tag = (/the number (H\d{4}[A-Za-z]?)\./u.exec(box.textContent) || [])[1]; if (!tag) continue;
        for (const row of box.children.filter((x) => x.is("row"))) {
          const key = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (!key) continue;
          if (row.children.some((x) => x.is("sub") && /so it is not said to cite this word/u.test(x.textContent))) continue;
          const list = row.children.find((x) => x.tagName === "ul" && x.is("records") && !x.hidden);
          const lines = list ? list.children.map((li) => li.children.find((x) => x.is("line"))).filter(Boolean) : row.children.filter((x) => x.is("line"));
          for (const ln of lines) shownLines.push([tag, key, ln.all((y) => y.is("rd") || y.is("def")).flatMap((y) => (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)]))]);
        }
      }
      w.e.f.forEach((f) => {
        const reading = w.e.f.length === 1 ? "form" : f.r === 2 ? "ketiv" : "qere";
        const tp = (f.t && f.t.p) || []; const t = tp.reduce((s, p) => s + LET(p[3]), 0);
        if (!t) return;
        const ss = spans(tp.map((p) => p[3])); const ms = f.m ? spans(f.m.map((x) => x[2])) : [];
        const cells = new Map(); const cellOf = (r) => { const key = `${r[0]}-${r[1]}`; if (!cells.has(key)) cells.set(key, { r, must: [] }); return cells.get(key); };
        cellOf([0, t - 1]); ss.forEach((r) => r && cellOf(r));
        const mFits = f.m && ms.filter(Boolean).length && JSON.stringify(ms.filter(Boolean)) === JSON.stringify(ss.filter(Boolean));
        if (f.m && !mFits) maculaOtherwise += 1;
        // what must be a pill, from the files: STEP's and MACULA's words at this word in their parts' cells (MACULA's where
        // its cut is STEP's), what cites here in the cell of the number it stands under, and every meaning a shown record's
        // one line prints, in the cell of the part whose number it is filed under
        tp.forEach((p, i) => { if (ss[i] && p[0] !== null && oneLine(p[0])) cellOf(ss[i]).must.push(["step", oneLine(p[0])]); });
        if (mFits) f.m.forEach((x, i) => { if (ms[i] && oneLine(x[1])) cellOf(ms[i]).must.push(["macula", oneLine(x[1])]); });
        const partOfTag = (tag) => tp.findIndex((p) => tagOf(p[1]) === tag);
        const h = f.h || {};
        for (const b of h.b || []) { const i = partOfTag(b[9]); if (i >= 0 && ss[i]) for (const [txt, kind] of b[6]) if (kind === "main_gloss" || kind === "opening") cellOf(ss[i]).must.push([UNA, oneLine(txt)]); }
        for (const o of h.o || []) { const i = partOfTag(o[4]); if (i >= 0 && ss[i]) for (const d of o[3]) cellOf(ss[i]).must.push(["openscriptures_bdb_1906", oneLine(d)]); }
        for (const [tag, key, ms2] of shownLines) { const i = partOfTag(tag); if (i >= 0 && ss[i]) for (const s of ms2) cellOf(ss[i]).must.push([key, s]); }
        w.cells = (w.cells || []).concat([...cells.values()].map((c) => ({ ...c, reading, t, f })));
      });
    }
    // each cell asked for its pills, and judged
    for (const w of part) for (const c of w.cells || []) {
      const where = `${w.book} ${w.v.l} word ${w.n} ${c.reading} [${c.r[0]}, ${c.r[1]}]`;
      const got = await card.pillsAt(w.doc, w.v.l, w.n, c.reading, c.r[0], c.r[1], c.t);
      cellsJ += 1; if (!got.pills.length) emptyCells += 1;
      const printedOf = (src) => { const set = new Set(); for (const row of w.body.all((x) => x.is("row"))) { const s = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (s !== src) continue; for (const y of row.all((z) => z.is("rd") || z.is("def") || (z.tagName === "em" && z.is("gl")))) for (const q of (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)])) set.add(q); } return set; };
      const have = new Map();
      for (const p of got.pills) {
        pillsJ += 1;
        // P17: a source the card names, and an address
        if (!(p.src === "step" || p.src === "macula" || SOURCE_NAMES[p.src]) || typeof p.how !== "string" || !p.how.trim()) fail.P17.push(`${where}: «${p.text}» (${p.src}) stands with no address`);
        else if (p.src === "step" && !(c.f.t && p.how.includes(c.f.t.rows.join(" + ")))) fail.P17.push(`${where}: «${p.text}» names no STEP row of this word`);
        else if (SOURCE_NAMES[p.src] && !/\d/u.test(p.how)) fail.P17.push(`${where}: «${p.text}» names no record of ${p.src}`);
        // P16: the listing prints it as that source's meaning (a whole word's reading: each of its parts)
        const set = printedOf(p.src);
        const ok = p.text.includes("/") && (p.src === "step" || p.src === "macula") ? p.text.split("/").every((x) => set.has(x)) : set.has(p.text);
        if (!ok) fail.P16.push(`${where}: «${p.text}» (${p.src}) is no meaning the listing prints for that source`);
        (have.get(p.src) || have.set(p.src, new Set()).get(p.src)).add(p.text);
      }
      // P18: every meaning the listing shows as this word's in this cell is a pill of the cell
      for (const [src, s] of c.must) { meaningsJ += 1; if (!(have.get(src) || new Set()).has(s)) fail.P18.push(`${where}: «${s}» (${src}) is printed and is no pill here`); }
    }
    for (const w of part) { w.body = null; w.cells = null; }
  }
  const said = (law) => (fail[law].length ? `${fail[law].length} found wrong: ${first(fail[law], 2)}` : "");
  check("P16 every pill a cell offers is a string the listing prints as that source's meaning (a whole word's reading: each of its parts)", fail.P16.length === 0 && pillsJ > 0, said("P16") || `${pillsJ.toLocaleString("en-US")} pills in ${cellsJ.toLocaleString("en-US")} cells of ${wordsJ.toLocaleString("en-US")} words`);
  check("P17 no pill stands without its source and an address that names this word's STEP row or a record", fail.P17.length === 0 && pillsJ > 0, said("P17") || `${pillsJ.toLocaleString("en-US")} pills`);
  check("P18 every meaning the listing prints as this word's (at this word, and on the one line of each record shown as this word's) is a pill in its cell", fail.P18.length === 0 && meaningsJ > 0, said("P18") || `${meaningsJ.toLocaleString("en-US")} meanings; ${emptyCells.toLocaleString("en-US")} cells with no pill; ${maculaOtherwise.toLocaleString("en-US")} forms MACULA divides otherwise than STEP, its parts held to the whole word alone`);
}
