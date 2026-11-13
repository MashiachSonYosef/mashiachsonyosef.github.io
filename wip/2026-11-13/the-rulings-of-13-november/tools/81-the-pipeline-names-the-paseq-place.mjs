// PIPELINE.md's first block names the paseq's place (after ruling 4's sentence, which it follows on main).
// node 81-the-pipeline-names-the-paseq-place.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> keep as the card's notes, with the record of the reading held.
> \`PIPELINE-MANIFEST.md\` is generated`,
   `> keep as the card's notes, with the record of the reading held. At the
> 16 places where the edition writes a paseq inside a read form, a zone
> carries since the same day the read word the stroke follows
> (\`tools/apply-paseq-place-v1.mjs\`, from the corpus lane's list kept in
> \`data/paseq-place/\`): the stroke keeps its own position and its count,
> and the reader prints it inside the read form, with the marks. That write
> was made by hand, is typed on each zone it changed, and expires when the
> zones are built from the lane's next lattice, which stands each stroke in
> its place itself; the round's projections keep it.
> \`PIPELINE-MANIFEST.md\` is generated`],
]);
