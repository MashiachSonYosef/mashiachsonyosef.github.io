# tools/bake-word-senses-v1.mjs: the record carries the owner's legend, «brackets mean sense, not definition», and the
# served Jastrow rows whose record card it holds on by the corpus lane's own lists: the row's definition field holds
# exactly one "[", the lane lists a word sense with the same key, source id and definition field (that one bracket is
# the sense), and its list of cards with an aside holds no row with that key, source id and definition field. The
# owner, 14 November 2026: «i dont really see your legend that signifies its a sense, should it say that in purple
# somewhere if we are stripping the brackets». Refused unless each text stands once.
# python3 -I 120-the-bake-carries-the-legend.py <bake-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""// This tool carries the list to the page. A listed row is found in the
// served overlay by its key, its rank and its source id together, and must
// print the route and hold the definition the list says, byte for byte. The
// record names each row by key, rank and source id, nothing more; the texts
// stay where they are served.
""", """// This tool carries the list to the page. A listed row is found in the
// served overlay by its key, its rank and its source id together, and must
// print the route and hold the definition the list says, byte for byte. The
// record names each row by key, rank and source id, nothing more; the texts
// stay where they are served.
//
// THE LEGEND. The owner's wording, «brackets mean sense, not definition»,
// lives in the lane's legends-v1.json, for the record card, which shows
// Jastrow's definition as served, brackets and all. It is not true of every
// bracket: the lane lists the cards where a bracket is an aside, and counts
// rows it could not match. The owner, 14 November 2026: «i dont really see
// your legend that signifies its a sense, should it say that in purple
// somewhere if we are stripping the brackets». The record names the served
// rows whose card it holds on by the lane's own lists, and no other: the
// row's definition field holds exactly one "[", the lane lists a word sense
// with the same key, source id and definition field (so that one bracket is
// the sense), and its cards with an aside hold no row with that key, source
// id and definition field.
""")
one("""//   - a word sense the served overlay does not hold under its key, rank and
//     source id, or holds with another route or definition.
""", """//   - a word sense the served overlay does not hold under its key, rank and
//     source id, or holds with another route or definition;
//   - a legend file or an aside list that is not its pinned bytes, a legend
//     file with no legend for Jastrow's square brackets, or one with no words.
""")
one("""const shardRows = new Map();
""", """const shardRows = new Map();
const LEGEND_ID = "jastrow-square-brackets";
""")
one("""  const keys = [...rows.keys()].sort();
""", """  const keys = [...rows.keys()].sort();
  // the legend, and the served rows whose record card it holds on
  const legends = JSON.parse(readPinned(join(FOLDER, pin.legends.file), pin.legends).toString("utf8"));
  const legend = (legends.legends || []).find((x) => x && x.id === LEGEND_ID);
  if (!legend || typeof legend.text !== "string" || !legend.text.trim()) throw new Refused(`the legend file holds no legend ${LEGEND_ID} with words`);
  const defKey = (k, m, def) => `${k}\\u0001${m}\\u0001${def}`;
  const senseDefs = new Set(lines.filter((r) => r.branch === "WORD_SENSE").map((r) => defKey(r.k, r.m, r.def)));
  const asideDefs = new Set(readPinnedLines(join(FOLDER, pin.cards_with_an_aside.file), pin.cards_with_an_aside).map((a) => defKey(a.k, a.m, a.def)));
  const legendRows = new Map();
  let legendCount = 0;
  for (const f of readdirSync(join(OVERLAY, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    const shard = JSON.parse(gunzipSync(readFileSync(join(OVERLAY, "shards", f))).toString("utf8"));
    for (const [k, list] of Object.entries(shard)) {
      for (const x of list || []) {
        if (!Array.isArray(x) || typeof x[2] !== "string" || x[2].split("[").length !== 2) continue;
        const dk = defKey(k, x[3], x[2]);
        if (!senseDefs.has(dk) || asideDefs.has(dk)) continue;
        if (!legendRows.has(k)) legendRows.set(k, []);
        legendRows.get(k).push([x[0], x[3]]);
        legendCount += 1;
      }
    }
  }
  const legendKeys = [...legendRows.keys()].sort();
""")
one("""    rows: Object.fromEntries(keys.map((k) => [k, rows.get(k).sort((a, b) => a[0] - b[0])])),
  };
""", """    rows: Object.fromEntries(keys.map((k) => [k, rows.get(k).sort((a, b) => a[0] - b[0])])),
    legend: {
      id: LEGEND_ID,
      text: legend.text,
      whose_wording: legend.whose_wording || null,
      where: "the record card under a served Jastrow row whose definition field holds exactly one \\"[\\", whose words the corpus lane lists as a word sense under the same key, source id and definition field, and which its cards with an aside do not hold",
      file: { legends: pin.legends.file, cards_with_an_aside: pin.cards_with_an_aside.file },
      counts: { rows: legendCount, keys: legendKeys.length },
      rows: Object.fromEntries(legendKeys.map((k) => [k, legendRows.get(k).sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1))])),
    },
  };
""")
one("""import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
""", """import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
""")
one("""    console.log(`word senses: ${record.counts.rows} rows under ${record.counts.keys} keys · ${Buffer.byteLength(text)} bytes · ${was === sha256Of(Buffer.from(text)) ? "the same as before" : "written"} · ${out}`);
""", """    console.log(`word senses: ${record.counts.rows} rows under ${record.counts.keys} keys · the legend on ${record.legend.counts.rows} rows' record cards under ${record.legend.counts.keys} keys · ${Buffer.byteLength(text)} bytes · ${was === sha256Of(Buffer.from(text)) ? "the same as before" : "written"} · ${out}`);
""")
open(p, "w", encoding="utf-8").write(s); print("bake-word-senses-v1: the record carries the legend and where it holds")
