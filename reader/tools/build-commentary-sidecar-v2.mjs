#!/usr/bin/env node
// Synthesis lane · zone-commentary-rule-v3-two-zones-one-coordinate
//
// A commentary sidecar built from two zones already on the shelf. The base
// book and the work that stands on it were both served by the one pipeline,
// both verified against the identity bridge, both carry their own rights on
// every occurrence; this tool reads the two finished zones and attaches by
// the coordinates their sealed unit ids already carry. Nothing is fetched,
// nothing is re-served, nothing is inferred about the text.
//
// It replaces build-commentary-zone.mjs's road for the case where both works
// are ALREADY zones — that tool re-walked the serve output and the bridge,
// which the fleet has already done for every work on this shelf. Reading the
// zones is reading the same facts one step later, with their receipts on.
//
// The attachment rule, declared before output:
//   1. Both works are read from their own zone. A commentary unit is never
//      invented for a base section that has none.
//   2. Attachment is by coordinate identity of the two sealed unit ids:
//      ruth-1-1 receives aramaic-targum-to-ruth-1-1. Where the work's id
//      carries one more number than the base's — ibn-ezra-on-zechariah-1-1-2
//      against zechariah-1-1 — the base coordinate is the work's PREFIX and
//      the extra number is the work's own order inside the section. That is a
//      second basis, named on every entry, never folded into the first.
//   3. Alignment is total from the work's side: a base section with no
//      commentary is fine; a commentary unit with no base section is a
//      refusal, because the two works would disagree about the shape of the
//      book and the page would be hiding it.
//   4. The commentary ships as words with their exact keys, as the zone holds
//      them, so its own text is tappable and answers from the same catalog.
//      Its gloss is the work zone's own gloss, restricted to the words used.
//   5. Licence is the only gate, and it is the work zone's own — recorded on
//      the zone by the fleet from the work's own rows (license_receipts). A
//      work whose reader-display axis is not ALLOW is emitted HELD, by name,
//      with its disposition, never dropped and never averaged.
//
// Output is the shape zone.html already reads: units[baseUnit].section[],
// works[], gloss, counts.attached_sections.
//
// Run: node tools/build-commentary-sidecar-v2.mjs --base ruth
//        --work aramaic-targum-to-ruth [--work targum-jonathan-on-ruth …]
//        --stamp YYYY-MM-DD [--out data/zones/ruth.commentary.bin]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const RULE_ID = "zone-commentary-rule-v3-two-zones-one-coordinate";
const HERE = dirname(fileURLToPath(import.meta.url));
const ZONES = join(HERE, "..", "data", "zones");

const args = process.argv.slice(2);
const arg = (f, d = null) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const argAll = (f) => args.map((a, i) => (a === f ? args[i + 1] : null)).filter(Boolean);
const base = arg("--base"), workSlugs = argAll("--work"), stamp = arg("--stamp");
if (!base || !workSlugs.length || !stamp) { console.error("usage: --base <slug> --work <slug> [--work …] --stamp YYYY-MM-DD [--out path]"); process.exit(2); }
const outPath = arg("--out", join(ZONES, `${base}.commentary.bin`));

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const loadZone = (slug) => {
  const p = join(ZONES, `${slug}.bin`);
  if (!existsSync(p)) throw new Error(`NO_ZONE ${slug}: ${p}`);
  const raw = readFileSync(p);
  return { zone: JSON.parse(gunzipSync(raw).toString("utf8")), sha256: sha256(raw), path: `data/zones/${slug}.bin` };
};
const coordOf = (unit, slug) => (unit.startsWith(`${slug}-`) ? unit.slice(slug.length + 1) : null);

// ---- the licence, as the fleet recorded it on the work's own zone ---------
// per_occurrence reads "2,139 rows: PUBLIC_DOMAIN · UNSPECIFIED · ALLOW · …";
// several postures are joined with " | ", and that is a refusal here.
const postureOf = (z) => {
  const s = String((z.emitted_from && z.emitted_from.license_receipts || {}).per_occurrence || "");
  const parts = s.split(" — ")[0].split(" | ");
  if (parts.length !== 1) throw new Error(`MIXED_LICENSE_POSTURE ${z.work}: ${s}`);
  const m = /rows: ([A-Z_]+) · ([A-Z0-9_.]+) · ([A-Z_]+) · ([A-Z_]+)/u.exec(parts[0]);
  if (!m) throw new Error(`POSTURE_UNREAD ${z.work}: ${s}`);
  return { license_class: m[1], license_version: m[2], reader_display: m[3], public_distribution: m[4], as_recorded: s };
};
const licenseName = (cls) => (cls === "PUBLIC_DOMAIN" ? "Public Domain" : cls);

