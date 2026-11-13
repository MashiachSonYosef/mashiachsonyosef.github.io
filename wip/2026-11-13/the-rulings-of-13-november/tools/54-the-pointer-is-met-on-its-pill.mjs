// Under the map of 13 November 2026 no line rests on a pure pointer: the forty plain words whose lead was a
// "pointer" under the map before it were readings with English of their own, which print as themselves now (the
// owner's ruling 5). check-form-of-v1 found its word by a cell whose lead is a resolved pointer, and finds none.
// The pointer is still on the cards, as a pill, and on the line once the pill is pressed. The check's laws F3 to F5
// are restated there, and its words are found from the zones and the store: a served plain word whose key holds a
// row of the pointer's own source that carries it. F7's cards are built before they are pressed, as F3's are.
// Applies after edit 50.
// node 54-the-pointer-is-met-on-its-pill.mjs <reader dir>
import { join } from "node:path";
import { edit, span } from "./lib.mjs";
const R = process.argv[2];
const F = join(R, "tools", "check-form-of-v1.mjs");

edit(F, [
  [`//   F3  under the "corpus" order (the rail's "reads first", where the line
//       prints the catalog's lead rather than the source at this place), a
//       cell whose lead reading is a resolved pointer prints the resolved
//       reading with the pointer's relation and target in parentheses; the
//       pointer's bare text stands on no cell of that key; the Hebrew is the
//       Hebrew
//   F4  its card's pressed pill prints the same and carries the pointer's own
//       text as data-pointer (the pill is the source's row; what it prints is
//       the resolution)
//   F5  a ruling: another pill pressed moves the line to that reading; the
//       pointer pill pressed again puts the resolved text back on the line,
//       and the Hebrew never moved
`,
   `//   F3  on the card of a word whose key holds a resolved pointer, with every
//       switch lifted: the pointer's pill prints the resolved reading with
//       the pointer's relation and target in parentheses and carries the
//       pointer's own text as data-pointer (the pill is the source's row;
//       what it prints is the resolution); the pointer's bare text stands on
//       no pill
//   F4  that pill pressed, a ruling: the line under the word prints the
//       same, and the Hebrew is the Hebrew
//   F5  another pill pressed moves the line to that reading; the pointer
//       pill pressed again puts the resolved text back on the line, and the
//       Hebrew never moved
`],
  [`// The word is found from the data on disk, never named here
// (check-scope-derived S1).
`,
   `// The words are found from the data on disk, never named here
// (check-scope-derived S1). NO LINE RESTS ON A PURE POINTER under the map of
// 13 November 2026: the forty plain words whose lead was a pointer under the
// map before it were readings with English of their own, which print as
// themselves now. So the pointer is met on its pill, and on the line once
// the pill is pressed.
`],
  [`import { STATES } from "./card-readings-v1.mjs";
`,
   `import { STATES } from "./card-readings-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
`],
  [`{
  const store = openRouteStore("data/route-store");
  const mixedOf = new Map();   // key -> its readings with English of their own, as the lane's file names them
`,
   `{
  const mixedOf = new Map();   // key -> its readings with English of their own, as the lane's file names them
`],
  [`      await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
      const got = await q.evaluate(async ({ section, entry, m, own }) => {`,
   `      await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
      await linesOnPage(q, { from: pick.section, to: pick.section + 1 });
      const got = await q.evaluate(async ({ section, entry, m, own }) => {`],
]);

