# usage: h2-spoil.py <module> <law>   spoils the place card's module for one law (the caller keeps the clean copy)
import sys, pathlib
SPOILS = {
  "P8":  ('const languageOf = (rec) => String((rec && rec.language) || "")', 'const languageOf = (rec) => String("BIBLICAL HEBREW" || (rec && rec.language) || "")'),
  "P10": ('b[14] ? el("span", "gap", " †") : ""', '""'),
  "P11": ("(${b[15].another}.${g}); STEP's number ${b[9]} is BDB's ${b[15].entry}.", "(${b[15].entry}.${g}); STEP's number ${b[9]} is BDB's ${b[15].another}."),
  "P12": ('if (b[12]) return `${b[10]}, before its numbered senses`;', 'if (b[12]) return b[10];'),
  "P13": ('if (h.b.some((b) => b[13])) row.append', 'if (h.b.some((b) => b[13] && b[14])) row.append'),
  "P14": ('const key = (b) => JSON.stringify(b.slice(0, 13));', 'const key = (b) => JSON.stringify(b.slice(0, 1));'),
  "P15": ('const said = rowLg ? "STEP\'s row at this word says" : "STEP\'s lexicon says";', 'const said = "STEP\'s lexicon says";'),
  "P16": ('if (key === "openscriptures_strongs") return e.meaning ? (e.meaning.defs || []).map((d) => e.meaning.t.slice(d[0], d[0] + d[1])) : [];', 'if (key === "openscriptures_strongs") return (e.meaning ? (e.meaning.defs || []).map((d) => e.meaning.t.slice(d[0], d[0] + d[1])) : []).concat(((e.usage || {}).renderings || []).map((r) => r.t));'),
  "P17": ('add(m[i][1], "macula", `MACULA at this word, part ${i + 1} of ${m.length}`);', 'add(m[i][1], "macula", "");'),
  "P18": ('if (key === "unfoldingword_uhal") return (e.senses || []).flatMap((x) => (x.glosses || []).map((g) => g.t));', 'if (key === "unfoldingword_uhal") return [];'),
  "P19": ('if (line) for (const key of INDEX.dictionaries) for (const id of recordsShown(key, line, e.f)) {', 'if (line) for (const key of INDEX.dictionaries) for (const id of (key === "unfoldingword_uhal" && (line.b[key] || [])[0] === "W" ? Object.keys((F.entries || {})[key] || {}).slice(0, 1) : recordsShown(key, line, e.f))) {'),
  "P20": ('`${SRC[key][0]} ${id}, under ${tag}`, false, key === "ubs_sdbh_hebrew_v0_9_2" && coll.has(tidy(txt)));', '`${SRC[key][0]} ${id}, under ${tag}`, false, false);'),
}
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8"); old, new = SPOILS[sys.argv[2]]
assert s.count(old) == 1, (sys.argv[2], s.count(old)); p.write_text(s.replace(old, new), encoding="utf-8")
print(f"spoiled for {sys.argv[2]}: «{old[:70]}» → «{new[:70]}»")
