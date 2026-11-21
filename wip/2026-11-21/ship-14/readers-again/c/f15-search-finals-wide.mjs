// Finding 15, wider: for a list of common words that end in a final letter, compare the hit typed with and without the final
import { open, noHe } from "./lib.mjs";
const { b, p, errors } = await open(`b=obadiah`);
const FIN = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const words = ["שלום", "אדם", "עולם", "מקום", "כהן", "אבן", "כסף", "עץ", "דרך", "חכם", "ירושלם", "ציון", "אדום", "מצרים", "אלהים", "לחם", "שמים", "אשריך"];
const ask = async (q) => {
  await p.fill("#searchIn", ""); await p.waitForTimeout(80);
  await p.click("#searchIn"); await p.keyboard.type(q);
  await p.waitForFunction(() => { const o = document.getElementById("searchOut"); return o && !o.hidden && !/searching/u.test(o.textContent) && o.querySelector(".hit, .note"); }, null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(500);
  return p.evaluate(() => { const o = document.getElementById("searchOut"); const h = o.querySelector(".lab + .hit"); if (!h) return { word: null, reads: null }; return { word: h.querySelector(".he").textContent, n: h.querySelector(".meta").textContent.split(" ")[0], reads: (h.querySelector(".rd") || { textContent: null }).textContent }; });
};
let missing = 0, other = 0, same = 0;
for (const w of words) {
  const plain = w.slice(0, -1) + FIN[w.slice(-1)];
  const a = await ask(plain), c = await ask(w);
  const verdict = a.word !== c.word ? "another word" : a.reads === null ? "NO READINGS LINE" : a.reads === c.reads ? "same line" : "ANOTHER LINE";
  if (verdict === "NO READINGS LINE") missing += 1; else if (verdict === "ANOTHER LINE") other += 1; else if (verdict === "same line") same += 1;
  console.log(`${noHe(w)}| ${c.n} places | with final: ${JSON.stringify(c.reads)} | without: ${JSON.stringify(a.reads)} | ${verdict}`);
}
console.log(`of ${words.length}: no readings line ${missing}, another line ${other}, the same line ${same}`);
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
