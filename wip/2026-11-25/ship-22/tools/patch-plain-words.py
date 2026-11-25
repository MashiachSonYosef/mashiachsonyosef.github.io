# Plain words (the owner, 25 November 2026): what is bitter or sour on the page, replaced or deleted. Exact replacements, each counted.
import sys, pathlib
R = pathlib.Path(sys.argv[1])
def sub(path, old, new, n):
    p = R / path; s = p.read_text(encoding="utf-8"); c = s.count(old)
    assert c == n, (path, old[:60], c, n)
    p.write_text(s.replace(old, new), encoding="utf-8")
Z, D = "zone.html", "tools/build-front-door-v1.mjs"
# 1 bitter: force
sub(Z, "commonly force read as", "commonly read as", 5)
sub(D, "commonly force read as", "commonly read as", 9)
sub("tools/check-clean-address-v1.mjs", "commonly force read as", "commonly read as", 3)
sub("tools/check-door-word-card-v1.mjs", "commonly force read as", "commonly read as", 1)
# 3 sour: the zone
sub(Z, '<p id="meta">Loading the zone…</p>', '<p id="meta">Loading…</p>', 1)
# 6 sour: routes
sub(Z, 'label.append("Exact selectable routes");', 'label.append("Readings");', 1)
sub(D, '<p class="r-label">Exact selectable routes</p>', '<p class="r-label">Readings</p>', 1)
sub("tools/check-kq-declared-weld-v1.mjs", "/Exact selectable routes/", "/^Readings$/", 1)
# 7 sour: at rest
sub(Z, "textContent: !held ? `${shown} shut at rest, shown \\u00b7 hide` : short ? `${held} shut at rest \\u00b7 show` : `${said} \\u00b7 show` });",
       "textContent: !held ? `${shown} off by default, shown \\u00b7 hide` : short ? `${held} off by default \\u00b7 show` : `${said} \\u00b7 show` });", 1)
sub(Z, '"dictionaries shut at rest"', '"dictionaries off by default"', 2)
sub(Z, "reading${nK === 1 ? \"\" : \"s\"} shut at rest: ", "reading${nK === 1 ? \"\" : \"s\"} off by default: ", 1)
sub(Z, ": `shut at rest, ${e.say}", ": `off by default, ${e.say}", 1)
sub(Z, "more rest shut, on the cards a press away (Shut at rest, inside)", "more are off by default, a press away on the cards (Off by default, inside)", 1)
sub(Z, "Shut at rest", "Off by default", 2)
sub("tools/check-overlays-v1.mjs", "«Shut at rest»", "«Off by default»", 1)
sub("tools/check-source-switch-v1.mjs", "«Shut at rest", "«Off by default", 2)
# 8 sour: witnesses
sub(Z, "`the same record, carried by ${alsoCarry.length} more witness${alsoCarry.length === 1 ? \"\" : \"es\"} of this reading`",
       "`also given by ${alsoCarry.length} more source${alsoCarry.length === 1 ? \"\" : \"s\"}`", 1)
sub(D, '"the same record, carried by " + also.length + " more source"', '"also given by " + also.length + " more source"', 1)
# 9 sour: the corpus lane
sub(Z, "held at this place — the corpus lane reads the word here as another word written alike", "held at this place: read here as another word spelled the same", 1)
sub(Z, "held at this place: the corpus lane reads the word here as another word written alike", "held at this place: read here as another word spelled the same", 1)
# 10 sour, deleted: no year, no words
sub(Z, '` : " \\u00b7 wording year not supplied"}`', '` : ""}`', 1)
sub(Z, 'att.append(`${m.label} · ${hasYear(year) ? `wording ${yearSaid(mId, year)}` : "wording year not supplied"} `);',
       'att.append(`${m.label}${hasYear(year) ? ` · wording ${yearSaid(mId, year)}` : ""} `);', 1)
sub(Z, 'b.append(`${m.label.split(/[,(]/)[0].trim()} · ${hasYear(row[4]) ? `wording ${yearSaid(row[3], row[4])}` : "no wording year"}`);',
       'b.append(`${m.label.split(/[,(]/)[0].trim()}${hasYear(row[4]) ? ` · wording ${yearSaid(row[3], row[4])}` : ""}`);', 1)
sub(Z, 'textContent: `${m.label} · ${hasYear(x.row[4]) ? yearSaid(x.row[3], x.row[4]) : "no wording year"}${says}`',
       'textContent: `${m.label}${hasYear(x.row[4]) ? ` · ${yearSaid(x.row[3], x.row[4])}` : ""}${says}`', 1)
sub(D, 'btn.append((mj.label || rows[j][3]) + " · " + (rows[j][4] && rows[j][4] !== "S_NO_SOURCE_YEAR" ? "wording " + rows[j][4] + " AD" : "no wording year"));',
       'btn.append((mj.label || rows[j][3]) + (rows[j][4] && rows[j][4] !== "S_NO_SOURCE_YEAR" ? " · wording " + rows[j][4] + " AD" : ""));', 1)
# 4 and 5 sour: how the page is built
sub(D, "Hebrew, word by word. The text arrives sealed from the shelf and is drawn above, every word pressable for its record. Under each verse here: the line the reader draws under its words as it first opens, one reading for a word or for the words one card joins, credited by number to its source at the foot.",
       "Hebrew, word by word: press any word to see its readings. Under each verse, the English the reader shows first, each reading numbered to its source at the foot.", 1)
sub(D, "The Hebrew text is served only inside the reader, sealed and pinned.", "The Hebrew text is shown only in the reader.", 1)
print("patched")
