#!/usr/bin/env node
// GUARDS: fixture-rule-v1-a-real-zone-with-its-own-commentary-hung-at-words
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A fixture zone is a test instrument. The maker that declares this rule,
// tools/make-fixture-zone-v1.mjs, says what one is in its own words:
//
//   "A test instrument, never served and never deployed."
//
//   "Nothing is invented. Every entry it hangs is an entry that unit already
//    carries, copied verbatim with its work, its reference, its licence basis
//    and its text; only the position it is attached at is new, and that
//    position is declared in the file. It exists so a check can press
//    something."
//
// Two things follow, and this check holds both.
//
// The first is about the shelf. The maker writes its output INTO data/zones,
// beside the works, and the door lists the shelf by reading that directory.
// The door's exclusion is by filename prefix. So the only thing standing
// between an instrument and the front page is a filename, and a filename is
// the kind of thing that drifts. A fixture on the shelf would be served under
// a licence identity it does not have, with a body that is a real work's
// text hung in a way no record supports. That is the leak this check exists
// to see.
//
// The second is about the instrument itself. It is allowed to exist only
// because it invents nothing: the base is the source zone as it is, and every
// entry it hangs at a word is one the source sidecar already carries, byte
// for byte, at positions the file itself declares. An instrument that drifts
// from its source is an instrument carrying text nobody serves, and a check
// pressing it is pressing something that is not the site.
//
//   L1  the maker still declares what it writes: the output names, the
//       positions, the name suffix and the rule id are read out of the
//       maker's own source, so nothing here is typed twice
//   L2  no fixture output stands among the served zones, by name and by
//       content: nothing the door would list names itself a fixture, carries
//       the fixture stamp, or is the reader's own instrument marker
//   L3  no fixture output is deployed under deploy-root: no address is a
//       fixture's, no emitted page points at one, the counts receipt pins none
//   L4  no fixture output is deployed at the publication root
//   L5  a fixture on this disk declares itself: the rule id, the source it
//       was made from, the positions it hung at, and the name suffix
//   L6  the fixture's source is on this disk, both the zone and its sidecar
//   L7  the base fixture is its source byte for byte, apart from its name
//   L8  every entry hung at a word is one the source sidecar carries byte for
//       byte, and nothing the source carries was altered or dropped
//   L9  the positions are the declared ones and the counts declared are the
//       counts found
//
// L5 to L9 need a fixture to judge. When none is on the disk they are
// reported as SKIPPED in their place and the run's verdict is L1 to L4, which
// judged the real shelf. When a fixture is here and its source is not, that
// is a failure and not a skip: an instrument that outlived its source cannot
// be shown to invent nothing.
//
// What this check does NOT prove: that the reader refuses to render a fixture
// when somebody types its address by hand. That gate is in zone.html and keys
// on a schema marker; this check is about what is listed and deployed, not
// about what a hand-typed URL can reach. It also does not prove the in-line
// handle behaviour the fixture exists for; that is check-commentary-in-line's
// question and needs a browser.
//
// Run: node tools/check-fixture-never-served-v1.mjs [--zones data/zones]
//                                                   [--maker tools/make-fixture-zone-v1.mjs]
//                                                   [--out deploy-root]
//                                                   [--root ..]
//                                                   [--receipt deploy-root/front-door-counts-receipt-v1.json]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const MAKER = arg("maker", join(HERE, "make-fixture-zone-v1.mjs"));
const OUT = arg("out", join(K3, "deploy-root"));
const ROOT = arg("root", join(K3, ".."));
const RECEIPT = arg("receipt", join(K3, "deploy-root", "front-door-counts-receipt-v1.json"));

const RULE = "fixture-rule-v1-a-real-zone-with-its-own-commentary-hung-at-words";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const slugOf = (f) => basename(String(f)).replace(/\.bin$/, "");
const few = (xs, n = 3) => xs.filter(Boolean).slice(0, n).join(" · ");

