// Read-only: the final samples. The first sample's placings are kept where the page shows them on the card as it
// opens (the family's M among a pill's carriers and the pill printing the reading, alone or with a note the page folds
// in); a placing the page does not show there is set aside with why, and replaced from the second walk's reservoir.
// New sets: the Samaritan works (drawn again, Uhlemann resting off by his own switch), the held lists, and the
// rows of the place's own entry of two families, drawn apart.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
let seed = 4039; const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (rows) => { for (let i = rows.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; } return rows; };
const norm = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase().replace(/\s+/gu, " ").trim();
const bare = (t) => norm(t).replace(/\[[^\]]*\]|<[^>]*>/gu, "").replace(/\s+/gu, " ").trim();
const probeFiles = ["probe-samples.jsonl", "probe-samples2.jsonl"].filter((f) => existsSync(f));
const probe = new Map(); for (const f of probeFiles) for (const l of readFileSync(f, "utf8").split("\n")) { if (!l) continue; const j = JSON.parse(l); probe.set(`${j.book}|${j.si}|${j.e}`, j); }
export const onPage = (s) => {
  const p = probe.get(`${s.book}|${s.si}|${s.e}`); if (!p) return { status: "not probed" };
  if (p.fault || !p.pills) return { status: "not on the card", why: p.fault || "no card" };
  const want = norm(s.reading), wantBare = bare(s.reading);
  const mine = p.pills.filter((x) => x[1].split(/\s+/u).includes(s.m));
  let hit = mine.find((x) => norm(x[0]) === want), status = "exact";
  if (!hit) { hit = mine.find((x) => norm(x[0]).startsWith(want) || norm(x[0]).includes(want)); status = "folded"; }
  if (!hit) { hit = p.pills.find((x) => norm(x[0]) === wantBare && wantBare !== want); status = "printed without its bracket"; }
  if (!hit) return { status: "not on the card", why: /\d+[–-]\d+ /u.test(String(p.head || "")) ? `the card opens on a run (${p.head})` : (p.held || "").slice(0, 160), head: p.head };
  return { status, page_pill: hit[0], page_by: hit[1], page_rests: hit[2], head: p.head, page_block: p.block, pills_on_card: p.pills.length, held_line: (p.held || "").slice(0, 200) };
};
const first = JSON.parse(readFileSync("samples.json", "utf8"));
const out = [];
const load = (f) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const fams = [...new Set(first.map((r) => r.family))];
for (const fam of fams) {
  if (fam === "samaritan") continue;
  const mine = first.filter((r) => r.family === fam);
  const kept = [], aside = [];
  for (const r of mine) { const pg = onPage(r); (pg.status === "not on the card" ? aside : kept).push({ ...r, set: fam, page: pg }); }
  const taken = new Set(mine.map((r) => `${r.block}\u0001${r.rk}`));
  const pool = shuffle(load(`reservoir2-${fam}.jsonl`));
  let i = 60;
  for (const r of pool) { if (kept.length + (i - 60) >= 60) break; const k = `${r.block}\u0001${r.rk}`; if (taken.has(k)) continue; taken.add(k); i += 1; out.push({ ...r, i, set: fam, replacement: true }); }
  out.push(...kept, ...aside.map((r) => ({ ...r, set_aside: true })));
  console.log(fam, "kept", kept.length, "aside", aside.length, "replacements", i - 60);
}
const fresh = (set, file, n) => {
  const pool = shuffle(load(file)); const seen = new Set(); let i = 0;
  for (const r of pool) { const k = `${r.block}\u0001${r.rk}`; if (seen.has(k)) continue; seen.add(k); i += 1; out.push({ ...r, i, set }); if (i === n) break; }
  console.log(set, "new", i, "books", new Set(out.filter((r) => r.set === set).map((r) => r.book)).size);
};
fresh("samaritan", "reservoir2-samaritan.jsonl", 60);
fresh("held-davidson-other-editions", "reservoir2-held-davidson-other-editions.jsonl", 60);
fresh("held-etcbc", "reservoir2-held-etcbc.jsonl", 60);
fresh("held-step-expanded-strong", "reservoir2-held-step-expanded-strong.jsonl", 60);
fresh("held-panlex-own-language", "reservoir2-held-panlex-own-language.jsonl", 60);
fresh("held-harkavy", "reservoir2-held-harkavy.jsonl", 30);
fresh("classical-hebrew-words.this", "reservoir2-classical-hebrew-words.this.jsonl", 30);
fresh("hebrew-wiktionary.this", "reservoir2-hebrew-wiktionary.this.jsonl", 30);
if (process.argv[2] !== "--dry") writeFileSync("samples2.json", JSON.stringify(out));
