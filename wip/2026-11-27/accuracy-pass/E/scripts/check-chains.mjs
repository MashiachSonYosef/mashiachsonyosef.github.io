import { readFileSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const R = process.argv[2];
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const samples = JSON.parse(readFileSync("samples.json", "utf8"));
const probe = new Map(readFileSync("probe-samples.jsonl", "utf8").split("\n").filter(Boolean).map((l) => { const j = JSON.parse(l); return [`${j.book}|${j.si}|${j.e}`, j]; }));
const zones = new Map();
const L = (t) => [...String(t || "")].filter((c) => c >= "א" && c <= "ת").join("");
const tally = {};
const seen = new Set();
for (const s of samples) {
  const k = `${s.book}|${s.si}|${s.e}`; if (seen.has(k)) continue; seen.add(k);
  const p = probe.get(k); if (!p) continue;
  if (!zones.has(s.book)) zones.set(s.book, gz(join(R, "data", "zones", `${s.book}.bin`)));
  const words = zones.get(s.book).sections[s.si].words; const w = words[s.e];
  const pj = w.presentation_join || {};
  const chain = pj.join_next_without_separator || pj.join_previous_without_separator || w.after_maqaf ? "chain" : "plain";
  const kind = s.block_kind === "core piece" ? "piece" : "whole";
  const pageBlock = p.block === null ? "null" : L(p.block) === L(s.block) ? "same" : L(p.block) === L(s.key) ? "whole-word" : "other";
  const runHead = /\d+[–-]\d+ /u.test(String(p.head || "")) ? "runhead" : "wordhead";
  const key = `${chain} ${kind} -> ${pageBlock} ${runHead}`;
  tally[key] = (tally[key] || 0) + 1;
}
console.log(tally);