const B = loadZone(base);
// the sidecar names the book it rides beside by the book's own work id, as
// the base zone's receipts record it — a sidecar beside the wrong zone says so
const baseWorkId = (String((B.zone.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/u) || [])[1] || base;
const baseAt = new Map();
for (const s of B.zone.sections || []) { const c = coordOf(s.unit, base); if (c) baseAt.set(c, s.unit); }

const units = {}, works = [], gloss = {}, glossM = {}, spans = {}, alignment = [], sources = { base: { path: B.path, sha256: B.sha256 }, works: [] };
let attachedAll = 0, wordsAll = 0, glossedAll = 0;
const put = (unitId, entry) => { (units[unitId] = units[unitId] || { section: [] }).section.push(entry); };

workSlugs.forEach((slug, wi) => {
  const W = loadZone(slug);
  const z = W.zone;
  const posture = postureOf(z);
  const held = posture.reader_display !== "ALLOW";
  const workId = (String((z.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/u) || [])[1] || slug;
  const bn = (String((z.work_receipts || {}).b_n || "").match(/^(B-\d+ \/ N-\d+)/u) || [])[1] || null;
  works.push({
    id: workId, title: z.work || slug, title_he: z.work_he || null, family_en: z.work || slug, b_n: bn, grain: "SECTION", zone: slug,
    license: licenseName(posture.license_class), license_class: posture.license_class, license_version: posture.license_version,
    reader_display: posture.reader_display, license_as_recorded: posture.as_recorded,
    held: held ? "license" : null,
  });
  sources.works.push({ slug, path: W.path, sha256: W.sha256 });
  let attached = 0, words = 0, glossed = 0, exact = 0, prefixed = 0;
  const unmatched = [];
  const keysUsed = new Set();
  for (const s of z.sections || []) {
    const c = coordOf(s.unit, slug);
    if (!c) { unmatched.push(s.unit); continue; }
    let baseUnit = baseAt.get(c), basis = "SEALED_UNIT_COORDINATE_IDENTITY", order = null;
    if (!baseUnit) {
      // rule 2, second basis: the base coordinate is the work's prefix
      const parts = c.split("-");
      if (parts.length === 3 && baseAt.has(`${parts[0]}-${parts[1]}`)) { baseUnit = baseAt.get(`${parts[0]}-${parts[1]}`); basis = "SEALED_UNIT_COORDINATE_PREFIX"; order = Number(parts[2]); }
    }
    if (!baseUnit) { unmatched.push(s.unit); continue; }
    if (basis === "SEALED_UNIT_COORDINATE_IDENTITY") exact += 1; else prefixed += 1;
    const ws = (s.words || []);
    for (const w of ws) { const ks = w.w ? w.w.map((r) => r.k) : (w.k ? [w.k] : []); for (const k of ks) if (k) keysUsed.add(k); if (ks.some((k) => z.gloss && z.gloss[k])) glossed += 1; }
    words += ws.length; attached += 1;
    const label = s.label || c.replace(/-/gu, ":");
    put(baseUnit, {
      // the reader prints "<work> · <ref>", so the ref is the coordinate alone
      work: wi, unit: s.unit, ref: label, label: `${z.work || slug} · ${label}`,
      words: held ? [] : ws, text: ws.map((x) => x.s).join(" "),
      state: "PROVEN_EDGE", basis, order,
      license: licenseName(posture.license_class), license_class: posture.license_class, license_basis: "PER_WORK_ROWS_AS_RECORDED_ON_THE_ZONE",
      ...(held ? { held: "license", disposition: posture.reader_display } : {}),
    });
  }
  if (unmatched.length) throw new Error(`COMMENTARY_UNIT_WITHOUT_BASE_SECTION ${slug}: ${unmatched.length} unit(s), first ${unmatched.slice(0, 3).join(", ")} — the two works disagree about the shape of ${base}`);
  // the work's own gloss, the witness record that licenses each reading
  // (gloss_m: lic, m, y — a reading shown is a reading licensed), and spans,
  // all restricted to what was attached
  for (const k of keysUsed) {
    if (z.gloss && z.gloss[k] && !gloss[k]) { gloss[k] = z.gloss[k]; if (z.gloss_m && z.gloss_m[k]) glossM[k] = z.gloss_m[k]; }
    if (z.spans && z.spans[k] && !spans[k]) spans[k] = z.spans[k];
  }
  alignment.push({ work: slug, rule: prefixed ? "SEALED_UNIT_COORDINATE_IDENTITY + SEALED_UNIT_COORDINATE_PREFIX" : "SEALED_UNIT_COORDINATE_IDENTITY",
    commentary_units: (z.sections || []).length, attached, by_identity: exact, by_prefix: prefixed, words, glossed_words: glossed, held: held ? posture.reader_display : null });
  attachedAll += attached; wordsAll += words; glossedAll += glossed;
});

// spans carry interned roles/rules/conf per zone; a sidecar that mixes zones
// cannot share those tables, so spans ride only when one work supplied them
const spanTables = workSlugs.length === 1 ? (() => { const z = loadZone(workSlugs[0]).zone; return { span_roles: z.span_roles || [], span_rules: z.span_rules || [], span_conf: z.span_conf || [] }; })() : { span_roles: [], span_rules: [], span_conf: [] };
if (workSlugs.length !== 1) for (const k of Object.keys(spans)) delete spans[k];
// the component layer's own receipt rides with it (pass-through-rule-v1: a
// sealed layer names the sealed file it came from, or nobody downstream can
// audit it) — the work zone's, restricted to the forms attached
const spanLayer = workSlugs.length === 1
  ? { ...((loadZone(workSlugs[0]).zone.emitted_from || {}).span_layer || {}), restricted_to: `${Object.keys(spans).length} forms attached from ${workSlugs[0]}`, carried_from_zone: `data/zones/${workSlugs[0]}.bin` }
  : { awaits: `a span table shared across ${workSlugs.length} work zones — each zone interns its own roles, rules and confidences, so spans ride only when one work supplies them`, status: "withheld: several works" };

const attachedSections = Object.keys(units).length;
const sidecar = {
  schema_version: "ZONE_COMMENTARY_V2",
  rule_id: RULE_ID,
  work: baseWorkId, work_title: B.zone.work || base, base_zone: base,
  works,
  emitted_from: {
    sources,
    alignment: {
      rule: "SEALED_UNIT_COORDINATE_IDENTITY, and SEALED_UNIT_COORDINATE_PREFIX where the work's id carries one more number",
      basis: `both works are zones of this shelf; ${base}-<chapter>-<section> receives <work>-<chapter>-<section>[-<order>]. Coordinates are read from the sealed unit ids and nothing is renumbered, folded, or inferred.`,
      base_sections: baseAt.size, attached_sections: attachedSections, base_sections_without_commentary: baseAt.size - attachedSections,
      commentary_units_without_base_section: 0, per_work: alignment,
    },
    license_receipts: {
      rule: "the work zone's own license_receipts, computed by the fleet from the work's own rows; nothing inherits from the base, the title, or the work level",
      per_work: works.map((w) => `${w.zone}: ${w.license_as_recorded}`),
    },
    gloss_layer: { rule: "the work zone's own gloss and its per-reading witness record (gloss_m), restricted to the forms attached; an Aramaic form the catalog never carries renders bare", forms: Object.keys(gloss).length, licensed: Object.keys(glossM).length },
    span_layer: spanLayer,
    build: { builder: "tools/build-commentary-sidecar-v2.mjs", single_pass: true, emitted: stamp },
  },
  counts: { attached_sections: attachedSections, base_sections: baseAt.size, base_sections_without_commentary: baseAt.size - attachedSections,
    words: wordsAll, glossed_words: glossedAll, attached_units: attachedAll, works: works.length, held_works: works.filter((w) => w.held).length },
  ...spanTables, spans, gloss, gloss_m: glossM, units,
};
writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));
console.log(`${outPath} · ${works.length} work(s) on ${attachedSections}/${baseAt.size} sections · ${wordsAll.toLocaleString()} words, ${glossedAll.toLocaleString()} glossed` +
  (works.some((w) => w.held) ? ` · HELD: ${works.filter((w) => w.held).map((w) => `${w.zone} (${w.reader_display})`).join(", ")}` : ""));
for (const a of alignment) console.log(`  ${a.work}: ${a.attached}/${a.commentary_units} units attached (${a.by_identity} by identity, ${a.by_prefix} by prefix)`);
