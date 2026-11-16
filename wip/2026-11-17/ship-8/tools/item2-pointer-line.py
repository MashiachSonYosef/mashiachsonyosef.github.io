# Ship 8 item 2 (task 137, the Bible half): a pointer leads no line. Applied to S/s8/reader after item 1's round.
import sys
R = sys.argv[1]
def edit(p, pairs):
    s = open(p, encoding='utf8').read()
    for old, new, cnt in pairs:
        n = s.count(old)
        assert n == cnt, (p, old[:90], n)
        s = s.replace(old, new)
    open(p, 'w', encoding='utf8').write(s)
# 1. the page: the pointing's leader prints a pointer's resolution, as its pill does
edit(R + '/zone.html', [
('''        const l = here.l;
        if (l && !allOff(l[4])) return { text: l[0], rs: [{ posture: l[2], m: l[1], y: l[3], ya: "wording", by: l[4] }], why: "masorah" };
        const la = here.la;
        if (la && !allOff(la[4])) return { text: la[0], rs: [{ posture: la[2], m: la[1], y: la[3], ya: "wording", by: la[4] }], why: "masorah" };''',
'''        // A POINTER LEADS NO LINE (pointer-line-rule-v1-a-pointer-that-would-lead-a-line-prints-the-resolution-its-pill-prints;
        // task 137; the owner's card 1 of 16 November 2026: «a reading like
        // «feminine of …» never leads a line»; span-line-rule-v1 holds it for
        // joined readings). Where the pointing's leader is a pointer the
        // lane's map resolves («defective spelling of אליו» at Ezekiel 9:4,
        // 40:34 and 40:36 and 1 Samuel 22:13), the line prints what its pill
        // prints, the resolution with the pointer beside it, credited to the
        // pointer's own source (formOfText, as a ruled line does). Until the
        // map is here, and where it resolves nothing, the pointer's own words
        // stand: the map holds the thirty-nine books' keys and none of the
        // Tikkunei Zohar's, whose lines wait on the corpus lane.
        const l = here.l, nameHeld = !isNamePlace(word);
        if (l && !allOff(l[4])) return { text: formOfText(word.k, l[0], nameHeld), rs: [{ posture: l[2], m: l[1], y: l[3], ya: "wording", by: l[4] }], why: "masorah" };
        const la = here.la;
        if (la && !allOff(la[4])) return { text: formOfText(word.k, la[0], nameHeld), rs: [{ posture: la[2], m: la[1], y: la[3], ya: "wording", by: la[4] }], why: "masorah" };''', 1),
# the map's arrival said even where it fails, so a reader of the lines can wait on it
('''return FORM_OF; }).catch(() => null);''', '''return FORM_OF; }).catch(() => { window.__formOf = null; return null; });''', 1),
])
# 2. the line recorder waits on the map, as it waits on the lattice
edit(R + '/tools/resting-lines-v1.mjs', [
('''  const range = [from, Number.isFinite(to) ? Math.min(to, total) : total, seen];''',
'''  // the pointer map (pointer-line-rule-v1): a line a pointer the map resolves would lead prints the resolution once
  // the map is here, so the lines are read once it is, or said not to be (window.__formOf: the map's counts, or null)
  {
    const t0 = Date.now();
    let landed = false;
    while (Date.now() - t0 < 30000) { landed = await p.evaluate(() => window.__formOf !== undefined); if (landed) break; await p.waitForTimeout(100); }
    if (!landed) throw new Error("the pointer map did not arrive: a line a pointer leads would be read before its resolution prints");
  }
  const range = [from, Number.isFinite(to) ? Math.min(to, total) : total, seen];''', 1),
])
# 3. the law: no resting line prints a pointer's own words where the map resolves it
edit(R + '/tools/check-form-of-v1.mjs', [
('''// GUARDS: form-of-pills-rule-v3''', '''// GUARDS: pointer-line-rule-v1-a-pointer-that-would-lead-a-line-prints-the-resolution-its-pill-prints
// GUARDS: form-of-pills-rule-v3''', 1),
('''if (!rec) { console.log("\\nFAIL"); process.exit(1); }''', '''if (!rec) { console.log("\\nFAIL"); process.exit(1); }
// F15 a pointer leads no line (pointer-line-rule-v1, task 137): no resting line of a book the map covers prints a
// pointer's own words where the map resolves it, at a word whose key the map holds; a resolution that is a name stands
// aside at a place that is not one (formOfResolves), so such a pointer is not asked. The lines are the recordings the
// round reads off the page (data/resting-lines/), the words the zones' own.
{
  const { readdirSync } = await import("node:fs");
  const plain = (t) => String(t).trim().replace(/\\.$/u, "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
  const faults = [];
  let lines = 0, books = 0;
  for (const f of readdirSync("data/resting-lines").filter((x) => x.endsWith(".json.gz")).sort()) {
    const book = f.replace(/\\.json\\.gz$/u, "");
    if (!existsSync(`data/zones/${book}.bin`)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.bin`)).toString("utf8"));
    const rl = JSON.parse(gunzipSync(readFileSync(`data/resting-lines/${f}`)).toString("utf8"));
    const secs = new Map((z.sections || []).map((s) => [s.label, s.words || []]));
    books += 1;
    for (const [label, entries] of rl.sections || []) {
      const words = secs.get(label) || [];
      for (const [i, , text] of entries) {
        const w = words[i];
        if (!w || !w.k || !rec.keys[w.k]) continue;
        lines += 1;
        const e = rec.keys[w.k].find((x) => x.resolved && !x.resolved.name && plain(x.t) === plain(text));
        if (e) faults.push(`${book} ${label} word ${i + 1}: «${text}» (${e.m}), which the map resolves to «${e.resolved.text}»`);
      }
    }
  }
  check("F15 a pointer leads no line: no resting line prints a pointer's own words where the map resolves it", books > 0 && lines > 0 && faults.length === 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 4).join(" · ")}` : `${lines.toLocaleString("en-US")} resting lines at keys the map holds, in ${books} books`);
}''', 1),
])
print("item 2 applied")
