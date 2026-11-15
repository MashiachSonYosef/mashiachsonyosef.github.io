// Synthesis lane · a name read at an older store, followed through the rounds of the row-strikes record since
// GUARDS: row-strikes-follow-rule-v1-a-name-read-at-an-older-store-is-followed-through-the-rounds-since-and-never-guessed
// LEDGER: -
// no frame letter. It reads the row-strikes record and the store's index,
// and writes nothing.
//
// A NAME READ AT AN OLDER STORE IS FOLLOWED THROUGH THE ROUNDS SINCE, AND
// NEVER GUESSED.
//
// The corpus lane's lists name a row of the store by four parts: its key,
// its rank, its source id and the first 16 hex of the sha256 of its route
// text ([key, rank, m, sha16]). Each list was read at one version of the
// store, which its own receipt names: the row entries ledger, the name
// rows, the openings of a numbered sense, the rows tables of the default
// picks, the pointer map. Until 15 November 2026 every tool that reads one
// found each row where its list left it, or refused. That day the store
// moved under all of them at once (the landing plan's ship 4): call 5 of
// relay v189 struck 5,403 rows under keys that end in a maqaf and moved 357
// to their plain key, and relay v188 landed 4,201 rows no list had read.
// (Calls 6 and 2 of the same relay, which would have withheld 450 more, were
// rehearsed that day and held: data/audit-calls/PIN.json says why. The
// follower answers `withheld` all the same: earlier rounds withheld rows,
// and a later list may.) A row that moves keeps everything it carries
// (tools/strike-rows-v1.mjs moves it whole), so nothing has to be written on
// it again: its name has only to be followed.
//
// What each round did is kept row by row, each row whole, in
// data/row-strikes-v1.json, and the store's index keeps the order of its
// versions (store_version_history). From those two, and from nothing else,
// this answers for a name read at an older store (nowOf), one of:
//
//   served        no round since acted on the row: it stands as named;
//   re-keyed      a round since moved it to another key: with the name it
//                 has now (the new key, the rank it took there, the same
//                 source and words);
//   withheld      a round since took it off the store, under the owner's
//   struck        ruling or as a row that is not its key's: with the round
//                 and the list that took it, and the row as the record
//                 keeps it;
//
// and for a row the store holds now, asked the other way (thenOf), one of:
//
//   served        it stood under this name at the older store;
//   re-keyed      it stood under another name there: with that name;
//   landed after  a round since landed it, so the older store never held
//                 it, and no line of a list read there is expected for it.
//
// THE SEAM, LEFT ON PURPOSE. A fifth answer belongs to the landing of relay
// v187 (the plan's ship 6): `retexted`, with the name the row has by its new
// words (the same key and rank, the sha16 of the text it took). It is not
// given yet. The retext that gives a row its words back is not built
// (tools/strike-rows-v1.mjs says so), and what a retexted row keeps of its
// facts, its closes and the picks that name it is that ship's to settle. A
// name a round since retexted is refused, in words, at the one place below
// marked THE SEAM.
//
// THE TWIN OF A STRUCK ROW. Some rows are struck because the same words
// stand elsewhere, and their list says so in the row's kind, which the
// record keeps. One kind is known here: a row under a key that ends in a
// maqaf, a key no card ever asks, struck where the key without the maqaf
// holds its words (call 5 of relay v189). The same source's row of the same
// words under that key is its twin. A list that says something of the struck
// row which the twin's own line does not say (its source files the words
// under two entries, one at each key) has to give it to the twin, or the
// strike loses it: twinKeyOf names the key, and the tool that lays the list
// finds the row and says what it gave (tools/apply-row-entries-v1.mjs).
//
// REFUSED too, each in words (FollowFault), because no plan names what the
// answer would be: a version the store's history does not hold; a row strike
// in that history since, which the record does not hold; a round whose rows
// are not written as this reads them; a re-key since that folded its row
// into another; a rejoin or a restore since; a name a round took and a
// round then put a row under again; a row asked the other way that the
// record says left the store. The three lists below (gone, landed, rekeyed)
// say how the whole store differs from the older one, so they are refused
// wherever any round since did one of those things, to any row: a count
// made from them would else be short and not say so. A fault names a row by
// its source, its rank and its sha16, never by its key, so a tool that
// prints no Hebrew can say it as it is.
//
// THE ROUNDS SINCE are read off the store's own history of its versions by
// position: every move after the store was last the version `readAt`, each
// matched to the record's round of the same two versions and the same
// moment. A version is a hash of the shards, and a store can come to the
// same bytes twice, so «a round whose version was reached since» is never
// asked.
//
//   follower({ record, index, readAt })
//     record   the row-strikes record
//     index    the store's index
//     readAt   the version of the store the names were read at
//   -> { readAt, rounds, nowOf(name), thenOf(name), gone, landed, rekeyed }
//        rounds   the rounds since, in order: { round, ran_at, list, list_sha256 }
//        gone     the rows the older store held that the store no longer
//                 holds: { name (as read there), state, by, row }
//        landed   the rows the store holds that a round since landed:
//                 { name (as it stands), by, row }
//        rekeyed  the rows the older store held that stand under another
//                 name: { name (as read there), now, by }
//   openFollower({ data, index, readAt })  the same, the record read from <data>
//   sha16Of(text)                          the fourth part of a name
//   twinKeyOf(name, answer)                the key a struck row's words still stand under, where its strike says so
//   followedRecord(f, { left, rekeyed, landed })
//     what a tool that lays a list through the follower records of it, and
//     a check counts again: the rounds, and how many lines and rows took
//     each answer, by the list of the round that gave it
//   followedSaid(record)                   the same, in words
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { sha256Of } from "./pinned-v1.mjs";

