#!/usr/bin/env node
// RUN: tree
// GUARDS: words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit, row-strike-rule-v8-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted-a-retext-from-words-back-keeps-the-rows-closes-and-facts-a-landing-writes-the-entries-its-line-names, row-strikes-follow-rule-v2-a-name-read-at-an-older-store-is-followed-through-the-rounds-since-and-never-guessed-a-retexted-row-is-followed-to-its-new-words
// LEDGER: -
// no frame letter. A check reads the pins, the derived lists, the row-strikes
// record, the store and the lattice sidecars, and judges them; it is not the
// ledger for one.
//
// BDB'S WORDS GO BACK BY KEY AND RANK (ship 6, relay v187; the owner's call
// 11 of 13 November 2026 and his questions 17 and 18 of 14 November, taken).
// The corpus lane's list (data/made-spaces/words-back-v1/) gives the
// unabridged BDB's openings of a numbered sense the words our build took out
// of them; tools/derive-words-back-v1.mjs proves every line again on the
// store and lists the rows that land (words-back-landing-rule-v1: held where
// the printed text sets a Hebrew character against a Latin letter or a
// digit, and where the lane holds the line), and tools/strike-rows-v1.mjs
// retexts them (row-strike-rule-v7), keeping each row's key, rank, closes and
// facts. What is held here, each read again and none taken from a tool's
// word:
//
//   W1  the pins: the lane's rule, list, list of the openings that lost
//       nothing and four receipts are the bytes data/made-spaces/PIN.json
//       names, and so are the two derived lists (the rows that land, the
//       rows held); every line of either is one line of the lane's list, by
//       key and rank, and together they are all of it, each once
//   W2  each row the words-back round retexted stands once at its key and
//       rank with its source, the list's words back in both its texts, slot
//       9 as the list gives it (its closes on both halves, or none), slots
//       0 and 3 to 6 byte for byte the row the round took, slot 10 its facts
//       as the round took them but for a fact whose own writer has run since
//       the round (FACTS_WRITTEN_BY names the writer, the store's index the
//       day it last ran: names v2 of 20 November marks 259 of these rows a
//       name; that fact is its writer's check's to judge), and it prints (as
//       the note of the sense it opens) the list's printed text
//   W3  exactly one round of the row-strikes record took the derived list,
//       under row-strike-rule-v7, with no line left off: every row of it a
//       retext from words_back of a line of the list, the old row recorded
//       whole and named by the line's key, rank, source and served text,
//       none folded, the store's routes and keys unchanged
//   W4  the 49 held rows are unchanged: each stands once at its key and rank
//       with the text the list read, and no round retexted it
//   W5  the other rows of relay v174 (the openings of a numbered sense,
//       data/sense-openings/) are unchanged: no round retexted one that is
//       not a line of the derived list
//   W6  the falls of relay v178's lists of the unabridged BDB (its made
//       spaces and its words taken out): the rows the round took whose text
//       is a line of either list are, status by status (done, settled by
//       the witness), the lane's own count of where the lists meet relay
//       v187 (meets-v1.json) less the rows held; the lines and those then
//       unserved are counted (the design's 53 + 25 and 489 + 219 lines)
//   W7  the follower (tools/row-strikes-follow-v1.mjs) answers retexted for
//       every row of the derived list, from both versions the lane's lists
//       and the store's facts were read at (90d9eb8e7082, 4d1357b26ca5): the
//       name of the words it took, those words and the words it had; and
//       follows each back from its new name to its old
//   W8  the lattice sidecars name each retexted row's stems by the words it
//       serves now: no sidecar's stems name a row by its old text, and a
//       sidecar that carries its key's stems says it followed them
//
// Until the store steps write the derived lists and the round lands them,
// W1 to W3 and W6 to W8 fail, in words; W4 and W5 hold, since nothing has
// been retexted yet, and guard the untouched rows after the build.
//
// Run: node tools/check-words-back-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { follower, sha16Of, FollowFault, RECORD_FILE } from "./row-strikes-follow-v1.mjs";
import { routePrinted, factsOf, CLOSES_SLOT, FACTS_WRITTEN_BY } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DATA = join(K3, "data");
const STORE = join(DATA, "route-store");
const HOME = join(DATA, "made-spaces");
const ROW_STRIKE_V7 = "row-strike-rule-v7-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted-a-retext-from-words-back-keeps-the-rows-closes-and-facts";
const LANDING_RULE = "words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit";
const READ_AT = ["90d9eb8e7082", "4d1357b26ca5"];
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (list, n = 3) => list.slice(0, n).join(" · ") + (list.length > n ? ` · and ${nf(list.length - n)} more` : "");
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const idOf = (m, key, rank) => `${m}\u0001${key}\u0001${rank}`;

