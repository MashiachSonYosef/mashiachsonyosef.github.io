// Synthesis lane · w-list-rule-v1-the-record-says-which-entries-are-W
//
// Read a sealed W list: which entries of a section are W, what each one's
// surface is, and which COMPspan template it carries.
//
// Why this is a module and not four lines inside one check. W is the grain
// everything the reader draws stands on. A COMPcell is a contiguous run of one
// W's components; a COMPspan cover is a division of one W; the K a route is
// asked by is one W's key. If the thing under all of that is not a W, none of
// it is what it says it is — and this lane cannot work out which entries are W
// from their surfaces. It has now got that wrong twice in both directions:
// once merging entries because an English catalog carried the merged key, once
// splitting them because the chain's c0 numbering is finer than W. לבעל has
// three components and לב + על is a legitimate cover of it, so I Kings 8:66 and
// the first verse of the Torah are indistinguishable by arithmetic and always
// will be.
//
// So the answer is read, in one place, by everything that needs it — the check
// that asserts a zone's grain and the builder that sets it — rather than
// re-derived at each site with whatever care that site happened to have.
//
// The shape is the corpus lane's, not this lane's. The sealed HUD for Genesis
// 1:1 records it as:
//
//   words: [{ ref: "Genesis 1:1", hebrew: <surface>,
//             normalized: <exact K>,
//             compspanTemplateId: "COMPspanT-26358CADCEAB5760C964" }, ...]
//
// and a file is a W list if it carries entries of that shape. Found by shape
// rather than by filename, so a new one is picked up without editing anything.
//
// Mark order differs between the serve output and the HUD — dagesh before or
// after the vowel — and is not a difference in text, so surfaces compare under
// NFC. The key never does: K is byte-exact and is compared byte-exact.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const W_LIST_RULE_ID = "w-list-rule-v1-the-record-says-which-entries-are-W";

/** NFC, because two mark orders are one text. Never applied to a K. */
export const sameSurface = (a, b) => String(a).normalize("NFC") === String(b).normalize("NFC");

const parse = (raw) => {
  const at = raw.indexOf("{");
  if (at < 0) return null;
  try { return JSON.parse(raw.slice(at).replace(/\)\s*;?\s*$/u, "").replace(/;\s*$/u, "")); }
  catch { return null; }
};

/**
 * Every W list one file holds, keyed by the ref its entries name.
 * Returns null when the file is not a W list — which is not an error; most
 * files in data/ are not.
 */
export const wListsIn = (path) => {
  const j = parse(readFileSync(path, "utf8"));
  if (!j || !Array.isArray(j.words) || !j.words.length) return null;
  const first = j.words[0];
  if (!first || !first.hebrew || !first.normalized) return null;
  const byRef = new Map();
  for (const w of j.words) {
    const ref = w.ref || j.fixture_id || path;
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref).push({
      s: w.hebrew,
      k: w.normalized,
      compspan: w.compspanTemplateId || null,
      index: Number.isFinite(w.index) ? w.index : byRef.get(ref).length + 1,
    });
  }
  for (const list of byRef.values()) list.sort((a, b) => a.index - b.index);
  return { source: path, refs: byRef };
};

/** Every W list under a directory, merged, with which file each came from. */
export const wListsUnder = (dir) => {
  const out = new Map();                    // ref -> { file, words }
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".js")).sort()) {
    const got = wListsIn(join(dir, f));
    if (!got) continue;
    for (const [ref, words] of got.refs) out.set(ref, { file: f, words });
  }
  return out;
};

/**
 * Does one section's entries stand as the W the record lists?
 * Returns what differs rather than a verdict, so a caller can say it in its
 * own words and a builder can refuse on the same facts a check reports.
 */
export const agreesWith = (entries, wList) => {
  const mine = entries || [], theirs = wList || [];
  const count = mine.length === theirs.length;
  const surfaces = count && mine.every((w, i) => sameSurface(w.s, theirs[i].s));
  const keys = count && mine.every((w, i) => w.k === theirs[i].k);
  const firstOff = count ? mine.findIndex((w, i) => !sameSurface(w.s, theirs[i].s)) : -1;
  return {
    ok: count && surfaces && keys,
    count, surfaces, keys,
    printed: mine.length, recorded: theirs.length,
    firstDifference: firstOff >= 0
      ? { at: firstOff + 1, printed: mine[firstOff].s, recorded: theirs[firstOff].s } : null,
  };
};

export default { W_LIST_RULE_ID, wListsIn, wListsUnder, agreesWith, sameSurface };
