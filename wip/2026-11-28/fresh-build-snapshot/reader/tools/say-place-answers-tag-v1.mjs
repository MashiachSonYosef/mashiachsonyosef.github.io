// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It prints what the entries and bridges hold under a tag;
// it writes nothing.
//
// say-place-answers-tag-v1
//
// Prints, for a tag of STEP's, what each dictionary says under it, in plain
// text: the bridge (how the tag reaches the source, and whether it is exact,
// ambiguous or absent), then the entry in the source's own structure.
//
//   node reader/tools/say-place-answers-tag-v1.mjs H1961 H1254A …
//   node reader/tools/say-place-answers-tag-v1.mjs --full H5704    (no shortening)
//
// It reads only the files the build wrote (entries/ and bridges/). It is the
// proof, as words, that a reader of those files can say at any tag: here is
// what each source says, by its own address.

import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readGzJson, printable } from "./place-answers-entries-lib-v1.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const full = args.includes("--full");
const dirArg = args.find((a) => a.startsWith("--dir="));
const OUT = resolve(dirArg ? dirArg.slice(6) : join(here, "..", "data", "place-answers-v1"));
const tags = args.filter((a) => !a.startsWith("--"));
if (!tags.length) { console.error("usage: say-place-answers-tag-v1.mjs [--full] <tag> …"); process.exit(2); }

const bridge = readGzJson(join(OUT, "bridges", "step-tag-to-entry.json.gz"));
const E = {};
const entries = (k) => (E[k] ||= readGzJson(join(OUT, "entries", k + ".json.gz")).entries);
const cut = (s, n) => { s = printable(String(s)).replace(/\s+/g, " ").trim(); return full || s.length <= n ? s : s.slice(0, n - 1) + "…"; };
const some = (list, n) => (full || list.length <= n ? list : list.slice(0, n).concat(["… " + (list.length - n) + " more"]));
const q = (s) => "«" + printable(String(s)).replace(/\s+/g, " ").trim() + "»";
const out = (s = "") => console.log(full || s.length <= 300 ? s : s.slice(0, 299) + "…");
const NAMES = {
  stepbible_tbesh_gloss: "STEP's TBESH", openscriptures_strongs: "Strong's (Open Scriptures)", wikisource_strongs_explicit_forms: "Strong's (Wikisource)",
  openscriptures_lexical_index: "Lexical Index", openscriptures_bdb_1906: "BDB (Open Scriptures)", unabridged_bdb_1906: "BDB (unabridged)",
  ubs_sdbh_hebrew_v0_9_2: "UBS dictionary", unfoldingword_uhal: "UHAL",
};
const ORDER = ["stepbible_tbesh_gloss", "openscriptures_strongs", "wikisource_strongs_explicit_forms", "openscriptures_lexical_index", "openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2", "unfoldingword_uhal"];

const rendering = (r) => (r.sign ? r.sign + " " : "") + r.t + (r.lost_sign_trace ? (r.wikisource_sign ? " [the file lost the sign; Wikisource writes " + r.wikisource_sign + "]" : " [opens after " + r.blanks_before + " blanks: a sign lost]") : "") + (r.lost_sign_trace_inside ? (r.as_wikisource_writes_it ? " [a sign lost inside; Wikisource writes " + r.as_wikisource_writes_it + "]" : " [blanks inside: a sign lost]") : "") + (r.unbalanced ? " [brackets do not balance in the file; held whole]" : "");

