
// ---- P10 to P15: the marks, where a line stands, and the sentences they call for ------------------------------------
// What each must say is written here again, apart from the block, from the chapter file and the tag files.
{
  const { readdirSync } = await import("node:fs");
  const UNABRIDGED = "Brown-Driver-Briggs, unabridged";
  const nameOf = (r) => (r.all((y) => y.tagName === "b")[0] || { textContent: "" }).textContent;
  const kidSubs = (row) => row.children.filter((x) => x.is("sub")).map((x) => x.textContent);
  const fail = { P10: [], P11: [], P12: [], P13: [], P14: [], P15: [] };
  const seen = { P10: 0, P11: 0, P12: 0, P13: 0, P14: 0, P15: 0 }; let wordsJudged = 0, sampled = 0;
  const note = (law, where, words) => { fail[law].push(`${where}: ${words}`); };
  const STRAY = "Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under.";
  const whereWords = (b) => {
    const label = [b[4], b[5]].filter((x) => x).join(" ");
    if (b[12]) return `${b[10]}, before its numbered senses`;
    if (!b[10]) return label || "the opening";
    if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;
    return label.startsWith(b[10]) ? label : `${b[10]} ${label || "(its opening)"}`;
  };
  /** P10 to P14 at one word: `here` is the element under «At this word». */
  const judgeHere = (where, e, here) => {
    wordsJudged += 1;
    const rows = here.children.filter((x) => x.is("row") && nameOf(x) === UNABRIDGED);
    const forms = e.f.filter((f) => f.h && f.h.b);
    if (rows.length !== forms.length) { note("P12", where, `${rows.length} rows of the unabridged BDB for ${forms.length} forms that cite it`); return; }
    forms.forEach((f, fi) => {
      const row = rows[fi]; const lines = row.children.filter((x) => x.is("line")); const subs = kidSubs(row);
      if (lines.length !== f.h.b.length) { note("P12", where, `${lines.length} lines for ${f.h.b.length} citations`); return; }
      f.h.b.forEach((b, li) => {
        const line = lines[li]; seen.P12 += 1;
        const got = (line.children[1] || { textContent: "" }).textContent.replace(/ $/u, "");
        if (got !== whereWords(b)) note("P12", where, `line ${li + 1} stands «${got}», the file puts it at «${whereWords(b)}»`);
        const marks = line.children.filter((x) => x.is("gap") && (x.textContent === " †" || x.textContent === " ‡")).map((x) => x.textContent.trim()).join("");
        if (b[14]) seen.P10 += 1; if (b[15]) seen.P11 += 1; if (b[13]) seen.P13 += 1;
        if (marks.includes("†") !== !!b[14]) note("P10", where, `line ${li + 1} ${b[14] ? "carries no †" : "is marked † with no count in the file"}`);
        if (marks.includes("‡") !== !!b[15]) note("P11", where, `line ${li + 1} ${b[15] ? "carries no ‡" : "is marked ‡ with no other numeral in the file"}`);
      });
      const most = Math.max(0, ...f.h.b.map((b) => b[14] || 0));
      const dag = subs.filter((t) => t.startsWith("† "));
      const dagWant = most ? [`† BDB cites this verse; this number stands ${most} times in it, and BDB does not say which word it means.`] : [];
      if (JSON.stringify(dag) !== JSON.stringify(dagWant)) note("P10", where, `the row says ${JSON.stringify(dag)}, the file gives ${JSON.stringify(dagWant)}`);
      const ddWant = [...new Set(f.h.b.filter((b) => b[15]).map((b) => `‡ BDB files this verse under another word of the same letters (${b[15].another}.${b[15].gloss.length ? ` ${b[15].gloss.map((g) => `«${oneLine(g)}»`).join(", ")}` : ""}); STEP's number is ${b[15].entry}.`))];
      const dd = subs.filter((t) => t.startsWith("‡ "));
      if (JSON.stringify(dd) !== JSON.stringify(ddWant)) note("P11", where, `the row says ${JSON.stringify(dd)}, the file gives ${JSON.stringify(ddWant)}`);
      const stray = subs.filter((t) => t === STRAY).length; const strayWant = f.h.b.some((b) => b[13]) ? 1 : 0;
      if (stray !== strayWant) note("P13", where, `the row says why a label names another stem ${stray} times, the file calls for it ${strayWant} times`);
    });
    // P14 the pair: the lines under both forms, counted here
    const said = here.children.filter((x) => x.is("form-h") && / under both forms: /u.test(x.textContent)).map((x) => x.textContent);
    let want = [];
    if (e.k === 1 && e.f.length === 2) {
      const key = (b) => JSON.stringify(b.slice(0, 13)); const one = new Set(((e.f[0].h || {}).b || []).map(key));
      const n = ((e.f[1].h || {}).b || []).filter((b) => one.has(key(b))).length;
      if (n) { seen.P14 += 1; want = [`${n === 1 ? "One line" : `${n} lines`} of the unabridged Brown-Driver-Briggs stand${n === 1 ? "s" : ""} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`]; }
    }
    if (JSON.stringify(said) !== JSON.stringify(want)) note("P14", where, `the card says ${JSON.stringify(said)}, the file gives ${JSON.stringify(want)}`);
  };
  /** P15 at one word whose dictionaries have landed: each number's unabridged row. */
  const judgeLanguage = (where, e, body) => {
    const rowLg = e.f.map((f) => (f.t || {}).lg).find((x) => x);
    const ol = new Set(e.f.flatMap((f) => f.ol || []));
    for (const h of body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries")) {
      const box = h.parent; const tag = (/the number (H\d{4}[A-Za-z]?)\./u.exec(box.textContent) || [])[1]; const line = tag ? tagLine(tag) : null;
      if (!line) continue;
      const [how, ...ids0] = line.b.unabridged_bdb_1906; if (how === "H" || !ids0.length) continue;
      const row = box.children.find((x) => x.is("row") && nameOf(x) === UNABRIDGED); if (!row) { note("P15", where, `${tag}: no row of the unabridged BDB`); continue; }
      const other = ids0.filter((id) => ol.has(id)); const subs = kidSubs(row);
      const lg = rowLg || line.lg || null; const t0 = lg === "a" ? "Aramaic" : "Hebrew", t1 = lg === "a" ? "Hebrew" : "Aramaic";
      const said = rowLg ? "STEP's row at this word says" : "STEP's lexicon says";
      const talks = subs.filter((t) => /Biblical (Hebrew|Aramaic) record/u.test(t));
      if (!other.length) { if (talks.length) note("P15", where, `${tag}: the row speaks of a record's language where the forms name none of its records: «${talks[0]}»`); continue; }
      seen.P15 += 1;
      if (ids0.length > 1) {
        const head = `This number stands on ${ids0.length} records of this file. ${other.length === 1 ? "One is a" : `${other.length} are`} Biblical ${t1} record${other.length === 1 ? "" : "s"}; ${said} this word is ${t0}.`;
        if (!(subs[0] || "").startsWith(head)) note("P15", where, `${tag}: the row says «${subs[0]}», where it must open «${head}»`);
        const shown = (row.children.find((x) => x.tagName === "ul" && x.is("records") && !x.hidden) || { all: () => [] }).all((x) => x.tagName === "button" && x.is("open")).map((x) => x.dataset.id);
        const up = shown.filter((id) => other.includes(id)); if (up.length) note("P15", where, `${tag}: a record of the other language stands among those shown first: ${up.join(", ")}`);
      } else {
        const want = `This record is a Biblical ${t1} record, and ${said} this word is ${t0}, so it is not said to cite this word.`;
        if (!subs.includes(want)) note("P15", where, `${tag}: the row says ${JSON.stringify(subs)}, where it must say «${want}»`);
      }
    }
  };
  const hereOf = (body) => { const h3 = body.all((x) => x.tagName === "h3").find((x) => x.textContent === "At this word"); return h3 ? body.children[body.children.indexOf(h3) + 1] : null; };
  const waitDicts = async (bodies) => { for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (bodies.every((b) => b.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; } };
  const tagsOf = (e) => [...new Set(e.f.flatMap((f) => ((f.t || {}).p || []).map((p) => (/H\d{4}[A-Za-z]?/u.exec(p[1] || "") || [null])[0]).filter((t) => t && !/^H9\d\d\d$/u.test(t))))].sort();
  const cases = new Set(); const p6 = new Set(P6_CHAPTERS);
  for (const b of index.books) for (const n of b.chapters) {
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, b.book, `${n}.json.gz`))).toString("utf8"));
    const whole = p6.has(`${b.book}/${n}`) || EVERY; const sample = [];
    for (const v of mine.verses) for (const e of v.e) {
      if (e.m !== undefined) continue;
      const where = `${b.book} ${v.l} entry ${e.i}`;
      const cites = e.f.some((f) => f.h && f.h.b); const pair = e.k === 1 && e.f.length === 2;
      // the language: one word of each case (its numbers, the records the forms name as of the other language, the language STEP's row says), and every word of the chapters P6 runs over
      const ol = [...new Set(e.f.flatMap((f) => f.ol || []))].sort(); const key = ol.length ? JSON.stringify([tagsOf(e), ol, e.f.map((f) => (f.t || {}).lg).find((x) => x) || ""]) : null;
      const lang = whole || (key && !cases.has(key)); if (key) cases.add(key);
      if (!cites && !pair && !lang) continue;
      const body = STAND_IN.createElement("div");
      card.draw(body, mine, v, e, lang ? () => true : () => false);
      if (cites || pair) judgeHere(where, e, hereOf(body));
      if (lang) sample.push([where, e, body]);
    }
    if (sample.length) { sampled += sample.length; for (let k = 0; k < sample.length; k += 400) { const part = sample.slice(k, k + 400); await waitDicts(part.map((x) => x[2])); for (const [where, e, body] of part) judgeLanguage(where, e, body); } }
  }
  const said = (law) => (fail[law].length ? `${fail[law].length} words wrong: ${first(fail[law], 2)}` : "");
  check("P10 a line BDB's quoted form does not give to one word is marked †, no other line is, and the row says once how many times the number stands in the verse", fail.P10.length === 0 && seen.P10 > 0, said("P10") || `${seen.P10.toLocaleString("en-US")} lines marked †, at ${wordsJudged.toLocaleString("en-US")} words judged`);
  check("P11 a line of a paragraph BDB numbers otherwise is marked ‡, no other line is, and the row says once for each such paragraph BDB's numeral, its gloss and STEP's", fail.P11.length === 0 && seen.P11 > 0, said("P11") || `${seen.P11.toLocaleString("en-US")} lines marked ‡`);
  check("P12 every line stands where the file puts it: the stem with its point's labels, the stem's own head, the labels or the opening under no stem, the label as written where it names another stem", fail.P12.length === 0 && seen.P12 > 0, said("P12") || `${seen.P12.toLocaleString("en-US")} lines`);
  check("P13 a row with a line whose point's label names another stem says once why the line names its stem, and no other row says it", fail.P13.length === 0 && seen.P13 > 0, said("P13") || `${seen.P13.toLocaleString("en-US")} lines whose label names another stem`);
  check("P14 at a word written one way and read another, the lines under both forms are counted and said once, and nothing is said where there are none", fail.P14.length === 0 && seen.P14 > 0, said("P14") || `${seen.P14.toLocaleString("en-US")} words with lines under both forms`);
  check("P15 where a number's records include ones of the other language, the row says how many and the language STEP says, and none of them stands among those shown first", fail.P15.length === 0 && seen.P15 > 0, said("P15") || `${seen.P15.toLocaleString("en-US")} rows that say it, at ${sampled.toLocaleString("en-US")} words drawn whole (${cases.size.toLocaleString("en-US")} cases)`);
}