if (!existsSync(MAKER)) { console.log(`SKIPPED — no fixture maker at ${MAKER}, so the rule this check guards is not declared on this disk`); process.exit(3); }
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
if (!existsSync(OUT)) { console.log(`SKIPPED — no deploy root at ${OUT}, so nothing deployed can be looked at`); process.exit(3); }
// A shelf with nothing on it serves no fixture the way it serves no work. That
// is not a pass; it is nothing to judge.
if (!readdirSync(ZONES).some((f) => f.endsWith(".bin"))) { console.log(`SKIPPED — no zones on this disk at ${ZONES}`); process.exit(3); }

// ── L1 · what the maker says it writes ───────────────────────────────────
// Read out of the maker rather than typed here: the output names, the
// positions, the suffix the base is renamed with, and the rule id it stamps.
// A check that carried its own copies would agree with the maker only until
// the maker changed.
const makerSrc = readFileSync(MAKER, "utf8");
const outputs = [...makerSrc.matchAll(/save\(join\(ZONES,\s*"([^"]+)"\)/g)].map((m) => m[1]);
const atMatch = makerSrc.match(/const AT = \[([^\]]*)\]/);
const makerAt = atMatch ? atMatch[1].split(",").map((x) => Number(x.trim())).filter((x) => Number.isInteger(x)) : [];
const suffixMatch = makerSrc.match(/base\.work = `\$\{base\.work\}([^`]+)`/);
const suffix = suffixMatch ? suffixMatch[1] : "";
const stampMatch = makerSrc.match(/rule_id:\s*"([^"]+)"/);
const makerRule = stampMatch ? stampMatch[1] : "";
const baseName = outputs.find((o) => !o.endsWith(".commentary.bin")) || null;
const comName = outputs.find((o) => o.endsWith(".commentary.bin")) || null;
check("L1  the maker still declares what it writes",
  !!baseName && !!comName && makerAt.length > 0 && !!suffix && makerRule === RULE,
  !baseName || !comName
    ? `could not read two output names out of ${basename(MAKER)} — found ${JSON.stringify(outputs)}`
    : !makerAt.length ? "could not read the positions it hangs at"
      : !suffix ? "could not read the suffix it renames the base with"
        : makerRule !== RULE ? `it stamps ${JSON.stringify(makerRule)}, not the rule this check guards`
          : `${baseName} + ${comName} · hung at ${makerAt.join(", ")} · base renamed with ${JSON.stringify(suffix)}`);
// The slugs a fixture output answers to. The tree's wider convention is that
// an instrument's slug begins with the word, and that convention is held too:
// a slug that says it is a fixture is not a work whatever made it.
const outputSlugs = new Set(outputs.map(slugOf));
const isFixtureSlug = (s) => outputSlugs.has(s) || /^fixture(-|$)/.test(String(s));

// ── L2 · the shelf, enumerated the way the door enumerates it ─────────────
// The door reads data/zones and lists every .bin that is not a sidecar and
// does not begin with "fixture-". That filter is quoted here, not improved:
// the question is what the door WOULD list, and improving the filter in a
// check would answer a different question.
const shelf = readdirSync(ZONES)
  .filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-") && !x.endsWith(".commentary.bin"))
  .sort();
const byName = shelf.map(slugOf).filter(isFixtureSlug);
const byContent = [];
let zonesRead = 0, sidecarsRead = 0;
for (const f of shelf) {
  let z;
  try { z = load(join(ZONES, f)); } catch { continue; }
  zonesRead += 1;
  const slug = slugOf(f);
  const work = String(z.work || "");
  if (suffix && work.endsWith(suffix)) byContent.push(`${slug} names itself ${JSON.stringify(work)}`);
  else if (z.fixture && typeof z.fixture === "object") byContent.push(`${slug} carries a fixture stamp`);
  else if (String(z.schema_version || "").includes("FIXTURE")) byContent.push(`${slug} is marked ${z.schema_version}`);
  // the sidecar the reader would load beside this work
  const side = join(ZONES, `${slug}.commentary.bin`);
  if (existsSync(side)) {
    try {
      const c = load(side);
      sidecarsRead += 1;
      if (c.fixture && typeof c.fixture === "object") byContent.push(`${slug}'s sidecar carries a fixture stamp`);
    } catch { /* an unreadable sidecar is another check's finding */ }
  }
}
check("L2  no fixture output stands among the served zones",
  byName.length === 0 && byContent.length === 0,
  byName.length || byContent.length
    ? `${byName.length + byContent.length} on the shelf — ${few([...byName.map((s) => `${s} listed by name`), ...byContent])}`
    : `${zonesRead} zones and ${sidecarsRead} sidecars read, none is an instrument`);

