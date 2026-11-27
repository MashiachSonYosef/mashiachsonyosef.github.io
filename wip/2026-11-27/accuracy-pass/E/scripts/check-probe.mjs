// compare the page's card with the machine model for each sampled placing
import { readFileSync } from "node:fs";
const samples = JSON.parse(readFileSync("samples.json", "utf8"));
const probe = new Map(readFileSync("probe-samples.jsonl", "utf8").split("\n").filter(Boolean).map((l) => { const j = JSON.parse(l); return [`${j.book}|${j.si}|${j.e}`, j]; }));
const norm = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase().replace(/\s+/gu, " ").trim();
let seen = 0, ok = 0, headOk = 0, blockOk = 0; const miss = [];
const perFam = {};
for (const s of samples) {
  const p = probe.get(`${s.book}|${s.si}|${s.e}`); if (!p) continue; seen += 1;
  const f = perFam[s.family] || (perFam[s.family] = { seen: 0, found: 0, found_rests: 0 });
  f.seen += 1;
  if (p.head && p.head.startsWith(`${s.label}:${s.n} `)) headOk += 1;
  const lettersOnly = (t) => [...String(t || "")].filter((c) => c >= "א" && c <= "ת").join("");
  if (lettersOnly(p.block) === lettersOnly(s.block)) blockOk += 1;
  const hit = (p.pills || []).find((x) => norm(x[0]) === norm(s.reading) && x[1].split(/\s+/u).includes(s.m));
  const hit2 = hit || (p.pills || []).find((x) => norm(x[0]) === norm(s.reading));
  if (hit) { ok += 1; f.found += 1; if (hit[2]) f.found_rests += 1; } else miss.push({ fam: s.family, i: s.i, at: `${s.book} ${s.label}:${s.n}`, head: p.head, block: p.block, want: s.reading, m: s.m, textOnly: hit2 ? hit2 : null, fault: p.fault || null, npills: (p.pills || []).length });
}
console.log(JSON.stringify({ seen, ok, headOk, blockOk }), JSON.stringify(perFam));
for (const m of miss.slice(0, 40)) console.log(JSON.stringify(m));
