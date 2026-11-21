# Ship 13: how often the leader a sidecar bakes under "cites here" carries a source's own sign (the page's
# SOURCE_SIGN patterns but Strong's own, which is a longer pattern and is not counted here), so the line under that
# order reads a reading the card, with the signs at rest, offered no pill for unless it opened on it.
# python3 signed-leaders-under-cites.py <reader dir>
import sys, gzip, json, re, glob, os
reader = sys.argv[1]
SIGN = [re.compile(chr(0xbf)), re.compile(r"<[^>]*>"), re.compile(r"\[[^\]]*\]"), re.compile(r" ~ ")]
signed = lambda t: any(r.search(str(t)) for r in SIGN)
books = surfaces = with_c = signed_c = verses_c = signed_vc = 0
eg = []
for p in sorted(glob.glob(os.path.join(reader, "data/zones/*.lattice.bin"))):
    s = json.loads(gzip.open(p).read().decode("utf-8")); books += 1
    for surface, gr in s.get("grades", {}).items():
        surfaces += 1
        c = (gr.get("o") or {}).get("c")
        if c:
            with_c += 1
            if signed(c[0]):
                signed_c += 1
                if len(eg) < 6: eg.append((os.path.basename(p).split(".")[0], c[0], c[1][:40] if len(c) > 1 and c[1] else ""))
        for verse, v in (gr.get("v") or {}).items():
            vc = v.get("c") if isinstance(v, dict) else None
            if vc:
                verses_c += 1
                if signed(vc[0]): signed_vc += 1
print(f"{books} books, {surfaces} graded surfaces")
print(f"a leader under cites here at the surface's first verse: {with_c}; of them carrying a sign: {signed_c}")
print(f"a leader under cites here at a later verse: {verses_c}; of them carrying a sign: {signed_vc}")
for e in eg: print("  ", e)
