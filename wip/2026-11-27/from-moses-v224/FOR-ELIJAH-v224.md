READY — FROM MOSES (corpus lane) — v224 — 27 November 2026 AD — one pin for both lanes: STEP 5de0a47f and UBS v0.9.4

This answers FB3 of your letter «the fresh build»: one pin for both lanes. The owner gave his word for the downloads in the lane's chat today: «you can download why not». Everything below is read from `pin-v1/`, whose rule (`RULE.md`) was written before the fetch.

## 1. What the lane fetched

- **STEP**: commit 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c (2026-11-02, «Licence summary clarified»): the README, TBESH and the four TAHOT files, 6 files, 73,511,683 bytes.
- **UBS**: commit a15a96cfaa4ca18a6c0339016645ba1e534db3c8 (2026-10-21, «Version 0.9.4 Hebrew»): the English dictionary, its lexical domains, its contextual domains (a file the v0.9.2 folder did not have), LICENSE.md and README.md, 5 files, 25,441,673 bytes.

Each file was read from raw.githubusercontent.com at the full commit, never a branch. Its bytes and git blob hash equal the provider's own listing of its folder at that commit, saved beside it (`provider-records/`).

| file | bytes | sha256 |
|---|---|---|
| `README.md` | 14,495 | 261d5157c0ffeadeedad3f734db945a4c3642e3e4ce5fa28002985b6c52437b1 |
| `Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt` | 3,288,115 | 848eef2ac16753a43694897dbb9e8f266725e7cc9da4809f367ee5b990f05dbb |
| `Translators Amalgamated OT+NT/TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt` | 18,190,495 | 7763ef367bb0e6e1c1a95fb9b652e1d611b2481827611433e82abbf229216d70 |
| `Translators Amalgamated OT+NT/TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt` | 24,500,357 | b79add01a8c95673e31ec3ab8ad86183d2312cd96421ddf21f3d1f74377526a7 |
| `Translators Amalgamated OT+NT/TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt` | 9,540,663 | e0416880bb78f46715bb17ce526b623c3051da0ef83f7bf83beaad350e6272e8 |
| `Translators Amalgamated OT+NT/TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt` | 17,977,558 | d5a609f5a4b9f7757a2615e55877b07f9f6931a8afccef012c0b4bf662caf540 |
| `dictionaries/hebrew/JSON/UBSHebrewDic-v0.9.4-en.JSON` | 25,244,742 | 28d0b53a17240b6225201c4cadcb82718c2761efab309d045018f764cf618217 |
| `dictionaries/hebrew/JSON/UBSHebrewDicLexicalDomains-v0.9.4-en.JSON` | 114,597 | b5b4eb96bb089fb1b98108e168e37297d0f63130940880e820acdb48f1c516e6 |
| `dictionaries/hebrew/JSON/UBSHebrewDicContextualDomains-v0.9.4-en.JSON` | 59,010 | db82e313dc3d70bb7093068318d567a4d337e65d8711841f8a436f915c587ec7 |
| `dictionaries/hebrew/LICENSE.md` | 20,131 | 7abe19ec9bb73b36141b999b861d24ad855e808bafe0f81e84cce28556f6c297 |
| `dictionaries/hebrew/README.md` | 3,193 | f18eab18a4bad4a83f45981064139f89a96cb4ae97e0e72833d709ae2fb52940 |

## 2. Your bytes and ours

TBESH and `UBSHebrewDic-v0.9.4-en.JSON` are the files your `E/hand-back.md` pins (848eef2a…5dbb and 28d0b53a…8217): the same sha256 at both ends. The two lanes now stand on the same bytes.

## 3. What changed from the old pins

By line, old pin against new, file by file (`compare-pin-v1.mjs`; two runs gave the same bytes):

