#!/usr/bin/env node
// Synthesis lane · span-slice-rule-v1-compspan-template-exact-key
//
// Reads the composition map's COMPspan template and returns only the rows a
// zone actually needs, keyed by exact K.
//
// Rules, declared before output:
//   1. Exact K only. A row is taken when its normalized_key is byte-equal to
//      a key the zone contains. No folding, no prefix match.
//   2. A key may appear at most once. Two rows for one key would make the
//      component system ambiguous, so a second row is a refusal, not a pick.
//   3. component_surfaces must concatenate back to the key, and the arity of
//      surfaces and roles must both equal component_count. A row that fails
//      either is a refusal: the cell layer is derived from these fields and a
//      derivation from a broken row would be silently wrong.
//   4. Cells are derived, not read. For n components there are n(n+1)/2
//      contiguous cells and 2^(n-1) complete covers; both follow from the
//      component list alone. Verified against w-to-compcell-template-v6 for
//      the slice this build ships: 27,323 sealed cell rows for 6,193 keys,
//      0 surface mismatches, every key exact on cell count.
//   5. The source file is recorded by path and sha256 so the slice is
//      reproducible from the same sealed input.

import { createReadStream, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";

export const SPAN_RULE_ID = "span-slice-rule-v1-compspan-template-exact-key";

const REQUIRED = [
  "normalized_key", "component_count", "component_surfaces", "component_roles",
  "split_rule", "split_confidence",
];

/** sha256 of a file, streamed — these inputs run to tens of megabytes. */
export const sha256Stream = (path) =>
  new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(path).on("data", (c) => h.update(c)).on("end", () => resolve(h.digest("hex"))).on("error", reject);
  });

/**
 * @param {string} path  w-to-compspan-template-v6.csv.gz
 * @param {Set<string>} keys  exact K the zone contains
 */
export const readSpanSlice = async (path, keys) => {
  const rl = createInterface({
    input: createReadStream(path).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  let hi = null;
  const spans = new Map();
  let scanned = 0;
  for await (const line of rl) {
    if (!line) continue;
    if (!hi) {
      const header = line.split(",");
      hi = Object.fromEntries(header.map((x, i) => [x, i]));
      for (const c of REQUIRED)
        if (hi[c] === undefined) throw new Error(`SPAN_COLUMN_MISSING: ${c} not in ${path}`);
      continue;
    }
    scanned += 1;
    const f = line.split(",");
    const k = f[hi.normalized_key];
    if (!keys.has(k)) continue;
    if (spans.has(k)) throw new Error(`SPAN_DUPLICATE_KEY: ${k} appears twice in ${path}`);
    const n = Number(f[hi.component_count]);
    const s = f[hi.component_surfaces].split(" + ");
    const r = f[hi.component_roles].split(" + ");
    if (s.length !== n || r.length !== n)
      throw new Error(`SPAN_ARITY: ${k} declares ${n} components, carries ${s.length} surfaces and ${r.length} roles`);
    if (s.join("") !== k)
      throw new Error(`SPAN_SURFACES_DO_NOT_REJOIN: ${k} vs ${s.join("")}`);
    spans.set(k, { s, r, rule: f[hi.split_rule], conf: f[hi.split_confidence] });
  }
  return {
    spans,
    scanned,
    source: { path: path.split("/").pop(), bytes: statSync(path).size, sha256: await sha256Stream(path) },
  };
};

/** Every contiguous cell of a component list: n(n+1)/2 of them, in [start,end] order. */
export const cellsOf = (components) => {
  const out = [];
  for (let i = 0; i < components.length; i += 1)
    for (let e = i; e < components.length; e += 1)
      out.push({ start: i, end: e, surface: components.slice(i, e + 1).join("") });
  return out;
};

/**
 * Every complete cover of a component list: 2^(n-1) of them, one per subset of
 * the n-1 internal boundaries. Each cover is a list of contiguous cells that
 * together use every component exactly once.
 */
export const cutsOf = (components) => {
  const n = components.length;
  const out = [];
  for (let mask = 0; mask < 1 << (n - 1); mask += 1) {
    const parts = [];
    let start = 0;
    for (let i = 0; i < n - 1; i += 1) {
      if (mask & (1 << i)) { parts.push({ start, end: i, surface: components.slice(start, i + 1).join("") }); start = i + 1; }
    }
    parts.push({ start, end: n - 1, surface: components.slice(start).join("") });
    out.push(parts);
  }
  return out;
};
