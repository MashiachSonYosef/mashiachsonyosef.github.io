#!/usr/bin/env node
// GUARDS: ledger-print-rule-v2-a-branchs-answer-prints-by-the-step-its-declaration-carries-and-nothing-is-added
//
// THE PRINT STEP, READ FROM THE DECLARATION (ask v1.2, 6 November 2026). An
// option whose answer is neither "divides" nor the resting "as written"
// carries its print step as data: what the page prints for a row the branch
// reaches, in terms of the branch's own shapes. Until this file, that step was
// tools/ledger-print-v1.mjs, one entry per branch written by hand from the
// option's "means"; it works, and it is the wrong shape to keep: the ledgers
// are data and the page reads the data, and there the page read a table typed
// beside the data. From 7 November 2026 apply-ledger-divisions reads `print`
// from the declaration wherever an option carries it, and falls to the hand
// table only where it does not; the hand table retires the day the last hand
// entry is a declaration's.
//
// What an option carries:
//   print     one step { kind, at, to_end?, readings? }, or a list of steps
//             where the side differs by shape (the corpus lane's v111.1 wrote
//             it so, and it is accepted): a step applies to a row when a mark
//             of a shape in its `at` stands on the row.
//   rows      for the lines the ledger marked by hand: [{ row, side }], the row
//             with a "|" after the sign that cuts, side "after", "before" or
//             "none"; a row the list names prints by its side and by nothing
//             else. The row may be written short, as the corpus lane writes
//             it (v111.1): the route's opening up to the sign and the "|",
//             which names every served text that begins so («for footbaths,|»,
//             «To be remembered;|»); or a leading "…" for an elided opening,
//             which names every served text that ends with the rest («…;|
//             teeth»); either way, where no text opens or ends so, the entry
//             names the texts that hold its run once («,| I am enslaved»). A
//             full text with the "|" in it is the plain case of the first.
//   rows_print  (the corpus lane's v135.2 and v123.2, 7 November 2026) the
//             step as a list, for a branch whose cut no kind can say: one line
//             per served text the branch reaches, { row, prints } with the
//             text byte for byte and what the page prints for it (a string, ""
//             for no pill, or a list), and where another branch's cut falls
//             inside the row, `prints_with_the_cuts_of_6_november` beside it,
//             the texts printed when those cuts stand. A text the branch
//             reaches that the list does not hold is an error, never a guess:
//             the list is the store of its day, and a new text needs a line.
//             A line with no such field, on a row another branch cuts, prints
//             its parts divided at the cuts that fall inside them, the cut's
//             mark dropped: the rule every kind below combines with a cut by
//             (8 November 2026: the corpus lane's v153.2 holds three such
//             texts, «how! how many!, how much!, how long!» among them; the
//             rule gives back, character for character, both lines that do
//             carry the field, v117.2's «congeal, become solid; be hard,
//             stern» and v135.2's «corn; …»). A part is followed through the
//             row character by character in order, so a part that leaves a
//             mark out (v135.2's quotes) still finds its cuts; a part that is
//             not the row's characters in order is an error. Each text so
//             printed is named in the receipt, and a line that carries the
//             field is checked against the rule there too.
//   examples  [{ key?, row, prints }], served rows and what the step prints
//             (a string, "" for no pill, or a list of strings); the checker
//             (check-provider-declaration-v1.2) and the apply tool run them
//             before any row is touched.
//
// The six kinds, as the ask words them; every printed text is a run of the
// route's own characters in their own order, nothing is ever added:
//   before   the text before the first mark of a shape in `at`
//   after    the text after the last mark of a shape in `at`
//   inside   the text between a pair in `at` (the opening shape, then the
//            closing shape standing after it)
//   remove   the text with the marks of the shapes in `at` taken out; for an
//            opener in `at` the whole span to its closer goes; `to_end: true`
//            takes everything from the first mark to the end
//   forms    two texts, the row without the bracket in `at` and the row with
//            the bracket's part joined on («Mede (-s)» → «Mede», «Medes»;
//            «Jobesh (-Gilead)» → «Jobesh», «Jobesh-Gilead»; «(over) against»
//            → «against», «over against»); `readings: true` prints the words
//            before the bracket and each wording inside it, cut at the commas
//            in `at`, as readings of their own («LID (COVER, CAP)» → «LID»,
//            «COVER», «CAP»)
//   none     no pill
// Where steps of two kinds reach one row: `none` wins; `before` wins over
// `after` (the line holds a sign of each side and prints what stands before
// its first before-sign, the corpus lane's own rule for v111.1); two steps of
// one kind merge; any other pair is an error, never a guess. A step that would
// print nothing is an error too (the review of 6 November), unless a row of
// `rows` says "none".
//
// The same contract as tools/ledger-print-v1.mjs's printOf: { texts } for a
// row the step reaches, null for one it does not, a throw for a row it cannot
// print. `cuts` (the row's dividing marks, another branch's answer) combine
// with `remove` as the hand table's do, and with `before`, `after`, `inside`
// and a hand-marked side as the corpus lane's own words have it ("commas
// inside what prints follow their own question where they have one"): the
// kept part divides at the cuts that fall inside it, and a cut outside it
// goes with the text it stood in. `forms` does not combine with a cut.
const KINDS = new Set(["before", "after", "inside", "remove", "forms", "none"]);
const OPEN = { "(": ")", "[": "]", "<": ">", "{": "}" };

