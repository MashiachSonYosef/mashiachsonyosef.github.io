// Read-only, from the files alone: for every word of the twelve books, is the fingerprint of the line the page
// prints under it (data/resting-lines) anywhere in the chain for that word, and does the chain page print it?
// And the credit: is the fingerprint of the line's credited label the source of that link?
// Writes line-in-chain.tsv (one row a book) beside this script.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const sha12 = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const BOOKS = ["hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"];
const head = ["book", "words", "words_under_a_line", "line_is_the_pressed_link", "line_is_a_link_but_not_the_pressed", "line_is_only_the_line_above_the_pills_in_the_file", "line_is_nowhere_in_the_chain_for_the_word", "chain_page_prints_the_lines_fingerprint", "chain_page_prints_it_and_names_the_lines_credit", "pressed_link_names_the_lines_credit_label", "line_above_the_pills_names_the_lines_credit_label", "buttons_a_press_away_at_rest", "cards_with_a_button_a_press_away"];
const rows = [head];
const T = new Array(head.length - 1).fill(0);
for (const b of BOOKS) {
  const chain = gz(join(S, "base/chain", b, "chain-v1.json.gz"));
  const rec = gz(join(R, "data/resting-lines", `${b}.json.gz`));
  const t = { words: 0, under: 0, pressed: 0, link: 0, here: 0, nowhere: 0, page: 0, pageCred: 0, pressedCred: 0, hereCred: 0 };
  chain.sections.forEach((sec, i) => {
    const units = rec.sections[i][1];
    sec.cells.forEach((cell, e) => {
      if (cell.mark) return;
      t.words += 1;
      const u = units.find((x) => x[0] <= e && e < x[0] + x[1]);
      if (!u) return;
      t.under += 1;
      const lf = sha12(u[2]);
      const cred = String(u[3]).split(" ").filter(Boolean).map((id) => sha12((rec.sources[id] || {}).label || ""));
      const r = cell.rest, pool = r.pool === null ? [] : chain.pools[r.pool];
      const pressed = r.on === null ? null : pool[r.on];
      const here = (r.here || []).find((h) => h.is === "here");
      const at = pool.findIndex((l) => l.r === lf);
      if (pressed && pressed.r === lf) t.pressed += 1;
      else if (at >= 0) t.link += 1;
      else if (here && here.r === lf) t.here += 1;
      else t.nowhere += 1;
      if (at >= 0 && at < 6) { t.page += 1; if (cred.includes(pool[at].s)) t.pageCred += 1; }
      if (pressed && cred.includes(pressed.s)) t.pressedCred += 1;
      if (here && cred.includes(here.s)) t.hereCred += 1;
    });
  });
  const row = [t.words, t.under, t.pressed, t.link, t.here, t.nowhere, t.page, t.pageCred, t.pressedCred, t.hereCred, chain.counts.at_rest.buttons_a_press_away, chain.counts.at_rest.words_with_a_button_a_press_away];
  rows.push([b, ...row]);
  row.forEach((v, x) => { T[x] += v; });
}
rows.push(["ALL", ...T]);
writeFileSync(join(OUT, "line-in-chain.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
head.slice(1).forEach((h, x) => console.log(`${h}: ${T[x]}`));