export const ROW_FOLLOW_RULE_ID = "row-strikes-follow-rule-v1-a-name-read-at-an-older-store-is-followed-through-the-rounds-since-and-never-guessed";
export const RECORD_FILE = "row-strikes-v1.json";
export class FollowFault extends Error {}

/** The fourth part of a row's name: the first 16 hex of the sha256 of its route text. */
export const sha16Of = (text) => sha256Of(Buffer.from(String(text ?? ""), "utf8")).slice(0, 16);

const MAQAF = "\u05be";
/** The key a struck row's words still stand under, where its strike's own kind says so (THE TWIN OF A STRUCK ROW);
 *  null for a row not struck, or struck for another reason. `answer` is what nowOf gave for `name`. */
export const twinKeyOf = (name, answer) => (answer && answer.state === "struck" && answer.by && answer.by.kind === "key_ends_in_a_maqaf" && name[0].length > 1 && name[0].endsWith(MAQAF) ? name[0].slice(0, -1) : null);

const idOf = (name) => name.join("\u0001");
const whole = (name) => [name[0], name[1], String(name[2]), name[3]];
const said = (name) => `the row of ${name[2]} at rank ${name[1]} (${name[3]})`;

/** The rounds of the record that ran on the store after it was the version `readAt`, in the order they ran. */
export const roundsSince = (record, index, readAt) => {
  const history = (index && index.store_version_history) || [];
  const at = history.map((h) => h.now).lastIndexOf(readAt);
  if (!readAt || (at < 0 && !(history.length && history[0].was === readAt))) throw new FollowFault(`the store's history does not hold ${readAt || "a version"}, the version of the store the names were read at`);
  // each move of the history since, matched to the record's round of the same versions and moment (by position: a
  // version is a hash, and the store can come to one twice). A move by a row strike that the record holds no round
  // for cannot be followed: such a move is known by its rule, one of the record's own or one named as they are
  const all = (record && record.rounds) || [];
  const rules = new Set(all.map((r) => r.rule_id).filter(Boolean));
  const rounds = [], lost = [];
  for (const h of history.slice(at + 1)) {
    const r = all.find((x) => x.store_version && x.store_version.was === h.was && x.store_version.now === h.now && x.ran_at === h.on);
    if (r) rounds.push(r);
    else if (rules.has(h.why) || /^row-strike-rule-/u.test(String(h.why))) lost.push(h);
  }
  if (lost.length) throw new FollowFault(`the store's history holds ${lost.length} row strike(s) since ${readAt} that the row-strikes record does not hold (the first from ${lost[0].was} to ${lost[0].now})`);
  return rounds;
};