const collapse = (s) => s.replace(/ {2,}/gu, " ").trim();
const join = (text, keep) => collapse(keep.map(([a, b]) => text.slice(a, b)).join(""));
const whole = (text) => [[0, text.length]];
const remove = (keep, from, to) => {
  const out = [];
  for (const [a, b] of keep) {
    if (to <= a || from >= b) { out.push([a, b]); continue; }
    if (from > a) out.push([a, from]);
    if (to < b) out.push([to, b]);
  }
  return out;
};
const wordBefore = (text, i) => { let e = i; while (e > 0 && /\s/u.test(text[e - 1])) e -= 1; let s = e; while (s > 0 && !/\s/u.test(text[s - 1])) s -= 1; return [s, e]; };
/** the two forms a bracket offers: the row without the bracket, and the row with the bracket's part joined on (as ledger-print-v1's twoForms) */
const twoForms = (text, o, c) => {
  const inner = text.slice(o + 1, c);
  const plain = remove(whole(text), o, c + 1);
  let joined;
  if (!text.slice(0, o).trim()) joined = [[o + 1, c], [c + 1, text.length]];
  else {
    const [, e] = wordBefore(text, o);
    const start = inner.startsWith("-") && /^[a-z]/u.test(inner.slice(1)) ? o + 2 : o + 1;
    joined = [[0, e], [start, c], [c + 1, text.length]];
  }
  return [plain, joined];
};
/** the closer that matches the opener at i, by bracket counting over the text; -1 where none */
const closerOf = (text, i) => {
  const open = text[i], close = OPEN[open]; if (!close) return -1;
  let depth = 0;
  for (let k = i; k < text.length; k += 1) { if (text[k] === open) depth += 1; else if (text[k] === close) { depth -= 1; if (depth === 0) return k; } }
  return -1;
};

/** the option's steps, normalized to a list; [] where the option carries no print */
/**
 * A rows_print line's parts on a row another branch cuts (8 November 2026):
 * each part divides at the cuts that fall inside it and the cut's mark is
 * dropped, the rule every kind combines with a cut by. A part is followed
 * through the row character by character, in order, from where the part
 * before it ended; null where a part is not the row's characters in order.
 */
