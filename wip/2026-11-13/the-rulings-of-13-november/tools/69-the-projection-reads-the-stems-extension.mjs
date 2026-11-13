// The projection bakes, per key, the stems of each row a source names them for (the binyan ledger's file 2). The
// corpus lane extended that file to three more dictionaries (relay v173) and the owner set its two branches (ruling 2
// of 13 November 2026). The projection now reads the extension beside file 2, through tools/stems-extension-v1.mjs:
// the file as the bytes its pin names, each branch as the lane's own pin of the ruling sets it. The stems land in
// the same record, under the same id (m, rank, route), so the page finds the stems of a row beside the store where
// it finds the store's. A row both files name is refused, and the sidecar says which extension it read and under
// which ruling.
// node 69-the-projection-reads-the-stems-extension.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  [`import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";
`,
   `import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";
import { readStemsExtension, stemsId, STEMS_EXTENSION_RULE_ID, STEMS_EXTENSION_HOME } from "./stems-extension-v1.mjs";
`],
  [`  binyanFiles.push({ file: rowStemsPath.split("/").pop(), sha256: sha256File(rowStemsPath) });
}
`,
   `  binyanFiles.push({ file: rowStemsPath.split("/").pop(), sha256: sha256File(rowStemsPath) });
}
// THE STEMS EXTENSION (the corpus lane's relay v173; the owner's ruling 2 of
// 13 November 2026). File 2 names stems where BDB, TAHOT and MACULA say
// them. The extension is the same format for three more dictionaries: the
// UBS dictionary and the SDBH, whose rows the store serves, and Jastrow,
// whose rows stand in the dictionary beside the store. It is read through
// tools/stems-extension-v1.mjs: the file only as the bytes its pin names
// (data/stems-extension/), and each of its two branches as the lane's own
// pin of the owner's ruling sets it. Its stems join the same record under
// the same id, so the page finds the stems of a row beside the store where
// it finds the store's. A row both files name is a fault and is refused.
const extensionPath = arg("--row-stems-extension");
let extensionSaid = null;   // what the sidecar says of the extension, or null where none was read
if (extensionPath) {
  if (!rowStemsPath) { console.error("refused: --row-stems-extension extends the binyan ledger's file 2 and is read with it (--row-stems)"); process.exit(1); }
  let ext;
  try { ext = readStemsExtension(extensionPath); } catch (e) { console.error(\`refused: the stems extension: \${e.message}\`); process.exit(1); }
  let given = 0;
  for (const l of ext.lines) {
    if (!wanted.has(l.key) || !l.stems.length) continue;
    const held = (stemsByKey[l.key] ||= {});
    const id = stemsId(l.m, l.rank, l.route);
    if (Object.prototype.hasOwnProperty.call(held, id)) { console.error(\`refused: the stems extension and file 2 both name the row \${l.m} rank \${l.rank} under «\${l.key}»\`); process.exit(1); }
    held[id] = l.stems;
    given += 1;
  }
  binyanFiles.push({ file: ext.pin.lines.file, sha256: ext.pin.lines.sha256 });
  extensionSaid = { rule: STEMS_EXTENSION_RULE_ID, pin: \`\${STEMS_EXTENSION_HOME}/PIN.json\`, relay: ext.pin.relay, lines_sha256: ext.pin.lines.sha256, ruling: ext.cited, branches: Object.fromEntries(ext.resting), rows_given_stems_in_this_book: given };
}
`],
  [`binyan: { rule: STEM_FAMILY_RULE_ID, files: binyanFiles, kq:`,
   `binyan: { rule: STEM_FAMILY_RULE_ID, files: binyanFiles, ...(extensionSaid ? { extension: extensionSaid } : {}), kq:`],
  [`stems[key]: the known stems of each store row on the key, by m, rank and route; a row not listed has no known stem" } } : {}),`,
   `stems[key]: the known stems of each row on the key, by m, rank and route: the store's rows, and where the extension was read the rows of the dictionary beside the store that it names; a row not listed has no known stem" } } : {}),`],
]);
