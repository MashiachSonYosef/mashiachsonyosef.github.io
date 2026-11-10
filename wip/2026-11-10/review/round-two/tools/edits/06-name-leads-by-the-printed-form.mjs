// The name that leads a line leads its card (the first reader's finding 8, proven 10 November 2026 on Amos 1:6:
// the line read «Gaza» and the card's first reading was «strong»). The card found the name among its pills by
// comparing texts letter for letter, and since 7 November a pill's text is whichever spelling of the reading
// arrived first, «Gaza.» or «Gaza». The pills are one reading by the printed form; the name is found by it.
// Also: a lattice leader's year is the wording year of its row, and the line's record now says so.
// node 06-name-leads-by-the-printed-form.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`    const nameLead = (a, b) => (!nameLed || nameYields() ? 0 : (a.text === nameLed ? 0 : 1) - (b.text === nameLed ? 0 : 1));`,
   `    // found among the pills by the printed form, the key the pills are one
    // reading by (readingKey): a pill's text is whichever spelling arrived
    // first, «Gaza.» or «Gaza», and a compare letter for letter missed the
    // name at 607 of the 2,684 keys a name leads (10 November 2026: Amos
    // 1:6's line read «Gaza» and its card opened on «strong»)
    const nameKey = nameLed ? readingKey(nameLed) : null;
    const isName = (r) => readingKey(r.text) === nameKey;
    const nameLead = (a, b) => (!nameLed || nameYields() ? 0 : (isName(a) ? 0 : 1) - (isName(b) ? 0 : 1));`],
  // the year a lattice leader carries is its row's wording year (the projector reads row[4]); the
  // line's record said "edition" beside it, which for most sources is another year or none
  [`      return first ? { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3] }], why: "letters" } : null;`,
   `      return first ? { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3], ya: "wording" }], why: "letters" } : null;`],
  [`      if (first) return { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3] }], why: pos.id };`,
   `      if (first) return { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3], ya: "wording" }], why: pos.id };`],
  [`        if (l && !allOff(l[4])) return { text: l[0], rs: [{ posture: l[2], m: l[1], y: l[3], by: l[4] }], why: "masorah" };
        const la = gr.o.la;
        if (la && !allOff(la[4])) return { text: la[0], rs: [{ posture: la[2], m: la[1], y: la[3], by: la[4] }], why: "masorah" };`,
   `        if (l && !allOff(l[4])) return { text: l[0], rs: [{ posture: l[2], m: l[1], y: l[3], ya: "wording", by: l[4] }], why: "masorah" };
        const la = gr.o.la;
        if (la && !allOff(la[4])) return { text: la[0], rs: [{ posture: la[2], m: la[1], y: la[3], ya: "wording", by: la[4] }], why: "masorah" };`],
]);
