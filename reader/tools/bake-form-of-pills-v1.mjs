#!/usr/bin/env node
// HEBREW DEFINED BY HEBREW, THE MAP THE CARD READS (the owner, on the card
// of a two-word number: "the issue is defining hebrew with hebrew"; ask 2 of
// 23 October to the corpus lane; its answer FOR-ELIJAH-v85, span store v2.1,
// form-of/zone-pills-v1.jsonl).
//
// A pill of the route catalog whose text is a pointer to another entry in the
// source's own words ("singular construct state form of <the target in Hebrew> (av).") is classed
// by the lane: FORM_OF (the whole reading points), MIXED (English sense plus
// a pointer), JUDGMENT and USAGE_NOTE (a branch the owner sets; resting null),
// NOT. For FORM_OF and MIXED the lane resolved the target: the first live
// route row of the target key under the same source whose text holds English
// and is not itself a pointer. This bake folds that file into one small map
// the page fetches when a card needs it: by route key, the pills of that key
// that point, each with its source, its text's sha256 (the page matches the
// pill's own bytes, never a retyped text), its class, the relation as the
// source states it, the target key, and the resolved English where there is
// one. Nothing is respelled: the pill's text stays the source's bytes on the
// card; the resolution rides beside it.
// Usage: node tools/bake-form-of-pills-v1.mjs --from <form-of folder> --relay FOR-ELIJAH-v85.md [--file zone-pills-v1.jsonl] [--out data/form-of-pills-v1.json]
// --file names the pill file inside the folder (the lane re-pinned it as zone-pills-v1.2.jsonl in relay v101); the record names the file it read.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
const arg = (n, d = "") => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const FROM = arg("from"), RELAY = arg("relay"), OUT = arg("out", "data/form-of-pills-v1.json"), FILE = arg("file", "zone-pills-v1.jsonl");
if (!FROM || !RELAY) { console.error("usage: --from <form-of folder holding zone-pills-v1.jsonl> --relay <relay file name> [--out path]"); process.exit(2); }
const src = readFileSync(join(FROM, FILE));
const lines = src.toString("utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const byKey = {};
const counts = { pills: 0, keys: 0, by_class: {}, resolved: 0, unresolved: 0, unresolved_why: {}, with_branch_unset: 0 };
for (const p of lines) {
  counts.pills += 1;
  counts.by_class[p.class] = (counts.by_class[p.class] || 0) + 1;
  if (p.class !== "FORM_OF" && p.class !== "MIXED") {
    // JUDGMENT and USAGE_NOTE wait on the owner's branch (resting null); NOT
    // is not a pointer: none of them is carried to the page
    if ((p.class === "JUDGMENT" || p.class === "USAGE_NOTE") && p.form_of && p.form_of.branch && p.form_of.branch.resting == null) counts.with_branch_unset += 1;
    continue;
  }
  const fo = p.form_of || {};
  const res = fo.resolved && fo.resolved.text ? fo.resolved : null;
  if (res) counts.resolved += 1; else { counts.unresolved += 1; const w = fo.resolved_why || "UNSAID"; counts.unresolved_why[w] = (counts.unresolved_why[w] || 0) + 1; }
  // the pill's own text rides in the map so the page matches a pill by
  // string equality (no hashing in the browser) and can show the target as
  // the source wrote it, cut out of the text at the lane's byte offsets
  (byKey[p.key] = byKey[p.key] || []).push({
    m: p.m_id, t: p.text, sha: p.text_sha256.slice(0, 16), class: p.class, at: Array.isArray(fo.at) ? fo.at : null,
    relation: fo.relation || "", target: fo.key || "", kind: fo.kind || "",
    resolved: res ? { key: res.key, text: res.text } : null, why: res ? undefined : (fo.resolved_why || "UNSAID"),
  });
}
counts.keys = Object.keys(byKey).length;
counts.carried = Object.values(byKey).reduce((n, l) => n + l.length, 0);   // the pills in the map: FORM_OF and MIXED; the rest wait on the owner
const out = {
  schema_version: "FORM_OF_PILLS_V1",
  rule_id: "form-of-pills-rule-v1-the-pointer-stays-the-sources-bytes-the-resolution-rides-beside-it",
  what: "by route key, the pills of the 39 books whose text is a pointer to another entry (FORM_OF, MIXED), each with its source M id, its own text (the page matches a pill by its own bytes) and the first 16 hex of its sha256, the byte range of the target inside that text, the relation as the source states it, the target key and kind, and the target's first English under the same source where the lane resolved it (else why not). JUDGMENT and USAGE_NOTE pills wait on the owner's branch and are not here; NOT pills are not pointers.",
  taken_from: { relay: RELAY, file: `form-of/${FILE}`, sha256: createHash("sha256").update(src).digest("hex"), bytes: src.length },
  counts, keys: byKey,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`form-of pills baked: ${counts.pills} pills read, ${counts.keys} keys carried (${counts.resolved} resolved, ${counts.unresolved} not), by class ${JSON.stringify(counts.by_class)}; ${counts.with_branch_unset} wait on the owner's branch; ${OUT} ${JSON.stringify(out).length} bytes`);
