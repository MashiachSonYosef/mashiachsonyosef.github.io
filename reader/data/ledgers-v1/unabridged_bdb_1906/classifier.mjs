// unabridged_bdb_1906.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment comma ----
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.in_paren_between_greek_names", mark: ",", divides: false, test: (c) => c.container === "paren" && /\p{Script=Greek}/u.test(c.inner) },
  { id: "comma.in_paren_after_a_gap", mark: ",", divides: false, test: (c) => c.container === "paren" && /\s$/u.test(c.before) },
  { id: "comma.in_paren_in_an_aside", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.in_bracket", mark: ",", divides: false, test: (c) => c.container === "bracket" },
  { id: "comma.marked_beside_a_sign", mark: ",", divides: false, test: (c) => c.container === "top" && standsAt(MARKED, c) },
  { id: "comma.marked_in_small_verb_list", mark: ",", divides: false, test: (c) => c.container === "top" && standsAt(SMALL_VERB_MARKED, c) },
  { id: "comma.marked_in_small_verb_list_with_a_later_ed_word", mark: ",", divides: false, test: (c) => c.container === "top" && standsAt(SMALL_VERB_ED_MARKED, c) },
  { id: "comma.in_text_with_other_signs", mark: ",", divides: false, test: (c) => c.container === "top" && holdsOtherSign(listText(c.text)) },
  { id: "comma.in_text_with_a_figure", mark: ",", divides: false, test: (c) => c.container === "top" && /\p{N}/u.test(listText(c.text)) },
  { id: "comma.in_text_with_a_capital", mark: ",", divides: false, test: (c) => c.container === "top" && /\p{Lu}/u.test(listText(c.text)) },
  { id: "comma.beside_an_empty_piece", mark: ",", divides: false, test: (c) => c.container === "top" && piecesOf(listText(c.text)).includes("") },
  { id: "comma.in_text_with_a_usage_word", mark: ",", divides: false, test: (c) => c.container === "top" && wordsOf(listText(c.text)).some((w) => LISTS.usage_words.includes(w)) },
  { id: "comma.in_list_where_a_piece_leans", mark: ",", divides: false, test: (c) => c.container === "top" && LISTS.leaning_lists.includes(listText(c.text)) },
  { id: "comma.in_a_list_of_kinds_of_verb", mark: ",", divides: false, test: (c) => c.container === "top" && LISTS.kinds_of_verb_lists.includes(listText(c.text)) },
  { id: "comma.between_a_word_and_its_plural", mark: ",", divides: false, test: (c) => c.container === "top" && !LISTS.plural_exceptions.includes(listText(c.text)) && besideItsPlural(c) },
  { id: "comma.between_one_word_renderings", mark: ",", divides: false, test: (c) => c.container === "top" && piecesOf(listText(c.text)).every(isOneWord) },
  { id: "comma.in_small_verb_list_with_a_later_ed_word", mark: ",", divides: false, test: (c) => c.container === "top" && !SMALL_VERB_MARKED.has(c.text) && (() => { const p = piecesOf(listText(c.text)); return LISTS.small_verbs.includes(firstWordOf(p[0])) && p.slice(1).some(plainEd); })() },
  { id: "comma.in_small_verb_list", mark: ",", divides: false, test: (c) => c.container === "top" && !SMALL_VERB_MARKED.has(c.text) && (() => { const p = piecesOf(listText(c.text)); return LISTS.small_verbs.includes(firstWordOf(p[0])) && p.slice(1).some(isOneWord); })() },
  { id: "comma.between_small_word_renderings", mark: ",", divides: false, test: (c) => c.container === "top" && LISTS.small_word_lists.includes(listText(c.text)) || LISTS.small_word_list_openings.some((o) => listText(c.text).startsWith(o)) },
  { id: "comma.after_or_before_a_qualifying_word", mark: ",", divides: false, test: (c) => c.container === "top" && piecesOf(listText(c.text)).some((p) => LISTS.qualifier_words.includes(firstWordOf(p))) },
  { id: "comma.before_a_connective", mark: ",", divides: false, test: (c) => c.container === "top" && piecesOf(listText(c.text)).slice(1).some((p) => LISTS.connective_words.includes(firstWordOf(p))) },
  { id: "comma.before_a_word_that_finishes_the_verb", mark: ",", divides: false, test: (c) => c.container === "top" && piecesOf(listText(c.text)).slice(1).some((p) => wordsOf(p).every((w) => LISTS.verb_finishing_words.includes(w))) },
  { id: "comma.between_renderings_with_one_first_word", mark: ",", divides: false, test: (c) => c.container === "top" && (() => { const p = piecesOf(listText(c.text)); return p.every((x) => firstWordOf(x) === firstWordOf(p[0])); })() },
  { id: "comma.between_phrases", mark: ",", divides: false, test: (c) => c.container === "top" && true },
  // ---- fragment semicolon ----
  { id: "semicolon.in_unbalanced_text", mark: ";", divides: false, test: (c) => unbalanced(c.text) },
  { id: "semicolon.between_renderings", mark: ";", divides: false, test: (c) => c.container === "top" && LISTS.semicolon_list_openings.some((o) => c.text.trim().startsWith(o)) },
  { id: "semicolon.marked_beside_a_sign", mark: ";", divides: false, test: (c) => c.container === "top" && standsAt(MARKED, c) },
  { id: "semicolon.in_paren", mark: ";", divides: false, test: (c) => c.container === "paren" },
  { id: "semicolon.before_grammar_note", mark: ";", divides: false, test: (c) => c.container === "top" && nextNonSpace(c.after) === "\u2014" },
  { id: "semicolon.top_other", mark: ";", divides: false, test: (c) => c.container === "top" },
  // ---- fragment period ----
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.between_two_renderings", mark: ".", divides: false, test: (c) => c.container === "top" && LISTS.stray_stop_texts.includes(c.text.trim()) },
  { id: "period.in_ellipsis", mark: ".", divides: false, test: (c) => lastNonSpace(c.before) === "." || nextNonSpace(c.after) === "." },
  { id: "period.after_outline_letter", mark: ".", divides: false, test: (c) => { const r = runBefore(c.before); const prev = c.before.slice(0, c.before.length - r.length).slice(-1); return LISTS.outline_letters.includes(r) && prev !== "." && !/\p{L}/u.test(c.after.slice(0, 1)); } },
  { id: "period.after_abbreviation", mark: ".", divides: false, test: (c) => LISTS.abbreviations.includes(runBefore(c.before)) },
  { id: "period.ending_text", mark: ".", divides: false, test: (c) => c.container === "top" && c.after.trim() === "" },
  { id: "period.other", mark: ".", divides: false, test: () => true },
  // ---- fragment paren ----
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.group === "" && !c.before.endsWith("(") },
  { id: "open_paren.inside_paren", mark: "(", divides: false, test: (c) => c.container === "paren" },
  { id: "close_paren.inside_paren", mark: ")", divides: false, test: (c) => c.container === "paren" },
  { id: "open_paren.holds_only_marks", mark: "(", divides: false, test: (c) => holdsOnlyMarks(c.group) },
  { id: "close_paren.holds_only_marks", mark: ")", divides: false, test: (c) => holdsOnlyMarks(c.group) },
  { id: "open_paren.doubt", mark: "(", divides: false, test: (c) => holdsDoubt(c.group) },
  { id: "close_paren.doubt", mark: ")", divides: false, test: (c) => holdsDoubt(c.group) },
  { id: "open_paren.word_part", mark: "(", divides: false, test: (c) => openerWordPart(c) },
  { id: "close_paren.word_part", mark: ")", divides: false, test: (c) => closerWordPart(c) },
  { id: "open_paren.outline_sign", mark: "(", divides: false, test: (c) => holdsOutlineSign(c.group) },
  { id: "close_paren.outline_sign", mark: ")", divides: false, test: (c) => holdsOutlineSign(c.group) },
  { id: "open_paren.greek", mark: "(", divides: false, test: (c) => holdsGreek(c.group) },
  { id: "close_paren.greek", mark: ")", divides: false, test: (c) => holdsGreek(c.group) },
  { id: "open_paren.pointer", mark: "(", divides: false, test: (c) => holdsPointer(c.group) },
  { id: "close_paren.pointer", mark: ")", divides: false, test: (c) => holdsPointer(c.group) },
  { id: "open_paren.restatement", mark: "(", divides: false, test: (c) => holdsRestatement(c.group) },
  { id: "close_paren.restatement", mark: ")", divides: false, test: (c) => holdsRestatement(c.group) },
  { id: "open_paren.holding_words", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holding_words", mark: ")", divides: false, test: (c) => true },
  // ---- fragment rest ----
  { id: "open_bracket.holds_one_letter", mark: "[", divides: false, test: (c) => c.group !== null && /^\p{L}$/u.test(c.group) },
  { id: "close_bracket.holds_one_letter", mark: "]", divides: false, test: (c) => /^\p{L}$/u.test(c.group) },
  { id: "close_bracket.never_opened", mark: "]", divides: false, test: (c) => c.group === "" && !c.before.endsWith("[") },
  { id: "open_bracket.holding_words", mark: "[", divides: false, test: () => true },
  { id: "close_bracket.holding_words", mark: "]", divides: false, test: () => true },
  { id: "close_angle.never_opened", mark: ">", divides: false, test: (c) => c.group === "" },
  { id: "hyphen.between_figures", mark: "-", divides: false, test: (c) => /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "hyphen.after_a_word_part", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) && !/^\p{L}/u.test(c.after) },
  { id: "hyphen.before_a_word_part", mark: "-", divides: false, test: (c) => !/\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.between_letters", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.other", mark: "-", divides: false, test: () => true },
  { id: "hyphen.unicode_hyphen_in_greek", mark: "‐", divides: false, test: () => true },
  { id: "apostrophe.in_transliteration", mark: "'", divides: false, test: (c) => LISTS.transliterated_words.includes(wordAround(c)) },
  { id: "apostrophe.after_a_removed_word", mark: "'", divides: false, test: (c) => (c.before === "" || /\s$/u.test(c.before)) && /^s(?!\p{L})/u.test(c.after) },
  { id: "apostrophe.possessive_in_s", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^s(?!\p{L})/u.test(c.after) },
  { id: "apostrophe.marks_a_quoted_word", mark: "'", divides: false, test: (c) => quoteOpensAt(c.before.slice(-1), c.after.slice(0, 1)) || earlierQuoteOpener(c.before) },
  { id: "apostrophe.after_a_final_s", mark: "'", divides: false, test: () => true },
  { id: "colon.in_unbalanced_text", mark: ":", divides: false, test: (c) => unbalanced(c.text) },
  { id: "colon.marked_between_two_renderings", mark: ":", divides: false, test: (c) => c.container === "top" && standsAt(MARKED, c) },
  { id: "colon.in_reference", mark: ":", divides: false, test: (c) => /^[\p{L}\p{N}]/u.test(c.after) },
  { id: "colon.before_outline_letter", mark: ":", divides: false, test: (c) => { const m = /^\s*(?:\u2014\s*)?([\p{L}])\.(?:\s|$)/u.exec(c.after); return !!m && LISTS.outline_letters.includes(m[1]); } },
  { id: "colon.after_greek_name", mark: ":", divides: false, test: (c) => /\p{Script=Greek}\S*\s*$/u.test(c.before) },
  { id: "colon.other", mark: ":", divides: false, test: () => true },
  { id: "equals.in_a_sum", mark: "=", divides: false, test: (c) => /\p{N}/u.test(lastNonSpace(c.before)) && /\p{N}/u.test(nextNonSpace(c.after)) },
  { id: "equals.restates", mark: "=", divides: false, test: () => true },
  { id: "em_dash.opens_a_note", mark: "—", divides: false, test: () => true },
  { id: "ampersand.joins_two_words", mark: "&", divides: false, test: () => true },
  { id: "plus.before_a_figure", mark: "+", divides: false, test: (c) => /\p{N}/u.test(nextNonSpace(c.after)) },
  { id: "plus.adds_a_word", mark: "+", divides: false, test: () => true },
  { id: "exclamation.between_two_cries", mark: "!", divides: false, test: (c) => c.container === "top" && LISTS.two_cries_texts.includes(c.text.trim()) && c.after.trim() !== "" },
  { id: "exclamation.marks_a_cry", mark: "!", divides: false, test: () => true },
  { id: "question_mark.in_unbalanced_text", mark: "?", divides: false, test: (c) => unbalanced(c.text) },
  { id: "question_mark.between_two_question_words", mark: "?", divides: false, test: (c) => c.container === "top" && LISTS.two_questions_texts.includes(c.text.trim()) && c.after.trim() !== "" },
  { id: "question_mark.after_a_question_word", mark: "?", divides: false, test: (c) => LISTS.interrogative_words.includes(runBefore(c.before.trimEnd())) },
  { id: "question_mark.marks_doubt", mark: "?", divides: false, test: () => true },
  { id: "pipe.parallel_sign", mark: "|", divides: false, test: () => true },
  { id: "grave_accent.in_transliteration", mark: "`", divides: false, test: () => true },
  { id: "left_pointing_double_angle_quotation_mark.grammar_tag", mark: "«", divides: false, test: () => true },
  { id: "right_pointing_double_angle_quotation_mark.grammar_tag", mark: "»", divides: false, test: () => true },
  { id: "section_sign.before_a_paragraph_number", mark: "§", divides: false, test: () => true },
  { id: "dagger.in_transliteration", mark: "†", divides: false, test: () => true },
  { id: "double_dagger.in_transliteration", mark: "‡", divides: false, test: () => true },
  { id: "square_root.marks_a_root", mark: "√", divides: false, test: () => true },
  { id: "asterisk.between_figures", mark: "*", divides: false, test: (c) => /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "asterisk.before_a_cited_name", mark: "*", divides: false, test: () => true },
  { id: "slash.between_book_names", mark: "/", divides: false, test: (c) => c.container === "top" },
  { id: "backslash.stray_after_a_name", mark: "\\", divides: false, test: (c) => c.container === "top" },
  { id: "single_low_9_quotation_mark.stands_for_capital_tsade", mark: "‚", divides: false, test: () => true },
];