console.log(`— ${LANDING_RULE} —\n`);
if (!existsSync(join(HOME, "PIN.json"))) { console.log("SKIPPED — no made-spaces pin on this disk (data/made-spaces/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(HOME, "PIN.json"), "utf8"));
const wb = pin.words_back || null;
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const record = existsSync(join(DATA, RECORD_FILE)) ? JSON.parse(readFileSync(join(DATA, RECORD_FILE), "utf8")) : { rounds: [] };
const rounds = record.rounds || [];

// ---- W1: the pins ----------------------------------------------------------------------------------------------------
let LIST = [], RETEXT = [], HELD = [];
{
  const faults = [];
  const take = (read) => { try { return read(); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); return null; } };
  if (!wb || !wb.folder || !wb.list) faults.push("the pin names no words back (words_back) with its list");
  else {
    take(() => readPinned(join(HOME, wb.folder, wb.rule.file), wb.rule, `${wb.folder}/${wb.rule.file}`));
    LIST = take(() => readPinnedLines(join(HOME, wb.folder, wb.list.file), wb.list, `${wb.folder}/${wb.list.file}`)) || [];
    take(() => readPinnedLines(join(HOME, wb.folder, wb.in_921_lost_none.file), wb.in_921_lost_none, `${wb.folder}/${wb.in_921_lost_none.file}`));
    for (const r of wb.receipts || []) take(() => readPinned(join(HOME, wb.folder, r.file), r, `${wb.folder}/${r.file}`));
    const d = wb.derived || null;
    if (!d || !d.retext || !d.held) faults.push("the pin names no derived lists (words_back.derived.retext and .held)");
    else {
      if (d.rule_id !== LANDING_RULE) faults.push(`the derived lists stand under ${d.rule_id}, not ${LANDING_RULE}`);
      RETEXT = take(() => readPinnedLines(join(HOME, d.folder, d.retext.file), d.retext, `${d.folder}/${d.retext.file}`)) || [];
      HELD = take(() => readPinnedLines(join(HOME, d.folder, d.held.file), d.held, `${d.folder}/${d.held.file}`)) || [];
    }
  }
  // every derived line is one line of the lane's list, and together they are all of it, each once
  const lane = new Map(LIST.map((l, i) => [`${l.key}\u0001${l.rank}`, i]));
  const seen = new Map();
  for (const [what, L] of [["the rows that land", RETEXT], ["the rows held", HELD]]) L.forEach((l, i) => {
    const id = `${l.key}\u0001${l.rank}`;
    if (!lane.has(id)) faults.push(`${what}, line ${i + 1} (${l.key} rank ${l.rank}): no line of the lane's list`);
    else if (seen.has(id)) faults.push(`${what}, line ${i + 1} (${l.key} rank ${l.rank}): also ${seen.get(id)}`);
    else seen.set(id, `${what}, line ${i + 1}`);
  });
  if (LIST.length && RETEXT.length + HELD.length && seen.size !== LIST.length) faults.push(`the derived lists hold ${seen.size} of the lane's ${LIST.length} lines`);
  check("W1  the lane's rule, list, openings that lost nothing and receipts, and the two derived lists, are the bytes the pin names; every derived line is one line of the lane's list, and together they are all of it",
    faults.length === 0 && RETEXT.length > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : RETEXT.length ? `the lane's list ${nf(LIST.length)} lines · ${nf(RETEXT.length)} land, ${nf(HELD.length)} held` : "the derived lists hold no row that lands");
}

// ---- the round that landed them --------------------------------------------------------------------------------------
const ROUNDS = rounds.filter((r) => (r.rows || []).some((x) => x.action === "retext" && x.from_slot === "words_back"));
const R = ROUNDS.length === 1 ? ROUNDS[0] : null;
const retexted = new Map();   // id -> the round's row
for (const r of ROUNDS) for (const x of r.rows || []) if (x.action === "retext" && x.from_slot === "words_back") retexted.set(idOf(x.m, x.key, x.rank), x);
// the rows the laws ask, by key
const wanted = new Set([...RETEXT, ...HELD].map((l) => l.key));
const rowsAt = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) for (const [k, rows] of Object.entries(gz(join(STORE, "shards", f)))) if (wanted.has(k)) rowsAt.set(k, rows);
const standing = (m, key, rank) => (rowsAt.get(key) || []).filter((r) => r[0] === rank && String(r[3]) === m);

