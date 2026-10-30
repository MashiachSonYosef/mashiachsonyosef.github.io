// sense-split-rule-v3-a-comma-divides-glosses-never-a-sentence (v2: a comma outside the provider's parentheses separates)
//
// A provider writes a route's English as one field. Some of those fields hold
// one reading; some hold several, divided by commas; and some hold one reading
// whose own notation contains commas, inside parentheses:
//
//     (be-)love(-d, -ly, -r)                        one reading, three commas
//     cause to (give, give to, let, make to) drink  one reading, three commas
//     beacon, X altogether, be(-come, ...)          several readings
//
// Splitting on every comma breaks the first two into nonsense. Splitting on
// none of them leaves the third printed as a dictionary entry where a reading
// belongs. So the comma separates at parenthesis depth zero and nowhere else.
//
// The rule, stated before any output:
//
//   1. A comma at parenthesis depth 0 divides two readings.
//   2. A comma inside parentheses is the provider's own notation, untouched.
//   3. Every piece is a run of the provider's own characters. Joining the
//      pieces back with the commas that divided them reproduces the input
//      exactly — this is checked on every call, not asserted in a comment.
//   4. A text whose parentheses do not balance is not the provider's own text.
//      It is not divided at all: a boundary inside a damaged string is one the
//      provider never wrote. It is held whole and reported as damaged.
//
// Rule 4 is not a safety margin, it is a finding. Two of the runs in Genesis
// carry an inserted ")" — `be(-come), accomplished, committed, like)` where
// the provider wrote `be(-come, accomplished, committed, like)`. A text that
// cannot balance is a text something has already edited.
//
//   5. A comma divides glosses, never a sentence (the owner, 2026-10-30, of
//      Judah at the first served book's 1:1 word 8, where "founder of one of
//      the tribes of Israel, which became a separate kingdom (opposed to
//      Israel) after the death of Solomon, and, after the exile, a separate
//      administrative district" had been cut at its commas into pills: "a
//      comma in ubs doesnt mean different entrys ... this is clearly just a
//      sentence"). Of a field's comma pieces, each piece of at most four
//      words (the provider's parentheses not counted: "Bashan (often with
//      the article)" is one word) is a reading, as before; a bare
//      conjunction between commas (and, or, nor, but) is none. Where any
//      piece runs longer the provider wrote prose there, and the field
//      stands whole as a reading beside its glosses, commas and all: "which
//      became a separate kingdom (opposed to Israel) after the death of
//      Solomon" is no reading, the sentence it belongs to is. Every reading
//      a field gave before, it gives still but the clauses; what is new is
//      the sentence itself, once. Measured on one book before the rule was
//      set: no line's lead moves (the alternatives, keeping only a field's
//      opening glosses, moved a lead per book, "lest" to "angle" among them).

export const RULE_ID = "sense-split-rule-v3-a-comma-divides-glosses-never-a-sentence";
export const BARE_CONJUNCTION = /^(and|or|nor|but)$/iu;
export const GLOSS_WORDS_MOST = 4;
/** True when a comma-piece is shaped like a gloss and not like a clause. */
export const glossShaped = (piece) => {
  // the provider's parentheses are notation, not words: "Bashan (often with the article)" is one word
  const bare = String(piece).replace(/\([^()]*\)/gu, " ").trim();
  const words = bare.split(/\s+/u).filter(Boolean);
  return words.length > 0 && words.length <= GLOSS_WORDS_MOST && !BARE_CONJUNCTION.test(bare);
};

/** Where the parentheses stop balancing, or -1 if they balance. */
export const unbalancedAt = (text) => {
  let depth = 0;
  const s = String(text);
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === "(") depth += 1;
    else if (s[i] === ")") {
      depth -= 1;
      if (depth < 0) return i;          // a closer with nothing open
    }
  }
  return depth === 0 ? -1 : s.length;   // an opener never closed
};

/**
 * Divide one provider field into readings.
 * Returns { readings, whole, damaged, at } — `whole` true when the field was
 * one reading, `damaged` true when rule 4 held it back.
 */
export const senseSplit = (text) => {
  const s = String(text);
  const at = unbalancedAt(s);
  if (at !== -1) return { readings: [s], whole: true, damaged: true, at };

  const raw = [];
  let start = 0, depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
    else if (c === "," && depth === 0) { raw.push(s.slice(start, i)); start = i + 1; }
  }
  raw.push(s.slice(start));

  // rule 3, enforced: the pieces and the commas that divided them are the input
  if (raw.join(",") !== s) {
    throw new Error(`${RULE_ID}: the pieces do not rejoin to the field they came from`);
  }
  const pieces = raw.map((p) => p.trim()).filter(Boolean);
  // rule 5: one piece shaped like a clause and the field is one reading, led
  // by the gloss it opens on where the first piece is one
  // rule 5: the glosses stay readings; a clause among them makes the whole
  // field a reading too, once, in their place
  const whole = s.trim();
  const readings = pieces.every(glossShaped) ? pieces : [...pieces.filter(glossShaped), whole];
  return { readings, whole: readings.length <= 1, damaged: false, at: -1 };
};
