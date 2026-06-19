param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [int]$MaxUnits = 0,
  [string[]]$WorkIds = @(),
  [string]$OnlyWorkIdsPath = '',
  [switch]$SkipOverlayExports,
  [switch]$SkipLexicalPayloadFiles,
  [switch]$OnlyLexicalPayloadFiles,
  [switch]$OnlyOverlayExports,
  [switch]$SkipSitePages,
  [switch]$OnlySitePages,
  [int]$MaxTocUnitLinks = 2000,
  [string]$LexicalAssetBaseUrl = ''
)

$ErrorActionPreference = 'Stop'

$overlayLicenseNotice = 'English translations and translator''s notes by the owner are released under CC0 1.0 Universal. You may copy, modify, distribute, and use them for any purpose without attribution. Hebrew source texts retain their original source/version licenses.'

function Encode-Html {
  param([AllowNull()][string]$Text)
  if ($null -eq $Text) { return '' }
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Convert-HebrewDisplayHtml {
  param([AllowNull()][string]$Text)
  $html = Encode-Html $Text
  $geresh = [char]0x05F3
  return ($html -replace '([\u0590-\u05FF])&#39;', ('$1' + $geresh))
}

function Convert-SourceHtml {
  param([AllowNull()][string]$Text)
  if ($null -eq $Text) { return '' }
  $Text = $Text.Trim()
  $html = Convert-HebrewDisplayHtml $Text
  $html = $html -replace '(?i)&lt;br\s*/?&gt;', '<br>'
  $html = $html -replace '(?i)&lt;b&gt;', '<strong>'
  $html = $html -replace '(?i)&lt;/b&gt;', '</strong>'
  $html = $html -replace '(?i)&lt;strong&gt;', '<strong>'
  $html = $html -replace '(?i)&lt;/strong&gt;', '</strong>'
  $html = $html -replace '(?i)&lt;big&gt;', '<span>'
  $html = $html -replace '(?i)&lt;/big&gt;', '</span>'
  $html = $html -replace '(?i)&lt;small&gt;', '<span class="source-small">'
  $html = $html -replace '(?i)&lt;/small&gt;', '</span>'
  $html = (($html -split '\r?\n') | ForEach-Object { $_.TrimEnd() }) -join "`n"
  return $html.Trim()
}

function Read-Json {
  param([string]$Path)
  Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Write-Utf8 {
  param(
    [string]$Path,
    [string]$Content
  )
  $parent = Split-Path -Path $Path -Parent
  if ($parent) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    $resolved = (Resolve-Path -Path $parent).Path + '\' + (Split-Path $Path -Leaf)
  } else {
    $resolved = (Resolve-Path -Path '.').Path + '\' + $Path
  }
  [System.IO.File]::WriteAllText($resolved, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Join-PublicUrl {
  param(
    [AllowNull()][string]$BaseUrl,
    [string]$RelativePath
  )

  $relative = ($RelativePath -replace '\\', '/').TrimStart('/')
  $base = if ($null -ne $BaseUrl) { [string]$BaseUrl } else { '' }
  $base = $base.Trim()
  if (-not $base) { return $relative }
  return ($base.TrimEnd('/') + '/' + $relative)
}

function Get-SourceUnitCount {
  param([AllowNull()][object]$Source)
  if ($null -eq $Source) { return 0 }
  if ($Source.PSObject.Properties.Name -contains 'unit_count') {
    return [int]$Source.unit_count
  }
  return @($Source.units).Count
}

function Ensure-SourceCatalog {
  param(
    [string]$SourceDirectory,
    [string]$CatalogPath = 'data/catalog/source-catalog.json'
  )

  $scriptPath = 'scripts/generate_source_catalog.mjs'
  if (-not (Test-Path -LiteralPath $scriptPath)) {
    return $false
  }

  $needsCatalog = -not (Test-Path -LiteralPath $CatalogPath)
  if (-not $needsCatalog) {
    $catalogTime = (Get-Item -LiteralPath $CatalogPath).LastWriteTimeUtc
    foreach ($sourceFile in @(Get-ChildItem -Path $SourceDirectory -Filter '*.json')) {
      if ($sourceFile.LastWriteTimeUtc -gt $catalogTime) {
        $needsCatalog = $true
        break
      }
    }
  }

  if ($needsCatalog) {
    & node $scriptPath --source-dir $SourceDirectory --out $CatalogPath
    if ($LASTEXITCODE -ne 0) {
      throw "Source catalog generation failed: $scriptPath"
    }
  }

  return (Test-Path -LiteralPath $CatalogPath)
}

function Get-JsonHeaderCounts {
  param(
    [string]$Path,
    [int]$BytesToRead = 4096
  )

  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $stream = [System.IO.File]::OpenRead((Resolve-Path -LiteralPath $Path).Path)
  try {
    $length = [Math]::Min($BytesToRead, [int]$stream.Length)
    $buffer = New-Object byte[] $length
    [void]$stream.Read($buffer, 0, $length)
    $header = [System.Text.Encoding]::UTF8.GetString($buffer)
    $counts = [ordered]@{}
    foreach ($key in @('total_unique_surface_forms', 'matched_surface_forms', 'unmatched_surface_forms', 'total_occurrences')) {
      $match = [regex]::Match($header, '"' + [regex]::Escape($key) + '"\s*:\s*(\d+)')
      if ($match.Success) {
        $counts[$key] = [int]$match.Groups[1].Value
      }
    }
    if ($counts.Count -eq 0) { return $null }
    return [pscustomobject]$counts
  } finally {
    $stream.Dispose()
  }
}

function Get-ExportText {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return '' }
  if ($Value -is [string]) { return $Value.Trim() }
  return ((@($Value) | Where-Object { $null -ne $_ -and $_.ToString().Trim() } | ForEach-Object { $_.ToString().Trim() }) -join '; ')
}

function Convert-CsvCell {
  param([AllowNull()][object]$Value)
  $text = Get-ExportText $Value
  return '"' + ($text -replace '"', '""') + '"'
}

function Convert-MarkdownCell {
  param([AllowNull()][object]$Value)
  $text = Get-ExportText $Value
  $text = $text -replace '\|', '\|'
  $text = $text -replace "`r?`n", '<br>'
  return $text
}

function Get-RootHref {
  param([string]$WorkSlug)
  $depth = @($WorkSlug -split '[\\/]' | Where-Object { $_ }).Count
  if ($depth -le 0) { return './' }
  return ('../' * $depth)
}

function Get-VisibleDisplaySlotManifestUrl {
  param(
    [string]$WorkId,
    [string]$RootHref
  )
  if (-not $WorkId) { return $null }
  $path = Join-Path 'data/public-hud' (Join-Path $WorkId 'visible-display-slots.json')
  if (Test-Path -LiteralPath $path) {
    return "$($RootHref)data/public-hud/$WorkId/visible-display-slots.json"
  }
  return $null
}

function Get-RefKey {
  param([AllowNull()][string]$Ref)
  if (-not $Ref) { return '' }
  return (($Ref -replace '\s+', ' ').Trim())
}

function New-BaseUnitLookup {
  param([AllowNull()][object]$BaseSource)

  $lookup = @{}
  if ($null -eq $BaseSource -or $null -eq $BaseSource.units) { return $lookup }
  foreach ($unit in @($BaseSource.units)) {
    foreach ($ref in @($unit.source_ref, $unit.sefaria_ref)) {
      $key = Get-RefKey $ref
      if ($key -and -not $lookup.ContainsKey($key)) {
        $lookup[$key] = $unit
      }
    }
  }
  return $lookup
}

function Get-CommentarySectionPaths {
  param([object]$Unit)

  $ref = if ($Unit.sefaria_ref) { [string]$Unit.sefaria_ref } else { [string]$Unit.source_ref }
  $match = [regex]::Match($ref, '(\d+(?::\d+)*)\s*$')
  if (-not $match.Success) { return @() }
  $parts = @($match.Groups[1].Value -split ':')
  $paths = New-Object System.Collections.Generic.List[string]
  for ($i = $parts.Count; $i -ge 1; $i -= 1) {
    $paths.Add(($parts[0..($i - 1)] -join ':'))
  }
  return @($paths)
}

function Get-PairedBaseUnit {
  param(
    [object]$Source,
    [object]$Unit,
    [hashtable]$BaseLookup
  )

  if ($null -eq $BaseLookup -or $BaseLookup.Count -eq 0) { return $null }

  $baseTitle = [string]$Source.base_work_title
  $baseRefPattern = [string]$Source.base_ref_pattern
  $candidates = New-Object System.Collections.Generic.List[string]
  foreach ($sectionPath in @(Get-CommentarySectionPaths -Unit $Unit)) {
    if ($baseRefPattern -and $baseRefPattern.Contains('{sections}')) {
      $candidates.Add($baseRefPattern.Replace('{sections}', $sectionPath))
    }
    if ($baseTitle) {
      $candidates.Add("$baseTitle $sectionPath")
    }
  }

  foreach ($candidate in @($candidates | Select-Object -Unique)) {
    $key = Get-RefKey $candidate
    if ($key -and $BaseLookup.ContainsKey($key)) {
      return $BaseLookup[$key]
    }
  }
  return $null
}

function Get-HomeGroup {
  param([object]$Source)
  if ([string]$Source.work_id -eq 'orot' -or [string]$Source.work_slug -eq 'orot') {
    return 'Thought / Musar / Chasidut'
  }
  $slugParts = @($Source.work_slug -split '[\\/]' | Where-Object { $_ })
  if ($slugParts.Count -gt 1) {
    $first = $slugParts[0]
    if ($first -eq 'gra') {
      $title = [string]$Source.work_title
      $baseTitle = [string]$Source.base_work_title
      $label = [string]$Source.display_label
      $groupingText = "$title $baseTitle $label"
      if ($groupingText -match 'Shulchan Arukh') { return 'Halakhah' }
      if ($groupingText -match 'Jerusalem Talmud|Tractate|Pirkei Avot') { return 'Talmud / Rabbinic' }
      if ($groupingText -match 'Avot D''Rabbi Natan') { return 'Midrash / Aggadah' }
      if ($groupingText -match 'Torah') { return 'Tanakh' }
      if ($groupingText -match 'Zohar|Sifra DeTzniuta|Sefer Yetzirah|Kol HaTor') { return 'Kabbalah / Esoteric' }
      return 'Thought / Musar / Chasidut'
    }
    if ($first -eq 'tanakh') { return 'Tanakh' }
    if ($first -eq 'midrash') { return 'Midrash / Aggadah' }
    if ($first -eq 'talmud') { return 'Talmud / Rabbinic' }
    if ($first -eq 'tosefta') { return 'Talmud / Rabbinic' }
    if ($first -eq 'ari') { return 'Kabbalah / Esoteric' }
    if ($first -eq 'kabbalah') { return 'Kabbalah / Esoteric' }
    if ($first -eq 'rav-kook') { return 'Thought / Musar / Chasidut' }
    if ($first -eq 'jewish-thought') { return 'Thought / Musar / Chasidut' }
    if ($first -eq 'musar') { return 'Thought / Musar / Chasidut' }
    if ($first -eq 'chasidut') { return 'Thought / Musar / Chasidut' }
    if ($first -eq 'halakhah') { return 'Halakhah' }
    if ($first -eq 'second-temple') { return 'Second Temple / Apocrypha' }
    if ($first -eq 'liturgy') { return 'Liturgy / Piyyut' }
    if ($first -eq 'targum') { return 'Targum / Aramaic' }
    return (Get-Culture).TextInfo.ToTitleCase(($first -replace '-', ' '))
  }
  return 'Other'
}

function Format-CountPhrase {
  param(
    [int]$Count,
    [string]$Singular,
    [string]$Plural = ''
  )
  if (-not $Plural) { $Plural = "${Singular}s" }
  if ($Count -eq 1) { return "$Count $Singular" }
  return "$Count $Plural"
}

function Get-LibrarySubgroup {
  param([object]$Source)

  $group = Get-HomeGroup $Source
  if ([string]$Source.work_id -eq 'orot' -or [string]$Source.work_slug -eq 'orot') {
    return 'Modern Hebrew Thought'
  }
  $title = [string]$Source.work_title
  $baseTitle = [string]$Source.base_work_title
  $workType = [string]$Source.work_type
  $isCommentary = $workType -eq 'commentary'

  switch ($group) {
    'Tanakh' {
      $torah = @('Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy')
      $prophets = @('Joshua', 'Judges', 'I Samuel', 'II Samuel', 'I Kings', 'II Kings', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi')
      $writings = @('Psalms', 'Proverbs', 'Job', 'Song of Songs', 'Ruth', 'Lamentations', 'Ecclesiastes', 'Esther', 'Daniel', 'Ezra', 'Nehemiah', 'I Chronicles', 'II Chronicles')
      if ($torah -contains $title) { return 'Torah' }
      if ($prophets -contains $title) { return 'Prophets' }
      if ($writings -contains $title) { return 'Writings' }
      return 'Other Tanakh'
    }
    'Midrash / Aggadah' {
      if ($isCommentary -and ($baseTitle -match 'Rabbah|Rabba|Bereishit|Bereshit|Bamidbar|Devarim|Eichah|Esther|Kohelet|Ruth|Shemot|Shir HaShirim|Vayikra')) { return 'Rabbah Commentaries' }
      if ($title -match 'Lekach Tov') { return 'Lekach Tov and Commentaries' }
      if ($title -match 'Sifra|Sifrei|Tannaim' -or $baseTitle -match 'Sifra|Sifrei|Tannaim') { return 'Halakhic Midrash' }
      if ($isCommentary) { return 'Other Midrash Commentaries' }
      if ($title -match 'Rabbah|Rabba') { return 'Midrash Rabbah' }
      if ($title -match 'Otzar|Alphabet|Seder Olam|Sefer HaYashar') { return 'Collections and Late Midrash' }
      return 'Classic Midrash / Aggadah'
    }
    'Kabbalah / Esoteric' {
      $slugParts = @($Source.work_slug -split '[\\/]' | Where-Object { $_ })
      $firstSlug = if ($slugParts.Count -gt 0) { $slugParts[0] } else { '' }
      if ($isCommentary) { return 'Commentary' }
      if ($title -match 'Zohar|Tikkunei|Tikunei') { return 'Zohar / Tikkunei' }
      if ($firstSlug -eq 'ari' -or $title -match 'Etz Chaim|Pri Etz|Shaar|Likkutei Torah|Sefer HaGilgulim') { return 'Lurianic Kabbalah' }
      return 'Other Kabbalah / Esoteric'
    }
    'Second Temple / Apocrypha' {
      if ($title -match 'Ben Sira|Wisdom') { return 'Wisdom and Instruction' }
      if ($title -match 'Maccabees|Judith|Tobit|Susanna|Aristeas|Ta.anit|Taanit') { return 'Historical and Court Tales' }
      if ($title -match 'Jubilees|Testaments') { return 'Jubilees and Testamentary' }
      return 'Other Second Temple Works'
    }
    'Talmud / Rabbinic' {
      if ($group -eq 'Talmud / Rabbinic' -and [string]$Source.work_slug -match '^talmud[\\/]') {
        if ($isCommentary) { return 'Talmud Commentary' }
        return 'Talmud'
      }
      if ($title -match 'Berakhot|Peah|Demai|Kilayim|Sheviit|Terumot|Maasrot|Maaser Sheni|Challah|Orlah|Bikkurim') { return 'Zeraim' }
      if ($title -match 'Shabbat|Eruvin|Pesachim|Shekalim|Yoma|Sukkah|Beitzah|Rosh Hashanah|Ta.anit|Taanit|Megillah|Moed Katan|Chagigah') { return 'Moed' }
      if ($title -match 'Yevamot|Ketubot|Nedarim|Nazir|Sotah|Gittin|Kiddushin') { return 'Nashim' }
      if ($title -match 'Bava Kamma|Bava Metzia|Bava Batra|Sanhedrin|Makkot|Shevuot|Eduyot|Avodah Zarah|Horayot') { return 'Nezikin' }
      if ($title -match 'Zevachim|Menachot|Chullin|Bekhorot|Arakhin|Temurah|Keritot|Meilah|Tamid|Middot|Kinnim') { return 'Kodashim' }
      if ($title -match 'Kelim|Oholot|Negaim|Parah|Tahorot|Mikvaot|Niddah|Makhshirin|Zavim|Tevul Yom|Yadayim|Oktsin') { return 'Tahorot' }
      return 'Other Rabbinic'
    }
    'Thought / Musar / Chasidut' {
      $slugParts = @($Source.work_slug -split '[\\/]' | Where-Object { $_ })
      $firstSlug = if ($slugParts.Count -gt 0) { $slugParts[0] } else { '' }
      if ($firstSlug -eq 'musar') { return 'Musar' }
      if ($firstSlug -eq 'chasidut') { return 'Chasidut' }
      if ($firstSlug -eq 'rav-kook') { return 'Modern Hebrew Thought' }
      if ($isCommentary) { return 'Commentary' }
      return 'Hebrew Thought'
    }
    default {
      if ($isCommentary) { return 'Commentary' }
      return 'Works'
    }
  }
}

function Get-LibrarySubgroupOrder {
  param(
    [string]$Group,
    [string]$Subgroup
  )

  $orders = @{
    'Tanakh' = @{
      'Torah' = 1
      'Prophets' = 2
      'Writings' = 3
      'Other Tanakh' = 9
    }
    'Midrash / Aggadah' = @{
      'Classic Midrash / Aggadah' = 1
      'Midrash Rabbah' = 2
      'Rabbah Commentaries' = 3
      'Halakhic Midrash' = 4
      'Lekach Tov and Commentaries' = 5
      'Collections and Late Midrash' = 6
      'Other Midrash Commentaries' = 7
    }
    'Kabbalah / Esoteric' = @{
      'Zohar / Tikkunei' = 1
      'Lurianic Kabbalah' = 2
      'Commentary' = 3
      'Other Kabbalah / Esoteric' = 9
    }
    'Talmud / Rabbinic' = @{
      'Talmud' = 1
      'Talmud Commentary' = 2
      'Zeraim' = 3
      'Moed' = 4
      'Nashim' = 5
      'Nezikin' = 6
      'Kodashim' = 7
      'Tahorot' = 8
      'Other Rabbinic' = 9
    }
    'Second Temple / Apocrypha' = @{
      'Wisdom and Instruction' = 1
      'Historical and Court Tales' = 2
      'Jubilees and Testamentary' = 3
      'Other Second Temple Works' = 9
    }
    'Thought / Musar / Chasidut' = @{
      'Hebrew Thought' = 1
      'Modern Hebrew Thought' = 2
      'Musar' = 3
      'Chasidut' = 4
      'Commentary' = 5
    }
  }

  if ($orders.ContainsKey($Group) -and $orders[$Group].ContainsKey($Subgroup)) {
    return $orders[$Group][$Subgroup]
  }
  return 99
}

function Get-VersionSourceLabel {
  param([AllowNull()][string]$Source)
  if (-not $Source) { return '' }
  try {
    $uri = [System.Uri]$Source
    if ($uri.Host) { return $uri.Host }
  } catch {}
  return $Source
}

function Get-OverlayUnit {
  param(
    [object]$Overlay,
    [string]$UnitId
  )
  if ($null -eq $Overlay -or $null -eq $Overlay.units) { return $null }
  return $Overlay.units.PSObject.Properties[$UnitId].Value
}

function Get-OverlayValue {
  param(
    [object]$OverlayUnit,
    [string]$Field
  )
  if ($null -eq $OverlayUnit) { return $null }
  $property = $OverlayUnit.PSObject.Properties[$Field]
  if ($null -eq $property) { return $null }
  return $property.Value
}

function Get-OverlayForSource {
  param(
    [object]$Source,
    [string]$OverlayDir
  )
  $overlayPath = Join-Path $OverlayDir "$($Source.work_id).json"
  if (Test-Path $overlayPath) { return Read-Json -Path $overlayPath }
  return $null
}

function Test-HasContent {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return $false }
  if ($Value -is [string]) { return [bool]$Value.Trim() }
  foreach ($item in @($Value)) {
    if ($null -ne $item -and $item.ToString().Trim()) { return $true }
  }
  return $false
}

function Get-WorkProgress {
  param(
    [object]$Source,
    [object]$Overlay
  )

  $total = @($Source.units).Count
  $done = 0
  foreach ($unit in @($Source.units)) {
    $overlayUnit = Get-OverlayUnit -Overlay $Overlay -UnitId $unit.unit_id
    $translation = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'strict_translation'
    if (Test-HasContent $translation) {
      $done += 1
    }
  }

  $percent = if ($total -gt 0) { [math]::Round(($done / $total) * 100, 1) } else { 0 }
  $percentLabel = if ($percent -eq [math]::Round($percent, 0)) {
    ([int]$percent).ToString()
  } else {
    $percent.ToString('0.0', [System.Globalization.CultureInfo]::InvariantCulture)
  }

  return [pscustomobject]@{
    done = $done
    total = $total
    percent = $percent
    percent_label = $percentLabel
  }
}

function Get-SourceKey {
  param([object]$Unit)
  $digitization = if ($Unit.digitization) { $Unit.digitization } else { '' }
  return "$($Unit.version_title)|$($Unit.version_source)|$digitization|$($Unit.license)"
}

function Get-SourceSummaryHtml {
  param(
    [object]$Note,
    [int]$Index = 0
  )
  $parts = New-Object System.Collections.Generic.List[string]
  if ($Index -gt 0) {
    $parts.Add("[$Index]")
  }
  $parts.Add("Hebrew version: $(Encode-Html $Note.version_title)")
  if ($Note.version_source) {
    $parts.Add("Version source: <a href=""$(Encode-Html $Note.version_source)"">$(Encode-Html (Get-VersionSourceLabel $Note.version_source))</a>")
  }
  $parts.Add("Digitization: $(Encode-Html $Note.digitization)")
  $parts.Add("License: $(Encode-Html $Note.license)")
  return ($parts -join ' | ')
}

function Get-OverlayExportRows {
  param(
    [object]$Source,
    [object]$Overlay
  )

  $rows = @()
  foreach ($unit in @($Source.units)) {
    $overlayUnit = Get-OverlayUnit -Overlay $Overlay -UnitId $unit.unit_id
    $translation = Get-ExportText (Get-OverlayValue -OverlayUnit $overlayUnit -Field 'strict_translation')
    $translatorNotes = Get-ExportText (Get-OverlayValue -OverlayUnit $overlayUnit -Field 'clean_translation')
    $rows += [pscustomobject][ordered]@{
      work_id = $Source.work_id
      work_title = $Source.work_title
      source_ref = $unit.source_ref
      anchor_id = $unit.anchor_id
      translation = $translation
      translator_notes = $translatorNotes
      done_status = if (Test-HasContent $translation) { 'done' } else { 'not_done' }
      updated_at = Get-ExportText (Get-OverlayValue -OverlayUnit $overlayUnit -Field 'updated_at')
    }
  }
  return $rows
}

function Write-OverlayExports {
  param(
    [string]$WorkSlug,
    [object[]]$Rows
  )

  $headers = @('work_id', 'work_title', 'source_ref', 'anchor_id', 'translation', 'translator_notes', 'done_status', 'updated_at')

  $csv = New-Object System.Text.StringBuilder
  [void]$csv.AppendLine(($headers | ForEach-Object { Convert-CsvCell $_ }) -join ',')
  foreach ($row in $Rows) {
    [void]$csv.AppendLine(($headers | ForEach-Object { Convert-CsvCell $row.$_ }) -join ',')
  }

  $json = ConvertTo-Json -InputObject @($Rows) -Depth 10

  $markdown = New-Object System.Text.StringBuilder
  [void]$markdown.AppendLine('| work_id | work_title | source_ref | anchor_id | translation | translator_notes | done_status | updated_at |')
  [void]$markdown.AppendLine('|---|---|---|---|---|---|---|---|')
  foreach ($row in $Rows) {
    $markdownCells = @(
      (Convert-MarkdownCell $row.work_id)
      (Convert-MarkdownCell $row.work_title)
      (Convert-MarkdownCell $row.source_ref)
      (Convert-MarkdownCell $row.anchor_id)
      (Convert-MarkdownCell $row.translation)
      (Convert-MarkdownCell $row.translator_notes)
      (Convert-MarkdownCell $row.done_status)
      (Convert-MarkdownCell $row.updated_at)
    )
    [void]$markdown.AppendLine('| ' + ($markdownCells -join ' | ') + ' |')
  }

  $exportDir = if ($WorkSlug) { $WorkSlug } else { '.' }
  Write-Utf8 -Path (Join-Path $exportDir 'overlay-export.csv') -Content $csv.ToString()
  Write-Utf8 -Path (Join-Path $exportDir 'overlay-export.json') -Content $json
  Write-Utf8 -Path (Join-Path $exportDir 'overlay-export.md') -Content $markdown.ToString()
}

function Write-FullSiteOverlayManifest {
  param(
    [object[]]$Sources
  )

  $headers = @('work_id', 'work_title', 'source_ref', 'anchor_id', 'translation', 'translator_notes', 'done_status', 'updated_at')
  $csvHeader = ($headers | ForEach-Object { Convert-CsvCell $_ }) -join ','
  $markdownHeader = '| work_id | work_title | source_ref | anchor_id | translation | translator_notes | done_status | updated_at |'
  $markdownDivider = '|---|---|---|---|---|---|---|---|'

  $entries = New-Object System.Collections.Generic.List[object]
  $rowCount = 0
  foreach ($source in @($Sources)) {
    $unitCount = @($source.units).Count
    $rowCount += $unitCount
    $entries.Add([ordered]@{
      work_id = [string]$source.work_id
      path = "$($source.work_slug)/overlay-export.json"
      unit_count = $unitCount
    })
  }

  $manifest = [ordered]@{
    kind = 'overlay_export_manifest'
    schema_version = 1
    row_count = $rowCount
    full_site_exports = [ordered]@{
      note = 'Full-site overlay rows are kept per work to avoid oversized root export files.'
      csv = 'overlay-export.csv'
      json = 'overlay-export.json'
      markdown = 'overlay-export.md'
    }
    per_work_json = $entries
  }

  Write-Utf8 -Path 'overlay-export.csv' -Content "$csvHeader`n"
  Write-Utf8 -Path 'overlay-export.json' -Content (ConvertTo-Json -InputObject $manifest -Depth 10)
  Write-Utf8 -Path 'overlay-export.md' -Content "$markdownHeader`n$markdownDivider`n"
}

function Get-ValueListHtml {
  param([AllowNull()][object]$Value)
  $values = @($Value | Where-Object { $null -ne $_ -and $_.ToString().Trim() } | ForEach-Object { $_.ToString().Trim() })
  if ($values.Count -eq 0) {
    return '<p class="placeholder">N/A</p>'
  }
  if ($values.Count -eq 1) {
    return "<p>$(Encode-Html $values[0])</p>"
  }
  $builder = New-Object System.Text.StringBuilder
  [void]$builder.AppendLine('<ul>')
  foreach ($item in $values) {
    [void]$builder.AppendLine("  <li>$(Encode-Html $item)</li>")
  }
  [void]$builder.Append('</ul>')
  return $builder.ToString()
}

function Append-SiteHead {
  param(
    [System.Text.StringBuilder]$Builder,
    [string]$Title,
    [switch]$IncludeLexicalStyles,
    [string]$ReaderWorkbenchCssHref = ''
  )

  [void]$Builder.AppendLine('<!DOCTYPE html>')
  [void]$Builder.AppendLine('<html lang="en">')
  [void]$Builder.AppendLine('<head>')
  [void]$Builder.AppendLine('  <meta charset="UTF-8">')
  [void]$Builder.AppendLine('  <meta name="viewport" content="width=device-width, initial-scale=1.0">')
  [void]$Builder.AppendLine("  <title>$(Encode-Html $Title)</title>")
  [void]$Builder.AppendLine('  <style>')
  [void]$Builder.AppendLine('    :root { color-scheme: dark; --bg: #0a0b0d; --bg-2: #141821; --panel: rgba(15,17,23,0.92); --panel-2: rgba(20,24,31,0.95); --text: #efe8da; --muted: #aaa18f; --line: rgba(214,190,138,0.16); --line-2: rgba(214,190,138,0.3); --accent: #d6be8a; --accent-2: #93a7d1; --hebrew: #f8f1e4; }')
  [void]$Builder.AppendLine('    * { box-sizing: border-box; }')
  [void]$Builder.AppendLine('    body { margin: 0; overflow-x: hidden; background: radial-gradient(circle at top, rgba(147,167,209,0.14), transparent 32%), linear-gradient(180deg, #0a0b0d 0%, #0f1117 100%); color: var(--text); font-family: Georgia, "Times New Roman", serif; }')
  [void]$Builder.AppendLine('    a { color: var(--accent); }')
  [void]$Builder.AppendLine('    main { width: min(1440px, calc(100% - 28px)); max-width: 100%; margin: 0 auto; padding: 28px 0 60px; }')
  [void]$Builder.AppendLine('    h1, h2, h3, h4 { font-weight: 400; margin: 0; scroll-margin-top: 18px; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    h1 { font-size: clamp(2.4rem, 6vw, 5.4rem); line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 14px; }')
  [void]$Builder.AppendLine('    h2 { color: var(--accent); font-size: 1.5rem; margin: 34px 0 14px; }')
  [void]$Builder.AppendLine('    h3 { color: var(--text); font-size: 1.15rem; margin: 22px 0 10px; }')
  [void]$Builder.AppendLine('    h4 { color: var(--accent-2); font-size: 0.95rem; margin: 16px 0 10px; text-transform: uppercase; letter-spacing: 0.08em; }')
  [void]$Builder.AppendLine('    p { color: var(--muted); line-height: 1.6; margin: 0 0 8px; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .shell { min-width: 0; max-width: 100%; overflow-x: hidden; border: 1px solid var(--line); background: linear-gradient(180deg, rgba(17,19,24,0.94), rgba(10,11,13,0.94)); box-shadow: 0 24px 80px rgba(0,0,0,0.35); }')
  [void]$Builder.AppendLine('    .hero { min-width: 0; padding: 22px 22px 18px; border-bottom: 1px solid var(--line); overflow-wrap: anywhere; display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 0.34fr); gap: 18px; align-items: start; }')
  [void]$Builder.AppendLine('    .hero-main { min-width: 0; }')
  [void]$Builder.AppendLine('    .hero-ref { color: var(--accent); font-size: 0.5em; line-height: 1; vertical-align: super; margin-left: 0.08em; }')
  [void]$Builder.AppendLine('    .hero-summary { display: flex; flex-wrap: wrap; gap: 6px 12px; color: var(--muted); font-size: 0.88rem; margin: 0; }')
  [void]$Builder.AppendLine('    .hero-summary span { border: 1px solid rgba(214,190,138,0.14); background: rgba(255,255,255,0.02); padding: 2px 7px; }')
  [void]$Builder.AppendLine('    .hero-notes { border-left: 1px solid var(--line); padding-left: 14px; color: var(--muted); font-size: 0.78rem; line-height: 1.45; }')
  [void]$Builder.AppendLine('    .hero-notes ol { margin: 0; padding-left: 1.2rem; display: grid; gap: 5px; }')
  [void]$Builder.AppendLine('    .hero-notes li { padding-left: 0.1rem; }')
  [void]$Builder.AppendLine('    .crumbs, .meta { color: var(--muted); font-size: 0.92rem; }')
  [void]$Builder.AppendLine('    .license-notice { margin-top: 12px; border: 1px solid var(--line); background: rgba(147,167,209,0.07); padding: 10px 12px; color: var(--muted); font-size: 0.92rem; line-height: 1.55; }')
  [void]$Builder.AppendLine('    .license-notice strong { color: var(--text); font-weight: 400; }')
  [void]$Builder.AppendLine('    .export-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .export-button { border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--accent); padding: 5px 9px; text-decoration: none; letter-spacing: 0.04em; }')
  [void]$Builder.AppendLine('    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 20px; }')
  [void]$Builder.AppendLine('    .home-section { margin-top: 26px; }')
  [void]$Builder.AppendLine('    .home-section:first-child { margin-top: 0; }')
  [void]$Builder.AppendLine('    .work-card { display: block; border: 1px solid var(--line); background: var(--panel); padding: 18px; text-decoration: none; min-height: 140px; backdrop-filter: blur(3px); }')
  [void]$Builder.AppendLine('    .work-card strong { display: block; color: var(--text); font-size: 1.2rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    .work-card .meta { display: block; margin-top: 6px; }')
  [void]$Builder.AppendLine('    .work-card .work-label, .work-label { display: inline-block; margin-top: 8px; color: var(--accent); font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; }')
  [void]$Builder.AppendLine('    .work-card.placeholder-card { opacity: 0.72; }')
  [void]$Builder.AppendLine('    .library-tools { display: grid; gap: 8px; margin-bottom: 18px; border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 14px; }')
  [void]$Builder.AppendLine('    .library-tools label { color: var(--accent); font-size: 0.86rem; letter-spacing: 0.08em; text-transform: uppercase; }')
  [void]$Builder.AppendLine('    .library-search { width: 100%; border: 1px solid var(--line-2); border-radius: 0; background: rgba(10,11,13,0.88); color: var(--text); padding: 10px 12px; font: inherit; }')
  [void]$Builder.AppendLine('    .library-search:focus { outline: 1px solid var(--accent); outline-offset: 2px; }')
  [void]$Builder.AppendLine('    .library-empty { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 14px; margin-bottom: 18px; }')
  [void]$Builder.AppendLine('    .library-stack { display: grid; gap: 14px; }')
  [void]$Builder.AppendLine('    .library-shelf, .library-subgroup { border: 1px solid var(--line); background: var(--panel); }')
  [void]$Builder.AppendLine('    .library-shelf > summary, .library-subgroup > summary { cursor: pointer; list-style: none; display: flex; gap: 14px; align-items: center; justify-content: space-between; padding: 16px 18px; color: var(--text); }')
  [void]$Builder.AppendLine('    .library-shelf > summary::-webkit-details-marker, .library-subgroup > summary::-webkit-details-marker { display: none; }')
  [void]$Builder.AppendLine('    .library-shelf > summary::before, .library-subgroup > summary::before { content: "+"; color: var(--accent); font-size: 1.1rem; line-height: 1; }')
  [void]$Builder.AppendLine('    .library-shelf[open] > summary::before, .library-subgroup[open] > summary::before { content: "-"; }')
  [void]$Builder.AppendLine('    .library-shelf-title { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }')
  [void]$Builder.AppendLine('    .library-shelf-title strong { font-size: 1.12rem; }')
  [void]$Builder.AppendLine('    .library-shelf-title span, .library-summary-meta { color: var(--muted); font-size: 0.88rem; }')
  [void]$Builder.AppendLine('    .library-summary-meta { overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .library-shelf-body { display: grid; gap: 12px; padding: 0 18px 18px 18px; }')
  [void]$Builder.AppendLine('    .library-subgroup { background: rgba(255,255,255,0.02); }')
  [void]$Builder.AppendLine('    .library-subgroup > summary { padding: 12px 14px; }')
  [void]$Builder.AppendLine('    .library-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; padding: 0 14px 14px 14px; }')
  [void]$Builder.AppendLine('    .library-grid.direct { padding: 0; }')
  [void]$Builder.AppendLine('    .library-grid .work-card { min-height: 116px; padding: 14px; }')
  [void]$Builder.AppendLine('    [hidden] { display: none !important; }')
  [void]$Builder.AppendLine('    @media (max-width: 640px) { .library-shelf > summary, .library-subgroup > summary { align-items: flex-start; } .library-summary-meta { white-space: normal; } }')
  [void]$Builder.AppendLine('    .home-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }')
  [void]$Builder.AppendLine('    .home-actions a { border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--accent); padding: 8px 11px; text-decoration: none; letter-spacing: 0.04em; }')
  [void]$Builder.AppendLine('    .reader-shell { display: grid; grid-template-columns: minmax(0, 300px) minmax(0, 1fr); gap: 22px; align-items: start; padding: 22px; min-width: 0; max-width: 100%; }')
  [void]$Builder.AppendLine('    .toc { position: sticky; top: 12px; max-height: calc(100vh - 24px); min-width: 0; overflow: auto; overflow-wrap: anywhere; border: 1px solid var(--line); background: var(--panel); padding: 14px; }')
  [void]$Builder.AppendLine('    .toc ul { list-style: none; padding: 0; margin: 0; }')
  [void]$Builder.AppendLine('    .toc li { margin: 0 0 7px; }')
  [void]$Builder.AppendLine('    .toc a { text-decoration: none; font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .toc-start, .toc-unit { display: block; color: var(--muted); font-size: 0.86rem; margin: 5px 0 7px; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .toc-start:hover, .toc-unit:hover { color: var(--accent); }')
  [void]$Builder.AppendLine('    .toc-units { display: grid; grid-template-columns: repeat(auto-fit, minmax(56px, 1fr)); gap: 2px 6px; margin-top: 5px; }')
  [void]$Builder.AppendLine('    .section-block { margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .unit { border-top: 1px solid var(--line); padding: 16px 0; min-width: 0; max-width: 100%; }')
  [void]$Builder.AppendLine('    .unit[hidden] { display: none; }')
  [void]$Builder.AppendLine('    .unit-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; min-width: 0; }')
  [void]$Builder.AppendLine('    .unit-head > div { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .unit-head h4 { overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    .unit-nav { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-top: 12px; font-size: 0.84rem; }')
  [void]$Builder.AppendLine('    .unit-nav a { color: var(--muted); text-decoration: none; border-bottom: 1px solid var(--line); }')
  [void]$Builder.AppendLine('    .unit-nav a:hover { color: var(--accent); border-color: var(--accent); }')
  [void]$Builder.AppendLine('    .anchor { flex: 0 0 auto; text-decoration: none; color: var(--accent); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .unit-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; min-width: 0; max-width: 100%; }')
  [void]$Builder.AppendLine('    .unit-grid.paired-text-grid { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); align-items: start; }')
  [void]$Builder.AppendLine('    .paired-text-column { min-width: 0; border: 1px solid var(--line); background: rgba(255,255,255,0.018); padding: 12px; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .paired-text-column.commentary-side { background: transparent; border-color: rgba(214,190,138,0.12); }')
  [void]$Builder.AppendLine('    .paired-label { color: var(--accent); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; direction: ltr; text-align: left; }')
  [void]$Builder.AppendLine('    .hebrew { color: var(--hebrew); direction: rtl; unicode-bidi: plaintext; text-align: right; font-size: 1.22rem; line-height: 1.82; min-width: 0; max-width: 100%; overflow-wrap: anywhere; word-break: normal; }')
  [void]$Builder.AppendLine('    .hebrew strong { color: #fff5df; font-weight: 700; }')
  [void]$Builder.AppendLine('    .source-small { font-size: 0.82em; color: var(--muted); }')
  [void]$Builder.AppendLine('    .placeholder { color: #8c857c; }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    .lexical-inline { direction: rtl; unicode-bidi: plaintext; text-align: right; min-width: 0; max-width: 100%; overflow-wrap: anywhere; word-break: normal; }')
    [void]$Builder.AppendLine('    .lexical-coverage strong { color: var(--text); font-weight: 400; }')
    [void]$Builder.AppendLine('    .reader-token-wrap { display: inline-grid; grid-auto-rows: min-content; justify-items: center; align-items: start; vertical-align: baseline; gap: 0.12em; margin: 0.04em 0.1em 0.16em; max-width: min(34rem, calc(100vw - 32px)); }')
    [void]$Builder.AppendLine('    .lexical-word { display: inline; max-width: 100%; margin: 0 0.08em; padding: 0.04em 0.08em; border: 1px solid transparent; border-radius: 7px; color: var(--hebrew); background: transparent; font: inherit; cursor: pointer; direction: inherit; unicode-bidi: normal; overflow-wrap: anywhere; word-break: break-word; }')
    [void]$Builder.AppendLine('    .reader-token-wrap .lexical-word { margin: 0; }')
    [void]$Builder.AppendLine('    .reader-gloss-line { display: block; direction: ltr; unicode-bidi: isolate; color: var(--muted); font-size: 0.58em; font-weight: 600; line-height: 1.22; width: max-content; max-width: min(22rem, calc(100vw - 40px)); text-align: center; white-space: normal; overflow: visible; overflow-wrap: break-word; word-break: normal; hyphens: auto; opacity: 0.88; border: 1px solid rgba(214,190,138,0.18); background: rgba(10,11,13,0.72); padding: 0.18em 0.42em 0.2em; border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }')
    [void]$Builder.AppendLine('    .lexical-word:hover, .lexical-word:focus-visible, .lexical-word[aria-pressed="true"] { border-color: var(--accent); background: rgba(214,190,138,0.1); outline: 2px solid rgba(214,190,138,0.78); outline-offset: 2px; }')
    [void]$Builder.AppendLine('    .hud-close:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }')
    [void]$Builder.AppendLine('    .hud-badge { display: inline-block; margin-left: 0.45rem; padding: 1px 6px; border: 1px solid var(--line-2); border-radius: 999px; color: var(--accent); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; vertical-align: middle; }')
    [void]$Builder.AppendLine('    .lexical-slot { margin-top: 16px; }')
    [void]$Builder.AppendLine('    .lexical-hud { position: fixed; z-index: 1000; width: calc(100vw - 24px); max-width: calc(100vw - 24px); border: 1px solid var(--line); background: var(--panel-2); padding: 18px; box-shadow: 0 18px 60px rgba(0,0,0,0.42); overflow: auto; }')
    [void]$Builder.AppendLine('    .lexical-hud[hidden] { display: none; }')
    [void]$Builder.AppendLine('    .hud-head { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 14px; margin: -18px -18px 14px; padding: 14px 18px 10px; background: linear-gradient(180deg, var(--panel-2) 78%, rgba(0,0,0,0)); }')
    [void]$Builder.AppendLine('    .hud-head h2 { margin: 0; font-size: 1.1rem; color: var(--text); }')
    [void]$Builder.AppendLine('    .hud-close { border: 1px solid var(--line-2); background: transparent; color: var(--muted); padding: 4px 8px; font: inherit; cursor: pointer; }')
    [void]$Builder.AppendLine('    .hud-close:hover { color: var(--text); border-color: var(--accent); }')
    [void]$Builder.AppendLine('    .route-hud-panel { display: grid; gap: 12px; min-width: 0; }')
    [void]$Builder.AppendLine('    .route-selected-token { border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--hebrew); padding: 12px 14px; text-align: center; font-size: clamp(2rem, 7vw, 4rem); line-height: 1.05; overflow-wrap: anywhere; }')
    [void]$Builder.AppendLine('    .route-treatment-card { border: 1px solid rgba(147,167,209,0.28); background: rgba(147,167,209,0.06); color: var(--text); padding: 7px 9px; display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; font-size: 0.86rem; }')
    [void]$Builder.AppendLine('    .route-treatment-card strong { color: var(--accent); font-weight: 400; }')
    [void]$Builder.AppendLine('    .route-treatment-line { color: var(--text); margin: 0; }')
    [void]$Builder.AppendLine('    .claim-treatment-line { color: var(--accent); font-size: 0.78rem; line-height: 1.25; margin: 0; }')
    [void]$Builder.AppendLine('    .route-section-card, .route-audit-card, .route-source-card { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 10px; min-width: 0; }')
    [void]$Builder.AppendLine('    .route-answer-card { border-color: var(--line-2); background: linear-gradient(145deg, rgba(214,190,138,0.15), rgba(255,255,255,0.025)); }')
    [void]$Builder.AppendLine('    .route-section-title { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; flex-wrap: wrap; margin-bottom: 8px; }')
    [void]$Builder.AppendLine('    .route-section-title h3 { margin: 0; color: var(--text); font-size: 1rem; font-weight: 400; }')
    [void]$Builder.AppendLine('    .route-section-title span { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; }')
    [void]$Builder.AppendLine('    .claim-row-list { display: grid; gap: 8px; }')
    [void]$Builder.AppendLine('    .claim-row { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 7px; display: grid; gap: 4px; min-width: 0; overflow-wrap: anywhere; }')
    [void]$Builder.AppendLine('    .route-answer-card .claim-row { border-color: var(--line-2); background: transparent; }')
    [void]$Builder.AppendLine('    .claim-row-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }')
    [void]$Builder.AppendLine('    .claim-status { border: 1px solid var(--line-2); border-radius: 999px; color: var(--accent); padding: 1px 6px; font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase; }')
    [void]$Builder.AppendLine('    .claim-hebrew { color: var(--hebrew); font-size: 1rem; }')
    [void]$Builder.AppendLine('    .claim-renderings { color: var(--text); margin: 0; font-size: 0.86rem; line-height: 1.28; }')
    [void]$Builder.AppendLine('    .route-meta, .rank-details, .morphology-details { color: var(--muted); font-size: 0.76rem; }')
    [void]$Builder.AppendLine('    .usage-evidence-details { display: grid; gap: 4px; color: var(--muted); font-size: 0.82rem; line-height: 1.3; }')
    [void]$Builder.AppendLine('    .usage-evidence-details p { margin: 0; }')
    [void]$Builder.AppendLine('    .usage-evidence-details strong { color: var(--accent); font-weight: 400; }')
    [void]$Builder.AppendLine('    .rank-details, .morphology-details { margin-top: 4px; padding: 7px 9px; background: rgba(255,255,255,0.018); }')
    [void]$Builder.AppendLine('    .phrase-line { color: var(--hebrew); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 8px 0; margin: 6px 0; font-size: 1.16rem; text-align: right; }')
    [void]$Builder.AppendLine('    .phrase-focus { color: var(--accent); border-bottom: 1px solid var(--accent); }')
    [void]$Builder.AppendLine('    .phrase-context { color: var(--hebrew); opacity: 0.72; }')
    [void]$Builder.AppendLine('    .hud-card-lane { display: grid; grid-template-columns: repeat(auto-fit, minmax(138px, 1fr)); gap: 7px; }')
    [void]$Builder.AppendLine('    .hud-card-lane .claim-row { min-height: 100%; }')
    [void]$Builder.AppendLine('    .source-footnotes { margin-top: 14px; font-size: 0.72rem; color: var(--muted); }')
    [void]$Builder.AppendLine('    .source-footnote-row { margin: 4px 0; line-height: 1.28; }')
  }
  [void]$Builder.AppendLine('    .source-citation { overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    .source-note-index { color: var(--accent); font-size: 0.64rem; margin-left: 3px; vertical-align: super; }')
  [void]$Builder.AppendLine('    .source-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 24px; color: var(--muted); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .source-table th, .source-table td { border-top: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    details { border: 1px solid var(--line); background: var(--panel); padding: 10px 12px; }')
  [void]$Builder.AppendLine('    summary { cursor: pointer; color: var(--accent); }')
  [void]$Builder.AppendLine('    .toc details { border: 0; background: transparent; padding: 0; margin: 0 0 8px; }')
  [void]$Builder.AppendLine('    .toc details details { border-left: 1px solid var(--line); padding-left: 10px; margin-left: 4px; }')
  [void]$Builder.AppendLine('    .toc summary { color: var(--accent); font-size: 0.94rem; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .fallback-note { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--text); }')
  [void]$Builder.AppendLine('    .paired-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin-top: 14px; }')
  [void]$Builder.AppendLine('    .paired-panel { border: 1px solid var(--line-2); background: rgba(214,190,138,0.05); padding: 12px 14px; min-width: 0; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .paired-panel h2 { margin: 0 0 8px; color: var(--accent); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }')
  [void]$Builder.AppendLine('    .paired-panel p { margin: 6px 0 0; }')
  [void]$Builder.AppendLine('    .paired-panel a { color: var(--accent); }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .unit-grid.paired-text-grid, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  } else {
  [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .unit-grid.paired-text-grid, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  }
  [void]$Builder.AppendLine('  </style>')
  if ($ReaderWorkbenchCssHref) {
    [void]$Builder.AppendLine("  <link rel=""stylesheet"" href=""$(Encode-Html $ReaderWorkbenchCssHref)"">")
  }
  [void]$Builder.AppendLine('</head>')
  [void]$Builder.AppendLine('<body>')
}

function Append-LexicalHudScript {
  param([System.Text.StringBuilder]$Builder)

  $geresh = [char]0x05F3
  $gershayim = [char]0x05F4
  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    (async () => {')
  [void]$Builder.AppendLine('      const tokenIndexNode = document.querySelector("[data-lexical-token-index]");')
  [void]$Builder.AppendLine('      const lexiconNode = document.querySelector("[data-lexical-lexicon]");')
  [void]$Builder.AppendLine('      const configNode = document.querySelector("[data-lexical-config]");')
  [void]$Builder.AppendLine('      const tokenIndex = tokenIndexNode ? JSON.parse(tokenIndexNode.textContent) : { forms: [] };')
  [void]$Builder.AppendLine('      const lexicon = lexiconNode ? JSON.parse(lexiconNode.textContent) : { entries: [] };')
  [void]$Builder.AppendLine('      const lexicalConfig = configNode ? JSON.parse(configNode.textContent) : {};')
  [void]$Builder.AppendLine('      const occurrenceNode = document.querySelector("[data-lexical-occurrences]");')
  [void]$Builder.AppendLine('      let occurrences = occurrenceNode && occurrenceNode.textContent.trim() ? JSON.parse(occurrenceNode.textContent) : { units: {} };')
  [void]$Builder.AppendLine('      const tokenRows = new Map((tokenIndex.forms || []).map((row) => [row.token_index_id, row]));')
  [void]$Builder.AppendLine('      const lexiconEntries = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));')
  [void]$Builder.AppendLine('      const chunkPromises = new Map();')
  [void]$Builder.AppendLine('      const routeShardPromises = new Map();')
  [void]$Builder.AppendLine('      const sourceRows = new Map();')
  [void]$Builder.AppendLine('      let manifestPromise = null;')
  [void]$Builder.AppendLine('      let routeManifestPromise = null;')
  [void]$Builder.AppendLine('      const hud = document.querySelector("[data-lexical-hud]");')
  [void]$Builder.AppendLine('      if (!hud) return;')
  [void]$Builder.AppendLine('      const waitForIdle = () => new Promise((resolve) => {')
  [void]$Builder.AppendLine('        if ("requestIdleCallback" in window) window.requestIdleCallback(resolve, { timeout: 250 });')
  [void]$Builder.AppendLine('        else window.requestAnimationFrame(() => window.setTimeout(resolve, 0));')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      const toAbsoluteUrl = (url, base = document.baseURI) => new URL(url, base).toString();')
  [void]$Builder.AppendLine('      const lexicalRootUrl = () => toAbsoluteUrl(lexicalConfig.root_href || "./");')
  [void]$Builder.AppendLine('      const localSourceUrlMap = {')
  [void]$Builder.AppendLine('        "local:project-zohar-ari-technical-term-table": "data/lexical/source-layers/project-zohar-ari-technical-terms.json",')
  [void]$Builder.AppendLine('        "local:project-abbreviation-table": "data/lexical/source-layers/project-abbreviations.json",')
  [void]$Builder.AppendLine('        "local:project-aramaic-grammar-table": "data/lexical/source-layers/project-aramaic-grammar.json",')
  [void]$Builder.AppendLine('        "local:project-function-word-table": "data/lexical/source-layers/project-function-words.json",')
  [void]$Builder.AppendLine('        "local:project-midrash-formula-table": "data/lexical/source-layers/project-midrash-formulas.json",')
  [void]$Builder.AppendLine('        "local:grammar-rules": "data/lexical/source-layers/project-overrides.json",')
  [void]$Builder.AppendLine('        "local:fixed-expression-rules": "data/lexical/source-layers/project-overrides.json"')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const resolveSourceUrl = (url) => {')
  [void]$Builder.AppendLine('        const raw = String(url || "").trim();')
  [void]$Builder.AppendLine('        if (!raw) return "";')
  [void]$Builder.AppendLine('        if (/^(https?:|mailto:)/i.test(raw)) return raw;')
  [void]$Builder.AppendLine('        const mapped = localSourceUrlMap[raw];')
  [void]$Builder.AppendLine('        if (mapped) return toAbsoluteUrl(mapped, lexicalRootUrl());')
  [void]$Builder.AppendLine('        if (/^(?:\.{0,2}\/|data\/)/.test(raw)) return toAbsoluteUrl(raw, lexicalRootUrl());')
  [void]$Builder.AppendLine('        return "";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const fetchJson = async (url, base = document.baseURI) => {')
  [void]$Builder.AppendLine('        const response = await fetch(toAbsoluteUrl(url, base));')
  [void]$Builder.AppendLine('        if (!response.ok) throw new Error(`Unable to load lexical payload: ${response.status} ${url}`);')
  [void]$Builder.AppendLine('        return response.json();')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadOccurrences = async () => {')
  [void]$Builder.AppendLine('        if (occurrences.units && Object.keys(occurrences.units).length) return occurrences;')
  [void]$Builder.AppendLine('        const occurrenceUrl = lexicalConfig.occurrence_url || (occurrenceNode && occurrenceNode.dataset ? occurrenceNode.dataset.src : "");')
  [void]$Builder.AppendLine('        if (occurrenceUrl) occurrences = await fetchJson(occurrenceUrl);')
  [void]$Builder.AppendLine('        return occurrences;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadManifest = async () => {')
  [void]$Builder.AppendLine('        if (!lexicalConfig.manifest_url) return null;')
  [void]$Builder.AppendLine('        if (!manifestPromise) manifestPromise = fetchJson(lexicalConfig.manifest_url);')
  [void]$Builder.AppendLine('        return manifestPromise;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const routeLookupManifestUrl = () => toAbsoluteUrl(lexicalConfig.hud_route_lookup_manifest_url || "data/definitions/hud-route-lookup/manifest.json", lexicalRootUrl());')
  [void]$Builder.AppendLine('      const loadRouteManifest = async () => {')
  [void]$Builder.AppendLine('        if (!routeManifestPromise) routeManifestPromise = fetchJson(routeLookupManifestUrl());')
  [void]$Builder.AppendLine('        return routeManifestPromise;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const resolveSourceRows = (ids, inlineRows) => {')
  [void]$Builder.AppendLine('        if (Array.isArray(inlineRows) && inlineRows.length && typeof inlineRows[0] === "object") return inlineRows;')
  [void]$Builder.AppendLine('        return (Array.isArray(ids) ? ids : []).map((id) => sourceRows.get(id)).filter(Boolean);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const cacheChunk = (chunk) => {')
  [void]$Builder.AppendLine('        Object.entries(chunk.source_rows || {}).forEach(([id, row]) => sourceRows.set(id, row));')
  [void]$Builder.AppendLine('        ((chunk.token_index && chunk.token_index.forms) || []).forEach((row) => tokenRows.set(row.token_index_id, row));')
  [void]$Builder.AppendLine('        ((chunk.lexicon && chunk.lexicon.entries) || []).forEach((entry) => {')
  [void]$Builder.AppendLine('          lexiconEntries.set(entry.entry_id, {')
  [void]$Builder.AppendLine('            ...entry,')
  [void]$Builder.AppendLine('            source_rows: resolveSourceRows(entry.source_row_ids, entry.source_rows),')
  [void]$Builder.AppendLine('            secondary_source_rows: resolveSourceRows(entry.secondary_source_row_ids, entry.secondary_source_rows)')
  [void]$Builder.AppendLine('          });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        return chunk;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadChunk = async (chunkId) => {')
  [void]$Builder.AppendLine('        if (!chunkId) return null;')
  [void]$Builder.AppendLine('        if (!chunkPromises.has(chunkId)) {')
  [void]$Builder.AppendLine('          chunkPromises.set(chunkId, (async () => {')
  [void]$Builder.AppendLine('            const manifest = await loadManifest();')
  [void]$Builder.AppendLine('            if (!manifest) return null;')
  [void]$Builder.AppendLine('            const chunkInfo = (manifest.chunks || []).find((chunk) => chunk.chunk_id === chunkId);')
  [void]$Builder.AppendLine('            if (!chunkInfo) throw new Error(`Lexical chunk not found in manifest: ${chunkId}`);')
  [void]$Builder.AppendLine('            const manifestUrl = toAbsoluteUrl(lexicalConfig.manifest_url);')
  [void]$Builder.AppendLine('            return cacheChunk(await fetchJson(chunkInfo.url, manifestUrl));')
  [void]$Builder.AppendLine('          })());')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        return chunkPromises.get(chunkId);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadTokenRow = async (tokenIndexId) => {')
  [void]$Builder.AppendLine('        if (!tokenIndexId) return {};')
  [void]$Builder.AppendLine('        if (tokenRows.has(tokenIndexId)) return tokenRows.get(tokenIndexId);')
  [void]$Builder.AppendLine('        const manifest = await loadManifest();')
  [void]$Builder.AppendLine('        const chunkId = manifest && manifest.token_chunks ? manifest.token_chunks[tokenIndexId] : "";')
  [void]$Builder.AppendLine('        if (chunkId) await loadChunk(chunkId);')
  [void]$Builder.AppendLine('        return tokenRows.get(tokenIndexId) || {};')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const codepointKey = (value, prefixLength) => {')
  [void]$Builder.AppendLine('        const chars = [...String(value || "")].slice(0, prefixLength);')
  [void]$Builder.AppendLine('        if (!chars.length) return "empty";')
  [void]$Builder.AppendLine('        const first = chars[0].codePointAt(0);')
  [void]$Builder.AppendLine('        if (first < 0x05d0 || first > 0x05ea) return "other";')
  [void]$Builder.AppendLine('        return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, "0")).join("-");')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadRouteCards = async (normalized) => {')
  [void]$Builder.AppendLine('        if (!normalized) return [];')
  [void]$Builder.AppendLine('        const manifest = await loadRouteManifest();')
  [void]$Builder.AppendLine('        const shardKey = codepointKey(normalized, Number(manifest.prefix_length || 2));')
  [void]$Builder.AppendLine('        const shardInfo = (manifest.shards || []).find((shard) => shard.shard === shardKey);')
  [void]$Builder.AppendLine('        if (!shardInfo || !shardInfo.path) return [];')
  [void]$Builder.AppendLine('        if (!routeShardPromises.has(shardKey)) {')
  [void]$Builder.AppendLine('          routeShardPromises.set(shardKey, fetchJson(shardInfo.path, routeLookupManifestUrl()));')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        const shard = await routeShardPromises.get(shardKey);')
  [void]$Builder.AppendLine('        return (((shard || {}).routes_by_normalized || {})[normalized] || []).slice();')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const addLookupCandidate = (map, key, relation, penalty = 0) => {')
  [void]$Builder.AppendLine('        const normalized = normalizeHebrewKey(key);')
  [void]$Builder.AppendLine('        if (!normalized || map.has(normalized)) return;')
  [void]$Builder.AppendLine('        map.set(normalized, { key: normalized, relation, penalty });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const lookupCandidatesFor = (clickedForm, normalized) => {')
  [void]$Builder.AppendLine('        const candidates = new Map();')
  [void]$Builder.AppendLine('        addLookupCandidate(candidates, normalized || clickedForm, "exact", 0);')
  [void]$Builder.AppendLine('        const primary = normalizeHebrewKey(normalized || clickedForm);')
  [void]$Builder.AppendLine('        String(primary || "").split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, "maqaf component", 12));')
  [void]$Builder.AppendLine('        const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/;')
  [void]$Builder.AppendLine('        for (let pass = 0; pass < 3; pass += 1) {')
  [void]$Builder.AppendLine('          [...candidates.values()].slice().forEach((candidate) => {')
  [void]$Builder.AppendLine('            if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), "prefix-stripped candidate", 20 + pass * 4);')
  [void]$Builder.AppendLine('          });')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        [...candidates.values()].slice().forEach((candidate) => {')
  [void]$Builder.AppendLine('          if (!candidate.key.endsWith("\u05D9\u05DE")) return;')
  [void]$Builder.AppendLine('          const stem = candidate.key.slice(0, -2);')
  [void]$Builder.AppendLine('          if (stem.endsWith("\u05D4") && stem.length >= 3) addLookupCandidate(candidates, `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE`, "mater-expanded plural candidate", 14);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        const suffixRules = [')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05DE", relation: "plural-suffix candidate", penalty: 18 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D5\u05EA", relation: "plural-suffix candidate", penalty: 18 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05D4", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05D5", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05DB", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05DB\u05DE", relation: "possessive-suffix candidate", penalty: 28 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9\u05DB\u05E0", relation: "possessive-suffix candidate", penalty: 28 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D4\u05DE", relation: "possessive-suffix candidate", penalty: 28 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D4\u05E0", relation: "possessive-suffix candidate", penalty: 28 },')
  [void]$Builder.AppendLine('          { suffix: "\u05E0\u05D5", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05DB", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D5", relation: "possessive-suffix candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D4", relation: "suffix-stripped candidate", penalty: 24 },')
  [void]$Builder.AppendLine('          { suffix: "\u05D9", relation: "suffix-stripped candidate", penalty: 24 }')
  [void]$Builder.AppendLine('        ];')
  [void]$Builder.AppendLine('        [...candidates.values()].slice().forEach((candidate) => {')
  [void]$Builder.AppendLine('          suffixRules.forEach((rule) => {')
  [void]$Builder.AppendLine('            if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);')
  [void]$Builder.AppendLine('          });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        return [...candidates.values()];')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadRouteCardsForToken = async (clickedForm, normalized) => {')
  [void]$Builder.AppendLine('        const candidates = lookupCandidatesFor(clickedForm, normalized);')
  [void]$Builder.AppendLine('        const rows = [];')
  [void]$Builder.AppendLine('        for (const candidate of candidates) {')
  [void]$Builder.AppendLine('          const cards = await loadRouteCards(candidate.key);')
  [void]$Builder.AppendLine('          cards.forEach((card) => rows.push({ ...card, lookup_key: candidate.key, lookup_relation: candidate.relation, lookup_penalty: candidate.penalty }));')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        const seen = new Set();')
  [void]$Builder.AppendLine('        return { candidates, cards: rows.filter((card) => { const key = `${card.card_id || ""}|${card.lookup_key || ""}`; if (seen.has(key)) return false; seen.add(key); return true; }) };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine("      const normalizeHebrewDisplay = (value) => typeof value === ""string"" ? value.replace(/([\u0590-\u05FF])'/g, ""`$1$geresh"").replace(/([\u0590-\u05FF])\""(?=[\u0590-\u05FF])/g, ""`$1$gershayim"") : value;")
  [void]$Builder.AppendLine('      const hebrewTokenPattern = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4\x27\x22\u05BE-]*/gu;')
  [void]$Builder.AppendLine('      const tokenSplitPrefixKeys = new Set(["\u05D5", "\u05D1", "\u05DB", "\u05DC", "\u05DE", "\u05D4", "\u05E9"]);')
  [void]$Builder.AppendLine('      const tokenRowKey = (row) => normalizeHebrewKey((row && (row.surface_word || row.hebrew_word || row.normalized_word)) || "");')
  [void]$Builder.AppendLine('      const tokenAlignmentKey = (value) => normalizeHebrewKey(value).replace(/[\u05BE-]/g, "");')
  [void]$Builder.AppendLine('      const pickPrimaryTokenId = (consumed) => {')
  [void]$Builder.AppendLine('        const primary = consumed.find((item) => !tokenSplitPrefixKeys.has(tokenRowKey(item.row))) || consumed[0];')
  [void]$Builder.AppendLine('        return primary ? primary.id || "" : "";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const consumeAlignedToken = (text, tokenIds, state) => {')
  [void]$Builder.AppendLine('        if (!Array.isArray(state.tokenRows)) { const tokenIndexId = tokenIds[state.index++]; return { tokenIndexId, tokenIndexIds: tokenIndexId ? [tokenIndexId] : [] }; }')
  [void]$Builder.AppendLine('        const target = tokenAlignmentKey(text);')
  [void]$Builder.AppendLine('        let combined = "";')
  [void]$Builder.AppendLine('        const consumed = [];')
  [void]$Builder.AppendLine('        for (let offset = 0; state.index + offset < tokenIds.length && offset < 6; offset += 1) {')
  [void]$Builder.AppendLine('          const id = tokenIds[state.index + offset];')
  [void]$Builder.AppendLine('          const row = state.tokenRows[state.index + offset] || {};')
  [void]$Builder.AppendLine('          const key = tokenAlignmentKey((row && (row.surface_word || row.hebrew_word || row.normalized_word)) || "");')
  [void]$Builder.AppendLine('          if (!key) break;')
  [void]$Builder.AppendLine('          combined += key;')
  [void]$Builder.AppendLine('          consumed.push({ id, row });')
  [void]$Builder.AppendLine('          if (combined === target) { state.index += consumed.length; return { tokenIndexId: pickPrimaryTokenId(consumed), tokenIndexIds: consumed.map((item) => item.id).filter(Boolean) }; }')
  [void]$Builder.AppendLine('          if (!target.startsWith(combined)) break;')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        const tokenIndexId = tokenIds[state.index++];')
  [void]$Builder.AppendLine('        return { tokenIndexId, tokenIndexIds: tokenIndexId ? [tokenIndexId] : [] };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const makeWordSpan = (text, tokenIndexId, ordinal, tokenIndexIds = []) => {')
  [void]$Builder.AppendLine('        const wrap = document.createElement("span");')
  [void]$Builder.AppendLine('        wrap.className = "reader-token-wrap";')
  [void]$Builder.AppendLine('        const span = document.createElement("span");')
  [void]$Builder.AppendLine('        span.className = "lexical-word";')
  [void]$Builder.AppendLine('        span.lang = "he";')
  [void]$Builder.AppendLine('        span.role = "button";')
  [void]$Builder.AppendLine('        span.tabIndex = 0;')
  [void]$Builder.AppendLine('        span.dataset.lexicalToken = `${tokenIndexId}-${ordinal}`;')
  [void]$Builder.AppendLine('        span.dataset.lexicalIndex = tokenIndexId || "";')
  [void]$Builder.AppendLine('        span.dataset.lexicalSurface = text || "";')
  [void]$Builder.AppendLine('        span.dataset.lexicalEntry = "";')
  [void]$Builder.AppendLine('        span.dataset.lexicalStatus = "pending";')
  [void]$Builder.AppendLine('        span.dataset.lexicalTokenIds = tokenIndexIds.length ? tokenIndexIds.join(" ") : (tokenIndexId || "");')
  [void]$Builder.AppendLine('        span.setAttribute("aria-haspopup", "dialog");')
  [void]$Builder.AppendLine('        span.setAttribute("aria-controls", "route-hud-panel");')
  [void]$Builder.AppendLine('        span.setAttribute("aria-expanded", "false");')
  [void]$Builder.AppendLine('        span.setAttribute("aria-pressed", "false");')
  [void]$Builder.AppendLine('        span.textContent = normalizeHebrewDisplay(text);')
  [void]$Builder.AppendLine('        const glossLine = document.createElement("span");')
  [void]$Builder.AppendLine('        glossLine.className = "reader-gloss-line";')
  [void]$Builder.AppendLine('        glossLine.dataset.glossPlaceholder = "true";')
  [void]$Builder.AppendLine('        glossLine.textContent = "TBD";')
  [void]$Builder.AppendLine('        wrap.append(span, glossLine);')
  [void]$Builder.AppendLine('        return wrap;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const wrapTextNode = (node, tokenIds, state) => {')
  [void]$Builder.AppendLine('        const text = node.nodeValue;')
  [void]$Builder.AppendLine('        const matches = Array.from(text.matchAll(hebrewTokenPattern));')
  [void]$Builder.AppendLine('        if (!matches.length) return;')
  [void]$Builder.AppendLine('        const fragment = document.createDocumentFragment();')
  [void]$Builder.AppendLine('        let position = 0;')
  [void]$Builder.AppendLine('        matches.forEach((match) => {')
  [void]$Builder.AppendLine('          if (match.index > position) fragment.appendChild(document.createTextNode(text.slice(position, match.index)));')
  [void]$Builder.AppendLine('          const tokenMatch = consumeAlignedToken(match[0], tokenIds, state);')
  [void]$Builder.AppendLine('          const ordinal = ++state.ordinal;')
  [void]$Builder.AppendLine('          fragment.appendChild(tokenMatch.tokenIndexId ? makeWordSpan(match[0], tokenMatch.tokenIndexId, ordinal, tokenMatch.tokenIndexIds) : document.createTextNode(match[0]));')
  [void]$Builder.AppendLine('          position = match.index + match[0].length;')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        if (position < text.length) fragment.appendChild(document.createTextNode(text.slice(position)));')
  [void]$Builder.AppendLine('        node.parentNode.replaceChild(fragment, node);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const wrapParagraph = async (paragraph, tokenIds) => {')
  [void]$Builder.AppendLine('        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);')
  [void]$Builder.AppendLine('        const textNodes = [];')
  [void]$Builder.AppendLine('        while (walker.nextNode()) textNodes.push(walker.currentNode);')
  [void]$Builder.AppendLine('        const visibleTokenCount = textNodes.reduce((count, node) => count + Array.from(node.nodeValue.matchAll(hebrewTokenPattern)).length, 0);')
  [void]$Builder.AppendLine('        const tokenRowsForParagraph = visibleTokenCount !== tokenIds.length ? await Promise.all(tokenIds.map((tokenId) => loadTokenRow(tokenId))) : null;')
  [void]$Builder.AppendLine('        const state = { index: 0, ordinal: 0, tokenRows: tokenRowsForParagraph };')
  [void]$Builder.AppendLine('        textNodes.forEach((node) => wrapTextNode(node, tokenIds, state));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const hydrateLexicalWords = async () => {')
  [void]$Builder.AppendLine('        await waitForIdle();')
  [void]$Builder.AppendLine('        const loadedOccurrences = await loadOccurrences();')
  [void]$Builder.AppendLine('        const tasks = [];')
  [void]$Builder.AppendLine('        document.querySelectorAll("[data-lexical-unit]").forEach((unit) => {')
  [void]$Builder.AppendLine('          const unitData = loadedOccurrences.units ? loadedOccurrences.units[unit.id] : null;')
  [void]$Builder.AppendLine('          if (!unitData) return;')
  [void]$Builder.AppendLine('          const paragraphsByIndex = new Map((unitData.paragraphs || []).map((item) => [Number(item.paragraph_index), item]));')
  [void]$Builder.AppendLine('          unit.querySelectorAll("[data-lexical-paragraph]").forEach((paragraph) => {')
  [void]$Builder.AppendLine('            const paragraphData = paragraphsByIndex.get(Number(paragraph.dataset.lexicalParagraph));')
  [void]$Builder.AppendLine('            tasks.push({ paragraph, tokenIds: paragraphData ? (paragraphData.token_index_ids || []) : [] });')
  [void]$Builder.AppendLine('          });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        for (let index = 0; index < tasks.length; index += 24) {')
  [void]$Builder.AppendLine('          await Promise.all(tasks.slice(index, index + 24).map((task) => wrapParagraph(task.paragraph, task.tokenIds)));')
  [void]$Builder.AppendLine('          if (index + 24 < tasks.length) await waitForIdle();')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      hydrateLexicalWords().catch((error) => console.error(error));')
  [void]$Builder.AppendLine('      let activeHudButton = null;')
  [void]$Builder.AppendLine('      if (hud.parentElement !== document.body) document.body.appendChild(hud);')
  [void]$Builder.AppendLine('      const positionHudNearButton = (button) => {')
  [void]$Builder.AppendLine('        if (!button || hud.hidden) return;')
  [void]$Builder.AppendLine('        const margin = 12;')
  [void]$Builder.AppendLine('        const width = Math.max(320, window.innerWidth - margin * 2);')
  [void]$Builder.AppendLine('        hud.style.width = width + "px";')
  [void]$Builder.AppendLine('        const left = Math.max(margin, Math.round((window.innerWidth - width) / 2));')
  [void]$Builder.AppendLine('        const available = Math.max(260, window.innerHeight - margin * 2);')
  [void]$Builder.AppendLine('        hud.style.maxHeight = available + "px";')
  [void]$Builder.AppendLine('        const top = margin;')
  [void]$Builder.AppendLine('        hud.style.left = left + "px";')
  [void]$Builder.AppendLine('        hud.style.top = top + "px";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const scheduleHudPosition = () => {')
  [void]$Builder.AppendLine('        if (!activeHudButton || hud.hidden) return;')
  [void]$Builder.AppendLine('        window.requestAnimationFrame(() => positionHudNearButton(activeHudButton));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const cleanValues = (values) => Array.isArray(values) ? values.filter(Boolean) : (values ? [values] : []);')
  [void]$Builder.AppendLine('      const uniqueValues = (values) => [...new Set(cleanValues(values))];')
  [void]$Builder.AppendLine('      const normalizeHebrewKey = (value) => normalizeHebrewDisplay(String(value || "")).normalize("NFC").replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, "").replace(/\u05DA/g, "\u05DB").replace(/\u05DD/g, "\u05DE").replace(/\u05DF/g, "\u05E0").replace(/\u05E3/g, "\u05E4").replace(/\u05E5/g, "\u05E6");')
      [void]$Builder.AppendLine('      const sourceRowKey = (row) => `${row.source_family || ""}|${row.source_id || ""}`;')
      [void]$Builder.AppendLine('      const displayLicense = (row) => {')
      [void]$Builder.AppendLine('        const license = String(row && row.license || "").trim();')
      [void]$Builder.AppendLine('        if (String(row && row.source_family || "").toLowerCase() === "workspace" && /^N\/A\s*-\s*project/i.test(license)) return "project-authored / CC0";')
      [void]$Builder.AppendLine('        return license || "N/A";')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const firstPresentValue = (values) => cleanValues(values).map((value) => String(value || "").trim()).find(Boolean) || "";')
      [void]$Builder.AppendLine('      const usageEvidenceRouteTypes = new Set(["usage_evidence", "workbench_usage", "workbench_usage_evidence", "workbench_usage_commentary", "biblical_workbench", "biblical_workbench_usage", "source_workbench_usage", "observed_usage"]);')
      [void]$Builder.AppendLine('      const isUsageEvidenceCard = (card) => {')
      [void]$Builder.AppendLine('        if (!card) return false;')
      [void]$Builder.AppendLine('        const routeFields = [card.display_section, card.route_type, card.route_family, card.answer_role, card.meaning_quality].map((value) => String(value || "").toLowerCase().replace(/[\s-]+/g, "_")).filter(Boolean);')
      [void]$Builder.AppendLine('        return routeFields.some((value) => usageEvidenceRouteTypes.has(value)) || Boolean(card.usage_note || card.frame_label);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const routeScore = (card) => {')
      [void]$Builder.AppendLine('        const base = Number.isFinite(card.adjusted_score) ? card.adjusted_score : (Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0));')
      [void]$Builder.AppendLine('        const penalty = Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0;')
      [void]$Builder.AppendLine('        return Math.max(0, Math.round(base - penalty));')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const routeScoreBasis = (card) => {')
      [void]$Builder.AppendLine('        const parts = [];')
      [void]$Builder.AppendLine('        if (Number.isFinite(card.raw_score)) parts.push(`raw ${card.raw_score}`);')
      [void]$Builder.AppendLine('        if (Number.isFinite(card.score_handicap) && card.score_handicap) parts.push(`handicap ${card.score_handicap}`);')
      [void]$Builder.AppendLine('        if (Number.isFinite(card.adjusted_score)) parts.push(`adjusted ${card.adjusted_score}`);')
      [void]$Builder.AppendLine('        if (card.lookup_relation && card.lookup_relation !== "exact") parts.push(`${card.lookup_relation} -${card.lookup_penalty || 0}`);')
      [void]$Builder.AppendLine('        if (card.source_ref) parts.push(card.source_ref);')
      [void]$Builder.AppendLine('        return parts;')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const routeRenderings = (card) => {')
      [void]$Builder.AppendLine('        if (!card) return [];')
      [void]$Builder.AppendLine('        if (isUsageEvidenceCard(card)) return [firstPresentValue([card.linked_route_definition, card.linked_definition, card.route_definition, card.route_definition_text]) || "observed usage only"];')
      [void]$Builder.AppendLine('        const values = [];')
      [void]$Builder.AppendLine('        const genericUsage = "Usage context only; no meaning is forced by this phrase row.";')
      [void]$Builder.AppendLine('        const definition = firstPresentValue([card.definition]);')
      [void]$Builder.AppendLine('        if (definition && definition !== genericUsage) values.push(definition);')
      [void]$Builder.AppendLine('        const meaningClaim = firstPresentValue([card.meaning_claim]);')
      [void]$Builder.AppendLine('        if (meaningClaim) values.push(meaningClaim);')
      [void]$Builder.AppendLine('        return values;')
      [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const buildSourceNotes = (cards) => {')
  [void]$Builder.AppendLine('        const noteMap = new Map();')
  [void]$Builder.AppendLine('        const cardMap = new Map();')
  [void]$Builder.AppendLine('        cleanValues(cards).forEach((card) => {')
  [void]$Builder.AppendLine('          const indexes = [];')
  [void]$Builder.AppendLine('          cleanValues(card.source_rows).forEach((row) => {')
  [void]$Builder.AppendLine('            const key = sourceRowKey(row);')
  [void]$Builder.AppendLine('            if (!key || key === "|") return;')
  [void]$Builder.AppendLine('            if (!noteMap.has(key)) noteMap.set(key, { index: noteMap.size + 1, row });')
  [void]$Builder.AppendLine('            indexes.push(noteMap.get(key).index);')
  [void]$Builder.AppendLine('          });')
  [void]$Builder.AppendLine('          const uniqueIndexes = uniqueValues(indexes).slice(0, 4);')
  [void]$Builder.AppendLine('          if (uniqueIndexes.length) cardMap.set(card, uniqueIndexes);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        return { cardMap, notes: [...noteMap.values()] };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendSourceRefs = (parent, indexes) => {')
  [void]$Builder.AppendLine('        const cleanIndexes = uniqueValues(indexes);')
  [void]$Builder.AppendLine('        if (!parent || !cleanIndexes.length) return;')
  [void]$Builder.AppendLine('        const sup = document.createElement("sup");')
  [void]$Builder.AppendLine('        sup.className = "source-note-index";')
  [void]$Builder.AppendLine('        sup.textContent = cleanIndexes.join(",");')
  [void]$Builder.AppendLine('        parent.appendChild(sup);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendSourceFootnotes = (panel, notes) => {')
  [void]$Builder.AppendLine('        const cleanNotes = cleanValues(notes);')
  [void]$Builder.AppendLine('        if (!cleanNotes.length) return;')
  [void]$Builder.AppendLine('        const details = document.createElement("details");')
  [void]$Builder.AppendLine('        details.className = "source-footnotes route-source-card";')
  [void]$Builder.AppendLine('        const summary = document.createElement("summary");')
  [void]$Builder.AppendLine('        summary.textContent = `Sources and licenses (${cleanNotes.length})`;')
  [void]$Builder.AppendLine('        details.appendChild(summary);')
  [void]$Builder.AppendLine('        cleanNotes.forEach(({ index, row }) => {')
  [void]$Builder.AppendLine('          const line = document.createElement("p");')
  [void]$Builder.AppendLine('          line.className = "source-footnote-row";')
  [void]$Builder.AppendLine('          const marker = document.createElement("strong");')
  [void]$Builder.AppendLine('          marker.textContent = `${index}. `;')
  [void]$Builder.AppendLine('          line.appendChild(marker);')
  [void]$Builder.AppendLine('          const sourceHref = resolveSourceUrl(row.source_url);')
  [void]$Builder.AppendLine('          if (sourceHref) { const link = document.createElement("a"); link.href = sourceHref; link.textContent = row.source_name || "Source"; line.appendChild(link); }')
  [void]$Builder.AppendLine('          else line.append(row.source_name || "Source");')
  [void]$Builder.AppendLine('          line.append(` | ${row.source_id || "N/A"} | ${displayLicense(row)}`);')
  [void]$Builder.AppendLine('          details.appendChild(line);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        panel.appendChild(details);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const routeSectionTitles = new Map([')
  [void]$Builder.AppendLine('        ["strict_hebrew", "Strict Hebrew matches"],')
  [void]$Builder.AppendLine('        ["strict_aramaic", "Strict Aramaic matches"],')
  [void]$Builder.AppendLine('        ["morphology", "Word-part breakdown"],')
  [void]$Builder.AppendLine('        ["lemma", "Lemma matches"],')
  [void]$Builder.AppendLine('        ["subphrase_evidence", "Subphrase evidence"],')
  [void]$Builder.AppendLine('        ["biblical_paraphrase_evidence", "Biblical definition/paraphrase matches"],')
  [void]$Builder.AppendLine('        ["citable_paraphrase_evidence", "Citable definition/paraphrase matches"],')
  [void]$Builder.AppendLine('        ["usage_evidence", "Usage evidence"],')
  [void]$Builder.AppendLine('        ["phrase_evidence", "Licensed phrase uses"],')
  [void]$Builder.AppendLine('        ["audit", "Tiny checks only"]')
  [void]$Builder.AppendLine('      ]);')
  [void]$Builder.AppendLine('      const routeSectionRank = new Map([["strict_hebrew", 0], ["strict_aramaic", 1], ["morphology", 2], ["lemma", 3], ["subphrase_evidence", 4], ["biblical_paraphrase_evidence", 5], ["citable_paraphrase_evidence", 6], ["usage_evidence", 7], ["phrase_evidence", 8], ["audit", 9]]);')
  [void]$Builder.AppendLine('      const answerCandidateSections = new Set(["strict_hebrew", "strict_aramaic", "morphology", "lemma", "subphrase_evidence", "biblical_paraphrase_evidence", "citable_paraphrase_evidence"]);')
  [void]$Builder.AppendLine('      const placeholderSections = ["strict_hebrew", "strict_aramaic", "morphology", "lemma", "subphrase_evidence", "biblical_paraphrase_evidence", "citable_paraphrase_evidence", "usage_evidence", "phrase_evidence"];')
  [void]$Builder.AppendLine('      const routeSection = (card) => isUsageEvidenceCard(card) ? "usage_evidence" : (card.display_section || card.route_type || "audit");')
  [void]$Builder.AppendLine('      const rankCardParts = (card) => {')
  [void]$Builder.AppendLine('        const adjusted = Number.isFinite(card.adjusted_score) ? card.adjusted_score : routeScore(card);')
  [void]$Builder.AppendLine('        const raw = Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0);')
  [void]$Builder.AppendLine('        return [-(adjusted - (card.lookup_penalty || 0)), -raw, routeSectionRank.get(routeSection(card)) ?? 9, -(Number.isFinite(card.answer_score) ? card.answer_score : 0), String(card.card_id || "")];')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const compareRouteCards = (leftCard, rightCard) => {')
  [void]$Builder.AppendLine('        const left = rankCardParts(leftCard);')
  [void]$Builder.AppendLine('        const right = rankCardParts(rightCard);')
  [void]$Builder.AppendLine('        for (let index = 0; index < left.length; index += 1) { if (left[index] < right[index]) return -1; if (left[index] > right[index]) return 1; }')
  [void]$Builder.AppendLine('        return 0;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const answerRoleAllowsDefinition = (role) => {')
  [void]$Builder.AppendLine('        const cleanRole = String(role || "").toLowerCase().replace(/[\s-]+/g, "_");')
  [void]$Builder.AppendLine('        return ["", "answer", "definition", "reader_answer", "primary_definition"].includes(cleanRole);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const cardHasAnswerContract = (card) => Object.prototype.hasOwnProperty.call(card || {}, "answer_eligible") || Object.prototype.hasOwnProperty.call(card || {}, "answer_role");')
  [void]$Builder.AppendLine('      const cardHasDefinitionText = (card) => routeRenderings(card).some((line) => String(line || "").trim());')
  [void]$Builder.AppendLine('      const isAnswerEligibleCard = (card) => {')
  [void]$Builder.AppendLine('        if (!card || !answerCandidateSections.has(routeSection(card)) || !cardHasDefinitionText(card)) return false;')
  [void]$Builder.AppendLine('        if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;')
  [void]$Builder.AppendLine('        if (card.answer_eligible === true) return true;')
  [void]$Builder.AppendLine('        if (cardHasAnswerContract(card)) return false;')
  [void]$Builder.AppendLine('        return card.meaning_quality === "definition" && !["phrase_evidence", "subphrase_evidence"].includes(routeSection(card));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const answerTextKey = (card) => routeRenderings(card).map((line) => String(line || "").replace(/\s+/g, " ").trim().toLowerCase()).filter(Boolean).join(" | ");')
  [void]$Builder.AppendLine('      const answerAmbiguity = (primary, candidates) => {')
  [void]$Builder.AppendLine('        if (!primary) return { ambiguous: false, count: 0 };')
  [void]$Builder.AppendLine('        const topScore = routeScore(primary);')
  [void]$Builder.AppendLine('        const topRelation = primary.lookup_relation || "exact";')
  [void]$Builder.AppendLine('        const close = candidates.filter((card) => (card.lookup_relation || "exact") === topRelation && Math.abs(routeScore(card) - topScore) <= 6);')
  [void]$Builder.AppendLine('        const meanings = new Set(close.map(answerTextKey).filter(Boolean));')
  [void]$Builder.AppendLine('        return { ambiguous: meanings.size > 1, count: meanings.size };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const selectRouteAnswer = (cards) => {')
  [void]$Builder.AppendLine('        const candidates = cleanValues(cards).filter(isAnswerEligibleCard).sort(compareRouteCards);')
  [void]$Builder.AppendLine('        const exactAnswer = candidates.filter((card) => (card.lookup_relation || "exact") === "exact").sort(compareRouteCards)[0];')
  [void]$Builder.AppendLine('        const selected = exactAnswer || candidates[0] || null;')
  [void]$Builder.AppendLine('        const ambiguity = answerAmbiguity(selected, candidates);')
  [void]$Builder.AppendLine('        return { answerCard: ambiguity.ambiguous ? null : selected, answerCandidates: candidates, answerState: ambiguity.ambiguous ? "ambiguous" : (selected ? "definition" : "none"), ambiguityCount: ambiguity.count };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const displayHebrewKey = (value) => String(value || "")')
  [void]$Builder.AppendLine('        .replace(/\u05DB$/u, "\u05DA")')
  [void]$Builder.AppendLine('        .replace(/\u05DE$/u, "\u05DD")')
  [void]$Builder.AppendLine('        .replace(/\u05E0$/u, "\u05DF")')
  [void]$Builder.AppendLine('        .replace(/\u05E4$/u, "\u05E3")')
  [void]$Builder.AppendLine('        .replace(/\u05E6$/u, "\u05E5");')
  [void]$Builder.AppendLine('      const treatmentForLookup = (card) => {')
  [void]$Builder.AppendLine('        if (!card || !card.lookup_key || !card.lookup_relation || card.lookup_relation === "exact") return "";')
  [void]$Builder.AppendLine('        const key = displayHebrewKey(card.lookup_key);')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "mater-expanded plural candidate") return `Matched by plural-form treatment: also try ${key}.`;')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "plural-suffix candidate") return `Matched by plural suffix treatment: base candidate ${key}.`;')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "possessive-suffix candidate") return `Matched by possessive suffix treatment: base candidate ${key}.`;')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "suffix-stripped candidate") return `Matched by suffix-stripped treatment: base candidate ${key}.`;')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "prefix-stripped candidate") return `Matched by prefix treatment: base candidate ${key}.`;')
  [void]$Builder.AppendLine('        if (card.lookup_relation === "maqaf component") return `Matched by maqaf component: ${key}.`;')
  [void]$Builder.AppendLine('        return `Matched by ${card.lookup_relation}: ${key}.`;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const lookupTreatmentLabel = (relation) => {')
  [void]$Builder.AppendLine('        if (relation === "mater-expanded plural candidate") return "plural form";')
  [void]$Builder.AppendLine('        if (relation === "plural-suffix candidate") return "plural suffix";')
  [void]$Builder.AppendLine('        if (relation === "possessive-suffix candidate") return "possessive suffix";')
  [void]$Builder.AppendLine('        if (relation === "suffix-stripped candidate") return "suffix stripped";')
  [void]$Builder.AppendLine('        if (relation === "prefix-stripped candidate") return "prefix stripped";')
  [void]$Builder.AppendLine('        if (relation === "maqaf component") return "maqaf component";')
  [void]$Builder.AppendLine('        return relation || "lookup";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const lookupCandidateTreatments = (lookupCandidates) => {')
  [void]$Builder.AppendLine('        const rows = [];')
  [void]$Builder.AppendLine('        const seen = new Set();')
  [void]$Builder.AppendLine('        cleanValues(lookupCandidates).forEach((candidate) => {')
  [void]$Builder.AppendLine('          if (!candidate || !candidate.key || !candidate.relation || candidate.relation === "exact") return;')
  [void]$Builder.AppendLine('          const key = `${candidate.relation}|${candidate.key}`;')
  [void]$Builder.AppendLine('          if (seen.has(key)) return;')
  [void]$Builder.AppendLine('          seen.add(key);')
  [void]$Builder.AppendLine('          rows.push({ text: `${lookupTreatmentLabel(candidate.relation)}: also check ${displayHebrewKey(candidate.key)}`, note: `generated lookup candidate${candidate.penalty ? `; rank penalty ${candidate.penalty}` : ""}, not final definition` });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        return rows;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const tokenShapeNotes = (clickedForm, normalized) => {')
  [void]$Builder.AppendLine('        const key = normalizeHebrewKey(normalized || clickedForm);')
  [void]$Builder.AppendLine('        const notes = [];')
  [void]$Builder.AppendLine('        if (key.endsWith("\u05D9\u05DE") && key.length > 3) {')
  [void]$Builder.AppendLine('          const stem = key.slice(0, -2);')
  [void]$Builder.AppendLine('          const expanded = stem.endsWith("\u05D4") ? `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE` : "";')
  [void]$Builder.AppendLine('          notes.push({ text: `${displayHebrewKey(stem)} + -\u05D9\u05DD = plural form candidate${expanded ? `; also try ${displayHebrewKey(expanded)}` : ""}`, note: "proposed morphology, not final definition" });')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        if (key.endsWith("\u05D5\u05EA") && key.length > 3) notes.push({ text: `${displayHebrewKey(key.slice(0, -2))} + -\u05D5\u05EA = plural form candidate`, note: "proposed morphology, not final definition" });')
  [void]$Builder.AppendLine('        return notes;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const formTreatmentRows = (cards) => cleanValues(cards)')
  [void]$Builder.AppendLine('        .filter((card) => /(?:plural|singular|dual|construct|defective spelling|form of|suffix|prefix)/i.test(`${card.definition || ""} ${card.meaning_claim || ""} ${card.match_type || ""}`))')
  [void]$Builder.AppendLine('        .sort(compareRouteCards)')
  [void]$Builder.AppendLine('        .slice(0, 4);')
  [void]$Builder.AppendLine('      const appendTokenTreatmentCard = (panel, clickedForm, normalized, cards, lookupCandidates) => {')
  [void]$Builder.AppendLine('        const notes = tokenShapeNotes(clickedForm, normalized);')
  [void]$Builder.AppendLine('        const generatedRows = lookupCandidateTreatments(lookupCandidates);')
  [void]$Builder.AppendLine('        const treatmentRows = formTreatmentRows(cards);')
  [void]$Builder.AppendLine('        if (!notes.length && !generatedRows.length && !treatmentRows.length) return;')
  [void]$Builder.AppendLine('        const section = document.createElement("section");')
  [void]$Builder.AppendLine('        section.className = "route-treatment-card";')
  [void]$Builder.AppendLine('        const title = document.createElement("strong");')
  [void]$Builder.AppendLine('        title.textContent = "Form treatment";')
  [void]$Builder.AppendLine('        section.appendChild(title);')
  [void]$Builder.AppendLine('        [...notes, ...generatedRows].forEach((item) => { const line = document.createElement("p"); line.className = "route-treatment-line"; line.textContent = `${item.text} - ${item.note}`; section.appendChild(line); });')
  [void]$Builder.AppendLine('        treatmentRows.forEach((card) => { const rendering = routeRenderings(card)[0]; if (!rendering) return; const line = document.createElement("p"); line.className = "route-treatment-line"; line.textContent = rendering; section.appendChild(line); });')
  [void]$Builder.AppendLine('        panel.appendChild(section);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendPhraseLine = (card, parent) => {')
  [void]$Builder.AppendLine('        const tokens = cleanValues(card.phrase_tokens);')
  [void]$Builder.AppendLine('        const phraseText = firstPresentValue([card.phrase_hebrew, card.phrase_text_hebrew, card.phrase]);')
  [void]$Builder.AppendLine('        if (!tokens.length && !phraseText) return;')
  [void]$Builder.AppendLine('        const phrase = document.createElement("p");')
  [void]$Builder.AppendLine('        phrase.className = "phrase-line";')
  [void]$Builder.AppendLine('        phrase.lang = "he";')
  [void]$Builder.AppendLine('        phrase.dir = "rtl";')
  [void]$Builder.AppendLine('        if (!tokens.length) { phrase.textContent = normalizeHebrewDisplay(phraseText); parent.appendChild(phrase); return; }')
  [void]$Builder.AppendLine('        tokens.forEach((token, index) => {')
  [void]$Builder.AppendLine('          if (index) phrase.append(" ");')
  [void]$Builder.AppendLine('          const span = document.createElement("span");')
  [void]$Builder.AppendLine('          span.className = token.role === "focus-token" || token.role === "focus-part" ? "phrase-focus" : "phrase-context";')
  [void]$Builder.AppendLine('          span.textContent = normalizeHebrewDisplay(token.surface || "");')
  [void]$Builder.AppendLine('          phrase.appendChild(span);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        parent.appendChild(phrase);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendUsageEvidenceDetails = (card, parent) => {')
  [void]$Builder.AppendLine('        if (!isUsageEvidenceCard(card)) return;')
  [void]$Builder.AppendLine('        const scoreParts = [];')
  [void]$Builder.AppendLine('        if (Number.isFinite(card.raw_score)) scoreParts.push(`raw ${card.raw_score}`);')
  [void]$Builder.AppendLine('        if (Number.isFinite(card.score_handicap) && card.score_handicap) scoreParts.push(`handicap ${card.score_handicap}`);')
  [void]$Builder.AppendLine('        if (Number.isFinite(card.adjusted_score)) scoreParts.push(`adjusted ${card.adjusted_score}`);')
  [void]$Builder.AppendLine('        if (Number.isFinite(card.confidence_percent)) scoreParts.push(`confidence ${card.confidence_percent}%`);')
  [void]$Builder.AppendLine('        if (!scoreParts.length) scoreParts.push(`${routeScore(card)}%`);')
  [void]$Builder.AppendLine('        const rows = [')
  [void]$Builder.AppendLine('          ["Usage", card.usage_note],')
  [void]$Builder.AppendLine('          ["Frame", card.frame_label],')
  [void]$Builder.AppendLine('          ["Status", firstPresentValue([card.status, card.candidate_status, card.claim_status, card.display_status, card.confidence_band, card.answer_role])],')
  [void]$Builder.AppendLine('          ["Score", scoreParts.join(" / ")],')
  [void]$Builder.AppendLine('          ["Source", firstPresentValue([card.source_ref, card.ref, card.occurrence_ref])]')
  [void]$Builder.AppendLine('        ].filter((row) => firstPresentValue([row[1]]));')
  [void]$Builder.AppendLine('        if (!rows.length) return;')
  [void]$Builder.AppendLine('        const box = document.createElement("div");')
  [void]$Builder.AppendLine('        box.className = "usage-evidence-details";')
  [void]$Builder.AppendLine('        rows.forEach(([labelText, value]) => { const line = document.createElement("p"); const label = document.createElement("strong"); label.textContent = `${labelText}: `; line.append(label, normalizeHebrewDisplay(String(value || ""))); box.appendChild(line); });')
  [void]$Builder.AppendLine('        parent.appendChild(box);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const compactRelationLabel = (card) => {')
  [void]$Builder.AppendLine('        const relation = card && card.lookup_relation && card.lookup_relation !== "exact" ? String(card.lookup_relation).replace(/ candidate$/i, "") : "direct";')
  [void]$Builder.AppendLine('        return relation.replace(/-/g, " ");')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendRouteCard = (parent, card, role = "evidence", order = 0, sourceIndexes = []) => {')
  [void]$Builder.AppendLine('        const article = document.createElement("article");')
  [void]$Builder.AppendLine('        article.className = `claim-row route-card ${role === "answer" ? "route-answer-card" : ""}`;')
  [void]$Builder.AppendLine('        const cardHebrew = normalizeHebrewDisplay(card.hebrew || card.surface || "");')
  [void]$Builder.AppendLine('        article.dataset.routeHebrew = cardHebrew;')
  [void]$Builder.AppendLine('        if (role !== "answer") {')
  [void]$Builder.AppendLine('          const head = document.createElement("div");')
  [void]$Builder.AppendLine('          head.className = "claim-row-head";')
  [void]$Builder.AppendLine('          const badge = document.createElement("span");')
  [void]$Builder.AppendLine('          badge.className = "claim-status";')
  [void]$Builder.AppendLine('          badge.textContent = order ? `#${order}` : "route";')
  [void]$Builder.AppendLine('          const hebrew = document.createElement("strong");')
  [void]$Builder.AppendLine('          hebrew.className = "claim-hebrew";')
  [void]$Builder.AppendLine('          hebrew.lang = "he";')
  [void]$Builder.AppendLine('          hebrew.dir = "rtl";')
  [void]$Builder.AppendLine('          hebrew.textContent = cardHebrew;')
  [void]$Builder.AppendLine('          head.append(badge, hebrew);')
  [void]$Builder.AppendLine('          article.appendChild(head);')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        const renderings = routeRenderings(card);')
  [void]$Builder.AppendLine('        if (renderings.length) renderings.forEach((line, index) => { const p = document.createElement("p"); p.className = "claim-renderings"; p.textContent = normalizeHebrewDisplay(line); if (index === 0) appendSourceRefs(p, sourceIndexes); article.appendChild(p); });')
  [void]$Builder.AppendLine('        else { article.dataset.evidenceOnly = "true"; }')
  [void]$Builder.AppendLine('        const meta = document.createElement("p");')
  [void]$Builder.AppendLine('        meta.className = "route-meta";')
  [void]$Builder.AppendLine('        meta.textContent = [routeSectionTitles.get(routeSection(card)) || routeSection(card), `${routeScore(card)}%`, compactRelationLabel(card)].filter(Boolean).join(" | ");')
  [void]$Builder.AppendLine('        article.dataset.routeMeta = meta.textContent;')
  [void]$Builder.AppendLine('        if (role !== "answer") article.appendChild(meta);')
  [void]$Builder.AppendLine('        const treatment = treatmentForLookup(card);')
  [void]$Builder.AppendLine('        if (treatment) { const p = document.createElement("p"); p.className = "claim-treatment-line"; p.textContent = treatment; article.appendChild(p); }')
  [void]$Builder.AppendLine('        appendPhraseLine(card, article);')
  [void]$Builder.AppendLine('        appendUsageEvidenceDetails(card, article);')
  [void]$Builder.AppendLine('        article.dataset.rankBasis = routeScoreBasis(card).join(" / ") || "No rank fields on this card.";')
  [void]$Builder.AppendLine('        parent.appendChild(article);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendRouteSection = (panel, sectionId, cards, sourceCardMap) => {')
  [void]$Builder.AppendLine('        const section = document.createElement("section");')
  [void]$Builder.AppendLine('        section.className = "route-section-card";')
  [void]$Builder.AppendLine('        const title = document.createElement("div");')
  [void]$Builder.AppendLine('        title.className = "route-section-title";')
  [void]$Builder.AppendLine('        const h3 = document.createElement("h3"); h3.textContent = routeSectionTitles.get(sectionId) || sectionId;')
  [void]$Builder.AppendLine('        const count = document.createElement("span"); count.textContent = `${cards.length} route${cards.length === 1 ? "" : "s"}`;')
  [void]$Builder.AppendLine('        title.append(h3, count);')
  [void]$Builder.AppendLine('        section.appendChild(title);')
  [void]$Builder.AppendLine('        if (!cards.length) return;')
  [void]$Builder.AppendLine('        const lane = document.createElement("div"); lane.className = cards.length > 1 ? "claim-row-list hud-card-lane" : "claim-row-list";')
  [void]$Builder.AppendLine('        cards.sort(compareRouteCards).forEach((card, index) => appendRouteCard(lane, card, "evidence", index + 1, sourceCardMap ? sourceCardMap.get(card) : []));')
  [void]$Builder.AppendLine('        section.appendChild(lane);')
  [void]$Builder.AppendLine('        panel.appendChild(section);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderRouteHudPanel = (panel, clickedForm, normalized, cards, lookupCandidates) => {')
  [void]$Builder.AppendLine('        panel.replaceChildren();')
  [void]$Builder.AppendLine('        const sourceNotes = buildSourceNotes(cards);')
  [void]$Builder.AppendLine('        const selected = document.createElement("div"); selected.className = "route-selected-token"; selected.lang = "he"; selected.dir = "rtl"; selected.textContent = normalizeHebrewDisplay(clickedForm || normalized || ""); panel.appendChild(selected);')
  [void]$Builder.AppendLine('        appendTokenTreatmentCard(panel, clickedForm, normalized, cards, lookupCandidates);')
  [void]$Builder.AppendLine('        const { answerCard, answerState, ambiguityCount } = selectRouteAnswer(cards);')
  [void]$Builder.AppendLine('        const answerSection = document.createElement("section"); answerSection.className = "route-section-card route-answer-card";')
  [void]$Builder.AppendLine('        const answerTitle = document.createElement("div"); answerTitle.className = "route-section-title";')
  [void]$Builder.AppendLine('        const answerH3 = document.createElement("h3"); answerH3.textContent = answerState === "ambiguous" ? "Definition candidates" : "Definition";')
  [void]$Builder.AppendLine('        const answerMeta = document.createElement("span");')
  [void]$Builder.AppendLine('        answerMeta.textContent = answerCard ? `${routeScore(answerCard)}% ${answerCard.lookup_relation === "exact" ? "direct" : answerCard.lookup_relation}` : (answerState === "ambiguous" ? `${ambiguityCount || 2} options` : "not answer-eligible");')
  [void]$Builder.AppendLine('        answerTitle.append(answerH3, answerMeta); answerSection.appendChild(answerTitle);')
  [void]$Builder.AppendLine('        if (answerCard) appendRouteCard(answerSection, answerCard, "answer", 0, sourceNotes.cardMap.get(answerCard)); else { const p = document.createElement("p"); p.className = "placeholder"; p.textContent = answerState === "ambiguous" ? "Ambiguous; compare evidence below." : "No definition yet."; answerSection.appendChild(p); }')
  [void]$Builder.AppendLine('        panel.appendChild(answerSection);')
  [void]$Builder.AppendLine('        const bySection = new Map();')
  [void]$Builder.AppendLine('        cards.filter((card) => card !== answerCard).forEach((card) => { const section = routeSection(card); if (!bySection.has(section)) bySection.set(section, []); bySection.get(section).push(card); });')
  [void]$Builder.AppendLine('        placeholderSections.forEach((section) => appendRouteSection(panel, section, bySection.get(section) || [], sourceNotes.cardMap));')
  [void]$Builder.AppendLine('        [...bySection.keys()].filter((section) => !placeholderSections.includes(section)).sort((a, b) => (routeSectionRank.get(a) ?? 9) - (routeSectionRank.get(b) ?? 9)).forEach((section) => appendRouteSection(panel, section, bySection.get(section) || [], sourceNotes.cardMap));')
  [void]$Builder.AppendLine('        const lookup = document.createElement("details"); lookup.className = "route-audit-card";')
  [void]$Builder.AppendLine('        const lookupTitle = document.createElement("summary"); lookupTitle.textContent = `Lookup keys (${lookupCandidates.length})`; lookup.appendChild(lookupTitle);')
  [void]$Builder.AppendLine('        const lookupText = document.createElement("p"); lookupText.className = "placeholder"; lookupText.textContent = `Normalized key: ${normalized || "N/A"} | Cards: ${cards.length} | Lookup keys: ${lookupCandidates.map((item) => `${item.key}${item.relation === "exact" ? "" : ` (${item.relation})`}`).join(", ") || "none"}`; lookup.appendChild(lookupText);')
  [void]$Builder.AppendLine('        panel.appendChild(lookup);')
  [void]$Builder.AppendLine('        appendSourceFootnotes(panel, sourceNotes.notes);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const primaryWordText = (button) => button.dataset.lexicalSurface || button.querySelector(".lexical-word-surface")?.textContent?.trim() || button.textContent.trim();')
  [void]$Builder.AppendLine('      const buildWordView = async (button) => {')
  [void]$Builder.AppendLine('        const tokenRow = await loadTokenRow(button.dataset.lexicalIndex);')
  [void]$Builder.AppendLine('        return { ...tokenRow, hebrew_word: primaryWordText(button) || tokenRow.surface_word, source_rows: [], secondary_source_rows: [] };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderWord = async (button) => {')
  [void]$Builder.AppendLine('        const unit = button.closest("[data-lexical-unit]");')
  [void]$Builder.AppendLine('        const slot = unit ? unit.querySelector("[data-lexical-slot]") : null;')
  [void]$Builder.AppendLine('        if (!unit || !slot) return;')
  [void]$Builder.AppendLine('        if (activeHudButton && activeHudButton !== button) { activeHudButton.setAttribute("aria-pressed", "false"); activeHudButton.setAttribute("aria-expanded", "false"); }')
  [void]$Builder.AppendLine('        activeHudButton = button;')
  [void]$Builder.AppendLine('        if (hud.parentElement !== document.body) document.body.appendChild(hud);')
  [void]$Builder.AppendLine('        button.setAttribute("aria-pressed", "true");')
  [void]$Builder.AppendLine('        button.setAttribute("aria-expanded", "true");')
  [void]$Builder.AppendLine('        hud.hidden = false;')
  [void]$Builder.AppendLine('        hud.focus({ preventScroll: true });')
  [void]$Builder.AppendLine('        positionHudNearButton(button);')
  [void]$Builder.AppendLine('        const panel = hud.querySelector("[data-route-hud-panel]");')
  [void]$Builder.AppendLine('        if (panel) { const loading = document.createElement("p"); loading.className = "placeholder"; loading.textContent = "Loading route cards..."; panel.replaceChildren(loading); }')
  [void]$Builder.AppendLine('        try {')
  [void]$Builder.AppendLine('          const view = await buildWordView(button);')
  [void]$Builder.AppendLine('          if (button.getAttribute("aria-pressed") !== "true") return;')
  [void]$Builder.AppendLine('          const clickedForm = view.hebrew_word || view.surface_word || "Clicked form";')
  [void]$Builder.AppendLine('          const hudTitle = hud.querySelector("#route-hud-title"); if (hudTitle) hudTitle.textContent = `Route HUD: ${normalizeHebrewDisplay(clickedForm || "")}`;')
  [void]$Builder.AppendLine('          const clickedNormalized = normalizeHebrewKey(clickedForm);')
  [void]$Builder.AppendLine('          const rowSurfaceNormalized = normalizeHebrewKey(view.surface_word || "");')
  [void]$Builder.AppendLine('          const normalized = rowSurfaceNormalized && rowSurfaceNormalized === clickedNormalized ? (view.normalized_word || clickedNormalized) : clickedNormalized;')
  [void]$Builder.AppendLine('          const routeLookup = await loadRouteCardsForToken(clickedForm, normalized);')
  [void]$Builder.AppendLine('          if (button.getAttribute("aria-pressed") !== "true") return;')
  [void]$Builder.AppendLine('          if (panel) renderRouteHudPanel(panel, clickedForm, normalized, routeLookup.cards, routeLookup.candidates);')
  [void]$Builder.AppendLine('          positionHudNearButton(button);')
  [void]$Builder.AppendLine('        } catch (error) {')
      [void]$Builder.AppendLine('          console.error(error);')
      [void]$Builder.AppendLine('          if (panel) { const errorNote = document.createElement("p"); errorNote.className = "placeholder"; errorNote.textContent = "New HUD route lookup failed for this click."; panel.replaceChildren(errorNote); }')
  [void]$Builder.AppendLine('          positionHudNearButton(button);')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const closeRouteHud = ({ restoreFocus = false } = {}) => {')
  [void]$Builder.AppendLine('        const buttonToRestore = activeHudButton;')
  [void]$Builder.AppendLine('        hud.hidden = true;')
  [void]$Builder.AppendLine('        if (buttonToRestore) { buttonToRestore.setAttribute("aria-pressed", "false"); buttonToRestore.setAttribute("aria-expanded", "false"); }')
  [void]$Builder.AppendLine('        activeHudButton = null;')
  [void]$Builder.AppendLine('        if (restoreFocus && buttonToRestore) buttonToRestore.focus({ preventScroll: true });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      document.addEventListener("click", (event) => {')
  [void]$Builder.AppendLine('        const button = event.target.closest("[data-lexical-token]");')
  [void]$Builder.AppendLine('        if (button) { renderWord(button); return; }')
  [void]$Builder.AppendLine('        if (!hud.hidden && !event.target.closest("[data-lexical-hud]")) closeRouteHud();')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      document.addEventListener("keydown", (event) => {')
  [void]$Builder.AppendLine('        if (event.key === "Escape" && !hud.hidden) { event.preventDefault(); closeRouteHud({ restoreFocus: true }); return; }')
  [void]$Builder.AppendLine('        if (event.key !== "Enter" && event.key !== " ") return;')
  [void]$Builder.AppendLine('        const button = event.target.closest("[data-lexical-token]");')
  [void]$Builder.AppendLine('        if (!button) return;')
  [void]$Builder.AppendLine('        event.preventDefault();')
  [void]$Builder.AppendLine('        renderWord(button);')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      document.querySelectorAll("[data-hud-close]").forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => closeRouteHud({ restoreFocus: true }));')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      window.addEventListener("resize", scheduleHudPosition);')
  [void]$Builder.AppendLine('      window.addEventListener("scroll", scheduleHudPosition, true);')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Get-LexicalCache {
  param(
    [string]$LexicalDir = 'data/lexical',
    [string[]]$WorkIds = @(),
    [switch]$OccurrencesOnly
  )

  $lexiconPath = Join-Path $LexicalDir 'lexicon.json'
  $tokenIndexPath = Join-Path $LexicalDir 'token-index.json'
  $occurrencesDir = Join-Path $LexicalDir 'occurrences'

  $lexicon = [pscustomobject]@{ schema_version = 1; entries = @() }
  $lexiconEntries = @()
  $tokenIndex = [pscustomobject]@{ schema_version = 1; forms = @() }
  $tokenIndexRows = @()

  if (-not $OccurrencesOnly) {
    $lexicon = if (Test-Path $lexiconPath) { Read-Json -Path $lexiconPath } else { [pscustomobject]@{ schema_version = 1; entries = @() } }
    $lexiconEntries = @($lexicon.entries)
    if ($lexiconEntries.Count -eq 0 -and $lexicon.PSObject.Properties.Name -contains 'layer_files') {
      foreach ($layer in @($lexicon.layer_files)) {
        if (-not $layer.path) { continue }
        $layerPath = Join-Path $LexicalDir ([string]$layer.path)
        if (-not (Test-Path -LiteralPath $layerPath)) { continue }
        $layerJson = Read-Json -Path $layerPath
        $lexiconEntries += @($layerJson.entries)
      }
      $lexicon = [pscustomobject]@{
        schema_version = $lexicon.schema_version
        title = $lexicon.title
        scope = $lexicon.scope
        import_date = $lexicon.import_date
        generated_at = $lexicon.generated_at
        license_policy = $lexicon.license_policy
        layer_files = $lexicon.layer_files
        entries = $lexiconEntries
      }
    }

    $tokenIndex = if (Test-Path $tokenIndexPath) { Read-Json -Path $tokenIndexPath } else { [pscustomobject]@{ schema_version = 1; forms = @() } }
    if ($tokenIndex.PSObject.Properties.Name -contains 'forms') {
      $tokenIndexRows = @($tokenIndex.forms)
    }
    if ($tokenIndexRows.Count -eq 0 -and $tokenIndex.PSObject.Properties.Name -contains 'work_indexes') {
      $targetWorkIdSet = @{}
      if ($WorkIds.Count -gt 0) {
        foreach ($workId in @($WorkIds | Where-Object { $_ })) {
          $targetWorkIdSet[[string]$workId] = $true
        }
      }
      foreach ($indexFile in @($tokenIndex.work_indexes)) {
        if (-not $indexFile.path) { continue }
        if ($targetWorkIdSet.Count -gt 0) {
          $indexWorkId = [string]$indexFile.work_id
          if (-not $indexWorkId -or -not $targetWorkIdSet.ContainsKey($indexWorkId)) { continue }
        }
        $indexPath = Join-Path $LexicalDir ([string]$indexFile.path)
        if (-not (Test-Path -LiteralPath $indexPath)) { continue }
        $workTokenIndex = Read-Json -Path $indexPath
        $tokenIndexRows += @($workTokenIndex.forms)
      }
    }
  }

  $tokenIndexById = @{}
  foreach ($row in @($tokenIndexRows)) {
    if ($row.token_index_id) {
      $tokenIndexById[[string]$row.token_index_id] = $row
    }
  }

  $lexiconById = @{}
  foreach ($entry in @($lexiconEntries)) {
    if ($entry.entry_id) {
      $lexiconById[[string]$entry.entry_id] = $entry
    }
  }

  $occurrencesByWork = @{}
  if (Test-Path $occurrencesDir) {
    $occurrenceFiles = if ($WorkIds.Count -gt 0) {
      @($WorkIds | ForEach-Object { Join-Path $occurrencesDir "$_.json" } | Where-Object { Test-Path -LiteralPath $_ } | ForEach-Object { Get-Item -LiteralPath $_ })
    } else {
      @(Get-ChildItem -Path $occurrencesDir -Filter '*.json')
    }
    foreach ($file in $occurrenceFiles) {
      $occurrence = Read-Json -Path $file.FullName
      if ($occurrence.work_id) {
        $occurrencesByWork[[string]$occurrence.work_id] = $occurrence
      }
    }
  }

  return [pscustomobject]@{
    lexicon = $lexicon
    token_index = $tokenIndex
    token_index_by_id = $tokenIndexById
    lexicon_by_id = $lexiconById
    occurrences_by_work = $occurrencesByWork
  }
}

function Get-LexicalUnitOccurrence {
  param(
    [AllowNull()][object]$WorkOccurrence,
    [string]$UnitId
  )

  if ($null -eq $WorkOccurrence -or $null -eq $WorkOccurrence.units) { return $null }
  $property = $WorkOccurrence.units.PSObject.Properties[$UnitId]
  if ($null -eq $property) { return $null }
  return $property.Value
}

function Test-UnitsHaveLexical {
  param(
    [AllowNull()][object]$WorkOccurrence,
    [object[]]$Units
  )

  if ($null -eq $WorkOccurrence) { return $false }
  foreach ($unit in @($Units)) {
    if ($null -ne (Get-LexicalUnitOccurrence -WorkOccurrence $WorkOccurrence -UnitId $unit.unit_id)) {
      return $true
    }
  }
  return $false
}

function Test-ExcludedOtherLexicalEntry {
  param([object]$Entry)

  if ($Entry.context_role -eq 'likely_contextual') { return $false }

  $renderingText = (@($Entry.lemma, $Entry.match_key, $Entry.source_id) + @($Entry.strict_renderings)) -join ' '
  $renderingText = $renderingText.ToLowerInvariant()
  foreach ($pattern in @(
    'tibetan',
    'lama, title',
    'fastener',
    'threaded hole',
    '\bnut\b',
    'metheg-ha-ammah',
    'epithet of gath',
    'hill in palestine',
    '\bpalestine\b'
  )) {
    if ($renderingText -match $pattern) { return $true }
  }

  return $false
}

function Get-LexicalSourceRowKey {
  param([object]$Row)

  if ($null -eq $Row) { return '' }
  return "$($Row.source_family)|$($Row.source_id)"
}

function Get-LexicalEntrySourceKeys {
  param([object]$Entry)

  $keys = @()
  foreach ($key in @($Entry.source_row_keys)) {
    if ($key) { $keys += [string]$key }
  }
  if ($Entry.source_family -or $Entry.source_id) {
    $keys += "$($Entry.source_family)|$($Entry.source_id)"
  }
  return @($keys | Where-Object { $_ -and $_ -ne '|' } | Select-Object -Unique)
}

function Select-LexicalSourceRows {
  param(
    [object[]]$SourceRows,
    [string[]]$Keys
  )

  $keySet = @{}
  foreach ($key in @($Keys)) {
    if ($key) { $keySet[[string]$key] = $true }
  }

  return @($SourceRows | Where-Object {
    $key = Get-LexicalSourceRowKey -Row $_
    $key -and $keySet.ContainsKey($key)
  })
}

function New-LexicalFallbackSourceRow {
  param([object]$Entry)

  if ($null -eq $Entry -or (-not $Entry.source_family -and -not $Entry.source_id)) { return $null }
  $family = [string]$Entry.source_family
  $sourceId = [string]$Entry.source_id
  if (-not $sourceId) { return $null }

  if ($family -eq 'wikidata') {
    return [pscustomobject]@{
      source_name = if ($Entry.source_name) { $Entry.source_name } else { 'Wikidata Lexeme' }
      source_family = 'wikidata'
      source_id = $sourceId
      source_url = "https://www.wikidata.org/wiki/Lexeme:$sourceId"
      license = 'CC0'
      license_url = 'https://www.wikidata.org/wiki/Wikidata:Licensing'
      fields_used = @('lemma/form coverage', 'English sense glosses or sense-item labels where available')
      notes = 'Fallback source row reconstructed from rendered lexical candidate metadata.'
    }
  }

  if ($family -eq 'openscriptures') {
    $sourceName = if ($Entry.source_name) { [string]$Entry.source_name } else { 'OpenScriptures HebrewLexicon' }
    $sourceUrl = if ($sourceName -match 'morphHB') {
      'https://github.com/openscriptures/morphhb/tree/master/wlc'
    } else {
      'https://github.com/openscriptures/HebrewLexicon/blob/master/HebrewStrong.xml'
    }
    return [pscustomobject]@{
      source_name = $sourceName
      source_family = 'openscriptures'
      source_id = $sourceId
      source_url = $sourceUrl
      license = 'CC BY 4.0'
      license_url = 'https://creativecommons.org/licenses/by/4.0/'
      fields_used = @('lexical candidate metadata')
      notes = 'Fallback source row reconstructed from rendered lexical candidate metadata.'
    }
  }

  if ($family -eq 'kaikki' -or $family -eq 'wiktionary') {
    return [pscustomobject]@{
      source_name = if ($Entry.source_name) { $Entry.source_name } else { 'Wiktionary via Kaikki' }
      source_family = $family
      source_id = $sourceId
      source_url = 'https://kaikki.org/dictionary/Hebrew/index.html'
      license = 'CC BY-SA 4.0 / GFDL'
      license_url = 'https://creativecommons.org/licenses/by-sa/4.0/'
      fields_used = @('lexical candidate metadata')
      notes = 'Fallback source row reconstructed from rendered lexical candidate metadata.'
    }
  }

  return [pscustomobject]@{
    source_name = if ($Entry.source_name) { $Entry.source_name } else { 'Lexical candidate source' }
    source_family = $family
    source_id = $sourceId
    source_url = ''
    license = 'source metadata incomplete'
    license_url = ''
    fields_used = @('lexical candidate metadata')
    notes = 'Rendered candidate carried a source id, but no full cached source/license row was available. Treat as caution/incomplete metadata.'
  }
}

function Add-LexicalFallbackSourceRows {
  param(
    [object[]]$SourceRows,
    [object[]]$Entries
  )

  $rows = @($SourceRows)
  $known = @{}
  foreach ($row in @($rows)) {
    $key = Get-LexicalSourceRowKey -Row $row
    if ($key) { $known[$key] = $true }
  }
  foreach ($entry in @($Entries)) {
    $key = Get-LexicalSourceRowKey -Row $entry
    if (-not $key -or $known.ContainsKey($key)) { continue }
    $fallback = New-LexicalFallbackSourceRow -Entry $entry
    if ($null -eq $fallback) { continue }
    $rows += $fallback
    $known[$key] = $true
  }
  return @($rows)
}

function Get-WorkLexicalPayload {
  param(
    [AllowNull()][object]$WorkOccurrence,
    [object]$LexicalCache
  )

  $tokenIds = @{}
  if ($null -ne $WorkOccurrence -and $null -ne $WorkOccurrence.units) {
    foreach ($unitProperty in @($WorkOccurrence.units.PSObject.Properties)) {
      foreach ($paragraph in @($unitProperty.Value.paragraphs)) {
        foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
          if ($tokenIndexId) {
            $tokenKey = [string]$tokenIndexId
            $tokenIds[$tokenKey] = $true
          }
        }
      }
    }
  }

  $forms = @($tokenIds.Keys | Sort-Object | ForEach-Object {
    if ($LexicalCache.token_index_by_id.ContainsKey($_)) {
      $row = $LexicalCache.token_index_by_id[$_]
      [pscustomobject]@{
        token_index_id = $row.token_index_id
        surface_word = $row.surface_word
        normalized_word = $row.normalized_word
      }
    }
  })
  return [pscustomobject]@{
    generated_at = $LexicalCache.token_index.generated_at
    token_index = [pscustomobject]@{ schema_version = 1; forms = $forms }
    lexicon = [pscustomobject]@{ schema_version = 1; entries = @() }
  }
}

function Write-WorkLexicalPayloadFiles {
  param(
    [string]$WorkId,
    [object]$WorkLexicalPayload,
    [string]$RootHref = '../',
    [string]$LexicalDir = 'data/lexical'
  )

  if ($null -eq $WorkLexicalPayload) {
    return $null
  }

  $chunkDir = Join-Path $LexicalDir "$WorkId-chunks"
  if (-not (Test-Path -LiteralPath $chunkDir)) {
    New-Item -ItemType Directory -Path $chunkDir | Out-Null
  }
  foreach ($oldChunk in @(Get-ChildItem -Path $chunkDir -Filter '*.json' -ErrorAction SilentlyContinue)) {
    Remove-Item -LiteralPath $oldChunk.FullName -Force
  }

  $forms = @($WorkLexicalPayload.token_index.forms)
  $maxFormsPerChunk = 1000
  $chunks = @()
  $tokenChunks = [ordered]@{}
  for ($start = 0; $start -lt $forms.Count; $start += $maxFormsPerChunk) {
    $chunkForms = @($forms[$start..([Math]::Min($start + $maxFormsPerChunk - 1, $forms.Count - 1))])
    $chunkNumber = [int]($start / $maxFormsPerChunk)
    $chunkId = ('chunk-{0:D3}' -f $chunkNumber)

    foreach ($form in @($chunkForms)) {
      if ($form.token_index_id) {
        $tokenChunks[[string]$form.token_index_id] = $chunkId
      }
    }

    $chunk = [pscustomobject]@{
      schema_version = 1
      chunk_id = $chunkId
      token_index = [pscustomobject]@{
        schema_version = 1
        forms = $chunkForms
      }
      lexicon = [pscustomobject]@{
        schema_version = 1
        entries = @()
      }
      source_rows = [ordered]@{}
    }

    $chunkPath = Join-Path $chunkDir "$chunkId.json"
    Write-Utf8 -Path $chunkPath -Content ((ConvertTo-Json -InputObject $chunk -Depth 40 -Compress) + "`n")
    $chunks += [pscustomobject]@{
      chunk_id = $chunkId
      url = "$WorkId-chunks/$chunkId.json"
      token_count = $chunkForms.Count
      entry_count = 0
    }
  }

  $manifest = [pscustomobject]@{
    schema_version = 1
    work_id = $WorkId
    generated_at = if ($WorkLexicalPayload.generated_at) { $WorkLexicalPayload.generated_at } else { $null }
    chunks = $chunks
    token_chunks = $tokenChunks
  }

  $manifestPath = Join-Path $LexicalDir "$WorkId.manifest.json"
  Write-Utf8 -Path $manifestPath -Content ((ConvertTo-Json -InputObject $manifest -Depth 40 -Compress) + "`n")

  return [pscustomobject]@{
    work_id = $WorkId
    manifest_url = "$RootHref$LexicalDir/$WorkId.manifest.json"
    occurrence_url = "$RootHref$LexicalDir/occurrences/$WorkId.json"
    hud_route_lookup_manifest_url = "$($RootHref)data/definitions/hud-route-lookup/manifest.json"
    reader_hints_url = "$($RootHref)data/public-hud/$WorkId/reader-hints.json"
    visible_display_slot_manifest_url = Get-VisibleDisplaySlotManifestUrl -WorkId $WorkId -RootHref $RootHref
    root_href = $RootHref
  }
}

function Get-OrderedGroups {
  param(
    [object[]]$Items,
    [scriptblock]$KeyScript
  )

  $order = @()
  $groups = @{}
  foreach ($item in @($Items)) {
    $key = (& $KeyScript $item).ToString()
    if (-not $key.Trim()) { $key = 'text' }
    if (-not $groups.ContainsKey($key)) {
      $groups[$key] = New-Object System.Collections.ArrayList
      $order += $key
    }
    [void]$groups[$key].Add($item)
  }

  $result = @()
  foreach ($key in $order) {
    $result += [pscustomobject]@{
      Key = $key
      Items = @($groups[$key])
    }
  }
  return $result
}

function Get-UnitTocLabel {
  param([object]$Unit)

  $ref = [string]$Unit.source_ref
  if ($ref -match '(\d+(?::\d+){0,3})$') {
    return $Matches[1]
  }

  $parts = @($ref -split ',')
  $lastPart = $parts[$parts.Count - 1].Trim()
  if ($lastPart) { return $lastPart }
  return [string]$Unit.anchor_id
}

function Get-GroupStartAnchor {
  param(
    [object]$Unit,
    [object]$Source
  )

  if ($Unit.group_title -ne $Source.work_title -and $Unit.group_slug -ne 'text') {
    return "group-$($Unit.group_slug)"
  }
  return 'work-top'
}

function Get-SectionStartAnchor {
  param(
    [object]$Unit,
    [object]$Source
  )

  if ($Unit.section_title -ne $Source.work_title -and $Unit.section_slug -ne 'text') {
    return "section-$($Unit.group_slug)-$($Unit.section_slug)"
  }
  return (Get-GroupStartAnchor -Unit $Unit -Source $Source)
}

function Get-UnitParentAnchor {
  param(
    [object]$Unit,
    [object]$Source
  )

  if ($null -ne $Unit.chapter_number -and $Unit.chapter_number.ToString().Trim()) {
    return "chapter-$($Unit.group_slug)-$($Unit.section_slug)-$($Unit.chapter_number)"
  }
  return (Get-SectionStartAnchor -Unit $Unit -Source $Source)
}

function Append-TocUnitLinks {
  param(
    [System.Text.StringBuilder]$Builder,
    [object[]]$Units,
    [string]$Indent = '                    '
  )

  if ($MaxTocUnitLinks -gt 0 -and @($Units).Count -gt $MaxTocUnitLinks) {
    $firstUnit = @($Units)[0]
    [void]$Builder.AppendLine("$Indent<p class=""toc-note"">$(Encode-Html (@($Units).Count)) units in this section. Per-unit links are capped for page size; use the first anchor or browser search within the page.</p>")
    if ($null -ne $firstUnit) {
      [void]$Builder.AppendLine("$Indent<p><a class=""toc-start"" href=""#$($firstUnit.anchor_id)"">First unit</a></p>")
    }
    return
  }

  [void]$Builder.AppendLine("$Indent<ul class=""toc-units"">")
  foreach ($unit in @($Units)) {
    $label = Get-UnitTocLabel -Unit $unit
    [void]$Builder.AppendLine("$Indent  <li><a class=""toc-unit"" href=""#$($unit.anchor_id)"" title=""$(Encode-Html $unit.source_ref)"">$(Encode-Html $label)</a></li>")
  }
  [void]$Builder.AppendLine("$Indent</ul>")
}

function Append-WorkToc {
  param(
    [System.Text.StringBuilder]$Builder,
    [object]$Source,
    [object[]]$VisibleUnits,
    [AllowNull()][object]$WorkOccurrence
  )

  [void]$Builder.AppendLine('        <nav class="toc" aria-label="Table of contents">')
  [void]$Builder.AppendLine('          <details class="toc-root" open>')
  [void]$Builder.AppendLine('            <summary>Contents</summary>')

  foreach ($group in (Get-OrderedGroups -Items $VisibleUnits -KeyScript { param($item) $item.group_slug })) {
    $groupUnits = @($group.Items)
    if ($groupUnits.Count -eq 0) { continue }
    $firstGroupUnit = $groupUnits[0]
    $groupTitle = if ($firstGroupUnit.group_title -and $firstGroupUnit.group_slug -ne 'text') { $firstGroupUnit.group_title } else { $Source.work_title }
    $groupAnchor = Get-GroupStartAnchor -Unit $firstGroupUnit -Source $Source
    $groupBadge = if (Test-UnitsHaveLexical -WorkOccurrence $WorkOccurrence -Units $groupUnits) { ' <span class="hud-badge">Route HUD active</span>' } else { '' }

    [void]$Builder.AppendLine('            <details class="toc-group">')
    [void]$Builder.AppendLine("              <summary>$(Encode-Html $groupTitle)$groupBadge</summary>")
    [void]$Builder.AppendLine("              <a class=""toc-start"" href=""#$groupAnchor"">Start</a>")

    foreach ($section in (Get-OrderedGroups -Items $groupUnits -KeyScript { param($item) $item.section_slug })) {
      $sectionUnits = @($section.Items)
      if ($sectionUnits.Count -eq 0) { continue }
      $firstSectionUnit = $sectionUnits[0]
      $sectionTitle = if ($firstSectionUnit.section_title -and $firstSectionUnit.section_slug -ne 'text') { $firstSectionUnit.section_title } else { $groupTitle }
      $sectionAnchor = Get-SectionStartAnchor -Unit $firstSectionUnit -Source $Source
      $sectionBadge = if (Test-UnitsHaveLexical -WorkOccurrence $WorkOccurrence -Units $sectionUnits) { ' <span class="hud-badge">Route HUD active</span>' } else { '' }

      [void]$Builder.AppendLine('              <details class="toc-section">')
      [void]$Builder.AppendLine("                <summary>$(Encode-Html $sectionTitle)$sectionBadge</summary>")
      [void]$Builder.AppendLine("                <a class=""toc-start"" href=""#$sectionAnchor"">Start section</a>")

      $chapterGroups = Get-OrderedGroups -Items $sectionUnits -KeyScript { param($item) if ($null -ne $item.chapter_number -and $item.chapter_number.ToString().Trim()) { $item.chapter_number } else { 'text' } }
      foreach ($chapter in $chapterGroups) {
        $chapterUnits = @($chapter.Items)
        if ($chapterUnits.Count -eq 0) { continue }
        $firstChapterUnit = $chapterUnits[0]
        if ($chapter.Key -eq 'text') {
          Append-TocUnitLinks -Builder $Builder -Units $chapterUnits -Indent '                '
          continue
        }

        $chapterAnchor = "chapter-$($firstChapterUnit.group_slug)-$($firstChapterUnit.section_slug)-$($firstChapterUnit.chapter_number)"
        [void]$Builder.AppendLine('                <details class="toc-chapter">')
        [void]$Builder.AppendLine("                  <summary>Chapter $(Encode-Html $firstChapterUnit.chapter_number)</summary>")
        [void]$Builder.AppendLine("                  <a class=""toc-start"" href=""#$chapterAnchor"">Start chapter</a>")
        Append-TocUnitLinks -Builder $Builder -Units $chapterUnits -Indent '                  '
        [void]$Builder.AppendLine('                </details>')
      }

      [void]$Builder.AppendLine('              </details>')
    }

    [void]$Builder.AppendLine('            </details>')
  }

  [void]$Builder.AppendLine('          </details>')
  [void]$Builder.AppendLine('        </nav>')
}

$targetWorkIds = @($WorkIds | Where-Object { $_ -and $_.ToString().Trim() } | ForEach-Object { $_.ToString().Trim() })
if ($OnlyWorkIdsPath) {
  if (-not (Test-Path -LiteralPath $OnlyWorkIdsPath)) {
    throw "OnlyWorkIdsPath not found: $OnlyWorkIdsPath"
  }
  $targetWorkIds += @(Get-Content -LiteralPath $OnlyWorkIdsPath -Encoding UTF8 |
    Where-Object { $_ -and $_.ToString().Trim() } |
    ForEach-Object { $_.ToString().Trim() })
  $targetWorkIds = @($targetWorkIds | Select-Object -Unique)
}

if ($OnlyLexicalPayloadFiles -and $SkipLexicalPayloadFiles) {
  throw 'OnlyLexicalPayloadFiles cannot be combined with SkipLexicalPayloadFiles.'
}

if ($OnlyLexicalPayloadFiles -and $OnlyOverlayExports) {
  throw 'OnlyLexicalPayloadFiles cannot be combined with OnlyOverlayExports.'
}

if ($OnlyLexicalPayloadFiles -and $OnlySitePages) {
  throw 'OnlyLexicalPayloadFiles cannot be combined with OnlySitePages.'
}

if ($OnlyOverlayExports -and $SkipOverlayExports) {
  throw 'OnlyOverlayExports cannot be combined with SkipOverlayExports.'
}

if ($OnlyOverlayExports -and $OnlySitePages) {
  throw 'OnlyOverlayExports cannot be combined with OnlySitePages.'
}

if ($OnlySitePages -and $SkipSitePages) {
  throw 'OnlySitePages cannot be combined with SkipSitePages.'
}

if ($OnlySitePages -and (Ensure-SourceCatalog -SourceDirectory $SourceDir)) {
  $catalog = Read-Json -Path 'data/catalog/source-catalog.json'
  $sources = @($catalog.sources | Sort-Object work_title)
} else {
  $sourceFiles = if ($targetWorkIds.Count -gt 0) {
    @($targetWorkIds | ForEach-Object { Join-Path $SourceDir "$_.json" } | Where-Object { Test-Path -LiteralPath $_ } | ForEach-Object { Get-Item -LiteralPath $_ })
  } else {
    @(Get-ChildItem -Path $SourceDir -Filter '*.json')
  }

  $sources = @($sourceFiles | ForEach-Object { Read-Json -Path $_.FullName } | Sort-Object work_title)
  if ($targetWorkIds.Count -gt 0) {
    $knownSourceIds = @{}
    foreach ($source in @($sources)) {
      if ($source.work_id) { $knownSourceIds[[string]$source.work_id] = $true }
    }
    $baseSources = New-Object System.Collections.Generic.List[object]
    foreach ($source in @($sources)) {
      if (-not $source.base_work_id) { continue }
      $baseId = [string]$source.base_work_id
      if ($knownSourceIds.ContainsKey($baseId)) { continue }
      $basePath = Join-Path $SourceDir "$baseId.json"
      if (-not (Test-Path -LiteralPath $basePath)) { continue }
      $baseSource = Read-Json -Path $basePath
      $baseSources.Add($baseSource)
      $knownSourceIds[$baseId] = $true
    }
    if ($baseSources.Count -gt 0) {
      $baseSourceItems = @($baseSources | ForEach-Object { $_ })
      $sources = @(@($sources) + $baseSourceItems | Sort-Object work_title)
    }
  }
}
$sourceById = @{}
foreach ($source in $sources) {
  $sourceById[[string]$source.work_id] = $source
}

$lexicalCache = if ($OnlySitePages) {
  $null
} else {
  Get-LexicalCache -WorkIds $targetWorkIds -OccurrencesOnly:($SkipLexicalPayloadFiles -or $OnlyOverlayExports)
}

function Find-SourceForFeature {
  param(
    [hashtable]$SourceById,
    [object[]]$Sources,
    [string[]]$Ids,
    [string[]]$Titles
  )

  foreach ($id in @($Ids)) {
    if ($id -and $SourceById.ContainsKey($id)) {
      return $SourceById[$id]
    }
  }

  foreach ($title in @($Titles)) {
    if (-not $title) { continue }
    $match = @($Sources | Where-Object { $_.work_title -eq $title } | Select-Object -First 1)
    if ($match.Count -gt 0) {
      return $match[0]
    }
  }

  return $null
}

function Append-FeatureCard {
  param(
    [System.Text.StringBuilder]$Builder,
    [string]$Label,
    [string]$Role,
    [AllowNull()][object]$Source,
    [string]$Placeholder = 'Coming soon'
  )

  if ($null -ne $Source) {
    [void]$Builder.AppendLine("            <a class=""work-card"" href=""$($Source.work_slug)/"">")
    [void]$Builder.AppendLine("              <strong>$(Encode-Html $Label)</strong>")
    if ($Role) {
      [void]$Builder.AppendLine("              <span class=""work-label"">$(Encode-Html $Role)</span>")
    }
    [void]$Builder.AppendLine("              <span class=""meta"">$(Get-SourceUnitCount -Source $Source) source units | $(Encode-Html $Source.source_system) | imported $(Encode-Html $Source.import_date)</span>")
    [void]$Builder.AppendLine('            </a>')
  } else {
    [void]$Builder.AppendLine('            <div class="work-card placeholder-card">')
    [void]$Builder.AppendLine("              <strong>$(Encode-Html $Label)</strong>")
    if ($Role) {
      [void]$Builder.AppendLine("              <span class=""work-label"">$(Encode-Html $Role)</span>")
    }
    [void]$Builder.AppendLine("              <span class=""meta"">$(Encode-Html $Placeholder)</span>")
    [void]$Builder.AppendLine('            </div>')
  }
}

function Get-LibrarySearchText {
  param(
    [object]$Source,
    [string]$Group = '',
    [string]$Subgroup = ''
  )

  $parts = New-Object System.Collections.Generic.List[string]
  foreach ($value in @(
      $Source.work_title,
      $Source.he_title,
      $Source.work_id,
      $Source.work_slug,
      $Source.display_label,
      $Source.base_work_title,
      $Source.source_system,
      $Group,
      $Subgroup
    )) {
    if ($value) {
      $parts.Add([string]$value)
    }
  }
  return ($parts -join ' ')
}

function Append-LibraryWorkCard {
  param(
    [System.Text.StringBuilder]$Builder,
    [object]$Source,
    [string]$HrefPrefix = '',
    [string]$Group = '',
    [string]$Subgroup = ''
  )

  $searchText = Encode-Html (Get-LibrarySearchText -Source $Source -Group $Group -Subgroup $Subgroup)
  [void]$Builder.AppendLine("              <a class=""work-card"" data-library-card data-search-text=""$searchText"" href=""$HrefPrefix$($Source.work_slug)/"">")
  [void]$Builder.AppendLine("                <strong>$(Encode-Html $Source.work_title)</strong>")
  if ($Source.display_label) {
    [void]$Builder.AppendLine("                <span class=""work-label"">$(Encode-Html $Source.display_label)</span>")
  }
  [void]$Builder.AppendLine("                <span class=""meta"">$(Get-SourceUnitCount -Source $Source) source units</span>")
  [void]$Builder.AppendLine('              </a>')
}

function Append-LibrarySearchScript {
  param([System.Text.StringBuilder]$Builder)

  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    (() => {')
  [void]$Builder.AppendLine('      const input = document.getElementById("library-search");')
  [void]$Builder.AppendLine('      if (!input) return;')
  [void]$Builder.AppendLine('      const cards = Array.from(document.querySelectorAll("[data-library-card]"));')
  [void]$Builder.AppendLine('      const shelves = Array.from(document.querySelectorAll(".library-shelf, .library-subgroup")).map((el) => ({ el, open: el.hasAttribute("open") }));')
  [void]$Builder.AppendLine('      const count = document.getElementById("library-search-count");')
  [void]$Builder.AppendLine('      const empty = document.getElementById("library-search-empty");')
  [void]$Builder.AppendLine('      const normalize = (value) => (value || "").toLocaleLowerCase();')
  [void]$Builder.AppendLine('      const plural = (countValue, word) => `${countValue} ${word}${countValue === 1 ? "" : "s"}`;')
  [void]$Builder.AppendLine('      const update = () => {')
  [void]$Builder.AppendLine('        const query = normalize(input.value.trim());')
  [void]$Builder.AppendLine('        let visibleCount = 0;')
  [void]$Builder.AppendLine('        for (const card of cards) {')
  [void]$Builder.AppendLine('          const haystack = normalize(card.dataset.searchText || card.textContent);')
  [void]$Builder.AppendLine('          const visible = !query || haystack.includes(query);')
  [void]$Builder.AppendLine('          card.hidden = !visible;')
  [void]$Builder.AppendLine('          if (visible) visibleCount += 1;')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        for (const shelf of shelves) {')
  [void]$Builder.AppendLine('          const hasVisibleCard = Array.from(shelf.el.querySelectorAll("[data-library-card]")).some((card) => !card.hidden);')
  [void]$Builder.AppendLine('          shelf.el.hidden = Boolean(query) && !hasVisibleCard;')
  [void]$Builder.AppendLine('          if (query && hasVisibleCard) {')
  [void]$Builder.AppendLine('            shelf.el.open = true;')
  [void]$Builder.AppendLine('          } else if (!query) {')
  [void]$Builder.AppendLine('            shelf.el.open = shelf.open;')
  [void]$Builder.AppendLine('          }')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        if (count) {')
  [void]$Builder.AppendLine('          count.textContent = query ? `${plural(visibleCount, "matching work")}.` : `Search ${plural(cards.length, "work")}.`;')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        if (empty) {')
  [void]$Builder.AppendLine('          empty.hidden = !query || visibleCount > 0;')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      input.addEventListener("input", update);')
  [void]$Builder.AppendLine('      input.addEventListener("search", update);')
  [void]$Builder.AppendLine('      update();')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Append-LibrarySections {
  param(
    [System.Text.StringBuilder]$Builder,
    [object[]]$Sources,
    [string]$HrefPrefix = ''
  )

  $groupOrder = @{
    'Tanakh' = 1
    'Midrash / Aggadah' = 2
    'Talmud / Rabbinic' = 3
    'Halakhah' = 4
    'Kabbalah / Esoteric' = 5
    'Thought / Musar / Chasidut' = 6
    'Second Temple / Apocrypha' = 7
    'Liturgy / Piyyut' = 8
    'Targum / Aramaic' = 9
    'Other' = 10
    'Works' = 11
  }
  $allHomeGroups = $Sources | Group-Object { Get-HomeGroup $_ } | Sort-Object @{ Expression = { if ($groupOrder.ContainsKey($_.Name)) { $groupOrder[$_.Name] } else { 99 } } }, Name
  $internalArchiveGroups = @()
  $homeGroups = @($allHomeGroups)
  [void]$Builder.AppendLine('        <div class="library-stack">')
  foreach ($homeGroup in $homeGroups) {
    $groupSources = @($homeGroup.Group)
    $groupUnits = [int](($groupSources | ForEach-Object { Get-SourceUnitCount -Source $_ } | Measure-Object -Sum).Sum)
    $groupCountText = "$(Format-CountPhrase -Count $groupSources.Count -Singular 'work' -Plural 'works') | $(Format-CountPhrase -Count $groupUnits -Singular 'source unit' -Plural 'source units')"
    [void]$Builder.AppendLine('          <details class="library-shelf">')
    [void]$Builder.AppendLine('            <summary>')
    [void]$Builder.AppendLine('              <span class="library-shelf-title">')
    [void]$Builder.AppendLine("                <strong>$(Encode-Html $homeGroup.Name)</strong>")
    [void]$Builder.AppendLine("                <span>$(Encode-Html $groupCountText)</span>")
    [void]$Builder.AppendLine('              </span>')
    [void]$Builder.AppendLine('              <span class="library-summary-meta">Browse</span>')
    [void]$Builder.AppendLine('            </summary>')
    [void]$Builder.AppendLine('            <div class="library-shelf-body">')

    $subgroups = $groupSources | Group-Object { Get-LibrarySubgroup $_ } | Sort-Object @{ Expression = { Get-LibrarySubgroupOrder -Group $homeGroup.Name -Subgroup $_.Name } }, Name
    if ($subgroups.Count -le 1) {
      [void]$Builder.AppendLine('              <div class="library-grid direct">')
      foreach ($source in @($groupSources | Sort-Object work_title)) {
        Append-LibraryWorkCard -Builder $Builder -Source $source -HrefPrefix $HrefPrefix -Group $homeGroup.Name
      }
      [void]$Builder.AppendLine('              </div>')
    } else {
      foreach ($subgroup in $subgroups) {
        $subgroupSources = @($subgroup.Group)
        $subgroupUnits = [int](($subgroupSources | ForEach-Object { Get-SourceUnitCount -Source $_ } | Measure-Object -Sum).Sum)
        $subgroupCountText = "$(Format-CountPhrase -Count $subgroupSources.Count -Singular 'work' -Plural 'works') | $(Format-CountPhrase -Count $subgroupUnits -Singular 'source unit' -Plural 'source units')"
        [void]$Builder.AppendLine('              <details class="library-subgroup">')
        [void]$Builder.AppendLine('                <summary>')
        [void]$Builder.AppendLine('                  <span class="library-shelf-title">')
        [void]$Builder.AppendLine("                    <strong>$(Encode-Html $subgroup.Name)</strong>")
        [void]$Builder.AppendLine("                    <span>$(Encode-Html $subgroupCountText)</span>")
        [void]$Builder.AppendLine('                  </span>')
        [void]$Builder.AppendLine('                  <span class="library-summary-meta">Browse</span>')
        [void]$Builder.AppendLine('                </summary>')
        [void]$Builder.AppendLine('                <div class="library-grid">')
        foreach ($source in @($subgroupSources | Sort-Object work_title)) {
          Append-LibraryWorkCard -Builder $Builder -Source $source -HrefPrefix $HrefPrefix -Group $homeGroup.Name -Subgroup $subgroup.Name
        }
        [void]$Builder.AppendLine('                </div>')
        [void]$Builder.AppendLine('              </details>')
      }
    }
    [void]$Builder.AppendLine('            </div>')
    [void]$Builder.AppendLine('          </details>')
  }
  if ($internalArchiveGroups.Count -gt 0) {
    $internalSources = @($internalArchiveGroups | ForEach-Object { $_.Group })
    $internalUnits = [int](($internalSources | ForEach-Object { Get-SourceUnitCount -Source $_ } | Measure-Object -Sum).Sum)
    $internalCountText = "$(Format-CountPhrase -Count $internalSources.Count -Singular 'work' -Plural 'works') | $(Format-CountPhrase -Count $internalUnits -Singular 'source unit' -Plural 'source units')"
    [void]$Builder.AppendLine('          <details class="library-shelf">')
    [void]$Builder.AppendLine('            <summary>')
    [void]$Builder.AppendLine('              <span class="library-shelf-title">')
    [void]$Builder.AppendLine('                <strong>Additional archive</strong>')
    [void]$Builder.AppendLine("                <span>$(Encode-Html $internalCountText)</span>")
    [void]$Builder.AppendLine('              </span>')
    [void]$Builder.AppendLine('              <span class="library-summary-meta">Browse</span>')
    [void]$Builder.AppendLine('            </summary>')
    [void]$Builder.AppendLine('            <div class="library-shelf-body">')
    [void]$Builder.AppendLine('              <div class="library-grid direct">')
    foreach ($source in @($internalSources | Sort-Object work_title)) {
      Append-LibraryWorkCard -Builder $Builder -Source $source -HrefPrefix $HrefPrefix -Group 'Additional archive'
    }
    [void]$Builder.AppendLine('              </div>')
    [void]$Builder.AppendLine('            </div>')
    [void]$Builder.AppendLine('          </details>')
  }
  [void]$Builder.AppendLine('        </div>')
}

function Append-WorkLexicalDownloadLinks {
  param(
    [System.Text.StringBuilder]$Builder,
    [object]$Source,
    [string]$RootHref,
    [AllowNull()][object]$WorkLexicalExternal,
    [string]$AssetBaseUrl = ''
  )

  $links = New-Object System.Collections.Generic.List[string]
  if ($null -ne $WorkLexicalExternal -and $WorkLexicalExternal.manifest_url) {
    $links.Add("<a class=""export-button"" href=""$($WorkLexicalExternal.manifest_url)"">HUD token manifest</a>")
  }
  if ($null -ne $WorkLexicalExternal -and $WorkLexicalExternal.hud_route_lookup_manifest_url) {
    $links.Add("<a class=""export-button"" href=""$($WorkLexicalExternal.hud_route_lookup_manifest_url)"">Route lookup manifest</a>")
  }

  if ($links.Count -gt 0) {
    [void]$Builder.AppendLine('        <div class="license-notice lexical-downloads">')
    [void]$Builder.AppendLine('          <strong>HUD data:</strong> Book-local token bridge plus route-card lookup files. Route rows are study evidence, not polished translations.')
    [void]$Builder.AppendLine("          <p class=""export-actions"">$($links -join '')</p>")
    [void]$Builder.AppendLine('        </div>')
  }
}

function New-LibraryPageHtml {
  param(
    [object[]]$Sources,
    [string]$HrefPrefix = '',
    [string]$HomeHref = './',
    [string]$AboutHref = 'about/'
  )

  $page = New-Object System.Text.StringBuilder
  $workCount = @($Sources).Count
  $unitCount = [int](($Sources | ForEach-Object { Get-SourceUnitCount -Source $_ } | Measure-Object -Sum).Sum)
  $groupCount = @($Sources | Group-Object { Get-HomeGroup $_ }).Count
  $corpusSummary = "$(Format-CountPhrase -Count $workCount -Singular 'work' -Plural 'works') | $(Format-CountPhrase -Count $unitCount -Singular 'source unit' -Plural 'source units') | $(Format-CountPhrase -Count $groupCount -Singular 'corpus group' -Plural 'corpus groups')"

  Append-SiteHead -Builder $page -Title 'Hebrew Source Workbench'
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <div class="shell">')
  [void]$page.AppendLine('      <div class="hero">')
  [void]$page.AppendLine("        <p class=""crumbs""><a href=""$HomeHref"">Library</a> &middot; <a href=""$AboutHref"">About / License</a></p>")
  [void]$page.AppendLine('        <h1>Hebrew Source Workbench</h1>')
  [void]$page.AppendLine('        <p>Browse imported Hebrew source texts by corpus with route HUD support. Work pages preserve source/version/license metadata and expose book-local token and route-card data when available.</p>')
  [void]$page.AppendLine('        <p>No public English translation layer is displayed here; route rows are source-indexed study evidence.</p>')
  [void]$page.AppendLine("        <p class=""meta"">$corpusSummary</p>")
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('      <div style="padding:22px">')
  [void]$page.AppendLine('        <div class="library-tools" role="search">')
  [void]$page.AppendLine('          <label for="library-search">Search library</label>')
  [void]$page.AppendLine('          <input id="library-search" class="library-search" type="search" placeholder="Search Ezekiel, Aggadat Bereshit, Talmud, Zohar..." autocomplete="off">')
  [void]$page.AppendLine('          <p id="library-search-count" class="meta">Search works.</p>')
  [void]$page.AppendLine('        </div>')
  [void]$page.AppendLine('        <p id="library-search-empty" class="library-empty" hidden>No matching works.</p>')
  Append-LibrarySections -Builder $page -Sources $Sources -HrefPrefix $HrefPrefix
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </main>')
  Append-LibrarySearchScript -Builder $page
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')
  return $page.ToString()
}

if (-not $SkipSitePages -and $targetWorkIds.Count -eq 0) {
  Write-Utf8 -Path 'index.html' -Content (New-LibraryPageHtml -Sources $sources -HrefPrefix '' -HomeHref './' -AboutHref 'about/')

  $aboutPage = New-Object System.Text.StringBuilder
  Append-SiteHead -Builder $aboutPage -Title 'About / License'
  [void]$aboutPage.AppendLine('  <main>')
  [void]$aboutPage.AppendLine('    <div class="shell">')
  [void]$aboutPage.AppendLine('      <div class="hero">')
  [void]$aboutPage.AppendLine('        <p class="crumbs"><a href="../">Home</a> &middot; <a href="../library/">Full Library</a></p>')
  [void]$aboutPage.AppendLine('        <h1>About / License</h1>')
  [void]$aboutPage.AppendLine('        <p>This site is a Hebrew-first source-text workbench with clickable route HUD support and explicit source/license layers. It is not an official edition, not a translation publication, and not a replacement for checking the cited source versions.</p>')
  [void]$aboutPage.AppendLine('      </div>')
  [void]$aboutPage.AppendLine('      <div style="padding:22px">')
  [void]$aboutPage.AppendLine('        <section class="home-section">')
  [void]$aboutPage.AppendLine('          <h2>Source Texts</h2>')
  [void]$aboutPage.AppendLine('          <p>Hebrew source texts retain their original source/version licenses. Each work page preserves version title, source URL, digitization source, and license metadata where available.</p>')
  [void]$aboutPage.AppendLine('          <p>No copyrighted English translations are imported into the source layer.</p>')
  [void]$aboutPage.AppendLine('        </section>')
  [void]$aboutPage.AppendLine('        <section class="home-section">')
  [void]$aboutPage.AppendLine('          <h2>Route HUD</h2>')
  [void]$aboutPage.AppendLine('          <p>Route rows retain per-source licensing and source-strength metadata. External definition rows, citable paraphrase rows, and workbench evidence rows stay separated for audit.</p>')
  [void]$aboutPage.AppendLine('          <p>Route HUD rows are study aids and source-indexed evidence. They are not polished English translations.</p>')
  [void]$aboutPage.AppendLine('        </section>')
  [void]$aboutPage.AppendLine('        <section class="home-section">')
  [void]$aboutPage.AppendLine('          <h2>Translation Status</h2>')
  [void]$aboutPage.AppendLine('          <p>No public Translation or Translator&rsquo;s Notes boxes are displayed on the site. Any future translation pass should remain separate from imported Hebrew source text and third-party lexical data.</p>')
  [void]$aboutPage.AppendLine('        </section>')
  [void]$aboutPage.AppendLine('      </div>')
  [void]$aboutPage.AppendLine('    </div>')
  [void]$aboutPage.AppendLine('  </main>')
  [void]$aboutPage.AppendLine('</body>')
  [void]$aboutPage.AppendLine('</html>')
  Write-Utf8 -Path 'about\index.html' -Content $aboutPage.ToString()

  Write-Utf8 -Path 'library\index.html' -Content (New-LibraryPageHtml -Sources $sources -HrefPrefix '../' -HomeHref '../' -AboutHref '../about/')
}

if ($OnlySitePages) {
  return
}

$renderSources = if ($targetWorkIds.Count -gt 0) {
  @($sources | Where-Object { $targetWorkIds -contains [string]$_.work_id })
} else {
  $sources
}

if ($OnlyLexicalPayloadFiles) {
  if ($SkipLexicalPayloadFiles) {
    throw 'OnlyLexicalPayloadFiles cannot be combined with SkipLexicalPayloadFiles.'
  }
  if ($OnlyOverlayExports) {
    throw 'OnlyLexicalPayloadFiles cannot be combined with OnlyOverlayExports.'
  }
  if ($OnlySitePages) {
    throw 'OnlyLexicalPayloadFiles cannot be combined with OnlySitePages.'
  }
  foreach ($source in $renderSources) {
    $workOccurrence = if ($lexicalCache.occurrences_by_work.ContainsKey([string]$source.work_id)) { $lexicalCache.occurrences_by_work[[string]$source.work_id] } else { $null }
    if ($null -eq $workOccurrence) { continue }
    $workLexicalPayload = Get-WorkLexicalPayload -WorkOccurrence $workOccurrence -LexicalCache $lexicalCache
    $rootHref = Get-RootHref -WorkSlug $source.work_slug
    [void](Write-WorkLexicalPayloadFiles -WorkId $source.work_id -WorkLexicalPayload $workLexicalPayload -RootHref $rootHref)
  }
  return
}

if ($OnlyOverlayExports -and $SkipOverlayExports) {
  throw 'OnlyOverlayExports cannot be combined with SkipOverlayExports.'
}

if ($OnlyOverlayExports -and $OnlySitePages) {
  throw 'OnlyOverlayExports cannot be combined with OnlySitePages.'
}

if ($OnlySitePages -and $SkipSitePages) {
  throw 'OnlySitePages cannot be combined with SkipSitePages.'
}

if (-not $SkipOverlayExports) {
  $overlaySources = @($sources)
  if ($targetWorkIds.Count -gt 0) {
    $targetWorkIdSet = @{}
    foreach ($workId in $targetWorkIds) {
      $targetWorkIdSet[[string]$workId] = $true
    }
    $overlaySources = @($sources | Where-Object { $targetWorkIdSet.ContainsKey([string]$_.work_id) })
  }

  foreach ($source in $overlaySources) {
    $overlay = Get-OverlayForSource -Source $source -OverlayDir $OverlayDir
    $exportRows = Get-OverlayExportRows -Source $source -Overlay $overlay
    Write-OverlayExports -WorkSlug $source.work_slug -Rows $exportRows
  }
}

if ($OnlyOverlayExports) {
  if (-not $SkipSitePages) {
    Write-FullSiteOverlayManifest -Sources $sources
  }
  return
}

foreach ($source in $renderSources) {
  $page = New-Object System.Text.StringBuilder
  $visibleUnits = if ($MaxUnits -gt 0) { @($source.units | Select-Object -First $MaxUnits) } else { @($source.units) }
  $rootHref = Get-RootHref -WorkSlug $source.work_slug
  $sourceNotes = New-Object System.Collections.Generic.List[object]
  $sourceNoteByKey = @{}
  foreach ($unit in @($source.units)) {
    $key = Get-SourceKey -Unit $unit
    if (-not $sourceNoteByKey.ContainsKey($key)) {
      $sourceNotes.Add([ordered]@{
        version_title = $unit.version_title
        version_source = $unit.version_source
        digitization = if ($unit.digitization) { $unit.digitization } else { $source.source_system }
        license = $unit.license
      })
      $sourceNoteByKey[$key] = $sourceNotes.Count
    }
  }
  $singleSourceNote = ($sourceNotes.Count -eq 1)
  $workOccurrence = if ($lexicalCache.occurrences_by_work.ContainsKey([string]$source.work_id)) { $lexicalCache.occurrences_by_work[[string]$source.work_id] } else { $null }
  $workHasLexical = ($null -ne $workOccurrence)
  $workLexicalPayload = $null
  $workLexicalExternal = if ($workHasLexical) {
    if ($SkipLexicalPayloadFiles) {
      $manifestRelative = "data/lexical/$($source.work_id).manifest.json"
      $occurrenceRelative = "data/lexical/occurrences/$($source.work_id).json"
      # Runtime HUD payloads must stay same-origin. Cross-domain raw GitHub URLs
      # are slower and can leave pages with plain, non-clickable Hebrew if blocked.
      $assetRoot = $rootHref
      [pscustomobject]@{
        work_id = $source.work_id
        work_slug = $source.work_slug
        work_title = $source.work_title
        manifest_url = "$rootHref$manifestRelative"
        occurrence_url = "$rootHref$occurrenceRelative"
        hud_route_lookup_manifest_url = "$($rootHref)data/definitions/hud-route-lookup/manifest.json"
        reader_hints_url = "$($rootHref)data/public-hud/$($source.work_id)/reader-hints.json"
        visible_display_slot_manifest_url = Get-VisibleDisplaySlotManifestUrl -WorkId $source.work_id -RootHref $rootHref
        reader_layout_mode = "prehud_rows"
        root_href = $assetRoot
      }
    } else {
      $workLexicalPayload = Get-WorkLexicalPayload -WorkOccurrence $workOccurrence -LexicalCache $lexicalCache
      Write-WorkLexicalPayloadFiles -WorkId $source.work_id -WorkLexicalPayload $workLexicalPayload -RootHref $rootHref
    }
  } else { $null }
  $workLexicalCounts = if ($workHasLexical -and $SkipLexicalPayloadFiles) {
    Get-JsonHeaderCounts -Path (Join-Path 'data/lexical/token-indexes' "$($source.work_slug).json")
  } else { $null }
  $hudTokenTotal = 0
  if ($workHasLexical) {
    $workLexicalForms = if ($null -ne $workLexicalPayload) { @($workLexicalPayload.token_index.forms) } else { @() }
    $hudTokenTotal = if ($null -ne $workLexicalCounts -and $null -ne $workLexicalCounts.total_unique_surface_forms) {
      [int]$workLexicalCounts.total_unique_surface_forms
    } else {
      $workLexicalForms.Count
    }
  }

  $pairedBaseSource = $null
  $pairedBaseLookup = @{}
  if ($source.work_type -eq 'commentary' -and $source.base_work_id -and $sourceById.ContainsKey([string]$source.base_work_id)) {
    $pairedBaseSource = $sourceById[[string]$source.base_work_id]
    $pairedBaseLookup = New-BaseUnitLookup -BaseSource $pairedBaseSource
  }

  $readerWorkbenchCssHref = if ($workHasLexical) { "$($rootHref)assets/css/reader-workbench.css" } else { '' }
  Append-SiteHead -Builder $page -Title $source.work_title -IncludeLexicalStyles:$workHasLexical -ReaderWorkbenchCssHref $readerWorkbenchCssHref
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <div class="shell">')
  [void]$page.AppendLine('      <div class="hero" id="work-top">')
  [void]$page.AppendLine('        <div class="hero-main">')
  [void]$page.AppendLine("          <p class=""crumbs""><a href=""$rootHref"">Home</a> &middot; <a href=""${rootHref}about/"">About / License</a></p>")
  [void]$page.AppendLine("          <h1>$(Encode-Html $source.work_title)<sup class=""hero-ref"">1</sup></h1>")
  if ($source.display_label) {
    [void]$page.AppendLine("          <p class=""work-label"">$(Encode-Html $source.display_label)</p>")
  }
  if ($source.work_type -eq 'commentary') {
    $baseImported = $false
    $baseHref = ''
    $baseTitle = if ($source.base_work_title) { [string]$source.base_work_title } else { 'Base Work' }
    if ($null -ne $pairedBaseSource) {
      $baseHref = "$rootHref$($pairedBaseSource.work_slug)/"
      $baseTitle = [string]$pairedBaseSource.work_title
      $baseImported = $true
    }
    $displayLabel = if ($source.display_label) { [string]$source.display_label } else { "Commentary on $baseTitle" }
    [void]$page.AppendLine('        <div class="paired-shell" aria-label="Commentary paired-text status">')
    [void]$page.AppendLine('          <section class="paired-panel">')
    [void]$page.AppendLine('            <h2>Base Text</h2>')
    if ($baseImported) {
      [void]$page.AppendLine("            <p><a href=""$baseHref"">Open $(Encode-Html $baseTitle)</a></p>")
      [void]$page.AppendLine('            <p class="placeholder">Matched base passages appear beside commentary rows when refs align.</p>')
    } else {
      [void]$page.AppendLine('            <p class="placeholder">[Base text not imported or not linked yet]</p>')
    }
    [void]$page.AppendLine('          </section>')
    [void]$page.AppendLine('          <section class="paired-panel">')
    [void]$page.AppendLine('            <h2>Commentary</h2>')
    [void]$page.AppendLine("            <p>$(Encode-Html $displayLabel)</p>")
    [void]$page.AppendLine('            <p class="placeholder">Rows without a matched base passage render as commentary-only.</p>')
    [void]$page.AppendLine('          </section>')
    [void]$page.AppendLine('        </div>')
  }
  [void]$page.AppendLine('          <p class="hero-summary">')
  [void]$page.AppendLine("            <span>$(@($source.units).Count) source units</span>")
  if ($hudTokenTotal -gt 0) {
    [void]$page.AppendLine("            <span>$hudTokenTotal HUD forms</span>")
  }
  [void]$page.AppendLine("            <span>imported $(Encode-Html $source.import_date)</span>")
  [void]$page.AppendLine('            <span>Words read right to left</span>')
  [void]$page.AppendLine('          </p>')
  [void]$page.AppendLine('        </div>')
  [void]$page.AppendLine('        <div class="hero-notes" aria-label="Header source notes">')
  [void]$page.AppendLine('          <ol>')
  if ($singleSourceNote) {
    [void]$page.AppendLine("            <li>$(Get-SourceSummaryHtml -Note $sourceNotes[0])</li>")
  } else {
    [void]$page.AppendLine("            <li>$($sourceNotes.Count) source/license notes; see footer table.</li>")
  }
  [void]$page.AppendLine('          </ol>')
  [void]$page.AppendLine('        </div>')
  if ($MaxUnits -gt 0) {
    [void]$page.AppendLine("        <p class=""fallback-note"">Fallback render active. Showing first $MaxUnits units only while route stability is verified.</p>")
  }
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('      <div class="reader-shell">')
  Append-WorkToc -Builder $page -Source $source -VisibleUnits $visibleUnits -WorkOccurrence $workOccurrence
  [void]$page.AppendLine('        <article>')

  $currentGroup = ''
  $currentSection = ''
  $currentChapter = ''
  foreach ($unit in $visibleUnits) {
    if ($unit.group_slug -ne $currentGroup) {
      $currentGroup = $unit.group_slug
      $currentSection = ''
      $currentChapter = ''
      if ($unit.group_title -ne $source.work_title -and $unit.group_slug -ne 'text') {
        $groupUnitsForBadge = @($visibleUnits | Where-Object { $_.group_slug -eq $unit.group_slug })
        $groupBadge = if (Test-UnitsHaveLexical -WorkOccurrence $workOccurrence -Units $groupUnitsForBadge) { ' <span class="hud-badge">Route HUD active</span>' } else { '' }
        [void]$page.AppendLine("          <h2 id=""group-$($unit.group_slug)"">$(Encode-Html $unit.group_title)$groupBadge</h2>")
      }
    }

    if ($unit.section_slug -ne $currentSection) {
      $currentSection = $unit.section_slug
      $currentChapter = ''
      if ($unit.section_title -ne $source.work_title -and $unit.section_slug -ne 'text') {
        $sectionUnitsForBadge = @($visibleUnits | Where-Object { $_.group_slug -eq $unit.group_slug -and $_.section_slug -eq $unit.section_slug })
        $sectionBadge = if (Test-UnitsHaveLexical -WorkOccurrence $workOccurrence -Units $sectionUnitsForBadge) { ' <span class="hud-badge">Route HUD active</span>' } else { '' }
        [void]$page.AppendLine("          <h3 id=""section-$($unit.group_slug)-$($unit.section_slug)"">$(Encode-Html $unit.section_title)$sectionBadge</h3>")
      }
    }

    if ($null -ne $unit.chapter_number -and $unit.chapter_number.ToString() -ne $currentChapter) {
      $currentChapter = $unit.chapter_number.ToString()
      [void]$page.AppendLine("          <h4 id=""chapter-$($unit.group_slug)-$($unit.section_slug)-$($unit.chapter_number)"">Chapter $($unit.chapter_number)</h4>")
    }

    $sourceNoteNumber = $sourceNoteByKey[(Get-SourceKey -Unit $unit)]
    $lexicalUnit = Get-LexicalUnitOccurrence -WorkOccurrence $workOccurrence -UnitId $unit.unit_id
    $lexicalAttrs = ''
    if ($null -ne $lexicalUnit) {
      $lexicalAttrs = ' data-lexical-unit'
    }
    $pairedBaseUnit = if ($pairedBaseLookup.Count -gt 0) { Get-PairedBaseUnit -Source $source -Unit $unit -BaseLookup $pairedBaseLookup } else { $null }
    $unitGridClass = if ($null -ne $pairedBaseUnit) { 'unit-grid paired-text-grid' } else { 'unit-grid' }

    [void]$page.AppendLine("          <section class=""unit"" id=""$($unit.anchor_id)"" data-unit$lexicalAttrs data-unit-id=""$(Encode-Html $unit.unit_id)"" data-source-ref=""$(Encode-Html $unit.source_ref)"">")
    [void]$page.AppendLine('            <div class="unit-head">')
    [void]$page.Append("              <div><h4 style=""margin:0;color:var(--text);text-transform:none;letter-spacing:0"">$(Encode-Html $unit.source_ref)")
    if (-not $singleSourceNote) {
      [void]$page.Append(" <span class=""source-note-index"">[$sourceNoteNumber]</span>")
    }
    [void]$page.AppendLine('</h4></div>')
    [void]$page.AppendLine("              <a class=""anchor"" href=""#$($unit.anchor_id)"" aria-label=""Copy link to $($unit.source_ref)"">#</a>")
    [void]$page.AppendLine('            </div>')
    [void]$page.AppendLine("            <div class=""$unitGridClass"">")
    if ($null -ne $pairedBaseUnit) {
      $pairedBaseRef = [string]$pairedBaseUnit.source_ref
      [void]$page.AppendLine('              <div class="paired-text-column base-side">')
      [void]$page.AppendLine("                <p class=""paired-label"">Base text &middot; <a href=""$rootHref$($pairedBaseSource.work_slug)/#$($pairedBaseUnit.anchor_id)"">$(Encode-Html $pairedBaseRef)</a></p>")
      foreach ($paragraph in @($pairedBaseUnit.hebrew)) {
        [void]$page.AppendLine("                <p class=""hebrew"" lang=""he"" dir=""rtl"">$(Convert-SourceHtml $paragraph)</p>")
      }
      [void]$page.AppendLine('              </div>')
      [void]$page.AppendLine('              <div class="paired-text-column commentary-side">')
      [void]$page.AppendLine('                <p class="paired-label">Commentary</p>')
    } else {
      [void]$page.AppendLine('              <div>')
    }
    if ($null -ne $lexicalUnit) {
      $hebrewParagraphs = @($unit.hebrew)
      for ($paragraphIndex = 0; $paragraphIndex -lt $hebrewParagraphs.Count; $paragraphIndex += 1) {
        [void]$page.AppendLine("                <p class=""hebrew lexical-inline"" lang=""he"" dir=""rtl"" data-lexical-paragraph=""$paragraphIndex"">$(Convert-SourceHtml $hebrewParagraphs[$paragraphIndex])</p>")
      }
    } else {
      foreach ($paragraph in @($unit.hebrew)) {
        [void]$page.AppendLine("                <p class=""hebrew"" lang=""he"" dir=""rtl"">$(Convert-SourceHtml $paragraph)</p>")
      }
    }
    [void]$page.AppendLine('              </div>')
    [void]$page.AppendLine('            </div>')
    if ($null -ne $lexicalUnit) {
      [void]$page.AppendLine('            <div class="lexical-slot" data-lexical-slot></div>')
    }
    $parentAnchor = Get-UnitParentAnchor -Unit $unit -Source $source
    [void]$page.AppendLine('            <nav class="unit-nav" aria-label="Unit navigation">')
    [void]$page.AppendLine('              <a href="#work-top">Back to top</a>')
    [void]$page.AppendLine("              <a href=""#$parentAnchor"">Back to chapter/section start</a>")
    [void]$page.AppendLine('            </nav>')
    [void]$page.AppendLine('          </section>')
  }

  if (-not $singleSourceNote) {
    [void]$page.AppendLine('          <h2>Source Notes</h2>')
    [void]$page.AppendLine('          <table class="source-table">')
    [void]$page.AppendLine('            <thead><tr><th>#</th><th>Hebrew Version</th><th>Version Source</th><th>Digitization</th><th>License</th></tr></thead>')
    [void]$page.AppendLine('            <tbody>')
    for ($i = 0; $i -lt $sourceNotes.Count; $i += 1) {
      $note = $sourceNotes[$i]
      $versionSource = if ($note.version_source) { "<a href=""$(Encode-Html $note.version_source)"">$(Encode-Html (Get-VersionSourceLabel $note.version_source))</a>" } else { '' }
      [void]$page.AppendLine("              <tr><td>[$($i + 1)]</td><td>$(Encode-Html $note.version_title)</td><td>$versionSource</td><td>$(Encode-Html $note.digitization)</td><td>$(Encode-Html $note.license)</td></tr>")
    }
    [void]$page.AppendLine('            </tbody>')
    [void]$page.AppendLine('          </table>')
  }

  if ($workHasLexical) {
    Append-WorkLexicalDownloadLinks -Builder $page -Source $source -RootHref $rootHref -WorkLexicalExternal $workLexicalExternal -AssetBaseUrl $LexicalAssetBaseUrl
  }

  [void]$page.AppendLine('        </article>')
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </main>')
  if ($workHasLexical) {
    [void]$page.AppendLine('  <section class="reader-workbench-panel" data-reader-workbench hidden aria-live="polite">')
    [void]$page.AppendLine('    <div class="reader-workbench-head"><h3>Reader Workbench</h3><span class="reader-workbench-status" data-reader-status>0 selected glosses | not_a_translation</span></div>')
    [void]$page.AppendLine('    <p class="reader-workbench-assembly" data-reader-assembly></p>')
    [void]$page.AppendLine('    <div class="reader-workbench-actions"><button class="reader-workbench-button" type="button" data-reader-export>Export study sheet</button><button class="reader-workbench-button" type="button" data-reader-import>Import study sheet</button><input type="file" accept="application/json" data-reader-import-file hidden></div>')
    [void]$page.AppendLine('  </section>')
    [void]$page.AppendLine('  <section class="lexical-hud" data-lexical-hud hidden role="dialog" aria-labelledby="route-hud-title" tabindex="-1">')
    [void]$page.AppendLine('    <div class="hud-head"><h2 id="route-hud-title">Route HUD</h2><button class="hud-close" type="button" data-hud-close aria-label="Close route HUD">Close</button></div>')
    [void]$page.AppendLine('    <div class="route-hud-panel" data-route-hud-panel id="route-hud-panel" aria-live="polite">')
    [void]$page.AppendLine('      <p class="placeholder">Click a Hebrew form to load route cards.</p>')
    [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </section>')
    if ($null -ne $workLexicalExternal) {
      $lexicalConfigJson = (ConvertTo-Json -InputObject $workLexicalExternal -Depth 10 -Compress) -replace '</script', '<\/script'
      $occurrenceUrl = [System.Net.WebUtility]::HtmlEncode([string]$workLexicalExternal.occurrence_url)
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-occurrences data-src=""$occurrenceUrl"">{}</script>")
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-config>$lexicalConfigJson</script>")
    } else {
      $occurrenceJson = (ConvertTo-Json -InputObject $workOccurrence -Depth 30 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-occurrences>$occurrenceJson</script>")
      $lexicalConfigJson = (ConvertTo-Json -InputObject ([pscustomobject]@{
        root_href = $rootHref
        work_id = $source.work_id
        work_slug = $source.work_slug
        work_title = $source.work_title
        hud_route_lookup_manifest_url = "$($rootHref)data/definitions/hud-route-lookup/manifest.json"
        reader_hints_url = "$($rootHref)data/public-hud/$($source.work_id)/reader-hints.json"
        visible_display_slot_manifest_url = Get-VisibleDisplaySlotManifestUrl -WorkId $source.work_id -RootHref $rootHref
        reader_layout_mode = "prehud_rows"
      }) -Depth 10 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-config>$lexicalConfigJson</script>")
      $tokenIndexJson = (ConvertTo-Json -InputObject $workLexicalPayload.token_index -Depth 30 -Compress) -replace '</script', '<\/script'
      $lexiconJson = (ConvertTo-Json -InputObject $workLexicalPayload.lexicon -Depth 30 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-token-index>$tokenIndexJson</script>")
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-lexicon>$lexiconJson</script>")
    }
  }
  if ($workHasLexical) {
    $hudRuntimeContractMarkers = @(
      'selectRouteAnswer',
      'lookupCandidateTreatments',
      'article.dataset.rankBasis',
      'span.dataset.lexicalSurface',
      'sourceRowHasPublicFields',
      'selectionContractErrors',
      'canSaveGlossSelection',
      'Evidence only',
      'Reader Workbench import rejected',
      'aria-haspopup", "dialog"',
      'aria-controls", "route-hud-panel"',
      'aria-expanded", "false"',
      'Definition',
      'Strict Hebrew matches',
      'Strict Aramaic matches',
      'Lemma matches',
      'Word-part breakdown',
      'Citable definition/paraphrase matches',
      'Usage evidence',
      'observed usage only',
      'Sources and licenses',
      'answer_eligible',
      'answer_role',
      'prefix-stripped candidate',
      'plural-suffix candidate',
      'possessive-suffix candidate',
      'maqaf component',
      'closeRouteHud',
      'restoreFocus',
      'buttonToRestore.focus',
      'Escape',
      'hud.focus'
    )
    [void]$page.AppendLine('  <script type="text/plain" data-hud-runtime-contract>')
    foreach ($marker in $hudRuntimeContractMarkers) {
      [void]$page.AppendLine("    $marker")
    }
    [void]$page.AppendLine('  </script>')
    [void]$page.AppendLine("  <script src=""$($rootHref)assets/js/reader-workbench.js?v=visible-na-3916cf24""></script>")
  }
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')

  Write-Utf8 -Path "$($source.work_slug)\index.html" -Content $page.ToString()
}

if (-not $SkipOverlayExports -and $targetWorkIds.Count -eq 0) {
  Write-FullSiteOverlayManifest -Sources $sources
}
