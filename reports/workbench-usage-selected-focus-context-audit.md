# Workbench Usage Selected Focus Context Audit

Generated: 2026-06-01T05:09:05.848Z

## Summary

- Rows: 49
- Selected cards: 49
- Single-marker rows: 49
- Focus marker mismatch rows: 0
- Repeated-focus context rows: 8
- Missing Hebrew context rows: 0
- Total context tokens: 645
- Max context tokens: 17
- Reader-facing rows: 0
- Route payload-like field hits: 0

## Policy

This audit validates focus markers and context snippets for selected usage-navigation cards. It does not rank routes, select visible answers, translate, or make meaning claims.

## Checks

| check | status | detail |
|---|---|---|
| rows_present | passed | rows 49 |
| selected_cards_join_complete | passed | rows 49; selected cards 49 |
| single_focus_marker_per_row | passed | single-marker rows 49/49 |
| marked_focus_matches_normalized | passed | focus marker mismatch rows 0 |
| hebrew_context_present | passed | missing Hebrew context rows 0 |
| repeated_focus_context_visible | warning | rows with repeated normalized focus in context 8 |
| reader_facing_zero | passed | reader-facing rows 0 |
| route_payload_absent | passed | route payload-like field hits 0 |

## Rows

| source | frame | status | marked focus | normalized focus | token index | focus occurrences | flags | context |
|---|---|---|---|---|---:|---:|---|---|
| [Deuteronomy 18:4](https://www.sefaria.org/Deuteronomy_18:4) | first-yield / first-produce frame | weak | רֵאשִׁ֨ית | ראשית | 0 | 1 | single-marker, marker-matches | [רֵאשִׁ֨ית] דְּגָֽנְךָ֜ תִּירֹשְׁךָ֣ וְיִצְהָרֶ֗ךָ וְרֵאשִׁ֛ית גֵּ֥ז צֹאנְךָ֖ תִּתֶּן־לֽוֹ׃ |
| [Exodus 23:19](https://www.sefaria.org/Exodus_23:19) | first-yield / first-produce frame | candidate | רֵאשִׁ֗ית | ראשית | 0 | 1 | single-marker, marker-matches | [רֵאשִׁ֗ית] בִּכּוּרֵי֙ אַדְמָ֣תְךָ֔ תָּבִ֕יא בֵּ֖ית יְהֹוָ֣ה אֱלֹהֶ֑יךָ לֹֽא־תְבַשֵּׁ֥ל גְּדִ֖י |
| [Exodus 34:26](https://www.sefaria.org/Exodus_34:26) | first-yield / first-produce frame | candidate | רֵאשִׁ֗ית | ראשית | 0 | 1 | single-marker, marker-matches | [רֵאשִׁ֗ית] בִּכּוּרֵי֙ אַדְמָ֣תְךָ֔ תָּבִ֕יא בֵּ֖ית יְהֹוָ֣ה אֱלֹהֶ֑יךָ לֹא־תְבַשֵּׁ֥ל גְּדִ֖י |
| [Ezekiel 48:14](https://www.sefaria.org/Ezekiel_48:14) | first-yield / first-produce frame | candidate | רֵאשִׁ֣ית | ראשית | 7 | 1 | single-marker, marker-matches | וְלֹֽא־יִמְכְּר֣וּ מִמֶּ֗נּוּ וְלֹ֥א יָמֵ֛ר וְלֹ֥א יעבור יַעֲבִ֖יר [רֵאשִׁ֣ית] הָאָ֑רֶץ כִּי־קֹ֖דֶשׁ לַיהֹוָֽה׃ |
| [Genesis 1:1](https://www.sefaria.org/Genesis_1:1) | opening / first-in-order frame | candidate | רֵאשִׁ֖ית | ראשית | 1 | 1 | single-marker, marker-matches | בְּ [רֵאשִׁ֖ית] בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃ |
| [Genesis 10:10](https://www.sefaria.org/Genesis_10:10) | opening / first-in-order frame | weak | רֵאשִׁ֤ית | ראשית | 1 | 1 | single-marker, marker-matches | וַתְּהִ֨י [רֵאשִׁ֤ית] מַמְלַכְתּוֹ֙ בָּבֶ֔ל וְאֶ֖רֶךְ וְאַכַּ֣ד וְכַלְנֵ֑ה בְּאֶ֖רֶץ שִׁנְעָֽר׃ |
| [Ibn Ezra on Deuteronomy 21:17:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_21:17:3) | opening / first-in-order frame | weak | ראשית | ראשית | 2 | 1 | single-marker, marker-matches | כי הוא [ראשית] אונו הנודע עם הישר ידבר וכל ישראל בחזקת |
| [Ibn Ezra on Deuteronomy 33:21:1](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:21:1) | first-yield / first-produce frame | weak | ראשית | ראשית | 1 | 1 | single-marker, marker-matches | וירא [ראשית] לו הטעם שראה לנפשו ויבקש לו נחלה קודם |
| [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) | opening / first-in-order frame | candidate | ראשית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | קדם והטעם קדמון שאין לו ראשית ואחרית וטעם [ראשית] ואחרית כנגד הנבראים והגאון אמר כי ומתחת פירוש |
| [Ibn Ezra on Deuteronomy 33:27:3](https://www.sefaria.org/Ibn_Ezra_on_Deuteronomy_33:27:3) | opening / first-in-order frame | candidate | ראשית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | כי הוא אלהי קדם והטעם קדמון שאין לו [ראשית] ואחרית וטעם ראשית ואחרית כנגד הנבראים והגאון אמר |
| [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) | first-yield / first-produce frame | weak | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | הדמע והנה פי זה הכתוב במקום אחר והוא [ראשית] דגנך תירושך ויצהרך דבר יח ד על כן |
| [Ibn Ezra on Exodus 22:28:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_22:28:1) | first-yield / first-produce frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | כן עמו בכור בניך תתן לי כי הוא [ראשית] אונו ובן זוטא אמר כי מלאתך על ההריון |
| [Ibn Ezra on Exodus 23:19:1](https://www.sefaria.org/Ibn_Ezra_on_Exodus_23:19:1) | first-yield / first-produce frame | candidate | ראשית | ראשית | 0 | 1 | single-marker, marker-matches | [ראשית] זהו ואם תקריב מנחת בכורים ויקרא ב יד |
| [Ibn Ezra on Exodus 23:19:2](https://www.sefaria.org/Ibn_Ezra_on_Exodus_23:19:2) | first-yield / first-produce frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | וכל זה חשבו בעבור שמצאנו זאת המצוה עם [ראשית] בכורי אדמתך והנה גם הוא במקום אחר עם |
| [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) | opening / first-in-order frame | weak | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | הערב או הלילה או החשך והנה שכחו וירא [ראשית] לו דבר ל ג כ א וי א |
| [Ibn Ezra on Genesis 1:1:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_1:1:1) | opening / first-in-order frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | בלי טעם וטעמם שלא יעלה על לב שאין [ראשית] לשמים ולארץ ע כ אמר בראשית ולפי דעתי |
| [Ibn Ezra on Genesis 9:25:2](https://www.sefaria.org/Ibn_Ezra_on_Genesis_9:25:2) | opening / first-in-order frame | supported | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | הראשון אחר המבול היה מכוש וכן כתוב ותהי [ראשית] ממלכתו בבל בראשית יו ד י |
| [Ibn Ezra on Genesis 10:21:2](https://www.sefaria.org/Ibn_Ezra_on_Genesis_10:21:2) | opening / first-in-order frame | weak | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | ושנה וחדשים ופי שנתים שנכנסה השנה השנית מחשבון [ראשית] המבול גם יש אומרים כי אחר חמשה חדשים |
| [Ibn Ezra on Genesis 48:16:2](https://www.sefaria.org/Ibn_Ezra_on_Genesis_48:16:2) | first-yield / first-produce frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | ל כה גם נתן לו הבכורה כי הוא [ראשית] מחשבתו ואחר שלא היה ראובן ראוי לבכורה היה |
| [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) | first-yield / first-produce frame | supported | ראשית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | אתה כחי בך נראה בתחלה כחי והבכור יקרא [ראשית] און וכמוהו ראשית אונים תהלים עט נא |
| [Ibn Ezra on Genesis 49:3:1](https://www.sefaria.org/Ibn_Ezra_on_Genesis_49:3:1) | first-yield / first-produce frame | supported | ראשית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | נראה בתחלה כחי והבכור יקרא ראשית און וכמוהו [ראשית] אונים תהלים עט נא |
| [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) | opening / first-in-order frame | supported | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | כב אחר העולם נברא על לויתן שנאמר ״הוא [ראשית] דרכי אל״ איוב מ יט אחר העולם נברא |
| [Ibn Ezra on Genesis, Introduction:22](https://www.sefaria.org/Ibn_Ezra_on_Genesis%2C_Introduction:22) | opening / first-in-order frame | supported | ראשית | ראשית | 6 | 1 | single-marker, marker-matches | דרש בראשית בתורה שנאמר ״ד׳ קנני [ראשית] דרכו״ משלי ח כב אחר העולם נברא על |
| [Ibn Ezra on Leviticus 2:14:1](https://www.sefaria.org/Ibn_Ezra_on_Leviticus_2:14:1) | first-yield / first-produce frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | ולפי דעתי כי אין צורך כי החיוב הוא [ראשית] בכורים ולא הבכורים והרוצה להביא מנחה מבכורים נדבה |
| [Ibn Ezra on Leviticus 23:11:1](https://www.sefaria.org/Ibn_Ezra_on_Leviticus_23:11:1) | first-yield / first-produce frame | weak | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | ועשו מצות ועוד כי אין קציר כי הוא [ראשית] קציר שעורים גם יש כדמות ראיה על פירושו |
| [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) | opening / first-in-order frame | candidate | ראשית | ראשית | 6 | 1 | single-marker, marker-matches | וירא את עמלק בדרך נבואה והמשל [ראשית] גוים ופירושו כי הוא הגוי הנלחם עם ישראל |
| [Ibn Ezra on Numbers 24:20:1](https://www.sefaria.org/Ibn_Ezra_on_Numbers_24:20:1) | opening / first-in-order frame | candidate | ראשית | ראשית | 8 | 1 | single-marker, marker-matches | ועד אשה מעולל ועד יונק וזקן ורבים פירשו [ראשית] גוים כי הם יחשבו בראש הגוים ולא היה |
| [II Chronicles 31:5](https://www.sefaria.org/II_Chronicles_31:5) | first-yield / first-produce frame | supported | רֵאשִׁ֣ית | ראשית | 4 | 1 | single-marker, marker-matches | וְכִפְרֹ֣ץ הַדָּבָ֗ר הִרְבּ֤וּ בְנֵֽי־יִשְׂרָאֵל֙ [רֵאשִׁ֣ית] דָּגָ֗ן תִּיר֤וֹשׁ וְיִצְהָר֙ וּדְבַ֔שׁ וְכֹ֖ל תְּבוּאַ֣ת שָׂדֶ֑ה וּמַעְשַׂ֥ר |
| [Jeremiah 2:3](https://www.sefaria.org/Jeremiah_2:3) | first-yield / first-produce frame | supported | רֵאשִׁ֖ית | ראשית | 3 | 1 | single-marker, marker-matches | קֹ֤דֶשׁ יִשְׂרָאֵל֙ לַיהֹוָ֔ה [רֵאשִׁ֖ית] תְּבוּאָתֹ֑ה כׇּל־אֹכְלָ֣יו יֶאְשָׁ֔מוּ רָעָ֛ה תָּבֹ֥א אֲלֵיהֶ֖ם נְאֻם־יְהֹוָֽה׃ פ |
| [Job 40:19](https://www.sefaria.org/Job_40:19) | opening / first-in-order frame | candidate | רֵאשִׁ֣ית | ראשית | 1 | 1 | single-marker, marker-matches | ה֭וּא [רֵאשִׁ֣ית] דַּרְכֵי־אֵ֑ל הָ֝עֹשׂ֗וֹ יַגֵּ֥שׁ חַרְבּֽוֹ׃ |
| [Leviticus 23:10](https://www.sefaria.org/Leviticus_23:10) | first-yield / first-produce frame | weak | רֵאשִׁ֥ית | ראשית | 8 | 1 | single-marker, marker-matches | אֲשֶׁ֤ר אֲנִי֙ נֹתֵ֣ן לָכֶ֔ם וּקְצַרְתֶּ֖ם אֶת־קְצִירָ֑הּ וַהֲבֵאתֶ֥ם אֶת־עֹ֛מֶר [רֵאשִׁ֥ית] קְצִירְכֶ֖ם אֶל־הַכֹּהֵֽן׃ |
| [Numbers 15:20](https://www.sefaria.org/Numbers_15:20) | first-yield / first-produce frame | candidate | רֵאשִׁית֙ | ראשית | 0 | 1 | single-marker, marker-matches | [רֵאשִׁית֙] עֲרִסֹ֣תֵכֶ֔ם חַלָּ֖ה תָּרִ֣ימוּ תְרוּמָ֑ה כִּתְרוּמַ֣ת גֹּ֔רֶן כֵּ֖ן תָּרִ֥ימוּ |
| [Proverbs 8:22](https://www.sefaria.org/Proverbs_8:22) | opening / first-in-order frame | candidate | רֵאשִׁ֣ית | ראשית | 2 | 1 | single-marker, marker-matches | יְֽהֹוָ֗ה קָ֭נָנִי [רֵאשִׁ֣ית] דַּרְכּ֑וֹ קֶ֖דֶם מִפְעָלָ֣יו מֵאָֽז׃ |
| [Psalms 78:51](https://www.sefaria.org/Psalms_78:51) | first-yield / first-produce frame | candidate | רֵאשִׁ֥ית | ראשית | 3 | 1 | single-marker, marker-matches | וַיַּ֣ךְ כׇּל־בְּכ֣וֹר בְּמִצְרָ֑יִם [רֵאשִׁ֥ית] א֝וֹנִ֗ים בְּאׇהֳלֵי־חָֽם׃ |
| [Psalms 105:36](https://www.sefaria.org/Psalms_105:36) | first-yield / first-produce frame | candidate | רֵ֝אשִׁ֗ית | ראשית | 3 | 1 | single-marker, marker-matches | וַיַּ֣ךְ כׇּל־בְּכ֣וֹר בְּאַרְצָ֑ם [רֵ֝אשִׁ֗ית] לְכׇל־אוֹנָֽם׃ |
| [Rashi on Deuteronomy 16:9:1](https://www.sefaria.org/Rashi_on_Deuteronomy_16:9:1) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 6 | 1 | single-marker, marker-matches | מהחל חרמש בקמה מִשֶּׁנִּקְצַר הָעֹמֶר שֶׁהוּא [רֵאשִׁית] הַקָּצִיר עי ספרי מנחות ע א |
| [Rashi on Deuteronomy 18:4:1](https://www.sefaria.org/Rashi_on_Deuteronomy_18:4:1) | first-yield / first-produce frame | candidate | ראשית | ראשית | 0 | 1 | single-marker, marker-matches | [ראשית] דגנך זוֹ תְּרוּמָה וְלֹא פֵּרֵשׁ בָּהּ שִׁעוּר אֲבָל |
| [Rashi on Deuteronomy 18:4:2](https://www.sefaria.org/Rashi_on_Deuteronomy_18:4:2) | opening / first-in-order frame | weak | רֵאשִׁית | ראשית | 8 | 1 | single-marker, marker-matches | צאנך כְּשֶׁאַתָּה גּוֹזֵז צֹאנְךָ בְּכָל שָׁנָה תֵּן מִמֶּנָּה [רֵאשִׁית] לַכֹּהֵן וְלֹא פֵּרֵשׁ בָּהּ שִׁעוּר וְרַבּוֹתֵינוּ נָתְנוּ בָהּ |
| [Rashi on Deuteronomy 26:2:1](https://www.sefaria.org/Rashi_on_Deuteronomy_26:2:1) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 3 | 1 | single-marker, marker-matches | מראשית וְלֹא כָל [רֵאשִׁית] שֶׁאֵין כָּל הַפֵּרוֹת חַיָּבִים בְּבִכּוּרִים אֶלָּא שִׁבְעַת הַמִּינִין |
| [Rashi on Deuteronomy 26:13:5](https://www.sefaria.org/Rashi_on_Deuteronomy_26:13:5) | first-yield / first-produce frame | supported | רֵאשִׁית | ראשית | 8 | 1 | single-marker, marker-matches | וְלֹא מַעֲשֵׂר לִתְרוּמָה וְלֹא שֵׁנִי לָרִאשׁוֹן שֶׁהַתְּרוּמָה קְרוּיָה [רֵאשִׁית] שֶׁהִיא רִאשׁוֹנָה מִשֶּׁנַעֲשָׂה דָגָן וּכְתִיב שמות כ ב |
| [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | שֶׁנִקְרֵאת רֵאשִׁית דַּרְכּוֹ משלי ח וּבִשְׁבִיל יִשְׂרָאֵל שֶׁנִקְרְאוּ [רֵאשִׁית] תְּבוּאָתוֹ ירמיה ב וְאִם בָּאתָ לְפָרְשׁוֹ כִּפְשׁוּטוֹ כָּךְ |
| [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) | opening / first-in-order frame | supported | רֵאשִׁית | ראשית | 8 | 1 | single-marker, marker-matches | לִכְתֹּב בָּרִאשׁוֹנָה בָּרָא אֶת הַשָּׁמַיִם וְגוֹ שֶׁאֵין לְךָ [רֵאשִׁית] בַּמִּקְרָא שֶׁאֵינוֹ דָבוּק לַתֵּבָה שֶׁלְּאַחֲרָיו כְּמוֹ בְּרֵאשִׁית מַמְלֶכֶת |
| [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) | opening / first-in-order frame | supported | רֵאשִׁית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | יְהוֹיָקִים שׁם כ ז רֵאשִׁית מַמְלַכְתּוֹ בראשית י [רֵאשִׁית] דְּגָנְךָ דברים י ח ד אַף כָּאן אַתָּה |
| [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) | opening / first-in-order frame | supported | רֵאשִׁית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | שֶׁלְּאַחֲרָיו כְּמוֹ בְּרֵאשִׁית מַמְלֶכֶת יְהוֹיָקִים שׁם כ ז [רֵאשִׁית] מַמְלַכְתּוֹ בראשית י רֵאשִׁית דְּגָנְךָ דברים י ח |
| [Rashi on Genesis 1:1:2](https://www.sefaria.org/Rashi_on_Genesis_1:1:2) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 8 | 2 | single-marker, marker-matches, repeated-focus-context | אֶלָּא דָּרְשֵׁנִי כְּמוֹ שֶׁדְּרָשׁוּהוּ רַבּוֹתֵינוּ בִּשְׁבִיל הַתּוֹרָה שֶׁנִקְרֵאת [רֵאשִׁית] דַּרְכּוֹ משלי ח וּבִשְׁבִיל יִשְׂרָאֵל שֶׁנִקְרְאוּ רֵאשִׁית תְּבוּאָתוֹ |
| [Rashi on Leviticus 23:10:1](https://www.sefaria.org/Rashi_on_Leviticus_23:10:1) | first-yield / first-produce frame | weak | ראשית | ראשית | 0 | 1 | single-marker, marker-matches | [ראשית] קצירכם שֶׁתְּהֵא רִאשׁוֹנָה לַקָּצִיר ספרא |
| [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) | opening / first-in-order frame | weak | ראשית | ראשית | 0 | 1 | single-marker, marker-matches | [ראשית] ערסתכם כְּשֶׁתָּלוּשׁוּ כְדֵי עִסַּתְכֶם שֶׁאַתֶּם רְגִילִין לָלוּשׁ בַּמִּדְבָּר |
| [Rashi on Numbers 15:20:1](https://www.sefaria.org/Rashi_on_Numbers_15:20:1) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 8 | 1 | single-marker, marker-matches | לַגֻּלְגֹּלֶת שם תָּרִימוּ מֵרֵאשִׁיתָהּ כְּלוֹמַר קֹדֶם שֶׁתֹּאכְלוּ מִמֶּנָּה [רֵאשִׁית] חֶלְקָהּ חלה אַחַת תרימו תרומה לְשֵׁם ה עירובין |
| [Rashi on Numbers 18:27:1](https://www.sefaria.org/Rashi_on_Numbers_18:27:1) | first-yield / first-produce frame | candidate | רֵאשִׁית | ראשית | 8 | 1 | single-marker, marker-matches | וְלִטְמֵאִין וְחַיָּבִין עָלֶיהָ מִיתָה וְחֹמֶשׁ כִּתְרוּמָה גְדוֹלָה שֶׁנִּקְרֵאת [רֵאשִׁית] דָּגָן מִן הַגֹּרֶן |
