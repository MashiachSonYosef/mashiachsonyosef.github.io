import { open, U } from "./lib.mjs";
const book = process.argv[2] || "daniel";
const { b, p } = await open(book);
const out = await p.evaluate(() => {
  const z = window.__zone; const keys = Object.keys(z);
  const info = { keys, types: {} };
  for (const k of keys) { const v = z[k]; info.types[k] = Array.isArray(v) ? `array ${v.length}` : typeof v === "object" && v ? `object ${Object.keys(v).length}` : typeof v + " " + String(v).slice(0, 40); }
  return info;
});
console.log(JSON.stringify(out, null, 1));
const sec = await p.evaluate(() => { const s = document.querySelector("section.seg"); return { n: document.querySelectorAll("section.seg").length, html: s.outerHTML.slice(0, 1500) }; });
console.log(sec.n, U(sec.html));
await b.close();
