# Dictionaries that exist only as page scans · a plan · 7 November 2026

The owner: "do we have any crazy plan on how we could get the dictionarys that are literal page scans, internet archives might have them right?"

## What we already hold

Moses's Internet Archive waves (September and October; r2:mishkan/moses-ia-wave-v1 to v3, 8.5 GB) catalogued 13,542 Archive items in wave 1 alone; 443 of them are dictionaries or lexicons by their records. Among the public-domain Hebrew or Aramaic to English ones:

- Gesenius, translated by Edward Robinson, 1849 (06124271.1522.emory.edu), and the 1883 edition (ahebrewandengli00gesegoog)
- Benjamin Davies, A Compendious and Complete Hebrew and Chaldee Lexicon, after Gesenius and Fürst, 1872 to 1885 (acompendiousand00davigoog and its siblings)
- William Roy, A Complete Hebrew and English Critical and Pronouncing Dictionary, 1837 (acompletehebrew00roygoog)
- Jastrow's dictionary as scans (adictionarytarg00jastgoog), beside the Sefaria text we serve
- Brown-Driver-Briggs as scans, beside the structured text we serve
- in other languages: Levy's Neuhebräisches und chaldäisches Wörterbuch, 1876 (German); Marchand-Ennery, 1827 (French); Castell's Heptaglotton, 1669 (Latin); Ben-Yehuda (Hebrew to Hebrew; its later volumes are not public domain)

Sokoloff's Dictionary of Jewish Babylonian Aramaic (2002) is in the census too and is under copyright: not a candidate.

## The plan

1. **Fetch.** Moses fetches each lexicon's page images and the Archive's own OCR (the plain text and the word-positioned hOCR) onto the store. The Archive host is blocked from the page lane's environment; anything on the store the page lane can read.
2. **Read.** A vision model reads each page into entries: the headword in pointed Hebrew, its part of speech, its English as printed, the page and column. Two independent reads of every page; a third read where they differ; the Archive's OCR as a further witness for the English. Pointed Hebrew is where OCR fails and a careful reader of the image does not.
3. **Prove.** The entries are checked against what we know: alphabetical order runs on unbroken across pages; each headword's letters exist as a key; where the lexicon cites Strong's numbers or another lexicon, those agree; a sample of pages is read by hand. Davidson's 85 rows were "manually source-image-reviewed" this way already, at small scale.
4. **Serve.** Each lexicon then enters like any source: a ledger under ask v1.2, its year written (Gesenius-Robinson 1849, Roy 1837 are older than Strong's 1890), its license public domain, its rows in the store with pointed headwords, so the pointing filter and the stems work on it.

## The cost and the first step

A lexicon of about 1,000 pages read twice is about 2,000 page reads, days of work spread over sessions, and real weekly tokens. The first step is a pilot: 20 pages of one lexicon (Davies or Gesenius-Robinson), read twice, the disagreement rate measured and a sample checked by hand. The pilot says whether the full run is worth it before any of it is spent.

## What it buys

Older witnesses for "oldest first" (1837 and 1849 against Strong's 1890 and BDB's 1906); Aramaic coverage for the Tikkunei Zohar (Levy, Jastrow's scans; Levy is German, so it would need its own ruling); and the lexicons the owner asked about by name (Gesenius) on the card with their own year and words.
