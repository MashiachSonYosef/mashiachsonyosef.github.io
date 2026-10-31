// Shared parsing for the independent verifier (written from the draft's tests as stated in words).
import { readFileSync } from "node:fs";
export const F = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/openscriptures_strongs.jsonl";
export const loadRows = () => readFileSync(F, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
export const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
export const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
export const isDigit = (c) => c !== undefined && /\p{N}/u.test(c);
// tag trace: a non-digit, then a space, then , ; or .
export const TRACE = /[^\d] [,;.]/u;
export const traceAt = (s, i) => s[i - 1] === " " && i - 2 >= 0 && !isDigit(s[i - 2]);
export const fieldOf = (def) => {
  if (/[×+]/u.test(def)) return "list";
  const t = def.trim();
  const endsStop = /\.$/u.test(t) || /\.\s*\[[^\[\]]*\]\.?$/u.test(t);
  if (endsStop && !TRACE.test(def)) return "list";
  return "def";
};
// depth (before char i), pair partner, unclosed openers; ( ) and [ ] each matched on its own stack, closers with nothing open inert
export const parse = (s) => {
  const depth = new Array(s.length + 1).fill(0);
  const partner = new Array(s.length).fill(-1);
  const st = { "(": [], "[": [] };
  const close = { ")": "(", "]": "[" };
  const orphan = new Set();
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    depth[i] = d;
    const c = s[i];
    if (c === "(" || c === "[") { st[c].push(i); d++; }
    else if (c in close) {
      const k = close[c];
      if (st[k].length) { const o = st[k].pop(); partner[o] = i; partner[i] = o; d--; depth[i] = d; }
      else orphan.add(i);
    }
  }
  depth[s.length] = d;
  const unclosed = new Set([...st["("], ...st["["]]);
  return { depth, partner, orphan, unclosed };
};
export const words = (piece) => piece.replace(/\([^()]*\)/gu, " ").replace(/\[[^\[\]]*\]/gu, " ").trim().split(/\s+/u).filter(Boolean);
