// The shelf said where it stands. The store record is divided by the gate (the bins the door publishes;
// the seals kept for the rest), and every tool that read a checkout as the whole shelf reads the record.
// node 16-shelf.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = join(R, "tools");

// ---- the one registry of what the shelf is ---------------------------------
edit(join(T, "zones-on-disk-v1.mjs"), [
[`/** Every zone on disk that is a work: not a sidecar, not a route shard, not a
 *  test instrument. Sorted, so a run is reproducible. */
export function zonesOnDisk(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".bin"))
    .filter((f) => !isSidecar(f))
    .filter((f) => !/^[0-9a-f]{2}\\.bin$/.test(f))   // route-store shards
    .filter((f) => f !== "w-top.bin")
    .filter((f) => !f.startsWith("fixture-"))       // instruments, not works
    .map((f) => f.replace(/\\.bin$/, ""))
    .sort();
}`,
 `/** Whether a bin's name is a work's: not a sidecar, not a route shard, not a
 *  test instrument. */
const isWorkBin = (f) => f.endsWith(".bin")
  && !isSidecar(f)
  && !/^[0-9a-f]{2}\\.bin$/.test(f)   // route-store shards
  && f !== "w-top.bin"
  && !f.startsWith("fixture-");       // instruments, not works

/** Every zone on disk that is a work. Sorted, so a run is reproducible. */
export function zonesOnDisk(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(isWorkBin).map((f) => f.replace(/\\.bin$/, "")).sort();
}

/** THE SHELF AS SEALED, which is more than the shelf as it stands on a disk.
 *
 *  A checkout holds the bins the door publishes and no others: a work the
 *  gate does not serve keeps its bin out of the published tree. The seals of
 *  every bin of the shelf are kept all the same, in two records beside the
 *  zones: the store record pins the bins the door publishes, and the held
 *  record keeps the seal of every other (tools/emit-zone-store-v1.mjs writes
 *  both, divided by the gate's receipt).
 *
 *  So "what works has this lane built" and "what can be opened here" are two
 *  questions. Until 10 November 2026 nothing told them apart: five checks
 *  asked the directory for the shelf, and on every machine but the one that
 *  built it they found forty books of 3,481 and failed, or passed on less
 *  than they claimed. A check that asks what exists asks zonesSealed; one
 *  that must open a bin asks zonesOnDisk, and says so when a work it wanted
 *  is held. */
export const ZONE_STORE_RECORD = "zone-store-v1.json";
export const ZONE_STORE_HELD = "zone-store-held-v1.json";

/** The works whose seal is kept and whose bin is not on this disk. */
export function zonesHeld(dir = ZONES) {
  const p = join(dir, "..", ZONE_STORE_HELD);
  if (!existsSync(p)) return [];
  const here = new Set(zonesOnDisk(dir));
  return Object.keys(JSON.parse(readFileSync(p, "utf8")).pins || {}).filter(isWorkBin)
    .map((f) => f.replace(/\\.bin$/, "")).filter((z) => !here.has(z)).sort();
}

/** Every work of the shelf: on this disk, or held off the door under seal. */
export function zonesSealed(dir = ZONES) {
  return [...new Set([...zonesOnDisk(dir), ...zonesHeld(dir)])].sort();
}`],
]);

