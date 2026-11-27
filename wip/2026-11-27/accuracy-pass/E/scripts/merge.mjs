// Read-only: the hand-read calls laid on the samples, the page's own pill beside each, one tsv per set, and the tallies.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const samples = JSON.parse(readFileSync("samples2.json", "utf8"));
const norm = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase().replace(/\s+/gu, " ").trim();
const bare = (t) => norm(t).replace(/\[[^\]]*\]|<[^>]*>/gu, "").replace(/\s+/gu, " ").trim();
const probe = new Map(); for (const f of ["probe-samples.jsonl", "probe-samples2.jsonl"]) if (existsSync(f)) for (const l of readFileSync(f, "utf8").split("\n")) { if (!l) continue; const j = JSON.parse(l); probe.set(`${j.book}|${j.si}|${j.e}`, j); }
const onPage = (s) => {
  if (s.set.startsWith("held-")) return { status: "not served (read from the corpus lane's list)" };
  const p = probe.get(`${s.book}|${s.si}|${s.e}`); if (!p) return { status: "not probed" };
  if (p.fault || !p.pills) return { status: "not on the card", why: p.fault || "no card" };
  const want = norm(s.reading), wantBare = bare(s.reading);
  const mine = p.pills.filter((x) => x[1].split(/\s+/u).includes(s.m));
  let hit = mine.find((x) => norm(x[0]) === want), status = "exact";
  if (!hit) { hit = mine.find((x) => norm(x[0]).startsWith(want) || norm(x[0]).includes(want)); status = "with a note the page folds in"; }
  if (!hit) { hit = p.pills.find((x) => norm(x[0]) === wantBare && wantBare !== want); status = "printed without its bracket"; }
  if (!hit) return { status: "not on the card", why: /\d+[–-]\d+ /u.test(String(p.head || "")) ? `the card opens on a run (${p.head})` : (p.held || "").slice(0, 160) };
  return { status, page_pill: hit[0], page_by: hit[1], off_by_default_only: hit[2] ? "yes" : "no (one of the twelve prints the same pill)" };
};
const CALL = { R: "right for the word in this verse", S: "this word, a sense it has elsewhere", H: "another word spelled the same", M: "a modern or post-biblical sense", N: "a name", G: "a grammar note or dictionary apparatus", L: "wrong language", C: "wrong language, the cognate happens to fit", U: "unusable" };
const overrides = JSON.parse(readFileSync("judge/overrides.json", "utf8")), repl = JSON.parse(readFileSync("judge/replacements.json", "utf8"));
const manualFolded = { "english-wiktionary-hebrew-entries": { 54: "face (plural construct state form of פָּנִים; plural form of … with first-person singular personal pronoun as possessor פָּנִים)" } };
const dropReplacement = { "english-wiktionary-hebrew-entries": 62 };
const sets = [...new Set(samples.map((r) => r.set))];
const tally = {}; const esc = (t) => String(t ?? "").replace(/[\t\n\r]+/gu, " ");
for (const set of sets) {
  const codesFile = `judge/${set}.txt`; if (!existsSync(codesFile)) { console.log("NO CALLS", set); continue; }
  const codes = readFileSync(codesFile, "utf8").trim().split(/\s+/u);
  const rows = samples.filter((r) => r.set === set).sort((a, b) => a.i - b.i);
  const t = tally[set] = { set, n: 0, R: 0, S: 0, H: 0, M: 0, N: 0, G: 0, L: 0, C: 0, U: 0, set_aside: 0, on_page: 0, right_and_new_word: 0, right_and_literal_new: 0, wrong: 0, by_block: { "whole word": { n: 0, right: 0 }, "core piece": { n: 0, right: 0 } }, by_entry: {}, by_piece_grade: {}, books: new Set(), examples: {} };
  const lines = [["i", "book", "verse", "word number", "word", "block the card opens on", "block", "STEP's tag", "name place", "STEP's line", "reading sampled", "M", "source", "headwords", "entry verdict", "would-be grade of the piece's own pointing", "the page prints", "on the page", "one of the twelve prints the same words (machine)", "call", "call in words", "verse around"].join("\t")];
  for (const r of rows) {
    if (dropReplacement[set] === r.i) continue;
    let pg = r.set_aside ? r.page : onPage(r);
    if (manualFolded[set] && manualFolded[set][r.i]) pg = { status: "with a note the page folds in", page_pill: manualFolded[set][r.i] };
    let call = r.replacement ? (repl[set] || {})[r.i] : codes[r.i - 1];
    if (overrides[set] && overrides[set][r.i]) call = overrides[set][r.i];
    const aside = pg.status === "not on the card" || (r.set_aside && !(manualFolded[set] && manualFolded[set][r.i]));
    if (!call && !aside) throw new Error(`no call for ${set} #${r.i}`);
    lines.push([r.i, r.book, r.label, r.n, r.word, r.block_kind, r.block_pointed || r.block, (r.tags || []).join(" "), r.name_place ? "yes" : "", r.step_line, r.reading, r.m, r.source_label, (r.headwords || []).join(" | "), r.entry_verdict, r.would_be_piece_grade || "", pg.page_pill || "", pg.status + (pg.why ? `: ${pg.why}` : ""), r.new_word ? "no" : "yes", aside ? "set aside" : call, aside ? "not on the card as it opens; not counted" : CALL[call], r.verse_en].map(esc).join("\t"));
    if (aside) { t.set_aside += 1; continue; }
    t.n += 1; t[call] += 1; t.books.add(r.book); if (pg.page_pill) t.on_page += 1;
    const right = call === "R" || call === "S";
    if (right && r.new_word) t.right_and_new_word += 1; if (right && r.literal_new) t.right_and_literal_new += 1; if (!right) t.wrong += 1;
    const b = t.by_block[r.block_kind]; b.n += 1; if (right) b.right += 1;
    const e = t.by_entry[r.entry_verdict] || (t.by_entry[r.entry_verdict] = { n: 0, right: 0, R: 0, S: 0, H: 0, M: 0, other: 0 }); e.n += 1; if (right) e.right += 1; if ("RSHM".includes(call)) e[call] += 1; else e.other += 1;
    if (r.would_be_piece_grade) { const g = t.by_piece_grade[r.would_be_piece_grade] || (t.by_piece_grade[r.would_be_piece_grade] = { n: 0, right: 0 }); g.n += 1; if (right) g.right += 1; }
    (t.examples[call] || (t.examples[call] = [])).push(`${r.book} ${r.label}:${r.n} ${r.word} (STEP «${r.step_line}») «${String(pg.page_pill || r.reading).slice(0, 90)}»`);
  }
  t.books = t.books.size;
  writeFileSync(`sample-${set}.tsv`, lines.join("\n") + "\n");
}
writeFileSync("sample-tallies.json", JSON.stringify(tally, null, 1));
for (const t of Object.values(tally)) console.log(`${t.set}\tn=${t.n}\tR=${t.R} S=${t.S} H=${t.H} M=${t.M} N=${t.N} G=${t.G} L=${t.L} C=${t.C} U=${t.U}\taside=${t.set_aside}\tonpage=${t.on_page}\tright+new=${t.right_and_new_word}\twrong=${t.wrong}\twhole ${t.by_block["whole word"].right}/${t.by_block["whole word"].n} piece ${t.by_block["core piece"].right}/${t.by_block["core piece"].n}\tbooks=${t.books}\tentry ${JSON.stringify(Object.fromEntries(Object.entries(t.by_entry).map(([k, v]) => [k, `${v.right}/${v.n}`])))}\tgrade ${JSON.stringify(Object.fromEntries(Object.entries(t.by_piece_grade).map(([k, v]) => [k, `${v.right}/${v.n}`])))}`);
