// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. How two editions of the same verses meet, word by word.
// It reads two lines of words and says which word of one is which word of
// the other; it writes nothing.
//
// THE RULE OF MEETING (27 November 2026, the fresh build).
//
// Our text (the zones) and a source's text (STEP's rows; MACULA's words) are
// two editions of the same verses. A word of ours meets a word of theirs by
// PLACE, never by spelling alone: both lines are walked in their own order,
// verse by verse, and a word can only meet a word that stands where it
// stands. The letters decide nothing but which neighbor is which.
//
//   1  A verse of ours and the verse of theirs under the same Hebrew number
//      that meet whole (every word of ours, every word of theirs, each one
//      of: the same letters; the same word spelled otherwise; one word for
//      two with the same letters) stand as met.
//   2  What stands between two such verses is met in order across the verse
//      bounds, so that a verse the two editions number otherwise, or cut at
//      another word, still meets its own words; the numbers then differ and
//      the record says so.
//   3  Within a stretch the words are laid side by side at the least cost:
//      the same letters cost nothing; one word for two of the same letters
//      next to nothing; a word spelled otherwise a little for each letter;
//      another word in the same place more; a word with no partner most.
//      A word an edition itself marks as not of the running text (STEP's
//      restored and Greek-based rows, types R and X; a word of ours that is
//      written and not read, where the other line carries only what is
//      read) is passed over at half that cost, so that where two words
//      could take one partner the word of the running text takes it. The
//      costs only order these kinds; nothing else is tuned.
//
// A meeting is one of: one for one; one of ours for two or three of theirs;
// two or three of ours for one of theirs; none. Its letters are the same, or
// differ by named letters (ours has a letter more, a letter less, another
// letter), or are another word.
import { lettersOf } from "./place-answers-sources-v1.mjs";

/** The fewest letter changes that turn `t` (theirs) into `o` (ours), and the
 *  changes themselves, each named by where it falls among THEIR letters:
 *  ["+", letter, gap]       ours has this letter more, before their letter `gap`
 *  ["-", letter, at]        ours lacks their letter `at`
 *  ["~", ours, theirs, at]  ours writes another letter at their letter `at`
 *  ["x", first, second, at] their letters `at` and `at`+1 (first, second)
 *                           stand in the other order in ours
 *  Ties are broken the same way every time (a match first, then another
 *  letter, then a letter less, then a letter more, read from the word's
 *  end); two neighbors each written as the other are then named as one
 *  change, two letters in the other order. `distance` counts single letters
 *  (two letters in the other order count two). */
export function letterChanges(o, t) {
  const O = Array.from(o), T = Array.from(t); const n = O.length, m = T.length;
  const D = []; for (let i = 0; i <= n; i += 1) { D.push(new Uint16Array(m + 1)); D[i][0] = i; }
  for (let j = 0; j <= m; j += 1) D[0][j] = j;
  for (let i = 1; i <= n; i += 1) for (let j = 1; j <= m; j += 1) {
    const sub = D[i - 1][j - 1] + (O[i - 1] === T[j - 1] ? 0 : 1);
    D[i][j] = Math.min(sub, D[i - 1][j] + 1, D[i][j - 1] + 1);
  }
  const raw = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && O[i - 1] === T[j - 1] && D[i][j] === D[i - 1][j - 1]) { i -= 1; j -= 1; continue; }
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { raw.push(["~", O[i - 1], T[j - 1], j - 1]); i -= 1; j -= 1; continue; }
    if (j > 0 && D[i][j] === D[i][j - 1] + 1) { raw.push(["-", T[j - 1], j - 1]); j -= 1; continue; }
    raw.push(["+", O[i - 1], j]); i -= 1;
  }
  raw.reverse();
  const ops = [];
  for (let k = 0; k < raw.length; k += 1) {
    const p = raw[k], q = raw[k + 1];
    if (p[0] === "~" && q && q[0] === "~" && q[3] === p[3] + 1 && p[1] === q[2] && p[2] === q[1]) { ops.push(["x", p[2], q[2], p[3]]); k += 1; } else ops.push(p);
  }
  return { distance: D[n][m], ops };
}
export const distanceOf = (o, t) => (o === t ? 0 : letterChanges(o, t).distance);

