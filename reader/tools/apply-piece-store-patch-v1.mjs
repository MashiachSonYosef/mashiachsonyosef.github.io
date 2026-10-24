#!/usr/bin/env node
// Lays the corpus lane's piece store v2.1 patch (FOR-ELIJAH-v86, the mend of
// the pieces with no English) over piece store v2 as a new folder, without
// touching either mirror, so tools/bake-piece-store-v1.mjs can bake the
// mended store from it. RULE-piece-store-v2.1 §3 and A4 MEND say how the
// patch applies: a claims-patch line carries the claim as v2 holds it
// (v2_claim) and as v2.1 would carry it (v2_1_claim: rec, r and sign set,
// every other field as v2), so the v2 line is replaced by the v2.1 line in
// its book's claims file; a records-new line is a record no v2 record holds,
// in v2's record shape, so it is added to the records file of its source and
// of the book whose mended claim names it. The blank ledger is not part of
// the store (the bake's caller carries it beside the served index).
// Every file the patch leaves alone is hard-linked (copied where a link
// fails); a patched file is rewritten with the same line bytes but for the
// replaced lines (the new record lines are the patch's own bytes).
// Usage: node tools/apply-piece-store-patch-v1.mjs --from <piece-store-v2> --patch <piece-store-v2.1> --out <folder>
import { readFileSync, writeFileSync, mkdirSync, existsSync, linkSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", ""), PATCH = arg("patch", ""), OUT = arg("out", "");
if (!FROM || !existsSync(join(FROM, "index.json")) || !PATCH || !existsSync(join(PATCH, "claims-patch-v1.jsonl")) || !OUT) {
  console.error("usage: --from <piece store v2: index.json, claims/, records/> --patch <piece store v2.1: claims-patch-v1.jsonl, records-new-v1.jsonl, index.json> --out <new folder>");
  process.exit(2);
}
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const lines = (buf) => buf.toString("utf8").split("\n").filter(Boolean);
const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
const pix = JSON.parse(readFileSync(join(PATCH, "index.json"), "utf8"));
const patchBuf = readFileSync(join(PATCH, "claims-patch-v1.jsonl"));
const newBuf = readFileSync(join(PATCH, "records-new-v1.jsonl"));
const patch = lines(patchBuf).map((l) => JSON.parse(l));
const recordsNew = lines(newBuf).map((l) => ({ raw: l, rec: JSON.parse(l) }));
// which book names each new record: the patch's mended claims (a record file
// is per source and book; a record line names neither)
const srcOf = (m) => ({ "PIECE:TAHOT": "tahot", "PIECE:MACULA": "macula" })[m];
const namedIn = new Map();
for (const l of patch) for (const rid of l.v2_1_claim[7] || []) { if (!namedIn.has(rid)) namedIn.set(rid, new Set()); namedIn.get(rid).add(l.book); }
const place = (dir) => mkdirSync(dir, { recursive: true });
const carry = (rel) => { const s = join(FROM, rel), d = join(OUT, rel); place(join(d, "..")); try { linkSync(s, d); } catch { copyFileSync(s, d); } };
const changed = {};   // rel path -> { lines, bytes, sha256, replaced | added }
let replaced = 0, added = 0;
// claims: replace each v2 line by its v2.1 line, exactly one match each
const byBook = new Map();
for (const l of patch) { if (!byBook.has(l.book)) byBook.set(l.book, []); byBook.get(l.book).push(l); }
for (const book of ix.books) {
  const rel = join("claims", `${book}.jsonl`);
  const ls = byBook.get(book);
  if (!ls) { carry(rel); continue; }
  const src = readFileSync(join(FROM, rel), "utf8");
  const arr = src.split("\n");
  for (const l of ls) {
    const was = JSON.stringify(l.v2_claim), now = JSON.stringify(l.v2_1_claim);
    const hits = arr.map((x, i) => (x === was ? i : -1)).filter((i) => i > -1);
    if (hits.length !== 1) { console.error(`${rel}: the v2 claim of ${book} ${l.place} row ${l.served_row_index} matches ${hits.length} lines, not one`); process.exit(1); }
    arr[hits[0]] = now; replaced += 1;
  }
  const out = arr.join("\n");
  place(join(OUT, "claims")); writeFileSync(join(OUT, rel), out);
  changed[rel] = { replaced: ls.length };
}
// records: add each new record to the file of its source and book
const addTo = new Map();
for (const { raw, rec } of recordsNew) {
  const books = namedIn.get(rec.rid);
  if (!books || books.size !== 1) { console.error(`records-new ${rec.rid}: named by ${books ? books.size : 0} books' mended claims, not one`); process.exit(1); }
  const rel = join("records", srcOf(rec.m), `${[...books][0]}.jsonl`);
  if (!addTo.has(rel)) addTo.set(rel, []); addTo.get(rel).push(raw);
}
for (const src of ["tahot", "macula"]) for (const book of ix.books) {
  const rel = join("records", src, `${book}.jsonl`);
  if (!existsSync(join(FROM, rel))) continue;
  const adds = addTo.get(rel);
  if (!adds) { carry(rel); continue; }
  const have = readFileSync(join(FROM, rel), "utf8");
  const rids = new Set(lines(Buffer.from(have)).map((l) => JSON.parse(l).rid));
  for (const raw of adds) { const rid = JSON.parse(raw).rid; if (rids.has(rid)) { console.error(`${rel}: ${rid} is already a v2 record`); process.exit(1); } }
  place(join(OUT, "records", src)); writeFileSync(join(OUT, rel), `${have.endsWith("\n") ? have : `${have}\n`}${adds.join("\n")}\n`);
  added += adds.length; changed[rel] = { added: adds.length };
}
// the carried files, as v2 holds them (the bake does not read them)
if (existsSync(join(FROM, "carried"))) for (const f of readdirSync(join(FROM, "carried"))) carry(join("carried", f));
// the index: v2's, with the patched files' bytes, sha256 and lines re-measured
// and the patch named
const files = (ix.files || []).map((f) => {
  if (!changed[f.path] || !existsSync(join(OUT, f.path))) return f;
  const buf = readFileSync(join(OUT, f.path));
  return { ...f, bytes: buf.length, sha256: sha(buf), lines: lines(buf).length, patched: changed[f.path] };
});
const patchFiles = Object.fromEntries(["claims-patch-v1.jsonl", "records-new-v1.jsonl", "blank-ledger-v1.jsonl", "index.json"].filter((f) => existsSync(join(PATCH, f))).map((f) => { const buf = readFileSync(join(PATCH, f)); return [f, { bytes: buf.length, sha256: sha(buf), lines: f.endsWith(".jsonl") ? lines(buf).length : undefined }]; }));
const out = { ...ix, files, patch: { build: basename(PATCH.replace(/\/+$/u, "")), schema: pix.schema, rule: pix.rule, rule_sha256_as_first_written: pix.rule_sha256_as_first_written, date: pix.date, amendments: pix.amendments, files: patchFiles, applied: { claims_replaced: { value: replaced, axis: "claims" }, records_added: { value: added, axis: "records" }, files_rewritten: Object.keys(changed).sort() }, how: "RULE-piece-store-v2.1 §3 and A4 MEND: each claims-patch line's v2_claim (byte-equal to one v2 claims line) is replaced by its v2_1_claim (rec, r, sign set; every other field as v2); each records-new line is added to records/<src>/<book>.jsonl for the source its m names and the book whose mended claim names its rid" } };
writeFileSync(join(OUT, "index.json"), JSON.stringify(out));
console.log(`${OUT}: ${replaced} claims replaced [claims], ${added} records added [records], ${Object.keys(changed).length} files rewritten; ${(ix.files || []).length} files listed`);
for (const [rel, c] of Object.entries(changed).sort()) console.log(`  ${rel} ${JSON.stringify(c)}`);
