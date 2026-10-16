#!/usr/bin/env node
// check-blob-every-v1 · every "+" word can wear its blob: its pieces tile its letters
//
// GUARDS: blob-every-rule-v1-every-word-with-a-plus-wears-a-blob-piece-for-piece
// LEDGER: -
// no frame letter. This writes nothing: it reads the 39 zones.
//
// The owner, 2026-10-16: "every word should be blobbed unless its literally
// zero compspan like the i in i kings, but any prefix, any compspan, any
// megacompspan, anything with a plus sign should all be blobbed"; and of a
// hidden sign, "my vote is to leave it like that: and + + well-being, rather
// than leave stuff out". The page draws a blob per piece where the word's
// own division answers the line's parts (zone.html divisionFor). This check
// asks the data the same question for every word of the 39 books, lone and
// in a chain: the place's own pieces (pg), with a sign kept as a gap under
// signs off, must tile the word's letters piece for piece; a word they do
// not tile would stand bare with a "+" on its line, which the rule forbids.
//
//   E1  every lone word whose line splits at "+" finds a division that tiles it
//   E2  every chain word whose line splits at "+" finds one too
//   E3  the count of "+" words is not small (the rule is doing work)
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };
const books = JSON.parse(readFileSync("data/masoretic-marks-v1.json", "utf8")).books;
const ALEF = String.fromCharCode(0x5d0), TAV = String.fromCharCode(0x5ea);
const L = (s) => [...String(s || "")].filter((c) => c >= ALEF && c <= TAV).join("");
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
const tot = { lone: { plus: 0, tied: 0, ex: [] }, chain: { plus: 0, tied: 0, ex: [] }, words: 0 };
for (const b of books) {
  const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.bin`)).toString("utf8"));
  const spans = z.spans || {};
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (w.mark || w.kq) continue;
    tot.words += 1;
    const pj = w.presentation_join;
    const t = pj && (pj.join_next_without_separator || pj.join_previous_without_separator) ? tot.chain : tot.lone;
    const pg = Array.isArray(w.pg) ? w.pg : null;
    if (!pg) continue;
    const pieces = pg.map((p) => spanJoin(String((p && p.g) || "")));
    const parts = pieces.every(signOnly) ? pieces : pieces.map((x) => (signOnly(x) ? "​" : x));
    if (parts.length < 2) continue;
    t.plus += 1;
    const own = L(w.s);
    const fits = (cs) => cs && cs.length === parts.length && cs.every(Boolean) && cs.join("") === own;
    const row = spans[w.k]; const rowCells = row && Array.isArray(row[0]) ? row[0].map(L) : null;
    if (fits(pg.map((p) => L(p && p.k))) || fits(rowCells)) t.tied += 1;
    else if (t.ex.length < 3) t.ex.push(`${b} ${sec.label} ${w.s}: pieces ${pg.map((p) => L(p && p.k)).join("|")}`);
  }
}
check("E1  every lone word whose line splits at \"+\" finds a division that tiles it", tot.lone.plus > 0 && tot.lone.tied === tot.lone.plus, `${tot.lone.tied} of ${tot.lone.plus}${tot.lone.ex.length ? ` · ${tot.lone.ex.join("; ")}` : ""}`);
check("E2  every chain word whose line splits at \"+\" finds one too", tot.chain.plus > 0 && tot.chain.tied === tot.chain.plus, `${tot.chain.tied} of ${tot.chain.plus}${tot.chain.ex.length ? ` · ${tot.chain.ex.join("; ")}` : ""}`);
check("E3  the rule is doing work", tot.lone.plus + tot.chain.plus > tot.words / 4, `${tot.lone.plus + tot.chain.plus} \"+\" words of ${tot.words}`);
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
