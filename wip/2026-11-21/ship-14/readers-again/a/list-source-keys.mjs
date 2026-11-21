// the source chips on the main rail: key and ids
import { open } from "./lib.mjs";
const { b, p } = await open(process.argv[2] || "ruth");
console.log((await p.evaluate(() => [...document.querySelectorAll("#sourcesRow button.dfp")].map((x) => `${x.dataset.key} ${x.dataset.ids} ${x.classList.contains("on") ? "on" : "off"}`))).join("\n"));
await b.close();