// ---- the ask's own helper for rule 3 (ASK v1.1, rule 3), copied byte for byte ----
function unbalanced(text) {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
}

// ---- helpers of fragment comma ----
const LISTS = {"capitalised_openers":["Be","Bear","Because","Bend","Cause","Distinguish","Guard","Kept","Make","Pass","Put","Servants","Ships","Take","Torrent-valley","Watch"],"usage_words":["absolute","accusative","adjective","adjectives","adverbially","adversative","collective","comparisons","figurative","imperative","intransitive","literally","masculine","noun","participles","plural","poet","poetical","preposition","pronominal","simile","singular","substantive","suffix","subject","etc"],"leaning_lists":["in, of","to, with","on, upon, engrave, inscribe","upon, over","sexually, with","wickedness, as","locality, at, near","time, at","general, public, praise","ones, princes","fat, fertile, place","broad, roomy, place","freewill, voluntary, offering","boisterous, raging, behaviour","shining, glaring, surface","second, rank","start, rise, early","shew, experience, prosperity","mere, empty, image, semblance","have, has, had","apud, chez","that, because","side, side","good, restore","prefect, deputy , see","a celestial appearance, phenomenon","a clasping, folding of the hands","a desert-plant, contrasted with","a people stiff of neck, stubborn","a rumbling, growling sound","abundant, plenteous in kindness","an edible, winged, locust","anger was kindled, burned","appointed time, place, meeting","bare, naked place","be cast forth, out","be made known, be","be or become, many, much","be, grow dark","be, or grow, insignificant","bear early, new fruit","belightly esteemed, dishonoured","bend, bend down, be bent, bowed","bind, tie up, be restricted, narrow, scant, cramped","bring into guilt, condemnation, punishment","bring to a station, a goal","cause oneself desolation, ruin","contribution to , set apart for priests","counted number, time","desirable, precious thing","disconcerted, disappointed by reason of","do or practise fraud, wrong","do well, right","dry, loose earth","eat to satiety, one's fill","either, be done, be brought about","exhibit, distance, be gone far","father of , contemporary of","feel a loathing, abhorrence, sickening dread","fresh, young ears of barley","harp, a ten","head of priestly house, post-exile","hiding, concealing, secretly laying","highly valued, esteemed","let oneself be inquired of, consulted","lift up, utter a","low estate, condition","measure of length, distance","merry, glad heart","one consecrated, devoted","one silenced, brought to silence","patriarchs, regarded as anointed kings","plain, opposite mountain","proud, scribal error for","refined, pure gold","region across, beyond","shout at, si vera l","sin of error, inadvertence","smoke, odour of","some one, a certain","sound, efficient wisdom, abiding success","steady, persistent rain","summer-season, opposed to","that which is right, pleasing in the eyes of, agreeable to","that, every way","the grains, measured, cooked","the tillable, untilled","thing assigned, apportioned, allotted","to be blessed, adored","to be praised, worthy","train, train up a","trouble of iniquity, wickedness","twisted, crooked place","unfaithful, treacherous act","unjust, unrighteous one","very oppressive, grievous","vexation, anger of","what is carried, brought","what is reaped, harvested, crop","what is settled, clarified","yea, à fortiori, the more so"],"kinds_of_verb_lists":["looking, listening, attending, waiting","proceeding, removing, expelling","saying, declaring, writing"],"marked_cuts":["Destruction | , Ruin | , 'Abaddon","(newness), new moon | , month","sufficiency | , enough!","(a) even to | , until","(sun)set | , evening","(dimming), lessenging | , alleviation","surely | , no doubt (doch wohl)","hew out | , (dig)","thorn(s) | , adamant | , flint","I (we) pray | , now","ah | , now!","lo | , behold!","ash-heap(?) | , refuse-heap | , dung-hill","internal organs | , inward parts (intestines, bowels) | , belly","searching | , thing (to be) searched out","kin (?) | , redemption","keep | , observe (sabbath)","(a) for want of | , without","learned men | , 'scribes'","dwelling-place | , 'tabernacle'","branch(es) | , bough(s)","(free), idependent | , noble","lump of pressed figs | , pressed (fig-) cake","a (shrewd) device | , plot","(crushing), crashing | , dashing","one of a flock | , a sheep (or goat)","my lord | , my master | , (a) master","sacrifice for alliance or friendship | , 'peace-offering'","produce | , furnish: Imperfect","cause to fly to and fro | , brandish, Infinitive construct","devotion | , ban ; — absolute","be hot, scorched | , burn poet","make merry over | , make sport of, Imperfect","fear | , dread, followed by accusative of person feared","hook | , ring | , fetter ; — absolute","jar | , pitcher ; — absolute","drop | , drip, figurative","place of escape | , refuge ; — absolute","give ear | , listen | , hear, almost wholly poet","give heed to | , attend to | , observe | , discern, absolute","body | , belly; suffix","leading man | , noble; plural construct","place of confinement | , goal | , prison | ; late, guard | , watch | , observance","id.; loaf | , weight | , talent","edge | : shore","offspring | : fruit","figurative = seat of emotions | : pity","if | , O that","Highest | , Most High","terrors | , alarms, occasioned by God","blessing | , praise of God","south-country | , Negeb | , south","consecration | , crown | , Naziriteship","love to God | , piety","the God | , the true God","East | , east wind","wind of the East | , east wind","fear of God | , reverence | , piety","front | , East","means, or occasion of stumbling | , stumbling-block","resting-place | , state, or condition of rest","wrapper | , shawl | , or veil","point | , or drop","flat plate | , pan | , or griddle for baking","ferret | , or shrew-mouse, unclean animal","wide wrapper | , or large veil","lending on interest | , or usury","hollow, or flat of the hand | , palm | , sole of foot | , pan","daughter's husband | , or bridegroom","hedge, or fence about | , shut in","soul | , living being | , life | , self | , person | , desire | , appetite | , emotion | , and passion","juice stewed out of meat | , or broth","hook | , or barb","iniquity | , guilt | , or punishment of iniquity","encamping | , or encampment","lend on interest, or usury | , be a creditor","treat, as sacred | , hallow","bright | , brilliant, of light","pass over, through, by | , pass on","bear a grudge | , cherish animosity, against","get glory to oneself | , be glorified, by means of","crying | , groaning, in distress","at a place, be situated stand | , lie","he | , she, used also","top | , summit, of tree","head-gear | , turban, of common priest","of place, behind | , after","running | , mode, style, of running","thrust out | , banish, especially","pillar, as monument | , personal memorial","with, bear | , bring forth","conduct | , bear along, especially in","eastward | , to, toward, the east","denoting addition, especially of something greater, also | , yea","dread | , be in dread, in awe","wrap closely, tightly | , enwrap | , envelope","shine out, forth | , display beans","boil up | , seethe | , act proudly, presumptuously, rebelliously","go around, about | , travel about in","wash | , wash off, away | , bathe","pull | , draw | , tear away, apart, off","but | , but indeed, a strong adversative","exhibit, distance | , be gone far","appointed time, place | , meeting","either, be done | , be brought about","on, upon, engrave | , inscribe","mere, empty, image | , semblance","what is reaped, harvested | , crop","sound, efficient wisdom | , abiding success","prefect | , deputy , see","yea | , à fortiori, the more so","take=lead | , conduct","take = capture | , seize","Participle = cast | , molten","make strong = bold | , encourage","in wider sense=people | , nation","Smite = attack | , attack and destroy","intransitive very precious | , dear","Participle wandering | , wayfaring | , journeying","comparisons, beyond | , above","in animation or agitation = temper | , disposition","wield, wield | , use skilfully : grasp","angle | , recess | , extreme parts: as recesses","purple | , red-purple, i.e. purple thread & cloth","Nile-arms | , Nile-canals","as concerning | , as upon","join (intransitive) | , join oneself to ( )","conjunction | , proximity","what is right, just, normal; rightness | , justness","cord | , rope; cordage; interwoven foliage","convocation; convoking | , reading","make smooth, bare, bald; scour | , polish","a flowing; free run | , liberty","act or treat as foreign, or strange; disguise | , misconstrue","against; at | , by","Ah | , Alas; Ha","crush | , pulverise | , thresh; be fine","place of lying | , couch; act of lying","prey | , food; leaf"],"small_verb_marked_cuts":["be sorry | , moved to pity | , have compassion","be quiet | , at ease","be bewildered | , beside oneself","be joined | , added to","be dry | , dried up without moisture","be dry | , dried up","be free | , exempt from punishment","be occupied | , busied with","be fructified | , made pregnant","be well with | , good for","be pleased with | , favourable to","be turned | , turned over to","be taken away | , carried off","be cleft | , rent open","be let go | , spread abroad","be in trepidation | , hurry | , or alarm","be empty(?) | , clean","be, or become, far | , distant","be, or become, much | , many | , great","be, or grow, wide | , large","be, or become king, or queen | , reign","be, or beocme, drunk | , drunken","be, or act as, prince | , rule","be or become, many | , much","be foolish | , or a fool","make bald | , or a baldness","be cornered | , thrust into a corner, or aside","make hard | , stubborn, Imperfect"],"small_verb_ed_marked_cuts":["be [severed, figurative] alienated | , estranged","be out of humour | , vexed; be enraged"],"plural_exceptions":["exiles, exile"],"small_word_lists":["according as, as, when","according to that which, according as, as","although, in spite of","as a consequence of, because","as far as, even to, up to, until, while","at ease, secure","at the end, outermost","away from, behind, about, on behalf of","complete, safe, at peace","daytime, by day","except, only, save that","from the end of, some of","from there, thence","from under, from beneath","from, on account of, through","from, out of, by, by reason of, at, more than","front, in front of","in empty condition, empty","in front of, in sight of, opposite to","in front of, opposite to","in front of, over against","in likeness of, like as","in regard to, concerning, on account of","in silence, silently","in so far as, since","in spite of, notwithstanding","in that, seeing that","in the presence of, before","in union, together","in vain, without effect","in want, needy, poor","left, on the left","needy, lacking, in want of","on account of, because","on this account, therefore","only one, solitary","over to, into power of","presence of, from before","quiet, at ease","separation, alone, by itself","the like of, like, as","to, for, in regard to","to, for, in regard to, at","tomorrow, in time to come","within a little, almost"],"small_word_list_openings":["for the sake of, on account of, to the intent","on the ground of, according to, on account of, on behalf of","out of, from, on account of, off, on the side of"],"qualifier_words":["above","according","against","almost","apparently","as","at","by","denoting","elsewhere","especially","followed","for","from","hence","in","into","late","less","of","often","on","only","specifically","toward","upon","used","with"],"connective_words":["or","and","but"],"verb_finishing_words":["about","accurately","and","apart","arrogantly","aside","away","backward","boisterously","diligently","down","for","forth","fro","from","insolently","off","or","out","presumptuously","prudently","rebelliously","roughly","through","thoughtlessly","tightly","to","treacherously","unintelligibly","up","wickedly"],"small_verbs":["be","become","grow","have","make","shew"],"semicolon_list_openings":["a flowing; free run, liberty","a shaking; tottering","act or treat as foreign, or strange; disguise, misconstrue","against; at, by","Ah, Alas; Ha","be out of humour, vexed; be enraged","become evening; grow dark","convocation; convoking, reading","cord, rope; cordage; interwoven foliage","crush, pulverise, thresh; be fine","lead, guide to a watering-place or station, and cause to","make smooth, bare, bald; scour, polish","place of lying, couch; act of lying","place, or act of planting; plantation","prey, food; leaf","what is right, just, normal; rightness, justness"],"two_cries_texts":["alas! woe!","hush! keep silence","Imperative see ! observe ! consider !","lo! behold","lo! behold!","O that! would that!"],"two_questions_texts":["what? how? aught"],"stray_stop_texts":["a good thing. benefit, welfare"],"outline_letters":["a","b"],"abbreviations":["1","2","Acc","Assyr","B","Benj","Benjm","C","Dr","I","Isr","Jehosh","Jerob","Lam","M","Mt","Nehem","Rehob","Sennach","Simil","ag","al","art","arts","c","calam","cent","compan","conjug","contemp","covt","declar","def","e","esp","etc","f","fam","ff","g","h","homin","hypothet","i","ib","id","ii","individ","infin","infra","insignif","instr","metaph","n","num","oft","p","plur","prep","preps","prohib","q","sacrif","sanct","t","techn","terr","theoph","transf","v","xiv"],"interrogative_words":["how","what","wherein","where","then"],"pointer_words":["compare","see","so","q"],"transliterated_words":["'Abaddon","'Abarîm","se'ah","Seba'im"]};
function marksOfEntries(list) { const m = new Map(); for (const e of list) { const parts = e.split(" | "); const at = new Set(); let pos = 0; for (let k = 0; k < parts.length - 1; k++) { pos += parts[k].length; at.add(pos); } m.set(parts.join(""), at); } return m; }
const MARKED = marksOfEntries(LISTS.marked_cuts), SMALL_VERB_MARKED = marksOfEntries(LISTS.small_verb_marked_cuts), SMALL_VERB_ED_MARKED = marksOfEntries(LISTS.small_verb_ed_marked_cuts);
function standsAt(map, c) { const at = map.get(c.text); return !!at && at.has(c.i); }
function listText(text) {
  let t = text.trim();
  if (t.endsWith(".")) t = t.slice(0, -1).trim();
  const first = t.split(/[\s,]/u)[0];
  if (LISTS.capitalised_openers.includes(first)) t = t[0].toLowerCase() + t.slice(1);
  return t;
}
function piecesOf(t) { return t.split(",").map((p) => p.trim()); }
function holdsOtherSign(t) {
  const chars = [...t];
  return chars.some((ch, k) => {
    if (!isMark(ch) || ch === ",") return false;
    if ((ch === "-" || ch === "'") && k > 0 && k < chars.length - 1 && /\p{L}/u.test(chars[k - 1]) && /\p{L}/u.test(chars[k + 1])) return false;
    return true;
  });
}
function wordsOf(t) { return t.split(/[\s,]+/u).filter(Boolean); }
function firstWordOf(p) { return p.split(/[\s,]/u)[0]; }
function isOneWord(p) { return p !== "" && !/\s/u.test(p); }
function plainEd(p) { return isOneWord(p) && /ed$/u.test(p) && !/eed$/u.test(p); }
function besideItsPlural(c) {
  const p = piecesOf(listText(c.text)); const k = [...c.before].filter((ch) => ch === ",").length; const a = p[k], b = p[k + 1];
  return !!a && !!b && (a === b + "s" || a === b + "es" || b === a + "s" || b === a + "es");
}
function runBefore(before) { const m = /[\p{L}\p{N}]+$/u.exec(before); return m ? m[0] : ""; }
function nextNonSpace(after) { const m = /\S/u.exec(after); return m ? m[0] : ""; }
function lastNonSpace(before) { const m = /(\S)\s*$/u.exec(before); return m ? m[1] : ""; }
function pairWordPart(g, charBeforeOpener, charAfterCloser) {
  if (g.trim().endsWith("-")) return true;
  if (/\p{L}/u.test(charAfterCloser)) return true;
  return /\p{L}/u.test(charBeforeOpener) && /^[\p{L}-]+$/u.test(g);
}
function openerWordPart(c) { return pairWordPart(c.group, c.before.slice(-1), c.after.slice(c.group.length + 1, c.group.length + 2)); }
function closerWordPart(c) { return pairWordPart(c.group, c.before.slice(0, c.before.length - c.group.length - 1).slice(-1), c.after.slice(0, 1)); }
function holdsOnlyMarks(g) { return !/[\p{L}\p{N}]/u.test(g) && !g.includes("?"); }
function holdsDoubt(g) { return g.trim().endsWith("?"); }
function holdsOutlineSign(g) { const t = g.trim(); return /^[a-z]$/u.test(t) || /^\p{N}+$/u.test(t); }
function holdsGreek(g) { return /\p{Script=Greek}/u.test(g); }
function holdsPointer(g) { const m = /[\p{L}\p{N}]+/u.exec(g); return !!m && LISTS.pointer_words.includes(m[0]); }
function holdsRestatement(g) { const t = g.trim(); return t.startsWith("=") || t.startsWith("i.e"); }
function quoteOpensAt(ch0, ch1) { return (ch0 === "" || /\s/u.test(ch0) || ch0 === "(") && /\p{L}/u.test(ch1); }
function earlierQuoteOpener(before) { const cs = [...before]; return cs.some((ch, k) => ch === "'" && quoteOpensAt(k ? cs[k - 1] : "", cs[k + 1] || "")); }
function wordAround(c) { const a = /[^\s,]*$/u.exec(c.before)[0], b = /^[^\s,]*/u.exec(c.after)[0]; return a + c.mark + b; }
// ---- helpers of fragment semicolon ----

// ---- helpers of fragment period ----

// ---- helpers of fragment paren ----

// ---- helpers of fragment rest ----


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
