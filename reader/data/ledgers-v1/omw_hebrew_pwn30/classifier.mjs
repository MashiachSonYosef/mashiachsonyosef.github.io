// omw_hebrew_pwn30.classifier.mjs · made from classifier-template-v1 under ask v1.1
//
// A classifier is a declaration made runnable. It is a pure function: no file
// reads, no network, no state kept between calls. classify(text) returns one
// {i, mark, shape} for EVERY mark in the text, where a mark is any character
// that is not a letter, a digit or whitespace, and i is its index in the
// JavaScript string. Do not change anything above the SHAPES line; the
// checker reads containers the same way.
//
// Each shape's test receives a context:
//   c.text       the whole route text
//   c.i          the mark's index
//   c.mark       the mark itself
//   c.container  "top" | "paren" | "bracket" | "angle" | "brace": the innermost
//                bracket the mark sits in (a bracket character sits in what
//                encloses it, not in itself)
//   c.depth      how many brackets enclose it
//   c.unclosed   true when an opener before it never closes
//   c.before     the text before the mark;  c.after  the text after it
//   c.inner      the text inside the innermost enclosing bracket ("" at top)
//   c.group      for an opening or closing bracket: the text it opens or closes
//                (null for an opener that never closes); "" for other marks
// Order matters: for each mark, the first shape whose test returns true names
// it. If no shape matches, classify throws and names the place, so a missing
// shape is never silently swallowed. Put specific shapes before general ones.
const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);
const OPEN = { "(": ")", "[": "]", "<": ">", "{": "}" };
const CLOSE = { ")": "(", "]": "[", ">": "<", "}": "{" };
const CONTAINER = { "(": "paren", "[": "bracket", "<": "angle", "{": "brace" };