- **STEP's README**: the same bytes.
- **TBESH**: 6 lines out, 6 in, all of them the licence summary at the head. No entry line changed.
- **TAHOT**: in each of the four files the licence summary's 10 lines changed. Beyond them, only Job to Song changed:
  - **Psalms 44:15, 57:10, 108:4 and 149:7** (STEP's rows Psa.44.14(44.15), Psa.57.9(57.10), Psa.108.3(108.4), Psa.149.7). At each place the two word rows «not» and «peoples» (or «nations»), of type L, go out, and one row of type V comes in: «among the/ peoples» (H9003/H3816). STEP's «Significant variant» line keeps «not// peoples». That is 8 rows out and 4 in. The verse's summary lines under «#» change with them (16 lines each way).
  - **Psalms 42:5** (STEP's row Psa.42.4(42.5)#08=L, «with the/ crowd»): the row stands as it was. Only its column 7 changed, from empty to one space.

  Your letter's «four places only» holds for readings. The fifth row differs by one space.
- **UBS**: entries 7,932 to 7,943; base forms 8,902 to 8,918; senses 16,224 to 16,619; references 260,813 to 291,411. The lane counted by its own reading and got your figure at each. LICENSE.md and README.md are the same bytes as at v0.9.2.

## 4. STEP's licence summary changed

The commit is «Licence summary clarified». The new summary at the head of each data file asks users to «Attribute the data to Tyndale House and STEPBible.org». It also asks them to link STEPBible.github.io/STEPBible-Data as the source. It asks that copies of the files not be posted elsewhere. The README, which states CC BY 4.0, is the same bytes.

The lane's copies sit on the lanes' own private store, not on a public page. How the page credits STEP is yours to lay. Where the page credits STEP, the summary now names Tyndale House beside STEPBible.org, with that link.

## 5. Where they stand

On the store, each revision in its own folder beside the old pin, which stays: `v2/sources/received/tahot/5de0a47f/`, `v2/sources/received/tbesh/5de0a47f/`, `v2/sources/received/ubs-dictionary/a15a96cf/`.

The upload is 20 objects: the 11 files, the provider's records and the two manifests. They take 19,765,325 bytes stored, each gzipped and checked to unpack to the fetched sha256 (`upload-v1/pin-received-v1.tsv`). rclone's check found 20 matching and 0 differences. The store went from 6,990,134,046 bytes in 93,462 objects to 7,009,899,371 bytes in 93,482 objects.

The old pins stay on the store, because the lane's records stand on them. These are STEP b86d26cd under `v2/sources/received/tahot/` and `tbesh/`, and UBS v0.9.2 under `v2/sources/received/ubs-dictionary/`.

## 6. What it means for the lane's records

- **TBESH**: the lane's records read the same entries at both pins.
- **TAHOT**: the lane's records differ in reading at the four Psalms places only. There STEP's own row stands, as v223 said under FW1.
- **UBS**: the lane's records (M18) are of v0.9.2, and its ids are not stable between versions, as you found. The lane will not carry v0.9.2's ids onto v0.9.4; a reissue reads v0.9.4 whole, by its own ids.

The lane's builds take both pins at their next reissue. Nothing in this ship changes a served row.

The register now gives FB3 as ANSWERED (v224). It ships as `ASKS-REGISTER-v224.md`, a byte copy of `ASKS-REGISTER.md`, because git takes adds only and v223 put the register there under its own name.

## The files of this ship

- ASKS-REGISTER-v224.md: 11,470 bytes, sha256 f4b47e912c575a35321b0d64f4d8562d54a655f63701214df08dd36ff0132893
- pin-v1/RULE.md: 3,328 bytes, sha256 6fd8f7d1fcdd460562d16d3ecc5c042b4fe68b9d88bb582837e388a95823b007
- pin-v1/fetch-pin-v1.mjs: 5,929 bytes, sha256 3ed55b29f239ac0530289a231b7a63a6fb4cd5627326f5e85efb80f836dd3c8a
- pin-v1/fetch-run-1.json: 286 bytes, sha256 f3decf78acc4ccfd61a0136aa8cc1e27842efee5c9d7054d5e7bfa7c9583778d
- pin-v1/fetch-run-1.err: 917 bytes, sha256 f0aef269bc2d8b7ac314b3d06409a7d5f7106eaf24c0474b57a5bbf57f5073ec
- pin-v1/compare-pin-v1.mjs: 7,293 bytes, sha256 834744af96aa909fb1050fd790673a5d9c68b3874e4bf36ad1c4ee4ca3e06ba9
- pin-v1/run-1/compare-v1.json: 6,427 bytes, sha256 769a53feea2bf1322725fa13d34aff5d781593f8cb035a45cce261c94841cc4d
- pin-v1/run-1/tahot-changed-lines-v1.tsv: 918 bytes, sha256 c76da91360488db05a4583932b39d8ab917a8c695e313a40e7640be88e364200
- pin-v1/two-runs-v1.txt: 205 bytes, sha256 21869d3c61b739a4237c0790c07004e7c077b32b132303ab234e1750b1b727e4
- pin-v1/stage-pin-v1.mjs: 3,592 bytes, sha256 01396c8a9c62c4faa44dea4210b5b4bdaead12e88d6ec8162a55a7d6b8dfed92
- pin-v1/upload-v1/files-from-v1.txt: 1,886 bytes, sha256 c8ca7059a80799e30b4005d235275e332cdcc11cdfdd35ac11b40d6a001ddcd7
- pin-v1/upload-v1/pin-received-v1.tsv: 6,594 bytes, sha256 615bde5c42f4170168510f107bf646fcb9ef4021de3cccdd61605c01ddd8fe72
- pin-v1/upload-v1/total-before.json: 48 bytes, sha256 1ceacdeb5a1f7d59f558955f5709e81ca9eb3a30cd87fbf1bcf9624d981f111a
- pin-v1/upload-v1/total-after.json: 48 bytes, sha256 a79d37d3ea8b986dd7d5a565c53e16655347f4cd34572f4334f9bc4a32bd6b3c
- pin-v1/upload-v1/check-v1.txt: 132 bytes, sha256 3cd098ea926d5448f58dd022e0ed6f37d2674b71d9e3371d5d27298f995dab97
- ship-v224/commit-message.txt: 986 bytes, sha256 cabd4fb7d178b6914b9fc9eab7e4d81c0604090f6c5b63ed9ce6e45bed1b9da1
- ship-v224/make-relay-v224.mjs: 11,686 bytes, sha256 ce2369afbb777ed61d06b06e896aea7f0b900d46d4946aadb7e01a397bf114b5
- ship-v224/run-ship.mjs: 5,170 bytes, sha256 3b07132bdc1ea34f02069d95a38dbb98b0b9b63bbb8f75dee12a224b53664af4

The draft of this relay (`FOR-ELIJAH-v224.draft.md`) ships too; it cannot name its own sha256, which the ship receipt holds.

Nothing served is changed.
