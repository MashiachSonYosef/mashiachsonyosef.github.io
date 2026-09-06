#!/usr/bin/env node
// Synthesis lane · the rights record for the restore v5 of the Miqra
// according to the Masorah edition — one record for thirty-nine files
//
// RULE: mam-restore-v5-rights-rule-v1-one-record-for-the-edition-the-credit-on-every-page
// LEDGER: M
//
// The corpus lane's restore v5 carries its rights as facts in two places:
// the representations register (licence id LIC-CC-BY-SA-UNVERSIONED, raw
// licence CC-BY-SA, version "Miqra according to the Masorah", for every
// one of the thirty-nine) and each book's restore receipt (edition, licence,
// source: an extraction from the local Sefaria BSON dump). This tool folds
// those facts into the one record the serve reads, and writes the credit
// line every page of the book prints — which is what discharges a display
// conditioned on attribution.
//
// The credit line is carried, not composed, wherever it can be: the July
// binding (rights-binding-v3) bound thirty-three of these books to the same
// Sefaria version and audited a credit for each — provider, version witness,
// document id, title, version, source, licence. Those lines are carried
// verbatim. For a book the July binding bound to another version, or did not
// bind, the line is composed from the receipt's own facts and says so; the
// witness ids the project does not hold are not invented.
//
// The register names local paths the corpus lane worked from. None of those
// columns is read, and the output refuses to be written if a path of that
// shape appears in it anywhere.
//
// Run: node tools/emit-mam-restore-v5-rights-v1.mjs --bindings <bindings-v3.csv>
//        --representations <representations-v5.csv> --restore-dir <dir of <slug>.json>
//        [--out data/mam-restore-v5-rights-v1.json] [--stamp YYYY-MM-DD]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const BINDINGS = arg("bindings") || die("MISSING_ARG", "--bindings");
const REPR = arg("representations") || die("MISSING_ARG", "--representations");
const RDIR = arg("restore-dir") || die("MISSING_ARG", "--restore-dir");
const OUT = arg("out", "data/mam-restore-v5-rights-v1.json");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const csvSplit = (line) => { const o = []; let cur = "", q = false; for (let i = 0; i < line.length; i += 1) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { o.push(cur); cur = ""; } else cur += c; } o.push(cur); return o; };
const readCsv = (p) => { const L = readFileSync(p, "utf8").split(/\r?\n/u).filter(Boolean); const h = csvSplit(L[0]); return L.slice(1).map((l) => Object.fromEntries(csvSplit(l).map((v, i) => [h[i], v]))); };

const EDITION = "Miqra according to the Masorah";
// only these columns of the register are read; the path columns never are
const KEEP = ["work_id", "source_class", "source_version_title", "license_id", "raw_license", "active_unit_rows", "binding_strength"];
const reps = readCsv(REPR).filter((r) => r.source_class === "MOSES_MAM_RESTORE_V5_SUCCESSOR").map((r) => Object.fromEntries(KEEP.map((k) => [k, r[k]])));
if (reps.length !== 39) die("REPRESENTATIONS_NOT_39", String(reps.length));
const binds = readCsv(BINDINGS);
const bindingsSha = sha(readFileSync(BINDINGS));

