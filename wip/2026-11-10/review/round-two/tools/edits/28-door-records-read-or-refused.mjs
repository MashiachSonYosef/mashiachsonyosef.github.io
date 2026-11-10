// The door builder read eleven records "if the file is there": an absent filing, order, status ruling, source
// classification, posture table, color contract, demonstrations record, overlay count, reference groups or address
// history became a quiet default, and the door was written without it and exited 0 (the review of 10 November,
// the fifth reader's finding 17). All eleven are in the repository, so an absent one is a broken tree: each is
// read, or the door is not built. The search index's builder dropped a whole overlay the same way and never
// counted a store's shards; it refuses both.
// node 28-door-records-read-or-refused.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("build-front-door-v1.mjs"), [
  [`const arg = (n, d) => { const i = process.argv.indexOf(\`--\${n}\`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");`,
   `const arg = (n, d) => { const i = process.argv.indexOf(\`--\${n}\`); return i > 0 ? process.argv[i + 1] : d; };
// A RECORD THE DOOR IS BUILT FROM IS READ, OR THE DOOR IS NOT BUILT. Until 10
// November 2026 eleven of them were read "if the file is there": an absent
// filing, order, status ruling, source classification, posture table, color
// contract, demonstrations record, overlay count, reference groups or
// address history became a quiet default, and the door was written without
// it and exited 0. Every one of them is in this repository, so an absent one
// is a broken tree, and a door built from a broken tree is not a door.
const recordAt = (path, what) => {
  if (!existsSync(path)) throw new Error(\`no \${path} (\${what}) \\u2014 refusing to write a door without it\`);
  return JSON.parse(readFileSync(path, "utf8"));
};
const ZONES = arg("zones", "data/zones");`],
  [`const WORK_STATUS = existsSync(WORK_STATUS_FILE) ? JSON.parse(readFileSync(WORK_STATUS_FILE, "utf8")) : { works: {} };`,
   `const WORK_STATUS = recordAt(WORK_STATUS_FILE, "the owner's ruling on the works in progress");`],
  [`const GROUPING = existsSync(GROUPING_PATH) ? JSON.parse(readFileSync(GROUPING_PATH, "utf8")) : null;`,
   `const GROUPING = recordAt(GROUPING_PATH, "how the files are filed into the twenty-four books");`],
  [`const ORDER = existsSync(ORDER_PATH) ? JSON.parse(readFileSync(ORDER_PATH, "utf8")) : null;`,
   `const ORDER = recordAt(ORDER_PATH, "the order the door files the books in");`],
  [`const GROUP_X_RAW = existsSync(GROUP_X_PATH) ? JSON.parse(readFileSync(GROUP_X_PATH, "utf8")) : null;`,
   `const GROUP_X_RAW = recordAt(GROUP_X_PATH, "the attestation the filing is printed on");`],
  [`  const f = "data/source-corpus-v1.json";
  if (!existsSync(f)) return {};
  const rec = JSON.parse(readFileSync(f, "utf8"));`,
   `  const rec = recordAt("data/source-corpus-v1.json", "the corpus lane's classification of each source");`],
  [`const POSTURE_NAME_OF = (() => { try { const p = JSON.parse(readFileSync(arg("postures", "data/license-postures-v1.json"), "utf8")).postures || {}; return (k) => (p[k] && p[k].name) || k; } catch { return (k) => k; } })();`,
   `const POSTURE_NAME_OF = (() => { const p = recordAt(arg("postures", "data/license-postures-v1.json"), "the names of the license postures").postures || {}; return (k) => (p[k] && p[k].name) || k; })();`],
  [`const CC = existsSync(CC_PATH) ? JSON.parse(readFileSync(CC_PATH, "utf8")) : null;`,
   `const CC = recordAt(CC_PATH, "the color contract");`],
  [`const RD = RD_PUBLISH && existsSync(RD_PATH) ? JSON.parse(readFileSync(RD_PATH, "utf8")) : null;`,
   `const RD = RD_PUBLISH ? recordAt(RD_PATH, "the rule demonstrations") : null;`],
  [`const OVERLAY_COUNTS = (() => { try { return JSON.parse(readFileSync(arg("overlay-counts", "data/overlay-book-counts-v1.json"), "utf8")); } catch { return null; } })();`,
   `const OVERLAY_COUNTS = recordAt(arg("overlay-counts", "data/overlay-book-counts-v1.json"), "each book's overlay counts");`],
  [`if (existsSync(REF_GROUPS_PATH)) {
  const RG = JSON.parse(readFileSync(REF_GROUPS_PATH, "utf8"));`,
   `{
  const RG = recordAt(REF_GROUPS_PATH, "the reference groups");`],
  [`if (existsSync(HISTORY)) {
  const hist = JSON.parse(readFileSync(HISTORY, "utf8"));`,
   `{
  const hist = recordAt(HISTORY, "the recorded moves of an address");`],
]);

edit(T("bake-search-index-v1.mjs"), [
  [`const readShards = (dir) => {
  const out = {};
  for (const f of readdirSync(dir).filter((x) => /^[0-9a-f]{2}\\.bin$/u.test(x)).sort()) Object.assign(out, JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8")));
  return out;
};`,
   `// a store's shards, all of them: where its index counts its shards, a folder
// holding another number is a copy that is not whole and is refused (until
// 10 November 2026 a missing shard was a hundredth of the store left out of
// the index, quietly)
const readShards = (dir, counted = null) => {
  const out = {};
  const files = readdirSync(dir).filter((x) => /^[0-9a-f]{2}\\.bin$/u.test(x)).sort();
  if (Number.isInteger(counted) && files.length !== counted) fail(\`\${dir} holds \${files.length} shards, its index counts \${counted}: this copy is not whole\`);
  for (const f of files) Object.assign(out, JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8")));
  return out;
};`],
  [`const store = readShards(join(DATA, "dictionary-store/shards"));`,
   `const store = readShards(join(DATA, "dictionary-store/shards"), (dix.counts || {}).shards);`],
  [`const routes = readShards(join(DATA, "route-store/shards"));`,
   `const routes = readShards(join(DATA, "route-store/shards"), (rix.counts || {}).shards);`],
  [`  let oix = null;
  try { oix = JSON.parse(readFileSync(join(DATA, "overlays", id, "index.json"), "utf8")); } catch { continue; }
  const rows = readShards(join(DATA, "overlays", id, "shards"));`,
   `  // an overlay whose index cannot be read is not skipped: until 10 November
  // 2026 it was, and a search index without a whole overlay's rows would
  // have been written and sealed
  const oixPath = join(DATA, "overlays", id, "index.json");
  let oix = null;
  try { oix = JSON.parse(readFileSync(oixPath, "utf8")); } catch (e) { fail(\`the overlay \${id} has no readable index at \${oixPath} (\${e.message}): refusing to write a search index without it\`); }
  const rows = readShards(join(DATA, "overlays", id, "shards"), (oix.counts || {}).shards);`],
]);
