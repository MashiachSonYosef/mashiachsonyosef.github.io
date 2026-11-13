// Synthesis lane · the owner's rulings, read from the corpus lane's own pin of them
// LEDGER: -
// no frame letter. It reads the pinned rulings and writes nothing.
//
// THE OWNER'S RULINGS, AS THE CORPUS LANE PINNED THEM.
//
// When the owner rules on a call the corpus lane put, the lane writes the
// ruling down beside the owner's own words: which file it rules, which
// branch or class of that file, and the option the owner set
// (data/rulings/, one folder per relay, kept byte for byte and named in
// data/rulings/PIN.json). A tool of this lane that applies a ruling reads it
// from there. It does not carry the ruling in its own code, so what the page
// does can be set beside what the owner said, file by file and sha256 by
// sha256.
//
//   rulingsPinned(dir)  -> every ruling of every pinned file, each with the
//                          relay it came in, the owner's words it answers
//                          and the file it is pinned in
//   rulingOf(rulings, sha256, test)
//                       -> the one ruling on the file of that sha256 that
//                          `test` picks; none or more than one is a fault,
//                          said in words
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const RULINGS_DIR = join(HERE, "..", "data", "rulings");
export const RULINGS_HOME = "reader/data/rulings";   // the same folder as a record names it

export const rulingsPinned = (dir = RULINGS_DIR) => {
  const pin = JSON.parse(readFileSync(join(dir, "PIN.json"), "utf8"));
  if (pin.schema_version !== "RULINGS_PIN_V1" || !Array.isArray(pin.files)) throw new PinFault(`the pin of the rulings names no files (${join(dir, "PIN.json")})`);
  const out = [];
  for (const p of pin.files) {
    const name = `${p.folder}/${p.file}`;
    const said = JSON.parse(readPinned(join(dir, p.folder, p.file), p, name).toString("utf8"));
    if (said.the_owners_words !== p.the_owners_words) throw new PinFault(`${name} holds other words of the owner's than its pin`);
    for (const r of said.rulings || []) out.push({ ...r, relay_of_the_ruling: p.relay, the_owners_words: said.the_owners_words, pinned_in: { file: `${RULINGS_HOME}/${name}`, sha256: p.sha256 } });
  }
  return out;
};

// the files a ruling rules: `file` where it names one, `files` where it names several
const rules = (r, sha256) => [r.file, ...(r.files || [])].some((f) => f && f.sha256 === sha256);
export const rulingOf = (rulings, sha256, test, what) => {
  const got = rulings.filter((r) => rules(r, sha256) && test(r));
  if (got.length !== 1) throw new PinFault(`${got.length} pinned rulings are ${what} (on the file ${String(sha256).slice(0, 12)}); one is needed`);
  return got[0];
};
// a ruling as a record cites it
export const cited = (r) => ({ n: r.n, relay: r.relay_of_the_ruling, the_owners_words: r.the_owners_words, pinned_in: r.pinned_in });
