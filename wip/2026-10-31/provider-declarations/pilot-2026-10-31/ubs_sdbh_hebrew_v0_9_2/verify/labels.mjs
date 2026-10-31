// node labels.mjs : tries readings of the draft's "8,048 pills open with a label" over today's v3 pills
import { load, SCRATCH } from "./lib.mjs";
const { senseSplit } = await import(`${SCRATCH}/ghp/reader/tools/sense-split-v1.mjs`);
const packSplit = (t) => { const o = []; let st = 0, d = 0; for (let i = 0; i < t.length; i += 1) { if (t[i] === "(") d += 1; else if (t[i] === ")") { if (d > 0) d -= 1; } else if (t[i] === ";" && d === 0) { o.push(t.slice(st, i)); st = i + 1; } } o.push(t.slice(st)); return o.join(";") !== t ? [t.trim()].filter(Boolean) : o.map((x) => x.trim()).filter(Boolean); };
const tests = {
  colon_within_pill_head: (p) => /^[^:]{0,40}:/u.test(p),
  label_word_start: (p) => /^(exact meaning|meaning|literally|literaly|literallly|litterally|liteallly|hence|therefore|possibly|probably|perhaps|possible|or|either|alternatively|poetic)\b/iu.test(p),
  label_word_then_colon: (p) => /^(exact meaning \w+|meaning \w+|literally|literaly|literallly|litterally|liteallly|hence|therefore|possibly|probably|perhaps|possible|or|either|alternatively|poetic \w+)\s*:/iu.test(p),
  any_word_colon_start: (p) => /^[\p{L} ,]{1,40}:/u.test(p),
  contains_colon_equals: (p) => /:\s*=/u.test(p),
};
const c = Object.fromEntries(Object.keys(tests).map((k) => [k, 0]));
for (const r of load()) { const whole = r.route.trim(); for (const s of packSplit(r.route)) { const x = senseSplit(s); if (x.damaged) continue; for (const p of x.readings) { if (p === whole) continue; for (const [k, f] of Object.entries(tests)) if (f(p)) c[k] += 1; } } }
console.log(c);