// ---- the store check: two records, divided by the gate ----------------------
edit(join(T, "check-zone-store-v1.mjs"), [
[`// Two halves. On disk: the store record exists, every served bin carries a
// pin, every pin matches its bin byte for byte, and no pin names a bin that
// is not there while the shelf stands beside the door (base null) — a stale
// record is exactly the drift this rule exists to make loud. In the reader:`,
 `// Two halves. On disk: the store record exists, every bin on this disk
// carries a seal, every pin matches its bin byte for byte, and no pin names a
// bin that is not there while the shelf stands beside the door (base null) —
// a stale record is exactly the drift this rule exists to make loud. The
// gate divides the shelf: the record pins the bins the door publishes, the
// held record keeps the seal of every other, and no bin is in both, no
// served work is held and no unserved one is pinned as published. A held bin
// is not on a checkout and is not asked for; where one does stand on this
// disk it matches its seal. In the reader:`],
[`import { zonesOnDisk } from "./zones-on-disk-v1.mjs";`,
 `import { zonesOnDisk, zonesServed, baseOfSidecar, isSidecar, ZONE_STORE_HELD } from "./zones-on-disk-v1.mjs";`],
[`const unpinned = bins.filter((f) => !(store.pins || {})[f]);
check(\`every served bin carries a pin (\${bins.length} bins)\`, unpinned.length === 0, unpinned.join(", ") || "all pinned");`,
 `const HELD = join(K3, "data", ZONE_STORE_HELD);
const heldBody = existsSync(HELD) ? readFileSync(HELD) : null;
const held = heldBody ? (JSON.parse(heldBody.toString("utf8")).pins || {}) : {};
const unpinned = bins.filter((f) => !(store.pins || {})[f] && !held[f]);
check(\`every bin on this disk carries a seal (\${bins.length} bins)\`, unpinned.length === 0, unpinned.join(", ") || "all sealed");`],
[`check("every pin matches its bin, byte for byte", stale.length === 0, stale.join(" · ") || \`\${Object.keys(store.pins || {}).length} pins exact\`);`,
 `check("every pin matches its bin, byte for byte", stale.length === 0, stale.length ? \`\${stale.length} — \${stale.slice(0, 6).join(" · ")}\` : \`\${Object.keys(store.pins || {}).length} pins exact\`);

// 1b · the bins held off the door
{
  const served = new Set(zonesServed(ZONES));
  const publishedBin = (f) => f.startsWith("fixture-") || served.has(baseOfSidecar(f) || f.replace(/\\.bin$/u, ""));
  const heldNames = Object.keys(held);
  const both = heldNames.filter((f) => (store.pins || {})[f]);
  const servedHeld = heldNames.filter(publishedBin);
  const pinnedUnserved = Object.keys(store.pins || {}).filter((f) => !publishedBin(f));
  check("the gate divides the shelf: a bin is published or held, never both",
    both.length === 0 && servedHeld.length === 0 && pinnedUnserved.length === 0,
    both.length ? \`\${both.length} in both records — \${both.slice(0, 3).join(", ")}\`
      : servedHeld.length ? \`\${servedHeld.length} held though the gate serves it — \${servedHeld.slice(0, 3).join(", ")}\`
      : pinnedUnserved.length ? \`\${pinnedUnserved.length} pinned as published though the gate does not serve it — \${pinnedUnserved.slice(0, 3).join(", ")}\`
      : \`\${Object.keys(store.pins || {}).length} published · \${heldNames.length} held\`);
  const drifted = [];
  let heldHere = 0;
  for (const f of heldNames) {
    const p = join(ZONES, f);
    if (!existsSync(p)) continue;
    heldHere += 1;
    const b = readFileSync(p);
    if (createHash("sha256").update(b).digest("hex") !== held[f].sha256 || b.length !== held[f].bytes) drifted.push(f);
  }
  check("a held bin that stands on this disk matches its seal", drifted.length === 0,
    drifted.length ? \`\${drifted.length} drifted — \${drifted.slice(0, 3).join(", ")}\` : \`\${heldHere} of \${heldNames.length} held bins stand on this disk\`);
  const d = store.held_off_the_door || null;
  const count = { bins: heldNames.length, zones: heldNames.filter((f) => !isSidecar(f)).length, sidecars: heldNames.filter((f) => isSidecar(f)).length };
  check("the record counts the held bins and seals the record that names them",
    heldNames.length === 0 ? d === null
      : !!d && d.bins === count.bins && d.zones === count.zones && d.sidecars === count.sidecars
        && d.seals_read_off_the_disk_at_this_writing + d.seals_carried_from_the_record_before === d.bins
        && !!d.seals && d.seals.bytes === heldBody.length && d.seals.sha256 === createHash("sha256").update(heldBody).digest("hex"),
    heldNames.length === 0 ? (d === null ? "nothing is held, and the record says nothing of it" : "the record declares held bins and no held record names any")
      : !d ? \`\${heldNames.length} seals are kept and the store record does not declare them\`
      : \`\${count.zones.toLocaleString("en-US")} works and \${count.sidecars} sidecars held · \${d.seals_read_off_the_disk_at_this_writing} seals read off the disk at the writing, \${d.seals_carried_from_the_record_before.toLocaleString("en-US")} carried\`);
}`],
]);

