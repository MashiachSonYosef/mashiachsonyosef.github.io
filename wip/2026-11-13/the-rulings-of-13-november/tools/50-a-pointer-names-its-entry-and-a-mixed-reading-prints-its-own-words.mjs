// The map of pointer readings is the corpus lane's reissue (relay v175) under the owner's rulings of 13 November
// 2026 (5: a reading with English of its own prints its own words whole; 7: a pointer that cannot tell its entries
// apart takes the source's own first entry). The map is baked by tools/bake-form-of-pills-v1.mjs from the lane's
// file, now kept in the tree. The page's rule does not change: a pill the map resolves prints the English with the
// pointer beside it, and any other pill prints as itself. Its words are made true to the new map, and the check
// gets the laws the rulings ask for:
//   F6  the record is the lane's pinned file under the pinned rulings, derived again in the check
//   F7  on the page, a reading with English of its own prints its own words and carries no pointer
// node 50-a-pointer-names-its-entry-and-a-mixed-reading-prints-its-own-words.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`  // HEBREW DEFINED BY HEBREW (the owner, on the card of a two-word number:
  // "the issue is defining hebrew with hebrew"; the corpus lane's answer,
  // span store v2.1, relay v85, folded by tools/bake-form-of-pills-v1.mjs
  // into data/form-of-pills-v1.json). A pill of the route catalog whose text
  // is a pointer to another entry in the source's own words ("singular
  // construct state form of ...") is classed by the lane, and for a pointer
  // the lane resolved the target: the target's first English under the same
  // source. The page prints the English with the pointer beside it, on the
  // pill and on the line, and never respells anything: the pill's own text
  // rides on it. The map is fetched once, after the first paint, and the
  // lines it touches are painted again when it is here. JUDGMENT and
  // USAGE_NOTE pointers wait on the owner's branch and are not in the map.
`,
   `  // HEBREW DEFINED BY HEBREW (the owner, on the card of a two-word number:
  // "the issue is defining hebrew with hebrew"; the corpus lane's map of
  // pointer readings, since 13 November 2026 its relay v175, folded by
  // tools/bake-form-of-pills-v1.mjs into data/form-of-pills-v1.json). A pill
  // of the route catalog whose whole text is a pointer to another entry in
  // the source's own words ("singular construct state form of ...") is
  // classed by the lane, and the lane names the entry the pointer points to
  // from the pointer's own bytes: its points, its romanization, a gloss it
  // quotes. Where the pointer cannot tell its entries apart the source's own
  // first entry is taken (the owner's ruling 7 of 13 November). The
  // resolution is that entry's first English in the source's own order,
  // where the store serves a row with it. The page prints the English with
  // the pointer beside it, on the pill and on the line, and never respells
  // anything: the pill's own text rides on it. A pill the map does not
  // resolve prints as itself, and so does a reading that has English of its
  // own beside its pointer, whole (the owner's ruling 5): the map does not
  // hold those. The map is fetched once, after the first paint, and the
  // lines it touches are painted again when it is here. JUDGMENT and
  // USAGE_NOTE pointers wait on the owner's branch and are not in the map.
`],
]);

edit(join(R, "tools", "check-form-of-v1.mjs"), [
  [`// A READING THAT POINTS AT ANOTHER WORD'S READING (the corpus lane's relay
// v85, form-of/zone-pills-v1.jsonl: a source's reading written as "singular
// construct state form of <Hebrew>" or "passive of <Hebrew>" points at a
// reading under the pointed word's key; the lane resolved 2,268 of 3,048
// such pointers to a row of the same source under the target key; baked by
// tools/bake-form-of-pills-v1.mjs into data/form-of-pills-v1.json). The
`,
   `// A READING THAT POINTS AT ANOTHER WORD'S READING (the corpus lane's map of
// pointer readings, since 13 November 2026 its relay v175, kept in
// data/pointer-entries/: a source's reading written as "singular construct
// state form of <Hebrew>" or "passive of <Hebrew>" points at an entry, which
// the lane names from the pointer's own bytes, and resolves to that entry's
// first English where the store serves a row with it; baked under the
// owner's rulings of that day by tools/bake-form-of-pills-v1.mjs into
// data/form-of-pills-v1.json). The
`],
  [`//   F5  a ruling: another pill pressed moves the line to that reading; the
//       pointer pill pressed again puts the resolved text back on the line,
//       and the Hebrew never moved
`,
   `//   F5  a ruling: another pill pressed moves the line to that reading; the
