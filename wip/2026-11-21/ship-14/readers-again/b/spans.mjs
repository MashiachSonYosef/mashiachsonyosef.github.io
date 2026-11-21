// The span store's places per book as the page lays them at rest: how many are cells and how many rest as words.
// node spans.mjs <extra query or ""> <book> [book ...]
import { open } from "./lib.mjs";
const [EXTRA, ...BOOKS] = process.argv.slice(2);
for (const BOOK of BOOKS) {
  const { b, p } = await open(`b=${BOOK}${EXTRA}`);
  const s = await p.evaluate(() => window.__spanStore ? { places: window.__spanStore.places, cards: window.__spanStore.cards, laid: window.__spanStore.laid, rested: window.__spanStore.rested, skipped: (window.__spanStore.skipped || []).length } : null);
  console.log(`${BOOK}${EXTRA || " (at rest)"}: __spanStore = ${JSON.stringify(s)}`);
  await b.close();
}
