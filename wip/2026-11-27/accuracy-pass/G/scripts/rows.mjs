// Read-only: the store's rows under a key, as the page reads them, with each row's entry facts and its verdict at a
// place. Usage: node rows.mjs <key> [tag,tag] [text filter]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const T = (f) => import(join(R, "tools", f));
const { openRouteStore } = await T("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await T("entry-gate-v1.mjs");
const { pageReading } = await T("page-reading-v1.mjs");
const [key, tags = "", filter = ""] = process.argv.slice(2);
const store = openRouteStore(join(R, "data/route-store"));
const MS = store.index.m_sources;
const PR = pageReading(readFileSync(join(R, "zone.html"), "utf8"), store.index);
const all = (store.routesFor(key) || []).filter((r) => MS[r[3]]);
const place = tags ? placeEntry(tags.split(",")) : null;
const facts = all.map((r) => PR.factsOf(r));
const bdbHere = place ? bdbEntriesAt(place, facts) : null;
console.log(`${all.length} rows under ${key}${place ? ` · place ${JSON.stringify(place)} · BDB's entries here ${JSON.stringify([...bdbHere])}` : ""}`);
all.forEach((r, i) => {
  const prints = PR.readingsOfRow(r);
  if (filter && !prints.some((x) => x.toLowerCase().includes(filter.toLowerCase())) && !String(r[1]).toLowerCase().includes(filter.toLowerCase())) return;
  console.log(`${String(r[3]).padEnd(5)} rank ${r[0]} y ${r[4]} ${place ? entryVerdict(facts[i], place, bdbHere).padEnd(5) : ""} facts ${JSON.stringify(facts[i])} heads ${JSON.stringify(r[6])} prints ${JSON.stringify(prints).slice(0, 200)} | route ${JSON.stringify(String(r[1]).slice(0, 120))}`);
});
