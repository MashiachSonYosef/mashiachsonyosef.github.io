// A rail row lights the position in force, which is the toggle's to say. node 05-segrow.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "zone.html"), [
[`        onPick(pos.id);
        for (const x of seg.children) { const on = x.textContent === pos.lab; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); }
        railSay();`,
`        onPick(pos.id);
        // the position in force is the toggle's to say, not the press's: a
        // press the toggle refused ("only this pointing" on a work with no
        // lattice) lit its button while the page stayed where it was
        const inForce = t.get ? t.get() : pos.id;
        const lit = positions.find((q) => q.id === inForce) || pos;
        for (const x of seg.children) { const on = x.textContent === lit.lab; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); }
        railSay();`],
]);