// one round, read once: the names its rows left, and the names its rows came to
const readRound = (r, n) => {
  const left = new Map(), came = new Map();
  const where = `the round of ${r.ran_at}${r.list ? ` (${r.list.file})` : ""}`;
  const by = (x) => ({ round: n, ran_at: r.ran_at, list: r.list ? r.list.file : null, list_sha256: r.list ? r.list.sha256 : null, action: x.action, kind: x.kind ?? null });
  const put = (map, name, v) => { const id = idOf(name); if (map.has(id)) throw new FollowFault(`${where} names ${said(name)} twice`); map.set(id, { name, ...v }); };
  for (const x of r.rows || []) {
    if (x.action === "rejoin") {
      for (const row of Array.isArray(x.rows) ? x.rows : []) put(left, [x.key, row[0], String(row[3]), sha16Of(row[1])], { went: "rejoined", by: by(x), row });
      continue;
    }
    if (typeof x.key !== "string" || !Number.isInteger(x.rank) || x.m === undefined || typeof x.route !== "string") throw new FollowFault(`${where} holds a row that is not written with its key, rank, source and route`);
    const m = String(x.m), name = [x.key, x.rank, m, sha16Of(x.route)];
    if (x.action === "strike" || x.action === "withhold") put(left, name, { went: x.action === "strike" ? "struck" : "withheld", by: by(x), row: x.row });
    else if (x.action === "re-key") {
      if (x.folded_into) { put(left, name, { went: "folded", by: by(x), row: x.row }); continue; }
      if (typeof x.to_key !== "string" || !Number.isInteger(x.to_rank)) throw new FollowFault(`${where} re-keyed ${said(name)} and does not say the key and the rank it took`);
      const to = [x.to_key, x.to_rank, m, name[3]];
      put(left, name, { went: "re-keyed", by: by(x), row: x.row, to });
      put(came, to, { how: "re-keyed", by: by(x), from: name });
    } else if (x.action === "retext") {
      put(left, name, { went: "retexted", by: by(x), row: x.row });
      if (!x.folded_into) put(came, [x.key, x.rank, m, sha16Of(x.to_text)], { how: "retexted", by: by(x), from: name });
    } else if (x.action === "land") { if (!x.already_held) put(came, name, { how: "landed", by: by(x), row: x.row }); }
    else if (x.action === "restore") { if (!x.already_held) put(came, [x.key, x.to_rank, m, name[3]], { how: "restored", by: by(x) }); }
    else if (x.action !== "headword") throw new FollowFault(`${where} holds the action "${x.action}", which the follower does not know`);   // a re-heading moves no name
  }
  return { where, left, came };
};

export const follower = ({ record, index, readAt }) => {
  const since = roundsSince(record, index, readAt);
  const numberOf = (r) => (record.rounds || []).indexOf(r) + 1;   // a round's place in the record, from 1
  const rounds = since.map((r) => readRound(r, numberOf(r)));
  // THE SEAM (the plan's ship 6, relay v187): a retexted row keeps its key and its rank and is named by its new words,
  // { state: "retexted", name: [key, rank, m, the sha16 of the text it took] }. That answer is not given until the
  // retext that gives a row its words back is built, with what such a row keeps of its facts, closes and picks
  const seam = (name, R) => new FollowFault(`${said(name)} was retexted in ${R.where}: a retexted row is named by its new words, and following one waits on the landing of relay v187 (the words given back), which is not built`);
  // a name of the store as it stood before the round at `from`, followed on through the rounds from there
  const walkOn = (name, from = 0) => {
    let cur = whole(name), moved = null;
    for (let i = from; i < rounds.length; i += 1) {
      const R = rounds[i], hit = R.left.get(idOf(cur));
      if (!hit) continue;
      if (hit.went === "struck" || hit.went === "withheld") {
        const again = rounds.slice(i).find((L) => L.came.has(idOf(cur)));
        if (again) throw new FollowFault(`${said(cur)} was ${hit.went} in ${R.where} and ${again.where} put a row under the same name: a name cannot say which of the two a list means`);
        return { state: hit.went, by: hit.by, row: hit.row };
      }
      if (hit.went === "re-keyed") { cur = hit.to; moved = hit.by; continue; }
      if (hit.went === "retexted") throw seam(cur, R);
      throw new FollowFault(`${said(cur)} was ${hit.went === "folded" ? "folded into another row by a re-key" : "taken into a rejoined row"} in ${R.where}, and no plan names the answer for such a row`);
    }
    return moved ? { state: "re-keyed", name: cur, by: moved } : { state: "served", name: cur };
  };
  // a name of the store as it stood after the round before `before`, followed back through the rounds before it
  const walkBack = (name, before = rounds.length) => {
    let cur = whole(name), moved = null;
    for (let i = before - 1; i >= 0; i -= 1) {
      const R = rounds[i], hit = R.came.get(idOf(cur));
      if (hit) {
        if (hit.how === "landed") return { state: "landed after", by: hit.by, row: hit.row };
        if (hit.how === "re-keyed") { cur = hit.from; moved = moved || hit.by; continue; }
        if (hit.how === "retexted") throw seam(hit.from, R);
        throw new FollowFault(`${said(cur)} was put back by a restore in ${R.where}, and no plan names the answer for such a row`);
      }
      if (R.left.has(idOf(cur))) throw new FollowFault(`the record says ${said(cur)} left the store in ${R.where} and that no round since put a row under that name: the store cannot hold it`);
    }
    return moved ? { state: "re-keyed", name: cur, by: moved } : { state: "served", name: cur };
  };
  // the three lists, made once where they are first asked
  let lists = null;
  const listsOf = () => {
    if (lists) return lists;
    const gone = [], landed = [], rekeyed = [];
    // the lists say how the whole store differs from the older one: a round since that did what no answer names
    // (THE SEAM among them) makes them short, so they are refused whole, whichever row it was
    for (const R of rounds) {
      for (const hit of R.left.values()) {
        if (hit.went === "retexted") throw seam(hit.name, R);
        if (hit.went === "folded" || hit.went === "rejoined") throw new FollowFault(`${said(hit.name)} was ${hit.went === "folded" ? "folded into another row by a re-key" : "taken into a rejoined row"} in ${R.where}, and no plan names the answer for such a row: how the store differs from the one read at ${readAt} cannot be listed`);
      }
      for (const hit of R.came.values()) if (hit.how === "restored") throw new FollowFault(`${said(hit.name)} was put back by a restore in ${R.where}, and no plan names the answer for such a row: how the store differs from the one read at ${readAt} cannot be listed`);
    }
    rounds.forEach((R, i) => {
      for (const hit of R.left.values()) {
        if (hit.went !== "struck" && hit.went !== "withheld") continue;
        const then = walkBack(hit.name, i);   // a row a round since landed and a later one took was never the older store's
        if (then.state !== "landed after") gone.push({ name: then.name, state: hit.went, by: hit.by, row: hit.row });
      }
      for (const hit of R.came.values()) {
        const now = walkOn(hit.name, i + 1);
        if (hit.how === "landed") { if (now.state === "served" || now.state === "re-keyed") landed.push({ name: now.name, by: hit.by, row: hit.row }); continue; }
        if (hit.how !== "re-keyed" || now.state !== "served") continue;   // moved again, or gone: the later round says so
        const then = walkBack(hit.name, i + 1);
        if (then.state === "re-keyed") rekeyed.push({ name: then.name, now: hit.name, by: hit.by });
      }
    });
    lists = { gone, landed, rekeyed };
    return lists;
  };
  return {
    readAt,
    rounds: since.map((r) => ({ round: numberOf(r), ran_at: r.ran_at, list: r.list ? r.list.file : null, list_sha256: r.list ? r.list.sha256 : null })),
    nowOf: (name) => walkOn(name, 0),
    thenOf: (name) => walkBack(name, rounds.length),
    get gone() { return listsOf().gone; },
    get landed() { return listsOf().landed; },
    get rekeyed() { return listsOf().rekeyed; },
  };
};