// ---- W2: each retexted row ------------------------------------------------------------------------------------------
{
  const faults = [];
  let met = 0, closed = 0;
  // a fact its own writer has laid again since the round is that writer's to answer for, and its check's to judge
  const writtenSince = (fact) => { const by = FACTS_WRITTEN_BY[fact], at = by && index[by] ? index[by].applied_on : null; return !!R && !!at && String(at) > String(R.ran_at); };
  const since = {};
  if (!R) faults.push(`${ROUNDS.length} round(s) of the row-strikes record retexted rows from words back`);
  for (const [i, l] of RETEXT.entries()) {
    const where = `line ${i + 1} (${l.m} ${l.key} rank ${l.rank})`;
    const x = retexted.get(idOf(l.m, l.key, l.rank));
    if (!x) { if (R) faults.push(`${where}: no row of the round retexted it`); continue; }
    const rows = standing(String(l.m), l.key, l.rank);
    if (rows.length !== 1) { faults.push(`${where}: stands ${rows.length} times at its key and rank`); continue; }
    const row = rows[0], old = Array.isArray(x.row) ? x.row : [];
    met += 1;
    if (row[1] !== l.to_text || row[2] !== l.to_text) faults.push(`${where}: its texts are not the list's words back in both slots`);
    const want9 = Array.isArray(l.closes) && l.closes.length ? [l.closes, l.closes] : null;
    if (!same(row[CLOSES_SLOT] ?? null, want9)) faults.push(`${where}: slot 9 is ${JSON.stringify(row[CLOSES_SLOT] ?? null)}, the list gives ${JSON.stringify(want9)}`);
    if (want9) closed += 1;
    for (const s of [0, 3, 4, 5, 6]) if (!same(row[s] ?? null, old[s] ?? null)) faults.push(`${where}: slot ${s} is not the row the round took (${JSON.stringify(row[s] ?? null).slice(0, 40)} for ${JSON.stringify(old[s] ?? null).slice(0, 40)})`);
    const has = factsOf(row) || {}, had = factsOf(old) || {};
    for (const fact of new Set([...Object.keys(has), ...Object.keys(had)])) {
      if (same(has[fact], had[fact])) continue;
      if (writtenSince(fact)) { since[fact] = (since[fact] || 0) + 1; continue; }
      faults.push(`${where}: its fact ${fact} is not the row the round took (${JSON.stringify(has[fact] ?? null).slice(0, 40)} for ${JSON.stringify(had[fact] ?? null).slice(0, 40)}), and no run of its writer since the round accounts for it`);
    }
    if (routePrinted(row) !== l.prints) faults.push(`${where}: it prints «${String(routePrinted(row)).slice(0, 50)}», the list «${String(l.prints).slice(0, 50)}»`);
  }
  check("W2  each row the round retexted stands once at its key and rank with the list's words back in both texts, slot 9 as the list gives it, slots 0 and 3 to 6 the row the round took, its facts the round's but for a fact its own writer has laid since, and it prints the list's printed text",
    !!R && faults.length === 0 && met === RETEXT.length && met > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(met)} rows · ${nf(closed)} carry closes · ${Object.keys(since).length ? Object.keys(since).sort().map((f) => `${nf(since[f])} carry another ${f} than the round took, laid since by ${FACTS_WRITTEN_BY[f]}`).join(" · ") : "every fact as the round took it"}`);
}

// ---- W3: the round ---------------------------------------------------------------------------------------------------
{
  const faults = [];
  if (!R) faults.push(`${ROUNDS.length} round(s) of the row-strikes record retexted rows from words back, not one`);
  else {
    const d = (wb || {}).derived || {};
    if (R.rule_id !== ROW_STRIKE_V7) faults.push(`the round stands under ${R.rule_id}`);
    if (!R.list || R.list.sha256 !== (d.retext || {}).sha256 || (R.list.left_off || []).length) faults.push("the round did not take the pinned derived list whole");
    if (d.landed_by && R.reason !== d.landed_by.reason) faults.push("the round stands under another reason than the pin's");
    const byId = new Map(RETEXT.map((l) => [idOf(l.m, l.key, l.rank), l]));
    for (const x of R.rows || []) {
      const where = `${x.m} ${x.key} rank ${x.rank}`, l = byId.get(idOf(x.m, x.key, x.rank));
      if (x.action !== "retext" || x.from_slot !== "words_back") { faults.push(`${where}: a ${x.action} in the round`); continue; }
      if (!l) { faults.push(`${where}: no line of the derived list`); continue; }
      if (x.folded_into) faults.push(`${where}: folded into another row`);
      if (x.route !== l.route || !Array.isArray(x.row) || x.row[1] !== l.route || x.row[0] !== l.rank || String(x.row[3]) !== String(l.m)) faults.push(`${where}: the round did not record the old row whole under the line's served text`);
      if (x.to_text !== l.to_text) faults.push(`${where}: the round gave it other words than the list`);
    }
    if ((R.rows || []).length !== RETEXT.length) faults.push(`the round holds ${(R.rows || []).length} rows, the list ${RETEXT.length} lines`);
    // the round's own arithmetic, as tools/strike-rows-v1.mjs records it (its counts_scope): the routes served after are
    // routes_before less routes_struck plus routes_restored and routes_landed; the keys after, keys_before less
    // keys_emptied plus keys_made
    const c = R.counts || {};
    const routesAfter = c.routes_before - (c.routes_struck || 0) + (c.routes_restored || 0) + (c.routes_landed || 0);
    const keysAfter = c.keys_before - (c.keys_emptied || 0) + (c.keys_made || 0);
    if (!Number.isInteger(c.routes_before) || !Number.isInteger(c.keys_before)) faults.push("the round records no routes_before or keys_before");
    else if (routesAfter !== c.routes_before || keysAfter !== c.keys_before) faults.push(`the round moved the store's routes (${c.routes_before} -> ${routesAfter}) or keys (${c.keys_before} -> ${keysAfter})`);
    if (((c.by_action || {}).retext_folded || 0) !== 0) faults.push(`the round folded ${c.by_action.retext_folded} rows`);
  }
  check("W3  one round of the row-strikes record took the derived list whole under row-strike-rule-v7: every row a retext from words_back of a line of the list, the old row recorded whole, none folded, the routes and keys unchanged",
    faults.length === 0, faults.length ? `${nf(faults.length)} · ${first(faults)}` : `the round of ${R.ran_at} · ${nf((R.rows || []).length)} rows retexted · store ${(R.store_version || {}).was} -> ${(R.store_version || {}).now}`);
}

