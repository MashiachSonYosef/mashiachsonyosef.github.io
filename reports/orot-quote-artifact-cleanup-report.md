# Orot Quote Artifact Cleanup Report

Generated: 2026-04-30T14:01:17.035Z

## Scope

- Work: Orot only
- New lexical entries added: no
- New source imports: no
- Rule: remove trailing ASCII double quote or Hebrew gershayim only when the stripped token already resolves through existing approved layers
- Ambiguous abbreviations changed: no
- Hebrew source, anchors, overlays, and exports changed: no

## Summary

- Matched before cleanup: 14533
- Fixed by quote/punctuation cleanup: 189
- Matched after cleanup: 14722
- Remaining unmatched: 2585

## Fixed Tokens

| # | Surface form | Codepoints | Stripped token | Count | Existing match method | Example refs |
|---:|---|---|---|---:|---|---|
| 1 | ישראל" | 05D9 05E9 05E8 05D0 05DC 0022 | ישראל | 17 | direct | Orot, Lights from Darkness, Land of Israel 7:2; Orot, Lights from Darkness, Land of Israel 8:1; Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 2 | ד׳" | 05D3 05F3 0022 | ד׳ | 13 | direct | Orot, Lights from Darkness, Land of Israel 8:1; Orot, Lights from Darkness, War 4:1; Orot, Lights from Darkness, Israel and its Rebirth 8:1 |
| 3 | היום" | 05D4 05D9 05D5 05DD 0022 | היום | 4 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1; Orot, Lights from Darkness, Lights of Rebirth 34:3; Orot, Lights of Israel, The Essence of Israel:5 |
| 4 | אחד" | 05D0 05D7 05D3 0022 | אחד | 3 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1; Orot, Lights from Darkness, Lights of Rebirth 45:1; Orot, The Process of Ideals in Israel, Dissolution of Ideals:1 |
| 5 | אלהים" | 05D0 05DC 05D4 05D9 05DD 0022 | אלהים | 3 | direct | Orot, Seeds, Suffering Cleanses:3; Orot, Seeds, The Value of Rebirth:9; Orot, Lights of Israel, Holiness of Israel:3 |
| 6 | באהבה" | 05D1 05D0 05D4 05D1 05D4 0022 | באהבה | 3 | direct | Orot, Lights from Darkness, Lights of Rebirth 14:1; Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 7 | בו" | 05D1 05D5 0022 | בו | 3 | direct | Orot, Lights from Darkness, War 10:1; Orot, Lights from Darkness, Israel and its Rebirth 29:1; Orot, Lights from Darkness, Lights of Rebirth 24:1 |
| 8 | להיות" | 05DC 05D4 05D9 05D5 05EA 0022 | להיות | 3 | direct | Orot, Lights from Darkness, Israel and its Rebirth 2:5 |
| 9 | אדם" | 05D0 05D3 05DD 0022 | אדם | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 12:1; Orot, Lights from Darkness, Israel and its Rebirth 25:1 |
| 10 | אל" | 05D0 05DC 0022 | אל | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 11 | בארץ" | 05D1 05D0 05E8 05E5 0022 | בארץ | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 20:1; Orot, The Process of Ideals in Israel, The Godly and the National Ideal in the Individual:4 |
| 12 | בהמה" | 05D1 05D4 05DE 05D4 0022 | בהמה | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 19:1; Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 13 | האדמה" | 05D4 05D0 05D3 05DE 05D4 0022 | האדמה | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 23:1; Orot, The Process of Ideals in Israel, The Godly and the National Ideal in the Individual:4 |
| 14 | הוא" | 05D4 05D5 05D0 0022 | הוא | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 2:5; Orot, Lights from Darkness, Lights of Rebirth 37:1 |
| 15 | ויהודית" | 05D5 05D9 05D4 05D5 05D3 05D9 05EA 0022 | ויהודית | 2 | direct | Orot, The Process of Ideals in Israel, Unification of Ideals:6 |
| 16 | חיים" | 05D7 05D9 05D9 05DD 0022 | חיים | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 35:1; Orot, Seeds, Suffering Cleanses:11 |
| 17 | יה" | 05D9 05D4 0022 | יה | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 18:1; Orot, The Process of Ideals in Israel, Unification of Ideals:9 |
| 18 | ירננו" | 05D9 05E8 05E0 05E0 05D5 0022 | ירננו | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1; Orot, Lights from Darkness, Lights of Rebirth 43:1 |
| 19 | לחוד" | 05DC 05D7 05D5 05D3 0022 | לחוד | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 19:1; Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 20 | לנו" | 05DC 05E0 05D5 0022 | לנו | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1; Orot, Lights of Israel, Preciousness of Israel:2 |
| 21 | נא" | 05E0 05D0 0022 | נא | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 20:1; Orot, Lights from Darkness, Lights of Rebirth 13:1 |
| 22 | עולם" | 05E2 05D5 05DC 05DD 0022 | עולם | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 37:1; Orot, Lights from Darkness, Lights of Rebirth 52:1 |
| 23 | שם" | 05E9 05DD 0022 | שם | 2 | direct | Orot, Lights from Darkness, Lights of Rebirth 34:1; Orot, Lights of Israel, Israel and the Nations:2 |
| 24 | שמו" | 05E9 05DE 05D5 0022 | שמו | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1; Orot, Lights from Darkness, Israel and its Rebirth 9:1 |
| 25 | שמך" | 05E9 05DE 05DA 0022 | שמך | 2 | direct | Orot, Lights from Darkness, Israel and its Rebirth 6:1; Orot, Lights from Darkness, Israel and its Rebirth 27:1 |
| 26 | אבותם" | 05D0 05D1 05D5 05EA 05DD 0022 | אבותם | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 29:1 |
| 27 | אברהם" | 05D0 05D1 05E8 05D4 05DD 0022 | אברהם | 1 | direct | Orot, Lights of Israel, Israel and the Nations:3 |
| 28 | אדמה" | 05D0 05D3 05DE 05D4 0022 | אדמה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 18:1 |
| 29 | אהיה" | 05D0 05D4 05D9 05D4 0022 | אהיה | 1 | direct | Orot, Seeds, Suffering Cleanses:11 |
| 30 | אוהבי" | 05D0 05D5 05D4 05D1 05D9 0022 | אוהבי | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 1:1 |
| 31 | אוהביה" | 05D0 05D5 05D4 05D1 05D9 05D4 0022 | אוהביה | 1 | direct | Orot, Lights from Darkness, Land of Israel 4:1 |
| 32 | אור" | 05D0 05D5 05E8 0022 | אור | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 46:1 |
| 33 | איננו" | 05D0 05D9 05E0 05E0 05D5 0022 | איננו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 32:1 |
| 34 | אלהיה"" | 05D0 05DC 05D4 05D9 05D4 0022 0022 | אלהיה | 1 | direct | Orot, Lights from Darkness, War 9:1 |
| 35 | אלהיו" | 05D0 05DC 05D4 05D9 05D5 0022 | אלהיו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 36 | אליו" | 05D0 05DC 05D9 05D5 0022 | אליו | 1 | direct | Orot, Lights from Darkness, War 9:1 |
| 37 | אנכי" | 05D0 05E0 05DB 05D9 0022 | אנכי | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 8:1 |
| 38 | אשאיר" | 05D0 05E9 05D0 05D9 05E8 0022 | אשאיר | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 39 | אתכם" | 05D0 05EA 05DB 05DD 0022 | אתכם | 1 | direct | Orot, Lights from Darkness, Land of Israel 3:2 |
| 40 | בגבורה" | 05D1 05D2 05D1 05D5 05E8 05D4 0022 | בגבורה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 41 | בגבורים" | 05D1 05D2 05D1 05D5 05E8 05D9 05DD 0022 | בגבורים | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 12:1 |
| 42 | בחידות" | 05D1 05D7 05D9 05D3 05D5 05EA 0022 | בחידות | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 43 | בחיים" | 05D1 05D7 05D9 05D9 05DD 0022 | בחיים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 44 | בינה" | 05D1 05D9 05E0 05D4 0022 | בינה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 27:1 |
| 45 | ביניהם" | 05D1 05D9 05E0 05D9 05D4 05DD 0022 | ביניהם | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 55:1 |
| 46 | בישראל" | 05D1 05D9 05E9 05E8 05D0 05DC 0022 | בישראל | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 19:1 |
| 47 | בך" | 05D1 05DA 0022 | בך | 1 | kaikki | Orot, Lights from Darkness, Lights of Rebirth 55:1 |
| 48 | במישור" | 05D1 05DE 05D9 05E9 05D5 05E8 0022 | במישור | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 49 | במקומו" | 05D1 05DE 05E7 05D5 05DE 05D5 0022 | במקומו | 1 | direct | Orot, Lights of Israel, The Essence of Israel:9 |
| 50 | בניך" | 05D1 05E0 05D9 05DA 0022 | בניך | 1 | direct | Orot, Lights of Israel, The Essence of Israel:13 |
| 51 | בנים" | 05D1 05E0 05D9 05DD 0022 | בנים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 14:1 |
| 52 | בציון" | 05D1 05E6 05D9 05D5 05DF 0022 | בציון | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 3:1 |
| 53 | בריתו" | 05D1 05E8 05D9 05EA 05D5 0022 | בריתו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 20:1 |
| 54 | בשר" | 05D1 05E9 05E8 0022 | בשר | 1 | direct | Orot, Seeds, The Wise is Preferable to Prophet:4 |
| 55 | גבוהה" | 05D2 05D1 05D5 05D4 05D4 0022 | גבוהה | 1 | kaikki | Orot, Lights of Israel, The Essence of Israel:13 |
| 56 | גדול" | 05D2 05D3 05D5 05DC 0022 | גדול | 1 | direct | Orot, The Process of Ideals in Israel, The Godly and the National Ideal in Israel:2 |
| 57 | גדולה" | 05D2 05D3 05D5 05DC 05D4 0022 | גדולה | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:10 |
| 58 | גוי" | 05D2 05D5 05D9 0022 | גוי | 1 | direct | Orot, Lights of Israel, Preciousness of Israel:1 |
| 59 | גוים" | 05D2 05D5 05D9 05DD 0022 | גוים | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 8:1 |
| 60 | האלהים" | 05D4 05D0 05DC 05D4 05D9 05DD 0022 | האלהים | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 27:1 |
| 61 | הארץ" | 05D4 05D0 05E8 05E5 0022 | הארץ | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 62 | הארצות" | 05D4 05D0 05E8 05E6 05D5 05EA 0022 | הארצות | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:1 |
| 63 | הגאולה" | 05D4 05D2 05D0 05D5 05DC 05D4 0022 | הגאולה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 55:1 |
| 64 | הגוים" | 05D4 05D2 05D5 05D9 05DD 0022 | הגוים | 1 | direct | Orot, Lights from Darkness, War 8:1 |
| 65 | הדת" | 05D4 05D3 05EA 0022 | הדת | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:9 |
| 66 | הדתי" | 05D4 05D3 05EA 05D9 0022 | הדתי | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:10 |
| 67 | ההכרח" | 05D4 05D4 05DB 05E8 05D7 0022 | ההכרח | 1 | direct | Orot, Lights from Darkness, Great Calling:1 |
| 68 | הזאת" | 05D4 05D6 05D0 05EA 0022 | הזאת | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 35:1 |
| 69 | הזה" | 05D4 05D6 05D4 0022 | הזה | 1 | direct | Orot, Lights of Israel, Preciousness of Israel:9 |
| 70 | החמשים" | 05D4 05D7 05DE 05E9 05D9 05DD 0022 | החמשים | 1 | direct | Orot, Seeds, Suffering Cleanses:11 |
| 71 | היה" | 05D4 05D9 05D4 0022 | היה | 1 | direct | Orot, Lights of Israel, Preciousness of Israel:1 |
| 72 | הימים" | 05D4 05D9 05DE 05D9 05DD 0022 | הימים | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 5:1 |
| 73 | הישראלית" | 05D4 05D9 05E9 05E8 05D0 05DC 05D9 05EA 0022 | הישראלית | 1 | direct | Orot, The Process of Ideals in Israel, The Situation in Exile:6 |
| 74 | הם" | 05D4 05DD 0022 | הם | 1 | direct | Orot, Lights of Israel, Israel's Soul and its Rebirth:16 |
| 75 | המושכלות" | 05D4 05DE 05D5 05E9 05DB 05DC 05D5 05EA 0022 | המושכלות | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:3 |
| 76 | המחנה" | 05D4 05DE 05D7 05E0 05D4 0022 | המחנה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 35:1 |
| 77 | המטה" | 05D4 05DE 05D8 05D4 0022 | המטה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 78 | הנצח" | 05D4 05E0 05E6 05D7 0022 | הנצח | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:2 |
| 79 | העולם" | 05D4 05E2 05D5 05DC 05DD 0022 | העולם | 1 | direct | Orot, Lights of Israel, The Individual and the Collective:8 |
| 80 | העליונה" | 05D4 05E2 05DC 05D9 05D5 05E0 05D4 0022 | העליונה | 1 | direct | Orot, The Process of Ideals in Israel, Dissolution of Ideals:3 |
| 81 | הפנימית" | 05D4 05E4 05E0 05D9 05DE 05D9 05EA 0022 | הפנימית | 1 | direct | Orot, The Process of Ideals in Israel, The Situation in Exile:3 |
| 82 | הרע" | 05D4 05E8 05E2 0022 | הרע | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 16:1 |
| 83 | התחיה" | 05D4 05EA 05D7 05D9 05D4 0022 | התחיה | 1 | direct | Orot, The Process of Ideals in Israel, Unification of Ideals:7 |
| 84 | ואלהיו" | 05D5 05D0 05DC 05D4 05D9 05D5 0022 | ואלהיו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 20:1 |
| 85 | וחי" | 05D5 05D7 05D9 0022 | וחי | 1 | direct | Orot, Lights of Israel, Israel and the Nations:4 |
| 86 | ויין" | 05D5 05D9 05D9 05DF 0022 | ויין | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 60:1 |
| 87 | ומשפט" | 05D5 05DE 05E9 05E4 05D8 0022 | ומשפט | 1 | direct | Orot, The Process of Ideals in Israel, The Godly and the National Ideal in Israel:2 |
| 88 | ועד" | 05D5 05E2 05D3 0022 | ועד | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 89 | זונות" | 05D6 05D5 05E0 05D5 05EA 0022 | זונות | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 18:1 |
| 90 | חורבן" | 05D7 05D5 05E8 05D1 05DF 0022 | חורבן | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 4:1 |
| 91 | חיי" | 05D7 05D9 05D9 0022 | חיי | 1 | direct | Orot, Lights of Israel, The Essence of Israel:3 |
| 92 | חרב" | 05D7 05E8 05D1 0022 | חרב | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 20:1 |
| 93 | טובו" | 05D8 05D5 05D1 05D5 0022 | טובו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 54:1 |
| 94 | טומאה" | 05D8 05D5 05DE 05D0 05D4 0022 | טומאה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 35:1 |
| 95 | טמא" | 05D8 05DE 05D0 0022 | טמא | 1 | direct | Orot, Lights from Darkness, Land of Israel 3:2 |
| 96 | יאכלו" | 05D9 05D0 05DB 05DC 05D5 0022 | יאכלו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 17:1 |
| 97 | יבואו" | 05D9 05D1 05D5 05D0 05D5 0022 | יבואו | 1 | direct | Orot, The Process of Ideals in Israel, Unification of Ideals:5 |
| 98 | יופי" | 05D9 05D5 05E4 05D9 0022 | יופי | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 30:1 |
| 99 | יושיבו" | 05D9 05D5 05E9 05D9 05D1 05D5 0022 | יושיבו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 15:1 |
| 100 | יחלוף" | 05D9 05D7 05DC 05D5 05E3 0022 | יחלוף | 1 | kaikki | Orot, Lights from Darkness, Israel and its Rebirth 15:1 |
| 101 | יחלף" | 05D9 05D7 05DC 05E3 0022 | יחלף | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:12 |
| 102 | ינחם" | 05D9 05E0 05D7 05DD 0022 | ינחם | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 69:8 |
| 103 | יעקב" | 05D9 05E2 05E7 05D1 0022 | יעקב | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 104 | יקרא" | 05D9 05E7 05E8 05D0 0022 | יקרא | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 8:1 |
| 105 | ירומו" | 05D9 05E8 05D5 05DE 05D5 0022 | ירומו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 72:3 |
| 106 | ירושלים" | 05D9 05E8 05D5 05E9 05DC 05D9 05DD 0022 | ירושלים | 1 | direct | Orot, Seeds, Acts of Creation:3 |
| 107 | ישנים" | 05D9 05E9 05E0 05D9 05DD 0022 | ישנים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 61:1 |
| 108 | כבר" | 05DB 05D1 05E8 0022 | כבר | 1 | direct | Orot, Lights from Darkness, Land of Israel 6:1 |
| 109 | כזב" | 05DB 05D6 05D1 0022 | כזב | 1 | direct | Orot, Lights from Darkness, War 8:1 |
| 110 | כלי" | 05DB 05DC 05D9 0022 | כלי | 1 | direct | Orot, Seeds, The War of Ideas:7 |
| 111 | כמוך" | 05DB 05DE 05D5 05DA 0022 | כמוך | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 112 | לאומים" | 05DC 05D0 05D5 05DE 05D9 05DD 0022 | לאומים | 1 | direct | Orot, Lights from Darkness, War 9:1 |
| 113 | לאורו" | 05DC 05D0 05D5 05E8 05D5 0022 | לאורו | 1 | direct | Orot, Lights from Darkness, War 1:1 |
| 114 | לאלהים" | 05DC 05D0 05DC 05D4 05D9 05DD 0022 | לאלהים | 1 | direct | Orot, Seeds, National Soul and Body:11 |
| 115 | לאלהינו" | 05DC 05D0 05DC 05D4 05D9 05E0 05D5 0022 | לאלהינו | 1 | direct | Orot, Seeds, The War of Ideas:7 |
| 116 | לבא" | 05DC 05D1 05D0 0022 | לבא | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 55:1 |
| 117 | לה" | 05DC 05D4 0022 | לה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 36:1 |
| 118 | להנחם" | 05DC 05D4 05E0 05D7 05DD 0022 | להנחם | 1 | direct | Orot, Seeds, Acts of Creation:3 |
| 119 | לו" | 05DC 05D5 0022 | לו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 120 | לי" | 05DC 05D9 0022 | לי | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 13:1 |
| 121 | לך" | 05DC 05DA 0022 | לך | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 8:1 |
| 122 | לכל״ | 05DC 05DB 05DC 05F4 | לכל | 1 | direct | Orot, Lights of Israel, Love of Israel:9 |
| 123 | למושיע" | 05DC 05DE 05D5 05E9 05D9 05E2 0022 | למושיע | 1 | direct | Orot, Lights of Israel, Israel and the Nations:4 |
| 124 | לעם" | 05DC 05E2 05DD 0022 | לעם | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:3 |
| 125 | לעשות" | 05DC 05E2 05E9 05D5 05EA 0022 | לעשות | 1 | direct | Orot, Lights of Israel, Preciousness of Israel:2 |
| 126 | לפניו" | 05DC 05E4 05E0 05D9 05D5 0022 | לפניו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 12:1 |
| 127 | לראותה" | 05DC 05E8 05D0 05D5 05EA 05D4 0022 | לראותה | 1 | direct | Orot, Lights from Darkness, Land of Israel 7:2 |
| 128 | מאד" | 05DE 05D0 05D3 0022 | מאד | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 18:1 |
| 129 | מועיל" | 05DE 05D5 05E2 05D9 05DC 0022 | מועיל | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 15:1 |
| 130 | מוריך" | 05DE 05D5 05E8 05D9 05DA 0022 | מוריך | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 58:1 |
| 131 | מושיע" | 05DE 05D5 05E9 05D9 05E2 0022 | מושיע | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 55:1 |
| 132 | מות" | 05DE 05D5 05EA 0022 | מות | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 7:1 |
| 133 | מחכים" | 05DE 05D7 05DB 05D9 05DD 0022 | מחכים | 1 | direct | Orot, Lights from Darkness, Land of Israel 5:1 |
| 134 | מכאן" | 05DE 05DB 05D0 05DF 0022 | מכאן | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 21:1 |
| 135 | מכבודו" | 05DE 05DB 05D1 05D5 05D3 05D5 0022 | מכבודו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 16:1 |
| 136 | מכסים" | 05DE 05DB 05E1 05D9 05DD 0022 | מכסים | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 15:1 |
| 137 | מלך" | 05DE 05DC 05DA 0022 | מלך | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 15:1 |
| 138 | מלכנו" | 05DE 05DC 05DB 05E0 05D5 0022 | מלכנו | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 139 | ממנה" | 05DE 05DE 05E0 05D4 0022 | ממנה | 1 | direct | Orot, Seeds, National Soul and Body:9 |
| 140 | מנביא" | 05DE 05E0 05D1 05D9 05D0 0022 | מנביא | 1 | direct | Orot, Seeds, The Wise is Preferable to Prophet:4 |
| 141 | מעלה" | 05DE 05E2 05DC 05D4 0022 | מעלה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 9:1 |
| 142 | מצטרפות" | 05DE 05E6 05D8 05E8 05E4 05D5 05EA 0022 | מצטרפות | 1 | direct | Orot, Lights from Darkness, Land of Israel 7:2 |
| 143 | מצרים" | 05DE 05E6 05E8 05D9 05DD 0022 | מצרים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 53:1 |
| 144 | מקדשנו" | 05DE 05E7 05D3 05E9 05E0 05D5 0022 | מקדשנו | 1 | direct | Orot, The Process of Ideals in Israel, The Situation in Exile:3 |
| 145 | מקנה" | 05DE 05E7 05E0 05D4 0022 | מקנה | 1 | direct | Orot, Lights of Israel, Nationhood of Israel:1 |
| 146 | משיחך" | 05DE 05E9 05D9 05D7 05DA 0022 | משיחך | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 43:1 |
| 147 | מת" | 05DE 05EA 0022 | מת | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 148 | נדע" | 05E0 05D3 05E2 0022 | נדע | 1 | direct | Orot, Lights of Israel, Israel and the Nations:5 |
| 149 | נהיה" | 05E0 05D4 05D9 05D4 0022 | נהיה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 2:5 |
| 150 | נכר" | 05E0 05DB 05E8 0022 | נכר | 1 | direct | Orot, Seeds, The War of Ideas:4 |
| 151 | נכריה" | 05E0 05DB 05E8 05D9 05D4 0022 | נכריה | 1 | direct | Orot, The Process of Ideals in Israel, The Situation in Exile:3 |
| 152 | נפח" | 05E0 05E4 05D7 0022 | נפח | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 67:3 |
| 153 | נרחב" | 05E0 05E8 05D7 05D1 0022 | נרחב | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 58:1 |
| 154 | סלה" | 05E1 05DC 05D4 0022 | סלה | 1 | direct | Orot, Lights from Darkness, Land of Israel 7:2 |
| 155 | עבדיך" | 05E2 05D1 05D3 05D9 05DA 0022 | עבדיך | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 156 | עוד" | 05E2 05D5 05D3 0022 | עוד | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 20:1 |
| 157 | עליך" | 05E2 05DC 05D9 05DA 0022 | עליך | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 65:3 |
| 158 | עלינו" | 05E2 05DC 05D9 05E0 05D5 0022 | עלינו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 21:1 |
| 159 | עמו" | 05E2 05DE 05D5 0022 | עמו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 34:1 |
| 160 | עפר" | 05E2 05E4 05E8 0022 | עפר | 1 | direct | Orot, Seeds, The Value of Rebirth:3 |
| 161 | עשה" | 05E2 05E9 05D4 0022 | עשה | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 162 | עשו" | 05E2 05E9 05D5 0022 | עשו | 1 | direct | Orot, Lights of Israel, Israel's Soul and its Rebirth:8 |
| 163 | פני" | 05E4 05E0 05D9 0022 | פני | 1 | direct | Orot, Lights of Israel, Israel and the Nations:4 |
| 164 | פנים" | 05E4 05E0 05D9 05DD 0022 | פנים | 1 | direct | Orot, Seeds, The Wise is Preferable to Prophet:3 |
| 165 | צדיק" | 05E6 05D3 05D9 05E7 0022 | צדיק | 1 | direct | Orot, Lights of Israel, Israel's Soul and its Rebirth:2 |
| 166 | צדיקים" | 05E6 05D3 05D9 05E7 05D9 05DD 0022 | צדיקים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 20:1 |
| 167 | צדקנו" | 05E6 05D3 05E7 05E0 05D5 0022 | צדקנו | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 32:1 |
| 168 | ציון" | 05E6 05D9 05D5 05DF 0022 | ציון | 1 | direct | Orot, Lights of Israel, Israel and the Nations:12 |
| 169 | קדוש" | 05E7 05D3 05D5 05E9 0022 | קדוש | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 28:1 |
| 170 | קדם" | 05E7 05D3 05DD 0022 | קדם | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 1:1 |
| 171 | קדשים" | 05E7 05D3 05E9 05D9 05DD 0022 | קדשים | 1 | direct | Orot, The Process of Ideals in Israel, Dissolution of Ideals:2 |
| 172 | קודש" | 05E7 05D5 05D3 05E9 0022 | קודש | 1 | direct | Orot, Lights of Israel, Holiness of Israel:4 |
| 173 | קום" | 05E7 05D5 05DD 0022 | קום | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 15:1 |
| 174 | קנה" | 05E7 05E0 05D4 0022 | קנה | 1 | direct | Orot, The Process of Ideals in Israel, Dissolution of Ideals:1 |
| 175 | רב" | 05E8 05D1 0022 | רב | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 16:1 |
| 176 | רבות" | 05E8 05D1 05D5 05EA 0022 | רבות | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:10 |
| 177 | רגלים" | 05E8 05D2 05DC 05D9 05DD 0022 | רגלים | 1 | direct | Orot, The Process of Ideals in Israel, The First and Second Temples; Religion:9 |
| 178 | רע" | 05E8 05E2 0022 | רע | 1 | direct | Orot, Lights from Darkness, War 2:1 |
| 179 | רשע" | 05E8 05E9 05E2 0022 | רשע | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 12:1 |
| 180 | שבתורה" | 05E9 05D1 05EA 05D5 05E8 05D4 0022 | שבתורה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 36:1 |
| 181 | שלום" | 05E9 05DC 05D5 05DD 0022 | שלום | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 23:1 |
| 182 | שמה" | 05E9 05DE 05D4 0022 | שמה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 32:1 |
| 183 | שמים" | 05E9 05DE 05D9 05DD 0022 | שמים | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 16:1 |
| 184 | שער" | 05E9 05E2 05E8 0022 | שער | 1 | direct | Orot, Lights of Israel, Preciousness of Israel:5 |
| 185 | תהום" | 05EA 05D4 05D5 05DD 0022 | תהום | 1 | direct | Orot, Lights from Darkness, Israel and its Rebirth 13:1 |
| 186 | תורה" | 05EA 05D5 05E8 05D4 0022 | תורה | 1 | direct | Orot, Lights from Darkness, Land of Israel 7:2 |
| 187 | תיראו" | 05EA 05D9 05E8 05D0 05D5 0022 | תיראו | 1 | direct | Orot, Lights from Darkness, War 9:2 |
| 188 | תראינה" | 05EA 05E8 05D0 05D9 05E0 05D4 0022 | תראינה | 1 | direct | Orot, Seeds, The Souls of the World of Chaos:4 |
| 189 | תשובה" | 05EA 05E9 05D5 05D1 05D4 0022 | תשובה | 1 | direct | Orot, Lights from Darkness, Lights of Rebirth 43:1 |

