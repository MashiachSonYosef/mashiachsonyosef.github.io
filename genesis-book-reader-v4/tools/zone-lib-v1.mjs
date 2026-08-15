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
  require_(m, "UNIT_ID_UNPARSED", `${unitId} does not read as ${slug}-<chapter>-<section>`);
  return { chapter: Number(m[1]), section: Number(m[2]), label: `${m[1]}:${m[2]}` };
};

/** Words as the zone stores them: exact surface, exact K, held flag. */
export const wordsOf = (rows) =>
  rows.map((r) => {
    const w = { s: r.exact_surface_form };
    if (r.visible_in_hebrew_reader) {
      const k = exactK(r.exact_surface_form);
      if (k) w.k = k;
    } else w.held = true;
    return w;
  });

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