// ---- W4: the held rows ------------------------------------------------------------------------------------------------
{
  const faults = [];
  for (const [i, l] of HELD.entries()) {
    const where = `held line ${i + 1} (${l.m} ${l.key} rank ${l.rank})`;
    if (retexted.has(idOf(l.m, l.key, l.rank))) faults.push(`${where}: a round retexted it`);
    const rows = standing(String(l.m), l.key, l.rank).filter((r) => r[1] === l.route);
    if (rows.length !== 1) faults.push(`${where}: stands ${rows.length} times with the text the list read`);
  }
  check("W4  the rows held stand unchanged: each once at its key and rank with the text the list read, retexted by no round", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : HELD.length ? `${nf(HELD.length)} rows held (${Object.entries(HELD.reduce((a, l) => { a[l.held_because] = (a[l.held_because] || 0) + 1; return a; }, {})).map(([w, n]) => `${w} ${n}`).join(", ")})` : "no held list on this disk yet: nothing to hold");
}

// ---- W5: the other rows of relay v174 ---------------------------------------------------------------------------------
{
  const faults = [];
  const listed = new Set(RETEXT.map((l) => idOf(l.m, l.key, l.rank)));
  for (const [id, x] of retexted) if (!listed.has(id)) faults.push(`${x.m} ${x.key} rank ${x.rank}: retexted from words back and no line of the derived list`);
  // every other retext a round made of a row of the unabridged BDB's openings came before relay v187
  let others = 0;
  const so = existsSync(join(DATA, "sense-openings", "PIN.json")) ? JSON.parse(readFileSync(join(DATA, "sense-openings", "PIN.json"), "utf8")) : null;
  if (so && so.openings) {
    try {
      const lines = readPinnedLines(join(DATA, "sense-openings", so.folder, so.openings.file), so.openings, so.openings.file);
      const rowsOf = new Set(LIST.map((l) => `${l.key}\u0001${l.rank}`));
      for (const l of lines) if (!rowsOf.has(`${l.key}\u0001${l.rank}`)) { others += 1; if ([...retexted.values()].some((x) => x.key === l.key && x.rank === l.rank)) faults.push(`${l.key} rank ${l.rank}: an opening the lane's list does not name was retexted from words back`); }
    } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); }
  } else faults.push("no pin of relay v174's openings here (data/sense-openings/PIN.json)");
  check("W5  the other rows of relay v174 stand unchanged: no round retexted from words back a row the derived list does not name", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(others)} openings of relay v174 the lane's list does not name, none retexted · ${nf(retexted.size)} retexted, each a line of the list`);
}