span(F, [[
  `// the word: the first served zone with a cell whose lead is a resolved pointer
`,
  `// F7 a reading with English of its own prints its own words.`,
  `// the words: served plain words whose key holds a row of the pointer's own source that carries a resolved pointer
const urls = zoneUrls();
const base = /^https?:/u.test(process.argv[2] || "") ? process.argv[2].replace(/\\/zone\\.html.*$/u, "") : null;
const store = openRouteStore("data/route-store");
const candidates = [];
const MAX = 12;
{
  const seen = new Set();
  for (const u of urls) {
    if (candidates.length >= MAX) break;
    const id = zoneIdOf(u); const path = \`data/zones/\${id}.bin\`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (candidates.length >= MAX) break;
      // one region its place does not divide, so the card opens on its whole form; in no span, joined to no word
      const l = w.k && !w.w && !seen.has(w.k) ? rec.keys[w.k] : null;
      if (!l || (z.spans && z.spans[w.k]) || /\\u05BE/u.test(w.s || "") || (ei > 0 && /\\u05BE$/u.test(sec.words[ei - 1].s || "")) || (Array.isArray(w.pg) && w.pg.length > 1)) continue;
      const rows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
      const e = l.find((x) => x.resolved && store.carriersOf(rows, x.t).some((r) => String(r[3]) === x.m));
      if (!e) continue;
      seen.add(w.k);
      candidates.push({ url: base ? \`\${base}/zone.html?b=\${id}\` : u, id, label: sec.label, section: si, entry: ei, key: w.k, surface: w.s, e });
    }
  }
}
check("F0  served zones hold plain words whose key carries a resolved pointer on a row of its own source (found from the zones on disk and the store)", candidates.length > 0,
  candidates.length ? \`\${candidates.length} word(s) in \${new Set(candidates.map((c) => c.id)).size} zone(s); first \${candidates[0].id} \${candidates[0].label}, entry \${candidates[0].entry} · pointer "\${candidates[0].e.t}" (\${candidates[0].e.m}) · resolves to "\${candidates[0].e.resolved.text}" under \${candidates[0].e.resolved.key}\` : \`none among \${urls.length} zones\`);
if (!candidates.length) { console.log(bad ? "\\nFAIL" : "\\nall checks passed"); process.exit(bad ? 1 : 0); }

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// in the page: the word's card opened as a reader opens it; then what stands on the card and under the word
const openCard = async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return "the word is not on the page";
  wb.scrollIntoView({ block: "center" });
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const t0 = Date.now();
  while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
  return settled() ? null : "the card's readings did not arrive";
};
const cardNow = ({ section, entry }) => {
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  const g = wb ? wb.querySelector(":scope > .g") : null;
  let line = "";
  if (g) { const c = g.cloneNode(true); for (const x of c.querySelectorAll(".g-lic, .lic-chip, .lic")) x.remove(); line = c.textContent.trim(); }
  return {
    line, he: wb ? ((wb.querySelector(":scope > .w") || {}).textContent || "").trim() : "",
    pills: [...document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")].map((x) => ({ t: x.textContent.trim(), pointer: x.dataset.pointer || null, by: x.dataset.by || "", pressed: x.getAttribute("aria-pressed") === "true" })),
  };
};
const pressPill = (i) => { document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")[i].click(); };
const pointerPill = (card, e) => card.pills.findIndex((x) => x.pointer && noDot(x.pointer) === noDot(e.t) && x.by.split(/[\\s,]+/u).includes(e.m));
// the letters alone: accents, meteg, rafe, masora circle, paseq, sof pasuq and the marks U+05C4 to U+05C7 set aside
// (points are kept: a resolution moves no point either)
const MARKS = new RegExp("[\\\\u0591-\\\\u05AF\\\\u05BD\\\\u05BF\\\\u05C0\\\\u05C3-\\\\u05C7\\\\s]", "gu");
const sameHe = (x, y) => String(x || "").normalize("NFC").replace(MARKS, "") === String(y || "").normalize("NFC").replace(MARKS, "");
let found = null, map = null, first = null, page = null;
const tried = [];
for (const c of candidates) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const q = await ctx.newPage();
  q.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await q.goto(c.url, { waitUntil: "networkidle" });
  // every switch that withholds a reading lifted, so no row is kept off the card
  await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
  await q.reload({ waitUntil: "networkidle" });
  await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  // the map arrives after the first paint
  await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
  map = await q.evaluate(() => (window.__formOf === undefined ? "never" : window.__formOf));
  await linesOnPage(q, { from: c.section, to: c.section + 1 });
  const fault = await q.evaluate(openCard, c);
  await q.waitForTimeout(600);
  const card = fault ? null : await q.evaluate(cardNow, c);
  const at = card ? pointerPill(card, c.e) : -1;
  tried.push(\`\${c.id} \${c.label}, entry \${c.entry} (\${c.key}): \${fault || (at < 0 ? "no pill carries the pointer" : "its pill stands")}\`);
  if (at >= 0) { found = c; first = card; page = q; break; }
  await ctx.close();
}
check("F2  the page loads the map after its first paint and says so", !!map && map !== "never" && map.keys === Object.keys(rec.keys).length && map.pills === rec.counts.pills && map.resolved === rec.counts.resolved,
  JSON.stringify(map));
if (!found) check("F3  the pointer's pill prints the resolved reading and carries the pointer's own text", false, \`no card of \${candidates.length} pressed carried its pointer on a pill: \${tried.join(" | ")}\`);
else {
  const want = says(found.e);
  const pill = first.pills[pointerPill(first, found.e)];
  const bare = first.pills.filter((x) => noDot(x.t) === noDot(found.e.t)).length;
  check("F3  with every switch lifted the pointer's pill prints the resolved reading with the relation and target in parentheses and carries the pointer's own text; the pointer's bare text stands on no pill",
    pill.t === want && bare === 0,
    \`\${found.id} \${found.label}, entry \${found.entry} (\${found.key}): pill "\${pill.t}" · wanted "\${want}" · data-pointer "\${pill.pointer}" · the bare pointer on \${bare} pill(s) · \${first.pills.filter((x) => x.pointer).length} pointer pill(s) of \${first.pills.length}\${tried.length > 1 ? \` · tried \${tried.join(" | ")}\` : ""}\`);
  // F4 the pill pressed: a ruling
  await page.evaluate(pressPill, pointerPill(first, found.e)); await page.waitForTimeout(700);
  const ruled = await page.evaluate(cardNow, found);
  const stands = ruled.pills[pointerPill(ruled, found.e)] || null;
  check("F4  that pill pressed, the line under the word prints the same, and the Hebrew is the Hebrew",
    ruled.line === want && !!stands && stands.pressed && sameHe(ruled.he, found.surface),
    \`line "\${ruled.line}" · wanted "\${want}" · the pill \${stands && stands.pressed ? "pressed" : "not pressed"} · Hebrew \${sameHe(ruled.he, found.surface) ? "unmoved" : \`"\${ruled.he}" vs "\${found.surface}"\`}\`);
  // F5 another ruling, and back
  const other = ruled.pills.findIndex((x) => !x.pressed && !x.pointer);
  let f5 = null;
  if (other >= 0) {
    await page.evaluate(pressPill, other); await page.waitForTimeout(700);
    const moved = await page.evaluate(cardNow, found);
    const back = pointerPill(moved, found.e);
    if (back >= 0) { await page.evaluate(pressPill, back); await page.waitForTimeout(700); }
    const restored = await page.evaluate(cardNow, found);
    f5 = { other: ruled.pills[other].t, moved: moved.line, back: back >= 0, restored: restored.line, he0: ruled.he, he1: restored.he };
  }
  check("F5  another pill pressed moves the line to it; the pointer pill pressed again puts the resolution back; the Hebrew never moved",
    !!f5 && f5.moved !== want && f5.moved.includes(noDot(f5.other).split(" + ")[0].slice(0, 12)) && f5.back && f5.restored === want && f5.he0 === f5.he1,
    f5 ? \`"\${f5.other}" -> line "\${f5.moved}" · back -> "\${f5.restored}" · Hebrew \${f5.he0 === f5.he1 ? "unmoved" : "MOVED"}\` : "the card offers no other plain pill to press");
  await page.context().close();
}
`]]);
