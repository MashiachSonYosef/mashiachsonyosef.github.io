# Ship 12, patch 2: the row tool reads a list kept gzipped (a name ending .gz) as the list it holds; the list's
# sha256 in the round is the list's own, as the landings' pin names it.
import io, sys, re
p = sys.argv[1]; s = io.open(p, encoding="utf-8").read()
m = re.search(r'import \{([^}]*)\} from "node:zlib";', s)
names = [x.strip() for x in m.group(1).split(",")]
if "gunzipSync" not in names:
    s = s.replace(m.group(0), 'import { ' + ", ".join(names + ["gunzipSync"]) + ' } from "node:zlib";')
old = "const listBytes = readFileSync(LIST);\n"
new = ("// a list kept gzipped (the landings' large lists, 21 November 2026) is read as the list it holds: its lines and its\n"
       "// sha256 are the list's own, the bytes the landings' pin names\n"
       "const listBytes = /\\.gz$/u.test(LIST) ? gunzipSync(readFileSync(LIST)) : readFileSync(LIST);\n")
assert s.count(old) == 1; s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
