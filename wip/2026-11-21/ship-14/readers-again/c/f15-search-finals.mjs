// Finding 15: a word typed without its final-letter form: does its hit show the readings line the same word typed with the final shows?
// node f15-search-finals.mjs [book]
import { open, noHe } from "./lib.mjs";
const [BOOK = "obadiah"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const pairs = [["מלכ", "מלך"], ["ארצ", "ארץ"], ["יומ", "יום"], ["בנ", "בן"]];
const ask = async (q) => {
  await p.fill("#searchIn", ""); await p.waitForTimeout(100);
  await p.click("#searchIn"); await p.keyboard.type(q); // typed, as a reader types
  await p.waitForFunction(() => { const o = document.getElementById("searchOut"); return o && !o.hidden && !/searching/u.test(o.textContent) && o.querySelector(".hit, .note"); }, null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(600);
  return p.evaluate(() => {
    const o = document.getElementById("searchOut"); const h = o.querySelector(".lab + .hit");
    if (!h) return { hit: null, note: (o.querySelector(".note") || {}).textContent };
    return { word: h.querySelector(".he").textContent, meta: h.querySelector(".meta").textContent, reads: (h.querySelector(".rd") || { textContent: null }).textContent };
  });
};
for (const [plain, fin] of pairs) {
  const a = await ask(plain), c = await ask(fin);
  console.log(`typed ${noHe(plain)}(no final):`, noHe(JSON.stringify(a)));
  console.log(`typed ${noHe(fin)}(final):   `, noHe(JSON.stringify(c)));
  console.log(`  same word found: ${a.word === c.word}; readings line without the final: ${a.reads === null ? "MISSING" : "present"}; with it: ${c.reads === null ? "MISSING" : "present"}`);
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
