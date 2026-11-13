# One fault put into a reader tree, for the check of the paseq's place to catch. Each mode changes one file in place;
# the harness keeps the file and puts it back. Modes:
#   pin-sha        the pin names another sha256 for the list
#   zone-drop      Job 38:1's place loses its stroke
#   zone-word      Job 38:1's stroke follows read word 2, not 1
#   zone-stray     the first paseq of Job outside the list says it prints in a read form
#   css-always     the stroke is drawn whether the marks are shown or not
#   css-mark       the mark's own block shows again with the marks
#   js-word        the page draws the stroke after the next read word
#   js-press       a press on the stroke opens nothing of the mark's
#   js-text        the stroke's span holds its glyph as text
#   js-export      the export writes the mark at its own position too
#   js-export-place the export writes the place's carrier without its stroke
# python3 -I paseq-faults-v1.py <reader dir> <mode>
import gzip, json, os, sys

R, mode = sys.argv[1], sys.argv[2]

def swap(path, old, new):
    s = open(path, encoding="utf-8").read()
    if s.count(old) != 1:
        sys.exit(f"{mode}: expected one of {old[:70]!r} in {path}, found {s.count(old)}")
    open(path, "w", encoding="utf-8").write(s.replace(old, new))

def zone(book, change):
    p = os.path.join(R, "data", "zones", f"{book}.bin")
    z = json.loads(gzip.open(p).read())
    change(z)
    with open(p, "wb") as f:
        f.write(gzip.compress(json.dumps(z, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), 9))

def site(z, label):
    sec = next(s for s in z["sections"] if s["label"] == label)
    i = next(i for i, w in enumerate(sec["words"]) if (w.get("kq") or {}).get("stroke"))
    return sec["words"][i], sec["words"][i + 1]

PAGE = os.path.join(R, "zone.html")
if mode == "pin-sha":
    swap(os.path.join(R, "data", "paseq-place", "PIN.json"), '"sha256": "c9be98b7', '"sha256": "00be98b7')
elif mode == "zone-drop":
    zone("job", lambda z: site(z, "38:1")[0]["kq"].pop("stroke"))
elif mode == "zone-word":
    zone("job", lambda z: site(z, "38:1")[0]["kq"]["stroke"].update(after_read_word=2))
elif mode == "zone-stray":
    def stray(z):
        for s in z["sections"]:
            for w in s["words"]:
                m = w.get("mark") or {}
                if m.get("kind") == "PASEQ" and "in_read_form" not in m:
                    m["in_read_form"] = True
                    return
    zone("job", stray)
elif mode == "css-always":
    swap(PAGE, "  body.marks-on .wb .kq-stroke::before { content: attr(data-s);", "  .wb .kq-stroke::before { content: attr(data-s);")
elif mode == "css-mark":
    swap(PAGE, "  body.marks-on .wb.mark-off.in-read-form { display: none; }\n", "")
elif mode == "js-word":
    swap(PAGE, '(n += 1) === st.after_read_word);', '(n += 1) === st.after_read_word + 1);')
elif mode == "js-press":
    swap(PAGE, "[built.pressAt || built.wb]", "[built.wb]")
elif mode == "js-text":
    swap(PAGE, '        strokeEl.dataset.mark = "PASEQ";\n', '        strokeEl.dataset.mark = "PASEQ";\n        strokeEl.textContent = stroke.s;\n')
elif mode == "js-export":
    swap(PAGE, "      if (w.mark && w.mark.in_read_form) continue;\n", "")
elif mode == "js-export-place":
    swap(PAGE, "he: carrierWithStroke(w),", "he: w.s,")
else:
    sys.exit(f"no mode {mode}")
print(f"{mode}: put in")
