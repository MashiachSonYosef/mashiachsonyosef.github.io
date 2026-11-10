// The readings' three rows no longer rest on a pixel: the row of one block yields to them as it
// already yields to an overrun. node 22-three-rows.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
[`    if (overrun() > 1 && oneRow && oneRow.style.display !== "none") {
      oneRow.style.display = "none";   // the band's own display rule outranks the hidden attribute
      bands = bands.filter((x) => x.el !== oneRow);
      lastResort = true; handOut();
    }`,
 `    if (overrun() > 1 && oneRow && oneRow.style.display !== "none") {
      oneRow.style.display = "none";   // the band's own display rule outranks the hidden attribute
      bands = bands.filter((x) => x.el !== oneRow);
      lastResort = true; handOut();
    }
    // AND IT YIELDS TO THE READINGS' THREE ROWS AS IT YIELDS TO AN OVERRUN
    // (10 November 2026). The bands take whole rows, so a card one pixel
    // short of the readings' third row stood at two, a whole row down, with
    // the row of one block standing over them. Measured on a short phone
    // (390x664), a chain's card, its word brought up as far as the page
    // goes: the room beneath the word was 548.17px and the card held three
    // rows; with the text above the word shifted by a third of a pixel the
    // room was 547.86, the card was capped at 547, and the readings fell to
    // two rows of fifty-four. Three clear rows are what the readings are
    // owed (the owner, 2026-10-03 and 2026-10-22), and the row of one block
    // repeats the pressed division: it gives way before they lose a row.
    // Like every yield here it still answers "did not fit".
    const readingsShort = () => {
      if (!read || !read.children.length) return false;
      const rs = rowsOf(read);
      return rs.filter((r) => r.bottom <= read.clientHeight + 1).length < Math.min(READ_MIN, rs.length);
    };
    if (oneRow && oneRow.style.display !== "none" && readingsShort()) {
      oneRow.style.display = "none";
      bands = bands.filter((x) => x.el !== oneRow);
      lastResort = true; handOut();
    }`],
]);
