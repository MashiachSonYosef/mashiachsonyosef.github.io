// The page changes of the fifth, sixth and seventh cuts, for reader/place.html, as exact edits: each `old` stands in the
// page exactly once (as of md5 a5e0efe62a2c3edb5ae6cc3497bc5ab4) and is replaced by `new`, in this order. It supersedes
// cut6-page-proposed.mjs and the fifth cut's cut5-page-proposed.mjs. Builder H2 applies EDITS; this file's harness
// applies them to a copy in memory and runs the patched page script in node with stand-ins for the browser.
// Run: node page-changes-cuts-5-6-7.mjs <reader/place.html> <page data dir> <book> <chapter:verse> <entry> [record to open]
export const EDITS = [
 {
  "what": "drawHere: the unabridged BDB's lines (sixth and seventh cuts: the stem with the point; a label naming another stem; a line BDB's quote does not give to one word)",
  "old": "  if (h.b) {\n    const row = el(\"div\", \"row\", srcHead(\"unabridged_bdb_1906\", \"cites this verse\"));\n    for (const b of h.b) row.append(el(\"p\", \"line\", he(b[7]), \" \", el(\"span\", \"gap\", `${[b[4], b[5]].filter(Boolean).join(\" \") || \"the opening\"} `), b[6].length ? rd(b[6].map((d) => `«${tidy(d)}»`).join(\", \")) : \"\"));\n    const many = Math.max(...h.b.map((b) => b[8]));\n    if (many > 1) row.append(el(\"p\", \"sub\", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));\n    body.append(row);\n  }",
  "new": "  drawUnabridgedHere(h, body);"
 },
 {
  "what": "new functions before unabridgedFirst (sixth and seventh cuts)",
  "old": "/** One line for a record of the unabridged BDB, from the head a tag's file holds of it. */",
  "new": "/** Where an unabridged line stands in its record, from the line's stem fields (b[10] the stem as the record names it, b[12]\n *  1 in the stem's own head, b[13] 1 where the point's label names another stem): the stem with its point, or the stem's\n *  own head before its numbered senses. */\nfunction unabridgedWhere(b) {\n  const label = [b[4], b[5]].filter(Boolean).join(\" \");\n  if (b[12]) return `${b[10]}, before its numbered senses`;\n  if (!b[10]) return label || \"the opening\";\n  if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;\n  return label.startsWith(b[10]) ? label : `${b[10]} ${label || \"(its opening)\"}`;\n}\n/** The unabridged BDB's «cites this verse» lines at one form. A line BDB's quoted form does not give to one of the words\n *  that carry the number (b[14]: how many words of the verse carry it) is marked, and the card says so once. */\nfunction drawUnabridgedHere(h, body) {\n  if (!h.b) return;\n  const row = el(\"div\", \"row\", srcHead(\"unabridged_bdb_1906\", \"cites this verse\"));\n  for (const b of h.b) row.append(el(\"p\", \"line\", he(b[7]), \" \", el(\"span\", \"gap\", `${unabridgedWhere(b)} `), b[6].length ? rd(b[6].map((d) => `«${tidy(d)}»`).join(\", \")) : \"\", b[14] ? el(\"span\", \"gap\", \" †\") : \"\"));\n  const many = Math.max(...h.b.map((b) => b[8]));\n  if (many > 1) row.append(el(\"p\", \"sub\", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));\n  if (h.b.some((b) => b[13])) row.append(el(\"p\", \"sub\", \"Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under.\"));\n  const times = Math.max(0, ...h.b.map((b) => b[14] || 0));\n  if (times) row.append(el(\"p\", \"sub\", `† BDB cites this verse; this number stands ${times} times in it, and BDB does not say which word it means.`));\n  body.append(row);\n}\n/** At a word written one way and read another, the unabridged lines that stand under both forms, said once. */\nfunction pairSentence(e, here) {\n  if (e.k !== 1 || e.f.length !== 2) return;\n  const key = (b) => b.slice(0, 13).join(\"|\"); const first = new Set(((e.f[0].h || {}).b || []).map(key));\n  const both = ((e.f[1].h || {}).b || []).filter((b) => first.has(key(b))).length;\n  if (both) here.append(el(\"p\", \"form-h\", `${both === 1 ? \"One line\" : `${both} lines`} of the unabridged Brown-Driver-Briggs stand${both === 1 ? \"s\" : \"\"} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`));\n}\n/** What the card says of the records a number stands on: how many are this word's, and how many are set behind for their language. */\nfunction unabridgedSays(ids0, first, other, tongue, said, citesFirst) {\n  const set = ids0.filter((id) => other.has(id)).length;\n  const lang = set ? ` ${set === 1 ? \"One is a\" : `${set} are`} Biblical ${tongue[1]} record${set === 1 ? \"\" : \"s\"}; ${said} this word is ${tongue[0]}.` : \"\";\n  const head = `This number stands on ${ids0.length} records of this file.`;\n  if (first.length === 1) return `${head}${lang} One has this word's own headword${set ? \" in its language\" : \"\"}.`;\n  if (first.length) return `${head}${lang} ${first.length} of them have this word's own headword${set ? \" in its language\" : \"\"}, and nothing in the files says which is meant.${citesFirst ? \" The record that cites this verse stands first.\" : \"\"}`;\n  return `${head}${lang} None has this word's own headword${set ? \" in its language\" : \"\"}.`;\n}\n/** One line for a record of the unabridged BDB, from the head a tag's file holds of it. */"
 },
 {
  "what": "openCard: a line under both forms of a pair, said once (sixth cut)",
  "old": "  if (!drawn) here.append(el(\"p\", \"form-h\", \"No source gives a reading at this word.\"));",
  "new": "  pairSentence(e, here);\n  if (!drawn) here.append(el(\"p\", \"form-h\", \"No source gives a reading at this word.\"));"
 },
 {
  "what": "drawEntries: a stem's head is a unit of its own (sixth cut)",
  "old": "    for (const b of h.b || []) { if (!citedB.has(b[0])) citedB.set(b[0], new Set()); citedB.get(b[0]).add(`${b[1]}|${b[2]}|${b[3]}`); }",
  "new": "    for (const b of h.b || []) { if (!citedB.has(b[0])) citedB.set(b[0], new Set()); citedB.get(b[0]).add(b[12] ? `${b[1]}|s${b[11]}` : `${b[1]}|${b[2]}|${b[3]}`); }"
 },
 {
  "what": "drawEntries: the unabridged records by headword, the word's language and BDB's numeral (fifth, sixth, seventh cuts)",
  "old": "    if (isB) {\n      // The unabridged file lists a number on several records, and a record can be another word's. A record is this\n      // word's where its own headword has the letters of the word's dictionary form (the data names them: own, and\n      // on the word, ow). Those stand; the others wait behind one line.\n      const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))]);\n      if (several) {\n        behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id));\n        row.append(el(\"p\", \"sub\", ids.length === 1 ? `This number stands on ${ids0.length} records of this file. One has this word's own headword.` : ids.length ? `This number stands on ${ids0.length} records of this file. ${ids.length} of them have this word's own headword, and nothing in the files says which is meant.${ids.some(cites) ? \" The record that cites this verse stands first.\" : \"\"}` : `This number stands on ${ids0.length} records of this file. None has this word's own headword.`));\n      } else if (!own.has(ids0[0])) row.append(el(\"p\", \"sub\", \"This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word.\"));\n",
  "new": "    let numeralOther = new Set(), numeralHere = null;\n    if (isB) {\n      // The unabridged file lists a number on several records, and a record can be another word's. A record is this word's\n      // where its own headword has the letters of the word's dictionary form (own; on the word, ow), where it is of the\n      // word's language (the forms name the records of the other: ol; the word's language is what STEP's row at this word\n      // says, t.lg, else what STEP's lexicon says, lg), and where BDB does not number it as another word of the same\n      // letters (on; the entry's numeral: nm). Those stand; the others wait behind one line.\n      const other = new Set(forms.flatMap((f) => f.ol || []).filter((id) => ids0.includes(id)));\n      const rowLg = forms.map((f) => (f.t || {}).lg).find(Boolean); const lg = rowLg || line.lg || null;\n      const said = rowLg ? \"STEP's row at this word says\" : \"STEP's lexicon says\"; const tongue = lg === \"a\" ? [\"Aramaic\", \"Hebrew\"] : [\"Hebrew\", \"Aramaic\"];\n      numeralOther = new Set((line.on || []).filter((id) => ids0.includes(id) && !other.has(id))); numeralHere = line.nm || null;\n      const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))].filter((id) => !other.has(id) && !numeralOther.has(id)));\n      if (several) {\n        behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id));\n        const n = numeralOther.size;\n        row.append(el(\"p\", \"sub\", unabridgedSays(ids0, ids, other, tongue, said, ids.some(cites)) + (n ? ` ${n === 1 ? \"One\" : n} BDB numbers as another word of the same letters, and ${n === 1 ? \"it waits\" : \"they wait\"} behind.` : \"\")));\n      } else if (other.has(ids0[0])) row.append(el(\"p\", \"sub\", `This record is a Biblical ${tongue[1]} record, and ${said} this word is ${tongue[0]}, so it is not said to cite this word.`));\n      else if (numeralOther.has(ids0[0])) row.append(el(\"p\", \"sub\", \"BDB numbers this record another word of the same letters, so it is not said to cite this word.\"));\n      else if (!own.has(ids0[0])) row.append(el(\"p\", \"sub\", \"This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word.\"));\n"
 },
 {
  "what": "drawEntries' drawRecords: BDB's numeral said on a record of another (seventh cut)",
  "old": "        if (cites(id)) first.append(el(\"span\", \"cited-note\", isU ? (cited.very.size ? \"cites this very word\" : \"cites this verse\") : \"cites this verse\"));",
  "new": "        if (cites(id)) first.append(el(\"span\", \"cited-note\", isU ? (cited.very.size ? \"cites this very word\" : \"cites this verse\") : \"cites this verse\"));\n        if (isB && numeralOther.has(id)) holder.append(el(\"p\", \"sub\", `BDB numbers this another word of the same letters (${[numeralHere, F.unabridged[id].head.numeral].filter(Boolean).map((x) => `${x}.`).join(\", \")})`));"
 },
 {
  "what": "unabridgedWhole: the stem's head as a unit (sixth cut)",
  "old": "    let unit = el(\"div\", \"unit\"); if (cited.has(`${bi}|-1|-1`)) { unit.classList.add(\"cited\"); unit.append(el(\"span\", \"cited-note\", \"cites this verse\")); }",
  "new": "    // a stem heading inside running text starts a unit of its own (the stem's head); a heading that labels a point makes that point the stem's head too\n    const also = new Map(); (blk.stems || []).forEach((h, x) => { if (h.point === undefined) starts.set(h.k, [\"stem\", `${bi}|s${x}`]); else also.set(`${bi}|${h.point}|-1`, `${bi}|s${x}`); });\n    const isCited = (key) => cited.has(key) || (also.has(key) && cited.has(also.get(key)));\n    let unit = el(\"div\", \"unit\"); if (isCited(`${bi}|-1|-1`)) { unit.classList.add(\"cited\"); unit.append(el(\"span\", \"cited-note\", \"cites this verse\")); }"
 },
 {
  "what": "unabridgedWhole: a stem's head unit drawn in its paragraph's flow (sixth cut)",
  "old": "      if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el(\"div\", `unit ${cls}`); if (cited.has(key)) {",
  "new": "      if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el(cls === \"stem\" ? \"span\" : \"div\", `unit ${cls}`); if (isCited(key)) {"
 },
 {
  "what": "CSS: a stem's head unit stays in its paragraph's flow (sixth cut)",
  "old": "  .unit { margin: 0.25rem 0; }",
  "new": "  .unit { margin: 0.25rem 0; } .unit.stem { display: inline; margin: 0; }"
 }
];