// ---- W6: the falls of relay v178's lists -----------------------------------------------------------------------------
// relay v178's two lists of the unabridged BDB (its made spaces, and its words taken out, never closed), by text; the
// lane's own count of where they meet relay v187 (meets-v1.json, kept beside relay v188.1's lists): the rows of each
// status whose text is a line of each list. The rows the round took are those less the rows held, status by status
{
  const faults = [];
  const v178 = (pin.relays || []).find((r) => r.relay === "v178");
  const withMeets = (pin.relays || []).find((r) => r.meets && r.meets.file);
  const linesOf = (file) => new Set(readFileSync(join(HOME, v178.folder, file), "utf8").split("\n").filter(Boolean).map((x) => String(JSON.parse(x).text)));
  const out = [];
  if (!v178 || !withMeets) faults.push("the pin names no relay v178 or no meets file");
  else if (!R) faults.push("no round retexted rows from words back, so nothing of v178's lists fell to it");
  else {
    let meets = null;
    try { meets = JSON.parse(readPinned(join(HOME, withMeets.folder, withMeets.meets.file), withMeets.meets, `${withMeets.folder}/${withMeets.meets.file}`).toString("utf8")); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); }
    const files = readdirSync(join(HOME, v178.folder)).filter((f) => f.endsWith(".jsonl"));
    const L = { made_spaces: files.find((f) => /made-spaces/u.test(f)), words_taken_out: files.find((f) => /words-taken-out/u.test(f)) };
    const statusOf = new Map(RETEXT.map((l) => [idOf(l.m, l.key, l.rank), l.status]));
    const byStatus = (meets && meets.v187 && meets.v187.by_status) || {};
    for (const [what, file] of Object.entries(L)) {
      if (!file) { faults.push(`v178's folder holds no list of its ${what.replace(/_/gu, " ")}`); continue; }
      const lines = linesOf(file);
      const lane = what === "made_spaces" ? "text_now_is_a_line_of_made_spaces_v2_1" : "text_now_is_a_line_of_words_taken_out_v2_1";
      for (const st of Object.keys(byStatus)) {
        const want = Number((byStatus[st] || {})[lane] || 0) - HELD.filter((l) => l.status === st && lines.has(l.route)).length;
        const rows = (R.rows || []).filter((x) => statusOf.get(idOf(x.m, x.key, x.rank)) === st && lines.has(String(x.route)));
        const texts = new Set(rows.map((x) => String(x.route)));
        const unserved = [...texts].filter((t) => !RETEXT.some((l) => l.to_text === t) && ![...rowsAt.values()].some((rs) => rs.some((r) => String(r[3]) === "M46" && (r[1] === t || r[2] === t)))).length;
        if (!want && !rows.length) continue;
        out.push(`${what.replace(/_/gu, " ")} ${st}: ${rows.length} rows on ${texts.size} lines (${unserved} then unserved on the keys read)`);
        if (rows.length !== want) faults.push(`${what.replace(/_/gu, " ")}, ${st}: the round took ${rows.length} rows whose text is a line, and the lane's count less the rows held gives ${want}`);
      }
    }
  }
  check("W6  the rows the round took whose text is a line of relay v178's lists are, status by status, the lane's own count (meets-v1.json) less the rows held",
    faults.length === 0, faults.length ? `${nf(faults.length)} · ${first(faults)}` : out.join(" · "));
}

