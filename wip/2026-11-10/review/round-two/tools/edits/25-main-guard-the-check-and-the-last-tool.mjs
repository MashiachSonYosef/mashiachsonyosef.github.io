// The check that holds the main guard still knew only the guard's old spelling, so it went red on the twelve
// tools that ask through tools/main-guard-v1.mjs (found by the whole suite, 10 November). It learns the one way
// the question is asked now, and gains a law that no tool asks it another way: the old comparison guards an
// import but, from a path with a space or through a link, also keeps the program from running at all.
// The thirteenth tool that asked in its own words (a check, by another spelling) asks through the module too.
// node 25-main-guard-the-check-and-the-last-tool.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("check-no-import-side-effects-v1.mjs"), [
  [`// So: any tool imported by another tool must guard its work behind a main
// check, and export only what a reader can take without the file doing
// anything. A module that means to be both a library and a program says which
// it is being.
//`,
   `// So: any tool imported by another tool must guard its work behind a main
// check, and export only what a reader can take without the file doing
// anything. A module that means to be both a library and a program says which
// it is being.
//
// And it says so one way (10 November 2026): through the one function of
// tools/main-guard-v1.mjs. Until then each tool compared its own address with
// "file://" and the path it was started on, letter for letter. That guards an
// import. It also fails the other way: from a folder with a space in its
// name, or through a link, the two never match, so the tool run as a program
// did nothing and exited 0, and a round shipped the record of the round
// before. The second law here keeps a tool from asking in its own words.
//`],
  [`const MAIN_GUARD = /import\\.meta\\.url\\s*[!=]==\\s*\`file:\\/\\/\\$\\{process\\.argv\\[1\\]\\}\`/;`,
   `// the guard as a statement: if (startedAs(import.meta.url)) or its negation
const MAIN_GUARD = /^\\s*if \\(!?startedAs\\(import\\.meta\\.url\\)\\)/m;
const IMPORTS_THE_GUARD = /import\\s*\\{[^}]*\\bstartedAs\\b[^}]*\\}\\s*from\\s*"\\.\\/main-guard-v1\\.mjs"/;
// a tool comparing its own address with anything, on either side of the sign
const OWN_WORDS = /import\\.meta\\.url\\s*[!=]==?|[!=]==?\\s*import\\.meta\\.url/;`],
  [`  if (MAIN_GUARD.test(s)) continue;`,
   `  // either spelling keeps an import from doing the work; the second law
  // refuses the old one for what it does to the program
  if (MAIN_GUARD.test(s) || OWN_WORDS.test(s)) continue;`],
  [`    : "every one either writes nothing or guards on being the program");
`,
   `    : "every one either writes nothing or guards on being the program");

const ownWords = files.filter((f) => OWN_WORDS.test(src[f]));
const asking = files.filter((f) => MAIN_GUARD.test(src[f]));
const unimported = asking.filter((f) => !IMPORTS_THE_GUARD.test(src[f]));
check("a tool asks whether it is the program one way, through tools/main-guard-v1.mjs",
  ownWords.length === 0 && unimported.length === 0 && asking.length > 0,
  ownWords.length ? \`\${ownWords.length} compare their own address themselves: \${ownWords.join(", ")}\`
    : unimported.length ? \`\${unimported.length} call the guard without importing it from the module: \${unimported.join(", ")}\`
    : \`\${asking.length} tools ask, each through the module\`);
`],
]);

edit(T("check-work-attribution-display-v3.mjs"), [
  [`import { pathToFileURL } from "node:url";\n`, `import { startedAs } from "./main-guard-v1.mjs";\n`],
  [`if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {`, `if (startedAs(import.meta.url)) {`],
]);
