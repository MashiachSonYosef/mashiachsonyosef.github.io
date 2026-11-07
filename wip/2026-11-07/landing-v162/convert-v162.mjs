// Moses's v162 landing list (landing-v2.jsonl) -> a list for the row strike's `land` action (row-strike-rule-v5),
// with the provenance of each line. Run from reader/ (the store it lands on is data/route-store).
// usage: node convert-v162.mjs <landing-v2.jsonl> <records dir> <out.jsonl>
//   <records dir>: the corpus lane's dictionary-store-v1 records (corpus-lane-builds/moses-dictionary-store-v1/build/
//   dictionary-store-v1/records/: M13-1.jsonl, M13-2.jsonl, M25.jsonl, M60.jsonl, M72.jsonl, M7.jsonl, M23.jsonl, M17.jsonl)
//
// Every line is proved again against the store it lands on (v162's own ask, its point 6):
//   - exactly one row of the line's m stands under its key at its rank (the record's own row: its sibling),
//     carrying the line's definition and year;
//   - no row of any source under the key holds the line's text.
// HEADWORDS. The landed row takes the headwords its sibling carries in the store. The list names the record's
// headwords, and for 32 lines they are not what the source's rows carry: every Kaikki main-table row (M13, M60)
// carries the bare key alone, every Kaikki form-table row (M25, M72) the form's own pointing. A landed row is another
// sense of the same record, so it carries what its record's row carries and grades as that row does at every place;
// the line keeps the list's headwords beside them (headwords_in_list).
// DEFINITION. The definition slot follows the source's rows too. Where every row of the source carries its own route
// as its definition (Kaikki's four tables and unfoldingWord: every one of their rows in the store), the landed row
// does: a landed sense is not the sense beside it, so it does not take that sense's definition. Elsewhere (Classical
// Hebrew, SDBH) the definition is the record's whole text, the sibling's, and it must hold the landed text.
// RANK AND PLACE. The rank is the list's, the record's own: the store never renumbers, so a lost sense or piece shares
// its record's rank. Where it stands there is read from the record itself: before the record's row where the record
// prints the landed text first, after it where the record prints it after (place "after"). The order read is named
// in the line (record_order): Kaikki's senses in order, unfoldingWord's glosses in order, Classical Hebrew's and
// SDBH's definition split at its semicolons. A line whose two texts the record does not both hold stops this.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const [LIST, RDIR, OUT] = process.argv.slice(2);
if (!LIST || !RDIR || !OUT) { console.log("usage: node convert-v162.mjs <landing-v2.jsonl> <records dir> <out.jsonl>   (from reader/)"); process.exit(2); }
const STORE = "data/route-store";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const shards = new Map();
const shardBody = (n) => { if (!shards.has(n)) shards.set(n, JSON.parse(gunzipSync(readFileSync(`${STORE}/shards/${n}`)).toString("utf8"))); return shards.get(n); };
const rowsOf = (k) => shardBody(`${sha256(Buffer.from(k, "utf8")).slice(0, 2)}.bin`)[k] || [];
const fail = (msg) => { console.log(`STOP — ${msg}`); process.exit(1); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const listBytes = readFileSync(LIST);
const listSha = sha256(listBytes);
if (listSha !== "d9aa0b653d5a37251c2e363c2070fa51e09536bf559ce65921ef1517986937ef") fail(`landing-v2.jsonl is not the relay's bytes (sha256 ${listSha})`);
const index = JSON.parse(readFileSync(`${STORE}/index.json`, "utf8"));
const lines = listBytes.toString("utf8").split("\n").filter((l) => l.trim()).map((l, i) => ({ ...JSON.parse(l), _line: i + 1 }));
const land = lines.filter((e) => e.action === "land");
const named = lines.filter((e) => e.action !== "land");
if (land.length !== 69 || named.length !== 39) fail(`the list holds ${land.length} landing lines and ${named.length} named; v162 says 69 and 39`);

// ---- per source of the list: does every row of it carry its route as its definition? ----
const mOfList = new Set(land.map((e) => String(e.m)));
const defShape = Object.fromEntries([...mOfList].map((m) => [m, { rows: 0, def_is_route: 0 }]));
for (const f of readdirSync(`${STORE}/shards`).filter((x) => /^[0-9a-f]{2}\.bin$/.test(x))) {
  for (const rows of Object.values(shardBody(f))) for (const r of rows) {
    const d = defShape[String(r[3])]; if (!d) continue;
    d.rows += 1; if (String(r[2] ?? "") === r[1]) d.def_is_route += 1;
  }
}
const ownDef = (m) => defShape[m].rows > 0 && defShape[m].def_is_route === defShape[m].rows;
console.log(`definition shape by source: ${Object.entries(defShape).map(([m, d]) => `${m} ${d.def_is_route}/${d.rows}${ownDef(m) ? " (own)" : ""}`).join(" · ")}`);

// ---- the records the lines name, from the corpus lane's record files ----
const RECORD_FILES = { M13: ["M13-1.jsonl", "M13-2.jsonl"], M25: ["M25.jsonl"], M60: ["M60.jsonl"], M72: ["M72.jsonl"], M7: ["M7.jsonl"], M23: ["M23.jsonl"], M17: ["M17.jsonl"] };
const rids = new Set(land.map((e) => e.rid));
const records = new Map();
const recordFileSha = {};
for (const m of mOfList) {
  if (!RECORD_FILES[m]) fail(`no record file is known for ${m}`);
  for (const f of RECORD_FILES[m]) {
    const p = join(RDIR, f);
    if (!existsSync(p)) fail(`the record file ${p} is not there`);
    const bytes = readFileSync(p);
    recordFileSha[f] = sha256(bytes);
    for (const l of bytes.toString("utf8").split("\n")) {
      const hit = /"rid":\s*"([0-9a-f]{16})"/.exec(l);
      if (!hit || !rids.has(hit[1])) continue;
      const r = JSON.parse(l);
      if (String(r.m) === m) records.set(`${m}|${r.rid}`, r);
    }
  }
}
// the record's texts in its own order
const orderOf = (e, r) => {
  const m = String(e.m);
  if (["M13", "M25", "M60", "M72"].includes(m)) {
    const d = JSON.parse(r.D);
    return { by: "the record's senses in order (Kaikki: each sense's glosses)", texts: (d.senses || []).flatMap((s) => s.glosses || []) };
  }
  if (m === "M7") {
    const blocks = [...String(r.D).matchAll(/#### Glosses:\s*\n\s*\n(.*?)\n/g)].map((x) => x[1]);
    return { by: "the record's glosses in order (unfoldingWord: each sense's Glosses line, split at its semicolons)", texts: blocks.flatMap((b) => b.split(";").map((x) => x.trim()).filter(Boolean)) };
  }
  return { by: "the record's definition split at its semicolons", texts: String(e.definition).split(";").map((x) => x.trim()).filter(Boolean) };
};

const out = [];
let hwFromRow = 0, defOwn = 0;
const places = { before: 0, after: 0 };
for (const e of land) {
  if (e.to_key !== null && e.to_key !== undefined) fail(`line ${e._line}: a landing with a to_key`);
  const rows = rowsOf(e.key);
  const sib = rows.filter((r) => String(r[3]) === String(e.m) && r[0] === e.rank);
  if (sib.length !== 1) fail(`line ${e._line} ${e.m} ${e.key} rank ${e.rank}: ${sib.length} rows of the record at its rank, not one`);
  const [s] = sib;
  if (s[2] !== e.definition) fail(`line ${e._line} ${e.m} ${e.key} rank ${e.rank}: the record's row carries another definition («${String(s[2]).slice(0, 60)}»)`);
  if (String(s[4]) !== String(e.year)) fail(`line ${e._line} ${e.m} ${e.key} rank ${e.rank}: the record's row carries the year ${s[4]}, the list ${e.year}`);
  const holders = rows.filter((r) => r[1] === e.route);
  if (holders.length) fail(`line ${e._line} ${e.m} ${e.key}: «${e.route}» is held under the key by ${holders.map((r) => `${r[3]}@${r[0]}`).join(",")}`);
  const own = ownDef(String(e.m));
  if (own) defOwn += 1; else if (!String(e.definition).includes(e.route)) fail(`line ${e._line} ${e.m} ${e.key}: the record's definition does not hold «${e.route}»`);
  const hw = s[6];
  if (!Array.isArray(hw) || !hw.length) fail(`line ${e._line} ${e.m} ${e.key} rank ${e.rank}: the record's row carries no headwords`);
  const differ = !same(hw, e.headwords);
  if (differ) hwFromRow += 1;
  const rec = records.get(`${e.m}|${e.rid}`);
  if (!rec) fail(`line ${e._line} ${e.m} ${e.key}: the record ${e.rid} is not in the record files`);
  const ord = orderOf(e, rec);
  const at = ord.texts.indexOf(e.route), sibAt = ord.texts.indexOf(s[1]);
  if (at < 0 || sibAt < 0) fail(`line ${e._line} ${e.m} ${e.key}: the record's order (${ord.by}) holds ${at < 0 ? `no «${e.route}»` : ""}${at < 0 && sibAt < 0 ? " and " : ""}${sibAt < 0 ? `no «${s[1]}»` : ""}`);
  const place = at < sibAt ? "before" : "after";
  places[place] += 1;
  out.push({
    action: "land", m: e.m, key: e.key, rank: e.rank, rank_from: e.rank_from, route: e.route, place,
    definition: own ? e.route : e.definition, headwords: hw, year: String(s[4]), kind: e.kind, why: e.why,
    definition_source: own
      ? `the landed text itself: every one of this source's ${defShape[String(e.m)].rows} rows in the served store carries its route as its definition (the list's, the sense beside it, kept in definition_in_list)`
      : "the list's definition, the definition slot of the record's own row at this rank in the served store (the record's whole text, which holds the landed text)",
    ...(own ? { definition_in_list: e.definition } : {}),
    headwords_source: differ
      ? "the record's own row at this rank in the served store (the source's rows carry these; the list names the record's headwords, kept in headwords_in_list)"
      : "the list, the same as the record's own row at this rank in the served store",
    ...(differ ? { headwords_in_list: e.headwords } : {}),
    record_order: { by: ord.by, landed_text_at: at, record_row_at: sibAt, texts: ord.texts.slice(0, 8).map((t) => t.slice(0, 80)) },
    record_loc: e.record_loc, record_file: e.record_file, rid: e.rid, item: e.item, source: e.source,
    beside: [{ key: e.key, m: e.m, rank: s[0], route: s[1], in_served_store: true, the_record_s_row_at_this_rank: true }],
    from: { list: "landing-v2.jsonl", sha256: listSha, line: e._line, relay: "v162", store_read_against: index.store_version },
  });
}
writeFileSync(OUT, out.map((x) => JSON.stringify(x)).join("\n") + "\n");
const by = {}; for (const x of out) by[x.m] = (by[x.m] || 0) + 1;
console.log(`written ${out.length} landing lines on ${new Set(out.map((x) => x.key)).size} keys against store ${index.store_version} · by m ${JSON.stringify(by)} · headwords from the record's row ${hwFromRow} · definition the landed text itself ${defOwn} · place ${JSON.stringify(places)} · named, not landed ${named.length} (not in this list)`);
console.log(`record files read: ${Object.entries(recordFileSha).map(([f, h]) => `${f} ${h.slice(0, 12)}`).join(" · ")}`);
console.log(`sha256 ${sha256(readFileSync(OUT))}`);