// ---- five checks that asked a checkout for the whole shelf -------------------
edit(join(T, "check-frame-coverage-v1.mjs"), [
[`import { zonesServed, zonesOnDisk } from "./zones-on-disk-v1.mjs";`,
 `import { zonesServed, zonesSealed } from "./zones-on-disk-v1.mjs";`],
[`  const servedSet = new Set(servedNow);
  for (const z of zonesOnDisk(ZONES)) {`,
 `  const servedSet = new Set(servedNow);
  // every work of the shelf, on this disk or held off the door under seal: a
  // commentary work is seldom a served one, so a checkout does not hold its
  // bin, and its name is what this reads
  for (const z of zonesSealed(ZONES)) {`],
]);
edit(join(T, "check-work-attachment-v1.mjs"), [
[`import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";`,
 `import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesSealed } from "./zones-on-disk-v1.mjs";`],
[`// 1 · drift — the shelf is the authority on what exists
const onShelf = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")).map((f) => f.replace(/\\.bin$/, ""))
  : [];`,
 `// 1 · drift — the shelf is the authority on what exists: every work whose
// seal is kept, on this disk or held off the door (a work that names a base
// is seldom served, so a checkout seldom holds its bin)
const onShelf = zonesSealed(ZONES);`],
]);
edit(join(T, "check-sidecars-all-named-v1.mjs"), [
[`import { SIDECAR_SUFFIXES, zonesOnDisk, baseOfSidecar } from "./zones-on-disk-v1.mjs";`,
 `import { SIDECAR_SUFFIXES, zonesOnDisk, zonesSealed, baseOfSidecar } from "./zones-on-disk-v1.mjs";`],
[`  const shelf = zonesOnDisk(ZONES).length;
  check("S4  the gate judges books, not sidecars",
    sidecars.length === 0 && r.zones_on_the_shelf === shelf,
    sidecars.length ? \`\${sidecars.length} sidecar(s) judged — \${few(sidecars)}\`
      : \`the receipt counts \${r.zones_on_the_shelf} on the shelf and the shelf holds \${shelf}\`);`,
 `  // the shelf as sealed: the works on this disk and the works held off the
  // door, whose verdicts stand in the receipt unread
  const shelf = zonesSealed(ZONES).length;
  check("S4  the gate judges books, not sidecars",
    sidecars.length === 0 && r.zones_on_the_shelf === shelf,
    sidecars.length ? \`\${sidecars.length} sidecar(s) judged — \${few(sidecars)}\`
      : \`the receipt counts \${r.zones_on_the_shelf} on the shelf and the shelf, here and held, is \${shelf}\`);`],
]);
edit(join(T, "check-masoretic-gold-v1.mjs"), [
[`const outside = Object.keys(store.pins || {}).map((k) => k.replace(/\\.bin$/u, "")).sort().filter((k) => !R.books.includes(k) && !k.includes("."));`,
 `// (the store record pins what the door publishes; the held record beside it
// keeps the seal of every other work of the shelf)
const heldSeals = existsSync("data/zone-store-held-v1.json") ? (JSON.parse(readFileSync("data/zone-store-held-v1.json", "utf8")).pins || {}) : {};
const outside = Object.keys({ ...heldSeals, ...(store.pins || {}) }).map((k) => k.replace(/\\.bin$/u, "")).sort().filter((k) => !R.books.includes(k) && !k.includes(".") && !k.startsWith("fixture-"));`],
]);
edit(join(T, "check-commentary-section-aligned-v1.mjs"), [
[`//   L4  no commentary unit is invented or folded: every attached unit is one
//       sealed id, attached once, carrying its own words, and the sealed count
//       of the commentary work (the bridge's under v2, its own zone's under v3)
//       is the count that found a section
//   L5  where the commentary work is also a zone on this shelf, the words
//       attached under a section are the words that zone carries for the same
//       sealed unit`,
 `//   L4  no commentary unit is invented or folded: every attached unit is one
//       sealed id, attached once, carrying its own words, and the sealed count
//       of the commentary work (the bridge's under v2, its own zone's under v3)
//       is the count that found a section
//   L5  where the commentary work is also a zone on this shelf, the words
//       attached under a section are the words that zone carries for the same
//       sealed unit
//
// WHERE THE COMMENTARY'S OWN ZONE IS HELD OFF THE DOOR. A commentary work is
// seldom a served one, and a work the gate does not serve keeps its bin out
// of the published tree: on a checkout the zone L5 and the count clause of
// L4 want to open is not there. Where the held record keeps that zone's seal
// the two say, each on a line of its own that begins "--", that they were
// not read and for which books; they do not pass and they do not fail. A
// commentary work the shelf's records do not know at all still fails L4: a
// sidecar built from nothing is what that clause is for. Until 10 November
// 2026 L4 failed on every checkout for the 21 it could not read, and L5
// printed "ok" over a law it had not asked.`],
[`import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(\`--\${n}\`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

const SCHEMA = "ZONE_COMMENTARY_V2";`,
 `import { fileURLToPath } from "node:url";
import { zonesHeld } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(\`--\${n}\`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const HELD = new Set(zonesHeld(ZONES));

const SCHEMA = "ZONE_COMMENTARY_V2";`],
[`const uncompared = [];`,
 `const uncompared = [];
const heldUnread = [];                                    // L4's count clause, where the work's own zone is held`],
[`      if (!own) note(invented, \`\${slug}: \${(w && w.zone) || "work #" + i} is not a zone on this shelf, so its sealed count cannot be read\`);`,
 `      const name = (w && w.zone) || "work #" + i;
      if (!own && HELD.has(name)) heldUnread.push(\`\${slug} (\${name})\`);
      else if (!own) note(invented, \`\${slug}: \${name} is not a zone of this shelf, on this disk or held, so its sealed count cannot be read\`);`],
[`    : "every attached unit is one sealed id, attached once, carrying its own words, and the sealed count is the count attached");`,
 `    : \`every attached unit is one sealed id, attached once, carrying its own words\${heldUnread.length ? "" : ", and the sealed count is the count attached"}\`);
if (heldUnread.length) console.log(\`  --  L4  the commentary work's sealed count is the count attached  ·  not read for \${heldUnread.length}: the work's own zone is held off the door, its seal kept in the held record — \${few(heldUnread, 3)}\`);`],
[`check("L5  the words attached are the words the commentary work's own zone carries",
  wordsDiffer.length === 0,
  wordsDiffer.length
    ? \`\${wordsDiffer.length} differ: \${few(wordsDiffer, 2)}\`
    : compared
      ? \`\${compared.toLocaleString()} units compared against \${ownZonesUsed} zone(s)\` +
        \`\${uncompared.length ? \` · uncompared, no zone of their own on this shelf: \${few(uncompared, 2)}\` : ""}\`
      : \`no commentary work here is a zone of its own on this shelf, so this one went unasked: \${few(uncompared, 2)}\`);`,
 `if (wordsDiffer.length || compared) check("L5  the words attached are the words the commentary work's own zone carries",
  wordsDiffer.length === 0,
  wordsDiffer.length
    ? \`\${wordsDiffer.length} differ: \${few(wordsDiffer, 2)}\`
    : \`\${compared.toLocaleString()} units compared against \${ownZonesUsed} zone(s)\` +
      \`\${uncompared.length ? \` · uncompared, no zone of their own on this disk: \${few(uncompared, 2)}\` : ""}\`);
else console.log(\`  --  L5  the words attached are the words the commentary work's own zone carries  ·  not read: no commentary work here has its own zone on this disk — \${few(uncompared, 2)}\`);`],
]);

