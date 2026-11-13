# The door's part of edit 43 moves to a script of its own (44), with its look-alike pair matched without the
# leading quote that only one of the two carries. Edit 43 keeps the four tools it has already been applied to.
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf8").read()
mark = '\nedit(join(R, "tools", "build-front-door-v1.mjs"), ['
assert s.count(mark) == 1
i = s.index(mark)
door = s[i:]
s = s[:i]
old = """  [`"reads it \\\\u201c" + rows[j][1] + "\\\\u201d"`,
   `"reads it \\\\u201c" + routePrinted(rows[j]) + "\\\\u201d"`, 2],"""
new = """  [`reads it \\\\u201c" + rows[j][1] + "\\\\u201d"`,
   `reads it \\\\u201c" + routePrinted(rows[j]) + "\\\\u201d"`, 2],"""
assert door.count(old) == 1, door.count(old)
door = door.replace(old, new)
head_line = "//   - the front door's card prints a row's two texts closed, by the same three functions under the same names.\n"
assert s.count(head_line) == 1
s = s.replace(head_line, "// The front door's card is edit 44.\n")
open(src, "w", encoding="utf8").write(s)
open(dst, "w", encoding="utf8").write("""// The front door's card prints a row's two texts with the made spaces closed (made-spaces-rule-v1), by the same
// three functions the reader's page and the store reader carry, under the same names: the pill, the reading shown
// as selected, the record under it, the test that two rows carry one record, and the reading a ruling paints on
// the door.
// node 44-the-door-card-closes-a-made-space.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
""" + door)
print("split")
