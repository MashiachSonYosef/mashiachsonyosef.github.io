#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It prints where each source file of the place answers is
// fetched from and what its bytes must be; it fetches nothing and writes
// nothing.
//
// FROM NOTHING (the second cut, 27 November 2026). The place answers are made
// from a folder of the sources' own files (tools/make-place-answers-v1.sh).
// This says how such a folder is filled again: for every file the build
// reads, one line of
//
//   fetch <TAB> path in the folder <TAB> sha256 <TAB> bytes <TAB> the public address
//   given <TAB> path in the folder <TAB> sha256 <TAB> bytes <TAB> the file's name <TAB> why it cannot be fetched
//
// What stands where in the folder, and each source's revision, is read from
// the map the last build was made with (data/place-answers-v1/sources.json,
// which the one command keeps beside the pins). What each file's bytes must
// be is read from the two parts' pins. Where a file stands inside its
// provider's repository is the one thing no pin says; it is the table below.
// A file is "given" where no public address this machine reaches serves it:
// the two record files of the corpus lane (the Hebrew Wikisource edition of
// Strong's, and unfoldingWord's lexicon) and the one Wikisource page.
//
// Run: node tools/say-place-answers-fetch-plan-v1.mjs [--dir data/place-answers-v1]
import { readFileSync, existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
let DIR = join(HERE, "..", "data", "place-answers-v1");
for (let i = 0; i < argv.length; i += 1) { if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else { console.error("usage: say-place-answers-fetch-plan-v1.mjs [--dir <place answers folder>]"); process.exit(2); } }
for (const need of ["sources.json", "places/PIN.json", "entries/PIN.json"]) if (!existsSync(join(DIR, need))) { console.error(`${join(DIR, need)} is not there: the plan is read from the map and the pins of a build`); process.exit(3); }
const map = JSON.parse(readFileSync(join(DIR, "sources.json"), "utf8"));
const pp = JSON.parse(readFileSync(join(DIR, "places", "PIN.json"), "utf8")), pe = JSON.parse(readFileSync(join(DIR, "entries", "PIN.json"), "utf8"));

// what each file's bytes must be, by the source it is pinned under and its name (two sources each have a README.md):
// from the places' pin (STEP's four files, MACULA's table) and the entries' pin
const pinned = new Map();
for (const k of ["step_tahot", "macula_hebrew"]) for (const f of pp.sources[k].files) pinned.set(`${k}/${f.name}`, { bytes: f.bytes, sha256: f.sha256 });
for (const [k, s] of Object.entries(pe.sources)) for (const f of s.files || []) if (f.file && f.sha256) pinned.set(`${k}/${f.file}`, { bytes: f.bytes, sha256: f.sha256 });
if (pe.ubs_earlier_version) pinned.set(`ubs_earlier_version/${pe.ubs_earlier_version.file}`, { bytes: pe.ubs_earlier_version.bytes, sha256: pe.ubs_earlier_version.sha256 });

const whole = (s) => { const m = /[0-9a-f]{40}/u.exec(String(s || "")); if (!m) throw new Error(`no whole revision in: ${s}`); return m[0]; };
const enc = (path) => path.split("/").map((x) => encodeURIComponent(x)).join("/");
const RAW = "https://raw.githubusercontent.com";
const out = [];
const want = (rel, keys) => { for (const k of keys) { const p = pinned.get(`${k}/${basename(rel)}`); if (p) return p; } throw new Error(`no pin of ${keys.join(", ")} names ${basename(rel)}`); };
const served = (rel, keys, url) => { const p = want(rel, keys); out.push(["fetch", rel, p.sha256, p.bytes, url]); };
const given = (rel, keys, why) => { const p = want(rel, keys); out.push(["given", rel, p.sha256, p.bytes, basename(rel), why]); };

// STEP: the four word-by-word files and the brief lexicon; our names write the provider's blanks as underscores
{ const rev = whole(map.step.revision_whole);
  for (const key of pinned.keys()) {
    const name = key.slice(key.indexOf("/") + 1); if (!key.startsWith("step_tahot/") && !key.startsWith("stepbible_tbesh_gloss/")) continue;
    const folder = name.startsWith("TAHOT_") ? "Translators Amalgamated OT+NT" : name.startsWith("TBESH_") ? "Lexicons" : null; if (!folder) continue;
    served(`${map.step.dir}/${name}`, ["step_tahot", "stepbible_tbesh_gloss"], `${RAW}/STEPBible/STEPBible-Data/${rev}/${enc(`${folder}/${name.replace(/_/gu, " ")}`)}`);
  } }
// MACULA's table (large file storage)
served(map.macula.tsv, ["macula_hebrew"], `https://media.githubusercontent.com/media/Clear-Bible/macula-hebrew/${whole(map.macula.revision_whole)}/WLC/tsv/${basename(map.macula.tsv)}`);
// the Open Scriptures Hebrew Lexicon: the three files read, and the two the builder pins beside them
{ const rev = whole(map.open_scriptures.facts.revision); for (const n of ["HebrewStrong.xml", "BrownDriverBriggs.xml", "LexicalIndex.xml", "BdbSchema.xsd", "readme.md"]) served(`${map.open_scriptures.dir}/${n}`, ["openscriptures_strongs", "openscriptures_bdb_1906", "openscriptures_lexical_index"], `${RAW}/openscriptures/HebrewLexicon/${rev}/${n}`); }
// the unabridged BDB: the zip and its README
{ const rev = whole(map.unabridged_bdb.facts.revision); for (const rel of [map.unabridged_bdb.zip, map.unabridged_bdb.readme].filter(Boolean)) served(rel, ["unabridged_bdb_1906"], `${RAW}/eliranwong/unabridged-BDB-Hebrew-lexicon/${rev}/${basename(rel)}`); }
// the UBS dictionary: the JSON, the folder's README and LICENSE, and the earlier JSON read only to count what changed
{ const rev = whole(map.ubs.facts.revision); const base = `${RAW}/ubsicap/ubs-open-license/${rev}/dictionaries/hebrew`;
  served(map.ubs.json, ["ubs_sdbh_hebrew_v0_9_2"], `${base}/JSON/${basename(map.ubs.json)}`);
  for (const x of map.ubs.also || []) served(x.path, ["ubs_sdbh_hebrew_v0_9_2"], `${base}/${basename(x.path)}`);
  if (map.ubs.earlier_json) served(map.ubs.earlier_json, ["ubs_earlier_version"], `${RAW}/ubsicap/ubs-open-license/${whole(map.ubs.earlier_facts.revision)}/dictionaries/hebrew/JSON/${basename(map.ubs.earlier_json)}`); }
// what no public address this machine reaches serves
given(map.wikisource.records, ["wikisource_strongs_explicit_forms"], "the corpus lane's record of the Hebrew Wikisource edition of Strong's; the edition's site is not reachable from this machine");
for (const p of map.wikisource.pages || []) given(p.path, ["wikisource_strongs_explicit_forms"], "a page of the Hebrew Wikisource edition as the corpus lane fetched it; the site is not reachable from this machine");
given(map.uhal.records, ["unfoldingword_uhal"], "the corpus lane's record of unfoldingWord's lexicon; the provider's host refuses this machine");
for (const line of out) console.log(line.join("\t"));
