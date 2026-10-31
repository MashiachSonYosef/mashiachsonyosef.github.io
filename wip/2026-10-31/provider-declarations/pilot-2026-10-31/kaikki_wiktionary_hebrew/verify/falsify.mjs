// Try to falsify the stated meaning of every DIVIDING shape. Runs the declaration as measured
// (reconcile lists, Hebrew outside every scope), collects each dividing occurrence with its context,
// and applies probes. Every count printed comes from this run.
// run: node falsify.mjs <by-source jsonl> <out json>
import { readFileSync, writeFileSync } from "node:fs";
import { analyzeRoute, OPTS, R_NOTE_START } from "./classify.mjs";
import { words, isHebLetter } from "./lib.mjs";
OPTS.hebrewOutside = "scopes"; OPTS.reconcile = true;
const [jsonl, out] = process.argv.slice(2);
const W = (key, t) => `${key}: ${t.length > 60 ? t.slice(0, 59) + "…" : t}`;
const probes = {}; const totals = {};
const hit = (shape, probe, key, text, routeSet) => { const k = shape + " | " + probe; const p = probes[k] ||= { count: 0, distinct_texts: new Set(), ex: [] }; p.count++; if (!p.distinct_texts.has(text)) { p.distinct_texts.add(text); if (p.ex.length < 60) p.ex.push(W(key, text) + " ×" ); } };
const openers = {}; const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
const LABELWORDS = /^(figuratively|literally|specifically|especially|colloquially|informally|formally|slang|archaic|obsolete|dated|rare|poetic|poetically|biblical|literary|euphemistic|euphemistically|in particular|by extension|by implication|metaphorically|idiomatically|grammar|linguistics|judaism|christianity|islam|law|legal|military|music|mathematics|physics|chemistry|biology|medicine|anatomy|botany|zoology|computing|sports|religion|transitive|intransitive|plural|singular|masculine|feminine|construct state|possibilities include|possibly|including|includes|include|namely|as follows|e\.g\.?|i\.e\.?|for example|note|usage|usage notes?)$/iu;
const POINTERWORDS = /\b(form|forms|spelling|plural|singular|construct|feminine|masculine|abbreviation|acronym|alternative|synonym|initialism|clipping|ellipsis|diminutive|participle|infinitive|imperative|person|conjugation|tense|gerund|defective|plene|of|with|see|inflection|misspelling|contraction|short)\b/iu;
const lines = readFileSync(jsonl, "utf8").split("\n");
for (const line of lines) {
  if (!line) continue; const r = JSON.parse(line); const s = r.route; const R = analyzeRoute(s);
  if (R.ledByLabel || R.closedByLabel) continue;
  // ---- commas that divide
  for (const p of R.parts) {
    if (!p.commas) continue;
    p.commas.forEach((c, k) => {
      const e = R.commaShape.get(c); if (!e || e.sh !== "comma.gloss_boundary") return;
      bump(totals, "comma.gloss_boundary");
      const left = p.pieces[k].trim(), right = p.pieces[k + 1].trim();
      const lw = words(left.replace(/\([^()]*\)/gu, " ")), rw = words(right.replace(/\([^()]*\)/gu, " "));
      // A8 dangling piece: 1-2 words ending on a preposition, not a 'to' infinitive head
      for (const [pc, pw] of [[left, lw], [right, rw]]) {
        const last = (pw[pw.length - 1] || "").toLowerCase().replace(/[.;:!?]+$/u, "");
        if (pw.length >= 1 && pw.length <= 2 && /^(of|to|from|with|for|in|on|at|by|about|into|onto|upon|toward|towards|against|over|under|after)$/u.test(last) && !(pw.length === 2 && pw[0].toLowerCase() === "to")) hit("comma.gloss_boundary", "a piece is a dangling preposition phrase (1-2 words ending on a preposition): no reading alone", r.key, s);
      }
      // A16 a piece that is only a usage/grammar label
      if (LABELWORDS.test(right.replace(/[.;:!?]+$/u, "")) || LABELWORDS.test(left.replace(/[.;:!?]+$/u, ""))) hit("comma.gloss_boundary", "a piece is only a label (figuratively, plural, slang, ...)", r.key, s);
      // A4 now / today / later + name
      if (/^(now|today|later|nowadays|once|then)\s/iu.test(right) && rw.length >= 2) hit("comma.gloss_boundary", "next piece opens with now/today/later/once/then (a temporal aside, no reading)", r.key, s);
      // A3 participial clause
      if (/^(banned|located|situated|founded|born|died|named|called|known|found|built|established|written|composed|considered|regarded|derived|borrowed|made|held|celebrated|observed|worn|eaten|served|played|spoken)\s+(in|by|on|at|as|from|after|for|to|during|between|with)\b/iu.test(right)) hit("comma.gloss_boundary", "next piece is a participial clause (banned in, located in, named after, ...)", r.key, s);
      // A1 coordinate adjectives: 'a small, round fruit' -> 'a small' + 'round fruit'
      if (/^(a|an|the)\s+\p{L}+$/u.test(left) && rw.length >= 2 && !/^(a|an|the|to|one|any|some|his|her|its|their|my|your|our)\s/iu.test(right) && /^(small|large|big|little|long|short|tall|thin|thick|round|flat|narrow|wide|broad|young|old|new|sharp|heavy|light|dark|bright|soft|hard|dry|wet|hot|cold|deep|high|low|strong|weak|fat|great|white|black|red|green|blue|yellow|brown|sweet|sour|bitter|curved|hollow|smooth|rough|fine|tiny|huge|simple|single|small-sized|wooden|stone|metal|fierce|wild|domestic|venomous|edible|thorny|spiny|elongated|pointed|oval|square|rectangular|circular|fragrant|aromatic|evergreen|deciduous|annual|perennial|herbaceous|woody|climbing|flowering)$/iu.test(lw[1] || "")) hit("comma.gloss_boundary", "coordinate adjectives in one noun phrase split ('a small, round X' -> 'a small' + 'round X')", r.key, s);
      // A2 apposition to a proper name: 'Ashdod, a city in Israel'
      if (/^\p{Lu}\p{Ll}+(\s\p{Lu}\p{Ll}+)?$/u.test(left) && /^(a|an|the)\s.*\b(city|town|village|river|mountain|region|country|kingdom|tribe|people|son|daughter|king|prophet|figure|name|surname|district|island|lake|sea|desert|valley)\b/iu.test(right)) hit("comma.gloss_boundary", "name, then a description of the name (apposition; contested, open question 2)", r.key, s);
      // A5 place, country
      if (/^\p{Lu}[\p{L}.]+$/u.test(left) && /^(Israel|France|Germany|Italy|Spain|Egypt|Russia|Poland|Ukraine|Iran|Iraq|Syria|Lebanon|Jordan|Turkey|Greece|England|Scotland|Ireland|Canada|USA|D\.C\.|California|New York|Texas|Belgium|Holland|Netherlands|Austria|Hungary|Romania|Morocco|Yemen|Ethiopia|India|China|Japan)\.?$/u.test(right)) hit("comma.gloss_boundary", "place, country ('X, Israel'): one name, two pieces", r.key, s);
      // CE1 encyclopedic clause pieces in a name description
      if (/^\p{Lu}/u.test(p.pieces[0].trim()) && words(right).length >= 3 && /^(first |later |formerly |formally |better |now )?(located|founded|banned|written|published|known as|called|built|born|died|named|situated|part of)\b/iu.test(right)) hit("comma.gloss_boundary", "CE1 next piece is a clause about a named thing (located in, banned in 1994, first published in, now known as)", r.key, s);
      // CE2 an explanatory marker alone as a piece
      if (/^(i\.e\.?|e\.g\.?)$/iu.test(right) || /^(i\.e\.?|e\.g\.?|viz\.?)$/iu.test(left)) hit("comma.gloss_boundary", "CE2 a piece is only 'i.e.' or 'e.g.'", r.key, s);
      // CE3 coordinate adjectives
      if (/^(a|an)\s+(small|large|strong|young|old|long|short|thin|thick|round|flat)$/iu.test(left) && words(right).length >= 2 && !/^(a|an|the|to)\s/iu.test(right)) hit("comma.gloss_boundary", "CE3 coordinate adjectives split one noun phrase ('a young, unmarried woman' -> 'a young' + ...)", r.key, s);
      // CE4 place, country
      if (/^\p{Lu}\p{Ll}+$/u.test(left) && /^(France|Israel|Italy|Germany|Spain|Egypt|Syria|Iraq|Iran|Lebanon|Jordan|Turkey|Greece)\.?$/u.test(right)) hit("comma.gloss_boundary", "CE4 'City, Country' is one name in two pieces", r.key, s);
      // CE5 a piece carrying a leftover marker '- i.e'
      if (/\s-\s*i\.?e\.?$/iu.test(right) || /\s-\s*i\.?e\.?$/iu.test(left)) hit("comma.gloss_boundary", "CE5 a piece ends on '- i.e' (the colon belongs to 'i.e:')", r.key, s);
      // CE6 Strong's sigil inside a gloss list (a KJV list copied without ': -')
      if (/^(X|\+)\s/u.test(right)) hit("comma.gloss_boundary", "CE6 a piece opens with Strong's sigil X/+ (a KJV list copied without ': -')", r.key, s);
      // A10 a piece with a finite verb clause: 'X, which/it is ...' not caught
      if (/^(it|this|he|she|they)\s+(is|was|are|were|has|had|can|may|will)\b/iu.test(right)) hit("comma.gloss_boundary", "next piece is a pronoun + finite verb clause ('it is ...')", r.key, s);
      // A11 the next piece opens lowercase 'and'/'or' + one word or opens with 'i.e'/'e.g' variants missed
      if (/^(ie|eg|viz|lit\.?|literally|meaning|cf\.?)\b/iu.test(right) && rw.length >= 2) hit("comma.gloss_boundary", "next piece opens with an explanatory marker (lit., meaning, cf.)", r.key, s);
    });
  }
  // CE17 a segment opened by the gloss 'This'/'It' is taken as a note (the note list's 'it', 'this')
  for (const seg of R.segs) { const t = s.slice(seg[0], seg[1]).replace(/^\s+/u, ""); if (/^(it|this)\s*([:,;.]|$)/iu.test(t)) hit("note role (comma.in_note, semicolon.note_follows)", "CE17 a segment that opens on the gloss 'This:'/'It,' is taken as a usage note", r.key, s); }
  // ---- semicolons
  for (const [i, sh] of R.semiShape) {
    if (sh !== "semicolon.sense_boundary" && sh !== "semicolon.note_follows") continue;
    bump(totals, sh);
    const nextSeg = s.slice(i + 1).split(/;/u)[0].trim();
    bump(openers[sh] ||= {}, words(nextSeg).slice(0, 2).join(" ").toLowerCase());
    if (R.strongsAt >= 0 && i > R.strongsAt) hit(sh, "divides inside a copied Strong's KJV list the colon shape says is held whole", r.key, s);
    if (sh === "semicolon.sense_boundary" && /^(especially (in|figurative)|often used|typically used|usually used|found (almost|chiefly|exclusively|especially|only|mainly|mostly))/iu.test(nextSeg)) hit(sh, "CE7 next segment is a usage note the note-opener list misses (especially figurative., often used attributively, found almost exclusively ...): printed as a reading", r.key, s);
    if (sh === "semicolon.note_follows" && /^also\s*(,|\(|the\b|a\b|an\b)/iu.test(nextSeg)) hit(sh, "CE8 the 'also' segment carries another sense (magic; a formula of prayer; the tribe), not a usage note: no pill for a reading", r.key, s);
    if (sh === "semicolon.sense_boundary") {
      if (/^(especially|chiefly|mostly|mainly|usually|often|rarely|sometimes|only|generally)\s+(figurative|figuratively|literal|literally|poetic|in\b|with\b|of\b|used|found|said|plural|negated|negative|after|before|followed)/iu.test(nextSeg)) hit(sh, "next segment is a usage note the opener list misses (especially figurative., chiefly in, usually with, ...)", r.key, s);
      if (/^(found|occurs|appears|attested|construed|followed|preceded|takes|governs|rare|archaic|obsolete|dated|poetic|literary|biblical|colloquial|slang|informal|formal|vulgar|derogatory|pejorative|plural|singular|uncountable|countable|always|normally|typically|commonly)\b/iu.test(nextSeg)) hit(sh, "next segment opens as a usage/grammar note (found ..., construed with, archaic, ...) the opener list misses", r.key, s);
      if (/^(or|and|but|nor)\b/iu.test(nextSeg) && words(nextSeg).length <= 2) hit(sh, "next segment is a bare conjunction fragment", r.key, s);
    } else {
      if (/^also\b/iu.test(nextSeg) && !/^also\s*,?\s*(used|spelled|spelt|written|called|known|pronounced|as|in|figuratively|with|of|see|plural|construct|attributive|attributively|transitive|intransitive|sometimes|often|rarely|the)\b/iu.test(nextSeg)) hit(sh, "segment opened by 'also' carries another sense (a reading), not a usage note", r.key, s);
      if (/^(it|this)\.?$/iu.test(nextSeg)) hit(sh, "segment is the bare pronoun gloss 'it'/'this' (a reading), taken as a note", r.key, s);
      if (/^(it|this)\s+(\p{L}+)/iu.test(nextSeg) && !/^(it|this)\s+(is|was|can|may|has|refers|denotes|indicates|means|sense|word|term|form|usage|appears|occurs|takes|governs)\b/iu.test(nextSeg)) hit(sh, "segment opened by 'it'/'this' is a gloss (it + noun/verb), not a note", r.key, s);
    }
  }
  // ---- periods
  for (const [i, sh] of R.periodShape) {
    if (sh !== "period.sentence_boundary" && sh !== "period.before_trailing_note") continue;
    bump(totals, sh);
    const before = (s.slice(0, i).match(/[\p{L}\p{N}.'’-]+$/u) || [""])[0];
    const after = s.slice(i + 1).trim();
    bump(openers[sh] ||= {}, before + " | " + words(after).slice(0, 2).join(" "));
    if (sh === "period.sentence_boundary") {
      if (/^also\s*,?\s*(a|an|the|to)\s/iu.test(after)) hit(sh, "CE9 " + "next sentence 'Also, a X.' is a second sense (a reading) but opens as a note (role note, no pill)", r.key, s);
      if (/^(Gen|Ex|Exod|Lev|Num|Deut|Josh|Judg|Sam|Kgs|Chr|Neh|Esth|Ps|Prov|Eccl|Isa|Jer|Ezek|Dan|Hos|Mic|Zech|Mal|Matt|Mk|Lk|Jn|Rom|Cor|Mr|Mrs|Dr|St|Mt|Ft|Gov|Gen|Col|Lt|Capt|Sgt|Rev|Prof|Jr|Sr|Inc|Ltd|Co|vol|ed|no|op|cf|ca|approx)$/u.test(before)) hit(sh, "the word before the period is an abbreviation missing from the list", r.key, s);
      if (/^\d/u.test(after) || /^\p{Lu}\p{Ll}*$/u.test(words(after)[0] || "") && words(after).length === 1) hit(sh, "next 'sentence' is a single word or a number (a name continuation or a citation)", r.key, s);
    } else {
      const g = R.trailing; const c = g ? R.content(g) : "";
      bump(openers["trailing note content"] ||= {}, c.slice(0, 40));
      if (!/\b(see|note|usage|compare|cf|literally|from|this|the|as|in|also|used|often|usually|plural|sense)\b/iu.test(c)) hit(sh, "the closing capitalized group is not a note (a label or name)", r.key, s);
      if (/^In the construct state$/u.test(c)) hit(sh, "CE16 the closing capitalized group is a grammar label '(In the construct state)', not a note; a lowercase one would hold the line", r.key, s);
    }
  }
  // ---- colons
  for (const [i, sh] of R.colonShape) {
    if (!["colon.head_explanation", "colon.pointer_gloss", "colon.gloss_pointer", "colon.strongs_list"].includes(sh)) continue;
    bump(totals, sh);
    const seg = R.segs.find(([a, b]) => i >= a && i < b);
    const before = s.slice(seg[0], i).trim(); const after = s.slice(i + 1, seg[1]).trim();
    if (sh === "colon.head_explanation") {
      const segNote = R_NOTE_START.test(s.slice(seg[0], seg[1]).replace(/^\s+/u, ""));
      if (!segNote && R_NOTE_START.test(after)) hit(sh, "CE10 the explanation is a usage note ('To: used in expressing a range.'), printed as a reading", r.key, s);
      if (segNote) hit(sh, "CE11 the colon divides inside a note segment the declaration says is held whole ('Possibilities include: crack, echo')", r.key, s);
      if (/(^|\s)X\s\p{L}/u.test(after) && /,/u.test(after)) hit(sh, "CE12 the explanation is a KJV list with Strong's sigil X copied without ': -'", r.key, s);
      if (/\bi\.?e$/iu.test(before)) hit(sh, "CE13 the colon is the end of 'i.e:', the head piece keeps '- i.e'", r.key, s);
      bump(openers[sh] ||= {}, words(before).length <= 2 ? before : "(3+ words)");
      if (LABELWORDS.test(before.replace(/[.,]$/u, "")) || /^(?:\(.*\)\s*)?(figuratively|literally|specifically|especially|by extension|in particular|colloquially|slang|archaic|plural|singular)$/iu.test(before)) hit(sh, "the head is a label or list introducer, not a gloss ('Figuratively: ...', 'Possibilities include: ...')", r.key, s);
      if (/\b(include|includes|including|namely|as follows|e\.g|i\.e|for example|such as|e\.g\.|i\.e\.)$/iu.test(before)) hit(sh, "the head ends on a list/example introducer: the colon introduces items, not an explanation of a gloss", r.key, s);
      if (/^["“‘']/u.test(after)) hit(sh, "the right side is a quotation, not an explanation", r.key, s);
      if (/^[-–]/u.test(after)) hit(sh, "the right side opens with a dash: a Strong's ':-' list the strongs test misses", r.key, s);
      if (R.P.groups.some((g) => g.kind === "(" && g.close < 0 && g.open < i)) hit(sh, "colon after an unclosed opener", r.key, s);
      if (/^(it|this|he|she|they)\s+(is|was|are|were)\b/iu.test(after) || /\b(is|are|was|were)\b/iu.test(before) && words(before).length >= 4) hit(sh, "a side is a full clause with a finite verb (the colon joins sentences, not head and explanation)", r.key, s);
    }
    if (sh === "colon.pointer_gloss") {
      if (!POINTERWORDS.test(before)) hit(sh, "the Hebrew-bearing left side is not a form pointer (no form/plural/construct/of ... vocabulary)", r.key, s);
      if (/[א-ת]/u.test(after.replace(/\([^()]*\)/gu, "").replace(/\[[^\]]*\]/gu, ""))) hit(sh, "the right side also carries Hebrew (not a plain gloss list)", r.key, s);
      if (/^(plural|singular|construct|feminine|masculine|defective|alternative|synonym|see|abbreviation)\b/iu.test(after)) hit(sh, "the right side is grammar or a pointer, not glosses", r.key, s);
    }
    if (sh === "colon.gloss_pointer") {
      if (!POINTERWORDS.test(after)) hit(sh, "CE15 the Hebrew-bearing right side is a list of Hebrew terms, not a form pointer", r.key, s);
      bump(openers[sh] ||= {}, words(after).slice(0, 3).join(" "));
    }
    if (sh === "colon.strongs_list") {
      bump(openers[sh] ||= {}, after.slice(0, 30));
      if (!/[,X+]|\(-|\bX\b/u.test(after)) hit(sh, "the text after ': -' is not a KJV list", r.key, s);
    }
  }
  // colon written ':-' or ':–' with no space: not caught by the strongs test
  for (let i = 0; i < s.length; i++) if (s[i] === ":" && /^[-–]/u.test(s.slice(i + 1)) && !R.P.inScope(i)) hit("colon.(any)", "colon written ':-' with no space after it", r.key, s);
}
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const res = { totals, probes: Object.fromEntries(Object.entries(probes).map(([k, v]) => [k, { count: v.count, distinct_route_texts: v.distinct_texts.size, examples: v.ex }])), openers: Object.fromEntries(Object.entries(openers).map(([k, v]) => [k, top(v, 60)])) };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify(totals)); for (const [k, v] of Object.entries(res.probes)) console.log(`${v.count}\t${v.distinct_route_texts}\t${k}\n\t\t${v.examples.slice(0, 4).join("\n\t\t")}`);