// ---- the gate: a held work's verdict stands, unread, and is said to ----------
edit(join(T, "check-c0-refusals-v1.mjs"), [
[`import { isSidecar, baseOfSidecar } from "./zones-on-disk-v1.mjs";`,
 `import { isSidecar, baseOfSidecar, zonesHeld } from "./zones-on-disk-v1.mjs";`],
[`// The cache: a zone's verdict is a function of its bytes, so it is cached by`,
 `// THE WORKS HELD OFF THE DOOR. A checkout holds the bins the door publishes
// and no others, so on every machine but a builder with the whole shelf on
// its disk this reads forty books of thousands. The verdict of a work whose
// bin is held (the held record keeps its seal) is the one it was given when
// its bytes were last read: it stands in the receipt, counted apart and said
// to be unread, and a held work is served under no verdict. Until 10
// November 2026 a run on a checkout wrote a receipt of forty books and the
// round patched the other 3,441 back in from the commit before, by hand.
//
// The cache: a zone's verdict is a function of its bytes, so it is cached by`],
[`const passed = [...verdicts.entries()].filter(([, v]) => v.verdict === "PASS").map(([s]) => s).sort();`,
 `// ---- the works held off the door: their verdicts stand, unread --------------
const standing = new Map();
const unjudgedHeld = [];
if (!ONLY) {
  const before = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : {};
  const wasPassed = new Set(before.passed || []), wasStamped = new Set(before.stamped || []);
  for (const slug of zonesHeld(ZONES)) {
    if (verdicts.has(slug)) continue;
    const r = (before.refused || {})[slug];
    if (r) standing.set(slug, { verdict: "REFUSED", rows: r.rows, hits: r.hits || {}, examples: r.examples || {}, stamped: wasStamped.has(slug) });
    else if (wasPassed.has(slug)) standing.set(slug, { verdict: "PASS", hits: {}, examples: {}, stamped: wasStamped.has(slug) });
    else unjudgedHeld.push(slug);
  }
}
const all = [...verdicts.entries(), ...standing.entries()];
const passed = all.filter(([, v]) => v.verdict === "PASS").map(([s]) => s).sort();`],
[`const stamped = [...verdicts.entries()].filter(([, v]) => v.stamped).map(([s]) => s).sort();
const served = passed.filter((s) => verdicts.get(s).stamped);
const notStamped = passed.filter((s) => !verdicts.get(s).stamped);
const refused = Object.fromEntries([...verdicts.entries()].filter(([, v]) => v.verdict !== "PASS").sort().map(([s, v]) => [s, { rows: v.rows, hits: v.hits, examples: v.examples }]));
const lineTotals = {};
for (const v of verdicts.values()) for (const [k, n] of Object.entries(v.hits)) lineTotals[k] = (lineTotals[k] || 0) + n;`,
 `// Served is read from the bytes and from nothing else: a book whose bin is
// not on this disk is served under no verdict, standing or otherwise.
const stamped = all.filter(([, v]) => v.stamped).map(([s]) => s).sort();
const served = passed.filter((s) => verdicts.has(s) && verdicts.get(s).stamped);
const notStamped = passed.filter((s) => !(verdicts.get(s) || standing.get(s)).stamped);
const refused = Object.fromEntries(all.filter(([, v]) => v.verdict !== "PASS").sort().map(([s, v]) => [s, { rows: v.rows, hits: v.hits, examples: v.examples }]));
const lineTotals = {};
for (const [, v] of all) for (const [k, n] of Object.entries(v.hits)) lineTotals[k] = (lineTotals[k] || 0) + n;`],
[`  \`\${num(verdicts.size)} zones · \${num(judgedNow)} judged now, \${num(fromCache)} from the cache by hash\${unreadable ? \` · \${unreadable} unreadable\` : ""}\`);`,
 `  \`\${num(verdicts.size)} zones · \${num(judgedNow)} judged now, \${num(fromCache)} from the cache by hash\${unreadable ? \` · \${unreadable} unreadable\` : ""}\`);
if (!ONLY) check("L1b a work held off the door keeps the verdict its bytes were last given, and none is held unjudged",
  unjudgedHeld.length === 0 && ![...standing.values()].some((v) => v.verdict === "PASS" && v.stamped),
  unjudgedHeld.length ? \`\${num(unjudgedHeld.length)} held and never judged — \${few(unjudgedHeld)}\`
    : [...standing.entries()].some(([, v]) => v.verdict === "PASS" && v.stamped) ? \`a stamped, passing work is held: \${few([...standing.entries()].filter(([, v]) => v.verdict === "PASS" && v.stamped).map(([s]) => s))} · a served book's bin is published, never held\`
    : \`\${num(standing.size)} held, their verdicts standing unread (\${num([...standing.values()].filter((v) => v.verdict === "PASS").length)} pass, \${num([...standing.values()].filter((v) => v.verdict !== "PASS").length)} refused)\`);`],
[`  zones_on_the_shelf: zones.length,`,
 `  zones_on_the_shelf: zones.length + standing.size,
  read_from_their_bytes_in_this_run: zones.length,
  ...(standing.size ? { standing_unread: { count: standing.size, says: "works whose bin is held off the door (data/zone-store-held-v1.json keeps its seal): the verdict each was given when its bytes were last read stands here and was not read again in this run. A held work is served under no verdict." } } : {}),`],
[`    if (!verdicts.has(name)) continue;           // not a shelf book: a group page, a redirect`,
 `    if (!verdicts.has(name) && !standing.has(name)) continue;   // not a shelf book: a group page, a redirect`],
]);