## Skipped Trailing-Quote Tokens

| Surface form | Count | Reason |
|---|---:|---|
| בעלה" | 2 | stripped token is not already resolved |
| דמלכא" | 2 | stripped token is not already resolved |
| דעהו" | 2 | stripped token is not already resolved |
| כבהמה" | 2 | stripped token is not already resolved |
| כסותם" | 2 | stripped token is not already resolved |
| לגבולם" | 2 | stripped token is not already resolved |
| תתימרו" | 2 | stripped token is not already resolved |
| אויל" | 1 | stripped token is not already resolved |
| אחישנה" | 1 | stripped token is not already resolved |
| אחרת" | 1 | stripped token is not already resolved |
| אינשי" | 1 | stripped token is not already resolved |
| אליכם" | 1 | stripped token is not already resolved |
| אלקיך" | 1 | stripped token is not already resolved |
| אמונים" | 1 | stripped token is not already resolved |
| ב״מציאות" | 1 | stripped token is not already resolved |
| בארצכם" | 1 | stripped token is not already resolved |
| באשלמותא" | 1 | stripped token is not already resolved |
| בדוכנו" | 1 | stripped token is not already resolved |
| בחרתנו" | 1 | stripped token is not already resolved |
| בטיהרא" | 1 | stripped token is not already resolved |
| בירושלם" | 1 | stripped token is not already resolved |
| ביתה" | 1 | stripped token is not already resolved |
| במישרים" | 1 | stripped token is not already resolved |
| במשקל" | 1 | stripped token is not already resolved |
| בפי" | 1 | stripped token is not already resolved |
| בפרדס" | 1 | stripped token is not already resolved |
| בקר" | 1 | stripped token is not already resolved |
| בראשם" | 1 | stripped token is not already resolved |
| ברחמי" | 1 | stripped token is not already resolved |
| בשוה" | 1 | stripped token is not already resolved |
| בתודה" | 1 | stripped token is not already resolved |
| גאולים" | 1 | stripped token is not already resolved |
| גזורו" | 1 | stripped token is not already resolved |
| דאברא" | 1 | stripped token is not already resolved |
| ה״דתיות" | 1 | stripped token is not already resolved |
| החפש" | 1 | stripped token is not already resolved |
| היכל" | 1 | stripped token is not already resolved |
| הלכות" | 1 | stripped token is not already resolved |
| הפורפירא" | 1 | stripped token is not already resolved |
| הפרס" | 1 | stripped token is not already resolved |
| הצבא" | 1 | stripped token is not already resolved |
| השטים" | 1 | stripped token is not already resolved |
| התמורה" | 1 | stripped token is not already resolved |
| ואמן" | 1 | stripped token is not already resolved |
| ואנחה" | 1 | stripped token is not already resolved |
| ואעשנה" | 1 | stripped token is not already resolved |
| ובזרעך" | 1 | stripped token is not already resolved |
| ובמזרה" | 1 | stripped token is not already resolved |
| ובנותיך" | 1 | stripped token is not already resolved |
| וגועה" | 1 | stripped token is not already resolved |
