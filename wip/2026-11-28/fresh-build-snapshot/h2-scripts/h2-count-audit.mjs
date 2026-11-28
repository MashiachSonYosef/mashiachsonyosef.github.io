// Scratch (builder H2): counts for the audit's two page matters, over every word of the card's files.
// 1. unfoldingWord's rows the card no longer draws: a number whose line says H (its entry not on hand).
// 2. the unabridged BDB's citations under «At this word»: each run of the citation by the kind the record's own file
//    gives it; how many lines print a run plain where they printed it inside «» before.
// node h2-count-audit.mjs <page dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const P = process.argv[2];
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const ix = JSON.parse(readFileSync(join(P, "index.json"), "utf8"));
const T = new Map(), U = new Map();
const tagLine = (tag) => { const f = String(Math.floor(Number(tag.slice(1, 5)) / 50)).padStart(3, "0"); if (!T.has(f)) T.set(f, gz(join(P, "entries", "t", `${f}.json.gz`))); return T.get(f).tags[tag] || null; };
const record = (id) => { const f = String(Math.floor(Number(id.slice(3)) / 50)).padStart(3, "0"); if (!U.has(f)) U.set(f, gz(join(P, "entries", "u", `${f}.json.gz`))); return U.get(f).entries[id]; };
const numberOf = (tag) => (/H\d{4}[A-Za-z]?/.exec(tag || "") || [null])[0];
const c = { words: 0, cards_with_numbers: 0, uhal_rows_before: 0, uhal_rows_not_drawn: 0, cards_losing_a_row: 0, cards_losing_every_uhal_row: 0, cards_keeping_a_uhal_row: 0,
  b_lines: 0, b_lines_with_words: 0, runs: {}, lines_now_with_a_plain_run: 0, lines_now_with_no_run_in_quotes: 0, lines_with_an_opening_ending_in_a_colon: 0 };
const colonOpenings = new Map();
for (const b of ix.books) for (const ch of b.chapters) {
  const doc = gz(join(P, b.book, `${ch}.json.gz`));
  for (const v of doc.verses) for (const e of v.e) {
    if (e.m !== undefined) continue; c.words += 1;
    const tags = []; for (const f of e.f) for (const p of (f.t || {}).p || []) { const n = numberOf(p[1]); if (n && !/^H9\d\d\d$/.test(n) && !tags.includes(n)) tags.push(n); }
    if (tags.length) c.cards_with_numbers += 1;
    let lost = 0, kept = 0;
    for (const tag of tags) { const l = tagLine(tag); if (!l) continue; c.uhal_rows_before += 1; if (l.b.unfoldingword_uhal[0] === "H") lost += 1; else kept += 1; }
    c.uhal_rows_not_drawn += lost; if (lost) c.cards_losing_a_row += 1; if (lost && !kept) c.cards_losing_every_uhal_row += 1; if (kept) c.cards_keeping_a_uhal_row += 1;
    for (const f of e.f) for (const x of (f.h || {}).b || []) {
      c.b_lines += 1; if (!x[6].length) continue; c.b_lines_with_words += 1;
      const r = record(x[0]); const blk = r.blocks[x[1]]; const top = x[2] < 0 ? blk.head : blk.points[x[2]]; const unit = x[3] < 0 ? top : top.sub[x[3]]; const its = unit.italics || [];
      let k = 0; const CITED = ["opening", "tagged_gloss", "main_gloss"]; const kinds = x[6].map((t) => { while (k < its.length && !(its[k].t === t && CITED.includes(its[k].kind))) k += 1; return k < its.length ? its[k++].kind : "not found"; });
      for (const kd of kinds) c.runs[kd] = (c.runs[kd] || 0) + 1;
      const meant = kinds.filter((kd) => kd === "main_gloss" || kd === "opening").length;
      if (meant < kinds.length) c.lines_now_with_a_plain_run += 1; if (!meant) c.lines_now_with_no_run_in_quotes += 1;
      x[6].forEach((t, j) => { if (kinds[j] === "opening" && /:\s*$/.test(t)) { c.lines_with_an_opening_ending_in_a_colon += 1; colonOpenings.set(t.trim(), (colonOpenings.get(t.trim()) || 0) + 1); } });
    }
  }
}
console.log(JSON.stringify(c, null, 1));
console.log("openings that end in a colon, the most frequent:", [...colonOpenings].sort((a, b) => b[1] - a[1]).slice(0, 12));