export const divideAtCuts = (text, parts, cuts) => {
  const out = []; let from = 0;
  for (const part of parts) {
    const pos = [];
    for (const ch of part) { const at = text.indexOf(ch, from); if (at < 0) return null; pos.push(at); from = at + ch.length; }
    if (!pos.length) continue;
    const chars = [...part]; let piece = "";
    const inside = new Set(cuts.filter((c) => c > pos[0] && c < pos[pos.length - 1]));
    let crossed = new Set();
    for (let j = 0; j < chars.length; j += 1) {
      // a cut the part steps over ends the piece before this character
      for (const c of inside) if (!crossed.has(c) && pos[j] >= c) { out.push(piece); piece = ""; crossed.add(c); }
      if (inside.has(pos[j])) continue; // the cut's own mark goes
      piece += chars[j];
    }
    out.push(piece);
  }
  return out.map((x) => x.trim()).filter(Boolean);
};
export const stepsOf = (option) => {
  const p = option && option.print;
  // a list of rows and what each prints is a step of its own (rows_print)
  if (!p) return rowsPrintOf(option).length ? [{ kind: "rows_print", at: [], to_end: false, readings: false }] : [];
  const list = Array.isArray(p) ? p : [p];
  return list.map((s) => ({ kind: s.kind, at: Array.isArray(s.at) ? s.at : [], to_end: !!s.to_end, readings: !!s.readings }));
};
/** the option's rows_print lines, [] where it carries none */
export const rowsPrintOf = (option) => ((option && Array.isArray(option.rows_print)) ? option.rows_print : []);
/** the rows the ledger marked by hand, each as a matcher: { side, elided, text (the "|" out), at (the "|"'s index in text) } */
export const rowSidesOf = (option) => {
  const out = [];
  for (const r of (option && Array.isArray(option.rows)) ? option.rows : []) {
    const s = String(r.row || ""); const p = s.indexOf("|");
    if (p < 0) continue;
    const elided = s.startsWith("\u2026");
    const body = elided ? s.slice(1) : s; const at = elided ? p - 1 : p;
    out.push({ side: r.side, elided, text: body.slice(0, at) + body.slice(at + 1), at });
  }
  return out;
};
/** the hand-marked entry a route falls under, with the sign's index in the route; null where none names it */
export const rowSideFor = (option, text) => {
  for (const e of rowSidesOf(option)) {
    // the route's opening (or its ending, after an elided opening); else a run that stands in the route once
    if (!e.elided && text.startsWith(e.text)) return { side: e.side, sign: e.at - 1 };
    if (e.elided && text.endsWith(e.text)) return { side: e.side, sign: text.length - e.text.length + e.at - 1 };
    const i = text.indexOf(e.text); if (i >= 0 && text.indexOf(e.text, i + 1) < 0) return { side: e.side, sign: i + e.at - 1 };
  }
  return null;
};
/** the option's examples, normalized: prints as a list of texts ([] for no pill) */
export const examplesOf = (option) => ((option && Array.isArray(option.examples)) ? option.examples : []).map((e) => ({
  key: e.key ?? null, row: String(e.row ?? ""), prints: Array.isArray(e.prints) ? e.prints.map(String) : (e.prints === "" || e.prints == null ? [] : [String(e.prints)]) }));
/** what the ask's six kinds call the option as a whole: "none" where every step is none, else "data" */
export const kindOf = (option) => { const st = stepsOf(option); return st.length && st.every((s) => s.kind === "none") ? "none" : "data"; };
/** the faults of an option's print fields, for the checker: [] when well formed */
export const faultsOf = (option, branchShapes) => {
  const f = [];
  const p = option && option.print;
  if (option && option.rows_print !== undefined) {
    if (!Array.isArray(option.rows_print) || !option.rows_print.length) f.push("rows_print is not a list of lines");
    const seen = new Set();
    for (const [k, r] of rowsPrintOf(option).entries()) {
      const okPrint = (x) => typeof x === "string" || (Array.isArray(x) && x.every((y) => typeof y === "string" && y));
      if (!r || typeof r.row !== "string" || !r.row) { f.push(`rows_print ${k + 1} names no row`); continue; }
      if (seen.has(r.row)) f.push(`rows_print ${k + 1}: the row stands twice`); seen.add(r.row);
      if (!okPrint(r.prints)) f.push(`rows_print ${k + 1}: prints is neither a text nor a list of texts`);
      if (r.prints_with_the_cuts_of_6_november !== undefined && !okPrint(r.prints_with_the_cuts_of_6_november)) f.push(`rows_print ${k + 1}: prints_with_the_cuts_of_6_november is neither a text nor a list of texts`);
      for (const key of Object.keys(r)) if (!["row", "prints", "prints_with_the_cuts_of_6_november"].includes(key)) f.push(`rows_print ${k + 1}: unknown field ${key}`);
    }
    if (p !== undefined) f.push("an option carries print and rows_print both");
  }
  if (p === undefined) return f;
  const list = Array.isArray(p) ? p : [p];
  if (!list.length) f.push("print is empty");
  list.forEach((s, k) => {
    if (!s || typeof s !== "object") { f.push(`step ${k + 1} is not an object`); return; }
    if (!KINDS.has(s.kind)) f.push(`step ${k + 1}: kind "${s.kind}" is none of ${[...KINDS].join(", ")}`);
    if (s.kind !== "none") {
      if (!Array.isArray(s.at) || !s.at.length) f.push(`step ${k + 1} (${s.kind}) names no shapes in at`);
      else for (const id of s.at) if (!branchShapes.includes(id)) f.push(`step ${k + 1} (${s.kind}): ${id} is not a shape of this branch`);
    }
    for (const key of Object.keys(s)) if (!["kind", "at", "to_end", "readings"].includes(key)) f.push(`step ${k + 1}: unknown field ${key}`);
  });
  for (const [k, r] of ((Array.isArray(option.rows) ? option.rows : [])).entries()) {
    if (!r || typeof r.row !== "string" || (r.row.match(/\|/gu) || []).length !== 1) f.push(`rows ${k + 1}: the row carries no single "|" after its sign`);
    else if (r.row.indexOf("|") === 0 || (r.row.startsWith("\u2026") && r.row.indexOf("|") === 1)) f.push(`rows ${k + 1}: the "|" stands after no sign`);
    if (!["after", "before", "none"].includes(r && r.side)) f.push(`rows ${k + 1}: side "${r && r.side}" is none of after, before, none`);
  }
  if (option.examples !== undefined && !Array.isArray(option.examples)) f.push("examples is not a list");
  for (const [k, e] of examplesOf(option).entries()) if (!e.row) f.push(`example ${k + 1} names no row`);
  return f;
};

