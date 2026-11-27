// Plants: change one thing in a copy of the output and see the check fail on it.
import { readGzJson, writeGzJson } from "../s15/reader/tools/place-answers-entries-lib-v1.mjs";
const dir = process.argv[2], which = process.argv[3];
const E = (k) => dir + "/entries/" + k + ".json.gz", B = (k) => dir + "/bridges/" + k + ".json.gz";
if (which === "rendering") { const f = readGzJson(E("openscriptures_strongs")); f.entries.H1961.usage.renderings[0].t = "bacon"; writeGzJson(E("openscriptures_strongs"), f); }
if (which === "bdb-def") { const f = readGzJson(E("openscriptures_bdb_1906")); f.entries["p.ff.ab"].defs[0].joined.whole = "(sun)sets"; writeGzJson(E("openscriptures_bdb_1906"), f); }
if (which === "bdb-tree") { const f = readGzJson(E("openscriptures_bdb_1906")); f.entries["p.ff.ab"].x[2][0][2][0] += "ְ"; writeGzJson(E("openscriptures_bdb_1906"), f); }
if (which === "tbesh") { const f = readGzJson(E("stepbible_tbesh_gloss")); f.entries.H1254A.Gloss = "to make"; writeGzJson(E("stepbible_tbesh_gloss"), f); }
if (which === "ubs") { const f = readGzJson(E("ubs_sdbh_hebrew_v0_9_2")); const e = Object.values(f.entries)[100]; e.BaseForms[0].LEXMeanings[0].LEXSenses[0].Glosses[0] += "s"; writeGzJson(E("ubs_sdbh_hebrew_v0_9_2"), f); }
if (which === "unabridged") { const f = readGzJson(E("unabridged_bdb_1906")); const e = f.entries.BDB5808; e.k[57][1] = "as far as"; writeGzJson(E("unabridged_bdb_1906"), f); }
if (which === "wikisource") { const f = readGzJson(E("wikisource_strongs_explicit_forms")); f.entries.H68.form_lines[0].verses[0] += " "; writeGzJson(E("wikisource_strongs_explicit_forms"), f); }
if (which === "bridge") { const f = readGzJson(B("step-tag-to-entry")); f.tags.H1254A.openscriptures_bdb_1906 = ["E", "b.cx.aa"]; writeGzJson(B("step-tag-to-entry"), f); }
if (which === "bridge-count") { const f = readGzJson(B("step-tag-to-entry")); f.tags.H1961.n[0] += 1; writeGzJson(B("step-tag-to-entry"), f); }
if (which === "verse") { const f = readGzJson(B("verse-to-sense-ubs_sdbh_hebrew_v0_9_2")); f.verses.genesis["1:1"][0][0] = "003347004001000"; writeGzJson(B("verse-to-sense-ubs_sdbh_hebrew_v0_9_2"), f); }
