// The outside reader's audit of 12 November, run on the chain as it now stands: for a stretch of a book's verses
// every word is pressed, each pill its card prints is hashed here (node's own sha256, first 12 hex digits), and
// looked for among the links the chain holds under that word, in the state the card was read in. Counted: pills
// that are a link under their word, those that stand at the same place in the list, those credited to the source
// the chain names; and links that no pill prints.
// node chain-as-the-reader-audited.mjs <reader dir> <site root dir> <book> <first section> <count>
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const [reader, site, book, fromArg, countArg] = process.argv.slice(2);
const at = (f) => import(pathToFileURL(join(reader, "tools", f)).href);
const { loadPlaywright, launchOptions } = await at("playwright-v1.mjs");
const { serveTree } = await at("serve-tree-v1.mjs");
const { readCards, labelsFor, saidOf } = await at("card-readings-v1.mjs");
const short = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const chain = JSON.parse(gunzipSync(readFileSync(join(site, "chain", book, "chain-v1.json.gz"))).toString("utf8"));
const labels = labelsFor(reader);
const from = Number(fromArg), to = from + Number(countArg);
const tree = await serveTree(reader);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
try {
  for (const state of ["rest", "lifted"]) {
    const got = await readCards(b, tree.base, book, state, { from, to });
    const T = { words: 0, pills: 0, link: 0, place: 0, source: 0, links: 0, idle: 0 };
    for (const sec of got.sections) for (const raw of sec.cards) {
      T.words += 1;
      const said = saidOf(raw, labels);
      const kept = chain.sections[sec.i].cells[raw.e][state];
      const list = kept.pool === null ? [] : chain.pools[kept.pool];
      const under = new Map(list.map((l) => [l.r, l]));
      const printed = new Set();
      said.pills.forEach((p, x) => {
        T.pills += 1;
        const r = short(p.text); printed.add(r);
        const l = under.get(r);
        if (!l) return;
        T.link += 1;
        if (list[x] && list[x].r === r) T.place += 1;
        if (l.s === short(p.label)) T.source += 1;
      });
      T.links += list.length;
      T.idle += list.filter((l) => !printed.has(l.r)).length;
    }
    console.log(`${book}, ${chain.sections[from].label} to ${chain.sections[to - 1].label}, ${state === "rest" ? "at rest" : "every switch lifted"}: ${T.words} words · ${T.pills} pills · a link under their word ${T.link} · at the same place in the list ${T.place} · credited to the source the chain names ${T.source} · links under those words ${T.links}, of which no pill prints ${T.idle}`);
  }
} finally { await b.close(); await tree.close(); }
