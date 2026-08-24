// sense-split-rule-v2-a-comma-outside-the-providers-parentheses-separates
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

export const RULE_ID = "sense-split-rule-v2-a-comma-outside-the-providers-parentheses-separates";

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
  const readings = raw.map((p) => p.trim()).filter(Boolean);
  return { readings, whole: readings.length <= 1, damaged: false, at: -1 };
};