export const openFollower = ({ data, index, readAt }) => {
  const path = join(data, RECORD_FILE);
  if (!existsSync(path)) throw new FollowFault(`the row-strikes record is not here (${path})`);
  return follower({ record: JSON.parse(readFileSync(path, "utf8")), index, readAt });
};

// answers counted by the list of the round that gave each, in the order of the rounds
const byList = (f, answers) => {
  const out = {};
  for (const r of f.rounds) { const c = answers.filter((a) => a.by && a.by.round === r.round).length; if (c) out[r.list || r.ran_at] = (out[r.list || r.ran_at] || 0) + c; }
  return out;
};
/** What a tool that lays a list through the follower records of it, and a check counts again. `left` holds the
 *  answers for the lines whose row was struck or withheld, `rekeyed` those for the rows found under another name,
 *  and `landed` (given where the list reads every row of its sources) those for the rows a round since landed,
 *  which have no line. */
export const followedRecord = (f, { left = [], rekeyed = [], landed = null }) => ({
  rule_id: ROW_FOLLOW_RULE_ID,
  record: `reader/data/${RECORD_FILE}`,
  read_at_store_version: f.readAt,
  rounds_since: f.rounds.map((r) => ({ ran_at: r.ran_at, list: r.list })),
  lines_whose_row_was_struck: byList(f, left.filter((a) => a.state === "struck")),
  lines_whose_row_was_withheld: byList(f, left.filter((a) => a.state === "withheld")),
  rows_re_keyed_and_followed: byList(f, rekeyed),
  ...(landed ? { rows_landed_since_with_no_line: byList(f, landed) } : {}),
});
/** The same, in words, for a tool's summary line and a check's. */
export const followedSaid = (rec) => {
  const part = (o, what) => Object.entries(o || {}).map(([list, c]) => `${Number(c).toLocaleString("en-US")} ${what} ${list}`);
  const all = [...part(rec.lines_whose_row_was_struck, "struck by"), ...part(rec.lines_whose_row_was_withheld, "withheld by"), ...part(rec.rows_re_keyed_and_followed, "re-keyed by"), ...part(rec.rows_landed_since_with_no_line, "landed by")];
  return all.length ? all.join(", ") : "no round since has moved a row it names";
};
