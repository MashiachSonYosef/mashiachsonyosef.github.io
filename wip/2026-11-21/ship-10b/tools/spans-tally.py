# Ship 10b: tally what the page draws at each multi-word span of a default source set first (spans-on-page.mjs).
# python3 -I spans-tally.py <out dir> <source> [examples per shape]
# Shapes, by the lines under the span's words (and the line's own place where it is filed beside):
#   ONE_LINE_SOURCE   one line over every word of the span, credited to the source
#   ONE_LINE_OTHER    one line over every word of the span, credited to another (a run's own line, STEP's)
#   TWICE             the source's line under some word of the span or its filed place, and another line under another word of the span
#   SOURCE_EACH       the source's line under every word, each word its own line (the same line again, or one each)
#   RESTS             no line of the source under any word of the span: each word reads the line as it rests
import json, sys, os, collections
out, src = sys.argv[1], sys.argv[2]
eg_n = int(sys.argv[3]) if len(sys.argv) > 3 else 4
CRED = {"ubs": {"M18"}, "bdb": {"M46"}, "macula": {"PIECE:MACULA", "M3"}, "step": {"PIECE:TAHOT", "M4", "M19"}}[src]
tally = collections.Counter(); by_cls = collections.Counter(); eg = collections.defaultdict(list); cells = collections.Counter(); credits = collections.Counter()
books = 0; lines = 0
for f in sorted(os.listdir(os.path.join(out, src))):
    d = json.load(open(os.path.join(out, src, f), encoding="utf-8")); books += 1
    for r in d["rows"]:
        lines += 1
        dr = r["drawn"]
        if any("none" in x for x in dr): shape = "NOT_FOUND"
        else:
            units = {(tuple(x["unit"]) if x["unit"] else None) for x in dr}
            ours = [x for x in dr if x["credit"] in CRED]
            one_cell = len({x["cell"] for x in dr}) == 1
            if len(units) == 1 and None not in units and dr[0]["unit"][1] >= len(dr): shape = "ONE_LINE_SOURCE" if ours else "ONE_LINE_OTHER"
            elif ours and len(ours) == len(dr): shape = "SOURCE_EACH"
            elif ours: shape = "TWICE"
            else: shape = "RESTS"
            shape += " · one cell" if one_cell else " · apart"
            for x in dr: credits[x["credit"]] += 1
        tally[shape] += 1; by_cls[(r["cls"], shape)] += 1
        if len(eg[shape]) < eg_n: eg[shape].append(f"{d['book']} {r['p']} [{r['cls']}{'' if r['filed'] else ', filed beside'}]: " + " | ".join(f"{x['pl'].split(':')[-1]}: {x.get('text')} ({x.get('credit')})" for x in dr))
print(f"{src}: {books} books, {lines} lines whose span is two words or more")
for k, v in sorted(tally.items(), key=lambda x: -x[1]):
    print(f"  {v:5d}  {k}")
    for e in eg[k]: print(f"           {e}")
print("  by class:")
for (c, s), v in sorted(by_cls.items()): print(f"    {c:32s} {s:28s} {v}")
print("  credits under the spans' words:", dict(credits.most_common(8)))