//       pointer pill pressed again puts the resolved text back on the line,
//       and the Hebrew never moved
//   F6  the record is the corpus lane's pinned file under the owner's pinned
//       rulings, derived again here: every pure pointer of the file and no
//       other reading; each resolved as the file resolves it, or by the
//       source's first entry where the pointer cannot tell its entries apart
//       and the ruling rests that branch so; none resolved to a text that is
//       itself a pure pointer; no reading with English of its own
//   F7  on the page, with every switch lifted: a reading the lane classes as
//       having English of its own beside its pointer stands on a pill as its
//       own words, and that pill carries no pointer
`],
  [`import { zoneUrls, zoneIdOf } from "./zones-on-disk-v1.mjs";
`,
   `import { zoneUrls, zoneIdOf } from "./zones-on-disk-v1.mjs";
import { readPinnedLines } from "./pinned-v1.mjs";
import { rulingsPinned } from "./rulings-v1.mjs";
import { openRouteStore, routePrinted, printedForm } from "./gloss-store-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";
`],
  [`const wellFormed = entries.every((e) => e.m && e.t && e.relation && e.target && (!e.resolved || (e.resolved.key && e.resolved.text)));`,
   `const wellFormed = entries.every((e) => e.m && e.t && e.class === "FORM_OF" && e.relation && e.target && (!e.resolved || (e.resolved.key && e.resolved.text)));`],
  [`if (!rec) { console.log("\\nFAIL"); process.exit(1); }
`,
   `if (!rec) { console.log("\\nFAIL"); process.exit(1); }

