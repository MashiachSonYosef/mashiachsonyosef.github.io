// The door's small pages wear one palette, named once (the fifth reader's finding 20). The page a reader gets
// for an address that is no file (404.html) still wore the colors of before 10 October and typed the site's
// name; the held, moved and reference pages each typed today's colors again. The four read one set of names
// now, and the three that were right come out the same bytes.
// node 11-door-small-pages.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "build-front-door-v1.mjs"), [
  [`const SITE_NAME = SITE_HOST || "The Tabernacle";`,
   `const SITE_NAME = SITE_HOST || "The Tabernacle";
// THE SMALL PAGES' COLORS, NAMED ONCE. The pages this builder writes outside
// the door and the books (an address that is no file, a held address, a moved
// one, a traditional name's page) carry no stylesheet of the site's; each has
// a few lines of its own. They read the reader's own values from here (the
// owner, 2026-10-10: one linen, the purple regular and dim, the dim gold), so
// a change of palette reaches all of them. Until 10 November 2026 each typed
// its colors again, and the page for an address that is no file had been
// left on the palette of before 10 October.
const SMALL_PAGE = Object.freeze({ paper: "#ebdec3", ink: "#642460", dim: "#753c6d", gold: "#a06c10" });`],
  // held address
  [`  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ebdec3;
  color:#753c6d;font:16px/1.6 Georgia,serif;padding:2rem;text-align:center}
  a{color:#a06c10} p{max-width:34rem} .prov{font-size:.82em;color:#753c6d}</style>`,
   `  body{margin:0;min-height:100vh;display:grid;place-items:center;background:\${SMALL_PAGE.paper};
  color:\${SMALL_PAGE.dim};font:16px/1.6 Georgia,serif;padding:2rem;text-align:center}
  a{color:\${SMALL_PAGE.gold}} p{max-width:34rem} .prov{font-size:.82em;color:\${SMALL_PAGE.dim}}</style>`],
  // a traditional name's page
  [`  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ebdec3;
  color:#642460;font:16px/1.6 Georgia,serif;padding:2rem}
  a{color:#753c6d} main{max-width:36rem} h1{font-size:1.3rem;letter-spacing:.08em;font-variant:small-caps;color:#a06c10}
  .prov{font-size:.82em;color:#753c6d}
  .lics{font-size:.82em;color:#753c6d}
  .lic{display:inline-block;margin-left:.35em;padding:0 .4em;border:1px solid #a06c10;`,
   `  body{margin:0;min-height:100vh;display:grid;place-items:center;background:\${SMALL_PAGE.paper};
  color:\${SMALL_PAGE.ink};font:16px/1.6 Georgia,serif;padding:2rem}
  a{color:\${SMALL_PAGE.dim}} main{max-width:36rem} h1{font-size:1.3rem;letter-spacing:.08em;font-variant:small-caps;color:\${SMALL_PAGE.gold}}
  .prov{font-size:.82em;color:\${SMALL_PAGE.dim}}
  .lics{font-size:.82em;color:\${SMALL_PAGE.dim}}
  .lic{display:inline-block;margin-left:.35em;padding:0 .4em;border:1px solid \${SMALL_PAGE.gold};`],
  // moved address
  [`  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ebdec3;
  color:#753c6d;font:16px Georgia,serif} a{color:#a06c10}</style>`,
   `  body{margin:0;min-height:100vh;display:grid;place-items:center;background:\${SMALL_PAGE.paper};
  color:\${SMALL_PAGE.dim};font:16px Georgia,serif} a{color:\${SMALL_PAGE.gold}}</style>`],
  // an address that is no file
  [`<meta name="robots" content="noindex"><title>Not here · fireandhail.com</title>
<style>body{margin:0;padding:2rem 1rem;font:1rem/1.6 Georgia,serif;color:#2b2420;background:#efe6d3;max-width:34rem}a{color:#5a3e8f}code{font-size:.95em}</style>`,
   `<meta name="robots" content="noindex"><title>Not here · \${SITE_NAME}</title>
<style>:root{color-scheme:light}body{margin:0;padding:2rem 1rem;font:1rem/1.6 Georgia,serif;color:\${SMALL_PAGE.ink};background:\${SMALL_PAGE.paper};max-width:34rem}a{color:\${SMALL_PAGE.dim}}code{font-size:.95em}</style>`],
]);
