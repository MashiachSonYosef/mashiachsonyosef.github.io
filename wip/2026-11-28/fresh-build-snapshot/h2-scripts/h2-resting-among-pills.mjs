// Scratch (builder H2): at each of the words whose resting line the place answers do not give (the comparison's
// table), is the resting reading among the pills of the cells the card opens on? The whole word's line against the
// whole word's pills, or each piece of the line against the pills of STEP's part in that place.
// node h2-resting-among-pills.mjs <reader dir> <table.tsv> <out.tsv>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [R, TABLE, OUT] = process.argv.slice(2);
const DATA = join(R, "data", "place-answers-v1", "page");
globalThis.fetch = async (url) => { const p = join(DATA, String(url).slice(2)); return existsSync(p) ? new Response(readFileSync(p), { status: 200 }) : new Response("no", { status: 404 }); };
globalThis.document = { createElement: () => ({}) };
const { placeCardOf } = await import(join(R, "tools", "place-card-v1.mjs"));
const card = placeCardOf({ data: "d/", fault: () => {} });
const key = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
const LET = (s) => [...String(s || "")].filter((c) => c >= "א" && c <= "ת").length;
const rows = readFileSync(TABLE, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const out = [["book", "verse", "entry", "today's line", "among the pills", "where"].join("\t")];
let among = 0, not = 0;
for (const [book, verse, entry, , today] of rows) {
  const doc = await card.chapter(book, Number(verse.split(":")[0]));
  const v = doc.verses.find((x) => x.l === verse); let n = 0, e = null;
  for (const x of v.e) { if (x.m !== undefined) continue; n += 1; if (x.i === Number(entry)) { e = x; break; } }
  let hit = "";
  if (e) for (const f of e.f) {
    const reading = e.f.length === 1 ? "form" : f.r === 2 ? "ketiv" : "qere";
    const tp = (f.t && f.t.p) || []; const t = tp.reduce((s, p) => s + LET(p[3]), 0); if (!t) continue;
    const whole = await card.pillsAt(doc, verse, n, reading, 0, t - 1, t);
    if (whole.pills.some((p) => key(p.text) === key(today))) { hit = `the whole word (${reading}), ${whole.pills.find((p) => key(p.text) === key(today)).src}`; break; }
    const pieces = today.split(" + ");
    if (pieces.length === tp.length) {
      let a = 0, ok = true; const who = [];
      for (const [i, p] of tp.entries()) { const L = LET(p[3]); const got = await card.pillsAt(doc, verse, n, reading, a, a + L - 1, t); a += L; const m = got.pills.find((x) => key(x.text) === key(pieces[i])); if (!m) { ok = false; break; } who.push(m.src); }
      if (ok) { hit = `each piece in its part's cell (${reading}): ${who.join(", ")}`; break; }
    }
  }
  if (hit) among += 1; else not += 1;
  out.push([book, verse, entry, today, hit ? "yes" : "no", hit].join("\t"));
}
writeFileSync(OUT, `${out.join("\n")}\n`);
console.log(`${rows.length} words whose resting line the place answers do not give: ${among} with the resting reading among the pills, ${not} without`);