// the edition's own source page, as the audited credit lines name it
const mamLines = binds.map((b) => b.credit_line || "").filter((l) => l.includes(`Version: ${EDITION}`) && l.endsWith("License: CC-BY-SA"));
const urlOf = (line) => { const m = /Source: (\S+) \| License/u.exec(line); return m ? m[1] : null; };
const urlCount = new Map();
for (const l of mamLines) { const u = urlOf(l); if (u) urlCount.set(u, (urlCount.get(u) || 0) + 1); }
const MAM_URL = [...urlCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || die("NO_MAM_SOURCE_URL_IN_BINDINGS");

// Sefaria's English title convention, from the slug: I Kings, Song of Songs
const titleOf = (slug) => slug.split("-").map((w) => (/^i+$/u.test(w) ? w.toUpperCase() : w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");

const works = {};
let carriedN = 0, composedN = 0;
for (const r of reps.sort((a, b) => a.work_id.localeCompare(b.work_id))) {
  const slug = r.work_id.split("/").pop();
  const rp = join(RDIR, `${slug}.json`);
  if (!existsSync(rp)) die("RESTORE_RECEIPT_MISSING", rp);
  const rec = JSON.parse(readFileSync(rp, "utf8"));
  if (rec.work_id !== r.work_id) die("RECEIPT_WORK_MISMATCH", `${rp}: ${rec.work_id}`);
  if (rec.edition !== EDITION) die("RECEIPT_EDITION", `${slug}: ${rec.edition}`);
  if (rec.licence !== "CC-BY-SA" || r.raw_license !== "CC-BY-SA" || r.license_id !== "LIC-CC-BY-SA-UNVERSIONED") die("LICENCE_FACTS_DISAGREE", `${slug}: receipt ${rec.licence}, register ${r.license_id}/${r.raw_license}`);
  if (r.source_version_title !== EDITION) die("REGISTER_VERSION", `${slug}: ${r.source_version_title}`);
  const b = binds.find((x) => x.work_id === r.work_id);
  const july = b && b.credit_line && b.credit_line.includes(`Version: ${EDITION}`) && b.credit_line.endsWith("License: CC-BY-SA") ? b : null;
  let credit;
  if (july) {
    carriedN += 1;
    credit = { line: july.credit_line, basis: `carried verbatim from the July binding's audited credit for the same Sefaria version of this book (representation ${july.representation_id}, rights-binding-v3); printing it is what discharges the display condition` };
  } else {
    composedN += 1;
    const title = /Title: ([^|]+) \|/u.exec((b || {}).credit_line || "")?.[1]?.trim() || titleOf(slug);
    const why = !b ? "the July binding carries no row for this book, so no witness id is in custody"
      : !String(b.credit_line || "").trim() ? `the July binding's row for this book carries no attribution record (${b.attribution_state}), so no witness id is in custody`
        : "the July binding bound another Sefaria version of this book, so its witness ids are not this edition's and are not carried";
    credit = { line: `Provider metadata: Sefaria | Title: ${title} | Version: ${EDITION} | Source: ${MAM_URL} | License: CC-BY-SA`,
      basis: `composed from the restore receipt's own facts (provider, title, version, source, licence): ${why}; printing it is what discharges the display condition` };
  }
  works[r.work_id] = {
    title: /Title: ([^|]+) \|/u.exec(credit.line)?.[1]?.trim() || titleOf(slug),
    license_id: r.license_id, raw_license: r.raw_license,
    restore_status: rec.status, restore_surface_sha256: rec.surface_sha256, restore_units: Number(r.active_unit_rows),
    credit,
  };
}

const record = {
  schema_version: "MAM_RESTORE_V5_RIGHTS_V1",
  rule_id: "mam-restore-v5-rights-rule-v1-one-record-for-the-edition-the-credit-on-every-page",
  emitted_by: "tools/emit-mam-restore-v5-rights-v1.mjs",
  recorded_on: STAMP,
  what: "the rights the serve reads for every book of the corpus lane's restore v5 of the Miqra according to the Masorah edition, and the credit line every page of each book prints",
  basis: "the edition's own licence as its provider states it (Sefaria: CC-BY-SA; the edition is Hebrew Wikisource's, published under CC BY-SA), one record for the thirty-nine files of the restore; the credit is printed on every page, which is what discharges the display condition; share-alike rides on every occurrence and the export gate reads it",
  source: {
    provider: "Sefaria", edition: EDITION, edition_source: MAM_URL,
    how_held: "extracted by the corpus lane from a local Sefaria BSON dump (texts.bson) — an extraction, not an acquisition; the restore receipts say so",
    derived_from: [
      { record: basename(REPR), columns_read: KEEP, note: "the register's path columns are never read" },
      { record: basename(BINDINGS), sha256: bindingsSha, note: "the audited credit lines, carried where they name this edition" },
      { record: `${basename(RDIR.replace(/\/+$/u, ""))}/<slug>.json`, note: "the restore receipts: status, edition, licence, surface hash" },
    ],
  },
  licence: {
    normalized_license_class: "CC-BY-SA", license_version: "UNSPECIFIED", terminal_resolution_state: "RESOLVED",
    reader_display_axis: "ALLOW_WITH_ATTRIBUTION", public_distribution_axis: "HOLD_EXACT_DEED_AND_ATTRIBUTION",
    attribution_required: "TRUE", noncommercial_required: "FALSE_OR_NOT_ESTABLISHED", share_alike_required: "TRUE", no_derivatives_required: "FALSE_OR_NOT_ESTABLISHED",
    note: "the version is not stated by the provider's record and is not guessed here; the page displays the text with the credit and the deed family named, and public distribution (the export) is HELD until the exact deed can be named — the same hold the July binding placed on it",
    evidence_for_cc_by_sa: [
      "the audited credit lines of the July binding, read from Sefaria's own version record for this edition, end 'License: CC-BY-SA' (33 books)",
      "the corpus lane's restore receipts state licence CC-BY-SA for all 39 files, extracted from the same Sefaria record",
      "the representations register states LIC-CC-BY-SA-UNVERSIONED / CC-BY-SA for all 39",
      "the edition is Hebrew Wikisource's, whose text is published under CC BY-SA",
    ],
    reconciliation_with_the_july_binding: "the July binding classed these representations under its CC-BY-NC profile while its own audited credit lines read CC-BY-SA; no source this project holds asserts a noncommercial term for this edition, and the credit line the binding audited is carried here as evidence. The July binding's public-distribution HOLD is kept; its display condition (attribution) is discharged by the credit on every page.",
  },
  credits: { carried_from_the_july_binding: carriedN, composed_from_the_receipt: composedN },
  works,
};
const text = JSON.stringify(record, null, 2) + "\n";
if (/\b[A-Za-z]:[\\/](?![\\/])|\/(?:home|root|tmp|mnt|Users)\/|Users[\\/]/u.test(text)) die("PATH_IN_RECORD", "a local path reached the record; refusing to write it");
writeFileSync(OUT, text);
console.log(`${OUT}: ${Object.keys(works).length} works · credit carried ${carriedN}, composed ${composedN} · edition source ${MAM_URL.slice(0, 40)}…`);