// ---- W7: the follower ------------------------------------------------------------------------------------------------
{
  const faults = [];
  let asked = 0;
  if (!R) faults.push("no round retexted rows from words back");
  else for (const at of READ_AT) {
    let f;
    try { f = follower({ record, index, readAt: at }); } catch (e) { if (e instanceof FollowFault) { faults.push(`read at ${at}: ${e.message}`); continue; } throw e; }
    for (const l of RETEXT) {
      asked += 1;
      const old = [l.key, l.rank, String(l.m), sha16Of(l.route)], now = [l.key, l.rank, String(l.m), sha16Of(l.to_text)];
      try {
        const a = f.nowOf(old);
        if (a.state !== "retexted" || !same(a.name, now) || a.text !== l.to_text || a.was !== l.route) faults.push(`read at ${at}, ${l.key} rank ${l.rank}: the follower answers ${a.state}${a.name ? ` ${JSON.stringify(a.name)}` : ""}`);
        const b = f.thenOf(now);
        if (b.state !== "retexted" || !same(b.name, old)) faults.push(`read at ${at}, ${l.key} rank ${l.rank}: followed back, ${b.state}${b.name ? ` ${JSON.stringify(b.name)}` : ""}`);
      } catch (e) { if (e instanceof FollowFault) faults.push(`read at ${at}, ${l.key} rank ${l.rank}: ${e.message}`); else throw e; }
    }
  }
  check("W7  the follower answers retexted for every row the round took, from both versions the lists were read at, with the words it took and had, and follows each back", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(asked)} answers from ${READ_AT.join(" and ")}`);
}

// ---- W8: the sidecars' stems -----------------------------------------------------------------------------------------
{
  const faults = [];
  let carried = 0, followedSaid = 0, sidecars = 0;
  const zones = join(DATA, "zones");
  if (!R) faults.push("no round retexted rows from words back");
  else for (const f of readdirSync(zones).filter((x) => x.endsWith(".lattice.bin")).sort()) {
    const s = gz(join(zones, f));
    sidecars += 1;
    let here = 0;
    for (const l of RETEXT) {
      const held = (s.stems || {})[l.key];
      if (!held) continue;
      const oldId = `${l.m}\u0001${l.rank}\u0001${l.route}`, newId = `${l.m}\u0001${l.rank}\u0001${l.to_text}`;
      if (Object.prototype.hasOwnProperty.call(held, oldId)) faults.push(`${f}: the stems of ${l.key} rank ${l.rank} are named by its old text`);
      if (Object.prototype.hasOwnProperty.call(held, newId)) { carried += 1; here += 1; }
    }
    const said = ((s.binyan || {}).followed_through_retexts || {}).rows_on_this_books_keys || 0;
    if (here && !said) faults.push(`${f}: carries ${here} retexted row(s)' stems by their new words and does not say it followed them`);
    followedSaid += said;
  }
  check("W8  the lattice sidecars name each retexted row's stems by the words it serves now, and never by its old text", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${sidecars} sidecars · ${nf(carried)} retexted rows' stems carried by their new words · ${nf(followedSaid)} followed through the retext, as the sidecars say`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