// ---- the door: an old address answers by what the shelf is today ------------
edit(join(T, "build-front-door-v1.mjs"), [
[`import { isSidecar } from "./zones-on-disk-v1.mjs";`,
 `import { isSidecar, zonesSealed } from "./zones-on-disk-v1.mjs";`],
[`    // the plan's tier can be empty now; a redirect's target is wherever the
    // work actually serves — the fleet shelf, judged by the zone on disk at
    // the work's derived address
    const derived = addressOf(row.to_work_id);
    const target = slugOfWork.get(row.to_work_id)
      || (existsSync(join(ZONES, \`\${derived}.bin\`)) ? derived : null);
    if (!target) throw new Error(\`address history points at \${row.to_work_id}, which nothing publishes — refusing a redirect to nowhere\`);
    const b = books.find((x) => x.slug === target);`,
 `    // the plan's tier can be empty now; a redirect's target is the work at
    // its derived address, wherever it stands: served from the shelf (a zone
    // the gate serves, in ZONE_INFO), or held off the door with its seal
    // kept. A row whose target the shelf's records do not know at all is a
    // redirect to nowhere and stops the build.
    const derived = addressOf(row.to_work_id);
    const target = slugOfWork.get(row.to_work_id)
      || (ZONE_INFO.has(derived) || SEALED_WORKS.has(derived) ? derived : null);
    if (!target) throw new Error(\`address history points at \${row.to_work_id}, which nothing publishes — refusing a redirect to nowhere\`);
    // SERVED IS SERVED, WHICHEVER TIER SERVES IT. Until 10 November 2026 this
    // looked for the target in the plan's tier alone, which has been empty
    // since the fleet shelf took over: a work served from the shelf was not
    // found, and its old address said "the work behind it is not being
    // served" over a book a reader could open one address away.
    const b = books.find((x) => x.slug === target)
      || (ZONE_INFO.has(target) ? { slug: target, disp: ZONE_INFO.get(target).workEn } : null);`],
[`const HISTORY = arg("history", "data/address-history-v1.json");
if (existsSync(HISTORY)) {`,
 `const HISTORY = arg("history", "data/address-history-v1.json");
const SEALED_WORKS = new Set(zonesSealed(ZONES));
if (existsSync(HISTORY)) {`],
]);

