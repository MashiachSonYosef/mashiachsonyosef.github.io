# Look at the corpus lane's receipt for the made-spaces lists: its top-level keys and the figures a second count can be held to.
# python3 -I made-spaces-receipt-look.py <receipt-v1.json>
import json, sys
r = json.load(open(sys.argv[1], encoding="utf8"))
def show(o, depth=0, key="", limit=3):
    pad = "  " * depth
    if isinstance(o, dict):
        print(f"{pad}{key}: {{{len(o)} keys}}")
        if depth < limit:
            for k, v in o.items():
                show(v, depth + 1, k, limit)
    elif isinstance(o, list):
        print(f"{pad}{key}: [{len(o)}] {json.dumps(o, ensure_ascii=False)[:160]}")
    else:
        print(f"{pad}{key}: {json.dumps(o, ensure_ascii=False)[:200]}")
show(r)