const say = {
  stepbible_tbesh_gloss(id, e) {
    out("    " + id + "  " + e.Hebrew + "  " + e.Transliteration + "  " + e.Morph + "  gloss " + q(e.Gloss) + "  first column " + e.eStrong + (e.relation ? "  relation: " + e.relation + " " + e.uStrong.trim() : ""));
  },
  openscriptures_strongs(id, e) {
    out("    " + id + "  " + e.w.t + " (" + e.w.pron + ")  " + e.w.pos + ", " + e.w.lang);
    if (e.source) out("      derivation: " + cut(e.source.t, 200));
    if (e.meaning) out("      meaning: " + cut(e.meaning.t, 300) + (e.meaning.defs ? "   [tagged: " + e.meaning.defs.map(([a, n]) => e.meaning.t.substr(a, n)).join(" | ") + "]" : ""));
    if (e.usage) {
      out("      his list of renderings (" + (e.usage.renderings || []).filter((r) => !r.empty).length + "): " + some((e.usage.renderings || []).filter((r) => !r.empty).map(rendering), 26).join(" | "));
      if (e.usage.after_list) out("      after the list (" + e.usage.after_list.kind + "): " + cut(e.usage.after_list.t, 200) + (e.usage.after_list.links.length ? "  → " + e.usage.after_list.links.join(", ") : ""));
    }
  },
  wikisource_strongs_explicit_forms(id, e) {
    out("    " + id + "  " + e.headline.t);
    out("      definition: " + cut(e.definition.t, 230));
    if (e.list_opens) out("      the list opens at " + q(e.list_opens.sign) + " (" + (e.renderings || []).filter((r) => !r.empty).length + "): " + some((e.renderings || []).filter((r) => !r.empty).map(rendering), 26).join(" | "));
    else out("      the edition writes no sign for the list here; the definition is held whole");
    if (e.after_list) out("      after the list: " + cut(e.after_list.t, 160));
    const fl = (e.form_lines || []).filter((x) => x.forms);
    if (fl.length) out("      spelled forms: " + fl.reduce((n, x) => n + x.forms.length, 0) + " (" + some(fl[0].forms, 8).join(", ") + ")  in " + fl.reduce((n, x) => n + x.verses.length, 0) + " verses listed");
  },
  openscriptures_lexical_index(id, e) {
    out("    " + id + "  " + e.w + "  " + (e.pos || "") + "  " + (e.def !== undefined ? q(e.def) : "(no gloss)") + "  → " + Object.entries(e.xref || {}).map(([k, v]) => k + " " + v).join(", ") + (e.etym ? "  etym " + (e.etym.type || "") + (e.etym.root ? " root " + e.etym.root : "") : ""));
  },
  openscriptures_bdb_1906(id, e) {
    const hw = e.w && e.w[0] ? e.w[0].t : "";
    out("    " + id + "  " + (e.numeral ? e.numeral + ". " : "") + hw + "  [" + (e.type === "root" ? "a ROOT entry" : "entry") + (e.form === "false" ? ", form not found (BDB's brackets)" : "") + "]  " + (e.pos || []).map((p) => p.t).join(" ") + "  status " + (e.status ? e.status.t : "?"));
    const show = (df) => {
      let t = df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t;
      let mark = "";
      if (df.phrase) mark += " [one phrase of " + df.phrase.n + " tags]";
      else if (df.joined) mark += " [the tag held only " + q(df.t) + "]";
      if (df.in_bracket && df.before_first_sense) mark += " [in a bracket of the opening]";
      else if (df.in_bracket && !e.senses) mark += " [in a bracket]";
      if (df.ref_next !== undefined) mark += " [" + (df.after_hebrew ? "wording at " : "→ ") + e.refs[df.ref_next].r + "]";
      return q(t) + mark;
    };
    const defs = e.defs || [];
    const seenPhrase = new Set();
    const list = (ds) => { const o = []; for (const df of ds) { if (df.phrase) { const k = df.phrase.at; if (seenPhrase.has(k)) continue; seenPhrase.add(k); } o.push(show(df)); } return o; };
    const top = defs.filter((d) => !d.sense);
    if (top.length) out("      before any sense: " + some(list(top), 14).join(", "));
    let shown = 0;
    const walk = (senses, path, label) => {
      senses.forEach((s, i) => {
        const p = path.concat(i);
        const name = (label ? label + " " : "") + (s.stems ? s.stems.join("/") + " " : "") + (s.n !== undefined ? s.n + "." : "");
        const mine = defs.filter((d) => d.sense && d.sense.length === p.length && d.sense.every((x, j) => x === p[j]));
        const refs = (e.refs || []).filter((r) => r.sense && r.sense.length === p.length && r.sense.every((x, j) => x === p[j]));
        if ((mine.length || refs.length) && (full || ++shown <= 8)) out("      sense " + (name.trim() || "(unnumbered)") + ": " + some(list(mine), 10).join(", ") + (refs.length ? "   cites " + some(refs.map((r) => r.r), 6).join(", ") : ""));
        if (s.senses) walk(s.senses, p, name.trim());
      });
    };
    walk(e.senses || [], [], "");
    if (!full && shown > 8) out("      … " + (shown - 8) + " more senses with a tag");
    const topRefs = (e.refs || []).filter((r) => !r.sense);
    if (topRefs.length) out("      cited outside every sense: " + some(topRefs.map((r) => r.r), 8).join(", "));
  },
  unabridged_bdb_1906(id, e) {
    e.blocks.forEach((blk, bi) => {
      if (!full && bi > 0) return;
      const h = blk.head;
      const its = (u, kinds) => (u.italics || []).filter((x) => kinds.includes(x.kind)).map((x) => q(x.t));
      out("    " + id + (bi ? " paragraph " + (bi + 1) : "") + "  " + (h.numeral ? h.numeral + ". " : "") + (h.headword ? h.headword.t : "") + "  [" + e.language + "; numbers in the record's column: " + (e.strong.join(" ") || "none") + "]");
      const bold = (h.bold || []).map((b) => b.t);
      if (bold.length) out("      bold in the head (grammar, stems): " + some(bold, 8).join(" | "));
      const main = its(h, ["main_gloss"]);
      out("      main gloss: " + (main.length ? main.join(", ") : "(the head carries none)") + (its(h, ["opening"]).length ? "   the head opens with " + its(h, ["opening"]).join(", ") : ""));
      const kinds = {};
      const tally = (u) => { for (const x of u.italics || []) kinds[x.kind] = (kinds[x.kind] || 0) + 1; for (const s of u.sub || []) tally(s); };
      tally(h); for (const p of blk.points || []) tally(p);
      const pts = blk.points || [];
      for (const p of some(pts.filter((x) => full || x.label !== undefined || (x.italics || []).some((y) => y.kind === "opening" || y.kind === "tagged_gloss")), 4)) {
        if (typeof p === "string") { out("      " + p); continue; }
        const o = its(p, ["opening", "tagged_gloss"]);
        const subs = (p.sub || []).map((s) => (s.label || "·") + " " + its(s, ["opening", "tagged_gloss"]).slice(0, 2).join(", ")).filter((x) => x.trim() !== "·");
        out("      point " + (p.label || "(no number)") + (p.div !== "point" ? " [" + p.div + "]" : "") + ": " + (o.length ? o.slice(0, 3).join(", ") : "(opens with no italic run)") + (subs.length ? "   sub-points: " + some(subs, 6).join("; ") : "") + (p.refs ? "   " + p.refs + " refs" : ""));
      }
      out("      italic runs by kind: " + Object.entries(kinds).map(([k, n]) => k + " " + n).join(", ") + (!full && e.blocks.length > 1 ? "   (the record holds " + e.blocks.length + " paragraphs; the first is shown)" : ""));
    });
  },
  ubs_sdbh_hebrew_v0_9_2(id, e) {
    out("    " + id + "  " + e.Lemma + "  codes on the entry: " + (e.StrongCodes.join(" ") || "none") + "  (" + e.BaseForms.length + " base forms)");
    e.BaseForms.forEach((b) => {
      out("      base form " + b.BaseFormID + "  " + (b.PartsOfSpeech || []).join(", "));
      for (const m of some(b.LEXMeanings, 3)) {
        if (typeof m === "string") { out("        " + m); continue; }
        const s = m.LEXSenses[0] || {};
        out("        sense " + m.LEXID + "  " + (s.Glosses || []).map(q).join(", ") + "  — " + cut(s.DefinitionShort || s.DefinitionLong || "", 90) + "  [" + (m.LEXReferences || []).length + " verses" + ((m.LEXReferences || []).length ? ", first " + m.LEXReferences[0].slice(0, 9) : "") + "]");
      }
    });
  },
  unfoldingword_uhal(id, e) {
    out("    " + id + "  " + (e.headword ? e.headword.t : "") + "  " + (e.part_of_speech ? e.part_of_speech.t : "") + (e.bdb_reference && e.bdb_reference.bdb_id ? "  BDB reference " + e.bdb_reference.bdb_id : ""));
    for (const s of e.senses) if (s.glosses && s.glosses.length) out("      sense " + s.label + (s.title ? " (" + s.title.t + ")" : "") + ": " + s.glosses.map((g) => q(g.t)).join("; ") + (s.citations && s.citations.length ? "   cites " + s.citations.length : ""));
  },
};

