import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2] || 'data/sources';
const lexicalDir = process.argv[3] || 'data/lexical';
const occurrencesDir = path.join(lexicalDir, 'occurrences');
const lexiconPath = path.join(lexicalDir, 'lexicon.json');
const lexiconLayerDir = path.join(lexicalDir, 'source-layers');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const tokenIndexesDir = path.join(lexicalDir, 'token-indexes');
const reportPath = process.env.LEXICAL_REPORT_PATH || 'reports/sitewide-lexical-build-report.md';
const lexicalScope = {
  label: 'All imported Hebrew works',
};
const lexicalLayerFiles = [
  {
    layer_id: 'project-overrides',
    source_family: 'workspace',
    license: 'N/A - project-authored lexical rules',
    path: 'source-layers/project-overrides.json',
    description: 'Project-authored fixed expression and grammar override entries.',
  },
  {
    layer_id: 'project-abbreviations',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-abbreviations.json',
    description: 'Project-authored conservative Hebrew abbreviation expansions.',
  },
  {
    layer_id: 'project-aramaic-grammar',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-aramaic-grammar.json',
    description: 'Project-authored conservative Aramaic grammar and common-form rows.',
  },
  {
    layer_id: 'project-zohar-ari-technical-terms',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-zohar-ari-technical-terms.json',
    description: 'Project-authored scoped Zohar/Ari technical term rows. Short factual mappings only.',
  },
  {
    layer_id: 'project-function-words',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-function-words.json',
    description: 'Project-authored conservative Hebrew function-word grammar rules.',
  },
  {
    layer_id: 'project-midrash-formulas',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-midrash-formulas.json',
    description: 'Project-authored scoped Midrash citation formulas, source labels, and proper-name labels. Short factual mappings only.',
  },
  {
    layer_id: 'project-orot-technical-terms',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-orot-technical-terms.json',
    description: 'Project-authored Orot-specific technical term rows. Scoped to Orot only.',
  },
  {
    layer_id: 'wikidata-cc0',
    source_family: 'wikidata',
    license: 'CC0',
    path: 'source-layers/wikidata-cc0.json',
    description: 'Entries whose source rows are entirely Wikidata Lexeme CC0 rows.',
  },
  {
    layer_id: 'openscriptures-cc-by-4',
    source_family: 'openscriptures',
    license: 'CC BY 4.0',
    path: 'source-layers/openscriptures-cc-by-4.json',
    description: 'Entries containing OpenScriptures CC BY 4.0 rows, including mixed clean-source entries.',
  },
  {
    layer_id: 'kaikki-wiktionary-cc-by-sa-gfdl',
    source_family: 'kaikki',
    license: 'CC BY-SA 4.0 / GFDL',
    path: 'source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json',
    status: 'placeholder',
    description: 'Reserved future layer for Wiktionary via Kaikki data. No data is imported in this task.',
  },
];

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCompactJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, 'utf8');
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)}`;
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4');
}

function normalizeHebrewToken(value) {
  const stripped = normalizeHebrewPunctuation(value).replace(niqqudRe, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function hasAbbreviationMark(value) {
  return /[\u05F3\u05F4'"]/.test(value);
}

function normalizeHebrewTokenWithQubutsMater(value) {
  const text = normalizeHebrewPunctuation(value);
  const output = [];
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!/[\u05D0-\u05EA]/u.test(char)) continue;
    output.push(finalLetters.get(char) || char);
    let markIndex = index + 1;
    let hasQubuts = false;
    while (markIndex < text.length && /[\u0591-\u05C7]/u.test(text[markIndex])) {
      if (text[markIndex] === '\u05BB') hasQubuts = true;
      markIndex += 1;
    }
    if (hasQubuts && text[markIndex] !== '\u05D5') output.push('\u05D5');
  }
  return output.join('');
}

function getTokens(text) {
  return Array.from(String(text || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function abbreviationSurfaceForms(surface) {
  const canonical = normalizeHebrewPunctuation(surface);
  const asciiVariant = canonical.replace(/\u05F4/gu, '"').replace(/\u05F3/gu, "'");
  return unique([canonical, asciiVariant]);
}

const projectAbbreviationDefinitions = [
  { source_id: 'project-abbreviation:ayin-yod', surface: 'ע״י', expansion: 'על ידי', renderings: ['by', 'through', 'by means of'] },
  { source_id: 'project-abbreviation:vav-ayin-yod', surface: 'וע״י', expansion: 'על ידי', renderings: ['and by', 'and through', 'and by means of'], breakdown: [{ hebrew: 'ו־', strict_renderings: ['and'] }, { hebrew: 'ע״י', strict_renderings: ['by', 'through', 'by means of'] }] },
  { source_id: 'project-abbreviation:shin-ayin-yod', surface: 'שע״י', expansion: 'על ידי', renderings: ['that by', 'which through', 'by which'], breakdown: [{ hebrew: 'ש־', strict_renderings: ['that', 'which'] }, { hebrew: 'ע״י', strict_renderings: ['by', 'through', 'by means of'] }] },
  { source_id: 'project-abbreviation:gimel-kaf', surface: 'ג״כ', expansion: 'גם כן', renderings: ['also', 'likewise'] },
  { source_id: 'project-abbreviation:af-al-pi', surface: 'אע״פ', expansion: 'אף על פי', renderings: ['although', 'even though'] },
  { source_id: 'project-abbreviation:vav-af-al-pi', surface: 'ואע״פ', expansion: 'אף על פי', renderings: ['and although', 'even though'], breakdown: [{ hebrew: 'ו־', strict_renderings: ['and'] }, { hebrew: 'אע״פ', strict_renderings: ['although', 'even though'] }] },
  { source_id: 'project-abbreviation:kaf-kaf', surface: 'כ״כ', expansion: 'כל כך', renderings: ['so much', 'so', 'to such an extent'] },
  { source_id: 'project-abbreviation:mem-mem', surface: 'מ״מ', expansion: 'מכל מקום', renderings: ['nevertheless', 'in any case'] },
  { source_id: 'project-abbreviation:ayin-pe', surface: 'ע״פ', expansion: 'על פי', renderings: ['according to', 'based on', 'by'] },
  { source_id: 'project-abbreviation:ayin-kaf', surface: 'ע״כ', expansion: 'על כן', renderings: ['therefore', 'therefore so', 'on account of this'] },
  { source_id: 'project-abbreviation:ayin-dalet', surface: 'ע״ד', expansion: 'על דבר', renderings: ['concerning', 'regarding', 'about'] },
  { source_id: 'project-abbreviation:kaf-vav', surface: 'כו׳', expansion: 'וכו׳', renderings: ['etc.', 'and so forth'] },
  { source_id: 'project-abbreviation:vav-kaf-vav', surface: 'וכו׳', expansion: 'וכו׳', renderings: ['etc.', 'and so forth'] },
  { source_id: 'project-abbreviation:vav-gimel-vav', surface: 'וגו׳', expansion: 'וגומר', renderings: ['etc.', 'and the rest'] },
  { source_id: 'project-abbreviation:dibbur-hamatchil', surface: 'ד״ה', expansion: 'דיבור המתחיל', renderings: ['opening words', 'comment beginning'] },
  { source_id: 'project-abbreviation:kemo-shekatuv', surface: 'כמ״ש', expansion: 'כמו שכתוב / כמו שנאמר', renderings: ['as written', 'as stated'] },
  { source_id: 'project-abbreviation:vav-kemo-shekatuv', surface: 'וכמ״ש', expansion: 'כמו שכתוב / כמו שנאמר', renderings: ['and as written', 'and as stated'], breakdown: [{ hebrew: 'ו־', strict_renderings: ['and'] }, { hebrew: 'כמ״ש', strict_renderings: ['as written', 'as stated'] }] },
  { source_id: 'project-abbreviation:kemo-shema-sham', surface: 'כמש״ש', expansion: 'כמו שכתב שם / כמו שנאמר שם', renderings: ['as written there', 'as stated there'] },
  { source_id: 'project-abbreviation:vav-kemo-shema-sham', surface: 'וכמש״ש', expansion: 'כמו שכתב שם / כמו שנאמר שם', renderings: ['and as written there', 'and as stated there'], breakdown: [{ hebrew: 'ו־', strict_renderings: ['and'] }, { hebrew: 'כמש״ש', strict_renderings: ['as written there', 'as stated there'] }] },
  { source_id: 'project-abbreviation:siman', surface: 'סי׳', expansion: 'סימן', renderings: ['section', 'sign', 'siman'] },
  { source_id: 'project-abbreviation:tosafot', surface: 'תוס׳', expansion: 'תוספות', renderings: ['Tosafot'] },
  { source_id: 'project-abbreviation:ayin-tosafot', surface: 'עתוס׳', expansion: 'עיין תוספות', renderings: ['see Tosafot'] },
  { source_id: 'project-abbreviation:vav-ayin-tosafot', surface: 'ועתוס׳', expansion: 'עיין תוספות', renderings: ['and see Tosafot'], breakdown: [{ hebrew: 'ו־', strict_renderings: ['and'] }, { hebrew: 'עתוס׳', strict_renderings: ['see Tosafot'] }] },
  { source_id: 'project-abbreviation:kanal', surface: 'כנ״ל', expansion: 'כנזכר לעיל', renderings: ['as mentioned above'] },
  { source_id: 'project-abbreviation:hanal', surface: 'הנ״ל', expansion: 'הנזכר לעיל', renderings: ['the above-mentioned'] },
  { source_id: 'project-abbreviation:hanizkar', surface: 'הנז׳', expansion: 'הנזכר', renderings: ['the mentioned', 'the aforementioned'] },
  { source_id: 'project-abbreviation:kanizkar', surface: 'כנז׳', expansion: 'כנזכר', renderings: ['as mentioned'] },
  { source_id: 'project-abbreviation:kanizkar-full', surface: 'כנזכר', expansion: 'כנזכר', renderings: ['as mentioned'] },
  { source_id: 'project-abbreviation:hanizkar-full', surface: 'הנזכר', expansion: 'הנזכר', renderings: ['the mentioned', 'the aforementioned'] },
  { source_id: 'project-abbreviation:perush', surface: 'פי׳', expansion: 'פירוש', renderings: ['explanation', 'commentary', 'meaning'] },
  { source_id: 'project-abbreviation:ayin-sham', surface: 'ע״ש', expansion: 'עיין שם', renderings: ['see there'] },
  { source_id: 'project-abbreviation:bechina', surface: 'בחי׳', expansion: 'בחינה / בחינת', renderings: ['aspect', 'category', 'mode'] },
  { source_id: 'project-abbreviation:gemara', surface: 'גמ׳', expansion: 'גמרא', renderings: ['Gemara'] },
  { source_id: 'project-abbreviation:be-gemara', surface: 'בגמ׳', expansion: 'בגמרא', renderings: ['in the Gemara'], breakdown: [{ hebrew: 'ב־', strict_renderings: ['in'] }, { hebrew: 'גמ׳', strict_renderings: ['Gemara'] }] },
  { source_id: 'project-abbreviation:matnitin', surface: 'מתני׳', expansion: 'מתניתין / משנה', renderings: ['Mishnah'] },
  { source_id: 'project-abbreviation:be-matnitin', surface: 'במתני׳', expansion: 'במתניתין / במשנה', renderings: ['in the Mishnah'], breakdown: [{ hebrew: 'ב־', strict_renderings: ['in'] }, { hebrew: 'מתני׳', strict_renderings: ['Mishnah'] }] },
  { source_id: 'project-abbreviation:afilu', surface: 'אפי׳', expansion: 'אפילו', renderings: ['even', 'even if'] },
  { source_id: 'project-abbreviation:rabbi', surface: 'ר׳', expansion: 'רבי / רב', renderings: ['Rabbi', 'Rav'] },
  { source_id: 'project-abbreviation:rashi', surface: 'רש״י', expansion: 'רבי שלמה יצחקי', renderings: ['Rashi'] },
  { source_id: 'project-abbreviation:rambam', surface: 'הרמב״ם', expansion: 'רבי משה בן מימון', renderings: ['Rambam', 'Maimonides'] },
  { source_id: 'project-abbreviation:rashba', surface: 'הרשב״א', expansion: 'רבי שלמה בן אדרת', renderings: ['Rashba'] },
  { source_id: 'project-abbreviation:rotzeh-lomar', surface: 'ר״ל', expansion: 'רוצה לומר', renderings: ['that is to say', 'meaning'] },
  { source_id: 'project-abbreviation:vezeh-leshono', surface: 'וז״ל', expansion: 'וזה לשונו', renderings: ['and this is his language', 'as follows'] },
  { source_id: 'project-abbreviation:zichrono-livracha', surface: 'ז״ל', expansion: 'זכרונו לברכה', renderings: ['of blessed memory'] },
  { source_id: 'project-abbreviation:veyesh-omrim', surface: 'וי״א', expansion: 'ויש אומרים', renderings: ['and some say'] },
  { source_id: 'project-abbreviation:savira-lei', surface: 'ס״ל', expansion: 'סבירא ליה', renderings: ['he holds', 'he maintains'] },
  { source_id: 'project-abbreviation:im-ken', surface: 'א״כ', expansion: 'אם כן', renderings: ['if so', 'therefore'] },
  { source_id: 'project-abbreviation:mah-she-ein-ken', surface: 'משא״כ', expansion: 'מה שאין כן', renderings: ['unlike', 'which is not so'] },
  { source_id: 'project-abbreviation:vehu-hadin', surface: 'וה״ה', expansion: 'והוא הדין', renderings: ['and the same law applies'] },
  { source_id: 'project-abbreviation:af-al-gav', surface: 'אע״ג', expansion: 'אף על גב', renderings: ['even though', 'although'] },
  { source_id: 'project-abbreviation:vekol-sheken', surface: 'וכ״ש', expansion: 'וכל שכן', renderings: ['all the more so'] },
  { source_id: 'project-abbreviation:kol-zeh', surface: 'כ״ז', expansion: 'כל זה', renderings: ['all this'] },
  { source_id: 'project-abbreviation:al-yedei-zeh', surface: 'עי״ז', expansion: 'על ידי זה', renderings: ['by this', 'through this'] },
  { source_id: 'project-abbreviation:achar-kach', surface: 'אח״כ', expansion: 'אחר כך', renderings: ['afterward', 'after that'] },
  { source_id: 'project-abbreviation:hakadosh-baruch-hu', surface: '\u05D4\u05E7\u05D1\u05F4\u05D4', expansion: '\u05D4\u05E7\u05D3\u05D5\u05E9 \u05D1\u05E8\u05D5\u05DA \u05D4\u05D5\u05D0', renderings: ['the Holy One, blessed be He'] },
  { source_id: 'project-abbreviation:orot-ei-efshar', surface: '\u05D0\u05F4\u05D0', expansion: '\u05D0\u05D9 \u05D0\u05E4\u05E9\u05E8', renderings: ['impossible', 'it is not possible'], work_scope: 'orot' },
  { source_id: 'project-abbreviation:zeir-anpin', surface: 'ז״א', expansion: 'זעיר אנפין', renderings: ['Zeir Anpin'], work_scope: 'kabbalah' },
  { source_id: 'project-abbreviation:de-zeir-anpin', surface: 'דז״א', expansion: 'דזעיר אנפין', renderings: ['of Zeir Anpin'], work_scope: 'kabbalah', breakdown: [{ hebrew: 'ד־', strict_renderings: ['of'] }, { hebrew: 'ז״א', strict_renderings: ['Zeir Anpin'] }] },
  { source_id: 'project-abbreviation:de-zeir', surface: 'דזעיר', expansion: 'דזעיר אנפין', renderings: ['of Zeir Anpin'], work_scope: 'kabbalah', breakdown: [{ hebrew: 'ד־', strict_renderings: ['of'] }, { hebrew: 'זעיר', strict_renderings: ['Zeir'] }] },
  { source_id: 'project-abbreviation:arikh-anpin', surface: 'א״א', expansion: 'אריך אנפין', renderings: ['Arikh Anpin'], work_scope: 'kabbalah' },
  { source_id: 'project-abbreviation:de-arikh-anpin', surface: 'דא״א', expansion: 'דאריך אנפין', renderings: ['of Arikh Anpin'], work_scope: 'kabbalah', breakdown: [{ hebrew: 'ד־', strict_renderings: ['of'] }, { hebrew: 'א״א', strict_renderings: ['Arikh Anpin'] }] },
];

const aggadatBereshitScope = 'aggadat-bereshit';
const midrashAggadahScope = 'midrash_aggadah';
const projectMidrashFormulaDefinitions = [
  {
    source_id: 'project-midrash-formula:davar-acher',
    surface: '\u05D3\u05F4\u05D0',
    expansion: '\u05D3\u05D1\u05E8 \u05D0\u05D7\u05E8',
    renderings: ['another interpretation', 'another matter'],
    kind: 'Midrash formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:zeh-sheamar-hakatuv',
    surface: '\u05D6\u05E9\u05F4\u05D4',
    expansion: '\u05D6\u05D4 \u05E9\u05D0\u05DE\u05E8 \u05D4\u05DB\u05EA\u05D5\u05D1',
    renderings: ['this is what Scripture says'],
    kind: 'Midrash citation formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:sheneemar',
    surface: '\u05E9\u05E0\u05D0\u05DE\u05E8',
    surface_forms: ['\u05E9\u05E0\u05D0\u05F3'],
    expansion: '\u05E9\u05E0\u05D0\u05DE\u05E8',
    renderings: ['as it is said', 'as stated'],
    kind: 'Midrash citation formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:neemar',
    surface: '\u05E0\u05D0\u05DE\u05E8',
    expansion: '\u05E0\u05D0\u05DE\u05E8',
    renderings: ['it is said', 'it is stated'],
    kind: 'Midrash citation formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:ketiv',
    surface: '\u05DB\u05EA\u05D9\u05D1',
    expansion: '\u05DB\u05EA\u05D9\u05D1',
    renderings: ['it is written'],
    kind: 'Midrash citation formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:deketiv',
    surface: '\u05D3\u05DB\u05EA\u05D9\u05D1',
    expansion: '\u05D3\u05DB\u05EA\u05D9\u05D1',
    renderings: ['as it is written', 'that it is written'],
    kind: 'Midrash citation formula',
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['that', 'which', 'of'] },
      { hebrew: '\u05DB\u05EA\u05D9\u05D1', strict_renderings: ['it is written'] },
    ],
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:vegomer',
    surface: '\u05D5\u05D2\u05D5\u05DE\u05E8',
    expansion: '\u05D5\u05D2\u05D5\u05DE\u05E8',
    renderings: ['etc.', 'and the rest'],
    kind: 'Citation continuation formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-label:hashem',
    surface: '\u05D4\u05F3',
    expansion: '\u05D4\u05E9\u05DD',
    renderings: ['the Lord', 'the divine Name'],
    kind: 'Divine-name abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-label:vav-hashem',
    surface: '\u05D5\u05D4\u05F3',
    expansion: '\u05D5\u05D4\u05E9\u05DD',
    renderings: ['and the Lord', 'and the divine Name'],
    kind: 'Divine-name abbreviation',
    breakdown: [
      { hebrew: '\u05D5\u05BE', strict_renderings: ['and'] },
      { hebrew: '\u05D4\u05F3', strict_renderings: ['the Lord', 'the divine Name'] },
    ],
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:amar-rabbi',
    surface: '\u05D0\u05F4\u05E8',
    expansion: '\u05D0\u05DE\u05E8 \u05E8\u05D1\u05D9',
    renderings: ['Rabbi said', 'said Rabbi'],
    kind: 'Rabbinic attribution formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:amar-lo',
    surface: '\u05D0\u05F4\u05DC',
    expansion: '\u05D0\u05DE\u05E8 \u05DC\u05D5',
    renderings: ['he said to him'],
    kind: 'Rabbinic speech formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-label:hakadosh-baruch-hu-short',
    surface: '\u05D4\u05D1\u05F4\u05D4',
    expansion: '\u05D4\u05E7\u05D3\u05D5\u05E9 \u05D1\u05E8\u05D5\u05DA \u05D4\u05D5\u05D0',
    renderings: ['the Holy One, blessed be He'],
    kind: 'Divine-name abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:yeshayahu',
    surface: '\u05D9\u05E9\u05E2\u05D9\u05F3',
    expansion: '\u05D9\u05E9\u05E2\u05D9\u05D4\u05D5',
    renderings: ['Isaiah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:yirmiyahu',
    surface: '\u05D9\u05E8\u05DE\u05D9\u05F3',
    expansion: '\u05D9\u05E8\u05DE\u05D9\u05D4\u05D5',
    renderings: ['Jeremiah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:kohelet',
    surface: '\u05E7\u05D4\u05DC\u05EA',
    renderings: ['Ecclesiastes', 'Kohelet'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:iyov',
    surface: '\u05D0\u05D9\u05D5\u05D1',
    renderings: ['Job'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:hoshea',
    surface: '\u05D4\u05D5\u05E9\u05E2',
    renderings: ['Hosea'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:mikhah',
    surface: '\u05DE\u05D9\u05DB\u05D4',
    renderings: ['Micah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:daniel',
    surface: '\u05D3\u05E0\u05D9\u05D0\u05DC',
    renderings: ['Daniel'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:yeshayah',
    surface: '\u05D9\u05E9\u05E2\u05D9\u05D4',
    renderings: ['Isaiah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:shmuel-a',
    surface: '\u05E9\u05F4\u05D0',
    expansion: '\u05E9\u05DE\u05D5\u05D0\u05DC \u05D0',
    renderings: ['I Samuel', 'First Samuel'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:shmuel-b',
    surface: '\u05E9\u05F4\u05D1',
    expansion: '\u05E9\u05DE\u05D5\u05D0\u05DC \u05D1',
    renderings: ['II Samuel', 'Second Samuel'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:melakhim-a',
    surface: '\u05DE\u05F4\u05D0',
    expansion: '\u05DE\u05DC\u05DB\u05D9\u05DD \u05D0',
    renderings: ['I Kings', 'First Kings'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:melakhim-b',
    surface: '\u05DE\u05F4\u05D1',
    expansion: '\u05DE\u05DC\u05DB\u05D9\u05DD \u05D1',
    renderings: ['II Kings', 'Second Kings'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:divrei-hayamim-a',
    surface: '\u05D3\u05D4\u05F4\u05D0',
    expansion: '\u05D3\u05D1\u05E8\u05D9 \u05D4\u05D9\u05DE\u05D9\u05DD \u05D0',
    renderings: ['I Chronicles', 'First Chronicles'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:shir-hashirim',
    surface: '\u05E9\u05D4\u05F4\u05E9',
    expansion: '\u05E9\u05D9\u05E8 \u05D4\u05E9\u05D9\u05E8\u05D9\u05DD',
    renderings: ['Song of Songs'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:ovadyah',
    surface: '\u05E2\u05D5\u05D1\u05D3\u05D9\u05D4',
    surface_forms: ['\u05E2\u05D5\u05D1\u05D3\u05D9\u05F3'],
    renderings: ['Obadiah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:zekharyah',
    surface: '\u05D6\u05DB\u05E8\u05D9\u05D4',
    surface_forms: ['\u05D6\u05DB\u05E8\u05D9\u05F3'],
    renderings: ['Zechariah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:eikhah',
    surface: '\u05D0\u05D9\u05DB\u05D4',
    renderings: ['Lamentations', 'Eikhah'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-source:amos',
    surface: '\u05E2\u05DE\u05D5\u05E1',
    renderings: ['Amos'],
    kind: 'Biblical source label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:yitzchak',
    surface: '\u05D9\u05E6\u05D7\u05E7',
    renderings: ['Isaac'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:avraham',
    surface: '\u05D0\u05D1\u05E8\u05D4\u05DD',
    renderings: ['Abraham'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:avram',
    surface: '\u05D0\u05D1\u05E8\u05DD',
    renderings: ['Abram'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:sarah',
    surface: '\u05E9\u05E8\u05D4',
    renderings: ['Sarah'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:avimelech',
    surface: '\u05D0\u05D1\u05D9\u05DE\u05DC\u05DA',
    renderings: ['Abimelech'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:yishmael',
    surface: '\u05D9\u05E9\u05DE\u05E2\u05D0\u05DC',
    renderings: ['Ishmael'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:paroh',
    surface: '\u05E4\u05E8\u05E2\u05D4',
    renderings: ['Pharaoh'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:edom',
    surface: '\u05D0\u05D3\u05D5\u05DD',
    renderings: ['Edom'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:chanah',
    surface: '\u05D7\u05E0\u05D4',
    renderings: ['Hannah'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:nevukhadnetzar',
    surface: '\u05E0\u05D1\u05D5\u05DB\u05D3\u05E0\u05E6\u05E8',
    renderings: ['Nebuchadnezzar'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-name:yoav',
    surface: '\u05D9\u05D5\u05D0\u05D1',
    renderings: ['Joab'],
    kind: 'Proper-name label',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:kivyachol',
    surface: '\u05DB\u05D1\u05D9\u05DB\u05D5\u05DC',
    renderings: ['as it were', 'so to speak'],
    kind: 'Rabbinic formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:ribono-shel-olam',
    surface: '\u05E8\u05D1\u05E9\u05F4\u05E2',
    expansion: '\u05E8\u05D1\u05D5\u05E0\u05D5 \u05E9\u05DC \u05E2\u05D5\u05DC\u05DD',
    renderings: ['Master of the world'],
    kind: 'Rabbinic address abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:af-al-pi-yod',
    surface: '\u05D0\u05E2\u05E4\u05F4\u05D9',
    expansion: '\u05D0\u05E3 \u05E2\u05DC \u05E4\u05D9',
    renderings: ['although', 'even though'],
    kind: 'Common abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-formula:vav-achar-kach',
    surface: '\u05D5\u05D0\u05D7\u05F4\u05DB',
    expansion: '\u05D5\u05D0\u05D7\u05E8 \u05DB\u05DA',
    renderings: ['and afterward', 'and after that'],
    kind: 'Common abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-label:vav-hakadosh-baruch-hu',
    surface: '\u05D5\u05D4\u05E7\u05D1\u05F4\u05D4',
    expansion: '\u05D5\u05D4\u05E7\u05D3\u05D5\u05E9 \u05D1\u05E8\u05D5\u05DA \u05D4\u05D5\u05D0',
    renderings: ['and the Holy One, blessed be He'],
    kind: 'Divine-name abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-label:lamed-hakadosh-baruch-hu',
    surface: '\u05DC\u05D4\u05E7\u05D1\u05F4\u05D4',
    expansion: '\u05DC\u05D4\u05E7\u05D3\u05D5\u05E9 \u05D1\u05E8\u05D5\u05DA \u05D4\u05D5\u05D0',
    renderings: ['to the Holy One, blessed be He'],
    kind: 'Divine-name abbreviation',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-grammar:lakakh',
    surface: '\u05DC\u05DB\u05DA',
    renderings: ['therefore', 'for this reason'],
    kind: 'Closed-class connective formula',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-grammar:eimatay',
    surface: '\u05D0\u05D9\u05DE\u05EA\u05D9',
    renderings: ['when'],
    kind: 'Closed-class interrogative/adverbial form',
    work_scope: aggadatBereshitScope,
  },
  {
    source_id: 'project-midrash-grammar:vekhakh',
    surface: '\u05D5\u05DB\u05DA',
    renderings: ['and so', 'and thus'],
    kind: 'Closed-class connective form',
    work_scope: aggadatBereshitScope,
  },
];

const projectAramaicGrammarDefinitions = [
  {
    source_id: 'project-aramaic:dela',
    surface: '\u05D3\u05DC\u05D0',
    renderings: ['that not', 'which does not', 'without'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of', 'that', 'which'] },
      { hebrew: '\u05DC\u05D0', strict_renderings: ['not'] },
    ],
  },
  {
    source_id: 'project-aramaic:de-ein',
    surface: '\u05D3\u05D0\u05D9\u05DF',
    renderings: ['that there is not', 'for there is not'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['that', 'for'] },
      { hebrew: '\u05D0\u05D9\u05DF', strict_renderings: ['there is not', 'is not'] },
    ],
  },
  {
    source_id: 'project-aramaic:de-ha',
    surface: '\u05D3\u05D4\u05D0',
    renderings: ['for behold', 'since', 'for'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['that', 'for', 'which'] },
      { hebrew: '\u05D4\u05D0', strict_renderings: ['behold', 'this'] },
    ],
  },
  {
    source_id: 'project-aramaic:da',
    surface: '\u05D3\u05D0',
    renderings: ['this', 'that'],
  },
  {
    source_id: 'project-aramaic:ha',
    surface: '\u05D4\u05D0',
    renderings: ['behold', 'this'],
  },
  {
    source_id: 'project-aramaic:ilaah',
    surface: '\u05E2\u05DC\u05D0\u05D4',
    renderings: ['upper', 'supernal'],
  },
  {
    source_id: 'project-aramaic:avira',
    surface: '\u05D0\u05D5\u05D9\u05E8\u05D0',
    renderings: ['air', 'atmosphere'],
  },
  {
    source_id: 'project-aramaic:meshicha',
    surface: '\u05DE\u05E9\u05D9\u05D7\u05D0',
    renderings: ['Messiah', 'Mashiach'],
  },
  {
    source_id: 'project-aramaic:de-meshicha',
    surface: '\u05D3\u05DE\u05E9\u05D9\u05D7\u05D0',
    renderings: ['of the Messiah', 'of Mashiach'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of'] },
      { hebrew: '\u05DE\u05E9\u05D9\u05D7\u05D0', strict_renderings: ['Messiah', 'Mashiach'] },
    ],
  },
  {
    source_id: 'project-aramaic:ikveta',
    surface: '\u05E2\u05E7\u05D1\u05EA\u05D0',
    renderings: ['heel', 'footstep', 'end-period'],
  },
  {
    source_id: 'project-aramaic:be-ikveta',
    surface: '\u05D1\u05E2\u05E7\u05D1\u05EA\u05D0',
    renderings: ['in the heel', 'in the footsteps', 'in the end-period'],
    breakdown: [
      { hebrew: '\u05D1\u05BE', strict_renderings: ['in', 'with', 'by'] },
      { hebrew: '\u05E2\u05E7\u05D1\u05EA\u05D0', strict_renderings: ['heel', 'footstep', 'end-period'] },
    ],
  },
];

const projectZoharAriTechnicalTermDefinitions = [
  {
    source_id: 'project-zohar-ari-technical:abba',
    surface: '\u05D0\u05D1\u05D0',
    renderings: ['Abba'],
  },
  {
    source_id: 'project-zohar-ari-technical:de-abba',
    surface: '\u05D3\u05D0\u05D1\u05D0',
    renderings: ['of Abba'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of'] },
      { hebrew: '\u05D0\u05D1\u05D0', strict_renderings: ['Abba'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:imma',
    surface: '\u05D0\u05D9\u05DE\u05D0',
    renderings: ['Imma'],
  },
  {
    source_id: 'project-zohar-ari-technical:ve-imma',
    surface: '\u05D5\u05D0\u05D9\u05DE\u05D0',
    renderings: ['and Imma'],
    breakdown: [
      { hebrew: '\u05D5\u05BE', strict_renderings: ['and'] },
      { hebrew: '\u05D0\u05D9\u05DE\u05D0', strict_renderings: ['Imma'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:de-imma',
    surface: '\u05D3\u05D0\u05D9\u05DE\u05D0',
    renderings: ['of Imma'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of'] },
      { hebrew: '\u05D0\u05D9\u05DE\u05D0', strict_renderings: ['Imma'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:zeir',
    surface: '\u05D6\u05E2\u05D9\u05E8',
    renderings: ['Zeir', 'small'],
  },
  {
    source_id: 'project-zohar-ari-technical:anpin',
    surface: '\u05D0\u05E0\u05E4\u05D9\u05DF',
    renderings: ['Anpin', 'faces'],
  },
  {
    source_id: 'project-zohar-ari-technical:nukva',
    surface: '\u05E0\u05D5\u05E7\u05D1\u05D0',
    renderings: ['Nukva', 'female'],
  },
  {
    source_id: 'project-zohar-ari-technical:de-nukva',
    surface: '\u05D3\u05E0\u05D5\u05E7\u05D1\u05D0',
    renderings: ['of Nukva'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of'] },
      { hebrew: '\u05E0\u05D5\u05E7\u05D1\u05D0', strict_renderings: ['Nukva', 'female'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:atika',
    surface: '\u05E2\u05EA\u05D9\u05E7\u05D0',
    renderings: ['Atika', 'Ancient One'],
  },
  {
    source_id: 'project-zohar-ari-technical:de-atika',
    surface: '\u05D3\u05E2\u05EA\u05D9\u05E7\u05D0',
    renderings: ['of Atika', 'of the Ancient One'],
    breakdown: [
      { hebrew: '\u05D3\u05BE', strict_renderings: ['of'] },
      { hebrew: '\u05E2\u05EA\u05D9\u05E7\u05D0', strict_renderings: ['Atika', 'Ancient One'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:partzuf',
    surface: '\u05E4\u05E8\u05E6\u05D5\u05E3',
    renderings: ['partzuf', 'configuration'],
  },
  {
    source_id: 'project-zohar-ari-technical:partzufim',
    surface: '\u05E4\u05E8\u05E6\u05D5\u05E4\u05D9\u05DD',
    renderings: ['partzufim', 'configurations'],
  },
  {
    source_id: 'project-zohar-ari-technical:partzufin',
    surface: '\u05E4\u05E8\u05E6\u05D5\u05E4\u05D9\u05DF',
    renderings: ['partzufin', 'configurations'],
  },
  {
    source_id: 'project-zohar-ari-technical:idra',
    surface: '\u05D0\u05D3\u05E8\u05D0',
    renderings: ['Idra'],
  },
  {
    source_id: 'project-zohar-ari-technical:be-idra',
    surface: '\u05D1\u05D0\u05D3\u05E8\u05D0',
    renderings: ['in the Idra'],
    breakdown: [
      { hebrew: '\u05D1\u05BE', strict_renderings: ['in'] },
      { hebrew: '\u05D0\u05D3\u05E8\u05D0', strict_renderings: ['Idra'] },
    ],
  },
  {
    source_id: 'project-zohar-ari-technical:zuta',
    surface: '\u05D6\u05D5\u05D8\u05D0',
    renderings: ['Zuta', 'lesser'],
  },
];

const fixedExpressions = [
  {
    normalized_word: '\u05E9\u05DC',
    hebrew_word: '\u05E9\u05DC',
    surface_forms: [
      '\u05E9\u05DC',
      '\u05E9\u05B6\u05C1\u05DC',
    ],
    surface_renderings: [
      'of',
      'belonging to',
    ],
    surface_context_status: 'resolved_particle',
    surface_context_note: 'Resolved as a fixed Hebrew possessive/relational particle.',
    breakdown: [],
    possible_entry: {
      entry_key: 'grammar-particle:\u05E9\u05DC',
      lemma: '\u05E9\u05DC',
      match_key: '\u05E9\u05DC',
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-particle:\u05E9\u05DC',
      transliteration: '',
      strict_renderings: [
        'of',
        'belonging to',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|grammar-particle:\u05E9\u05DC'],
    },
    source_row: {
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-particle:\u05E9\u05DC',
      source_url: 'local:grammar-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:grammar-rules',
      fields_used: ['fixed Hebrew particle lookup', 'strict renderings'],
      notes: 'Project-maintained grammar rule. No external dictionary text imported.',
    },
  },
  {
    normalized_word: '\u05E9\u05D4\u05E0',
    hebrew_word: '\u05E9\u05D4\u05DF',
    surface_forms: [
      '\u05E9\u05D4\u05DF',
      '\u05E9\u05B6\u05C1\u05D4\u05B5\u05DF',
    ],
    surface_renderings: [
      'that they are',
      'which are',
    ],
    surface_context_status: 'resolved_grammar_form',
    surface_context_note: 'Resolved as a closed-class Hebrew relative prefix plus pronoun form.',
    breakdown: [
      {
        hebrew: '\u05E9\u05BE',
        strict_renderings: ['that', 'which'],
      },
      {
        hebrew: '\u05D4\u05DF',
        strict_renderings: ['they', 'they are'],
      },
    ],
    possible_entry: {
      entry_key: 'grammar-form:\u05E9\u05D4\u05DF',
      lemma: '\u05E9\u05D4\u05DF',
      match_key: '\u05E9\u05D4\u05E0',
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05E9\u05D4\u05DF',
      transliteration: '',
      strict_renderings: [
        'that they are',
        'which are',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|grammar-form:\u05E9\u05D4\u05DF'],
    },
    source_row: {
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05E9\u05D4\u05DF',
      source_url: 'local:grammar-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:grammar-rules',
      fields_used: ['closed-class Hebrew grammar form lookup', 'strict renderings', 'mechanical breakdown'],
      notes: 'Project-maintained grammar rule. No external dictionary text imported.',
    },
  },
  {
    normalized_word: '\u05D1\u05EA\u05D5\u05E8',
    hebrew_word: '\u05D1\u05EA\u05D5\u05E8',
    surface_forms: [
      '\u05D1\u05EA\u05D5\u05E8',
      '\u05D1\u05B0\u05BC\u05EA\u05D5\u05B9\u05E8',
    ],
    surface_renderings: [
      'as',
      'in the capacity of',
      'in the role of',
    ],
    surface_context_status: 'resolved_fixed_expression',
    surface_context_note: 'Resolved as a fixed prefixed expression.',
    breakdown: [
      {
        hebrew: '\u05D1\u05B0\u05BC\u05BE',
        strict_renderings: ['in', 'as', 'with'],
      },
      {
        hebrew: '\u05EA\u05D5\u05B9\u05E8',
        strict_renderings: ['turn', 'row', 'order'],
      },
    ],
    possible_entry: {
      entry_key: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      lemma: '\u05D1\u05EA\u05D5\u05E8',
      match_key: '\u05D1\u05EA\u05D5\u05E8',
      source_name: 'Workspace fixed-expression rule',
      source_family: 'workspace',
      source_id: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      transliteration: '',
      strict_renderings: [
        'as',
        'in the capacity of',
        'in the role of',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|fixed-expression:\u05D1\u05EA\u05D5\u05E8'],
    },
    source_row: {
      source_name: 'Workspace fixed-expression rule',
      source_family: 'workspace',
      source_id: 'fixed-expression:\u05D1\u05EA\u05D5\u05E8',
      source_url: 'local:fixed-expression-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:fixed-expression-rules',
      fields_used: ['fixed expression lookup', 'strict renderings', 'mechanical breakdown'],
      notes: 'Project-maintained fixed-expression rule. No external dictionary text imported.',
    },
  },
  {
    normalized_word: '\u05D0\u05D9\u05E0\u05E0\u05D4',
    hebrew_word: '\u05D0\u05D9\u05E0\u05E0\u05D4',
    surface_forms: [
      '\u05D0\u05D9\u05E0\u05E0\u05D4',
      '\u05D0\u05B5\u05D9\u05E0\u05B6\u05E0\u05B8\u05BC\u05D4\u05BC',
    ],
    surface_renderings: [
      'is not',
      'is not it',
      'is not her',
    ],
    surface_context_status: 'resolved_negative_particle_pronominal',
    surface_context_note: 'Resolved as a closed-class negative particle with pronominal ending.',
    breakdown: [
      {
        hebrew: '\u05D0\u05D9\u05DF',
        strict_renderings: ['is not', 'there is not'],
      },
      {
        hebrew: '\u05BE\u05D4\u05BC',
        strict_renderings: ['it', 'her'],
      },
    ],
    possible_entry: {
      entry_key: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      lemma: '\u05D0\u05D9\u05E0\u05E0\u05D4',
      match_key: '\u05D0\u05D9\u05E0\u05E0\u05D4',
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      transliteration: '',
      strict_renderings: [
        'is not',
        'is not it',
        'is not her',
      ],
      root: '',
      root_transliteration: '',
      root_meaning: [],
      context_role: 'likely_contextual',
      relation_label: '',
      source_row_keys: ['workspace|grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4'],
    },
    source_row: {
      source_name: 'Workspace grammar rule',
      source_family: 'workspace',
      source_id: 'grammar-form:\u05D0\u05D9\u05E0\u05E0\u05D4',
      source_url: 'local:grammar-rules',
      license: 'N/A - project lexical rule',
      license_url: 'local:grammar-rules',
      fields_used: ['closed-class Hebrew grammar form lookup', 'strict renderings', 'mechanical breakdown'],
      notes: 'Project-maintained grammar rule for the Orot opening canary. No external dictionary text imported.',
    },
  },
];

const fixedExpressionByNormalized = new Map(fixedExpressions.map((expression) => [expression.normalized_word, expression]));

const projectOrotFinalTechnicalDefinitions = [
  {
    key: 'tokhen',
    lemma: '\u05EA\u05D5\u05DB\u05DF',
    renderings: ['content', 'substance'],
    forms: ['\u05EA\u05D5\u05DB\u05DF', '\u05D4\u05EA\u05D5\u05DB\u05DF', '\u05D5\u05EA\u05D5\u05DB\u05DF', '\u05DE\u05EA\u05D5\u05DB\u05DF'],
  },
  {
    key: 'netiyot',
    lemma: '\u05E0\u05D8\u05D9\u05D5\u05EA',
    renderings: ['tendencies', 'inclinations'],
    forms: ['\u05E0\u05D8\u05D9\u05D5\u05EA', '\u05D4\u05E0\u05D8\u05D9\u05D5\u05EA'],
  },
  {
    key: 'datit',
    lemma: '\u05D3\u05EA\u05D9\u05EA',
    renderings: ['religious'],
    forms: ['\u05D3\u05EA\u05D9\u05EA', '\u05D4\u05D3\u05EA\u05D9\u05EA'],
  },
  {
    key: 'zuhama',
    lemma: '\u05D6\u05D5\u05D4\u05DE\u05D0',
    renderings: ['filth', 'pollution'],
    forms: ['\u05D6\u05D5\u05D4\u05DE\u05D0', '\u05D4\u05D6\u05D5\u05D4\u05DE\u05D0'],
  },
  {
    key: 'hutzpa',
    lemma: '\u05D7\u05D5\u05E6\u05E4\u05D0',
    renderings: ['brazenness', 'insolence'],
    forms: ['\u05D7\u05D5\u05E6\u05E4\u05D0', '\u05D4\u05D7\u05D5\u05E6\u05E4\u05D0'],
  },
  {
    key: 'hashkafah',
    lemma: '\u05D4\u05E9\u05E7\u05E4\u05D4',
    renderings: ['outlook', 'perspective'],
    forms: ['\u05D4\u05E9\u05E7\u05E4\u05D4', '\u05D4\u05D4\u05E9\u05E7\u05E4\u05D4'],
  },
  {
    key: 'histori',
    lemma: '\u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9',
    renderings: ['historical'],
    forms: ['\u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9', '\u05D4\u05D4\u05D9\u05E1\u05EA\u05D5\u05E8\u05D9', '\u05D4\u05D4\u05D9\u05E1\u05EA\u05D5\u05E8\u05D9\u05EA'],
  },
  {
    key: 'historia',
    lemma: '\u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9\u05D4',
    renderings: ['history'],
    forms: ['\u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9\u05D4', '\u05D4\u05D4\u05D9\u05E1\u05EA\u05D5\u05E8\u05D9\u05D4'],
  },
  {
    key: 'yisraeli',
    lemma: '\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9',
    renderings: ['Israelite', 'Israeli'],
    forms: ['\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9', '\u05D4\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05D9\u05DD', '\u05D4\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05D5\u05EA'],
  },
  {
    key: 'homriyut',
    lemma: '\u05D7\u05DE\u05E8\u05D9\u05D5\u05EA',
    renderings: ['materiality', 'physicality'],
    forms: ['\u05D7\u05DE\u05E8\u05D9\u05D5\u05EA', '\u05D4\u05D7\u05DE\u05E8\u05D9\u05D5\u05EA'],
  },
  {
    key: 'tzinorot',
    lemma: '\u05E6\u05E0\u05D5\u05E8\u05D5\u05EA',
    renderings: ['channels', 'conduits'],
    forms: ['\u05E6\u05E0\u05D5\u05E8\u05D5\u05EA', '\u05D4\u05E6\u05E0\u05D5\u05E8\u05D5\u05EA'],
  },
  {
    key: 'kultura',
    lemma: '\u05E7\u05D5\u05DC\u05D8\u05D5\u05E8\u05D4',
    renderings: ['culture'],
    forms: ['\u05E7\u05D5\u05DC\u05D8\u05D5\u05E8\u05D4', '\u05D4\u05E7\u05D5\u05DC\u05D8\u05D5\u05E8\u05D4'],
  },
  {
    key: 'idealiyut',
    lemma: '\u05D0\u05D9\u05D3\u05D9\u05D0\u05DC\u05D9\u05D5\u05EA',
    renderings: ['ideality', 'ideal qualities'],
    forms: ['\u05D0\u05D9\u05D3\u05D9\u05D0\u05DC\u05D9\u05D5\u05EA', '\u05D4\u05D0\u05D9\u05D3\u05D9\u05D0\u05DC\u05D9\u05D5\u05EA', '\u05D5\u05D4\u05D0\u05D9\u05D3\u05D9\u05D0\u05DC\u05D9\u05D5\u05EA'],
  },
  {
    key: 'pnimi',
    lemma: '\u05E4\u05E0\u05D9\u05DE\u05D9',
    renderings: ['inner', 'internal', 'inward'],
    forms: ['\u05E4\u05E0\u05D9\u05DE\u05D9', '\u05E4\u05E0\u05D9\u05DE\u05D9\u05EA', '\u05E4\u05E0\u05D9\u05DE\u05D9\u05D5\u05EA', '\u05D4\u05E4\u05E0\u05D9\u05DE\u05D9\u05D5\u05EA'],
  },
  {
    key: 'machshavah',
    lemma: '\u05DE\u05D7\u05E9\u05D1\u05D4',
    renderings: ['thought', 'thinking', 'idea', 'contemplation'],
    forms: [
      '\u05DE\u05D7\u05E9\u05D1\u05D4',
      '\u05D4\u05DE\u05D7\u05E9\u05D1\u05D4',
      '\u05DE\u05D7\u05E9\u05D1\u05EA',
      '\u05DE\u05D7\u05E9\u05D1\u05D5\u05EA',
      '\u05D1\u05DE\u05D7\u05E9\u05D1\u05D4',
    ],
  },
  {
    key: 'segulot',
    lemma: '\u05E1\u05D2\u05D5\u05DC\u05D5\u05EA',
    renderings: ['quality', 'property', 'special quality', 'distinctive quality', 'treasured quality'],
    forms: [
      '\u05E1\u05D2\u05D5\u05DC\u05D4',
      '\u05E1\u05D2\u05D5\u05DC\u05EA',
      '\u05E1\u05D2\u05D5\u05DC\u05D5\u05EA',
      '\u05E1\u05B0\u05D2\u05BB\u05DC\u05D5\u05B9\u05EA',
      '\u05D1\u05E1\u05D2\u05D5\u05DC\u05D5\u05EA',
      '\u05D1\u05B4\u05BC\u05E1\u05B0\u05D2\u05BB\u05DC\u05D5\u05B9\u05EA',
    ],
  },
];

const prefixRules = new Map([
  ['\u05D5', { hebrew: '\u05D5\u05BE', renderings: ['and'] }],
  ['\u05D4', { hebrew: '\u05D4\u05BE', renderings: ['the'] }],
  ['\u05D1', { hebrew: '\u05D1\u05BE', renderings: ['in', 'with', 'by'] }],
  ['\u05DB', { hebrew: '\u05DB\u05BE', renderings: ['as', 'like'] }],
  ['\u05DC', { hebrew: '\u05DC\u05BE', renderings: ['to', 'for', 'of'] }],
  ['\u05DE', { hebrew: '\u05DE\u05BE', renderings: ['from', 'of'] }],
  ['\u05E9', { hebrew: '\u05E9\u05BE', renderings: ['that', 'which', 'who'] }],
]);

const acceptedPrefixSequences = new Set([
  '',
  '\u05D5',
  '\u05D4',
  '\u05D1',
  '\u05DB',
  '\u05DC',
  '\u05DE',
  '\u05E9',
  '\u05D5\u05D4',
  '\u05D5\u05D1',
  '\u05D5\u05DC',
  '\u05D5\u05DB',
  '\u05DE\u05D4',
  '\u05E9\u05D4',
  '\u05D1\u05D4',
  '\u05DC\u05D4',
  '\u05DB\u05D4',
]);

const suffixRules = [
  { normalized: '\u05D9\u05D4\u05DD', hebrew: '\u05BE\u05D9\u05D4\u05DD', renderings: ['their'] },
  { normalized: '\u05D9\u05D4\u05DF', hebrew: '\u05BE\u05D9\u05D4\u05DF', renderings: ['their'] },
  { normalized: '\u05D9\u05D5', hebrew: '\u05BE\u05D9\u05D5', renderings: ['his', 'its'] },
  { normalized: '\u05D9\u05D4', hebrew: '\u05BE\u05D9\u05D4', renderings: ['her', 'its'] },
  { normalized: '\u05E0\u05D5', hebrew: '\u05BE\u05E0\u05D5', renderings: ['our'] },
  { normalized: '\u05DB\u05DD', hebrew: '\u05BE\u05DB\u05DD', renderings: ['your'] },
  { normalized: '\u05DB\u05DF', hebrew: '\u05BE\u05DB\u05DF', renderings: ['your'] },
  { normalized: '\u05D5', hebrew: '\u05BE\u05D5', renderings: ['his', 'its'] },
  { normalized: '\u05D4', hebrew: '\u05BE\u05D4', renderings: ['her', 'its'] },
  { normalized: '\u05DD', hebrew: '\u05BE\u05DD', renderings: ['their'] },
  { normalized: '\u05DF', hebrew: '\u05BE\u05DF', renderings: ['their'] },
  { normalized: '\u05DE', hebrew: '\u05BE\u05DD', renderings: ['their'] },
  { normalized: '\u05E0', hebrew: '\u05BE\u05DF', renderings: ['their'] },
].sort((a, b) => b.normalized.length - a.normalized.length);

const unsafeAffixBaseNormalizations = new Set([
  '\u05D4\u05E0', // הן: too ambiguous for loose prefix parsing; requires explicit grammar handling.
  '\u05D0\u05D4', // אה: creates false מ־ parses such as מאה.
  '\u05D0\u05D5\u05EA', // אות: creates false מ־ parses such as מאות.
]);

const unsafeNonConjunctiveAffixBaseNormalizations = new Set([
  '\u05D0\u05DC\u05D9\u05E0\u05D5', // אלינו: avoid false מ־ parse such as מאלינו -> "from to".
]);

const possessiveParticleNormalized = '\u05E9\u05DC';

const safeQuoteArtifactBaseNormalizations = new Set([
  '\u05D9\u05E9\u05E8\u05D0\u05DC', // ישראל
  '\u05D3\u05F3', // ד׳
  '\u05D0\u05DC\u05D4\u05D9\u05DE', // אלהים
]);

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function emptyLexicon() {
  return {
    schema_version: 2,
    title: 'Lexical HUD lexicon source-layer manifest',
    scope: 'Reusable lexical entries for HUD rendering. Token occurrence files reference these entries by lexicon_entry_id.',
    import_date: new Date().toISOString().slice(0, 10),
    license_policy: 'Lexical source rows remain separately attributed. Lexical data is not part of the owner\'s CC0 English translation overlay unless a row is itself CC0 or public domain.',
    layer_files: lexicalLayerFiles,
    entries: [],
  };
}

function mergeLayerFiles(layerFiles) {
  const existingById = new Map((layerFiles || []).map((layer) => [layer.layer_id, layer]));
  return lexicalLayerFiles.map((layer) => ({
    ...layer,
    ...(existingById.get(layer.layer_id) || {}),
    ...layer,
  }));
}

function loadLayerEntries(manifest) {
  const entries = [];
  for (const layer of mergeLayerFiles(manifest.layer_files || [])) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalDir, layer.path);
    if (!fs.existsSync(layerPath)) continue;
    const layerJson = readJson(layerPath);
    entries.push(...(layerJson.entries || []));
  }
  return entries;
}

function loadLexicon() {
  if (!fs.existsSync(lexiconPath)) {
    return emptyLexicon();
  }
  const lexicon = readJson(lexiconPath);
  const entries = Array.isArray(lexicon.entries) && lexicon.entries.length
    ? lexicon.entries
    : loadLayerEntries(lexicon);
  return {
    ...emptyLexicon(),
    ...lexicon,
    layer_files: mergeLayerFiles(lexicon.layer_files || lexicalLayerFiles),
    entries,
  };
}

function entryLayerId(entry) {
  if (String(entry.entry_id || '').startsWith('lex-abbrev-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-abbreviation:'))) {
    return 'project-abbreviations';
  }
  if (String(entry.entry_id || '').startsWith('lex-aram-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-aramaic:'))) {
    return 'project-aramaic-grammar';
  }
  if (String(entry.entry_id || '').startsWith('lex-zohar-ari-term-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-zohar-ari-technical:'))) {
    return 'project-zohar-ari-technical-terms';
  }
  if (String(entry.entry_id || '').startsWith('lex-function-word-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-function-word:'))) {
    return 'project-function-words';
  }
  if (String(entry.entry_id || '').startsWith('lex-midrash-formula-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-midrash-'))) {
    return 'project-midrash-formulas';
  }
  if (String(entry.entry_id || '').startsWith('lex-orot-term-')
    || (entry.source_rows || []).some((row) => String(row.source_id || '').startsWith('project-orot-technical:'))) {
    return 'project-orot-technical-terms';
  }
  const families = unique((entry.source_rows || []).map((row) => row.source_family || row.source_name).filter(Boolean));
  if (families.some((family) => family === 'kaikki' || family === 'wiktionary')) return 'kaikki-wiktionary-cc-by-sa-gfdl';
  if (families.length && families.every((family) => family === 'workspace')) return 'project-overrides';
  if (families.length && families.every((family) => family === 'wikidata')) return 'wikidata-cc0';
  if (families.some((family) => family === 'openscriptures')) return 'openscriptures-cc-by-4';
  return 'project-overrides';
}

function writeLexicon(lexicon) {
  const entriesByLayer = new Map(lexicalLayerFiles.map((layer) => [layer.layer_id, []]));
  for (const entry of lexicon.entries || []) {
    const layerId = entryLayerId(entry);
    if (!entriesByLayer.has(layerId)) entriesByLayer.set(layerId, []);
    entriesByLayer.get(layerId).push(entry);
  }

  for (const layer of lexicalLayerFiles) {
    const entries = (entriesByLayer.get(layer.layer_id) || [])
      .slice()
      .sort((a, b) => String(a.entry_id).localeCompare(String(b.entry_id)));
    writeCompactJson(path.join(lexicalDir, layer.path), {
      schema_version: 1,
      layer_id: layer.layer_id,
      source_family: layer.source_family,
      license: layer.license,
      status: layer.status || 'active',
      description: layer.description,
      generated_at: new Date().toISOString(),
      entries,
    });
  }

  const layerFiles = lexicalLayerFiles.map((layer) => ({
    ...layer,
    entries: (entriesByLayer.get(layer.layer_id) || []).length,
  }));

  writeJson(lexiconPath, {
    schema_version: 2,
    title: 'Lexical HUD lexicon source-layer manifest',
    scope: lexicon.scope || emptyLexicon().scope,
    import_date: lexicon.import_date || new Date().toISOString().slice(0, 10),
    generated_at: new Date().toISOString(),
    license_policy: lexicon.license_policy || emptyLexicon().license_policy,
    layer_files: layerFiles,
    entries: [],
  });
}

function ensureFixedExpressionEntries(lexicon) {
  let changed = false;
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  for (const expression of fixedExpressions) {
    const entryId = stableId('lex-expr', expression.normalized_word);
    const nextEntry = {
      entry_id: entryId,
      hebrew_word: expression.hebrew_word,
      surface_forms: expression.surface_forms,
      transliteration: '',
      strict_renderings: expression.surface_renderings,
      root: '',
      root_transliteration: '',
      root_meaning: [],
      disambiguation_status: 'likely',
      context_note: expression.surface_context_note,
      possible_entries_truncated: 0,
      possible_entries: [expression.possible_entry],
      source_rows: [expression.source_row],
    };

    const existingIndex = entries.findIndex((entry) => entry.entry_id === entryId);
    if (existingIndex >= 0) {
      if (JSON.stringify(entries[existingIndex]) !== JSON.stringify(nextEntry)) {
        entries[existingIndex] = nextEntry;
        changed = true;
      }
    } else {
      entries.push(nextEntry);
      changed = true;
    }
    expression.entry_id = entryId;
  }
  lexicon.entries = entries;
  return changed;
}

function makeProjectAbbreviationEntry(definition) {
  const surfaceForms = abbreviationSurfaceForms(definition.surface);
  const canonicalSurface = surfaceForms[0];
  const expansion = normalizeHebrewPunctuation(definition.expansion || '');
  const sourceId = definition.source_id;
  const entryId = stableId('lex-abbrev', sourceId);
  const breakdown = definition.breakdown || (expansion ? [{
    hebrew: expansion,
    strict_renderings: definition.renderings,
  }] : []);
  const sourceRowKey = `workspace|${sourceId}`;
  const possibleEntry = {
    entry_key: sourceId,
    lemma: canonicalSurface,
    match_key: normalizeHebrewToken(canonicalSurface),
    expansion,
    source_name: 'Project-authored abbreviation table',
    source_family: 'workspace',
    source_id: sourceId,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'likely_contextual',
    relation_label: expansion ? `common abbreviation for ${expansion}` : 'common abbreviation',
    source_row_keys: [sourceRowKey],
  };
  const sourceRow = {
    source_name: 'Project-authored abbreviation table',
    source_family: 'workspace',
    source_id: sourceId,
    source_url: 'local:project-abbreviation-table',
    license: 'project-authored / CC0',
    license_url: 'local:project-abbreviation-table',
    fields_used: ['abbreviation surface form', 'expansion', 'strict renderings'],
    notes: 'Project-maintained abbreviation expansion. No external dictionary text imported.',
  };
  return {
    entry_id: entryId,
    hebrew_word: canonicalSurface,
    surface_forms: surfaceForms,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: expansion
      ? `Resolved as a common abbreviation: ${expansion}.`
      : 'Resolved as a common abbreviation.',
    expansion,
    breakdown,
    work_scope: definition.work_scope || '',
    possible_entries_truncated: 0,
    possible_entries: [possibleEntry],
    source_rows: [sourceRow],
  };
}

function ensureProjectAbbreviationEntries(lexicon) {
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  const withoutProjectAbbreviations = entries.filter((entry) => entryLayerId(entry) !== 'project-abbreviations');
  const nextEntries = [
    ...withoutProjectAbbreviations,
    ...projectAbbreviationDefinitions.map(makeProjectAbbreviationEntry),
  ];
  const changed = JSON.stringify(entries) !== JSON.stringify(nextEntries);
  lexicon.entries = nextEntries;
  return changed;
}

function makeProjectMidrashFormulaEntry(definition) {
  const surface = normalizeHebrewPunctuation(definition.surface);
  const surfaceForms = unique([surface, ...(definition.surface_forms || [])].map(normalizeHebrewPunctuation));
  const sourceId = definition.source_id;
  const entryId = stableId('lex-midrash-formula', sourceId);
  const sourceRowKey = `workspace|${sourceId}`;
  const expansion = normalizeHebrewPunctuation(definition.expansion || '');
  const workScope = definition.work_scope === aggadatBereshitScope
    ? midrashAggadahScope
    : (definition.work_scope || midrashAggadahScope);
  const possibleEntry = {
    entry_key: sourceId,
    lemma: surface,
    match_key: normalizeHebrewToken(surface),
    source_name: 'Project-authored Midrash/Aggadah formula table',
    source_family: 'workspace',
    source_id: sourceId,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'likely_contextual',
    relation_label: definition.kind || 'Midrash/Aggadah formula/label',
    source_row_keys: [sourceRowKey],
  };
  const sourceRow = {
    source_name: 'Project-authored Midrash/Aggadah formula table',
    source_family: 'workspace',
    source_id: sourceId,
    source_url: 'local:project-midrash-formula-table',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fields_used: ['surface form', 'short factual mapping', 'mechanical expansion or label'],
    notes: 'Project-authored Midrash/Aggadah formula/source/proper-name row. Short factual mappings only; no external dictionary prose imported.',
  };
  return {
    entry_id: entryId,
    hebrew_word: surface,
    surface_forms: surfaceForms,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: definition.kind
      ? `Resolved as a scoped ${definition.kind}.`
      : 'Resolved by scoped Midrash/Aggadah formula table.',
    expansion,
    breakdown: definition.breakdown || (expansion ? [{
      hebrew: expansion,
      strict_renderings: definition.renderings,
    }] : []),
    work_scope: workScope,
    possible_entries_truncated: 0,
    possible_entries: [possibleEntry],
    source_rows: [sourceRow],
  };
}

function ensureProjectMidrashFormulaEntries(lexicon) {
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  const withoutProjectMidrashFormulas = entries.filter((entry) => entryLayerId(entry) !== 'project-midrash-formulas');
  const nextEntries = [
    ...withoutProjectMidrashFormulas,
    ...projectMidrashFormulaDefinitions.map(makeProjectMidrashFormulaEntry),
  ];
  const changed = JSON.stringify(entries) !== JSON.stringify(nextEntries);
  lexicon.entries = nextEntries;
  return changed;
}

function makeProjectAramaicGrammarEntry(definition) {
  const surface = normalizeHebrewPunctuation(definition.surface);
  const sourceId = definition.source_id;
  const entryId = stableId('lex-aram', sourceId);
  const sourceRowKey = `workspace|${sourceId}`;
  const possibleEntry = {
    entry_key: sourceId,
    lemma: surface,
    match_key: normalizeHebrewToken(surface),
    language: 'Aramaic',
    register: definition.register || 'Aramaic',
    source_name: 'Project-authored Aramaic grammar table',
    source_family: 'workspace',
    source_id: sourceId,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'likely_contextual',
    relation_label: 'Aramaic grammar/common form',
    source_row_keys: [sourceRowKey],
  };
  const sourceRow = {
    source_name: 'Project-authored Aramaic grammar table',
    source_family: 'workspace',
    source_id: sourceId,
    source_url: 'local:project-aramaic-grammar-table',
    license: 'project-authored / CC0',
    license_url: 'local:project-aramaic-grammar-table',
    fields_used: ['Aramaic surface form', 'short strict renderings', 'mechanical breakdown where present'],
    notes: 'Project-maintained Aramaic grammar/common-form row. No external dictionary text imported.',
  };
  return {
    entry_id: entryId,
    hebrew_word: surface,
    surface_forms: [surface],
    language: 'Aramaic',
    register: definition.register || 'Aramaic',
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: `Aramaic: ${definition.note || 'resolved by project-authored Aramaic grammar/common-form table.'}`,
    breakdown: definition.breakdown || [],
    work_scope: definition.work_scope || '',
    possible_entries_truncated: 0,
    possible_entries: [possibleEntry],
    source_rows: [sourceRow],
  };
}

function ensureProjectAramaicGrammarEntries(lexicon) {
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  const withoutProjectAramaic = entries.filter((entry) => entryLayerId(entry) !== 'project-aramaic-grammar');
  const nextEntries = [
    ...withoutProjectAramaic,
    ...projectAramaicGrammarDefinitions.map(makeProjectAramaicGrammarEntry),
  ];
  const changed = JSON.stringify(entries) !== JSON.stringify(nextEntries);
  lexicon.entries = nextEntries;
  return changed;
}

function makeProjectZoharAriTechnicalTermEntry(definition) {
  const surface = normalizeHebrewPunctuation(definition.surface);
  const sourceId = definition.source_id;
  const entryId = stableId('lex-zohar-ari-term', sourceId);
  const sourceRowKey = `workspace|${sourceId}`;
  const possibleEntry = {
    entry_key: sourceId,
    lemma: surface,
    match_key: normalizeHebrewToken(surface),
    language: definition.language || 'Hebrew/Aramaic',
    register: 'Zohar/Ari technical term',
    source_name: 'Project-authored Zohar/Ari technical term table',
    source_family: 'workspace',
    source_id: sourceId,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'likely_contextual',
    relation_label: 'Zohar/Ari technical term',
    source_row_keys: [sourceRowKey],
  };
  const sourceRow = {
    source_name: 'Project-authored Zohar/Ari technical term table',
    source_family: 'workspace',
    source_id: sourceId,
    source_url: 'local:project-zohar-ari-technical-term-table',
    license: 'project-authored / CC0',
    license_url: 'local:project-zohar-ari-technical-term-table',
    fields_used: ['technical surface form', 'short factual mapping', 'mechanical breakdown where present'],
    notes: 'Project-maintained Zohar/Ari technical term row. No external dictionary prose imported.',
  };
  return {
    entry_id: entryId,
    hebrew_word: surface,
    surface_forms: [surface, ...(definition.surface_forms || [])].map(normalizeHebrewPunctuation),
    language: definition.language || 'Hebrew/Aramaic',
    register: 'Zohar/Ari technical term',
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: 'Resolved as a scoped Zohar/Ari technical term.',
    breakdown: definition.breakdown || [],
    work_scope: 'zohar_ari',
    possible_entries_truncated: 0,
    possible_entries: [possibleEntry],
    source_rows: [sourceRow],
  };
}

function ensureProjectZoharAriTechnicalTermEntries(lexicon) {
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  const withoutProjectTerms = entries.filter((entry) => entryLayerId(entry) !== 'project-zohar-ari-technical-terms');
  const nextEntries = [
    ...withoutProjectTerms,
    ...projectZoharAriTechnicalTermDefinitions.map(makeProjectZoharAriTechnicalTermEntry),
  ];
  const changed = JSON.stringify(entries) !== JSON.stringify(nextEntries);
  lexicon.entries = nextEntries;
  return changed;
}

function makeProjectOrotFinalTechnicalEntry(definition) {
  const lemma = normalizeHebrewPunctuation(definition.lemma);
  const sourceId = `project-orot-technical:final-${definition.key}`;
  const entryId = stableId('lex-orot-term', sourceId);
  const sourceRowKey = `workspace|${sourceId}`;
  const surfaceForms = unique([lemma, ...(definition.forms || [])].map(normalizeHebrewPunctuation));
  const possibleEntry = {
    entry_key: sourceId,
    lemma,
    match_key: normalizeHebrewToken(lemma),
    source_name: 'Project Orot technical term table',
    source_family: 'workspace',
    source_id: sourceId,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'likely_contextual',
    relation_label: 'project Orot technical term',
    source_row_keys: [sourceRowKey],
  };
  const sourceRow = {
    source_name: 'Project Orot technical term table',
    source_family: 'workspace',
    source_id: sourceId,
    source_url: 'local:project-orot-technical-term-table',
    license: 'project-authored / CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fields_used: ['surface form', 'mechanical normalization', 'short lexical renderings'],
    notes: 'Project-authored Orot technical term row. Short lexical renderings only; no external dictionary prose imported.',
  };
  return {
    entry_id: entryId,
    hebrew_word: lemma,
    surface_forms: surfaceForms,
    transliteration: '',
    strict_renderings: definition.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: 'Resolved as a repeated Orot technical term.',
    possible_entries_truncated: 0,
    possible_entries: [possibleEntry],
    source_rows: [sourceRow],
  };
}

function ensureProjectOrotFinalTechnicalEntries(lexicon) {
  const entries = Array.isArray(lexicon.entries) ? lexicon.entries : [];
  const withoutFinalTerms = entries.filter((entry) => {
    const ids = [
      ...(entry?.source_rows || []).map((row) => row.source_id),
      ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
    ].filter(Boolean).map(String);
    return !ids.some((sourceId) => sourceId.startsWith('project-orot-technical:final-'));
  });
  const nextEntries = [
    ...withoutFinalTerms,
    ...projectOrotFinalTechnicalDefinitions.map(makeProjectOrotFinalTechnicalEntry),
  ];
  const changed = JSON.stringify(entries) !== JSON.stringify(nextEntries);
  lexicon.entries = nextEntries;
  return changed;
}

function sourceFamiliesFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  return unique((entry?.source_rows || []).map((sourceRow) => sourceRow.source_family || sourceRow.source_name));
}

function renderingsFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const surfaceRenderings = row.surface_renderings?.length ? row.surface_renderings : null;
  return (surfaceRenderings || likely?.strict_renderings || entry?.strict_renderings || []).slice(0, 3).join(', ') || 'N/A';
}

function entryRenderings(entry) {
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  return cleanLexicalRenderings([
    ...(likely?.strict_renderings || []),
    ...(entry?.strict_renderings || []),
  ]);
}

function cleanLexicalRenderings(values) {
  return unique(values)
    .map((rendering) => String(rendering || '').trim())
    .map((rendering) => rendering.replace(/\.$/, ''))
    .filter((rendering) => {
      if (!rendering || rendering.length > 40) return false;
      if (/×/.test(rendering)) return false;
      if (/[()[\];]/.test(rendering)) return false;
      if (/\b(i\.e|literally|figuratively|concretely|implication|name of|by resemblance)\b/i.test(rendering)) return false;
      if (/\b(good|bad|properly|direct|implied|transitive|advise|appear|compare|enemy|coffee|sea|Mediterranean|whether|specifically|infix|hello|salutation|greeting|lust|probably|gleesome|spite|unexpectedly|thereby|copula|beacon|dwell|continue)\b/i.test(rendering)) return false;
      if (/\b(clear liquid h(?:₂|2)o|liquid water|often adverb|often adverbial|remote time|past indefinitely|generally used|generally to|often used with other particles|often in general|intransitively|nonentity|of place|of\/pertaining to|mister|deity|noble man|notebook|of the sole|off|see also\s+\d+)\b/i.test(rendering)) return false;
      if (/\b(go one way or other|turn rosy|such like|that's that|cheer up|ordinary sense|literal and immediate|figurative and remote|superlative)\b/i.test(rendering)) return false;
      if (/^(?:the )?number \d+$/i.test(rendering) || /^\d+$/.test(rendering)) return false;
      if (/^(to|be|being|become|became)\s+/i.test(rendering)) return false;
      if (/^(a|an|the)\s+(good|bad|sea)\b/i.test(rendering)) return false;
      if (/^[A-Z]/.test(rendering) && !/^(Torah|God|Israel|Jerusalem)\b/.test(rendering)) return false;
      return true;
    })
    .slice(0, 4);
}

function exactCandidateRenderings(entry, normalized) {
  const values = [];
  for (const candidate of entry?.possible_entries || []) {
    const lemma = candidate.lemma || '';
    const exact = normalizeHebrewToken(lemma) === normalized
      || normalizeHebrewTokenWithQubutsMater(lemma) === normalized;
    if (!exact) continue;
    values.push(...(candidate.strict_renderings || []));
  }
  return cleanLexicalRenderings(values);
}

function conservativeBaseRenderings(entry, normalized, workId) {
  if (matchMethodForEntry(entry, 'direct') === 'project_midrash_formula') {
    const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
    return unique([
      ...(likely?.strict_renderings || []),
      ...(entry?.strict_renderings || []),
    ]).slice(0, 4);
  }
  const direct = entryRenderings(entry);
  if (direct.length) return direct;
  if (workId !== 'orot') return [];
  return exactCandidateRenderings(entry, normalized);
}

function prefixPhrase(prefixes) {
  if (!prefixes.length) return [''];
  const sequence = prefixes.join('');
  const fixed = {
    ['\u05D5\u05D4']: ['and the'],
    ['\u05D5\u05D1']: ['and in', 'and with', 'and by'],
    ['\u05D5\u05DC']: ['and to', 'and for', 'and of'],
    ['\u05D5\u05DB']: ['and as', 'and like'],
    ['\u05DE\u05D4']: ['from the', 'of the'],
    ['\u05E9\u05D4']: ['that the', 'which the'],
    ['\u05D1\u05D4']: ['in the', 'with the', 'by the'],
    ['\u05DC\u05D4']: ['to the', 'for the', 'of the'],
    ['\u05DB\u05D4']: ['as the', 'like the'],
  }[sequence];
  if (fixed) return fixed;
  let phrases = [''];
  for (const prefix of prefixes) {
    const rule = prefixRules.get(prefix);
    if (!rule) return [];
    const next = [];
    for (const phrase of phrases) {
      for (const rendering of rule.renderings) {
        next.push(`${phrase} ${rendering}`.trim());
      }
    }
    phrases = next.slice(0, 6);
  }
  return phrases;
}

function stripLeadingEnglishArticle(value) {
  return String(value || '').replace(/^(a|an|the)\s+/i, '');
}

function combineSurfaceRenderings(prefixes, baseRenderings, suffix) {
  const prefixPhrases = prefixPhrase(prefixes);
  const suffixRenderings = suffix?.renderings || [];
  const results = [];
  for (const base of baseRenderings) {
    const baseText = String(base || '').trim();
    if (!baseText) continue;
    const basePhraseOptions = suffixRenderings.length
      ? suffixRenderings.map((suffixRendering) => `${suffixRendering} ${baseText}`.trim())
      : [baseText];
    for (const prefix of prefixPhrases) {
      for (const basePhrase of basePhraseOptions) {
        const baseForPrefix = /\bthe$/i.test(prefix) ? stripLeadingEnglishArticle(basePhrase) : basePhrase;
        const phrase = prefix ? `${prefix} ${baseForPrefix}` : basePhrase;
        results.push(phrase);
        if (results.length >= 8) return unique(results);
      }
    }
  }
  return unique(results).slice(0, 8);
}

function getPrefixSequences(normalized) {
  const sequences = [''];
  for (let length = 1; length <= 2 && length < normalized.length; length += 1) {
    const sequence = normalized.slice(0, length);
    if (acceptedPrefixSequences.has(sequence)) sequences.push(sequence);
  }
  return sequences.sort((a, b) => b.length - a.length);
}

function isEntryAllowedForWork(entry, workId) {
  if (entry?.work_scope === 'orot' && workId !== 'orot') return false;
  if (entry?.work_scope === 'kabbalah' && !isKabbalahWork(workId)) return false;
  if (entry?.work_scope === 'zohar_ari' && !isZoharAriWork(workId)) return false;
  if (entry?.work_scope === midrashAggadahScope && !isMidrashAggadahWork(workId)) return false;
  if (entry?.work_scope && !['orot', 'kabbalah', 'zohar_ari', midrashAggadahScope].includes(entry.work_scope) && entry.work_scope !== workId) return false;
  const sourceIds = [
    ...(entry?.source_rows || []).map((row) => row.source_id),
    ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:'))) {
    return workId === 'orot';
  }
  return true;
}

function isZoharAriWork(workId) {
  return String(workId || '').startsWith('shaar-')
    || [
      'pri-etz-chaim',
      'sefer-etz-chaim',
      'shaarei-kedusha',
      'beur-hagra-on-sifra-detzniuta',
      'hagra-on-sefer-yetzirah-gra-version',
      'sefer-yetzirah-gra-version',
      'yahel-ohr-on-zohar',
    ].includes(workId);
}

function isKabbalahWork(workId) {
  return String(workId || '').startsWith('shaar-')
    || [
      'pri-etz-chaim',
      'sefer-etz-chaim',
      'shaarei-kedusha',
      'beur-hagra-on-sifra-detzniuta',
      'hagra-on-sefer-yetzirah-gra-version',
      'sefer-yetzirah-gra-version',
      'yahel-ohr-on-zohar',
    ].includes(workId);
}

function isMidrashAggadahWork(workId) {
  const meta = sourceMetaByWorkId.get(workId) || {};
  return String(meta.work_slug || '').startsWith('midrash/');
}

function isProjectOrotTechnicalEntry(entry) {
  const sourceIds = [
    ...(entry?.source_rows || []).map((row) => row.source_id),
    ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  return sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:'));
}

function isProjectMidrashFormulaEntry(entry) {
  const sourceIds = [
    ...(entry?.source_rows || []).map((row) => row.source_id),
    ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  return sourceIds.some((sourceId) => sourceId.startsWith('project-midrash-'));
}

function lookupLexiconEntryId(normalized, workId) {
  const candidates = (lexiconByNormalized.get(normalized) || [])
    .map((entryId) => lexiconById.get(entryId))
    .filter((entry) => isEntryAllowedForWork(entry, workId));
  if (!candidates.length) return '';
  if (isMidrashAggadahWork(workId)) {
    const projectMidrashEntry = candidates.find(isProjectMidrashFormulaEntry);
    if (projectMidrashEntry) return projectMidrashEntry.entry_id;
  }
  if (workId === 'orot') {
    const projectOrotEntry = candidates.find(isProjectOrotTechnicalEntry);
    if (projectOrotEntry) return projectOrotEntry.entry_id;
  }
  return candidates[0].entry_id || '';
}

function stripEdgeQuoteArtifact(value) {
  return normalizeHebrewPunctuation(value).replace(/^["\u201C\u201D]+|["\u201C\u201D]+$/gu, '');
}

function analyzeQuoteArtifactSurfaceForm(surfaceWord, normalizedWord, workId) {
  if (workId !== 'orot') return null;
  const strippedSurface = stripEdgeQuoteArtifact(surfaceWord);
  const strippedNormalized = normalizeHebrewToken(strippedSurface);
  if (!strippedSurface || strippedSurface === surfaceWord || strippedNormalized === normalizedWord) return null;
  const entryId = lookupLexiconEntryId(strippedNormalized, workId);
  if (!entryId) return null;
  const entry = lexiconById.get(entryId);
  const baseRenderings = entryRenderings(entry);
  if (!baseRenderings.length) return null;
  return {
    lexicon_entry_id: entryId,
    entry,
    surfaceAnalysis: {
      surface_transliteration: '',
      surface_renderings: baseRenderings,
      surface_context_status: 'resolved_quote_artifact',
      surface_context_note: 'Resolved by stripping edge quote punctuation and using the already-resolved base token.',
      breakdown: [{
        hebrew: strippedSurface,
        strict_renderings: baseRenderings,
      }],
    },
  };
}

function analyzePrefixedKnownEntrySurfaceForm(surfaceWord, normalizedWord, workId) {
  if (workId !== 'orot' || !normalizedWord || normalizedWord.length < 3 || !hasAbbreviationMark(normalizedWord)) return null;
  for (const prefix of Array.from(normalizedWord.slice(0, 1))) {
    if (!prefixRules.has(prefix)) continue;
    const baseNormalized = normalizedWord.slice(prefix.length);
    if (!baseNormalized || !hasAbbreviationMark(baseNormalized)) continue;
    const entryId = lookupLexiconEntryId(baseNormalized, workId);
    if (!entryId) continue;
    const entry = lexiconById.get(entryId);
    const baseRenderings = conservativeBaseRenderings(entry, baseNormalized, workId);
    if (!baseRenderings.length) continue;
    const surfaceRenderings = combineSurfaceRenderings([prefix], baseRenderings, null);
    if (!surfaceRenderings.length) continue;
    return {
      lexicon_entry_id: entryId,
      entry,
      surfaceAnalysis: {
        surface_transliteration: '',
        surface_renderings: surfaceRenderings,
        surface_context_status: 'resolved_prefix_base',
        surface_context_note: 'Resolved by conservative prefix parser using an already-known abbreviated base token.',
        breakdown: [
          {
            hebrew: prefixRules.get(prefix)?.hebrew || `${prefix}\u05BE`,
            strict_renderings: prefixRules.get(prefix)?.renderings || [],
          },
          {
            hebrew: entry?.hebrew_word || baseNormalized,
            strict_renderings: baseRenderings,
          },
        ],
      },
    };
  }
  return null;
}

function matchMethodForEntry(entry, fallback = 'direct') {
  const sourceIds = [
    ...(entry?.source_rows || []).map((row) => row.source_id),
    ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-function-word:'))) return 'project_function_word';
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-abbreviation:'))) return 'project_abbreviation';
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-aramaic:'))) return 'project_aramaic_grammar';
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-zohar-ari-technical:'))) return 'project_zohar_ari_technical';
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-midrash-'))) return 'project_midrash_formula';
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:'))) return 'project_orot_technical';
  return fallback;
}

function isAllowedProjectFunctionAffix(attempt) {
  if (!attempt.prefixSequence) return true;
  if (attempt.prefixSequence === '\u05D5') return true;
  if (attempt.prefixSequence === '\u05E9' && ['\u05DC\u05D0', '\u05D0\u05D9\u05E0', '\u05D0\u05DE'].includes(attempt.baseNormalized)) return true;
  return false;
}

function analyzeAffixSurfaceForm(surfaceWord, normalizedWord, workId) {
  if (!normalizedWord || normalizedWord.length < 3 || hasAbbreviationMark(normalizedWord)) return null;
  const attempts = [];
  for (const prefixSequence of getPrefixSequences(normalizedWord)) {
    const afterPrefix = normalizedWord.slice(prefixSequence.length);
    if (afterPrefix.length < 2) continue;
    attempts.push({ prefixSequence, suffix: null, baseNormalized: afterPrefix });
    for (const suffix of suffixRules) {
      if (!afterPrefix.endsWith(suffix.normalized)) continue;
      const baseNormalized = afterPrefix.slice(0, afterPrefix.length - suffix.normalized.length);
      if (baseNormalized.length < 3) continue;
      if (suffix.normalized.length < 2) continue;
      attempts.push({ prefixSequence, suffix, baseNormalized });
    }
  }

  for (const attempt of attempts) {
    if (unsafeAffixBaseNormalizations.has(attempt.baseNormalized)) continue;
    if (unsafeNonConjunctiveAffixBaseNormalizations.has(attempt.baseNormalized) && attempt.prefixSequence !== '\u05D5') continue;
    if (attempt.baseNormalized === possessiveParticleNormalized && attempt.prefixSequence !== '\u05D5') continue;
    const entryId = lookupLexiconEntryId(attempt.baseNormalized, workId);
    if (!entryId) continue;
    const entry = lexiconById.get(entryId);
    const matchMethod = matchMethodForEntry(entry, 'direct');
    if (matchMethod === 'project_function_word' && !isAllowedProjectFunctionAffix(attempt)) continue;
    const trustedProjectBase = ['project_orot_technical', 'project_function_word', 'project_abbreviation', 'project_midrash_formula'].includes(matchMethod);
    if (!trustedProjectBase && (observedNormalizedCounts.get(attempt.baseNormalized) || 0) < 5) continue;
    const baseRenderings = conservativeBaseRenderings(entry, attempt.baseNormalized, workId);
    if (!baseRenderings.length) continue;
    const prefixes = Array.from(attempt.prefixSequence);
    const surfaceRenderings = combineSurfaceRenderings(prefixes, baseRenderings, attempt.suffix);
    if (!surfaceRenderings.length) continue;
    const breakdown = [
      ...prefixes.map((prefix) => ({
        hebrew: prefixRules.get(prefix)?.hebrew || `${prefix}\u05BE`,
        strict_renderings: prefixRules.get(prefix)?.renderings || [],
      })),
      {
        hebrew: entry?.hebrew_word || attempt.baseNormalized,
        strict_renderings: baseRenderings,
      },
    ];
    if (attempt.suffix) {
      breakdown.push({
        hebrew: attempt.suffix.hebrew,
        strict_renderings: attempt.suffix.renderings,
      });
    }
    return {
      lexicon_entry_id: entryId,
      entry,
      surfaceAnalysis: {
        surface_transliteration: '',
        surface_renderings: surfaceRenderings,
        surface_context_status: 'resolved_affix_parser',
        surface_context_note: 'Resolved by conservative prefix/suffix parser using an existing base lexical entry.',
        breakdown,
      },
    };
  }
  return null;
}

function getLeadingLamedBase(surfaceWord) {
  const normalized = normalizeHebrewPunctuation(surfaceWord);
  if (!normalized.startsWith('\u05DC')) return null;
  let index = 1;
  while (index < normalized.length && /[\u0591-\u05C7]/u.test(normalized[index])) index += 1;
  const baseSurface = normalized.slice(index);
  if (!baseSurface) return null;
  return {
    prefix_surface: '\u05DC\u05B8\u05BE',
    prefix_transliteration: 'la-',
    prefix_renderings: ['to', 'for', 'toward', 'belonging-to'],
    base_surface: baseSurface,
    base_normalized: normalizeHebrewTokenWithQubutsMater(baseSurface),
  };
}

function analyzeSurfaceForm(surfaceWord, entry) {
  const fixedExpression = fixedExpressionByNormalized.get(normalizeHebrewToken(surfaceWord));
  if (fixedExpression) {
    return {
      surface_transliteration: '',
      surface_renderings: fixedExpression.surface_renderings,
      surface_context_status: fixedExpression.surface_context_status,
      surface_context_note: fixedExpression.surface_context_note,
      breakdown: fixedExpression.breakdown,
    };
  }

  const sourceIds = [
    ...(entry?.source_rows || []).map((row) => row.source_id),
    ...(entry?.possible_entries || []).map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-abbreviation:'))) {
    return {
      surface_transliteration: '',
      surface_renderings: entry?.strict_renderings || [],
      surface_context_status: 'resolved_abbreviation',
      surface_context_note: entry?.context_note || 'Resolved as a common abbreviation.',
      breakdown: entry?.breakdown || [],
    };
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-aramaic:'))) {
    return {
      surface_transliteration: '',
      surface_renderings: entry?.strict_renderings || [],
      surface_context_status: 'resolved_aramaic',
      surface_context_note: entry?.context_note || 'Aramaic: resolved by project-authored Aramaic grammar/common-form table.',
      breakdown: entry?.breakdown || [],
    };
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-zohar-ari-technical:'))) {
    return {
      surface_transliteration: '',
      surface_renderings: entry?.strict_renderings || [],
      surface_context_status: 'resolved_zohar_ari_technical',
      surface_context_note: entry?.context_note || 'Resolved as a scoped Zohar/Ari technical term.',
      breakdown: entry?.breakdown || [],
    };
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-midrash-'))) {
    return {
      surface_transliteration: '',
      surface_renderings: entry?.strict_renderings || [],
      surface_context_status: 'resolved_midrash_formula',
      surface_context_note: entry?.context_note || 'Resolved by scoped Midrash/Aggadah formula table.',
      breakdown: entry?.breakdown || [],
    };
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:final-machshavah'))) {
    const normalized = normalizeHebrewToken(surfaceWord);
    const baseBreakdown = {
      hebrew: '\u05DE\u05D7\u05E9\u05D1\u05D4',
      strict_renderings: ['thought', 'thinking', 'idea', 'contemplation'],
    };
    const machshavahForms = {
      ['\u05DE\u05D7\u05E9\u05D1\u05D4']: {
        surface_renderings: ['thought', 'thinking', 'idea', 'contemplation'],
        breakdown: [],
      },
      ['\u05D4\u05DE\u05D7\u05E9\u05D1\u05D4']: {
        surface_renderings: ['the thought', 'the thinking', 'the idea', 'the contemplation'],
        breakdown: [
          { hebrew: '\u05D4\u05BE', strict_renderings: ['the'] },
          baseBreakdown,
        ],
      },
      ['\u05DE\u05D7\u05E9\u05D1\u05EA']: {
        surface_renderings: ['thought of', 'thinking of', 'idea of', 'contemplation of'],
        breakdown: [
          {
            hebrew: '\u05DE\u05D7\u05E9\u05D1\u05EA',
            strict_renderings: ['construct form of \u05DE\u05D7\u05E9\u05D1\u05D4'],
          },
        ],
      },
      ['\u05DE\u05D7\u05E9\u05D1\u05D5\u05EA']: {
        surface_renderings: ['thoughts', 'ideas', 'contemplations'],
        breakdown: [
          {
            hebrew: '\u05DE\u05D7\u05E9\u05D1\u05D5\u05EA',
            strict_renderings: ['plural form of \u05DE\u05D7\u05E9\u05D1\u05D4'],
          },
        ],
      },
      ['\u05D1\u05DE\u05D7\u05E9\u05D1\u05D4']: {
        surface_renderings: ['in thought', 'with thought', 'by thought', 'in thinking', 'with thinking', 'by thinking'],
        breakdown: [
          { hebrew: '\u05D1\u05BE', strict_renderings: ['in', 'with', 'by'] },
          baseBreakdown,
        ],
      },
    };
    const formAnalysis = machshavahForms[normalized];
    if (formAnalysis) {
      return {
        surface_transliteration: '',
        surface_renderings: formAnalysis.surface_renderings,
        surface_context_status: 'resolved_orot_technical',
        surface_context_note: 'Resolved as the Orot machshavah/thought technical field.',
        breakdown: formAnalysis.breakdown,
      };
    }
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:final-segulot'))) {
    const normalized = normalizeHebrewToken(surfaceWord);
    const normalizedWithQubutsMater = normalizeHebrewTokenWithQubutsMater(surfaceWord);
    const isBetSegulot = normalized === '\u05D1\u05E1\u05D2\u05D5\u05DC\u05D5\u05EA'
      || normalized === '\u05D1\u05E1\u05D2\u05DC\u05D5\u05EA'
      || normalizedWithQubutsMater === '\u05D1\u05E1\u05D2\u05D5\u05DC\u05D5\u05EA';
    if (isBetSegulot) {
      return {
        surface_transliteration: '',
        surface_renderings: ['with qualities', 'with properties', 'in qualities', 'by qualities'],
        surface_context_status: 'resolved_prefix_base',
        surface_context_note: 'Resolved as bet prefix plus the Orot technical base term.',
        breakdown: [
          {
            hebrew: '\u05D1\u05B4\u05BC\u05BE',
            strict_renderings: ['in', 'with', 'by'],
          },
          {
            hebrew: '\u05E1\u05B0\u05D2\u05BB\u05DC\u05D5\u05B9\u05EA',
            strict_renderings: ['qualities', 'properties', 'special qualities'],
          },
        ],
      };
    }
  }
  if (sourceIds.some((sourceId) => sourceId.startsWith('project-orot-technical:'))) {
    return {
      surface_transliteration: '',
      surface_renderings: entry?.strict_renderings || [],
      surface_context_status: 'resolved_orot_technical',
      surface_context_note: entry?.context_note || 'Resolved as a repeated Orot technical term.',
      breakdown: entry?.breakdown || [],
    };
  }

  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const lamed = getLeadingLamedBase(surfaceWord);
  if (!likely || !lamed) return null;

  const likelyLemmaNormal = normalizeHebrewTokenWithQubutsMater(likely.lemma || '');
  const possibleEntries = entry?.possible_entries || [];
  const baseRenderings = unique([
    ...(likely.strict_renderings || []),
    ...possibleEntries
      .filter((possibleEntry) => normalizeHebrewTokenWithQubutsMater(possibleEntry.lemma || '') === lamed.base_normalized)
      .flatMap((possibleEntry) => possibleEntry.strict_renderings || []),
  ]);
  const hasNation = likelyLemmaNormal === '\u05D0\u05D5\u05DE\u05D4'
    || lamed.base_normalized === '\u05D0\u05D5\u05DE\u05D4'
    || baseRenderings.some((rendering) => /nation|people/i.test(rendering));

  if (!hasNation) return null;

  return {
    surface_transliteration: 'la-ummah',
    surface_renderings: [
      'to the nation',
      'for the nation',
      'belonging to the nation',
      'of the nation',
    ],
    surface_context_status: 'resolved_prefix_base',
    surface_context_note: 'Resolved as lamed prefix plus the likely base lemma.',
    breakdown: [
      {
        hebrew: lamed.prefix_surface,
        transliteration: lamed.prefix_transliteration,
        strict_renderings: lamed.prefix_renderings,
      },
      {
        hebrew: lamed.base_surface,
        transliteration: 'ummah',
        strict_renderings: ['nation', 'people'],
      },
    ],
  };
}

function formatMatchedSample(row) {
  const families = sourceFamiliesFor(row).join(' + ') || 'source metadata available';
  return `${row.surface_word} -> ${renderingsFor(row)} (${families}) -- ${row.work_id}`;
}

function formatUnmatchedSample(row) {
  return `${row.surface_word} -- ${row.work_id}`;
}

const lexicon = loadLexicon();
const fixedExpressionEntriesChanged = ensureFixedExpressionEntries(lexicon);
const abbreviationEntriesChanged = ensureProjectAbbreviationEntries(lexicon);
const midrashFormulaEntriesChanged = ensureProjectMidrashFormulaEntries(lexicon);
const aramaicGrammarEntriesChanged = ensureProjectAramaicGrammarEntries(lexicon);
const zoharAriTermEntriesChanged = ensureProjectZoharAriTechnicalTermEntries(lexicon);
const orotFinalTechnicalEntriesChanged = ensureProjectOrotFinalTechnicalEntries(lexicon);
const lexiconChanged = fixedExpressionEntriesChanged || abbreviationEntriesChanged || midrashFormulaEntriesChanged || aramaicGrammarEntriesChanged || zoharAriTermEntriesChanged || orotFinalTechnicalEntriesChanged;
writeLexicon(lexicon);
const lexiconByNormalized = new Map();
const lexiconById = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));
function addLexiconNormalized(normalized, entryId) {
  if (!normalized || !entryId) return;
  if (!lexiconByNormalized.has(normalized)) lexiconByNormalized.set(normalized, []);
  const entries = lexiconByNormalized.get(normalized);
  if (!entries.includes(entryId)) entries.push(entryId);
}
for (const expression of fixedExpressions) {
  addLexiconNormalized(expression.normalized_word, expression.entry_id);
}
for (const entry of lexicon.entries || []) {
  const forms = [entry.hebrew_word, ...(entry.surface_forms || [])].filter(Boolean);
  for (const form of forms) {
    const normalized = normalizeHebrewToken(form);
    addLexiconNormalized(normalized, entry.entry_id);
  }
}

fs.mkdirSync(occurrencesDir, { recursive: true });
for (const oldFile of fs.readdirSync(occurrencesDir).filter((name) => name.endsWith('.json'))) {
  fs.unlinkSync(path.join(occurrencesDir, oldFile));
}
fs.rmSync(tokenIndexesDir, { recursive: true, force: true });
fs.mkdirSync(tokenIndexesDir, { recursive: true });

const tokenRows = new Map();
const sourceFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort();
const observedNormalizedCounts = new Map();
const sourceMetaByWorkId = new Map();

for (const fileName of sourceFiles) {
  const source = readJson(path.join(sourceDir, fileName));
  sourceMetaByWorkId.set(source.work_id, {
    work_id: source.work_id,
    work_title: source.work_title,
    work_slug: source.work_slug || source.work_id,
  });
  for (const unit of source.units || []) {
    for (const paragraph of unit.hebrew || []) {
      for (const surfaceWord of getTokens(paragraph)) {
        const normalizedWord = normalizeHebrewToken(surfaceWord);
        if (!normalizedWord) continue;
        observedNormalizedCounts.set(
          normalizedWord,
          (observedNormalizedCounts.get(normalizedWord) || 0) + 1,
        );
      }
    }
  }
}

let totalOccurrences = 0;
let totalUnits = 0;
let directMatchedUnique = 0;
let affixResolvedUnique = 0;

for (const fileName of sourceFiles) {
  const source = readJson(path.join(sourceDir, fileName));

  const occurrenceUnits = {};
  let workOccurrences = 0;

  for (const unit of source.units || []) {
    totalUnits += 1;
    let unitOrdinal = 0;
    const paragraphs = [];

    for (let paragraphIndex = 0; paragraphIndex < (unit.hebrew || []).length; paragraphIndex += 1) {
      const rawParagraph = String(unit.hebrew[paragraphIndex] || '');
      const tokenIndexIds = [];
      for (const surfaceWord of getTokens(rawParagraph)) {
        unitOrdinal += 1;
        totalOccurrences += 1;
        workOccurrences += 1;

        const normalizedWord = normalizeHebrewToken(surfaceWord);
        const tokenIndexId = stableId('tok', `${source.work_id}|${surfaceWord}`);
        const directLexiconEntryId = lookupLexiconEntryId(normalizedWord, source.work_id);
        let lexiconEntryId = directLexiconEntryId;
        let entry = lexiconEntryId ? lexiconById.get(lexiconEntryId) : null;
        let surfaceAnalysis = entry ? analyzeSurfaceForm(surfaceWord, entry) : null;
        let matchMethod = lexiconEntryId ? matchMethodForEntry(entry, 'direct') : 'unmatched';

        if (!lexiconEntryId) {
          const quoteArtifactAnalysis = analyzeQuoteArtifactSurfaceForm(surfaceWord, normalizedWord, source.work_id);
          if (quoteArtifactAnalysis) {
            lexiconEntryId = quoteArtifactAnalysis.lexicon_entry_id;
            entry = quoteArtifactAnalysis.entry;
            surfaceAnalysis = quoteArtifactAnalysis.surfaceAnalysis;
            matchMethod = 'quote_artifact_cleanup';
          }
        }

        if (!lexiconEntryId) {
          const prefixedKnownEntryAnalysis = analyzePrefixedKnownEntrySurfaceForm(surfaceWord, normalizedWord, source.work_id);
          if (prefixedKnownEntryAnalysis) {
            lexiconEntryId = prefixedKnownEntryAnalysis.lexicon_entry_id;
            entry = prefixedKnownEntryAnalysis.entry;
            surfaceAnalysis = prefixedKnownEntryAnalysis.surfaceAnalysis;
            matchMethod = 'prefix_known_entry_parser';
          }
        }

        if (!lexiconEntryId) {
          const affixAnalysis = analyzeAffixSurfaceForm(surfaceWord, normalizedWord, source.work_id);
          if (affixAnalysis) {
            lexiconEntryId = affixAnalysis.lexicon_entry_id;
            entry = affixAnalysis.entry;
            surfaceAnalysis = affixAnalysis.surfaceAnalysis;
            matchMethod = 'affix_parser';
          }
        }

        const status = lexiconEntryId ? 'matched' : 'unmatched';

        if (!tokenRows.has(tokenIndexId)) {
          if (matchMethod === 'direct') directMatchedUnique += 1;
          if (matchMethod === 'affix_parser') affixResolvedUnique += 1;
          tokenRows.set(tokenIndexId, {
            token_index_id: tokenIndexId,
            work_id: source.work_id,
            surface_word: surfaceWord,
            normalized_word: normalizedWord,
            lexicon_entry_id: lexiconEntryId,
            status,
            match_method: matchMethod,
            surface_transliteration: surfaceAnalysis?.surface_transliteration || '',
            surface_renderings: surfaceAnalysis?.surface_renderings || [],
            surface_context_status: surfaceAnalysis?.surface_context_status || '',
            surface_context_note: surfaceAnalysis?.surface_context_note || '',
            breakdown: surfaceAnalysis?.breakdown || [],
            occurrence_count: 0,
          });
        }
        tokenRows.get(tokenIndexId).occurrence_count += 1;

        tokenIndexIds.push(tokenIndexId);
      }

      paragraphs.push({
        paragraph_index: paragraphIndex,
        token_index_ids: tokenIndexIds,
      });
    }

    occurrenceUnits[unit.unit_id] = {
      unit_id: unit.unit_id,
      anchor_id: unit.anchor_id,
      source_ref: unit.source_ref,
      paragraphs,
    };
  }

  writeJson(path.join(occurrencesDir, `${source.work_id}.json`), {
    schema_version: 1,
    work_id: source.work_id,
    work_title: source.work_title,
    work_slug: source.work_slug,
    scope_label: lexicalScope.label,
    generated_at: new Date().toISOString(),
    total_occurrences: workOccurrences,
    units: occurrenceUnits,
  });
}

const forms = Array.from(tokenRows.values()).sort((a, b) => {
  const normalized = a.normalized_word.localeCompare(b.normalized_word, 'he');
  if (normalized !== 0) return normalized;
  return a.surface_word.localeCompare(b.surface_word, 'he');
});

const matchedForms = forms.filter((row) => row.status === 'matched');
const unmatchedForms = forms.filter((row) => row.status !== 'matched');
const directMatchedForms = matchedForms.filter((row) => row.match_method === 'direct');
const affixResolvedForms = matchedForms.filter((row) => row.match_method === 'affix_parser');
const wikidataMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('wikidata'));
const openScripturesMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('openscriptures'));
const sitewideSurfaceGroups = new Map();
for (const row of forms) {
  const key = row.surface_word;
  if (!sitewideSurfaceGroups.has(key)) sitewideSurfaceGroups.set(key, []);
  sitewideSurfaceGroups.get(key).push(row);
}
const sitewideMatchedSurfaceForms = Array.from(sitewideSurfaceGroups.values()).filter((rows) => rows.some((row) => row.status === 'matched'));
const sitewideUnmatchedSurfaceForms = Array.from(sitewideSurfaceGroups.values()).filter((rows) => rows.every((row) => row.status !== 'matched'));
const generatedAt = new Date().toISOString();

const formsByWork = new Map();
for (const row of forms) {
  if (!formsByWork.has(row.work_id)) formsByWork.set(row.work_id, []);
  formsByWork.get(row.work_id).push(row);
}

const workIndexes = [];
for (const [workId, workForms] of Array.from(formsByWork.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
  const meta = sourceMetaByWorkId.get(workId) || { work_id: workId, work_title: workId, work_slug: workId };
  const workMatchedForms = workForms.filter((row) => row.status === 'matched');
  const workUnmatchedForms = workForms.filter((row) => row.status !== 'matched');
  const workPath = `token-indexes/${meta.work_slug}.json`;
  writeCompactJson(path.join(lexicalDir, workPath), {
    schema_version: 1,
    generated_at: generatedAt,
    work_id: workId,
    work_title: meta.work_title,
    work_slug: meta.work_slug,
    total_unique_surface_forms: workForms.length,
    total_occurrences: workForms.reduce((sum, row) => sum + (row.occurrence_count || 0), 0),
    matched_surface_forms: workMatchedForms.length,
    unmatched_surface_forms: workUnmatchedForms.length,
    forms: workForms,
  });
  workIndexes.push({
    work_id: workId,
    work_title: meta.work_title,
    work_slug: meta.work_slug,
    path: workPath.replace(/\\/g, '/'),
    row_count: workForms.length,
    total_occurrences: workForms.reduce((sum, row) => sum + (row.occurrence_count || 0), 0),
    matched_surface_forms: workMatchedForms.length,
    unmatched_surface_forms: workUnmatchedForms.length,
  });
}

writeCompactJson(tokenIndexPath, {
  schema_version: 1,
  generated_at: generatedAt,
  source_dir: sourceDir,
  scope: lexicalScope,
  layout: 'per-work-token-indexes',
  index_dir: 'token-indexes',
  work_indexes: workIndexes,
  normalization_policy: {
    geresh: "ASCII apostrophe after Hebrew letters is normalized to Hebrew geresh U+05F3 for display/indexing.",
    gershayim: "ASCII double quote between Hebrew letters is normalized to Hebrew gershayim U+05F4 for display/indexing.",
    niqqud: 'Hebrew combining marks are stripped from normalized_word.',
    final_letters: 'Final kaf/mem/nun/pe/tsadi are normalized to medial forms in normalized_word.',
    surface_word: 'surface_word preserves the displayed source token apart from safe geresh normalization.',
  },
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_work_surface_rows: forms.length,
  total_sitewide_unique_surface_forms: sitewideSurfaceGroups.size,
  sitewide_matched_surface_forms: sitewideMatchedSurfaceForms.length,
  sitewide_unmatched_surface_forms: sitewideUnmatchedSurfaceForms.length,
  total_unique_surface_forms: forms.length,
  direct_matched_surface_forms: directMatchedForms.length,
  newly_resolved_affix_surface_forms: affixResolvedForms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
});

const matchedSamples = matchedForms.filter((row) => renderingsFor(row) !== 'N/A').slice(0, 20).map(formatMatchedSample);
const affixSamples = affixResolvedForms
  .filter((row) => renderingsFor(row) !== 'N/A')
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.surface_word.localeCompare(b.surface_word, 'he'))
  .slice(0, 20)
  .map(formatMatchedSample);
const unmatchedSamples = unmatchedForms
  .filter((row) => row.normalized_word.length > 2 && !/[\u05F3\u05F4'"]/.test(row.normalized_word))
  .slice(0, 20)
  .map(formatUnmatchedSample);
const topRemainingUnmatched = unmatchedForms
  .slice()
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.surface_word.localeCompare(b.surface_word, 'he'))
  .slice(0, 50)
  .map((row) => `${row.occurrence_count}x ${formatUnmatchedSample(row)}`);
const testRefs = [
  'Orot, Lights from Darkness, Land of Israel 1:1',
  'Orot, Lights from Darkness, War 1:1',
  'Orot, Lights from Darkness, Lights of Rebirth 70:5',
];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `# Sitewide Lexical Build Report

