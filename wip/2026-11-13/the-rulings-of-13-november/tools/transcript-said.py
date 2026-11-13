# The text of the conversation's own messages that hold a phrase: the assistant's replies, or the user's words, with
# where each stands. It reads the session's transcript file and prints; it changes nothing.
# python3 -I transcript-said.py <transcript.jsonl> <role: assistant|user> <phrase> [--last N] [--chars N]
import json, sys

path, role, phrase = sys.argv[1], sys.argv[2], sys.argv[3]
last = int(sys.argv[sys.argv.index("--last") + 1]) if "--last" in sys.argv else 3
chars = int(sys.argv[sys.argv.index("--chars") + 1]) if "--chars" in sys.argv else 4000
hits = []
with open(path, encoding="utf-8") as f:
    for n, line in enumerate(f):
        if phrase not in line: continue
        try: o = json.loads(line)
        except Exception: continue
        if o.get("type") != role: continue
        msg = o.get("message") or {}
        content = msg.get("content")
        texts = []
        if isinstance(content, str): texts.append(content)
        elif isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("type") == "text": texts.append(c.get("text") or "")
        for t in texts:
            if phrase in t: hits.append((n, o.get("timestamp", ""), t))
for n, ts, t in hits[-last:]:
    print(f"==== line {n} · {ts}")
    print(t[:chars])
print(f"({len(hits)} message(s) hold the phrase)")
