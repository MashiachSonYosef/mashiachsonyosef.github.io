// Scratch (builder H2): a cell's pills from the block, read off this disk. node h2-pills-try.mjs <reader dir> <book> <chapter> <label> <n> <reading> <a> <b> <t>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [R, book, ch, label, n, reading, a, b, t] = process.argv.slice(2);
const DATA = join(R, "data", "place-answers-v1", "page");
globalThis.fetch = async (url) => { const p = join(DATA, String(url).slice("d/".length)); return existsSync(p) ? new Response(readFileSync(p), { status: 200 }) : new Response("no", { status: 404 }); };
globalThis.document = { createElement: () => ({}) };
const { placeCardOf } = await import(join(R, "tools", "place-card-v1.mjs"));
const card = placeCardOf({ data: "d/", fault: (w) => console.log("fault", w) });
const doc = await card.chapter(book, Number(ch));
console.log(JSON.stringify(await card.pillsAt(doc, label, Number(n), reading, Number(a), Number(b), Number(t)), null, 1));
