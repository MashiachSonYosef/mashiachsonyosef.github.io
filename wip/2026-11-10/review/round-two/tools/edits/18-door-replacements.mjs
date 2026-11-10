// Page data is laid into a page as it stands (the fifth reader's finding 25, latent). The door assembled each
// book page with String.replace and handed it the readings of a chapter, the title and the page's records as
// the REPLACEMENT STRING, where "$&", "$'" and "$1" are patterns: a reading that held a dollar sign before one
// of those would have been rewritten on its way into the page. No reading holds one today. Each replacement is
// a function now, which lays its text in untouched; the pages come out the same bytes.
// node 18-door-replacements.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "build-front-door-v1.mjs"), [
  [`  const titled = (title
    ? ZONE_HTML.replace(/<title>[^<]*<\\/title>/, \`<title>\${esc(title)}</title>\`)
    : ZONE_HTML)`,
   `  // every replacement below is a function: a string handed to replace as the
  // replacement is read for "$&", "$'" and "$1", and what is laid in here is
  // page data (a title, the page's records, a chapter's readings)
  const titled = (title
    ? ZONE_HTML.replace(/<title>[^<]*<\\/title>/, () => \`<title>\${esc(title)}</title>\`)
    : ZONE_HTML)`],
  [`    .replace(anchor, metas + anchor)
    .replace(engineBlocks.css.whole, \`<link rel="stylesheet" href="/\${ENGINE}/\${engineBlocks.css.name}">\`)
    .replace(engineBlocks.js.whole, \`<script src="/\${ENGINE}/\${engineBlocks.js.name}"></script>\`)
    .replace(slot, b.porch ? \`\${slot}\\n\${b.porch}\` : slot);`,
   `    .replace(anchor, () => metas + anchor)
    .replace(engineBlocks.css.whole, () => \`<link rel="stylesheet" href="/\${ENGINE}/\${engineBlocks.css.name}">\`)
    .replace(engineBlocks.js.whole, () => \`<script src="/\${ENGINE}/\${engineBlocks.js.name}"></script>\`)
    .replace(slot, () => (b.porch ? \`\${slot}\\n\${b.porch}\` : slot));`],
]);
