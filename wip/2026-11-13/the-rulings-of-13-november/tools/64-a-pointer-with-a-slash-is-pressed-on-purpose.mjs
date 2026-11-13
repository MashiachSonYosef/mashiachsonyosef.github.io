// check-form-of-v1 presses one word's pointer and holds what its pill and its line say (F3 to F5). On 13 November
// that found a page fault: a pointer whose text holds a "/" resolved on its pill and stood bare on the line once the
// pill was pressed. It found it because the first word it came to happened to carry such a pointer. A fault is not
// held by luck: the check now finds a second word on purpose, one whose pointer's text holds a "/", presses it the
// same way and holds the same three things as its law F8. The pressing is one function, used for both words.
// node 64-a-pointer-with-a-slash-is-pressed-on-purpose.mjs <reader dir>
import { join } from "node:path";
import { edit, span } from "./lib.mjs";
const R = process.argv[2];
const F = join(R, "tools", "check-form-of-v1.mjs");

edit(F, [
  [`//   F7  on the page, with every switch lifted: a reading the lane classes as
//       having English of its own beside its pointer stands on a pill as its
//       own words, and that pill carries no pointer
`,
   `//   F7  on the page, with every switch lifted: a reading the lane classes as
//       having English of its own beside its pointer stands on a pill as its
//       own words, and that pill carries no pointer
//   F8  a pointer whose text holds a "/" (the source's own, which prints
//       " + "): F3 to F5 hold for it too. The page once found a pointer's
//       entry by its text as written on the pill and as printed on the
//       line, so such a pointer resolved on its pill and stood bare on the
//       line once pressed. A word carrying one is found on purpose and
//       pressed, where any is served
`],
]);

