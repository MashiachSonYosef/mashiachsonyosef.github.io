// The row of one block yields to the readings' three rows only where three rows are owed: not on a
// window squashed flat, where the page owes the readings fewer and the row stands as it did.
// node 23-three-rows-where-owed.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
[`    // repeats the pressed division: it gives way before they lose a row.
    // Like every yield here it still answers "did not fit".`,
 `    // repeats the pressed division: it gives way before they lose a row.
    // Like every yield here it still answers "did not fit". Only where three
    // rows are owed: on a window squashed flat (under 480px, where the bands
    // are capped at one row and the readings are owed their floor) the row
    // stands as it did.`],
[`    if (oneRow && oneRow.style.display !== "none" && readingsShort()) {`,
 `    if (window.innerHeight >= 480 && oneRow && oneRow.style.display !== "none" && readingsShort()) {`],
]);