/** The changes as one short string: «+X@3» ours has X more before their
 *  fourth letter; «-X@3» ours lacks their fourth letter, X; «X>Y@3» ours
 *  writes X where theirs writes Y; «X<>Y@3» their fourth and fifth letters,
 *  X and Y, stand in the other order in ours. Positions count their letters
 *  from 0. */
export const changesText = (ops) => ops.map((p) => (p[0] === "+" ? `+${p[1]}@${p[2]}` : p[0] === "-" ? `-${p[1]}@${p[2]}` : p[0] === "x" ? `${p[1]}<>${p[2]}@${p[3]}` : `${p[1]}>${p[2]}@${p[3]}`)).join(" ");
export function changesFromText(text) {
  if (!text) return [];
  return text.split(" ").map((x) => {
    let m = /^\+(.)@(\d+)$/u.exec(x); if (m) return ["+", m[1], Number(m[2])];
    m = /^-(.)@(\d+)$/u.exec(x); if (m) return ["-", m[1], Number(m[2])];
    m = /^(.)<>(.)@(\d+)$/u.exec(x); if (m) return ["x", m[1], m[2], Number(m[3])];
    m = /^(.)>(.)@(\d+)$/u.exec(x); if (m) return ["~", m[1], m[2], Number(m[3])];
    throw new Error(`a change that cannot be read: ${x}`);
  });
}
const whereOf = (p) => (p[0] === "~" || p[0] === "x" ? p[3] : p[2]);
/** Their letters with the named changes laid on: ours, if the naming is true. */
export function applyChanges(t, ops) {
  const T = Array.from(t); const out = []; let k = 0;
  const sorted = ops.slice().sort((a, b) => whereOf(a) - whereOf(b) || (a[0] === "+" ? -1 : 0) - (b[0] === "+" ? -1 : 0));
  for (const p of sorted) {
    const pos = whereOf(p);
    while (k < pos) { out.push(T[k]); k += 1; }
    if (p[0] === "+") out.push(p[1]);
    else if (p[0] === "-") { if (T[k] !== p[1]) throw new Error("a letter less that is not there"); k += 1; }
    else if (p[0] === "x") { if (T[k] !== p[1] || T[k + 1] !== p[2]) throw new Error("two letters in the other order that are not there"); out.push(p[2], p[1]); k += 2; }
    else { if (T[k] !== p[2]) throw new Error("another letter where theirs is not that letter"); out.push(p[1]); k += 1; }
  }
  while (k < T.length) { out.push(T[k]); k += 1; }
  return out.join("");
}

/** Whether a difference is a spelling of the same word and not another word:
 *  at most two letters changed, and fewer than half of the longer word's
 *  letters (a two-letter word may differ by one). */
export const isSpelling = (d, o, t) => { const L = Math.max(Array.from(o).length, Array.from(t).length); return d > 0 && d <= 2 && d * 2 <= L; };

/** THEIR CUT CARRIED ONTO OUR LETTERS. Their word is cut into parts (STEP's
 *  «/»; MACULA's morphs). Where our letters are theirs the cut is theirs.
 *  Where they differ by named changes, the cut is carried only when it is
 *  certain where every bound falls among our letters:
 *    - a letter ours has more must fall inside one part: not at a bound,
 *      and not beside a run of the same letter that reaches a bound (the
 *      letter could then be either part's);
 *    - a letter ours lacks belongs to their part, which only grows shorter;
 *      but not where it is one of a run of the same letter that crosses a
 *      bound, and not where it empties a part;
 *    - another letter in place of theirs moves no bound; two letters in the
 *      other order move none unless a bound stands between the two;
 *    - changes that touch one another are taken together, and carried only
 *      when all of them fall inside one part.
 *  `partLens` are the letters each of their parts holds. Returns the letters
 *  each part takes of OUR word, or null where the cut cannot be carried (the
 *  parts then stand with their own letters only). */
