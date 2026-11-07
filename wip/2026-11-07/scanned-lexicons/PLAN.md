# Dictionaries that exist only as page scans · a plan · 7 November 2026

The owner: "do we have any crazy plan on how we could get the dictionarys that are literal page scans, internet archives might have them right?" And then: "digitized already i mean".

## What we already hold

Moses's Internet Archive waves (September and October; r2:mishkan/moses-ia-wave-v1 to v3, 8.5 GB) cataloged 13,542 Archive items in wave 1 alone; 443 of them are dictionaries or lexicons by their records. Among the public-domain Hebrew or Aramaic to English ones:

- Gesenius, translated by Edward Robinson, 1849 (06124271.1522.emory.edu), and the 1883 edition (ahebrewandengli00gesegoog)
- Benjamin Davies, A Compendious and Complete Hebrew and Chaldee Lexicon, after Gesenius and Fürst, 1872 and 1875 (acompendiousand00davigoog and its siblings)
- William Roy, A Complete Hebrew and English Critical and Pronouncing Dictionary, 1846 by its Archive record (acompletehebrew00roygoog)
- Jastrow's dictionary as scans (adictionarytarg00jastgoog), beside the Sefaria text we serve
- Brown-Driver-Briggs as scans, beside the structured text we serve
- in other languages: Levy's Neuhebräisches und chaldäisches Wörterbuch, 1876 (German); Marchand-Ennery, 1827 (French); Castell's Heptaglotton, 1669 (Latin); Ben-Yehuda (Hebrew to Hebrew; its later volumes are not public domain)

Sokoloff's Dictionary of Jewish Babylonian Aramaic (2002) is in the census too and is under copyright: not a candidate.

## What the Archive already digitized (checked later on 7 November)

The Archive runs its own OCR over every scan, and Moses's September sweep kept that text. All nine lexicon scans below have their OCR text on the store already, at r2:mishkan/moses-ia-wave-v1/collected/raw/<item>.djvu.txt.gz, beside the sweep's record of each (collected/editions/<item>.json):

| Lexicon | Archive item | OCR words | Its Hebrew in the OCR |
|---|---|---|---|
| Gesenius-Robinson, 1849 | 06124271.1522.emory.edu | 910,438 | none: the OCR skipped every Hebrew letter |
| Gesenius-Robinson, 1883 | ahebrewandengli00gesegoog | 829,621 | none |
| Brown-Driver-Briggs, 1907 (Emory's copy) | 00825376.1523.emory.edu | 1,004,190 | none |
| Brown-Driver-Briggs, 1906 (Google's copy) | ahebrewandengli00briggoog | 987,829 | garbled (9.7% of letters Hebrew) |
| Davies, 1872 | acompendiousand00davigoog | 417,055 | garbled (5.3%) |
| Davies, 1872, a second copy | acompendiousand01davigoog | 416,882 | garbled (5.2%) |
| Davies, 1875 | acompendiousand00mitcgoog | 477,540 | garbled (5.6%) |
| Roy, 1846 | acompletehebrew00roygoog | 568,952 | garbled (4.2%) |
| Jastrow, 1903 | adictionarytarg00jastgoog | 1,039,296 | garbled (14.9%) |

What "garbled" means, from stretches read today. The English is mostly right: Gesenius-Robinson 1849 loses letters where the scan cuts the column edge ("hraim" for Ephraim, "njamin" for Benjamin), and the rest reads. The Hebrew is not right. Headwords come out as Latin letters (Roy's «MYIN», «MaDe»), as Arabic letters in place of Hebrew (Davies 1872 holds 14,115 Arabic characters, where the book prints Arabic only in its comparisons), or as runs of punctuation (Gesenius-Robinson 1849: «■>"3"1~"(a»). Vowel points mostly go: in Davies 1872, 4,776 of 19,272 Hebrew words keep any point, and a sample shows those points are not reliable. Roy prints each headword's pronunciation in English letters («e-e-leh», «a-e-rah»), and that survives the OCR.

A web search for a typed digital Gesenius or Davidson with its Hebrew under an open license found none, only scans; among them an Archive upload of Tregelles's 1857 Gesenius split into 24 files by Hebrew letter. Brown-Driver-Briggs and Jastrow we already serve as typed text, so their scans matter only as a witness.

So the English of these dictionaries is digitized and already on our store; their pointed Hebrew headwords are digitized nowhere we can find. That shrinks the job: the reads go from whole pages to one headword per entry.

## The plan

1. **Fetch.** Moses fetches the page images and the Archive's word-positioned OCR (hOCR) for the lexicons chosen; the plain OCR text is on the store already. The Archive host is blocked from the page lane's environment; anything on the store the page lane can read.
2. **Read.** The OCR gives each entry's English and where it sits on the page. A vision model reads only the headword, from a crop of the page image, in pointed Hebrew: two independent reads, a third where they differ. The English is taken from the OCR and corrected against the image where the OCR broke (column edges, Hebrew cited inside the English).
3. **Prove.** The entries are checked against what we know: alphabetical order runs on unbroken across pages; each headword's letters exist as a key; in Roy, the headword read matches the pronunciation printed beside it; where the lexicon cites Strong's numbers or another lexicon, those agree; a sample of pages is read by hand. Davidson's 85 rows were "manually source-image-reviewed" this way already, at small scale.
4. **Serve.** Each lexicon then enters like any source: a ledger under ask v1.2, its year written (Roy 1846 and Gesenius-Robinson 1849 are older than Strong's 1890), its license public domain, its rows in the store with pointed headwords, so the pointing filter and the stems work on it.

## The cost and the first step

Reading a headword from a crop is a small read, much cheaper than a whole page; a lexicon still holds thousands of entries, so a full lexicon is days of work spread over sessions and real weekly tokens. The first step is a pilot: 20 pages of Davies 1872 (the cleanest English of the older lexicons, and its OCR is on the store), the headwords read twice, the disagreement rate measured, and a sample checked by hand. The pilot says whether the full run is worth it before any of it is spent.

## What it buys

Older witnesses for "oldest first" (1846 and 1849 against Strong's 1890 and BDB's 1906); Aramaic coverage for the Tikkunei Zohar (Levy, Jastrow's scans; Levy is German, so it would need its own ruling); and the lexicons the owner asked about by name (Gesenius) on the card with their own year and words.

Sources for the web search: the Archive's record of the Tregelles upload (https://ia801301.us.archive.org/16/items/GeseniusHebrewChaldeeLexiconOldTestamentScriptures.tregelles.1857.24/GeseniusHebrewChaldeeLexiconOldTestamentScriptures.tregelles.1857.24_meta.xml); HathiTrust's records of the same lexicon (https://catalog.hathitrust.org/Record/101835055).