// ---------------------------------------------------------------- the harness (not for the page)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
if (process.argv[1] && process.argv[1].endsWith("page-changes-cuts-5-6-7.mjs") && process.argv[2]) {
  const [PAGE_HTML, DATA_DIR, BOOK, VERSE, ENTRY, OPEN] = process.argv.slice(2);
  let html = readFileSync(PAGE_HTML, "utf8");
  for (const e of EDITS) { const n = html.split(e.old).length - 1; if (n !== 1) { console.error(`the edit «${e.what}» finds its text ${n} times`); process.exit(1); } html = html.replace(e.old, () => e.new); }
  console.log(`${EDITS.length} edits applied to a copy of the page`);
  const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  // a stand-in for the browser: elements as a small tree, fetch from the page data on disk
  class Node { constructor(tag) { this.tag = tag; this.kids = []; this.className = ""; this.dataset = {}; this.hidden = false; this.on = {}; this.attrs = {}; const self = this; this.classList = { add: (c) => { self.className += ` ${c}`; }, remove() {}, contains: (c) => self.className.split(" ").includes(c) }; }
    append(...k) { for (const x of k) if (x !== null && x !== undefined && x !== "") this.kids.push(x); } replaceChildren(...k) { this.kids = []; this.append(...k); } remove() {}
    setAttribute(k, v) { this.attrs[k] = v; } addEventListener(ev, f) { this.on[ev] = f; } get childElementCount() { return this.kids.filter((x) => typeof x !== "string").length; }
    set textContent(v) { this.kids = [String(v)]; } get textContent() { return this.kids.map((x) => (typeof x === "string" ? x : x.textContent)).join(""); } querySelectorAll() { return []; } getBoundingClientRect() { return { top: 0, bottom: 0, height: 0 }; } }
  const document = { createElement: (t) => new Node(t), getElementById: () => new Node("div"), addEventListener() {}, body: new Node("body"), querySelectorAll: () => [] };
  const fetchLocal = async (url) => { const rel = decodeURIComponent(String(url)).replace(/^data\/place-answers-v1\/page\//, ""); try { const buf = readFileSync(join(DATA_DIR, rel)); return new Response(buf); } catch { return new Response("", { status: 404 }); } };
  const ctx = vm.createContext({ document, window: { innerHeight: 800, scrollBy() {}, addEventListener() {} }, location: { search: "" }, URLSearchParams, fetch: fetchLocal, Response, DecompressionStream, performance: { now: () => 0 }, console, setTimeout, Promise, Map, Set, JSON, Math, String, Number, Object, Array, RegExp, Error });
  vm.runInContext(script.replace(/\n\(async \(\) => \{[\s\S]*$/, "\n") + `\n;globalThis.__api = { drawHere, pairSentence, drawEntries, state, setIndex: (x) => { INDEX = x; } };`, ctx);
  const api = ctx.__api; const gz = async (rel) => new Response((await fetchLocal(rel)).body.pipeThrough(new DecompressionStream("gzip"))).json();
  api.setIndex(JSON.parse(readFileSync(join(DATA_DIR, "index.json"), "utf8")));
  const doc = await gz(`${BOOK}/${VERSE.split(":")[0]}.json.gz`); const v = doc.verses.find((x) => x.l === VERSE); const e = v.e.find((x) => x.i === Number(ENTRY));
  const text = (n, depth = 0) => (typeof n === "string" ? n : n.hidden && !process.env.SHOW_HIDDEN ? "" : n.kids.map((k) => text(k, depth + 1)).join("") + (["p", "div", "li", "h3"].includes(n.tag) ? "\n" : ""));
  const body = new Node("div"); const here = new Node("div"); body.append(here);
  for (const f of e.f) { if (e.f.length > 1) here.append(Object.assign(new Node("p"), { kids: [f.r === 2 ? "The form written: " : "The form read: ", f.s] })); api.drawHere(f, here); }
  api.pairSentence(e, here);
  const tags = []; for (const f of e.f) for (const p of (f.t || {}).p || []) if (p[1] && !/^H9\d\d\d$/.test(p[1]) && !tags.includes(p[1])) tags.push(p[1]);
  const token = { wb: new Node("span") }; api.state.open = token;
  const boxes = []; for (const tag of tags) { const b = new Node("div"); boxes.push(b); await api.drawEntries(tag, e.f, b, token); }
  // open one record whole, by pressing its button
  if (OPEN) { const press = async (n) => { if (typeof n === "string") return; if (n.dataset && n.dataset.id === OPEN && n.on.click) { await n.on.click(); await new Promise((r) => setTimeout(r, 50)); } for (const k of n.kids) await press(k); }; for (const b of boxes) await press(b); }
  console.log(`== ${BOOK} ${VERSE} entry ${ENTRY} ${e.s}\n-- At this word:\n${text(here).replace(/\n+/g, "\n")}`);
  for (const b of boxes) console.log(`-- ${text(b).replace(/\n+/g, "\n")}`);
  if (OPEN) { const marked = []; const walk = (n) => { if (typeof n === "string") return; if (n.className.includes("cited")) marked.push(text(n).replace(/\s+/g, " ").slice(0, 150)); n.kids.forEach(walk); }; boxes.forEach(walk); console.log(`-- ${OPEN} opened whole; the units marked «cites this verse»:\n   ${marked.join("\n   ")}`); }
}
