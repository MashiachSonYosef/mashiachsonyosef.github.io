// The rows of the store that serve a text of the second relay's list, as they stand before the slot is written:
// how many there are, how many a ledger divides (slot 7), how many carry a print slot (slot 8), where a close falls
// against a cut, and how many serve a text of the words-taken-out list. It reads; it changes nothing.
// node made-spaces-v2-rows.mjs <reader dir> <list file> <words-taken-out file> <m id>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, listFile, outFile, M] = process.argv.slice(2);
const read = (f) => readFileSync(f, "utf8").split("\n").filter(Boolean).map((s) => JSON.parse(s));
const list = new Map(read(listFile).map((l) => [l.text, l]));
const out = new Map(read(outFile).map((l) => [l.text, l]));
const T = { rows_of_the_source: 0, rows_serving_a_listed_text_in_field_1: 0, in_field_2: 0, of_those_divided: 0, with_a_print_slot: 0, with_a_piece_flag: 0, a_close_at_a_cut: 0,
  rows_serving_a_text_with_a_word_taken_out: 0, of_those_also_listed: 0, texts_in_both_lists: 0, closes_at_a_taken_out_place: 0, field_1_is_not_field_2: 0, already_slotted: 0 };
for (const [text, l] of list) if (out.has(text)) { T.texts_in_both_lists += 1; T.closes_at_a_taken_out_place += l.closes.filter((c) => out.get(text).at.includes(c)).length; }
const eg = { divided: [], print: [] };
const lengths = {};
for (const f of readdirSync(join(reader, "data", "route-store", "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(reader, "data", "route-store", "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    if (String(row[3]) !== M) continue;
    T.rows_of_the_source += 1;
    lengths[row.length] = (lengths[row.length] || 0) + 1;
    if (String(row[1]) !== String(row[2] ?? "")) T.field_1_is_not_field_2 += 1;
    if (row.length > 9) T.already_slotted += 1;
    const l = list.get(String(row[1]));
    if (out.has(String(row[1]))) { T.rows_serving_a_text_with_a_word_taken_out += 1; if (l) T.of_those_also_listed += 1; }
    if (list.has(String(row[2] ?? ""))) T.in_field_2 += 1;
    if (!l) continue;
    T.rows_serving_a_listed_text_in_field_1 += 1;
    if (row[5] === 1) T.with_a_piece_flag += 1;
    if (Array.isArray(row[7])) { T.of_those_divided += 1; if (l.closes.some((c) => row[7].includes(c))) T.a_close_at_a_cut += 1; if (eg.divided.length < 4) eg.divided.push({ k, text: row[1], closes: l.closes, cuts: row[7], prints: row[8] ?? null }); }
    if (Array.isArray(row[8])) { T.with_a_print_slot += 1; if (eg.print.length < 6) eg.print.push({ k, text: row[1], closes: l.closes, cuts: row[7], prints: row[8] }); }
  }
}
console.log(JSON.stringify(T, null, 1));
console.log("row lengths of the source:", JSON.stringify(lengths));
for (const [name, list2] of Object.entries(eg)) for (const e of list2) console.log(name, JSON.stringify(e));
