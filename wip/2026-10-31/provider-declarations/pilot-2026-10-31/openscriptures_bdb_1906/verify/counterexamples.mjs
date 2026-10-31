// Keyed counterexamples found by reading the dividing-shape occurrences (verify.mjs -> dividing-occurrences.json).
// Each entry names the comma (by the piece printed after it, or the piece before it for a shared tail) and why the printed piece is not a rendering.
// The script checks each is present in the named shape and counts routes and commas.
// usage: node counterexamples.mjs <outdir>
import fs from "node:fs"; import path from "node:path";
const OUT = process.argv[2];
const div = JSON.parse(fs.readFileSync(path.join(OUT, "dividing-occurrences.json"), "utf8"));
const CE = {
  A_piece_not_a_rendering_completed_by_another_piece: [
    { key: "דרר", route: "run vehemently, easily", commas: 1, why: "'easily' completes 'run' (run easily, of a horse); alone it is an adverb" },
    { key: "חשש", route: "particles of straw, sand, dust", commas: 2, why: "'sand', 'dust' complete 'particles of'; the cognate means particles, not sand" },
    { key: "לאם", route: "common, vulgar people", commas: 1, why: "'common' is completed by 'people' after it (common people); def has '[pl.] common ones' just before" },
    { key: "יען", route: "hard, unproductive soil", commas: 1, why: "'hard' is completed by 'soil' after it (hard soil)" },
    { key: "דרג", route: "rise in grade, rank", commas: 1, why: "'rank' completes 'rise in' (rise in rank); alone it is another word" },
  ],
  B_head_carried_outside_HEADS: [
    { key: "חזר", route: "became narrow, small", commas: 1, why: "'became' carried: became small" },
    { key: "חמת", route: "grow rancid, putrid", commas: 1, why: "'grow' carried: grow putrid" },
    { key: "כלח", route: "contract the face, look hard, stern", commas: 1, why: "second comma only: 'look' carried, look stern" },
    { key: "זמר", route: "thing to be protected, thing sacred, inviolable", commas: 1, why: "second comma only: 'thing' carried, thing inviolable" },
  ],
  C_non_English_piece: [
    { key: "ידד", route: "loving-one, friend, amie", commas: 1, why: "'amie' is French; the meaning says English renderings" },
  ],
};
const res = {};
for (const [cls, list] of Object.entries(CE)) {
  let routes = 0, commas = 0; const missing = [];
  for (const c of list) {
    const occ = div["comma.between_glosses"].filter((e) => e.key === c.key && e.route === c.route).length;
    if (occ < c.commas) missing.push(c.key); else { routes++; commas += c.commas; }
  }
  res[cls] = { shape: "comma.between_glosses", routes, commas, missing };
}
fs.writeFileSync(path.join(OUT, "counterexamples.json"), JSON.stringify({ res, CE }, null, 1));
console.log(JSON.stringify(res));
