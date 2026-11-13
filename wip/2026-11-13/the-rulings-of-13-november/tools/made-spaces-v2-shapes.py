# The shapes of the second made-spaces relay's files, beside the first's: the receipt's keys (how a source, its list
# and the store version it was read from are named), a list line, and a words-taken-out line. It reads; it changes
# nothing.
# python3 -I made-spaces-v2-shapes.py <reader/data/made-spaces dir>
import json, sys, os

root = sys.argv[1]


def shape(x, depth=0, most=3):
    if isinstance(x, dict):
        if depth >= most:
            return "{%d keys}" % len(x)
        return {k: shape(v, depth + 1, most) for k, v in x.items()}
    if isinstance(x, list):
        if not x:
            return []
        if depth >= most:
            return "[%d]" % len(x)
        return [shape(x[0], depth + 1, most), "... %d in all" % len(x)]
    if isinstance(x, str) and len(x) > 90:
        return x[:90] + "..."
    return x


for folder, receipt in (("made-spaces-v1", "receipt-v1.json"), ("made-spaces-v2", "receipt-v2.json")):
    r = json.load(open(os.path.join(root, folder, receipt), encoding="utf-8"))
    print("=====", folder, receipt)
    print("top keys:", list(r.keys()))
    print("inputs:", json.dumps(shape(r.get("inputs"), 0, 3), ensure_ascii=False)[:1500])
    print("outputs:", json.dumps(r.get("outputs"), ensure_ascii=False)[:1500])
    for s in r.get("sources") or []:
        print("--- source", s.get("source_key"), s.get("m_id"), s.get("label"))
        print("    keys:", list(s.keys()))
        for k, v in s.items():
            if k in ("source_key", "m_id", "label"):
                continue
            print("    %s: %s" % (k, json.dumps(shape(v, 0, 4), ensure_ascii=False)[:900]))

for folder in ("made-spaces-v1", "made-spaces-v2"):
    for f in sorted(os.listdir(os.path.join(root, folder))):
        if not f.endswith(".jsonl"):
            continue
        with open(os.path.join(root, folder, f), encoding="utf-8") as fh:
            lines = fh.read().split("\n")
        first = json.loads(lines[0])
        keys = {}
        for s in lines:
            if not s:
                continue
            for k in json.loads(s).keys():
                keys[k] = keys.get(k, 0) + 1
        print("=====", folder, f, len([s for s in lines if s]), "lines; keys:", keys)
        print("   first:", json.dumps(first, ensure_ascii=False)[:700])
