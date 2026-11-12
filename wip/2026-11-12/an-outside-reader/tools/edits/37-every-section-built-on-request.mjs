// The page builds a section when it comes within reach of the window, and builds them all for the whole work's
// export (materialiseAll). A tool that must read the lines of a book could reach that only by scrolling, and a
// scrolled test browser now and then stops answering (11 November 2026). The page offers its own function instead:
// every section, or a stretch of them. Nothing a reader sees changes.
// node 37-every-section-built-on-request.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
  [`  const materialiseAll = () => { sectionEls.forEach(({ el }) => materialise(el)); };
`,
   `  const materialiseAll = () => { sectionEls.forEach(({ el }) => materialise(el)); };
  // offered to the bake of the resting lines and to the checks that read the
  // lines of a book (tools/resting-lines-v1.mjs): every section, or the
  // stretch asked for, built as the whole work's export builds it, with
  // nothing scrolled; it answers how many sections the book has
  window.__materialise = (from = 0, to = sectionEls.length) => { sectionEls.slice(from, to).forEach(({ el }) => materialise(el)); return sectionEls.length; };
`],
]);