for (const tag of tags) {
  const row = bridge.tags[tag];
  out("══ " + tag + " ══");
  if (!row) { out("  STEP's files use no such tag."); out(); continue; }
  out("  STEP: stands on " + row.n[0] + " words (" + row.n[1] + " parts; the root of " + row.n[2] + ")");
  for (const key of ORDER) {
    const [how, ...ids] = row[key];
    out("  " + NAMES[key] + " — " + bridge.class_of[how].toUpperCase() + ": " + bridge.how[how].replace(/^(ambiguous|absent)[^:]*: /, "") + (ids.length > 1 ? " (" + ids.length + ")" : ""));
    // an ambiguous bridge with many entries: the first three in full, the rest by one line each
    ids.forEach((id, i) => {
      if (full || i < 3 || key !== "unabridged_bdb_1906") return say[key](id, entries(key)[id]);
      const e = entries(key)[id], h = e.blocks[0].head, g = (h.italics || []).find((x) => x.kind === "main_gloss");
      out("    " + id + "  " + (h.numeral ? h.numeral + ". " : "") + (h.headword ? h.headword.t : "") + "  [" + e.language + "; numbers: " + e.strong.join(" ") + "]  main gloss: " + (g ? q(g.t) : "(none)"));
    });
  }
  out();
}
