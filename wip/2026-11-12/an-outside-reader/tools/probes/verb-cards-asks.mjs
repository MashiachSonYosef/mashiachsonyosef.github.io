// The outside reader's review names each card by its verse and its form. This finds each in the zone and prints
// the ask the card probe takes (label:word, marks not counted), by the form's letters and points with the
// cantillation taken off.
// node verb-cards-asks.mjs <zone.bin> <the review, as pasted>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [zp, rp] = process.argv.slice(2);
const z = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
const bare = (t) => String(t).normalize("NFC").replace(/[֑-ֽ֯־׃]/gu, "");
const asks = [];
for (const m of readFileSync(rp, "utf8").matchAll(/^### (\d+:\d+) (\S+) —/gmu)) {
  const sec = z.sections.find((s) => s.label === m[1]);
  const words = (sec.words || []).filter((w) => !w.mark);
  const at = words.findIndex((w) => bare(w.s) === bare(m[2]));
  asks.push(at >= 0 ? `${m[1]}:${at + 1}` : `NOT-FOUND(${m[1]} ${m[2]})`);
}
console.log(asks.join(" "));
