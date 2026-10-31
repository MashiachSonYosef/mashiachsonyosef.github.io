// shared helpers for the verifier (written from the shape tests as stated in words; no code reused from the draft)
export const isLetter = (c) => c !== undefined && c !== "" && /\p{L}/u.test(c);
export const isDigit = (c) => c !== undefined && c !== "" && /\p{Nd}/u.test(c);
export const isSpace = (c) => c !== undefined && c !== "" && /\s/u.test(c);
export const isHebLetter = (c) => c !== undefined && c >= "א" && c <= "ת";
export const isHebPoint = (c) => c !== undefined && c >= "֑" && c <= "ׇ" && /\p{M}/u.test(c);
export const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);

/** Locate every route of a (key, def) block in order: first occurrence at or after the cursor, preferring one bounded like a list item. */
export const occurrences = (hay, needle) => { const o = []; let i = hay.indexOf(needle); while (i !== -1) { o.push(i); i = hay.indexOf(needle, i + 1); } return o; };
const prevNonSpace = (s, i) => { let k = i - 1; while (k >= 0 && isSpace(s[k])) k--; return k >= 0 ? s[k] : ""; };
const nextNonSpace = (s, i) => { let k = i; while (k < s.length && isSpace(s[k])) k++; return k < s.length ? s[k] : ""; };
export const itemBounded = (def, p, len) => {
  const a = prevNonSpace(def, p), b = nextNonSpace(def, p + len);
  return (a === "" || ",:;-".includes(a)) && (b === "" || ",.;".includes(b));
};
export const makeLocator = () => {
  let prevKey = null, prevDef = null, cursor = 0;
  // A (optional): the definition analysis; an item-bounded occurrence in the rendering list is preferred,
  // then any item-bounded occurrence, then the first occurrence at or after the cursor.
  return (r, A) => {
    if (r.key !== prevKey || r.def !== prevDef) { prevKey = r.key; prevDef = r.def; cursor = 0; }
    const o = occurrences(r.def, r.route);
    const fwd = o.filter((p) => p >= cursor);
    const pool = fwd.length ? fwd : o;
    const inList = A ? pool.find((p) => itemBounded(r.def, p, r.route.length) && A.region(p) === "list") : undefined;
    const bounded = inList !== undefined ? inList : pool.find((p) => itemBounded(r.def, p, r.route.length));
    const p = bounded !== undefined ? bounded : pool[0];
    cursor = p + r.route.length;
    return { p, n: o.length, bounded: bounded !== undefined };
  };
};

/** Definition analysis: opener and list end, by the locate rule as stated. */
const ieDot = (s, i) => (s[i - 1] === "i" && s[i + 1] === "e" && s[i + 2] === "." && !isLetter(s[i - 2]))
  || (s[i - 1] === "e" && s[i - 2] === "." && s[i - 3] === "i" && !isLetter(s[i - 4]));
export { ieDot };
export const analyzeDef = (def, opts = {}) => {
  let op = null;
  for (let i = def.length - 1; i >= 0; i--) {
    if (def[i] === ":" && !isDigit(def[i + 1])) { op = { kind: ":", start: i }; break; }
  }
  if (op) {
    let e = op.start + 1; while (e < def.length && /[\s-]/u.test(def[e])) e++; op.end = e;
  } else {
    const dd = def.indexOf("--");
    if (dd !== -1) {
      let s = dd, k = dd - 1; while (k >= 0 && isSpace(def[k])) k--;
      if (k >= 0 && def[k] === ";") s = k;
      let e = dd + 2; while (e < def.length && /[\s-]/u.test(def[e])) e++;
      op = { kind: "--", start: s, end: e };
    } else {
      const sd = def.lastIndexOf("; -");
      if (sd !== -1) { let e = sd + 1; while (e < def.length && /[\s-]/u.test(def[e])) e++; op = { kind: "; -", start: sd, end: e }; }
    }
  }
  if (op) op.spelled = def.slice(op.start, op.end).replace(/\s+/gu, "");
  let le = -1;
  if (op) {
    let d = 0;
    for (let i = 0; i < def.length; i++) {
      const c = def[i];
      if (c === "(") d++;
      else if (c === ")") { if (d > 0 || opts.noClamp) d--; }
      else if (c === "." && i >= op.end && d === 0 && le === -1) {
        const inRun = def[i - 1] === "." || def[i + 1] === ".";
        if (!inRun && !ieDot(def, i) && def[i + 1] !== ",") le = i;
      }
    }
  }
  const region = (q) => {
    if (!op) return "no_opener";
    if (q < op.start) return "head";
    if (q < op.end) return "opener";
    if (le === -1 || q < le) return "list";
    if (q === le) return "list_end";
    return "notes";
  };
  return { op, le, region };
};

/** Parenthesis structure of one route, matched within the route. */
export const parenInfo = (s) => {
  const match = new Array(s.length).fill(-1), st = [];
  const stray = new Set();
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") st.push(i);
    else if (s[i] === ")") { if (st.length) { const o = st.pop(); match[o] = i; match[i] = o; } else stray.add(i); }
  }
  const unclosed = new Set(st);
  const depth = new Array(s.length).fill(0), inner = new Array(s.length).fill(-1), inUnclosed = new Array(s.length).fill(false);
  const st2 = [];
  for (let i = 0; i < s.length; i++) {
    depth[i] = st2.length; inner[i] = st2.length ? st2[st2.length - 1] : -1;
    inUnclosed[i] = st2.some((o) => unclosed.has(o));
    if (s[i] === "(") st2.push(i);
    else if (s[i] === ")" && !stray.has(i)) st2.pop();
  }
  return { match, stray, unclosed, depth, inner, inUnclosed };
};
