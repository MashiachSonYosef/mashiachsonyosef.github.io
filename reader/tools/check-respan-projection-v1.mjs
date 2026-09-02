#!/usr/bin/env node
// GUARDS: respan-rule-v1-project-the-compspan-template-over-a-zones-own-keys
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A zone's component layer is a projection: the COMPspan template, asked about
// the keys that zone already contains, and nothing else. The declaring tool
// says it in one breath: "The component layer is a projection, exactly as the
// gloss layer is: the COMPspan template, asked about the keys one zone already
// contains. It does not depend on how the zone was acquired, so any zone can be
// given one without re-running the route it was built from." And of the keys:
// "The keys asked for are the zone's own, byte-exact: every W of every
// occurrence and every title token. No folding, no prefix match. The template's
// own refusals stand — a key with two rows, or one whose surfaces do not
// rejoin, is not taken." (tools/respan-zone-v1.mjs)
//
// Why it has to be guarded. Genesis shipped with no component layer, deferred
// in a build comment nobody read, and the page said nothing. check-sealed-
// layers-v1 now refuses a zone that was handed no template at all. This check
// asks the next question: given that a zone carries the layer, is it the
// projection the rule describes? A span on a key the zone does not hold is a
// component system for a word that is not in the book. A span whose pieces do
// not rejoin to its key is a cut of some other word. A layer whose receipt does
// not name the sealed file and its hash cannot be reproduced or audited by
// anyone. None of these shows on a page, and each one changes what a reader is
// offered when a word is opened.
//
// What the tool writes, and this reads. A zone's spans table maps a key to
// [surfaces, role indexes, rule index, confidence index]; the indexes resolve
// in span_roles, span_rules and span_conf. The receipt sits at
// emitted_from.span_layer: the slice rule, the sealed file by path, byte count
// and sha256, the rows scanned, and the counts derived from the table. The
// zone's own keys are the k of every word region, of every work title token,
// and of every chapter name token, gathered exactly as the tool gathers them.
//
//   L0  the declaring tool still declares the rule and still gathers keys
//       from the three places this check gathers them from
//   L1  every span key is a key the zone itself carries, byte-exact
//   L2  every span's components, joined, are the key exactly: no character
//       added, none lost
//   L3  every span resolves in its own zone: as many roles as surfaces, no
//       empty surface, every role, rule and confidence index in range
//   L4  every span layer carries a receipt naming the slice rule and the
//       sealed template by path, byte count and sha256
//   L5  the receipt describes the table it sits on: forms, histogram, derived
//       cells and covers, the roles and provenance tables, and the count of
//       occurrences with a component system all recompute from the table
//   L6  one template across the shelf: every receipt names the same sealed
//       file, so what a word offers does not depend on which build its zone
//       went through
//   L7  the byte count the receipts record is the one the workspace manifest
//       records for that file, when the manifest lists it
//   L8  when the sealed file is on this disk, it is the file the receipts
//       name: same sha256, same byte count, same row count
//   L9  and the layer is that file's restriction to the zone's own keys:
//       every own key with an accepted row has a span (L9a), every span
//       equals its row on surfaces, roles, rule and confidence (L9b), and no
//       span stands on a key the template has no accepted row for (L9c)
//
// What this does not prove. It does not say a division is right, or that a
// draft_candidate boundary should reach a reader; check-division-established-
// v1 withholds those, and worth is its question, not this one's. It does not
// say the layer was handed over at all; that is check-sealed-layers-v1. It does
// not say the gloss layer was re-projected at cell grain afterwards, which the
// respan tool records as owed and regloss-zone.mjs pays. And when the sealed
// file is not on this disk, L8 and L9 go unasked and the run says so.
//
// Run: node tools/check-respan-projection-v1.mjs [--zones data/zones]
//                                                [--declaring tools/respan-zone-v1.mjs]
//                                                [--manifest data/workspace-manifest-v1.json]
//                                                [--workspace <corpus workspace root>]
//                                                [--template <w-to-compspan-template csv.gz>]
import { readFileSync, readdirSync, existsSync, createReadStream, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { SPAN_RULE_ID } from "./span-slice-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const DECLARING = arg("declaring", join(HERE, "respan-zone-v1.mjs"));
const MANIFEST = arg("manifest", join(K3, "data", "workspace-manifest-v1.json"));
const WORKSPACE = arg("workspace", "/mnt/user-data/uploads/999 footsteps");
// The sealed file is found through the receipts and the workspace manifest
// unless a flag says where it is; see "the sealed file" below.
const TEMPLATE = arg("template", "");

const RULE_ID = "respan-rule-v1-project-the-compspan-template-over-a-zones-own-keys";
const SHA256 = /^[0-9a-f]{64}$/;
const REQUIRED_COLUMNS = ["normalized_key", "component_count", "component_surfaces", "component_roles", "split_rule", "split_confidence"];

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
// The first dozen offenders are named; the rest are counted.
const sample = (list, s) => { list.push(list.length < 12 ? s : null); };
const named = (list, n = 3) => list.filter(Boolean).slice(0, n).join(" · ");

// ── the declaring tool ────────────────────────────────────────────────────
// L0 — the premise. A gate whose rule has been edited out from under it is
// worse than no gate, so the tool is read and quoted, not assumed.
if (!existsSync(DECLARING)) {
  console.log(`SKIPPED — no declaring tool at ${DECLARING}, so the rule this gate enforces cannot be quoted`);
  process.exit(3);
}
const declSrc = readFileSync(DECLARING, "utf8");
const declares = declSrc.includes(RULE_ID);
const gathersFrom = ["sections", "work_he_tokens", "name_tokens"].filter((f) => declSrc.includes(f));
check("L0  the declaring tool still declares the rule and gathers keys from words, title tokens and chapter names",
  declares && gathersFrom.length === 3,
  !declares ? `${basename(DECLARING)} no longer names ${RULE_ID}`
    : gathersFrom.length < 3 ? `the tool now gathers keys from ${gathersFrom.join(", ") || "nowhere this check knows"}; this check reads three places`
      : `quoted from ${basename(DECLARING)} · slice rule ${SPAN_RULE_ID}`);

// ── the zones ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const readZone = (f) => { try { return JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { return null; } };
// A word position holds one key, or several when the occurrence is split into
// W regions; a title or chapter-name token holds one or none.
const keysOfToken = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
const ownKeysOf = (z) => {
  const keys = new Set();
  for (const s of z.sections || []) for (const w of s.words || []) for (const k of keysOfToken(w)) keys.add(k);
  for (const t of z.work_he_tokens || []) for (const k of keysOfToken(t)) keys.add(k);
  for (const n of z.nodes || []) for (const t of n.name_tokens || []) for (const k of keysOfToken(t)) keys.add(k);
  return keys;
};
const spanRecordOf = (sp) => (Array.isArray(sp) && Array.isArray(sp[0]) ? sp : null);

// ── pass one: the layer against its own zone ──────────────────────────────
const union = new Set();
const orphan = [], noRejoin = [], malformed = [], noReceipt = [], misdescribed = [];
const unlayered = [];
const namesSeen = new Map();   // "path|sha256|bytes" -> zones naming it
const rowsScannedSeen = new Set();
let zonesRead = 0, layered = 0, spansTotal = 0, regionsSpanned = 0;

for (const f of bins) {
  const z = readZone(f);
  if (!z) continue;
  zonesRead += 1;
  const spans = z.spans || {};
  const keys = Object.keys(spans);
  if (!keys.length) { unlayered.push(f); continue; }
  layered += 1;
  const work = String(z.work || f.replace(/\.bin$/, ""));
  const own = ownKeysOf(z);
  for (const k of own) union.add(k);
  const roles = z.span_roles || [], rules = z.span_rules || [], conf = z.span_conf || [];

  const hist = {};
  let cells = 0, covers = 0;
  for (const k of keys) {
    spansTotal += 1;
    // L1 — a span on a key this zone does not hold
    if (!own.has(k)) sample(orphan, `${work} · ${k}`);
    const sp = spanRecordOf(spans[k]);
    if (!sp) { sample(malformed, `${work} · ${k} · not a span record`); continue; }
    const s = sp[0], r = Array.isArray(sp[1]) ? sp[1] : [];
    // L2 — the pieces, rejoined, must be the key and nothing else
    if (s.join("") !== k) sample(noRejoin, `${work} · ${k} · pieces rejoin to ${JSON.stringify(s.join(""))}`);
    // L3 — the record resolves in its own zone
    const why = !s.length ? "no components"
      : s.some((x) => typeof x !== "string" || !x.length) ? "an empty component"
        : r.length !== s.length ? `${s.length} surfaces, ${r.length} roles`
          : r.some((i) => !(Number.isInteger(i) && i >= 0 && i < roles.length)) ? "a role index out of range"
            : !(Number.isInteger(sp[2]) && sp[2] >= 0 && sp[2] < rules.length) ? "a split-rule index out of range"
              : !(Number.isInteger(sp[3]) && sp[3] >= 0 && sp[3] < conf.length) ? "a confidence index out of range" : "";
    if (why) sample(malformed, `${work} · ${k} · ${why}`);
    const n = s.length;
    if (n) { hist[n] = (hist[n] || 0) + 1; cells += (n * (n + 1)) / 2; covers += 2 ** (n - 1); }
  }

  // how many of this zone's occurrences carry a component system, recounted
  let spanned = 0;
  for (const s of z.sections || []) for (const w of s.words || []) for (const k of keysOfToken(w)) if (spans[k]) spanned += 1;
  regionsSpanned += spanned;

  // L4 — the receipt
  const sl = (z.emitted_from || {}).span_layer || null;
  const src = (sl && sl.source) || {};
  const shaOk = SHA256.test(String(src.sha256 || ""));
  const receiptOk = !!sl && sl.rule === SPAN_RULE_ID && typeof src.path === "string" && src.path.length > 0
    && shaOk && Number.isInteger(src.bytes) && src.bytes > 0;
  if (!receiptOk) {
    sample(noReceipt, `${work} · ${!sl ? "no span_layer receipt" : sl.rule !== SPAN_RULE_ID ? `rule ${JSON.stringify(sl.rule || null)}`
      : !src.path ? "names no sealed file" : !shaOk ? "names no sha256" : "records no byte count"}`);
  } else {
    const id = `${src.path}|${src.sha256}|${src.bytes}`;
    namesSeen.set(id, (namesSeen.get(id) || 0) + 1);
    if (Number.isInteger(sl.rows_scanned)) rowsScannedSeen.add(sl.rows_scanned);
  }

  // L5 — the receipt describes this table, not some other
  if (sl) {
    const pf = sl.provenance_fields || {};
    const counted = (z.counts || {}).w_regions_with_a_component_system;
    const mismatch =
      sl.forms_with_a_component_system !== keys.length ? `forms ${sl.forms_with_a_component_system} vs ${keys.length} in the table`
        : JSON.stringify(sl.component_count_histogram || {}) !== JSON.stringify(hist) ? "component_count_histogram"
          : sl.derived_cells !== cells ? `derived_cells ${sl.derived_cells} vs ${cells}`
            : sl.derived_complete_covers !== covers ? `derived_complete_covers ${sl.derived_complete_covers} vs ${covers}`
              : JSON.stringify(sl.roles || null) !== JSON.stringify(roles) ? "roles table"
                : JSON.stringify(pf.split_rule || null) !== JSON.stringify(rules) ? "split_rule table"
                  : JSON.stringify(pf.split_confidence || null) !== JSON.stringify(conf) ? "split_confidence table"
                    : counted !== spanned ? `counts.w_regions_with_a_component_system ${counted} vs ${spanned} recounted` : "";
    if (mismatch) sample(misdescribed, `${work} · ${mismatch}`);
  }
}

if (!layered) {
  console.log(`SKIPPED — none of the ${zonesRead} zones on this disk carries a span layer, so there is no projection to judge`);
  process.exit(3);
}

console.log(`\n— ${zonesRead} zones · ${layered} carry a span layer · ${spansTotal.toLocaleString()} component systems · ${regionsSpanned.toLocaleString()} occurrences with one · ${union.size.toLocaleString()} distinct keys on the shelf —\n`);
if (unlayered.length)
  console.log(`  --  ${unlayered.length} zone(s) carry no span layer and are left to check-sealed-layers-v1: ${named(unlayered, 4)}\n`);

check("L1  every span key is a key the zone itself carries",
  orphan.length === 0,
  orphan.length ? `${orphan.length} on a key the zone does not hold — ${named(orphan)}`
    : "no zone offers a component system for a word it does not contain");

check("L2  every span's components, joined, are the key exactly",
  noRejoin.length === 0,
  noRejoin.length ? `${noRejoin.length} do not rejoin — ${named(noRejoin)}`
    : "no character added or lost in any of them");

check("L3  every span resolves in its own zone's tables",
  malformed.length === 0,
  malformed.length ? `${malformed.length} do not — ${named(malformed)}`
    : "roles match surfaces, every index in range, no empty component");

check("L4  every span layer carries a receipt naming the slice rule and the sealed file by path, bytes and sha256",
  noReceipt.length === 0,
  noReceipt.length ? `${noReceipt.length} without one — ${named(noReceipt)}`
    : `${layered} receipts, every one under ${SPAN_RULE_ID}`);

check("L5  every receipt describes the table it sits on",
  misdescribed.length === 0,
  misdescribed.length ? `${misdescribed.length} do not — ${named(misdescribed)}`
    : "forms, histogram, cells, covers, tables and occurrence counts all recompute");

const namesList = [...namesSeen.entries()].sort((a, b) => b[1] - a[1]);
check("L6  one template across the shelf: every receipt names the same sealed file",
  namesList.length === 1 && noReceipt.length === 0,
  namesList.length === 1 && noReceipt.length === 0
    ? `${namesList[0][0].split("|")[0]} · ${namesList[0][0].split("|")[1].slice(0, 16)}… · ${Number(namesList[0][0].split("|")[2]).toLocaleString()} bytes`
    : namesList.length > 1
      ? namesList.slice(0, 3).map(([id, c]) => `${id.split("|")[0]} ${id.split("|")[1].slice(0, 8)}… x${c}`).join(" · ")
      : "no receipt names one");

// ── the sealed file ───────────────────────────────────────────────────────
// The receipts name the file by its basename. The workspace manifest, when it
// is here, says where that file lives under the corpus workspace and how many
// bytes it had when the manifest was written.
const [namedPath, namedSha, namedBytes] = namesList.length ? namesList[0][0].split("|") : [null, null, null];
let manifestEntry = null;
if (existsSync(MANIFEST) && namedPath) {
  try {
    const man = JSON.parse(readFileSync(MANIFEST, "utf8"));
    manifestEntry = (man.files || []).find((e) => basename(String(e.path || "")) === basename(namedPath)) || null;
  } catch { manifestEntry = null; }
}
if (manifestEntry) {
  // L7 — two independent records of one file's size
  check("L7  the byte count the receipts record is the one the workspace manifest records",
    Number(namedBytes) === manifestEntry.bytes,
    `${manifestEntry.path} · manifest ${Number(manifestEntry.bytes).toLocaleString()} bytes · receipts ${Number(namedBytes).toLocaleString()}`);
} else {
  console.log(`  --  L7 unasked: ${existsSync(MANIFEST) ? `the workspace manifest lists no file named ${namedPath || "(none named)"}` : `no workspace manifest at ${MANIFEST}`}`);
}

const tried = [];
let templatePath = TEMPLATE;
if (!templatePath && namedPath) {
  if (manifestEntry) tried.push(join(WORKSPACE, manifestEntry.path));
  tried.push(join(K3, basename(namedPath)));
  templatePath = tried.find((p) => existsSync(p)) || "";
}

if (!templatePath || !existsSync(templatePath)) {
  console.log(`\n  --  the sealed file the receipts name is not on this disk${tried.length ? ` (looked at ${tried.join(", ")})` : TEMPLATE ? ` (${TEMPLATE})` : ""}.`);
  console.log("      L8 and L9 went unasked: the hash was checked for presence and agreement across the shelf,");
  console.log("      not re-derived, and the layer was not compared row for row. Pass --template <path> to ask them.");
} else {
  // Read once, keeping only the rows for keys the shelf holds. The template's
  // own refusals are recorded, not thrown: a key with two rows, an arity that
  // does not match, or surfaces that do not rejoin is a key no zone may take.
  const readTemplate = (path, wanted) => new Promise((resolve, reject) => {
    const h = createHash("sha256");
    const raw = createReadStream(path);
    raw.on("data", (c) => h.update(c));
    raw.on("error", reject);
    const rl = createInterface({ input: raw.pipe(createGunzip()).on("error", reject), crlfDelay: Infinity });
    let hi = null, rows = 0, columnsMissing = null;
    const accepted = new Map(), refused = new Map();
    rl.on("line", (line) => {
      if (!line) return;
      if (!hi) {
        hi = Object.fromEntries(line.split(",").map((x, i) => [x, i]));
        columnsMissing = REQUIRED_COLUMNS.filter((c) => hi[c] === undefined);
        return;
      }
      if (columnsMissing && columnsMissing.length) return;
      rows += 1;
      const f = line.split(",");
      const k = f[hi.normalized_key];
      if (!wanted.has(k)) return;
      if (accepted.has(k) || refused.has(k)) { accepted.delete(k); refused.set(k, "two rows in the template"); return; }
      const n = Number(f[hi.component_count]);
      const s = f[hi.component_surfaces].split(" + "), r = f[hi.component_roles].split(" + ");
      if (s.length !== n || r.length !== n) { refused.set(k, `declares ${n} components, carries ${s.length} surfaces and ${r.length} roles`); return; }
      if (s.join("") !== k) { refused.set(k, "surfaces do not rejoin to the key"); return; }
      accepted.set(k, JSON.stringify([s, r, f[hi.split_rule], f[hi.split_confidence]]));
    });
    rl.on("close", () => resolve({ rows, accepted, refused, columnsMissing: columnsMissing || REQUIRED_COLUMNS, sha256: h.digest("hex"), bytes: statSync(path).size }));
  });

  const t = await readTemplate(templatePath, union);
  if (t.columnsMissing.length) {
    check("L8  the sealed file on this disk is the one every receipt names", false,
      `${templatePath} lacks the column(s) ${t.columnsMissing.join(", ")}; it is not a COMPspan template`);
  } else {
    console.log(`\n— ${templatePath} · ${t.rows.toLocaleString()} rows · ${t.accepted.size.toLocaleString()} accepted for keys on this shelf · ${t.refused.size.toLocaleString()} refused by the template's own rule —\n`);
    // L8 — the file is the one the receipts name
    const rowsAgree = rowsScannedSeen.size === 1 && rowsScannedSeen.has(t.rows);
    check("L8  the sealed file on this disk is the one every receipt names",
      t.sha256 === namedSha && t.bytes === Number(namedBytes) && rowsAgree,
      t.sha256 !== namedSha ? `sha256 on disk ${t.sha256.slice(0, 16)}… vs ${String(namedSha).slice(0, 16)}… in the receipts`
        : t.bytes !== Number(namedBytes) ? `${t.bytes.toLocaleString()} bytes on disk vs ${Number(namedBytes).toLocaleString()} in the receipts`
          : !rowsAgree ? `${t.rows.toLocaleString()} rows on disk vs rows_scanned ${[...rowsScannedSeen].map((n) => n.toLocaleString()).join(", ") || "(unrecorded)"} in the receipts`
            : `sha256 ${t.sha256.slice(0, 16)}… · ${t.bytes.toLocaleString()} bytes · ${t.rows.toLocaleString()} rows, all three as the receipts say`);

    // ── pass two: the layer against the template ────────────────────────────
    const missing = [], differs = [], unfounded = [];
    let ownWithRow = 0, compared = 0;
    for (const f of bins) {
      const z = readZone(f);
      if (!z) continue;
      const spans = z.spans || {};
      if (!Object.keys(spans).length) continue;
      const work = String(z.work || f.replace(/\.bin$/, ""));
      const roles = z.span_roles || [], rules = z.span_rules || [], conf = z.span_conf || [];
      // L9a — an own key the template answers for, and the zone did not take
      for (const k of ownKeysOf(z)) if (t.accepted.has(k)) { ownWithRow += 1; if (!spans[k]) sample(missing, `${work} · ${k}`); }
      for (const [k, raw] of Object.entries(spans)) {
        const row = t.accepted.get(k);
        // L9c — a span the template has no accepted row for
        if (!row) { sample(unfounded, `${work} · ${k} · ${t.refused.get(k) || "no row in the template"}`); continue; }
        compared += 1;
        const sp = spanRecordOf(raw);
        // L9b — the span is its row, resolved through the zone's own tables
        const mine = sp ? JSON.stringify([sp[0], (sp[1] || []).map((i) => roles[i]), rules[sp[2]], conf[sp[3]]]) : "";
        if (mine !== row) sample(differs, `${work} · ${k}`);
      }
    }
    check("L9a every own key the template has an accepted row for carries a span",
      missing.length === 0,
      missing.length ? `${missing.length} withheld — ${named(missing)}`
        : `${ownWithRow.toLocaleString()} keys asked across ${layered} zones, none withheld`);
    check("L9b every span is its template row on surfaces, roles, rule and confidence",
      differs.length === 0,
      differs.length ? `${differs.length} differ — ${named(differs)}`
        : `${compared.toLocaleString()} compared through each zone's own tables`);
    check("L9c no span stands on a key the template has no accepted row for",
      unfounded.length === 0,
      unfounded.length ? `${unfounded.length} unfounded — ${named(unfounded)}`
        : "every span on the shelf comes from an accepted row");
  }
}

console.log("\n  what this does not say: that any division is right, or that a draft_candidate");
console.log("  boundary should reach a reader; check-division-established-v1 withholds those.");
console.log("  Nor that the layer was handed over at all (check-sealed-layers-v1), nor that");
console.log("  the gloss layer was re-projected at cell grain afterwards (regloss-zone.mjs).");
console.log("  This says only that what is here is the template projected over each zone's");
console.log("  own keys, and that the receipt names the file it was projected from.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
