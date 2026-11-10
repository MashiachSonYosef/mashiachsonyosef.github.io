// Synthesis lane · the count stamp, in one place
//
// RULE: count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one
// (a module: it writes nothing and is the ledger for no letter; the tools
// that read it declare their own)
//
// THE COUNT IS OUR STAMP OF PROOF, NOT A GATE (the owner, 2026-09-05). A zone
// is measured on every named axis, and where the witness record holds the
// figures other men reached for the book, each figure is set beside ours with
// its difference, sign and all. A difference withholds nothing: it is shown
// as a difference, in the witness's own name.
//
// The stamp was computed inside the zone builder alone. A witness record that
// is corrected has to reach the zones already built, and a second copy of the
// rule in a second tool is how a stamp comes to say two things, so the rule
// stands here and both read it: tools/build-zone.mjs when a zone is built,
// tools/restamp-zone-v1.mjs when the record a built zone was stamped from has
// changed. Nothing here measures: the caller hands over the zone's measure
// (tools/bookword-measure-v1.mjs), so the stamp can only say what the bytes
// are.
export const COUNT_STAMP_RULE = "count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one";
const SAYS = "ours is the zone measured as built; theirs is the figure the witness published, on the axis named; the difference is ours less theirs. Nothing is adjusted and nothing is withheld for differing.";

// slug: the zone's work id, as the witness record keys its books
// measure: the zone measured (measureZone)
// witnesses: the parsed witness record, or null where none was given
// record: the witness record's file name; sha256: its hash
// measuredBy, axes: the measure's rule id and its axes, as the measure states them
// refuse(ok, code, detail): the caller's own refusal
export const countStampOf = ({ slug, measure, witnesses, record, sha256, measuredBy, axes, refuse }) => {
  const entry = witnesses && witnesses.books && witnesses.books[slug];
  const rows = [];
  const measured = new Set();
  for (const r of (entry ? entry.rows : [])) {
    const ours = measure[r.axis];
    refuse(Number.isInteger(ours), "WITNESS_AXIS_UNKNOWN", `${slug}: ${r.axis}`);
    const delta = ours - r.figure;
    rows.push({ measure: r.measure, axis: r.axis, witness: r.witness, class: r.class, theirs: r.figure, ours, delta, verdict: delta === 0 ? "EXACT" : "DIFFERS",
      ...(r.layer ? { layer: r.layer } : {}), ...(r.group_note ? { note: r.group_note } : {}), source: r.source });
    measured.add(r.measure);
  }
  for (const m of ["verses", "words", "letters"]) if (!measured.has(m)) rows.push({ measure: m, axis: m, witness: null, class: "NO_WITNESS", theirs: null, ours: measure[m], delta: null, verdict: "NO_WITNESS" });
  return {
    rule_id: COUNT_STAMP_RULE,
    measured_by: measuredBy,
    axes,
    ours: { verses: measure.verses, words: measure.words, words_written: measure.words_written, letters: measure.letters, letters_read: measure.letters_read, c0_on: measure.c0_on, c0_off: measure.c0_off, kq_sites: measure.kq_sites, marks: measure.marks },
    witnesses: witnesses ? { record, sha256, section: entry ? entry.section : null, rows_held: entry ? entry.rows.length : 0 } : null,
    rows,
    says: SAYS,
  };
};
