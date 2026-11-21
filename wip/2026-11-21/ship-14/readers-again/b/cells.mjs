// How many joined cells the page lays, at rest and under a switch: the page's own counters and the cells drawn.
// node cells.mjs <book> [extra query ...]   (each extra query is one load)
import { open, noHe } from "./lib.mjs";
const [BOOK, ...EXTRAS] = process.argv.slice(2);
for (const EXTRA of EXTRAS.length ? EXTRAS : [""]) {
  const { b, p } = await open(`b=${BOOK}${EXTRA}`);
  const r = await p.evaluate(() => {
    const runs = [...document.querySelectorAll(".wjoin")];
    const keyed = runs.filter((x) => x.__key);
    return { hudRuns: window.__hudRuns, runCards: window.__runCards, lanes: window.__hudLanes || null, sections: document.querySelectorAll("section.seg").length, built: document.querySelectorAll("section.seg .he-text").length, wjoin: runs.length, keyed: keyed.length,
      first: keyed.slice(0, 12).map((x) => `${(x.closest("section.seg").querySelector(".vnum") || {}).textContent} [${x.className}] key=${x.__key} chain=${!!x.__chain} named=${!!x.__run}${x.__run && x.__run.spanKey ? " span" : ""} words=${x.__words ? x.__words.length : "-"}`) };
  });
  console.log(`== ${BOOK}${EXTRA || " (at rest)"}: built sections ${r.built}/${r.sections}; cells drawn ${r.wjoin}, with a key ${r.keyed}; __hudRuns=${JSON.stringify(r.hudRuns)} __runCards=${JSON.stringify(r.runCards)}`);
  console.log(r.first.map(noHe).join("\n"));
  await b.close();
}
