#!/usr/bin/env node
// GUARDS: landings-rule-v1-a-landing-list-lands-as-its-own-rule-reads-on-the-store-it-meets-each-line-at-the-rank-its-list-gives-or-after-the-last-row-of-its-key-and-a-line-its-own-source-already-prints-is-named-not-landed
// check-landings-v1 — the corpus lane's landing lists that need no ruling, each derived on the store it met and
// landed in its turn (tools/derive-landings-v1.mjs, tools/strike-rows-v1.mjs; data/landings/PIN.json).
//
//   G1  the pin is a pin of the landings; each list's rule, receipt and list are the bytes it names, and so are the
//       two lists derived from it here (the rows that land, the lines not landed); each list lands after the one
//       the pin names before it
//   G2  every line of a lane's list is accounted for once: it made a landed row, or was gathered into the row an
//       earlier line of the same source made for the same words under the same key, or is named not landed; a
//       landed row gathers only lines of its own key, source and words, and carries each line's facts and
//       headwords, each once, in the lines' order
//   G3  one round of the row-strikes record took each derived list whole (its bytes, every line, none left off),
//       every row of it a landing of a line of the list with the row recorded, and the rounds ran in the pin's
//       order, one right after another
//   G4  each landed line stands as one row of the store under its key, at its rank, of its source: the line's
//       words, definition, year and headwords, and the entries (n, t, b) the line names, with what the index of
//       the row entries says a struck row's line gave it as that row's twin and nothing else (the pointed forms
//       own-pointing-rule-v1 lays after a bare row's own headwords are that rule's). A row a later round took,
//       moved or retexted is followed there by the row-strikes record and counted, never guessed
//   G5  each line not landed names the rows of its own source that print its words under its key, and such a
//       row stands there now
//
// The words are found in the data, never named. A tree with no pin of the landings is skipped (exit 3).
// Run: node tools/check-landings-v1.mjs [--store data/route-store]
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { openFollower, sha16Of, FollowFault, RECORD_FILE } from "./row-strikes-follow-v1.mjs";
import { headwordsBeforeOwnPointing } from "./apply-own-pointing-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DATA = join(K3, "data");
const STORE = arg("store", join(DATA, "route-store"));
const HOME = join(DATA, "landings");
const RULE = "landings-rule-v1-a-landing-list-lands-as-its-own-rule-reads-on-the-store-it-meets-each-line-at-the-rank-its-list-gives-or-after-the-last-row-of-its-key-and-a-line-its-own-source-already-prints-is-named-not-landed";
const FACTS = ["n", "t", "b"];
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (list, n = 3) => list.slice(0, n).join(" · ") + (list.length > n ? ` · and ${nf(list.length - n)} more` : "");
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const spaced = (t) => String(t).replace(/\s+/gu, " ").trim();
const mineOf = (f) => { if (!f) return null; const o = {}; for (const k of FACTS) if (k in f) o[k] = f[k]; return Object.keys(o).length ? o : null; };
const sep = "\u0001";

