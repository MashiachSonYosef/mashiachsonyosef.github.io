// Read-only: lays the hand sample (hand-sample.jsonl) out for reading, one block a word, and writes
// chain-read-by-hand.tsv. The columns a machine can fill are filled here; the column "read_by_hand" is the note made
// reading the block (notes-by-hand.json beside this script: { "<book> <label> <n>": "note" }).
// Usage: node hand-table.mjs [book] [--print]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const { labelsFor, titleOf } = await import(join(R, "tools/card-readings-v1.mjs"));
const labels = labelsFor(R);
const sha12 = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const PRINT = process.argv.includes("--print");
const file = join(OUT, process.argv.includes("--in") ? process.argv[process.argv.indexOf("--in") + 1] : "hand-sample.jsonl");
const notes = existsSync(join(OUT, "notes-by-hand.json")) ? JSON.parse(readFileSync(join(OUT, "notes-by-hand.json"), "utf8")) : {};
const rows = readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const short = (l) => String(l || "").replace("STEP Bible Translators Amalgamated Hebrew OT aligned component translation", "STEP-TAHOT[M4]").replace("Strong's Hebrew Dictionary via Open Scriptures", "Strong-OS").replace("Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource", "Strong-WS").replace("Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures", "BDB-OS").replace("Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source", "BDB-unabr").replace("MACULA exact Hebrew morph surfaces with Cherith English definitions", "MACULA[M3]").replace("Semantic Dictionary of Biblical Hebrew via HiperBiblia", "SDBH").replace("UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses", "UBS").replace("STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column", "TBESH").replace("Open Scriptures Hebrew Lexical Index", "OSHLI").replace("unfoldingWord Hebrew-Aramaic Lexicon", "UHAL").replace("BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas", "BiblicalTools");
const out = [["book", "place", "word", "hebrew", "chain_page_word_fp", "word_fp_recomputed", "chain_page_key_fp", "key_on_the_card", "links_the_page_prints", "links_recomputed_reading/source", "count_at_rest", "line_under_the_word", "line_credit_chip", "card_opens_on", "pressed_pill", "pressed_pill_title", "pressed_is_chain_link_number", "pressed_is_the_line", "record_foot_names", "lines_above_the_pills_on_the_card", "lines_above_the_pills_not_in_the_chain", "machine_flags", "read_by_hand"]];
for (const r of rows) {
  if (only && r.book !== only) continue;
  const c = r.card, cp = r.chain_page || {}, ck = { ...(r.check || {}) };
  // the key the chain page prints beside the word: is it printed anywhere on the card (a block's or a division's button)?
  if (cp.key) {
    const where = ["blocks", "divisions", "forms", "chain_words", "chain"].find((k) => (c.rows[k] || []).some((b) => sha12(b[0]) === cp.key));
    ck.key = where ? `same as a ${where === "blocks" ? "block" : where === "divisions" ? "division" : where} button` : sha12(r.k) === cp.key ? "NOT-ON-THE-CARD, same as the zone's key" : "DIFFERS";
  }
  const pressedAt = c.pills.findIndex((p) => p[3]);
  const pressed = pressedAt >= 0 ? c.pills[pressedAt] : null;
  const pt = pressed ? titleOf(pressed[1], labels.known) : null;
  const blocks = c.rows.blocks.map((b) => `${b[0]}${b[1] ? "*" : ""}`).join(" ");
  const divs = c.rows.divisions.map((b) => `${b[0]}${b[1] ? "*" : ""}`).join(" | ");
  const above = c.above.filter((a) => /r-piece|r-dflt/u.test(a[0]));
  const notIn = c.above.filter((a) => /r-dflt/u.test(a[0]));
  const line = (c.line || "").replace(/​/gu, "␣gap");
  const flags = [];
  if (ck.word !== "same") flags.push(`word ${ck.word}`);
  if (ck.key && !ck.key.startsWith("same")) flags.push(`key ${ck.key}`);
  if ((ck.links || []).some((x) => x !== "r/s")) flags.push(`links ${ck.links.join(" ")}`);
  if (ck.count !== "same") flags.push(`count: ${ck.count}`);
  if (pressedAt >= 6) flags.push(`the pressed pill is link ${pressedAt + 1}, past the six the chain page prints`);
  if (pressed && c.line !== null && pressed[0] !== c.line) flags.push("the pressed pill is not the whole line");
  if (pressed && pt && !/STEP Bible Translators Amalgamated/u.test(pt.label) && /STEP Bible Translators Amalgamated/u.test(c.line_chip_title)) flags.push("the pressed pill's title names another source than the line's chip");
  if (notIn.length) flags.push(`${notIn.length} line(s) of the sources at the place stand on the card and not in the chain`);
  const key = `${r.book} ${r.label} ${r.n}`;
  out.push([r.book, r.label, r.n, r.s, cp.word || "", ck.word || "", cp.key || "", ck.key || "", (cp.links || []).length, (ck.links || []).join(" "), ck.count || "", line, `${c.line_chip} · ${c.line_chip_id} · ${short(c.line_chip_title).slice(0, 60)}`, divs ? `${divs} · blocks ${blocks}` : `blocks ${blocks}`, pressed ? pressed[0] : "", pressed ? short(pressed[1]) : "", pressedAt >= 0 ? pressedAt + 1 : "", pressed && c.line !== null ? (pressed[0] === c.line ? "yes" : "no") : "", c.record ? short(c.record[1]).slice(0, 110) : "", above.map((a) => short(a[1])).join(" ‖ ").slice(0, 400), notIn.length, flags.join("; "), notes[key] || "read; the links the chain page prints are the card's first pills in order, reading and source, and nothing more than the flags beside this stood out"].map((v) => String(v ?? "").replace(/[\t\n\r]+/gu, " ")));
  if (process.argv.includes("--brief")) {
    const dfl = c.above.filter((a) => /r-dflt/u.test(a[0])).map((a) => short(a[1]).replace(/^here /u, "").replace(/ (CC BY[-A-Z ]* 4\.0|Public Domain)$/u, "").slice(0, 60)).join(" ‖ ");
    const hereL = c.above.filter((a) => a[0] === "r-piece").map((a) => short(a[1]).replace(/ CC BY 4\.0$/u, "")).join("");
    console.log(`■ ${key} ${r.s} | line «${line}» | ${divs ? `div ${divs} · ` : ""}blk ${blocks}${c.rows.forms.length ? " · forms" : ""}${c.rows.chain.length ? " · run" : ""} | ${hereL || "(no here line)"} | pressed #${pressedAt + 1}/${c.pills.length} «${pressed ? pressed[0].slice(0, 50) : ""}» {${pressed ? short(pressed[1]).slice(0, 30) : ""}} | foot ${c.record ? short(c.record[1]).replace(/ License terms.*$/u, "").slice(0, 60) : "-"} | ${dfl} | chain: w ${ck.word === "same" ? "ok" : ck.word} k ${String(ck.key).startsWith("same") ? "ok" : String(ck.key).slice(0, 15)} links ${(ck.links || []).every((x) => x === "r/s") ? `${(ck.links || []).length} ok` : (ck.links || []).join(" ")} count ${ck.count === "same" ? "ok" : ck.count}`);
  }
  if (process.argv.includes("--tiny")) {
    const dfl = c.above.filter((a) => /r-dflt/u.test(a[0])).map((a) => short(a[1]).replace(/^here /iu, "").replace(/ (CC BY[-A-Z ]* 4\.0|Public Domain)$/u, "").slice(0, 44)).join(" ‖ ");
    const shownHere = c.above.some((a) => a[0] === "r-piece" && /^HERE /u.test(a[1]));
    const bad = [ck.word === "same" ? "" : `w ${ck.word}`, String(ck.key).startsWith("same") || String(ck.key).startsWith("(no") ? "" : `k ${ck.key}`, (ck.links || []).every((x) => x === "r/s") ? "" : `links ${(ck.links || []).join(" ")}`, ck.count === "same" ? "" : ck.count].filter(Boolean).join("; ");
    console.log(`■ ${r.book.slice(0, 4)} ${r.label}:${r.n} ${r.s} «${line}» ${divs ? `[${blocks}]` : ""}${c.rows.forms.length ? "[kq]" : ""}${c.rows.chain.length ? "[run]" : ""} #${pressedAt + 1}/${c.pills.length} «${pressed ? pressed[0].slice(0, 36) : ""}» {${pressed ? short(pressed[1]).replace(/^(no source year|\d+) · /u, "").slice(0, 14) : ""}}${shownHere ? " SHOWN" : ""} | ${dfl}${bad ? ` | CHAIN: ${bad}` : ""}`);
  }
  if (PRINT) {
    console.log(`■ ${key} ${r.s}  [chain page: word ${cp.word} ${ck.word}; key ${cp.key} ${ck.key}; links ${(ck.links || []).join(" ")}; ${cp.more}; count ${ck.count}]`);
    console.log(`  line «${line}» chip «${c.line_chip}» id ${c.line_chip_id} title «${short(c.line_chip_title).slice(0, 70)}»${c.joined ? " (in a joined run)" : ""} · head «${c.head.slice(0, 60)}» · entry ${c.entry}`);
    console.log(`  opens on: ${divs ? `divisions ${divs} · ` : ""}blocks ${blocks}${c.rows.forms.length ? ` · forms ${c.rows.forms.map((b) => `${b[0]}${b[1] ? "*" : ""}`).join(" | ")}` : ""}${c.rows.chain.length ? ` · run ${c.rows.chain.map((b) => `${b[0]}${b[1] ? "*" : ""}`).join(" | ")}` : ""}`);
    for (const a of c.above) console.log(`  above: [${a[0]}] ${short(a[1]).slice(0, 170)}`);
    console.log(`  pills ${c.pills.length}: ${c.pills.slice(0, 6).map((p, i) => `${i + 1}${p[3] ? "*" : ""} «${p[0].slice(0, 40)}» {${short(p[1]).slice(0, 34)}}`).join("  ")}${pressedAt >= 6 ? `  …  ${pressedAt + 1}* «${pressed[0].slice(0, 40)}» {${short(pressed[1]).slice(0, 34)}}` : ""}`);
    console.log(`  record: ${c.record ? `${short(c.record[0]).slice(0, 150)} ⟦foot⟧ ${short(c.record[1]).slice(0, 130)}` : "(none)"}`);
    if (flags.length) console.log(`  FLAGS: ${flags.join("; ")}`);
  }
}
if (!only) writeFileSync(join(OUT, "chain-read-by-hand.tsv"), out.map((r) => r.join("\t")).join("\n") + "\n");
console.log(`${out.length - 1} words laid out`);