Generated: ${new Date().toISOString()}

## Scope

- Work scope: all imported Hebrew works
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: existing local lexical cache generated from Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations
- New parser: conservative prefix/suffix parser; accepts only when the remaining base is already present in the approved local lexical layer
- Count source: generated HUD token index, which is the page-render source of truth
- Payload: lexical details are externalized through data/lexical/<work-id>.manifest.json and data/lexical/<work-id>-chunks/

## Counts

- Total work-surface rows: ${forms.length}
- Total sitewide unique surface forms: ${sitewideSurfaceGroups.size}
- Sitewide unique surface forms matched at least once: ${sitewideMatchedSurfaceForms.length}
- Sitewide unique surface forms unmatched everywhere: ${sitewideUnmatchedSurfaceForms.length}
- Total token occurrences: ${totalOccurrences}
- Matched before prefix/suffix parser: ${directMatchedForms.length}
- Newly resolved by prefix/suffix parser: ${affixResolvedForms.length}
- Total matched after parser: ${matchedForms.length}
- Percent matched: ${percent(matchedForms.length, forms.length)}
- Matched via Wikidata: ${wikidataMatchedForms.length}
- Enriched via OpenScriptures: ${openScripturesMatchedForms.length}
- Unmatched: ${unmatchedForms.length}

## Newly Resolved Parsed Forms

${formatList(affixSamples)}

## Sample Matched Words With Refs To Test

${formatList(matchedSamples)}

## Sample Unmatched Words

${formatList(unmatchedSamples)}

## Top 50 Remaining Unmatched By Frequency

${formatList(topRemainingUnmatched)}

## Exact Orot Refs To Test

${formatList(testRefs)}
`, 'utf8');

console.log(JSON.stringify({
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_work_surface_rows: forms.length,
  total_sitewide_unique_surface_forms: sitewideSurfaceGroups.size,
  sitewide_matched_surface_forms: sitewideMatchedSurfaceForms.length,
  sitewide_unmatched_surface_forms: sitewideUnmatchedSurfaceForms.length,
  direct_matched_surface_forms: directMatchedForms.length,
  newly_resolved_affix_surface_forms: affixResolvedForms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
}, null, 2));