console.log(`— ${RULE} —\n`);
if (!existsSync(join(HOME, "PIN.json"))) { console.log("SKIPPED — no pin of the landings on this tree (data/landings/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(HOME, "PIN.json"), "utf8"));
const lists = Array.isArray(pin.lists) ? pin.lists : [];
const store = openRouteStore(STORE);
const index = store.index;
const record = existsSync(join(DATA, RECORD_FILE)) ? JSON.parse(readFileSync(join(DATA, RECORD_FILE), "utf8")) : { rounds: [] };
const rounds = record.rounds || [];

// ---- G1: the pin and its bytes ---------------------------------------------------------------------------------------
const READ = new Map();   // a list's id -> { lane, landed, notLanded }
{
  const faults = [];
  const take = (read) => { try { return read(); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); return null; } };
  // a derived list that holds no line is an empty file, held to the pin by its bytes
  const linesOf = (path, entry, name) => (entry.lines === 0 && entry.bytes === 0 ? (readPinned(path, entry, name), []) : readPinnedLines(path, entry, name));
  if (pin.schema_version !== "LANDINGS_PIN_V1" || pin.rule_id !== RULE) faults.push("the pin is not a pin of the landings (LANDINGS_PIN_V1 under the rule this check guards)");
  if (!lists.length) faults.push("the pin names no list");
  lists.forEach((l, i) => {
    const d = l.derived || {};
    if (!l.id || !l.folder || !l.rule || !l.list || !d.folder || !d.landed || !d.not_landed) { faults.push(`list ${i + 1} (${l.id || "unnamed"}) does not name its folder, rule, list and the two lists derived from it`); return; }
    if ((l.lands_after ?? null) !== (i ? lists[i - 1].id : null)) faults.push(`${l.id} says it lands after ${l.lands_after ?? "no list"}, and the pin sets it after ${i ? lists[i - 1].id : "no list"}`);
    take(() => readPinned(join(HOME, l.folder, l.rule.file), l.rule, `${l.folder}/${l.rule.file}`));
    if (l.receipt) take(() => readPinned(join(HOME, l.folder, l.receipt.file), l.receipt, `${l.folder}/${l.receipt.file}`));
    const lane = take(() => readPinnedLines(join(HOME, l.folder, l.list.file), l.list, `${l.folder}/${l.list.file}`));
    const landed = take(() => linesOf(join(HOME, d.folder, d.landed.file), d.landed, `${d.folder}/${d.landed.file}`));
    const notLanded = take(() => linesOf(join(HOME, d.folder, d.not_landed.file), d.not_landed, `${d.folder}/${d.not_landed.file}`));
    if (lane && landed && notLanded) READ.set(l.id, { lane, landed, notLanded });
  });
  check("G1  the pin is a pin of the landings; each list's rule, receipt and list, and the two lists derived from it, are the bytes the pin names; each lands after the list before it", faults.length === 0 && READ.size === lists.length && lists.length > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lists.map((l) => `${l.id} (relay ${l.relay}): ${nf(READ.get(l.id).lane.length)} lines, ${nf(READ.get(l.id).landed.length)} rows land, ${nf(READ.get(l.id).notLanded.length)} not landed`).join(" · "));
}

// ---- G2: every line accounted for once ---------------------------------------------------------------------------------
{
  const faults = [];
  let gathered = 0;
  for (const l of lists) {
    const got = READ.get(l.id);
    if (!got) continue;
    const seen = new Map();   // a line of the lane's list (from 1) -> what took it
    const takeLine = (n, what) => { if (!Number.isInteger(n) || n < 1 || n > got.lane.length) faults.push(`${l.id}: ${what} names line ${n}, and the list holds ${got.lane.length}`); else if (seen.has(n)) faults.push(`${l.id}: line ${n} is ${what} and also ${seen.get(n)}`); else seen.set(n, what); };
    got.landed.forEach((x, i) => {
      const where = `${l.id}, landed row ${i + 1}`;
      const linesOf = (x.from && Array.isArray(x.from.gathers)) ? x.from.gathers : [x.from ? x.from.line : null];
      if (!x.from || x.from.relay !== l.relay || x.from.list !== l.list.file || linesOf[0] !== x.from.line) { faults.push(`${where} does not name the lines of its list it was made from`); return; }
      const wantFacts = {}, wantHeads = [];
      linesOf.forEach((n, at) => {
        takeLine(n, at ? "gathered into an earlier line's row" : "a landed row");
        const e = got.lane[n - 1];
        if (!e) return;
        if (at) gathered += 1;
        if (e.m !== x.m || e.key !== x.key || e.route !== x.route || e.definition !== x.definition || e.year !== x.year) faults.push(`${where}: line ${n} is not its key, source, words, definition and year`);
        if (e.rank !== null && e.rank !== x.rank) faults.push(`${where}: line ${n} names rank ${e.rank}, and the row lands at ${x.rank}`);
        for (const h of e.headwords || []) if (!wantHeads.includes(h)) wantHeads.push(h);
        for (const k of FACTS) for (const y of ((e.facts || {})[k] || [])) { if (!(wantFacts[k] || (wantFacts[k] = [])).includes(y)) wantFacts[k].push(y); }
      });
      if (!same(x.headwords, wantHeads)) faults.push(`${where}: its headwords are not its lines', each once, in their order`);
      if (!same(mineOf(x.facts), mineOf(wantFacts))) faults.push(`${where}: its facts are not its lines', each once, in their order`);
      if (x.action !== "land" || x.place !== "after") faults.push(`${where} is not a landing after the rows that stand at its rank`);
    });
    got.notLanded.forEach((x, i) => {
      takeLine(x.from ? x.from.line : null, "named not landed");
      const e = x.from ? got.lane[x.from.line - 1] : null;
      if (e && (e.m !== x.m || e.key !== x.key || e.route !== x.route)) faults.push(`${l.id}, line not landed ${i + 1}: not its line's key, source and words`);
    });
    if (seen.size !== got.lane.length) faults.push(`${l.id}: ${nf(got.lane.length - seen.size)} of its ${nf(got.lane.length)} lines made no row and are not named not landed`);
    const names = new Set();
    for (const x of got.landed) { const id = [x.key, x.m, x.route].join(sep); if (names.has(id)) faults.push(`${l.id}: two rows land the same words of ${x.m} under one key`); names.add(id); }
  }
  check("G2  every line of a lane's list made a landed row, was gathered into the row of the same source and words under its key, or is named not landed, each once; a landed row carries its lines' facts and headwords", faults.length === 0 && READ.size > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf([...READ.values()].reduce((a, g) => a + g.lane.length, 0))} lines of ${READ.size} lists · ${nf([...READ.values()].reduce((a, g) => a + g.landed.length, 0))} rows · ${nf(gathered)} lines gathered · ${nf([...READ.values()].reduce((a, g) => a + g.notLanded.length, 0))} not landed`);
}

// ---- G3: one round per list, in the pin's order ------------------------------------------------------------------------
const ROUND_OF = new Map();   // a list's id -> its round
{
  const faults = [];
  let last = -1;
  for (const l of lists) {
    const got = READ.get(l.id);
    if (!got) continue;
    const sha = l.derived.landed.sha256;
    const mine = rounds.map((r, i) => [r, i]).filter(([r]) => r.list && r.list.sha256 === sha);
    if (!got.landed.length) { if (mine.length) faults.push(`${l.id} lands no row, and ${mine.length} round(s) took its empty list`); continue; }
    if (mine.length !== 1) { faults.push(`${mine.length} rounds of the row-strikes record took the derived list of ${l.id}`); continue; }
    const [r, at] = mine[0];
    ROUND_OF.set(l.id, r);
    if (last >= 0 && at !== last + 1) faults.push(`the landing of ${l.id} is round ${at + 1}, and the list before it landed in round ${last + 1}: they do not follow one another`);
    last = at;
    const rows = r.rows || [], c = r.counts || {};
    if (r.list.file !== l.derived.landed.file || r.list.lines !== got.landed.length || (r.list.left_off || []).length) faults.push(`the round of ${l.id} did not take its derived list whole (${r.list.lines} of ${got.landed.length} lines, ${(r.list.left_off || []).length} left off)`);
    if (!/^row-strike-rule-v\d+-/u.test(String(r.rule_id))) faults.push(`the round of ${l.id} ran under ${r.rule_id}, no rule of the row strikes`);
    if (rows.length !== got.landed.length || c.routes_landed !== got.landed.length || (c.by_action || {}).land_already_held) faults.push(`the round of ${l.id} holds ${rows.length} rows and says ${c.routes_landed} landed, ${(c.by_action || {}).land_already_held || 0} already held, of ${got.landed.length} lines`);
    if (l.landed_by && r.reason !== l.landed_by.reason) faults.push(`the round of ${l.id} gives another reason than its pin entry`);
    const byName = new Map(rows.map((x) => [[x.key, x.rank, String(x.m), x.route].join(sep), x]));
    for (const [i, x] of got.landed.entries()) {
      const hit = byName.get([x.key, x.rank, x.m, x.route].join(sep));
      if (!hit || hit.action !== "land" || hit.already_held || !Array.isArray(hit.row)) { faults.push(`${l.id} line ${i + 1} (${x.m} rank ${x.rank}): no landing of the round with its row recorded`); continue; }
      if (hit.row[0] !== x.rank || hit.row[1] !== x.route || hit.row[2] !== x.definition || String(hit.row[3]) !== x.m || hit.row[4] !== x.year || !same(hit.row[6], x.headwords) || !same(mineOf(factsOf(hit.row)), mineOf(x.facts))) faults.push(`${l.id} line ${i + 1} (${x.m} rank ${x.rank}): the row the round recorded is not the line's words, definition, year, headwords and facts`);
    }
  }
  check("G3  one round of the row-strikes record took each derived list whole, every row a landing of a line with the row recorded as the line gives it, and the rounds ran in the pin's order, one right after another", faults.length === 0 && ROUND_OF.size > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lists.filter((l) => ROUND_OF.has(l.id)).map((l) => { const r = ROUND_OF.get(l.id); return `${l.id}: round ${rounds.indexOf(r) + 1} of ${r.ran_at}, ${nf(r.counts.routes_landed)} rows, store ${r.store_version.was} -> ${r.store_version.now}`; }).join(" · "));
}

