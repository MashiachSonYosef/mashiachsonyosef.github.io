// Falsification probes over the dividing shapes; reads dividing-occurrences.json written by verify.mjs and the source rows for def context.
// usage: node falsify.mjs <by-source jsonl> <outdir>
import fs from "node:fs"; import path from "node:path";
const [,, SRC, OUT] = process.argv;
const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const div = JSON.parse(fs.readFileSync(path.join(OUT, "dividing-occurrences.json"), "utf8"));
const byKR = new Map(); for (const r of rows) byKR.set(r.key + "\u0001" + r.route, r);
const win = (t) => t.length > 60 ? t.slice(0, 60) : t;
const routesOf = (sh) => { const m = new Map(); for (const e of div[sh]) { const k = e.key + "\u0001" + e.route; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].map(([k, n]) => ({ key: k.split("\u0001")[0], route: k.split("\u0001")[1], commas: n })); };
const piecesOf = (s) => { const out = []; let d = 0, st = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === "(") d++; else if (c === ")") d--; else if ((c === "," || c === ";") && d === 0) { out.push(s.slice(st, i).trim()); st = i + 1; } } out.push(s.slice(st).trim()); return out; };
const W = (p) => p.split(/\s+/u).filter(Boolean);
const PREP = new Set(["in","of","with","to","from","at","by","on","upon","for","into","after","toward","towards","under","over"]);
const probes = {};
const P = (name, sh, r, note) => { ((probes[name] ??= {})[sh] ??= []).push({ key: r.key, route: win(r.route), commas: r.commas, note }); };
for (const sh of ["comma.between_glosses", "comma.between_glosses_after_head_word"]) {
  for (const r of routesOf(sh)) {
    const ps = piecesOf(r.route); const row = byKR.get(r.key + "\u0001" + r.route);
    // probe 1: a piece longer than four words (prose, not a gloss)
    if (ps.some((p) => W(p).length > 4)) P("p1_piece_over_4_words", sh, r);
    // probe 2: a later piece that is a lone adverb (-ly) or opens on a preposition: a complement of the first gloss's verb, not a rendering
    if (r.key !== "ב" && ps.slice(1).some((p) => (W(p).length === 1 && /ly$/u.test(p)) || PREP.has(W(p)[0]))) P("p2_later_piece_adverb_or_prep_complement", sh, r);
    // probe 3: right-distribution: every piece but the last is one word and the last has 2+ words (a shared noun or head after the list)
    if (ps.length >= 2 && ps.slice(0, -1).every((p) => W(p).length === 1) && W(ps.at(-1)).length >= 2) P("p3_shared_tail_candidate", sh, r);
    // probe 4: the route starts mid-gloss in its definition (' or ' / '-' / a letter right before it)
    if (row) { const at = row.def.indexOf(row.route); const before = at > 0 ? row.def.slice(Math.max(0, at - 4), at) : ""; if (at > 0 && (/\bor $/u.test(before) || /\p{L}$/u.test(before) || /-$/u.test(before))) P("p4_route_starts_mid_gloss", sh, r, JSON.stringify(before)); if (at < 0) P("p4_route_not_found_in_def", sh, r); }
    // probe 5: a piece that is capitalized or non-English (cited words rather than renderings)
    if (ps.slice(0).some((p) => /^\p{Lu}/u.test(p))) P("p5_capitalized_piece", sh, r);
    // probe 6: a later piece repeats a word of the first piece's tail as its object/apposition: second piece opens on a noun phrase while the first piece is a participle phrase ('-ing')
    if (ps.length >= 2 && W(ps[0]).some((w) => /ing$/u.test(w)) && W(ps[0]).length >= 3) P("p6_first_piece_participle_phrase", sh, r);
    // probe 7: duplicate pieces (the same gloss twice)
    if (new Set(ps.map((p) => p.toLowerCase())).size < ps.length) P("p7_duplicate_piece", sh, r);
    // probe 8: a piece that ends on a preposition or article (an unfinished gloss)
    if (r.key !== "ב" && ps.some((p) => /\b(the|a|an|of|to|and|or)$/u.test(p))) P("p8_piece_ends_on_function_word", sh, r);
  }
}
// semicolon probes
for (const e of div["semicolon.between_senses"]) {
  const row = byKR.get(e.key + "\u0001" + e.route); const at = row.def.indexOf(row.route);
  const sides = e.route.split(";").map((x) => x.trim());
  P("s1_sides", "semicolon.between_senses", { key: e.key, route: e.route, commas: 1 }, JSON.stringify({ sides, sides_words: sides.map((x) => W(x).length), def_has_semicolon_at_route: at >= 0 && row.def.slice(at, at + row.route.length).includes(";"), def_window_before: row.def.slice(Math.max(0, at - 30), at), def_window_after: row.def.slice(at + row.route.length, at + row.route.length + 20) }));
}
const summary = {}; for (const [n, o] of Object.entries(probes)) for (const [sh, l] of Object.entries(o)) summary[n + " @ " + sh] = { routes: l.length, commas: l.reduce((a, b) => a + b.commas, 0) };
fs.writeFileSync(path.join(OUT, "falsify.json"), JSON.stringify({ summary, probes }, null, 1));
console.log(JSON.stringify(summary));
for (const [n, o] of Object.entries(probes)) for (const [sh, l] of Object.entries(o)) { console.log("##", n, sh); for (const x of l) console.log("  " + x.key + " | " + x.route + (x.note ? "  " + x.note : "")); }