// F6 the record against the lane's own file and the owner's rulings, derived again
const PIN_DIR = "data/pointer-entries";
let lane = [];
{
  const faults = [];
  let several = null;
  try {
    const pin = JSON.parse(readFileSync(\`\${PIN_DIR}/PIN.json\`, "utf8"));
    lane = readPinnedLines(\`\${PIN_DIR}/\${pin.folder}/\${pin.map.file}\`, pin.map, \`\${pin.folder}/\${pin.map.file}\`);
    if ((rec.taken_from || {}).sha256 !== pin.map.sha256) faults.push("the record was not baked from the pinned map");
    const on = rulingsPinned().filter((r) => [r.file, ...(r.files || [])].some((f) => f && f.sha256 === pin.map.sha256));
    if (!on.some((r) => r.class === "MIXED" && typeof r.print === "string")) faults.push("no pinned ruling says what a reading with English of its own prints");
    several = (on.find((r) => r.branch === "several_branch") || {}).resting ?? null;
  } catch (e) { faults.push(e.message); }
  const id = (...parts) => parts.join("\\u0001");
  const pure = new Set(lane.filter((l) => l.class === "FORM_OF").map((l) => id(l.key, noDot(l.text))));
  const want = new Map();   // key, source, text -> the resolution the file gives it under the rulings, or null
  for (const l of lane) {
    if (l.class !== "FORM_OF") continue;
    const fo = l.form_of || {};
    let r = fo.resolved && fo.resolved.text ? fo.resolved : null;
    if (!r && several === "FIRST_IN_THE_SOURCES_ORDER") { const f = (fo.several_branch || {}).first_in_the_sources_order; r = f && f.resolved && f.resolved.text ? f.resolved : null; }
    if (r && pure.has(id(r.key, noDot(r.text)))) r = null;
    want.set(id(l.key, l.m_id, l.text), r ? id(r.key, r.text) : null);
  }
  const have = new Map();
  for (const [k, list] of Object.entries(rec.keys)) for (const e of list) have.set(id(k, e.m, e.t), e.resolved ? id(e.resolved.key, e.resolved.text) : null);
  const say = (x) => x.split("\\u0001").join(" · ").slice(0, 90);
  for (const [x, r] of want) { if (!have.has(x)) faults.push(\`a pure pointer of the lane's file is not in the record: \${say(x)}\`); else if (have.get(x) !== r) faults.push(\`the record resolves a pointer otherwise than the lane's file under the rulings: \${say(x)}\`); }
  for (const x of have.keys()) if (!want.has(x)) faults.push(\`the record carries a reading that is no pure pointer of the lane's file: \${say(x)}\`);
  const mixed = lane.filter((l) => l.class === "MIXED").length;
  check("F6  the record is the corpus lane's pinned file under the owner's pinned rulings, derived again: every pure pointer and no other reading, each resolved as the file and the rulings say",
    lane.length > 0 && faults.length === 0,
    faults.length ? \`\${faults.length} · \${faults.slice(0, 3).join(" · ")}\` : \`\${lane.length} lines of the lane's file · \${want.size} pure pointers, \${[...want.values()].filter(Boolean).length} resolved · the branch of several entries rests at \${several} · \${mixed} readings with English of their own are not in the record\`);
}
`],
  [`await b.close();
console.log(bad ? \`\\nFAIL \${bad}\` : "\\nall checks passed");`,
   `// F7 a reading with English of its own prints its own words. The words are found in the data: a served plain word
// whose key holds such a reading on a row its ledger leaves whole; its card is opened with every switch lifted
{
  const store = openRouteStore("data/route-store");
  const mixedOf = new Map();   // key -> its readings with English of their own, as the lane's file names them
  for (const l of lane) if (l.class === "MIXED") (mixedOf.get(l.key) || mixedOf.set(l.key, []).get(l.key)).push(l);
  const picks = [], seen = new Set();
  for (const u of urls) {
    if (picks.length >= 8) break;
    const zid = zoneIdOf(u), path = \`data/zones/\${zid}.bin\`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (picks.length >= 8 || !w.k || w.w || seen.has(w.k) || !mixedOf.has(w.k) || (z.spans && z.spans[w.k]) || /\\u05BE/u.test(w.s || "")) continue;
      const row = (store.routesFor(w.k) || []).find((r) => !Array.isArray(r[7]) && !Array.isArray(r[8]) && mixedOf.get(w.k).some((l) => l.m_id === String(r[3]) && l.text === String(r[1])));
      if (!row) continue;
      seen.add(w.k);
      picks.push({ url: base ? \`\${base}/zone.html?b=\${zid}\` : u, zone: zid, label: sec.label, section: si, entry: ei, key: w.k, m: String(row[3]), own: printedForm(routePrinted(row).trim()) });
    }
  }
  const faults = [], judged = [];
  for (const pick of picks) {
    const c2 = await b.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const q = await c2.newPage();
      await q.goto(pick.url, { waitUntil: "networkidle" });
      await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
      await q.reload({ waitUntil: "networkidle" });
      await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
      const got = await q.evaluate(async ({ section, entry, m, own }) => {
        const hud = document.getElementById("hud");
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const sec = document.querySelectorAll("section.seg")[section];
        const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
        if (!wb) return { fault: "the word is not on the page" };
        wb.scrollIntoView({ block: "center" });
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = Date.now();
        while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
        if (!settled()) return { fault: "the card's readings did not arrive" };
        await new Promise((r) => setTimeout(r, 600));
        const mine = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")].filter((x) => (x.dataset.by || "").split(/[\\s,]+/u).includes(m));
        const asItself = mine.find((x) => x.textContent === own);
        const over = mine.find((x) => (x.dataset.pointer || "") === own);
        return { pills: mine.length, asItself: !!asItself, pointerOnIt: asItself ? asItself.dataset.pointer || null : null, printedOver: over ? over.textContent : null };
      }, pick);
      const where = \`\${pick.zone} \${pick.label}, entry \${pick.entry} (\${pick.key}, \${pick.m})\`;
      if (got.fault) { faults.push(\`\${where}: \${got.fault}\`); continue; }
      if (got.printedOver !== null) faults.push(\`\${where}: «\${pick.own.slice(0, 50)}» is printed over as «\${String(got.printedOver).slice(0, 50)}»\`);
      if (!got.asItself) continue;   // the card opened on a division of the word, or the reading is grouped under another's wording
      if (got.pointerOnIt) faults.push(\`\${where}: the pill of «\${pick.own.slice(0, 50)}» carries a pointer\`);
      judged.push(where);
    } finally { await c2.close(); }
  }
  check("F7  a reading with English of its own beside its pointer stands on a pill as its own words, and carries no pointer", faults.length === 0 && judged.length > 0,
    faults.length ? \`\${faults.length} · \${faults.slice(0, 3).join(" · ")}\` : judged.length ? \`\${judged.length} of \${picks.length} cards pressed showed the reading: \${judged[0]}\` : \`none of \${picks.length} cards pressed showed such a reading on a pill of its own\`);
}
await b.close();
console.log(bad ? \`\\nFAIL \${bad}\` : "\\nall checks passed");`],
]);