span(F, [
  [`const candidates = [];
const MAX = 12;
`,
   `check("F0  served zones hold plain words`,
   `// two lists, so both kinds are pressed on purpose: the words whose pointer's text holds no "/", and those whose
// pointer's text holds one (law F8)
const plainOnes = [], slashed = [];
const MAX = 12, MAX_SLASHED = 6;
{
  const seen = new Set();
  const full = () => plainOnes.length >= MAX && slashed.length >= MAX_SLASHED;
  for (const u of urls) {
    if (full()) break;
    const id = zoneIdOf(u); const path = \`data/zones/\${id}.bin\`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (full()) break;
      // one region its place does not divide, so the card opens on its whole form; in no span, joined to no word
      const l = w.k && !w.w && !seen.has(w.k) ? rec.keys[w.k] : null;
      if (!l || (z.spans && z.spans[w.k]) || /\\u05BE/u.test(w.s || "") || (ei > 0 && /\\u05BE$/u.test(sec.words[ei - 1].s || "")) || (Array.isArray(w.pg) && w.pg.length > 1)) continue;
      seen.add(w.k);
      const rows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
      const carried = (x) => x.resolved && store.carriersOf(rows, x.t).some((r) => String(r[3]) === x.m);
      const here = { url: base ? \`\${base}/zone.html?b=\${id}\` : u, id, label: sec.label, section: si, entry: ei, key: w.k, surface: w.s };
      const plain = plainOnes.length < MAX ? l.find((x) => !x.t.includes("/") && carried(x)) : null;
      const slash = slashed.length < MAX_SLASHED ? l.find((x) => x.t.includes("/") && carried(x)) : null;
      if (plain) plainOnes.push({ ...here, e: plain });
      if (slash) slashed.push({ ...here, e: slash });
    }
  }
}
// F3 to F5 are witnessed on a pointer with no "/" where one is served
const candidates = plainOnes.length ? plainOnes : slashed;
`],
  [`let found = null, map = null, first = null, page = null;
`,
   `// F7 a reading with English of its own prints its own words.`,
   `// One word's pointer, pressed as a reader presses it. The first word of the list whose card carries the pointer on
// a pill is taken, and everything the laws ask is read from it: the pill as the card opens (F3), the line once the
// pill is pressed (F4), and the line after another pill is pressed and the pointer's pressed again (F5).
let map = null;
const pressed = async (list) => {
  const tried = [];
  for (const c of list) {
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
    const first = fault ? null : await q.evaluate(cardNow, c);
    const at = first ? pointerPill(first, c.e) : -1;
    tried.push(\`\${c.id} \${c.label}, entry \${c.entry} (\${c.key}): \${fault || (at < 0 ? "no pill carries the pointer" : "its pill stands")}\`);
    if (at < 0) { await ctx.close(); continue; }
    const want = says(c.e);
    const pill = first.pills[at];
    const bare = first.pills.filter((x) => printedForm(x.t) === printedForm(c.e.t)).length;
    // the pill pressed: a ruling
    await q.evaluate(pressPill, at); await q.waitForTimeout(700);
    const ruled = await q.evaluate(cardNow, c);
    const stands = ruled.pills[pointerPill(ruled, c.e)] || null;
    // another ruling, and back
    const other = ruled.pills.findIndex((x) => !x.pressed && !x.pointer);
    let f5 = null;
    if (other >= 0) {
      await q.evaluate(pressPill, other); await q.waitForTimeout(700);
      const moved = await q.evaluate(cardNow, c);
      const back = pointerPill(moved, c.e);
      if (back >= 0) { await q.evaluate(pressPill, back); await q.waitForTimeout(700); }
      const restored = await q.evaluate(cardNow, c);
      f5 = { other: ruled.pills[other].t, moved: moved.line, back: back >= 0, restored: restored.line, he0: ruled.he, he1: restored.he };
    }
    await ctx.close();
    return { found: c, tried, want, first, pill, bare, ruled, stands, f5 };
  }
  return { found: null, tried };
};
// what the three laws ask of a pressed word
const f3Holds = (x) => x.pill.t === x.want && x.bare === 0;
const f4Holds = (x) => x.ruled.line === x.want && !!x.stands && x.stands.pressed && sameHe(x.ruled.he, x.found.surface);
const f5Holds = (x) => !!x.f5 && x.f5.moved !== x.want && x.f5.moved.includes(noDot(x.f5.other).split(" + ")[0].slice(0, 12)) && x.f5.back && x.f5.restored === x.want && x.f5.he0 === x.f5.he1;
const one = await pressed(candidates);
check("F2  the page loads the map after its first paint and says so", !!map && map !== "never" && map.keys === Object.keys(rec.keys).length && map.pills === rec.counts.pills && map.resolved === rec.counts.resolved,
  JSON.stringify(map));
if (!one.found) check("F3  the pointer's pill prints the resolved reading and carries the pointer's own text", false, \`no card of \${candidates.length} pressed carried its pointer on a pill: \${one.tried.join(" | ")}\`);
else {
  const { found, want, first, pill, bare, ruled, stands, f5, tried } = one;
  check("F3  with every switch lifted the pointer's pill prints the resolved reading with the relation and target in parentheses and carries the pointer's own text; the pointer's bare text stands on no pill",
    f3Holds(one),
    \`\${found.id} \${found.label}, entry \${found.entry} (\${found.key}): pill "\${pill.t}" · wanted "\${want}" · data-pointer "\${pill.pointer}" · the bare pointer on \${bare} pill(s) · \${first.pills.filter((x) => x.pointer).length} pointer pill(s) of \${first.pills.length}\${tried.length > 1 ? \` · tried \${tried.join(" | ")}\` : ""}\`);
  check("F4  that pill pressed, the line under the word prints the same, and the Hebrew is the Hebrew",
    f4Holds(one),
    \`line "\${ruled.line}" · wanted "\${want}" · the pill \${stands && stands.pressed ? "pressed" : "not pressed"} · Hebrew \${sameHe(ruled.he, found.surface) ? "unmoved" : \`"\${ruled.he}" vs "\${found.surface}"\`}\`);
  check("F5  another pill pressed moves the line to it; the pointer pill pressed again puts the resolution back; the Hebrew never moved",
    f5Holds(one),
    f5 ? \`"\${f5.other}" -> line "\${f5.moved}" · back -> "\${f5.restored}" · Hebrew \${f5.he0 === f5.he1 ? "unmoved" : "MOVED"}\` : "the card offers no other plain pill to press");
}
// F8 the same on a pointer whose text holds a "/"
{
  const slashedInRecord = resolved.filter((e) => e.t.includes("/")).length;
  const held = candidates === slashed ? one : slashed.length ? await pressed(slashed) : null;
  const where = held && held.found ? \`\${held.found.id} \${held.found.label}, entry \${held.found.entry} (\${held.found.key})\` : "";
  check("F8  a pointer whose text holds a \\"/\\": its pill prints the resolution, the line prints the same once it is pressed, and pressed again after another it is put back",
    slashed.length === 0 || (!!held && !!held.found && f3Holds(held) && f4Holds(held) && f5Holds(held)),
    slashed.length === 0 ? \`no served plain word carries one on a row of its own source (\${slashedInRecord} of the record's \${resolved.length} resolved pointers hold a "/"), so there is nothing to press\`
      : !held.found ? \`no card of \${slashed.length} pressed carried its pointer on a pill: \${held.tried.join(" | ")}\`
        : \`\${where}\${held === one ? ", the word of F3 to F5" : ""}: pointer "\${held.found.e.t}" · pill "\${held.pill.t}" · pressed, line "\${held.ruled.line}" · wanted "\${held.want}"\${held.f5 ? \` · after "\${held.f5.other}" and back: "\${held.f5.restored}"\` : " · the card offers no other plain pill to press"} · \${slashed.length} such word(s) found, \${slashedInRecord} of the record's \${resolved.length} resolved pointers hold a "/"\`);
}
`],
]);

edit(F, [
  [`candidates.length ? \`\${candidates.length} word(s) in \${new Set(candidates.map((c) => c.id)).size} zone(s); first`,
   `candidates.length ? \`\${candidates.length} word(s) in \${new Set(candidates.map((c) => c.id)).size} zone(s), and \${slashed.length} whose pointer's text holds a "/"; first`],
]);
