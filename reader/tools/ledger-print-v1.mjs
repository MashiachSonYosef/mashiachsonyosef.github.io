// GUARDS: ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
// LEDGER: M R
// THE PRINT STEP: the one step of the page's own that a ledger's branch asks for.
//
// A ledger's classifier can only say what a mark is; a declaration can cut a
// row at a mark and can hold it whole, and it can do nothing else. Yet 41 of
// the ledgers' branches ask a question whose answer is neither: a filing tag
// this corpus's own script wrote («he (n, wikt, en 2)»), a name with its
// pointer («Merari. See also»), a bracket that offers a second form
// («fool (ish)»), a row that renders nothing («<the>», «mega-», «[Obj.]»).
// Each such branch says, in its own words, what the page prints under each
// answer and that "it needs a step of its own". This module is that step.
//
// One entry per branch, keyed source:branch. An entry names the option it
// serves and gives, from the branch's own marks on a row, what the page
// prints for that row: a list of texts, each a run of the route's own
// characters in their own order (kept ranges of the text, nothing added, so
// the licence beside it still names the author of every character), or no
// text at all (no pill). The branch's own examples, from its "means", are the
// fixtures below; selfTest() runs them, and apply-ledger-divisions refuses to
// write a store while any fails.
//
// What a row prints is written into row[8] by apply-ledger-divisions: [] for
// no pill, [text, ...] for the texts. The store (gloss-store-v1 readingsOf)
// and the page (zone.html readingsOfRow) read the slot and nothing else.
//
// A ledger whose branches offer only "divides" and its resting option has no
// entry here; a branch answered with its resting option has no effect here.
//
// RETIRED, 7 November 2026: the table is empty. Every answered branch now
// carries its print step in its own declaration (ask v1.2, read by
// tools/ledger-print-from-declaration-v1.mjs): 35 entries left on the
// reissues of that morning, and the last two, biblicaltools_living_lexicon
// B05 and panlex_hebrew_english_definitions_20250201 B02, on the corpus
// lane's v135.2 and v123.2, which list every served text those branches reach
// with what it prints (rows_print), each line as this table printed it. The
// module stays so the apply tool and its check can say so: an answered branch
// whose declaration carries no step finds no entry here and is refused.

/** the printed text of kept ranges: the kept characters joined, runs of spaces (U+0020 alone) collapsed, trimmed */
const collapse = (s) => s.replace(/ {2,}/gu, " ").trim();
const join = (text, keep) => collapse(keep.map(([a, b]) => text.slice(a, b)).join(""));
/** a branch's own word that a row prints no pill */
const NONE = Symbol("no pill");

/** One entry per branch, keyed source:branch: { option, kind, print(text, marks) }. Empty since 7 November 2026. */
export const PRINT_RULES = {};

/** What a row prints under its answered branch: { texts } ([] = no pill), or null where the rule does not reach the row.
 *  `marks` are the row's classified marks (every shape); `cuts` the row's dividing marks (row[7]); the rule's kind says
 *  whether the two may combine. */
export const printOf = (ruleKey, text, marks, cuts = []) => {
  const rule = PRINT_RULES[ruleKey];
  if (!rule) return null;
  const keeps = rule.print(text, marks);
  if (keeps === null) return null;
  if (rule.kind === "none" || keeps === NONE) return { texts: [] };
  // a step that keeps, offers forms or removes marks prints SOMETHING: a row it
  // would print nothing for is an error the caller refuses on, never a silent
  // no pill (the review of 6 November: an empty kept range was counted as "no
  // pill" and no branch had said so)
  const nothing = () => new Error(`${ruleKey} (${rule.option}, ${rule.kind}) prints nothing for «${text.slice(0, 60)}», and no branch says the row has no pill`);
  if (!keeps.length) throw nothing();
  if (cuts.length) {
    if (rule.kind !== "remove") throw new Error(`${ruleKey} (${rule.option}, ${rule.kind}) cannot combine with a cut at [${cuts}] on «${text.slice(0, 60)}»`);
    const [keep] = keeps;
    const pieces = []; let from = 0;
    for (const i of [...cuts, text.length]) { pieces.push(join(text, keep.filter(([a, b]) => b > from && a < i).map(([a, b]) => [Math.max(a, from), Math.min(b, i)]))); from = i + 1; }
    const texts = pieces.filter(Boolean);
    if (!texts.length) throw nothing();
    return { texts };
  }
  const texts = keeps.map((keep) => join(text, keep));
  if (texts.some((t) => !t)) throw nothing();
  return { texts };
};

/** the branch's own examples, from its "means": none while the table is empty */
export const FIXTURES = [];

/** Runs every fixture through the ledger's own classifier. `classifiers` maps source key -> classify(text); a fixture
 *  whose classifier is not given is skipped and named. Returns { failed: [...], skipped: [...] }. */
export const selfTest = (classifiers, declarations) => {
  const failed = [], skipped = [];
  for (const [ruleKey, text, expect] of FIXTURES) {
    const [source, branch] = ruleKey.split(":");
    const classify = classifiers.get(source);
    if (!classify) { skipped.push(ruleKey); continue; }
    const decl = declarations.get(source);
    const b = (decl.branches || []).find((x) => x.id === branch);
    const shapes = new Set(b ? b.shapes || [] : []);
    let marks;
    try { marks = classify(text).filter((m) => shapes.has(m.shape)); } catch (e) { failed.push(`${ruleKey} «${text}»: the classifier refuses it: ${e.message}`); continue; }
    let got;
    try { got = printOf(ruleKey, text, marks, []); } catch (e) { failed.push(`${ruleKey} «${text}»: ${e.message}`); continue; }
    const texts = got ? got.texts : null;
    if (JSON.stringify(texts) !== JSON.stringify(expect)) failed.push(`${ruleKey} «${text}»: expected ${JSON.stringify(expect)}, got ${JSON.stringify(texts)}`);
  }
  return { failed, skipped, ran: FIXTURES.length - skipped.length };
};
