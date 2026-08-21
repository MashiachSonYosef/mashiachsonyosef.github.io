#!/usr/bin/env node
// Synthesis lane · provider-declaration-rule-v1-closed-set-ship-whole-by-default
//
// One machine, every provider. What differs between providers is the
// declaration, never the machinery: locate the reading inside the definition,
// read the declared marks, apply them in the declared precedence, require the
// pieces to rejoin, inherit the M verbatim. A provider with no declaration is
// not split — its route ships exactly as the corpus sealed it.
//
// Nothing here decides what a mark means. That is the declaration's job, and
// the declaration carries its own evidence and its own falsifier.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const DECLARATIONS = JSON.parse(
  readFileSync(join(here, "declarations-v1.json"), "utf8"),
);
export const RULE_ID = DECLARATIONS.rule_id;

// ---- licence ---------------------------------------------------------
const ND = (p) => /(^|[^a-z])nd([^a-z]|$)/i.test(String(p)) || /noderiv/i.test(String(p));

/** What a licence posture permits on export. Never guesses. */
export const exportPosture = (posture) => {
  const p = String(posture || "");
  if (!p) return { export: false, reason: "the record carries no licence posture", obligations: [] };
  if (ND(p)) return { export: false, reason: `NoDerivatives (${p}) — an export is a redistributed derivative`, obligations: [] };
  const d = DECLARATIONS.export_postures[p];
  if (!d) return { export: false, reason: `licence posture "${p}" has not been read and declared`, obligations: [] };
  return { export: true, reason: null, attribution: d.attribution, obligations: d.obligations || [] };
};

// ---- reading ---------------------------------------------------------
const balanced = (t) => {
  let d = 0;
  for (const c of t) { if (c === "(") d += 1; else if (c === ")") { d -= 1; if (d < 0) return false; } }
  return d === 0;
};

/** Top-level split on a mark, parentheses treated as a scope. */
const topSplit = (t, mark) => {
  const out = []; let buf = "", d = 0;
  for (const c of t) {
    if (c === "(") { d += 1; buf += c; continue; }
    if (c === ")") { d -= 1; buf += c; continue; }
    if (c === mark && d === 0) { out.push(buf); buf = ""; continue; }
    buf += c;
  }
  out.push(buf);
  return out.map((x) => x.trim()).filter(Boolean);
};

/**
 * The readings a provider's record offers, separated on the marks the provider
 * itself put there.
 *
 * This separates. It does not derive. The difference is the whole rule: a
 * separation keeps every piece the mark divides, and each piece is a run of
 * the provider's own characters. A derivation keeps one piece and throws the
 * rest away, or joins pieces the provider never wrote together. Nothing here
 * may do the second thing.
 *
 * It reads the route the corpus emitted. It never goes mining the definition
 * for a better reading — choosing a region of a record and substituting it for
 * what the corpus emitted is a derivation, whatever it improves.
 */
export const readingOf = (routeText, definitionText, sourceKey) => {
  const R = String(routeText || "");
  const decl = DECLARATIONS.providers[sourceKey];
  if (!decl) return { readings: [R], region: "whole", refused: null, unknownMarks: [] };

  // closure: a declared provider using a mark its declaration does not cover
  const declared = new Set(Object.keys(decl.marks || {}));
  const unknownMarks = [...new Set([...R].filter(
    (c) => !/[\p{L}\p{N}\s]/u.test(c) && !declared.has(c),
  ))];

  const sep = decl.separates_on;
  if (!sep) return { readings: [R], region: "whole", refused: null, unknownMarks };

  // a mark inside a scope is not separating anything: the provider wrote the
  // scope, and cutting into it would produce runs it never wrote
  if (sep.scope && !balanced(R)) {
    return { readings: [R], region: "whole", refused: "unbalanced " + sep.scope, unknownMarks };
  }
  const pieces = topSplit(R, sep.mark);
  if (pieces.length < 2) return { readings: [R], region: "whole", refused: null, unknownMarks };

  // the pieces must put the route back together, or they are not its pieces
  const rejoined = pieces.join(`${sep.mark} `);
  const norm = (x) => x.replace(/\s+/g, " ").trim();
  if (norm(rejoined) !== norm(R)) {
    return { readings: [R], region: "whole", refused: "the pieces do not rejoin into the route", unknownMarks };
  }
  return { readings: pieces, region: "separated", refused: null, unknownMarks };
};

// ---- derivation -------------------------------------------------------
/**
 * Is this route a piece cut out of a sibling standing on the same record?
 *
 * `siblings` are the other routes on the same key that carry the same M and the
 * same definition text. Containment is tested at word boundaries, so "man" is
 * not a fragment of "manner" — only of "a man and a people".
 */
export const isFragment = (routeText, siblings) => {
  const A = String(routeText || "").trim().toLowerCase();
  if (!A) return false;
  for (const b of siblings) {
    const B = String(b || "").trim().toLowerCase();
    if (B.length <= A.length) continue;
    if (B.startsWith(A + " ") || B.endsWith(" " + A) || B.includes(" " + A + " ")) return true;
  }
  return false;
};

/**
 * What the provider's licence permits for a fragment. The boundary is set by
 * the licence, not by the punctuation it happened to be cut at.
 *
 * Returns { show, marked, why }.
 */
export const fragmentPosture = (posture) => {
  const p = exportPosture(posture);
  if (!p.export) return { show: false, marked: false, why: p.reason };
  return {
    show: true,
    marked: true,
    why: null,
    obligations: p.obligations,
  };
};

export const providerOf = (index, mId) => {
  const m = index.m_sources[mId];
  return m ? m.key : null;
};