export function carryCut(o, t, ops, partLens) {
  const T = Array.from(t); const n = T.length;
  if (!ops.length) return partLens.slice();
  const bounds = []; let acc = 0; for (let k = 0; k < partLens.length - 1; k += 1) { acc += partLens[k]; bounds.push(acc); }
  const partOfLetter = (idx) => { let s = 0; for (let k = 0; k < partLens.length; k += 1) { s += partLens[k]; if (idx < s) return k; } return partLens.length - 1; };
  // each change's reach among their letters, in gaps: gap g stands before their letter g
  const reach = ops.map((p) => {
    if (p[0] === "~") return { lo: p[3], hi: p[3] + 1, d: 0 };
    if (p[0] === "x") return { lo: p[3], hi: p[3] + 2, d: 0 };
    if (p[0] === "-") { let a = p[2], b = p[2]; while (a > 0 && T[a - 1] === p[1]) a -= 1; while (b + 1 < n && T[b + 1] === p[1]) b += 1; return { lo: a, hi: b + 1, d: -1 }; }
    let a = p[2], b = p[2]; while (a > 0 && T[a - 1] === p[1]) a -= 1; while (b < n && T[b] === p[1]) b += 1;
    return { lo: a, hi: b, d: 1, more: true };
  }).sort((x, y) => x.lo - y.lo || x.hi - y.hi);
  const lens = partLens.slice();
  let k = 0;
  while (k < reach.length) {
    let lo = reach[k].lo, hi = reach[k].hi, d = 0; const members = [];
    while (k < reach.length && reach[k].lo <= hi) { hi = Math.max(hi, reach[k].hi); d += reach[k].d; members.push(reach[k]); k += 1; }
    if (bounds.some((b) => b > lo && b < hi)) return null;
    if (members.some((r) => r.more && bounds.some((b) => b >= r.lo && b <= r.hi))) return null;
    const part = partOfLetter(Math.max(0, Math.min(lo, n - 1)));
    lens[part] += d;
    if (lens[part] <= 0) return null;
  }
  if (lens.reduce((a, b) => a + b, 0) !== Array.from(o).length) return null;
  return lens;
}

const GAP = 2, LIGHT_GAP = 1;
/** The cost of laying `p` words of ours beside `q` of theirs. */
function groupCost(o, t, p, q) {
  if (o === t) return (p + q - 2) * 0.25;
  const d = distanceOf(o, t);
  if (p === 1 && q === 1) return isSpelling(d, o, t) ? 1 + 0.5 * d : 3.2 + 0.05 * Math.min(d, 10);
  if (p + q === 3 && d === 1 && Math.max(Array.from(o).length, Array.from(t).length) >= 4) return 2.4;
  return Infinity;
}

/** Lays a stretch of our words beside a stretch of theirs (each a list of
 *  letter strings) at the least cost. Returns groups in order:
 *  { a: [indexes of ours], b: [indexes of theirs] }; a group with one side
 *  empty is a word with no partner. */
export function layBeside(A, B, lightA = null, lightB = null) {
  const n = A.length, m = B.length;
  const W = m + 1; const cost = new Float64Array((n + 1) * W).fill(Infinity); const back = new Int8Array((n + 1) * W * 2);
  cost[0] = 0;
  const SH = [[1, 1], [1, 0], [0, 1], [1, 2], [2, 1], [1, 3], [3, 1]];
  for (let i = 0; i <= n; i += 1) for (let j = 0; j <= m; j += 1) {
    const c0 = cost[i * W + j]; if (c0 === Infinity) continue;
    for (const [p, q] of SH) {
      if (i + p > n || j + q > m) continue;
      let c;
      if (q === 0) c = lightA && lightA[i] ? LIGHT_GAP : GAP;
      else if (p === 0) c = lightB && lightB[j] ? LIGHT_GAP : GAP;
      else {
        let o = ""; for (let k = 0; k < p; k += 1) o += A[i + k];
        let t = ""; for (let k = 0; k < q; k += 1) t += B[j + k];
        if (p + q > 2 && (o === "" || t === "")) continue;
        c = groupCost(o, t, p, q);
        if (c === Infinity) continue;
      }
      const at = (i + p) * W + (j + q);
      if (c0 + c < cost[at] - 1e-9) { cost[at] = c0 + c; back[at * 2] = p; back[at * 2 + 1] = q; }
    }
  }
  const groups = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    const at = i * W + j; const p = back[at * 2], q = back[at * 2 + 1];
    const a = [], b = [];
    for (let k = i - p; k < i; k += 1) a.push(k);
    for (let k = j - q; k < j; k += 1) b.push(k);
    groups.push({ a, b }); i -= p; j -= q;
  }
  groups.reverse();
  return groups;
}

