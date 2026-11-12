# The owner's pasted texts of 12 November, taken out of the session's own record and written as files, each as it
# was pasted (nothing is changed), so that they can be read by a script and kept beside the notes.
# python3 -I pull-owner-paste.py <session record .jsonl> <out dir>
import json, os, sys
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
want = {
    "genesis1-verb-cards-review.md": "Genesis 1 verb cards — pill-by-pill review",
    "fireandhail-chain-audit-obadiah.md": "# fireandhail.com chain audit — notes",
}
found = {}
with open(src, encoding="utf8") as f:
    for line in f:
        if not any(v in line for v in want.values()):
            continue
        try:
            rec = json.loads(line)
        except Exception:
            continue
        msg = rec.get("message") or {}
        if msg.get("role") != "user":
            continue
        content = msg.get("content")
        texts = [content] if isinstance(content, str) else [c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text"]
        for t in texts:
            for name, mark in want.items():
                if mark in t and name not in found:
                    found[name] = t
for name, t in found.items():
    with open(os.path.join(out, name.replace(".md", ".whole-message.txt")), "w", encoding="utf8") as g:
        g.write(t)
    print(name, len(t), "characters in the message that carries it")
print("found", len(found), "of", len(want))