// ---- three tools that read the record's one map ------------------------------
edit(join(T, "restore-shelf-from-history-v1.mjs"), [
[`const pins = JSON.parse(readFileSync(RECORD, "utf8")).pins || {};`,
 `// every seal the shelf keeps: the bins the door publishes (the store record)
// and the bins held off it (the held record beside it)
const HELD_RECORD = join(dirname(RECORD), "zone-store-held-v1.json");
const pins = { ...(existsSync(HELD_RECORD) ? (JSON.parse(readFileSync(HELD_RECORD, "utf8")).pins || {}) : {}), ...(JSON.parse(readFileSync(RECORD, "utf8")).pins || {}) };`],
]);
edit(join(T, "emit-zone-shipment-v1.mjs"), [
[`const repo = String(store.repository || "").replace(/^https:\\/\\/github\\.com\\//, "");
if (repo) { const [owner, name] = repo.split("/"); if (owner && name && name.toLowerCase() === \`\${owner.toLowerCase()}.github.io\`) ORIGINS.push(\`https://\${name.toLowerCase()}\`); }
`, ``],
[`  // the site's own names, read from the CNAME beside the door and the
  // repository the store record derives, never typed`,
 `  // the site's own names, read from the CNAME beside the door, never typed
  // (the store record names no repository since 31 October 2026)`],
]);