const SHAPES = [
  // ---- fragment ledger ----
  { id: "semicolon.between_two_wordings", mark: ";", divides: false, test: (c) => WORDING_PIECES_AFTER_SEMICOLON.includes(pieceAfter(c)) },
  { id: "semicolon.before_a_further_description", mark: ";", divides: false, test: (c) => DESCRIPTION_PIECES_AFTER_SEMICOLON.includes(pieceAfter(c)) },
  { id: "semicolon.ends_the_text", mark: ";", divides: false, test: (c) => c.after === "" },
  { id: "semicolon.after_a_label", mark: ";", divides: false, test: (c) => LABEL_HEADS_BEFORE_SEMICOLON.includes(c.before.slice(0, 40)) },
  { id: "semicolon.before_a_note_of_use_or_habit", mark: ";", divides: false, test: (c) => NOTE_OPENER_USE_OR_HABIT.includes(firstWordAfter(c)) },
  { id: "semicolon.before_a_verb_with_no_subject", mark: ";", divides: false, test: (c) => NOTE_OPENER_VERB_WITH_NO_SUBJECT.includes(firstWordAfter(c)) },
  { id: "semicolon.before_a_note", mark: ";", divides: false, test: (c) => true },
  { id: "comma.inside_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.between_two_wordings", mark: ",", divides: false, test: (c) => WORDING_PIECES_AFTER_COMMA.includes(pieceAfter(c)) },
  { id: "comma.in_a_number", mark: ",", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "comma.before_a_quoted_example", mark: ",", divides: false, test: (c) => c.after.trim()[0] === '"' },
  { id: "comma.before_a_qualifier", mark: ",", divides: false, test: (c) => COMMA_QUALIFIER_OPENERS.includes(firstWordAfter(c)) },
  { id: "comma.in_one_phrase", mark: ",", divides: false, test: (c) => true },
  { id: "colon.between_two_wordings", mark: ":", divides: false, test: (c) => WORDING_PIECES_AFTER_COLON.includes(pieceAfter(c)) },
  { id: "colon.before_a_quoted_example", mark: ":", divides: false, test: (c) => c.after.trim()[0] === '"' },
  { id: "colon.before_a_note", mark: ":", divides: false, test: (c) => true },
  { id: "quote.opens_an_example", mark: '"', divides: false, test: (c) => (c.before.split('"').length - 1) % 2 === 0 },
  { id: "quote.closes_an_example", mark: '"', divides: false, test: (c) => (c.before.split('"').length - 1) % 2 === 1 },
  { id: "open_paren.heads_the_text", mark: "(", divides: false, test: (c) => c.before === "" },
  { id: "close_paren.heads_the_text", mark: ")", divides: false, test: (c) => c.before === "(" + c.group },
  { id: "open_paren.holds_a_printed_sign", mark: "(", divides: false, test: (c) => PAREN_PRINTED_SIGNS.includes(c.group) },
  { id: "close_paren.holds_a_printed_sign", mark: ")", divides: false, test: (c) => PAREN_PRINTED_SIGNS.includes(c.group) },
  { id: "open_paren.holds_a_note_on_a_cited_word", mark: "(", divides: false, test: (c) => c.group[0] === "\u0060" },
  { id: "close_paren.holds_a_note_on_a_cited_word", mark: ")", divides: false, test: (c) => c.group[0] === "\u0060" },
  { id: "open_paren.holds_another_wording", mark: "(", divides: false, test: (c) => firstWord(c.group) === "or" },
  { id: "close_paren.holds_another_wording", mark: ")", divides: false, test: (c) => firstWord(c.group) === "or" },
  { id: "open_paren.holds_a_qualifier", mark: "(", divides: false, test: (c) => PAREN_QUALIFIER_OPENERS.includes(firstWord(c.group)) },
  { id: "close_paren.holds_a_qualifier", mark: ")", divides: false, test: (c) => PAREN_QUALIFIER_OPENERS.includes(firstWord(c.group)) },
  { id: "open_paren.holds_what_the_word_before_covers", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holds_what_the_word_before_covers", mark: ")", divides: false, test: (c) => true },
  { id: "hyphen.names_itself", mark: "-", divides: false, test: (c) => c.before.slice(-1) === "(" && c.after[0] === ")" },
  { id: "hyphen.in_a_double_hyphen", mark: "-", divides: false, test: (c) => c.before.slice(-1) === "-" || c.after[0] === "-" },
  { id: "hyphen.between_two_digits", mark: "-", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "hyphen.joins_one_word", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "grave_accent.opens_a_cited_word", mark: "\u0060", divides: false, test: (c) => isLetter(c.after[0]) },
  { id: "apostrophe.closes_a_cited_word", mark: "'", divides: false, test: (c) => { const b = c.before.lastIndexOf("\u0060"); return b >= 0 && !c.before.slice(b).includes("'"); } },
  { id: "apostrophe.before_the_s_of_belonging", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "apostrophe.in_a_shortened_word", mark: "'", divides: false, test: (c) => SHORTENED_WORDS.includes(wordRound(c)) },
  { id: "apostrophe.after_a_plural_s", mark: "'", divides: false, test: (c) => c.before.slice(-1) === "s" && !isLetter(c.after[0]) },
  { id: "period.names_itself", mark: ".", divides: false, test: (c) => c.before.slice(-1) === "(" && c.after[0] === ")" },
  { id: "period.in_three_dots", mark: ".", divides: false, test: (c) => c.before.slice(-1) === "." || c.after[0] === "." },
  { id: "period.in_a_decimal_number", mark: ".", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "period.inside_e_g", mark: ".", divides: false, test: (c) => (c.before.slice(-1) === "e" && c.after[0] === "g") || c.before.slice(-3) === "e.g" },
  { id: "period.ends_etc", mark: ".", divides: false, test: (c) => c.before.slice(-3) === "etc" },
  { id: "slash.in_a_fraction", mark: "/", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "slash.in_a_name_of_a_protocol", mark: "/", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "asterisk.names_itself", mark: "*", divides: false, test: (c) => c.before.slice(-1) === " " && c.after[0] === " " },
  { id: "low_line.joins_two_words", mark: "_", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "percent_sign.after_a_number", mark: "%", divides: false, test: (c) => isDigit(c.before.slice(-1)) },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && ch !== "" && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && ch !== "" && /^[0-9]$/u.test(ch);
const firstWord = (x) => /^[\p{L}0-9]*/u.exec(x)[0];
const firstWordAfter = (c) => firstWord(c.after.trim());
const pieceAfter = (c) => c.after.split(/[,;]/u)[0].trim().slice(0, 40);
const wordRound = (c) => /\p{L}*$/u.exec(c.before)[0] + c.mark + /^\p{L}*/u.exec(c.after)[0];
const WORDING_PIECES_AFTER_SEMICOLON = ["the twelfth month of the ecclesiastic ye","without involving anyone else","make clear","warm and nurturing","springy","the comprehensibility of clear expressio","known closely or intimately","extremely tired","completely exhausted","involving something in commerce","done by choice","not forced or compelled","a dense dark grey fine-grained igneous r","moral or spiritual cleansing","the promised and expected deliverer of t","act presumptuously","engage in a contest","measure oneself against others","keeping away from or preventing from hap","accept without verification or proof","single and isolated from others","a piece of nucleic acid (DNA or RNA) wra","any of several metabolic disorders marke","possess knowledge or information about","tempter of mankind","master of Hell","not excessive or extreme","having a sneering disbelief in e.g. self","the act of pronouncing judgment based on","speak humorously","someone to whom an obligation exists","the middle of the night","exceptional or heroic courage when facin","a main support in a structure","with no time intervening","of minor status","the fundamental observational entity in ","enlisting people for the army (or for a ","take to be true","have a faith","be a believer","a feeling of dislike so strong that it d","being one unit or constituting the full ","complete","a conflict in which one faction tries to","ensuring observance of or obedience to","also any copper-base alloy containing ot","a highly addictive morphine derivative","by comparison to something else","explicitly stated","a drawing showing the relation between t","a woodwind with a conical bore and a dou","someone who keeps the sheep together in ","covered with or tinged with the color of","the processes by which an organism assim","furthermore","think much of","an oblique-angled equilateral parallelog","make docile and tractable","cause to happen or occur","abnormal and hideous","characterized by progressive and uncontr","in an intentional manner","a mouthful","lacking knowledge of a specific field","lacking knowledge or sophistication","higher in rank","longer in length of tenure or service","liable to hurt or harm","become different in essence","losing one's or its original nature","devoted to a deity or some religious cer","legally blameless","encircle","speak about others and reveal secrets or","something that is subject to variation","being attentive to possible danger","the main thing you are thinking about","the main part","the personification of the infinity of s","a white powder (a form of calcium sulpha","taking a patient look","take into account","the basic unit of amount of substance ad","a successful defensive stand","thrilling","no longer current","one who begets or one who gives birth to","a relative who plays the role of guardia","a complex entity constructed of many par","a woman who has an ongoing extramarital ","carrying into effect","the activity of conveying information","lifelike","be an inhabitant of","look upon","judge","showing a single form or character in al","the second person in the Trinity (incarn","put on different clothes","come to terms","make a financial settlement","concede the truth or validity of somethi","not openly","characterized by simplicity and (often) ","the best (or worst) performance ever att","be in contact with","the consequence of food deprivation","showing lack of human sensibility","open to or concerning the people as a wh","someone who eats no animal or dairy prod","a written statement sworn to be true bef","shadowed or black","having extensive information or understa","reciting numbers in ascending order","the expression of a belief that is held ","a quality that permits or facilitates ac","the reason for the action","that which gives purpose and direction t","having no positive features","away from the speaker","possession with the right to transfer po","say a prayer","an official or legal cancellation","calling off some arrangement","an entity that can cast a shadow","determining something by mathematical or","not at all","engage the interest of","not abstract or imaginary","put on guard","favorably or with much respect","not volunteering anything more than nece","someone who has the obligation of paying","inactivity resulting in something being ","not deceitful","only a short time ago","leaving nothing to implication","change the meaning of or be vague about ","the organic component of soil","of the highest quality","a woman's partner in marriage","having a roof as specified (often used i","the person being sued or accused","be of service","consisting of interconnected parts","respond favorably to","a form of silica more opaque than chalce","arousing aversion or disgust","the male gamete","the biblical carob","not limited or provincial in scope","the concluding time","so light as to resemble air","laying out money or capital in an enterp","a perfect embodiment of a concept","a possibility of incurring loss or misfo","the nutritive and protective gelatinous ","the biblical sycamore","the principal organ of digestion","sincerely felt or expressed","someone who by long study has gained mas","having an exaggerated sense of self-impo","the period from conception to birth when","continuing or repeating behavior","become a member of a group or organizati","divide into halves","not tall","in an indifferent manner","the addition of oxygen to a compound wit","immediately adjoining without intervenin","full of misery","make different","cause a transformation","vitally necessary","similar to the color of a ripe orange","the trait of being answerable to someone","pronouncing as wrong or morally culpable","calculating the sum of two or more numbe","with everything necessary","act as a trainer or coach (to)","the branch of the natural sciences deali","the fifth month of the ecclesiastical ye","not absolute or complete","the horizontal member at the bottom of t","greet upon arrival","try to sell (a product)","go back further","lower in rank","shorter in length of tenure or service","vehement","bundle of straws or twigs attached to a ","hard work","the sixth month of the ecclesiastical ye","today in Great Britain a person honored ","ask for","moving with or capable of moving with hi","progress in development","the planet we live on","a rod of marking substance encased in wo","a lack of false pride","having a pH greater than 7","without much doubt","an amount spent","in anticipation","illegal entrance into premises with crim","talk with","on the lookout for possible danger","leaving a place in an orderly fashion","found on","including (either intentionally or accid","resembling the color of blood or cherrie","the chromatic color resembling the hue o","soft wet earth","impenetrable to sight","traveling on foot at a fast pace","deliberately harmful","all but","despicable","containing a great quantity of matter","lost or especially having died out leavi","the process of taking in oxygen from inh","requiring great physical or mental effor"];
const WORDING_PIECES_AFTER_COMMA = ["stop moving","believe","or suppose","build","or erect","abandon","or leave for another","select","or choose from a number of alternatives","place the foot","declare a plan for something","give permission","single out as important","the day after","following the present day","immature","by way of addition","long","or crave for (something","chamber","or separate room within a larger enclose","or germinate","or give experimental use to","or try to establish the existence of"];
const WORDING_PIECES_AFTER_COLON = ["the first woman and mother of the human ","making things out of wood"];
const DESCRIPTION_PIECES_AFTER_SEMICOLON = ["an important foodstuff and used otherwis","brother and murderer of Osiris","source of sesame seed or benniseed and s","father of Romulus and Remus","counterpart of Greek Ares","a common symptom of severe mental disord","the most abundant element in the earth's","the only metal that is liquid at ordinar","the simplest and lightest and most abund","the most populous country in the world","the fifth most abundant element in the e","an important component of most plants an","largest living bird","important food and source of oil","a constituent of all living tissues","one of the six inert gases","second most populous country in the worl","the largest country wholly in Europe"];
const LABEL_HEADS_BEFORE_SEMICOLON = ["comparative of much","used of physical heat","especially of petals or leaves in bud","used of old persons or old trees","bright-colored","a quantifier that can be used with count"];
const COMMA_QUALIFIER_OPENERS = ["as","especially","usually","often","also","either","like","without","not","but","by","in","of","where","notably","thus","formerly","both","used","e","with"];
const PAREN_QUALIFIER_OPENERS = ["especially","as","usually","often","such","in","not","of","for","mostly","including","sometimes","also","used","without","with","by","on","when","known","e","trade","originally","approximately","even","traditionally","either","but","and","which","who","to"];
const PAREN_PRINTED_SIGNS = ["-","."];
const SHORTENED_WORDS = ["o'clock","d'Unites","doesn't"];
const NOTE_OPENER_USE_OR_HABIT = ["used","usually","often","sometimes","frequently","especially","chiefly","mostly","widely","commonly","traditionally","probably","worn","made","designed","intended","suitable","for"];
const NOTE_OPENER_VERB_WITH_NO_SUBJECT = ["has","have","is","are","can","may","contains","occurs","secretes","includes","implies","holds","yields","hardens","reaches","constitutes","comprises","consist","synthesizes","aids","uses","produces","serves","lives","burns","oxidizes","hangs","swings","reproduce","feed","flows","collects","preys","begins"];

export function classify(text) {
  const chars = [...text];
  const pos = []; let i16 = 0;
  for (const ch of chars) { pos.push(i16); i16 += ch.length; }
  const st = [], match = new Map();
  chars.forEach((ch, k) => {
    if (OPEN[ch]) st.push(k);
    else if (CLOSE[ch] && st.length && chars[st[st.length - 1]] === CLOSE[ch]) { const o = st.pop(); match.set(o, k); match.set(k, o); }
  });
  const never = new Set(st);
  const firstUnclosed = st.length ? Math.min(...st) : Infinity;
  const stack = [], out = [];
  chars.forEach((ch, k) => {
    if (CLOSE[ch] && stack.length && chars[stack[stack.length - 1]] === CLOSE[ch]) stack.pop();
    if (isMark(ch)) {
      const top = stack.length ? stack[stack.length - 1] : -1;
      const inner = top >= 0 ? chars.slice(top + 1, match.get(top)).join("") : "";
      let group = "";
      if (OPEN[ch]) group = match.has(k) ? chars.slice(k + 1, match.get(k)).join("") : null;
      else if (CLOSE[ch] && match.has(k)) group = chars.slice(match.get(k) + 1, k).join("");
      const c = { text, i: pos[k], mark: ch, container: top >= 0 ? CONTAINER[chars[top]] : "top", depth: stack.length, unclosed: k >= firstUnclosed, before: chars.slice(0, k).join(""), after: chars.slice(k + 1).join(""), inner, group };
      const s = SHAPES.find((x) => x.mark === ch && x.test(c));
      if (!s) throw new Error(`no shape for "${ch}" (${c.container}) at ${pos[k]} in: ${text.slice(Math.max(0, pos[k] - 30), pos[k] + 30)}`);
      out.push({ i: pos[k], mark: ch, shape: s.id });
    }
    if (OPEN[ch] && !never.has(k)) stack.push(k);
  });
  return out;
}
export const SHAPE_IDS = SHAPES.map((s) => s.id);
