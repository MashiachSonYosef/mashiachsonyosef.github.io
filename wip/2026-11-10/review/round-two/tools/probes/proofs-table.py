"""The browser proofs' logs as one table: a line per run of line-vs-first-pill.mjs.
usage: python3 -I proofs-table.py <log>...
"""
import re
import sys

PAT = re.compile(r"(\d+) surfaces asked · (\d+) found at a place · line and first reading agree at (\d+), differ at (\d+) · where they agree, the credit agrees at (\d+), differs at (\d+), was not read at (\d+) · in a maqaf run and not asked (\d+) · a card of several words (\d+) · no card (\d+) · no line (\d+) · no place (\d+)")
for path in sys.argv[1:]:
    print("####", path.split("/")[-1])
    title = None
    for line in open(path, encoding="utf8"):
        if line.startswith("== "):
            title = line.strip()[3:]
        m = PAT.search(line)
        if m:
            a = [int(x) for x in m.groups()]
            print(f"  {title[:112]:112s} asked {a[0]:3d} found {a[1]:3d} | reading agree {a[2]:3d} differ {a[3]:3d} | credit agree {a[4]:3d} differ {a[5]:3d} unread {a[6]} | run {a[7]} several {a[8]} no card {a[9]} no line {a[10]} no place {a[11]}")
        elif "exited" in line or "PROOFS-DONE" in line:
            print("   ", line.strip()[:160])
