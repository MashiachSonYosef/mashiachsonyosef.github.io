// the tallies under two projections, from the hand-read samples
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const out = {};
for (const f of readdirSync(".").filter((x) => /^sample-.*\.tsv$/u.test(x))) {
  const set = f.replace(/^sample-|\.tsv$/gu, ""); const lines = readFileSync(f, "utf8").trim().split("\n"); const head = lines[0].split("\t");
  const rows = lines.slice(1).map((l) => Object.fromEntries(l.split("\t").map((v, i) => [head[i], v]))).filter((r) => r.call !== "set aside");
  const right = (r) => r.call === "R" || r.call === "S"; const isNew = (r) => r["one of the twelve prints the same words (machine)"] === "no";
  const sum = (rs) => ({ n: rs.length, right: rs.filter(right).length, in_verse: rs.filter((r) => r.call === "R").length, right_new: rs.filter((r) => right(r) && isNew(r)).length, wrong: rs.filter((r) => !right(r)).length });
  const graded = rows.filter((r) => r["block the card opens on"] === "whole word" || r["entry verdict"] === "this" || r["would-be grade of the piece's own pointing"] === "m");
  const own = rows.filter((r) => r["entry verdict"] === "this");
  const ownGraded = own;
  out[set] = { now: sum(rows), if_the_piece_were_graded: sum(graded), own_entry_only: sum(own), no_entry_rows: sum(rows.filter((r) => r["entry verdict"] !== "this")), whole_block: sum(rows.filter((r) => r["block the card opens on"] === "whole word")), piece_block: sum(rows.filter((r) => r["block the card opens on"] !== "whole word")) };
}
writeFileSync("sample-projections.json", JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(40), "now", `${v.now.right}/${v.now.n}`, "R", v.now.in_verse, "new&right", v.now.right_new, "wrong", v.now.wrong, "| graded", `${v.if_the_piece_were_graded.right}/${v.if_the_piece_were_graded.n}`, "new&right", v.if_the_piece_were_graded.right_new, "wrong", v.if_the_piece_were_graded.wrong, "| own", `${v.own_entry_only.right}/${v.own_entry_only.n}`, "new&right", v.own_entry_only.right_new, "wrong", v.own_entry_only.wrong, "| whole", `${v.whole_block.right}/${v.whole_block.n}`, "piece", `${v.piece_block.right}/${v.piece_block.n}`);
