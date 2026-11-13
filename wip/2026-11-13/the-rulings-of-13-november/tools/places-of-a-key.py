# Every word place of the books whose key is one of those given: its book and verse, the word as pointed, its tags,
# the place's own reading (the pieces' glosses), the stems its surface carries, and the leader under "only this
# pointing" each of two builds' sidecars holds for the surface (the surface's own, and where the sidecar keeps
# leaders by kind of place, every one of them). It reads; it changes nothing.
# python3 -I places-of-a-key.py <zones dir before> <zones dir after> <key> [<key> ...]
import glob, gzip, json, os, sys

A, B, keys = sys.argv[1], sys.argv[2], set(sys.argv[3:])
load = lambda p: json.loads(gzip.open(p).read().decode("utf-8"))
say = lambda l: "none" if not l else f"«{l[0]}» ({l[3] if len(l) > 3 else '?'}{', by ' + ' '.join(l[4]) if len(l) > 4 and l[4] else ''})"


def leaders(g):
    o = (g or {}).get("o") or {}
    out = [f"the surface's: {say(o.get('l'))}"]
    for tags, x in sorted(((g or {}).get("e") or {}).items()):
        out.append(f"at {tags}: {say((x or {}).get('l'))}")
    return " · ".join(out)


for zp in sorted(glob.glob(os.path.join(B, "*.lattice.bin"))):
    book = os.path.basename(zp)[: -len(".lattice.bin")]
    zone = load(os.path.join(B, f"{book}.bin"))
    hits = [(sec["label"], w) for sec in zone["sections"] for w in sec.get("words") or [] if not w.get("mark") and w.get("k") in keys]
    if not hits: continue
    a, b = load(os.path.join(A, f"{book}.lattice.bin")), load(zp)
    for label, w in hits:
        ga, gb = (a.get("grades") or {}).get(w.get("s")), (b.get("grades") or {}).get(w.get("s"))
        own = " + ".join(str((p or {}).get("g") or "") for p in (w.get("pg") or [])) or "none"
        print(f"{book} {label} · {w.get('s')} (key {w.get('k')}) · tags {w.get('tg') or 'none'} · the place's own reading: {own} · stems {(gb or {}).get('st') or 'not said'}")
        print(f"      before: {leaders(ga)}")
        print(f"      after:  {leaders(gb)}")
