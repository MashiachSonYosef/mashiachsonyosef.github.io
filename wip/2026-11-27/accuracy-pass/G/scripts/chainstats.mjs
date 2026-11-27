// Read-only: what the twelve chain files hold, counted from the files alone, and what each chain page prints of it.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const OUT = dirname(fileURLToPath(import.meta.url));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const BOOKS = ["hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"];
const rows = [["book", "words", "marks", "written_and_read", "links_at_rest", "links_lifted", "cards_with_no_pill_at_rest", "cards_with_a_here_line", "cards_with_no_here_line", "cards_with_a_suggested_line", "pressed_is_link_1", "pressed_is_link_2_to_6", "pressed_is_past_the_six_the_page_prints", "no_link_pressed", "cards_with_more_than_one_block", "blocks_a_press_away", "cards_with_divisions_row", "cards_in_a_run", "cards_with_forms_row", "here_r_equals_pressed_r", "here_s_equals_pressed_s", "here_s_among_pressed_by", "page_links_printed", "page_words_with_more_than_six"]];
const T = {};
for (const b of BOOKS) {
  const c = gz(join(S, "base/chain", b, "chain-v1.json.gz"));
  const page = readFileSync(join(S, "base/chain", b, "index.html"), "utf8");
  const t = { words: 0, marks: 0, kq: 0, none: 0, here: 0, nohere: 0, sug: 0, on0: 0, on1_5: 0, on6: 0, onnull: 0, blocks2: 0, away: 0, divs: 0, run: 0, forms: 0, hr: 0, hs: 0, hby: 0, more6: 0 };
  for (const sec of c.sections) for (const cell of sec.cells) {
    if (cell.mark) { t.marks += 1; continue; }
    t.words += 1;
    if (cell.halves) t.kq += 1;
    const r = cell.rest;
    const pool = r.pool === null ? [] : c.pools[r.pool];
    if (!pool.length) t.none += 1;
    if (pool.length > 6) t.more6 += 1;
    const here = (r.here || []).find((h) => h.is === "here");
    if (here) t.here += 1; else t.nohere += 1;
    if ((r.here || []).some((h) => h.is === "suggested")) t.sug += 1;
    if (r.on === null) t.onnull += 1; else if (r.on === 0) t.on0 += 1; else if (r.on < 6) t.on1_5 += 1; else t.on6 += 1;
    if (r.blocks && r.blocks.of.length > 1) { t.blocks2 += 1; t.away += r.blocks.of.length - 1; }
    if (r.divisions) t.divs += 1;
    if (r.over) t.run += 1;
    if (r.forms) t.forms += 1;
    if (here && r.on !== null) {
      const p = pool[r.on];
      if (p.r === here.r) t.hr += 1;
      if (p.s === here.s) t.hs += 1;
      if ((p.by || [p.s]).includes(here.s)) t.hby += 1;
    }
  }
  const printed = (page.match(/<li><b>/gu) || []).length;
  rows.push([b, t.words, t.marks, t.kq, c.counts.at_rest.links, c.counts.lifted.links, t.none, t.here, t.nohere, t.sug, t.on0, t.on1_5, t.on6, t.onnull, t.blocks2, t.away, t.divs, t.run, t.forms, t.hr, t.hs, t.hby, printed, t.more6]);
  for (const [k, v] of Object.entries(t)) T[k] = (T[k] || 0) + v;
  T.rest = (T.rest || 0) + c.counts.at_rest.links; T.lifted = (T.lifted || 0) + c.counts.lifted.links; T.printed = (T.printed || 0) + printed;
}
rows.push(["ALL", T.words, T.marks, T.kq, T.rest, T.lifted, T.none, T.here, T.nohere, T.sug, T.on0, T.on1_5, T.on6, T.onnull, T.blocks2, T.away, T.divs, T.run, T.forms, T.hr, T.hs, T.hby, T.printed, T.more6]);
writeFileSync(join(OUT, "chain-files-counted.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
const head = rows[0];
for (const r of rows.slice(1)) console.log(r[0].padEnd(10), head.slice(1).map((h, i) => `${h}=${r[i + 1]}`).join(" "));