// ── L3 · what is deployed ─────────────────────────────────────────────────
// Every address the door emitted, walked rather than named, and every page
// searched for a link that names a fixture. The counts receipt is the door's
// own pinned list of what it rendered, and it is read as well.
const addrRefs = (html) => [...String(html).matchAll(/[?&]b=([^"'&#\s<]+)/g)].map((m) => { try { return decodeURIComponent(m[1]); } catch { return m[1]; } });
const deployedWalk = (dir, skip = new Set()) => {
  const dirs = [], links = [];
  let pages = 0;
  if (existsSync(join(dir, "index.html"))) {
    pages += 1;
    for (const s of addrRefs(readFileSync(join(dir, "index.html"), "utf8"))) if (isFixtureSlug(s)) links.push(`the door links ?b=${s}`);
  }
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith(".") || skip.has(d.name)) continue;
    if (isFixtureSlug(d.name)) dirs.push(`${d.name}/ is an address`);
    const f = join(dir, d.name, "index.html");
    if (!existsSync(f)) continue;
    pages += 1;
    for (const s of addrRefs(readFileSync(f, "utf8"))) if (isFixtureSlug(s)) links.push(`${d.name}/ links ?b=${s}`);
  }
  return { dirs, links, pages };
};
const dr = deployedWalk(OUT);
const pinned = [];
let pinnedCount = null;
if (existsSync(RECEIPT)) {
  try {
    const r = JSON.parse(readFileSync(RECEIPT, "utf8"));
    const zs = ((r.rendered || {}).zones) || [];
    pinnedCount = zs.length;
    for (const z of zs) if (isFixtureSlug(slugOf(z.path || ""))) pinned.push(`the receipt pins ${z.path}`);
  } catch { pinned.push("the receipt could not be read"); }
}
const drBad = [...dr.dirs, ...dr.links, ...pinned];
check("L3  no fixture output is deployed under deploy-root",
  drBad.length === 0,
  drBad.length ? `${drBad.length} — ${few(drBad)}`
    : `${dr.pages} pages walked, ${pinnedCount === null ? "no receipt here" : `${pinnedCount} zones pinned by the receipt`}, none is an instrument`);

// ── L4 · the publication itself ───────────────────────────────────────────
// The repository root carries the same door and the same address pages, and
// is what is actually served. It is not on every disk this runs on.
if (existsSync(ROOT) && existsSync(join(ROOT, "index.html"))) {
  const rt = deployedWalk(ROOT, new Set([basename(K3)]));
  const rtBad = [...rt.dirs, ...rt.links];
  check("L4  no fixture output is deployed at the publication root",
    rtBad.length === 0,
    rtBad.length ? `${rtBad.length} — ${few(rtBad)}` : `${rt.pages} pages walked, none is an instrument`);
} else {
  console.log(`  --  L4 not judged: no publication at ${ROOT}`);
}

// ── the fixture, if one is here ───────────────────────────────────────────
const basePath = baseName ? join(ZONES, baseName) : null;
const comPath = comName ? join(ZONES, comName) : null;
const haveBase = !!basePath && existsSync(basePath);
const haveCom = !!comPath && existsSync(comPath);

console.log(`\n— ${zonesRead} zones on the shelf · fixture on disk: ${haveBase || haveCom ? [haveBase && baseName, haveCom && comName].filter(Boolean).join(" + ") : "none"} —`);

if (!haveBase && !haveCom) {
  console.log(`\nSKIPPED (L5 to L9) — no fixture on this disk: neither ${baseName || "?"} nor ${comName || "?"} is in ${ZONES},`);
  console.log("  so the verbatim half went unjudged. The shelf half above judged the real tree.");
} else {
  // L5 — it declares itself. Half a fixture is not a fixture.
  const com = haveCom ? load(comPath) : null;
  const base = haveBase ? load(basePath) : null;
  const decl = (com && com.fixture && typeof com.fixture === "object") ? com.fixture : null;
  const declAt = decl && Array.isArray(decl.hung_at_word_positions)
    ? decl.hung_at_word_positions.filter((x) => Number.isInteger(x)) : [];
  const sameAt = declAt.length > 0 && declAt.length === makerAt.length && declAt.every((x, i) => x === makerAt[i]);
  const madeFrom = decl ? String(decl.made_from || "") : "";
  const baseWork = base ? String(base.work || "") : "";
  const l5 = haveBase && haveCom && !!decl && decl.rule_id === RULE && madeFrom.endsWith(".commentary.bin")
    && sameAt && !!decl.never_served && !!suffix && baseWork.endsWith(suffix);
  check("L5  the fixture declares itself",
    l5,
    !haveBase || !haveCom ? `only ${haveBase ? baseName : comName} is here — a fixture is two files or none`
      : !decl ? `${comName} carries no fixture stamp`
        : decl.rule_id !== RULE ? `stamped ${JSON.stringify(decl.rule_id)}, not this rule`
          : !madeFrom.endsWith(".commentary.bin") ? `made_from ${JSON.stringify(madeFrom)} names no sidecar`
            : !sameAt ? `declares positions ${JSON.stringify(decl.hung_at_word_positions)}, the maker hangs at ${JSON.stringify(makerAt)}`
              : !decl.never_served ? "does not say it is never served"
                : !baseWork.endsWith(suffix) ? `the base is named ${JSON.stringify(baseWork)}, without ${JSON.stringify(suffix)}`
                  : `made from ${madeFrom} · hung at ${declAt.join(", ")} · ${JSON.stringify(baseWork)}`);

  // L6 — the source is here. A fixture and its source live in one directory
  // by the maker's construction, so the source is looked for beside it.
  const srcComPath = madeFrom ? join(ZONES, basename(madeFrom)) : null;
  const srcBasePath = srcComPath ? srcComPath.replace(/-commentary\.bin$/, ".bin") : null;
  const haveSrc = !!srcComPath && existsSync(srcComPath) && existsSync(srcBasePath);
  check("L6  the fixture's source is on this disk",
    haveSrc,
    haveSrc ? `${basename(srcBasePath)} + ${basename(srcComPath)}`
      : !srcComPath ? "no source is named, so none can be looked for"
        : `${[!existsSync(srcBasePath) && basename(srcBasePath), !existsSync(srcComPath) && basename(srcComPath)].filter(Boolean).join(" and ")} not in ${ZONES} — an instrument that outlived its source`);

  if (!haveSrc || !base || !com) {
    console.log("  --  L7, L8, L9 not judged: nothing to hold the fixture against");
  } else {
    const srcBase = load(srcBasePath);
    const srcCom = load(srcComPath);

    // L7 — the base is the source, renamed and nothing else.
    const strip = (z) => JSON.stringify({ ...z, work: undefined });
    const baseSame = strip(base) === strip(srcBase);
    const nameSame = baseWork === `${String(srcBase.work || "")}${suffix}`;
    check("L7  the base fixture is its source byte for byte, apart from its name",
      baseSame && nameSame,
      !baseSame ? `the body differs from ${basename(srcBasePath)} — the source moved under the instrument, or the instrument was edited`
        : !nameSame ? `named ${JSON.stringify(baseWork)}, the source is ${JSON.stringify(srcBase.work)}`
          : `${(srcBase.sections || []).length} sections identical, renamed ${JSON.stringify(baseWork)}`);

    // L8 — every hung entry is carried by the source, byte for byte, and the
    // source's own entries survive untouched.
    //
    // The maker hangs a unit's own section entries at the declared positions,
    // and at the first declared position also the neighbouring unit's first
    // entry, so that one word carries two units. That second hang is the
    // stated fiction the maker declares in its own file, and it is allowed at
    // the first position only.
    const units = com.units || {}, srcUnits = srcCom.units || {};
    const globalSet = new Set();
    for (const u of Object.values(srcUnits)) for (const e of u.section || []) globalSet.add(JSON.stringify(e));
    const notCarried = [], altered = [], offPosition = [];
    let hung = 0, doubled = 0, touched = 0, own = 0;
    const idsA = Object.keys(units).sort(), idsB = Object.keys(srcUnits).sort();
    if (JSON.stringify(idsA) !== JSON.stringify(idsB)) altered.push(`the unit list differs: ${idsA.length} here, ${idsB.length} in the source`);
    for (const id of idsA) {
      const fu = units[id], su = srcUnits[id];
      if (!su) continue;
      if (JSON.stringify(fu.section || []) !== JSON.stringify(su.section || [])) altered.push(`${id}: the section list was altered`);
      const ownSet = new Set((su.section || []).map((e) => JSON.stringify(e)));
      let touchedHere = false;
      for (const pos of Object.keys(fu.words || {})) {
        const fList = fu.words[pos] || [], sList = ((su.words || {})[pos]) || [];
        if (JSON.stringify(fList.slice(0, sList.length)) !== JSON.stringify(sList)) altered.push(`${id} word ${pos}: the source's own entries were altered`);
        const extra = fList.slice(sList.length);
        if (!extra.length) continue;
        touchedHere = true;
        hung += extra.length;
        const p = Number(pos);
        if (!declAt.includes(p)) offPosition.push(`${id} word ${pos}`);
        for (const e of extra) {
          const js = JSON.stringify(e);
          if (ownSet.has(js)) own += 1;
          else if (globalSet.has(js)) { doubled += 1; if (p !== declAt[0]) offPosition.push(`${id} word ${pos}: another unit's entry away from the first position`); }
          else notCarried.push(`${id} word ${pos}: ${JSON.stringify(e.ref || e.text || "").slice(0, 40)}`);
        }
      }
      // the source's own word entries, if any, must all still be there
      for (const pos of Object.keys(su.words || {})) if (!(fu.words || {})[pos]) altered.push(`${id} word ${pos}: the source's entries were dropped`);
      if (touchedHere) touched += 1;
    }
    const rest = (c) => JSON.stringify({ ...c, units: undefined, fixture: undefined });
    if (rest(com) !== rest(srcCom)) altered.push("the sidecar differs from its source outside the units");
    check("L8  every entry hung is one the source carries byte for byte, and nothing the source carries was altered",
      notCarried.length === 0 && altered.length === 0,
      notCarried.length || altered.length
        ? `${notCarried.length} not carried, ${altered.length} altered — ${few([...notCarried, ...altered])}`
        : `${hung.toLocaleString()} hung: ${own.toLocaleString()} from the unit's own section, ${doubled.toLocaleString()} from a neighbour's, across ${touched.toLocaleString()} units`);

    // L9 — positions and counts are the declared ones.
    const countsSame = decl && decl.entries_hung === hung && decl.units_touched === touched && decl.words_carrying_two_units === doubled;
    check("L9  the positions are the declared ones and the counts declared are the counts found",
      offPosition.length === 0 && !!countsSame,
      offPosition.length ? `${offPosition.length} at undeclared positions — ${few(offPosition)}`
        : !countsSame ? `declared ${decl ? `${decl.entries_hung} hung / ${decl.units_touched} units / ${decl.words_carrying_two_units} doubled` : "nothing"}, found ${hung} / ${touched} / ${doubled}`
          : `every hang is at ${declAt.join(", ")} · ${hung} hung / ${touched} units / ${doubled} doubled, as declared`);
  }
}

console.log("\n  what this does not say: that the reader refuses a fixture whose address is");
console.log("  typed by hand; that gate is in zone.html and keys on a schema marker. It says");
console.log("  that nothing the door lists or deploys is an instrument, and that an instrument");
console.log("  on this disk invents nothing beyond the positions it declares.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
