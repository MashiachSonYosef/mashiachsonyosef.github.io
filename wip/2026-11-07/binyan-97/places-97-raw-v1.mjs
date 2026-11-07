import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const tsv = readFileSync(`${S}/dl-moses2/corpus-lane-builds/moses-binyan-ledger-v1/said-at-split-v1/r3/stem-pairs-diff-v1.tsv`, "utf8").split("\n").filter(Boolean);
const head = tsv[0].split("\t");
const rows = tsv.slice(1).map((l) => Object.fromEntries(l.split("\t").map((v, i) => [head[i], v]))).filter((r) => r.side === "ours_only");
const places = new Map(); for (const r of rows) places.set(`${r.book} ${r.place}`, r);
const cp = (t) => [...t].map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).join(" ");
const zones = new Map();
const cls = {};
for (const r of places.values()) {
  if (!zones.has(r.book)) zones.set(r.book, JSON.parse(gunzipSync(readFileSync(`${S}/pt/reader/data/zones/${r.book}.bin`)).toString("utf8")));
  const z = zones.get(r.book); const [ch, vs, wi] = r.place.split(":");
  const sec = z.sections.find((s) => String(s.label) === `${ch}:${vs}`);
  const ws = (sec.words || []).filter((w) => !w.mark);
  const w = ws[Number(wi) - 1];
  const zs = w ? (w.s || "") : "";
  let c;
  if (zs === r.surface) c = "raw equal";
  else if (w && w.w) c = "a joined word in the zone (w.w)";
  else if (zs.replace(/[֑-ׇ]/gu, "") === r.surface.replace(/[֑-ׇ]/gu, "")) c = `same letters, marks differ: zone [${cp(zs)}] place [${cp(r.surface)}]`;
  else c = `other word at the index: zone «${zs}» place «${r.surface}»`;
  const k = c.split(":")[0]; cls[k] = (cls[k] || 0) + 1;
  if (k !== "raw equal") console.log(`${r.book} ${r.place} ${r.key}: ${c}`);
}
console.log(JSON.stringify(cls));
