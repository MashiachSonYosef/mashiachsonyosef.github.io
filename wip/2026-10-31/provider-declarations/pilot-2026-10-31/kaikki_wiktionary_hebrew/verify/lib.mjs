// Independent parsing helpers for the kaikki_wiktionary_hebrew verification.
// Written from the declaration's tests as stated in words; no code from the draft.
export const HEB_LETTER = /[א-תװ-ײ]/u;
export const isHebLetter = (c) => !!c && HEB_LETTER.test(c);
export const isHebPoint = (c) => !!c && /\p{Mn}/u.test(c) && c >= "֑" && c <= "ׇ";
export const isHeb = (c) => isHebLetter(c) || isHebPoint(c);
export const isLetter = (c) => !!c && /\p{L}/u.test(c);
export const isDigit = (c) => !!c && /\p{N}/u.test(c);
export const isSpace = (c) => !!c && /\s/u.test(c);
export const isMark = (c) => !!c && !isLetter(c) && !isDigit(c) && !isSpace(c);
export const isUpper = (c) => !!c && /\p{Lu}/u.test(c);
export const isLower = (c) => !!c && /\p{Ll}/u.test(c);

// Structure of one route string. Indices are UTF-16 indices.
export function parse(s) {
  const n = s.length;
  const paren = new Int16Array(n + 1);   // number of open '(' enclosing position i (for i strictly after the opener)
  const brack = new Int16Array(n + 1);
  const quote = new Uint8Array(n + 1);   // 1 when inside a quotation scope
  const groups = [];                     // {open, close (-1 unclosed), depthAtOpen, kind}
  const pst = [], bst = [];
  let pd = 0, bd = 0;
  const orphanClose = [];
  for (let i = 0; i < n; i++) {
    paren[i] = pd; brack[i] = bd;
    const c = s[i];
    if (c === "(") { const g = { open: i, close: -1, depth: pd, bdepth: bd, kind: "(" }; groups.push(g); pst.push(g); pd++; }
    else if (c === ")") { if (pst.length) { const g = pst.pop(); g.close = i; pd--; paren[i] = pd; } else orphanClose.push(i); }
    else if (c === "[") { const g = { open: i, close: -1, depth: pd, bdepth: bd, kind: "[" }; groups.push(g); bst.push(g); bd++; }
    else if (c === "]") { if (bst.length) { const g = bst.pop(); g.close = i; bd--; brack[i] = bd; } else orphanClose.push(i); }
  }
  // paren[i] for an opener at i is depth before it (set above); for closer, depth after closing.
  // quotation scopes: curly double pairs, curly single ‘…’ pairs, straight double pairs, angle ⟨⟩
  const qpairs = [];
  const pairSeq = (op, cl) => { let o = -1; for (let i = 0; i < n; i++) { if (s[i] === op && o < 0) o = i; else if (s[i] === cl && o >= 0) { qpairs.push([o, i, op]); o = -1; } } };
  pairSeq("“", "”");
  pairSeq("‘", "’");
  pairSeq("⟨", "⟩");
  // straight double quotes: those with letters on both sides are gershayim substitutes; the rest pair in order
  const sd = [];
  for (let i = 0; i < n; i++) if (s[i] === '"' && !(isLetter(s[i - 1]) && isLetter(s[i + 1]))) sd.push(i);
  const sdPaired = new Set();
  for (let k = 0; k + 1 < sd.length; k += 2) { qpairs.push([sd[k], sd[k + 1], '"']); sdPaired.add(sd[k]); sdPaired.add(sd[k + 1]); }
  for (const [a, b] of qpairs) for (let i = a + 1; i < b; i++) quote[i] = 1;
  const inScope = (i) => paren[i] > 0 || brack[i] > 0 || quote[i] === 1;
  return { s, n, paren, brack, quote, groups, orphanClose, qpairs, sdPaired, inScope };
}

export const words = (t) => t.trim().split(/\s+/u).filter(Boolean);
// words outside parentheses (a group counts as nothing)
export const stripGroups = (t) => { let out = "", d = 0; for (const c of t) { if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (d === 0) out += c; } return out; };
export const hebOutsideParens = (t) => { let d = 0; for (const c of t) { if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (d === 0 && isHebLetter(c)) return true; } return false; };
export const hebOutsideScopes = (t) => { let d = 0, b = 0; for (const c of t) { if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (c === "[") b++; else if (c === "]") { if (b > 0) b--; } else if (d === 0 && b === 0 && isHebLetter(c)) return true; } return false; };
export const win = (key, s, i) => { const a = Math.max(0, (i ?? 0) - 28); const t = s.slice(a, a + 56); return `${key}: ${a > 0 ? "…" : ""}${t}${a + 56 < s.length ? "…" : ""}`; };
