// Synthesis lane · shared reading and verification for zone builders.
//
// Everything a zone is built from arrives here and is checked here, so that
// both the base builder and the commentary builder answer to the same
// assertions. A builder that cannot prove a claim throws; it never emits a
// zone with the claim quietly downgraded.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { exactK } from "./k-normalization-v1.mjs";

export const sha256File = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/** Fail loudly and by name. A refused build is a result; a silent one is not. */
export const require_ = (cond, code, detail) => {
  if (!cond) throw new Error(`${code} — ${detail}`);
};

/**
 * Read one serve NDJSON: line 1 is the walk provenance, the rest are rows in
 * ascending C0 order. Verifies the shape it depends on rather than assuming
 * it: ascending ids, no duplicates, contiguous token ordinals inside a unit.
 */
export const readServe = async (path) => {
  const rl = createInterface({ input: createReadStream(path, "utf8"), crlfDelay: Infinity });
  let provenance = null;
  const units = new Map(); // unit_id -> { rows: [], first: c0, last: c0 }
  let rows = 0, held = 0, lastId = -1;
  const statuses = new Map();

  for await (const line of rl) {
    if (!line) continue;
    const rec = JSON.parse(line);
    if (!provenance) { provenance = rec.provenance; require_(provenance, "SERVE_NO_PROVENANCE", path); continue; }

    const id = rec.c0_numeric_id;
    require_(Number.isInteger(id), "SERVE_BAD_ID", JSON.stringify(rec).slice(0, 120));
    require_(id > lastId, "SERVE_NOT_ASCENDING", `${id} after ${lastId}`);
    lastId = id;
    statuses.set(rec.status, (statuses.get(rec.status) || 0) + 1);

    const unit = rec.location?.local_unit_id;
    require_(unit, "SERVE_NO_UNIT", String(id));
    let u = units.get(unit);
    if (!u) { u = { rows: [], first: id, last: id }; units.set(unit, u); }
    require_(
      rec.token_ordinal_in_unit === u.rows.length + 1,
      "SERVE_ORDINAL_GAP",
      `${unit}: expected ${u.rows.length + 1}, got ${rec.token_ordinal_in_unit}`,
    );
    u.rows.push(rec);
    u.last = id;
    rows += 1;
    if (!rec.visible_in_hebrew_reader) held += 1;
  }

  require_(rows > 0, "SERVE_EMPTY", path);
  return { provenance, units, rows, held, statuses, first: [...units.values()][0].first, last: lastId };
};

/**
 * The identity oracle. The bridge is the sealed allocation of C0 rows to
 * units; a zone claims a unit is verified only when the bridge's own row
 * count and C0 range for that unit match what was served, ordinal for
 * ordinal. Anything else is recorded as drift on the section, never hidden.
 */
export const readBridge = (path, workId) => {
  const text = gunzipSync(readFileSync(path)).toString("utf8");
  const lines = text.split("\n");
  const header = lines[0].split(",");
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  for (const need of ["work_id", "unit_id", "c0_rows", "min_c0_numeric_id", "max_c0_numeric_id", "b_id", "n_id"])
    require_(col[need] !== undefined, "BRIDGE_MISSING_COLUMN", need);
  // The columns this reader touches are all slug-shaped and appear before any
  // free-text column, so a plain split is safe — but only if the file carries
  // no quoting at all. Check rather than trust.
  require_(!text.includes('"'), "BRIDGE_QUOTED_FIELDS", "bridge carries quoted fields; naive split would misalign");

  const units = new Map();
  let bId = null, nId = null;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const f = line.split(",");
    if (f[col.work_id] !== workId) continue;
    units.set(f[col.unit_id], {
      c0_rows: Number(f[col.c0_rows]),
      min: Number(f[col.min_c0_numeric_id]),
      max: Number(f[col.max_c0_numeric_id]),
    });
    bId = bId ?? f[col.b_id];
    nId = nId ?? f[col.n_id];
  }
  require_(units.size > 0, "BRIDGE_WORK_ABSENT", workId);
  return { units, b_id: bId, n_id: nId, sha256: sha256File(path) };
};

/**
 * Coordinates come from the sealed unit id and nothing else. A unit id is a
 * locator — the plain location label an access aid may render — so the page
 * may print "7:14" in English without borrowing a word it has no D+M for.
 *
 * `slug` is the work's own id tail, so the parse is anchored, not sniffed:
 * tanakh/i-kings -> i-kings -> i-kings-7-14 -> chapter 7, section 14.
 */
