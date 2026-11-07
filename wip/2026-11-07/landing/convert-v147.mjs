// Moses's v147 lists (landing, misfiled-v2, font-encoding) -> one list for strike-rows v5 (land + retext), with the provenance of each line
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const L = `${S}/dl-moses2/corpus-lane-builds/moses-store-lists-v1/landing`;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const lines = (p) => readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
// the sources' years as their rows carry them
const year = {};
for (const f of readdirSync("data/route-store/shards")) { if (!/^[0-9a-f]{2}\.bin$/.test(f)) continue; const body = JSON.parse(gunzipSync(readFileSync(`data/route-store/shards/${f}`)).toString("utf8")); for (const rs of Object.values(body)) for (const r of rs) if (!(r[3] in year)) year[r[3]] = r[4]; }
const record = JSON.parse(readFileSync("data/row-strikes-v1.json", "utf8"));
const withheld = (key, m, rank) => { for (const [i, r] of record.rounds.entries()) for (const t of r.rows || []) if (t.action === "withhold" && t.key === key && String(t.m) === m && Number(t.rank) === rank) return { round: i, row: t.row, kind: t.kind }; return null; };
const out = [];
const prov = { landing: sha(`${L}/landing-v1.jsonl`), misfiled: sha(`${L}/misfiled-v2.jsonl`), font: sha(`${L}/font-encoding-v1.jsonl`) };
for (const e of lines(`${L}/landing-v1.jsonl`)) {
  if (e.action !== "land") throw new Error(`landing line is not a land: ${e.action}`);
  out.push({ action: "land", m: e.m, key: e.key, rank: e.rank, rank_from: e.rank_from, route: e.route, definition: e.definition, headwords: e.headwords, year: year[e.m], kind: e.kind, why: e.why, strongs: e.strongs, definition_source: e.definition_source, record_loc: e.record_loc, record_file: e.record_file, beside: e.beside, line_today: e.line_today ?? null, line_with_landing: e.line_with_landing ?? null, from: { list: "landing-v1.jsonl", sha256: prov.landing, relay: "v147" } });
}
// the name under bread: the withheld half, rejoined, lands under the name's own letters
const [mf] = lines(`${L}/misfiled-v2.jsonl`);
const wh = withheld(mf.key, mf.m, mf.rank); if (!wh) throw new Error("the withheld row of לחם rank 81 is not in the record");
console.log("misfiled line:", JSON.stringify(mf).slice(0, 1400));
console.log("withheld row def:", JSON.stringify(wh.row[2]));
out.push({ action: "land", m: mf.m, key: mf.to_key, rank: 1, rank_from: "a key the store never held: the first rank", route: mf.rejoined_text, definition: wh.row[2], headwords: mf.to_headwords, year: year[mf.m], kind: mf.kind, strongs: "H3433",
  why: `${mf.why} The row stood withheld under ${mf.key} (data/row-strikes-v1.json round ${wh.round}, ${wh.kind}); it lands whole, as v146 rejoined it, under the name's own letters, with the record's headword.`,
  definition_source: `the withheld row's own definition slot (data/row-strikes-v1.json, round ${wh.round})`, beside: [{ key: mf.key, m: mf.m, rank: mf.rank, route: mf.route, in_served_store: false, withheld_in_round: wh.round }],
  from: { list: "misfiled-v2.jsonl", sha256: prov.misfiled, relay: "v147" } });
// the font encoding: a served row retexted from the source's own Unicode; the withheld run lands decoded
for (const e of lines(`${L}/font-encoding-v1.jsonl`)) {
  if (e.in_served_store) {
    out.push({ action: "retext", m: e.m, key: e.key, rank: e.rank, route: e.route, to_text: e.decoded, from_slot: "source_unicode", runs: e.runs, kind: e.kind, why: `${e.why} The route is the reading as the source's own key decodes it; the definition slot keeps the source's bytes as delivered.`, from: { list: "font-encoding-v1.jsonl", sha256: prov.font, relay: "v147" } });
  } else {
    const a = withheld(e.key, e.m, 18), b = withheld(e.key, e.m, 19); if (!a || !b) throw new Error("the withheld halves of קש are not in the record");
    out.push({ action: "land", m: e.m, key: e.key, rank: 18, rank_from: "the withheld halves' rank (18 and 19) in the store served before v146", route: e.decoded, definition: a.row[2], headwords: a.row[6], year: year[e.m], kind: "withheld_halves_rejoined_and_decoded", runs: e.runs,
      why: `${e.why} The two halves stood withheld (data/row-strikes-v1.json round ${a.round}, ${a.kind}); their rejoined run (v146) lands as one row with its runs decoded by the source's own key; the definition slot keeps the source's bytes as delivered.`,
      definition_source: `the withheld rows' own definition slot (data/row-strikes-v1.json, round ${a.round})`, beside: [{ key: e.key, m: e.m, rank: 18, route: a.row[1], in_served_store: false, withheld_in_round: a.round }, { key: e.key, m: e.m, rank: 19, route: b.row[1], in_served_store: false, withheld_in_round: b.round }],
      from: { list: "font-encoding-v1.jsonl", sha256: prov.font, relay: "v147" } });
  }
}
writeFileSync(`${S}/v15/lists/land-and-decode-v147-v1.jsonl`, out.map((x) => JSON.stringify(x)).join("\n") + "\n");
console.log(`written ${out.length} lines: ${out.filter((x) => x.action === "land").length} land, ${out.filter((x) => x.action === "retext").length} retext · years ${JSON.stringify({ M14: year.M14, M23: year.M23 })}`);