/**
 * The texts an option prints for a row: { texts } (empty for no pill), null
 * where no step of the option reaches the row, a throw where the step cannot
 * print it. `marks` are the row's marks of this branch's shapes ({ i, mark,
 * shape }); `cuts` the row's dividing marks (indexes), which only `remove`
 * combines with.
 */
export const printUnder = (option, text, marks, cuts = []) => {
  const steps = stepsOf(option);
  if (!steps.length) return null;
  const fail = (why) => new Error(`${option.id}: ${why} on «${text.slice(0, 60)}»`);
  // the step as a list (rows_print): the row's own line, or an error
  if (!option.print && rowsPrintOf(option).length) {
    const line = rowsPrintOf(option).find((r) => r && r.row === text);
    if (!line) throw fail("the branch reaches a text its rows_print holds no line for");
    const asList = (p) => (Array.isArray(p) ? p.map(String) : (p === "" ? [] : [String(p)]));
    const plain = asList(line.prints);
    if (!cuts.length) return { texts: plain };
    // another branch cuts the row: the line's own texts for it where it gives them, else the rule
    const byRule = divideAtCuts(text, plain, cuts);
    if (line.prints_with_the_cuts_of_6_november !== undefined) {
      const texts = asList(line.prints_with_the_cuts_of_6_november);
      return { texts, cuts_by: "line", rule_agrees: !!byRule && JSON.stringify(byRule) === JSON.stringify(texts) };
    }
    if (!byRule) throw fail("a part the line prints is not the row's own characters in order, so another branch's cut cannot be placed in it");
    return JSON.stringify(byRule) === JSON.stringify(plain) ? { texts: plain } : { texts: byRule, cuts_by: "rule" };
  }
  const byRow = rowSideFor(option, text);
  let keeps;
  if (byRow) {
    if (byRow.side === "none") return { texts: [] };
    if (byRow.sign < 0 || byRow.sign >= text.length) throw fail("the hand-marked row's sign stands outside the row");
    keeps = [byRow.side === "after" ? [[byRow.sign + 1, text.length]] : [[0, byRow.sign]]];
  } else {
    const applicable = steps.map((s) => ({ s, at: marks.filter((m) => s.at.includes(m.shape)).sort((a, b) => a.i - b.i) })).filter((x) => x.s.kind === "none" || x.at.length);
    if (!applicable.length) return null;
    if (applicable.some((x) => x.s.kind === "none")) return { texts: [] };
    const kinds = [...new Set(applicable.map((x) => x.s.kind))];
    let chosen;
    if (kinds.length === 1) chosen = { kind: kinds[0], at: applicable.flatMap((x) => x.at).sort((a, b) => a.i - b.i), to_end: applicable.some((x) => x.s.to_end), readings: applicable.some((x) => x.s.readings) };
    else if (kinds.length === 2 && kinds.includes("before") && kinds.includes("after")) { const b = applicable.filter((x) => x.s.kind === "before"); chosen = { kind: "before", at: b.flatMap((x) => x.at).sort((a, b2) => a.i - b2.i) }; }
    else throw fail(`steps of two kinds reach the row (${kinds.join(", ")}) and neither is none`);
    const { kind, at } = chosen;
    if (kind === "before") keeps = [[[0, at[0].i]]];
    else if (kind === "after") keeps = [[[at[at.length - 1].i + 1, text.length]]];
    else if (kind === "inside") {
      const o = at.find((m) => OPEN[m.mark]); const c = o ? at.find((m) => m.i > o.i && m.mark === OPEN[o.mark]) : null;
      if (!o || !c) throw fail("inside: the row holds no pair of the step's shapes");
      keeps = [[[o.i + 1, c.i]]];
    } else if (kind === "remove") {
      let keep = whole(text);
      if (chosen.to_end) keep = remove(keep, at[0].i, text.length);
      else {
        const taken = new Set();
        for (const m of at) {
          if (taken.has(m.i)) continue;
          if (OPEN[m.mark]) { const c = closerOf(text, m.i); if (c < 0) throw fail(`remove: the opener at ${m.i} never closes`); keep = remove(keep, m.i, c + 1); for (let k = m.i; k <= c; k += 1) taken.add(k); }
          else { keep = remove(keep, m.i, m.i + 1); taken.add(m.i); }
        }
      }
      if (cuts.length) {
        const pieces = []; let from = 0;
        for (const i of [...cuts, text.length]) { pieces.push(join(text, keep.filter(([a, b]) => b > from && a < i).map(([a, b]) => [Math.max(a, from), Math.min(b, i)]))); from = i + 1; }
        const texts = pieces.filter(Boolean);
        if (!texts.length) throw fail("remove prints nothing, and no branch says the row has no pill");
        return { texts };
      }
      keeps = [keep];
    } else if (kind === "forms") {
      const o = at.find((m) => OPEN[m.mark]); const c = o ? closerOf(text, o.i) : -1;
      if (!o || c < 0) throw fail("forms: the row holds no bracket of the step's shapes");
      if (chosen.readings) {
        const head = [[0, o.i]];
        const inner = []; let from = o.i + 1;
        for (const m of at.filter((x) => x.i > o.i && x.i < c && !OPEN[x.mark])) { inner.push([[from, m.i]]); from = m.i + 1; }
        inner.push([[from, c]]);
        keeps = [head, ...inner];
      } else keeps = twoForms(text, o.i, c);
    } else throw fail(`kind ${kind} is unknown`);
  }
  if (cuts.length) {
    if (keeps.length !== 1) throw fail(`a step that offers forms cannot combine with a cut at [${cuts}]`);
    // the kept part divides at the cuts inside it; a cut outside it went with the text it stood in
    const [[a, b]] = keeps[0].length === 1 ? keeps[0] : [[Math.min(...keeps[0].map((r) => r[0])), Math.max(...keeps[0].map((r) => r[1]))]];
    const inner = cuts.filter((i) => i > a && i < b);
    const pieces = []; let from = a;
    for (const i of [...inner, b]) { pieces.push(join(text, keeps[0].filter(([x, y]) => y > from && x < i).map(([x, y]) => [Math.max(x, from), Math.min(y, i)]))); from = i + 1; }
    const texts = pieces.filter(Boolean);
    if (!texts.length) throw fail("the step prints nothing, and no branch says the row has no pill");
    return { texts };
  }
  const texts = keeps.map((keep) => join(text, keep));
  if (texts.some((t) => !t)) throw fail("the step prints nothing, and no branch says the row has no pill");
  return { texts };
};

/** every example of every option that carries a print step, run through the classifier: the failures, with the counts */
export const selfTestDeclaration = (decl, classify) => {
  const failed = []; let ran = 0;
  for (const b of decl.branches || []) for (const o of b.options || []) {
    if (!o.print) continue;
    for (const e of examplesOf(o)) {
      ran += 1;
      let got;
      try {
        const marks = (classify(e.row) || []).filter((m) => (b.shapes || []).includes(m.shape));
        const r = printUnder(o, e.row, marks, []);
        got = r ? r.texts : null;
      } catch (err) { got = `throws: ${err.message}`; }
      if (JSON.stringify(got) !== JSON.stringify(e.prints)) failed.push(`${decl.source_key}:${b.id}:${o.id} «${e.row.slice(0, 50)}» prints ${JSON.stringify(got)}, the example says ${JSON.stringify(e.prints)}`);
    }
  }
  return { ran, failed };
};