export const parseCoordinates = (unitId, slug) => {
  const m = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}-(\\d+)-(\\d+)$`, "u").exec(unitId);
  if (m) return { chapter: Number(m[1]), section: Number(m[2]), label: `${m[1]}:${m[2]}` };
  // The second sealed shape: a flat sequence — `…--unit-00027` — where the
  // chain records no chapter/section nesting at all, only the unit's ordinal
  // (the Ben-Yehuda shelf and kin, 209k units in the bridge). One sealed unit
  // is one top-level section; no structure the chain did not seal is
  // invented around it, so the locator is the bare ordinal.
  const f = /--unit-0*(\d+)$/u.exec(unitId);
  require_(f, "UNIT_ID_UNPARSED",
    `${unitId} reads as neither ${slug}-<chapter>-<section> nor …--unit-<ordinal>`);
  return { chapter: Number(f[1]), section: 1, label: String(Number(f[1])), flat: true };
};

// U+05BE HEBREW PUNCTUATION MAQAF, named by its codepoint. A tool in this
// tree may not supply a character of the text any more than the page may,
// and a glyph in a literal here is that file typing one. The escape is the
// same character and makes no claim to have written it.
export const MAQAF = "\u05be";

/**
 * Words as the zone stores them.
 *
 * One row of C0 is one occurrence, and the block on the page is the
 * occurrence. What is clickable inside that block is whatever the ledger says
 * the occurrence contains: exact K preserves the boundary maqaf (FRAME rule
 * 7), and the W inventory records the pieces either side of it as separate W.
 * So an occurrence written with a maqaf carries more than one W, and each of
 * them opens on its own.
 *
 *   no maqaf   { s, k }
 *   maqaf      { s, w: [{ s, k }, …] }   regions in printed order
 *   held       { s, held: true }         the chain's script rule, not ours
 *
 * The regions are cut from the printed surface, not rebuilt from the key, so
 * a region's `s` is always a substring of what the page shows. An edge maqaf
 * (`לחם־`, three occurrences in this work) yields one region and a maqaf that
 * belongs to the next occurrence; the maqaf still prints, and it does not
 * open, because it is not a W.
 */
export const wordsOf = (rows) =>
  rows.map((r) => {
    const surface = r.exact_surface_form;
    const w = { s: surface };
    if (!r.visible_in_hebrew_reader) { w.held = true; return w; }
    const k = exactK(surface);
    if (!k) return w;
    if (!k.includes(MAQAF)) { w.k = k; return w; }
    const pieces = surface.split(MAQAF);
    const regions = pieces.map((p) => ({ s: p, k: exactK(p) }));
    require_(
      regions.map((x) => x.k).join(MAQAF) === k,
      "MAQAF_REGIONS_DO_NOT_REJOIN",
      `${surface}: ${regions.map((x) => x.k).join(MAQAF)} vs ${k}`,
    );
    // The W set of a maqaf occurrence is the COMPcell lattice, not the atoms
    // alone: a chain of n atoms holds n(n+1)/2 W — every atom and every
    // contiguous joined interval, the whole included. The atoms tile the
    // printed surface; the joined intervals open from the maqaf marks that
    // make them. The body route used to emit only the atoms, which left the
    // whole of בן־יהודה unreachable — the lattice gate caught it the first
    // time a maqaf-carrying shelf faced it.
    const atoms = regions.filter((x) => x.k);
    const cells = [...atoms];
    for (let len = 2; len <= atoms.length; len += 1)
      for (let i = 0; i + len <= atoms.length; i += 1)
        cells.push({
          s: atoms.slice(i, i + len).map((a) => a.s).join(MAQAF),
          k: atoms.slice(i, i + len).map((a) => a.k).join(MAQAF),
        });
    w.w = cells;
    return w;
  });

/** Every W an occurrence contains, whether it carries one or several. */
export const regionsOf = (word) => (word.w ? word.w : word.k ? [{ s: word.s, k: word.k }] : []);

/**
 * One license posture per zone, computed from the rows rather than asserted.
 * Refuses to summarize a mixed set, because a single chip over two postures
 * would be a claim the receipts do not support.
 */
export const licensePosture = (units) => {
  const combos = new Map();
  for (const u of units.values())
    for (const r of u.rows) {
      const key = [
        r.rights_authority.normalized_license_class,
        r.rights_authority.license_version,
        r.reader_display_axis,
        r.public_distribution_axis,
        r.attribution_required,
        r.noncommercial_required,
        r.share_alike_required,
        r.no_derivatives_required,
        r.rights_authority.terminal_resolution_state,
      ].join(" · ");
      combos.set(key, (combos.get(key) || 0) + 1);
    }
  return [...combos.entries()].map(([k, n]) => ({ posture: k, rows: n })).sort((a, b) => b.rows - a.rows);
};
