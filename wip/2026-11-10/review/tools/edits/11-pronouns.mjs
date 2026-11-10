// Comments that spoke of the owner with a pronoun nobody stated: the owner is named instead.
// Comments only. node 11-pronouns.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
[`  // English line under the word, and nothing else — the owner's rule, in his
  // words:`, `  // English line under the word, and nothing else — the owner's rule, in the
  // owner's words:`],
[`  // in his words: "both would always open together in 1 hud`, `  // in the owner's words: "both would always open together in 1 hud`],
[`    // The owner's ruling, 2026-08-31, in his words: "written read is good`, `    // The owner's ruling, 2026-08-31, in the owner's words: "written read is good`],
[`    // is not right"; the rule he asked for: "the card specifically saying`, `    // is not right"; the rule the owner asked for: "the card specifically saying`],
[`      // 2026-08-28, in his words: "either keep them in the drawer or a level`, `      // 2026-08-28, in the owner's words: "either keep them in the drawer or a level`],
]);
edit(join(R, "tools", "build-front-door-v1.mjs"), [
[`// a reader can open at its own address, so the owner retired the page: he is
// going through the live books one by one and only wants those.`, `// a reader can open at its own address, so the owner retired the page: the
// owner is going through the live books one by one and only wants those.`],
[`  // reader — and the owner, looking at his own door, could not tell what it`, `  // reader — and the owner, looking at the site's own door, could not tell what it`],
[`// riding the retired demonstrations page or the books he is auditing. This is`, `// riding the retired demonstrations page or the books under audit. This is`],
]);
edit(join(R, "tools", "check-gloss-whole-v1.mjs"), [
[`// the owner met the result on a phone, where nothing hovers: his own ruling`, `// the owner met the result on a phone, where nothing hovers: the owner's own ruling`],
]);
edit(join(R, "tools", "check-kq-declared-weld-v1.mjs"), [
[`// right"; and the rule he asked for: "the card specifically saying 'this exact`, `// right"; and the rule the owner asked for: "the card specifically saying 'this exact`],
]);
edit(join(R, "tools", "check-kq-lead-follows-switch-v1.mjs"), [
[`// The owner's rule for the pairs switch, 2026-09-23, in his words: "both`, `// The owner's rule for the pairs switch, 2026-09-23, in the owner's words: "both`],
]);
edit(join(R, "tools", "check-nothing-hand-typed-v1.mjs"), [
[`  // owed them. The owner had the panel switched off on 2026-09-06 (he could
  // not tell what it was), and this clause went on owing words no page prints,`, `  // owed them. The owner had the panel switched off on 2026-09-06 (it was not
  // clear what it was), and this clause went on owing words no page prints,`],
]);
edit(join(R, "tools", "emit-work-attachment-v1.mjs"), [
[`// The owner's ruling, 2026-08-31, in his words: "commentary should auto open`, `// The owner's ruling, 2026-08-31, in the owner's words: "commentary should auto open`],
]);
edit(join(R, "tools", "enrich-gloss-m-v1.mjs"), [
[`// The owner's ruling, 2026-08-30, in his words: the English reader "is now`, `// The owner's ruling, 2026-08-30, in the owner's words: the English reader "is now`],
]);
