# Scratch: write as escapes the characters a tool or a page must not carry raw: the invisible spaces, and any
# character of the Hebrew blocks (a tool carries no Hebrew in its literals; the range ends of a test are such).
import sys
for p in sys.argv[1:]:
    s = open(p, encoding="utf-8").read()
    out = []
    n = 0
    for ch in s:
        o = ord(ch)
        if o in (0x2003, 0x00a0, 0x200b) or 0x0590 <= o <= 0x05ff or 0xfb1d <= o <= 0xfb4f:
            out.append("\\u%04X" % o if o > 0xff else "\\u%04x" % o); n += 1
        else: out.append(ch)
    open(p, "w", encoding="utf-8").write("".join(out))
    print(p.split("/")[-1], n, "written as escapes")
