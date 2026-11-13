// The front door's card prints a row's two texts with the made spaces closed (made-spaces-rule-v1), by the same
// three functions the reader's page and the store reader carry, under the same names: the pill, the reading shown
// as selected, the record under it, the test that two rows carry one record, and the reading a ruling paints on
// the door.
// node 44-the-door-card-closes-a-made-space.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "build-front-door-v1.mjs"), [
  [`  var RULED_KEY = "fh.door.ruled";
`,
   `  // A SPACE OUR OWN BUILD MADE CLOSES WHERE A TEXT PRINTS (made-spaces-rule-v1:
  // the places a row names in row[9], for its route text and for its
  // definition text). The reader's page and tools/gloss-store-v1.mjs carry
  // the same three functions under the same names.
  function closed(text, places) {
    var out = "", at = 0, i;
    for (i = 0; places && i < places.length; i += 1) { out += text.slice(at, places[i]); at = places[i] + 1; }
    return out + text.slice(at);
  }
  function routePrinted(row) { return closed(String(row[1] == null ? "" : row[1]), row[9] ? row[9][0] : null); }
  function recordPrinted(row) { return row[2] ? closed(String(row[2]), row[9] ? row[9][1] : null) : routePrinted(row); }
  var RULED_KEY = "fh.door.ruled";
`],
  [`    var r = { text: row[1], lic: licName(m.licensePosture), m: m.label || row[3], mid: row[3],`,
   `    var r = { text: routePrinted(row), lic: licName(m.licensePosture), m: m.label || row[3], mid: row[3],`],
  [`    wcard.querySelector(".r-now .v").textContent = r[1];
`,
   `    wcard.querySelector(".r-now .v").textContent = routePrinted(r);
`],
  [`    body.textContent = r[2] || r[1];
`,
   `    body.textContent = recordPrinted(r);
`],
  [`    var D = r[2] || r[1] || "";
`,
   `    var D = recordPrinted(r);
`],
  [`      if ((rows[j][2] || rows[j][1] || "") !== D) continue;
`,
   `      if (recordPrinted(rows[j]) !== D) continue;
`],
  [`reads it \\u201c" + rows[j][1] + "\\u201d"`,
   `reads it \\u201c" + routePrinted(rows[j]) + "\\u201d"`, 2],
  [`            b.type = "button"; b.textContent = r[1];
`,
   `            b.type = "button"; b.textContent = routePrinted(r);
`],
]);
