// The plain list under a chapter printed the zone's baked table, oldest witness first; since 6 November 2026 the
// reader above it draws the place's own reading, then the pointing's leader. An outside reader set the two side by
// side on 12 November. The door now prints the record of the lines the reader itself drew
// (tools/resting-lines-v1.mjs, tools/bake-resting-lines-v1.mjs) and refuses a record that is not of the tree it
// builds from. The rule is chapter-page-rule-v3; its name is changed wherever it stands.
// node 38-the-plain-list-is-the-readers-own-lines.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);
const V2 = "chapter-page-rule-v2";
const V3 = "chapter-page-rule-v3";

edit(T("build-front-door-v1.mjs"), [
  [`import { isSidecar, zonesSealed } from "./zones-on-disk-v1.mjs";
`,
   `import { isSidecar, zonesSealed } from "./zones-on-disk-v1.mjs";
import { readRecord, recordPath, whyNotOfThisTree, sha256Of, creditedIn } from "./resting-lines-v1.mjs";
`],
  [`// THE CHAPTER PAGES (${V2}). A search for "Amos 3:7" cannot`, `// THE CHAPTER PAGES (${V3}). A search for "Amos 3:7" cannot`],
  [`// the English readings the shelf prints for its words, each credited to its
// source and licence — in plain text a crawler reads before any script
// runs. The engine hides the porch once the text is drawn, because the same
// readings then stand under the words; on a page the book never reaches`,
   `// the lines the reader draws under its words as it first opens, each
// credited to its source and license — in plain text a crawler reads before
// any script runs. The engine hides the porch once the text is drawn,
// because the same lines then stand under the words; on a page the book never reaches`],
  [`// book page anymore" — so the porch moved into the book page itself.
const CHAPTER_PAGE_RULE = "${V2}-the-chapters-address-is-the-reader-opened-at-the-chapter-and-its-readings-stand-in-plain-text-credited-and-no-ink";`,
   `// book page anymore" — so the porch moved into the book page itself.
//
// V3 (12 November 2026): THE LIST IS THE READER'S OWN LINES. Under v2 the
// list was built here from the zone's baked table, oldest witness first,
// which was also what the reader drew until 6 November. That day the
// reader's resting line became the reading of the place's own source, then
// the pointing's leader, and the list went on printing the table: God was
// "judges" in the list and "God" on the line above it, and the list is the
// part a search engine reads. An outside reader set the two side by side on
// 12 November. The list is now a recording: tools/bake-resting-lines-v1.mjs
// opens the reader as a first visit does, reads the lines it drew and keeps
// them beside the zones (data/resting-lines/), and this door prints that
// record line by line. It refuses a record that names another page, or a
// file that has moved since the lines were read, so a list that is not the
// line cannot be built (resting-lines-rule-v1, tools/resting-lines-v1.mjs).
const CHAPTER_PAGE_RULE = "${V3}-the-chapters-address-is-the-reader-opened-at-the-chapter-and-the-lines-it-draws-stand-under-it-in-plain-text-credited-and-no-ink";`],
  [`with a porch under the text slot: every verse a heading, the readings the zone bakes for its words credited by source, hidden by the engine once the text is drawn;`,
   `with a porch under the text slot: every verse a heading, the lines the reader draws under its words as it first opens (read off the page and kept in data/resting-lines/) credited by source, hidden by the engine once the text is drawn;`],
  [`  // a word's pieces are joined the way the reader joins them (spanJoin in
  // zone.html, to the character): "and/ the/ man" prints as "and + the +
  // man", and a period closing a reading is not printed ("Israel." → Israel)
  const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\\.$/, "");
`,
   `  // the page this door is built from, and each file a record names, fingerprinted once for every book
  const PAGE_SHA = sha256Of(arg("reader", "zone.html"));
  const FILE_SHA = new Map();
`],
  [`    const gloss = z.gloss || {}, gm = z.gloss_m || {};
    // chapters in the order the sections come; a label with no colon is
    // its own chapter (one section on the page)
    const chapters = new Map();
    for (const sec of z.sections || []) {
      const label = String(sec.label || "");
      if (!label) continue;
      const ch = label.includes(":") ? label.split(":")[0] : label;
      if (!chapters.has(ch)) chapters.set(ch, []);
      chapters.get(ch).push(sec);
    }
`,
   `    // THE LINES THE READER DREW, AND ONLY IF THEY ARE THIS TREE'S. The record
    // names the page it was read off and every file that page asked for; a
    // record of another page, or over a file that has since moved, is a
    // recording of something else and is not printed.
    const lines = readRecord(recordPath(".", zi.slug));
    const stale = whyNotOfThisTree(".", lines, FILE_SHA);
    if (lines && lines.read_off && lines.read_off.files && lines.read_off.files["zone.html"] !== PAGE_SHA) stale.push("it was read off another zone.html than the one this door is built from");
    if (!stale.length && lines.sections.length !== (z.sections || []).length) stale.push(\`it holds \${lines.sections.length} sections and the zone \${(z.sections || []).length}\`);
    if (stale.length) throw new Error(\`\${zi.slug}: the resting lines kept for it are not the lines this tree draws (\${stale.slice(0, 3).join("; ")}\${stale.length > 3 ? \`; and \${stale.length - 3} more\` : ""}). Read them again with tools/bake-resting-lines-v1.mjs — refusing output\`);
    // chapters in the order the sections come; a label with no colon is
    // its own chapter (one section on the page)
    const chapters = new Map();
    (z.sections || []).forEach((sec, at) => {
      const label = String(sec.label || "");
      if (!label) return;
      if (lines.sections[at][0] !== label) throw new Error(\`\${zi.slug}: the resting lines call section \${at} "\${lines.sections[at][0]}" and the zone "\${label}" — refusing output\`);
      const ch = label.includes(":") ? label.split(":")[0] : label;
      if (!chapters.has(ch)) chapters.set(ch, []);
      chapters.get(ch).push({ sec, at });
    });
`],
  [`      const verses = secs.map((sec) => {
        const label = String(sec.label);
        const parts = [];
        for (const w of sec.words || []) {
          const keys = Array.isArray(w.w) ? w.w.map((r) => r.k) : (w.k ? [w.k] : []);
          for (const k of keys) {
            const g = gloss[k];
            if (!g) continue;
            const m = gm[k];
            const who = m && m.m ? String(m.m) : "";
            const lic = m && m.lic ? String(m.lic) : "";
            if (HEBREW.test(String(g)) || HEBREW.test(who)) { quotesHebrew += 1; parts.push(\`<i>a reading that quotes Hebrew letters, in the reader</i>\`); continue; }
            const sup = who ? \`<sup>\${numOf(who, lic)}</sup>\` : "";
            parts.push(\`<span>\${esc(spanJoin(g))}\${sup}</span>\`);
          }
        }
`,
   `      const verses = secs.map(({ sec, at }) => {
        const label = String(sec.label);
        const parts = [];
        // one entry for each line the reader drew: under a word, or once over
        // the words one card joins; the text is the line's own, as drawn
        const credit = creditedIn(lines, at);
        lines.sections[at][1].forEach(([, , text], j) => {
          const who = credit[j];
          if (HEBREW.test(String(text)) || who.some((w) => HEBREW.test(w.label))) { quotesHebrew += 1; parts.push(\`<i>a reading that quotes Hebrew letters, in the reader</i>\`); return; }
          const sup = who.length ? \`<sup>\${who.map((w) => numOf(w.label, w.license)).join(",")}</sup>\` : "";
          parts.push(\`<span>\${esc(text)}\${sup}</span>\`);
        });
`],
  [`Under each verse here: the reading printed for each of its words, oldest witness first, credited by number to its source at the foot.</p>`,
   `Under each verse here: the line the reader draws under its words as it first opens, one reading for a word or for the words one card joins, credited by number to its source at the foot.</p>`],
  [`Each carried reading keeps its own license, and a reading here is printed with its "/" pieces joined by " + " and a closing period dropped, which is our change, not the source's.\${quotesNote}`,
   `Each carried reading keeps its own license. A reading is printed here as the reader prints it: its "/" pieces joined by " + ", a closing period dropped, and a piece that is only a source's own sign left as a gap. Those are our changes, not the source's, and the record on each word's own card carries the source's bytes whole.\${quotesNote}`],
  [`and the English reading the shelf prints for every word of every verse, each credited to the dictionary that gives it and to its license.\`,`,
   `and the English reading the reader draws under every word of every verse, each credited to the source that gives it and to its license.\`,`],
  [`    chapterReceipt.books[zi.slug] = tally;`,
   `    tally.lines_read_off_the_page = { record: \`data/resting-lines/\${zi.slug}.json.gz\`, sha256: sha256Of(recordPath(".", zi.slug)), lines: lines.counts.lines };
    chapterReceipt.books[zi.slug] = tally;`],
  [`    // same as a plan book's (${V2})`, `    // same as a plan book's (${V3})`],
  [`  // A CHAPTER'S ADDRESS IS THE READER TOO (${V2}): the same`, `  // A CHAPTER'S ADDRESS IS THE READER TOO (${V3}): the same`],
]);

edit(join(R, "zone.html"), [
  [`  /* THE PORCH (${V2}). A chapter's address is this reader,
     and the door writes under the text slot a plain-text copy of what the
     lines will say: every verse a heading, the readings under it credited by
     number. It stands in the page's own frame, in the page's own inks, until
     the text is drawn — then it is hidden, because the same readings now
     stand under the words.`,
   `  /* THE PORCH (${V3}). A chapter's address is this reader,
     and the door writes under the text slot a plain-text copy of what the
     lines say: every verse a heading, the readings under it credited by
     number, read off this page's own lines as it first opens and kept
     (tools/resting-lines-v1.mjs). It stands in the page's own frame, in the
     page's own inks, until the text is drawn — then it is hidden, because
     the same readings now stand under the words.`],
  [`  // A chapter's address is this reader (${V2}): the door wrote`, `  // A chapter's address is this reader (${V3}): the door wrote`],
  [`  // on the page's own porch (${V2}) — the same label with its`, `  // on the page's own porch (${V3}) — the same label with its`],
  [`  // (${V2}); it stays only on a page the book never reached`, `  // (${V3}); it stays only on a page the book never reached`],
]);