// ---- G4: each landed line stands as its row ---------------------------------------------------------------------------
{
  const faults = [];
  // what the row entries' index says a struck row's line gave a row as that row's twin
  const given = new Map();
  const rec = index.row_entries || null;
  for (const p of (rec && rec.followed && Array.isArray(rec.followed.entries_given_to_a_twin)) ? rec.followed.entries_given_to_a_twin : []) if (Array.isArray(p.to)) given.set([p.to[0], p.to[1], String(p.to[2]), p.to[3]].join(sep), p.gave || {});
  let stand = 0, withFacts = 0, twins = 0;
  const since = {};
  for (const l of lists) {
    const got = READ.get(l.id), r = ROUND_OF.get(l.id);
    if (!got || !r) continue;
    let follow = null;
    try { follow = openFollower({ data: DATA, index, readAt: r.store_version.now }); } catch (e) { if (!(e instanceof FollowFault)) throw e; faults.push(`${l.id}: ${e.message}`); continue; }
    for (const [i, x] of got.landed.entries()) {
      const where = `${l.id} line ${i + 1} (${x.m} rank ${x.rank})`;
      let now = null;
      try { now = follow.nowOf([x.key, x.rank, x.m, sha16Of(x.route)]); } catch (e) { if (!(e instanceof FollowFault)) throw e; faults.push(`${where}: ${e.message}`); continue; }
      if (now.state !== "served") {
        // a later round took, moved or retexted it: that round's own check answers for the row
        since[now.state] = (since[now.state] || 0) + 1;
        continue;
      }
      const rows = (store.routesWhole(x.key) || []).filter((row) => String(row[3]) === x.m && row[1] === x.route);
      if (rows.length !== 1) { faults.push(`${where}: its words stand ${rows.length} times under its key from its source`); continue; }
      const row = rows[0];
      if (row[0] !== x.rank) { faults.push(`${where}: its row stands at rank ${row[0]}`); continue; }
      // the pointed forms the own-pointing rule lays after a bare row's own headwords are that rule's, and its check's
      if (row[2] !== x.definition || row[4] !== x.year || !same(headwordsBeforeOwnPointing(row, index.m_sources), x.headwords)) faults.push(`${where}: its row does not carry the line's definition, year and headwords`);
      const gave = given.get([x.key, x.rank, x.m, sha16Of(x.route)].join(sep)) || null;
      const want = {};
      for (const k of FACTS) { const all = [...((x.facts || {})[k] || []), ...((gave || {})[k] || [])]; if (all.length) want[k] = all; }
      if (!same(mineOf(factsOf(row)), mineOf(want))) faults.push(`${where}: its row carries ${JSON.stringify(mineOf(factsOf(row)))}, and its line${gave ? " with what its struck row's line gave" : ""} names ${JSON.stringify(mineOf(want))}`);
      stand += 1; if (mineOf(want)) withFacts += 1; if (gave) twins += 1;
    }
  }
  const moved = Object.keys(since).sort().map((s) => `${nf(since[s])} ${s} by a round since`).join(", ");
  check("G4  each landed line stands as one row under its key, at its rank, of its source, with the line's words, definition, year, headwords and entries, and what a struck row's line gave it as that row's twin", faults.length === 0 && ROUND_OF.size > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(stand)} rows stand · ${nf(withFacts)} carry entries · ${nf(twins)} given a struck row's entries as its twin${moved ? ` · ${moved}` : ""}`);
}

// ---- G5: each line not landed is printed by its own source -----------------------------------------------------------
{
  const faults = [];
  let lines = 0;
  for (const l of lists) for (const [i, x] of ((READ.get(l.id) || {}).notLanded || []).entries()) {
    lines += 1;
    const where = `${l.id}, line not landed ${i + 1} (${x.m})`;
    if (x.kind !== "printed_under_its_key_by_its_own_source" || !Array.isArray(x.printed_by) || !x.printed_by.length) { faults.push(`${where} does not name the rows that print its words`); continue; }
    const own = (store.routesWhole(x.key) || []).filter((row) => String(row[3]) === x.m && (row[1] === x.route || spaced(row[1]) === spaced(x.route)));
    if (!own.length) faults.push(`${where}: no row of its own source prints its words under its key now`);
  }
  check("G5  each line not landed names the rows of its own source that print its words under its key, and such a row stands there now", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lines ? `${nf(lines)} lines, each printed by its own source` : "no line of the pin's lists is held back: every line lands");
}

console.log(bad ? `\n${bad} check(s) FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