/** Meets a whole book's line of ours with theirs.
 *  ours:   [{ letters, verse }]  in order (`verse` is "chapter:verse", ours)
 *  theirs: [{ letters, verse }]  in order (`verse` is their Hebrew number)
 *  Returns { groups, anchoredVerses, regions } where each group is
 *  { a: [indexes of ours], b: [indexes of theirs], pass: 1 | 2 }. */
export function meetLines(ours, theirs) {
  const n = ours.length, m = theirs.length;
  const byVerseO = new Map(), byVerseT = new Map();
  ours.forEach((x, i) => { if (!byVerseO.has(x.verse)) byVerseO.set(x.verse, []); byVerseO.get(x.verse).push(i); });
  theirs.forEach((x, j) => { if (!byVerseT.has(x.verse)) byVerseT.set(x.verse, []); byVerseT.get(x.verse).push(j); });
  const groupOfO = new Array(n).fill(null), usedT = new Uint8Array(m);
  const groups = []; let anchoredVerses = 0;
  // pass 1: a verse under the same number that meets whole
  for (const [verse, oi] of byVerseO) {
    const tj = byVerseT.get(verse); if (!tj) continue;
    // their words of a verse must stand together in their order, and ours too
    if (oi[oi.length - 1] - oi[0] !== oi.length - 1 || tj[tj.length - 1] - tj[0] !== tj.length - 1) continue;
    let gs;
    if (oi.length === tj.length && oi.every((i, k) => ours[i].letters === theirs[tj[k]].letters)) gs = oi.map((_, k) => ({ a: [k], b: [k] }));
    else {
      gs = layBeside(oi.map((i) => ours[i].letters), tj.map((j) => theirs[j].letters), oi.map((i) => !!ours[i].light), tj.map((j) => !!theirs[j].light));
      const whole = gs.every((g) => {
        if (!g.a.length || !g.b.length) return false;
        const o = g.a.map((k) => ours[oi[k]].letters).join(""), t = g.b.map((k) => theirs[tj[k]].letters).join("");
        if (o === t) return true;
        return g.a.length === 1 && g.b.length === 1 && isSpelling(distanceOf(o, t), o, t);
      });
      if (!whole) continue;
    }
    anchoredVerses += 1;
    for (const g of gs) {
      const G = { a: g.a.map((k) => oi[k]), b: g.b.map((k) => tj[k]), pass: 1 };
      groups.push(G); for (const i of G.a) groupOfO[i] = G; for (const j of G.b) usedT[j] = 1;
    }
  }
  // the met verses must stand in the same order in both lines
  let lastT = -1, disorder = 0;
  for (let i = 0; i < n; i += 1) { const G = groupOfO[i]; if (!G) continue; const lo = G.b[0]; if (lo < lastT) disorder += 1; lastT = Math.max(lastT, G.b[G.b.length - 1]); }
  // pass 2: what stands between the met verses, in order
  const regions = [];
  let i = 0, tFloor = 0;
  for (;;) {
    let i2 = i; while (i2 < n && !groupOfO[i2]) i2 += 1;
    const tCeil = i2 < n ? groupOfO[i2].b[0] : m;
    const oi = []; for (let k = i; k < i2; k += 1) oi.push(k);
    const tj = []; for (let k = tFloor; k < tCeil; k += 1) if (!usedT[k]) tj.push(k);
    if (oi.length || tj.length) {
      const gs = layBeside(oi.map((k) => ours[k].letters), tj.map((k) => theirs[k].letters), oi.map((k) => !!ours[k].light), tj.map((k) => !!theirs[k].light));
      regions.push({ ours: oi.length, theirs: tj.length });
      for (const g of gs) {
        const G = { a: g.a.map((k) => oi[k]), b: g.b.map((k) => tj[k]), pass: 2 };
        groups.push(G); for (const k of G.a) groupOfO[k] = G; for (const k of G.b) usedT[k] = 1;
      }
    }
    if (i2 >= n) break;
    const G = groupOfO[i2];
    tFloor = Math.max(tFloor, G.b[G.b.length - 1] + 1);
    i = G.a[G.a.length - 1] + 1;
  }
  return { groups, groupOfO, usedT, anchoredVerses, regions, disorder };
}

export { lettersOf };
