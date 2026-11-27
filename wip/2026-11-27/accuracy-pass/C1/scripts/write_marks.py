# Writes marks-<source key>.tsv: every mark counted in the source's own readings and in our served rows,
# with the source's own explanation, the rule the ledger declares, what the page does, and the verdict.
# Run: python3 -I write_marks.py <out dir> <reader/data>
import sys, os, json, collections
W, DATA = sys.argv[1:3]
cen = json.load(open(os.path.join(W, 'data', 'marks-census.json'), encoding='utf-8'))
def n(name, ch):
    m = cen[name]['marks'].get(ch)
    return f"{m['occurrences']} ({m['texts']})" if m else '0'
def shapes(key, chars):
    d = json.load(open(os.path.join(DATA, 'ledgers-v1', key, 'declaration.json')))
    br = {}
    for b in d['branches']:
        for s in b['shapes']: br[s] = b['id']
    out = []
    for s in d['shapes']:
        if s['mark'] in chars: out.append(f"{s['id']} {s['count']}" + (' [unverified]' if s['means'].startswith('unverified') else '') + (f" [{br[s['id']]}]" if s['id'] in br else ''))
    return '; '.join(out)
TAHOT_NOTE = "TAHOT file head, FIELD DESCRIPTIONS, English translation"
T = 'stepbible_tahot_aligned_translation'
hdrT = ['mark', 'in the source: occurrences (texts), 305,652 translation cells', 'in our served rows (M4): occurrences (texts), 91,301 rows', 'on the words (pieces): occurrences (texts), 304,498 words', 'on the lines at rest: occurrences (texts), 304,494 lines', "the source's own explanation, quoted, and where", "the ledger's declared shapes (count) and the owner's ruling", 'what the page does where the reading prints', 'verdict']
rowsT = [
 ['/ forward slash',
  "«Forward slash ( / ) separates the translation to mirror the prefixes, root and suffixes in Hebrew. This means the order of English words follows the order within the Hebrew word.» (" + TAHOT_NOTE + ")",
  'no cut; each side is a piece of one reading',
  "printed as the joiner « + » (tools/gloss-store-v1.mjs printedForm; zone.html spanJoin); a joiner stands only between two pieces that print",
  "honored on 304,463 of 304,484 words whose pieces are TAHOT's (byte for byte). The source breaks its own rule on 140 rows of the Aramaic ending (finding T3). The page applies the same joiner to every other source's slash (finding B2)."],
 ['[ ] square brackets',
  "«Words in [square brackets] aren't in the Hebrew but are implied and are best included in a translation.» (" + TAHOT_NOTE + ")",
  'B01, B02 ruled no_pill for rows with no English outside brackets and for tails of cut words',
  "kept as written inside a piece; a piece that is a square bracket alone is hidden at rest (signOnly, zone.html 3687); a pill holding a square bracket is not offered at rest (hasSourceSign, zone.html 3684 and 12858)",
  "FINDING T1: the page's signs rule treats the square bracket as a sign to switch off, against the source's «best included»: 20,048 served rows are withheld at rest for a square bracket (19,193 for that alone), and 3 lines lose a bracketed word. FINDING T4: at 13 read-form places the brackets are taken off the words."],
 ['< > angle brackets',
  "«Words in <angle brackets> are in the Hebrew but are best not included in a translation.» (" + TAHOT_NOTE + ")",
  'B01, B03 ruled no_pill for rows with no English outside brackets',
  "a piece that is one angle bracket alone is hidden at rest and its place kept as a gap (13,519 pieces); a word whose every piece is a sign prints the sign where it stands free (598 lines) and nothing where it is tied by maqaf (6,593 lines); angle words inside a piece are printed, brackets and all (7,735 pieces); a pill holding one is not offered at rest",
  "honored for whole pieces. Two unevennesses, finding T6: a piece of two bracketed signs («<in> <the>») is printed at 336 places where a piece of one is hidden; a sign-only word prints «<obj.>» at 598 places and nothing at 6,593."],
 ['. full stop (in <obj.>)', "none of its own: the point of the short form inside the object sign; the tag H0853 is glossed «[Obj.]» in TBESH", 'no cut', "printed with the sign; one closing stop of a reading is dropped (printedForm), which touches no TAHOT row", 'clean'],
 ['- hyphen',
  "for the cut names and numbers: «A \"+\" indicates the same tag also covers the next Hebrew word» (dStrongs field); the hyphen itself is not explained",
  'B02, B03, B04 ruled no_pill for rows that are half of a word or name (341 rows print no pill)',
  "on the line each word prints its own half («Beth-», «-el»); the card opened on a pair shows both («Beth- + -el»)",
  "honored: the halves are TAHOT's own at 741 lines; the plus tag is on 785 source rows and both words carry the same tag"],
 ['! exclamation mark',
  "none in the file head; the tags H9012 and H9013 behind the lone «!» are glossed «[emph.?]» in TBESH",
  'no cut; exclamation.on_a_word is unverified',
  "printed; a piece that is «!» alone prints as « + !» (708 lines), since the page's list of sign-only pieces does not hold it",
  "FINDING T6 (uneven): the lone «¿» is hidden and the lone «!» is printed, though both are the source's signs for a Hebrew particle with no English word"],
 ['? question mark', 'none', 'no cut; every shape unverified', 'printed as written', 'no declared meaning from the source; printed as the source writes it'],
 ['¿ inverted question mark', "none in the file head; the tag H9008 behind it is glossed «[?]» in TBESH", 'no cut', "hidden at rest where it is a piece of its own (747 of 748 lines); a pill holding it is not offered at rest", 'treated as a sign; consistent with the angle bracket'],
 ["' apostrophe", 'plain English spelling', 'no cut', 'printed', 'clean'],
 [': colon', 'none', 'no cut; unverified («this:», «ofK:»)', 'printed', "the source's own slip «[the] rest ofK:» (Zephaniah 2:9 word 26) is printed on the line as written (finding T7)"],
 ['; semicolon', 'none', 'no cut; unverified («deliverance; [surely]», Psalms 32:7)', 'printed', 'printed as written, one place'],
 ['{ } and + in the tag column', "«Lexical tags for each element of the Hebrew words, including prefixes and suffixes, with the Root in {curly brackets}. A \"+\" indicates the same tag also covers the next Hebrew word.» (dStrongs field)", 'not a mark of the English; read by the corpus lane (lattice, spelling bridge v1.2)', "the root tag is the word's tag (tg) and the pieces' grades (prefix, core, suffix) follow the braces", "honored: tag equal at 304,260 words, grades at 304,463; not carried at 1,091 words our text spells otherwise (finding T5)"],
]
marksT = ['/', '[', '<', '.', '-', '!', '?', '¿', "'", ':', ';', None]
with open(os.path.join(W, f'marks-{T}.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdrT) + '\n')
    for ch, r in zip(marksT, rowsT):
        if ch is None: cells = ['785 rows carry +', 'not in the rows', 'not on the pieces', 'not printed']
        else:
            pair = {'[': ']', '<': '>'}.get(ch)
            cells = [n('tahot_source', ch), n('tahot_served_rows', ch), n('tahot_pieces_on_words', ch), ('148607 (132050) as « + »' if ch == '/' else n('tahot_lines_at_rest', ch))]
        sh = shapes(T, [ch] + ([{'[': ']', '<': '>'}[ch]] if ch in '[<' else [])) if ch else ''
        o.write('\t'.join([r[0]] + cells + [r[1], (sh + ' || ' if sh else '') + r[2], r[3], r[4]]) + '\n')
# ---------- TBESH
B = 'stepbible_tbesh_gloss'
hdrB = ['mark', 'in the source: occurrences (texts), 11,682 Gloss cells', 'in our served rows (M19): occurrences (texts), 2,808 rows', "the source's own explanation, quoted, and where", "the ledger's declared shapes (count) and the owner's ruling", 'what the page does where the reading prints', 'verdict']
rowsB = [
 [':', ': colon', "none for the Gloss column. Of the numbers the file head says: «These Disambiguated Strong numbers differentiates distinct sub-meaning of words, and distinct indivuduals with the same name»; TAHOT's head says a tag carries «an English gloss, and its sub-meaning after \" » \" where appropriate»", "B01 ruled divides (538 rows): a pill for the head and a pill for the sense; 48 rows kept whole by a hand list", "cut at the colon into two pills (row slot 7)", "honored as the owner ruled. The sense is bound to a place by STEP's lettered tag, and the page uses it: a sense row of another letter is withheld (entry gate, STEP'S LETTERS)"],
 ['/', '/ slash', 'none', "B02 ruled divides for 40 rows of parts that stand alone; 7 rows stay whole («to break up/open»: the endings share one word)", "the 40 rows are cut into pills; the 7 whole rows print with the joiner « + »: «to break up + open», «to be + bear firstborn», «to draw (up + out)»", "FINDING B2: the joiner is TAHOT's sign for parts of one Hebrew word; on these 7 rows the slash means «or». 19 places at least"],
 ['(', '( ) round brackets', 'none', 'no cut; a part of a name, an optional word, a pronoun label («they(fem.)»)', 'printed as written', 'printed as the source writes; no explanation from the source (the ledger marks every shape unverified)'],
 ['[', '[ ] square brackets', "none in TBESH. (TAHOT's key for its own column does not bind this file.)", 'B05 ruled no_pill for «[Obj.]»', "«[Obj.]» prints no pill; the other 6 rows («to make: [do]», «[Ben]jaminite», «Second [Quarter]») are not offered at rest, as readings that hold a sign", "a rule made for TAHOT's sign fires on TBESH's brackets, which no key explains: 6 rows withheld at rest (part of finding T1's cause)"],
 ['-', '- hyphen', 'none', 'B04 ruled no_pill for «Ir-»', 'printed', 'clean'],
 ['`', '` grave accent', "none: «the source says nothing of the sign, which stands on 15 lines of its gloss column» (the ledger)", 'no cut; unverified', "printed as written: «`second`», «`brother`», «`men`»", "FINDING B4: 14 served rows print a sign neither the source nor the ledger explains"],
 ['!', '! exclamation mark', 'none', 'no cut', 'printed', 'clean'],
 ['?', '? question mark', 'none', 'no cut', 'printed', 'clean'],
 ['.', '. full stop', 'none', 'no cut (short forms in labels)', 'printed; a closing stop would be dropped (none closes a row)', 'clean'],
 ["'", "' apostrophe", 'plain English spelling', 'B04 ruled no_pill for halves of place names («King\'s»)', 'printed', 'clean'],
 [',', ', comma', 'none', "B03 held whole («Samgar, Nebu-sar-sekim»)", 'one pill', 'clean'],
 ['¶', '¶ pilcrow and & ampersand', "the glosses of the punctuation tags H9017 to H9019 («[¶]») and of H9001 («&»)", 'not served (their Hebrew column holds no letters)', 'not printed', 'not served'],
]
with open(os.path.join(W, f'marks-{B}.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdrB) + '\n')
    for r in rowsB:
        ch = r[0]
        chars = [ch] + ([')'] if ch == '(' else [']'] if ch == '[' else [])
        sh = shapes(B, chars)
        o.write('\t'.join([r[1], n('tbesh_source', ch), n('tbesh_served_rows', ch), r[2], (sh + ' || ' if sh else '') + r[3], r[4], r[5]]) + '\n')
# ---------- MACULA
M = 'macula_hebrew_cherith_surface_english_2022'
hdrM = ['mark', 'in the source: occurrences (texts), 51,985 distinct letters-and-english pairs of 475,911 rows', 'in our served rows (M3): occurrences (texts), 45,095 rows', "the source's own explanation, quoted, and where", "the ledger's declared shapes (count) and the owner's ruling", 'what the page does where the reading prints', 'verdict']
rowsM = [
 ['~', '~ tilde', "none. The source's pages read for this pass (README.md, LICENSE.md, WLC/tsv/README.md, sources/Cherith/README.md) do not name it; the folder sources/Cherith/glosses the license points to was not read", 'no cut; every shape unverified: a gap in one English phrase («bring ~ back»)', "a reading that holds « ~ » is not offered at rest (the page's fifth sign pattern); a tilde glued to a word («~south», «apart~») is printed", "FINDING M2: 1,862 served rows are withheld at rest on a sign the source does not explain; 9 glued rows print the sign bare"],
 ['’', '’ curly apostrophe', 'plain English spelling', 'no cut', 'printed', 'clean'],
 ['-', '- hyphen', 'plain English spelling', 'no cut', 'printed', 'clean'],
 ['!', '! exclamation mark', 'none', 'no cut', 'printed', 'clean'],
 ['?', '? question mark', 'none', 'no cut', 'printed', 'clean'],
 ['(', '( ) round brackets', 'none', "B02 ruled no_pill for the rows that are sums of numbers («(6997a=1886a+6997)»); B03 ruled the number off the pill («Ben (1128)» prints «Ben»)", 'as ruled; the other brackets print as written («(happy)», «(just) above»)', 'honored as ruled'],
 ['/', '/ slash', 'none', "B01 ruled divides for the one row («thumbs/big toes of»)", 'two pills, «thumbs» and «big toes of»', 'honored as ruled; the first pill loses the «of» the two share, as the ruling says'],
 ['.', '. full stop', 'none («.and», one row)', 'no cut; unverified', 'printed as written', "the source's slip printed, one row"],
 ['=', '= + in a sum of numbers', 'none', 'B02 no_pill', 'no pill', 'honored as ruled'],
 ['X', 'X at the head of a row («X and», «X also»)', 'none', "no shape: the declaration leaves the row «X» to the store", "the page's pattern for Strong's sign (STRONG_SIGN, «X » at the head) matches these 2 rows: they sort last and are not offered at rest", "a rule declared for Strong's mark fires on MACULA's letter: 2 rows (finding M2)"],
 [',', ', comma and ` grave accent', "in the source only («1,000», «2,000», «`»)", 'not served under these letters', 'not printed', 'not served'],
]
with open(os.path.join(W, f'marks-{M}.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdrM) + '\n')
    for r in rowsM:
        ch = r[0]
        chars = [ch] + ([')'] if ch == '(' else ['+'] if ch == '=' else [])
        sh = shapes(M, chars) if ch != 'X' else ''
        o.write('\t'.join([r[1], n('macula_source_distinct_pairs', ch) if ch != 'X' else '6 rows read X alone', n('macula_served_rows', ch) if ch != 'X' else '2 rows open with «X »', r[2], (sh + ' || ' if sh else '') + r[3], r[4], r[5]]) + '\n')
print('written')
