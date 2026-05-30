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
    [switch]$IncludeLexicalStyles
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
  [void]$Builder.AppendLine('    .hero { min-width: 0; padding: 22px 22px 18px; border-bottom: 1px solid var(--line); overflow-wrap: anywhere; }')
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
    [void]$Builder.AppendLine('    .lexical-word { display: inline; max-width: 100%; margin: 0 0.08em; padding: 0.04em 0.08em; border: 1px solid transparent; border-radius: 7px; color: var(--hebrew); background: transparent; font: inherit; cursor: pointer; direction: inherit; unicode-bidi: normal; overflow-wrap: anywhere; word-break: break-word; }')
    [void]$Builder.AppendLine('    .lexical-word:hover, .lexical-word:focus-visible, .lexical-word[aria-pressed="true"] { border-color: var(--accent); background: rgba(214,190,138,0.1); outline: none; }')
    [void]$Builder.AppendLine('    .hud-badge { display: inline-block; margin-left: 0.45rem; padding: 1px 6px; border: 1px solid var(--line-2); border-radius: 999px; color: var(--accent); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; vertical-align: middle; }')
    [void]$Builder.AppendLine('    .lexical-slot { margin-top: 16px; }')
    [void]$Builder.AppendLine('    .lexical-hud { position: fixed; z-index: 1000; max-width: min(560px, calc(100vw - 24px)); border: 1px solid var(--line); background: var(--panel-2); padding: 18px; box-shadow: 0 18px 60px rgba(0,0,0,0.42); overflow: auto; }')
    [void]$Builder.AppendLine('    .lexical-hud[hidden] { display: none; }')
    [void]$Builder.AppendLine('    .hud-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 14px; }')
    [void]$Builder.AppendLine('    .hud-head h2 { margin: 0; font-size: 1.1rem; color: var(--text); }')
    [void]$Builder.AppendLine('    .hud-close { border: 1px solid var(--line-2); background: transparent; color: var(--muted); padding: 4px 8px; font: inherit; cursor: pointer; }')
    [void]$Builder.AppendLine('    .hud-close:hover { color: var(--text); border-color: var(--accent); }')
    [void]$Builder.AppendLine('    .lexical-fields { display: grid; grid-template-columns: minmax(140px, 220px) 1fr; gap: 10px 18px; margin: 0; }')
    [void]$Builder.AppendLine('    .lexical-field-row { display: contents; }')
    [void]$Builder.AppendLine('    .lexical-field-row[hidden] { display: none; }')
    [void]$Builder.AppendLine('    .lexical-fields dt { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.78rem; }')
    [void]$Builder.AppendLine('    .lexical-fields dd { margin: 0; color: var(--text); }')
    [void]$Builder.AppendLine('    .lexical-fields ul { margin: 0; padding-left: 18px; }')
    [void]$Builder.AppendLine('    .breakdown-list { display: grid; gap: 8px; }')
    [void]$Builder.AppendLine('    .breakdown-row { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 8px; }')
    [void]$Builder.AppendLine('    .breakdown-row strong { color: var(--hebrew); font-weight: 400; }')
    [void]$Builder.AppendLine('    .breakdown-row p { margin: 0 0 4px; }')
    [void]$Builder.AppendLine('    .lexical-entry-list, .claim-row-list { display: grid; gap: 10px; }')
    [void]$Builder.AppendLine('    .lexical-context-note { margin: 0 0 10px; color: var(--muted); font-size: 0.9rem; }')
    [void]$Builder.AppendLine('    .lexical-entry { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 10px; }')
    [void]$Builder.AppendLine('    .lexical-entry h3 { margin: 0 0 6px; color: var(--text); font-size: 0.94rem; font-weight: 400; }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-hebrew { color: var(--hebrew); }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-meta { margin: 0 0 6px; color: var(--muted); font-size: 0.86rem; }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-label { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }')
    [void]$Builder.AppendLine('    .claim-row { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 10px; display: grid; gap: 5px; min-width: 0; overflow-wrap: anywhere; }')
    [void]$Builder.AppendLine('    .claim-row-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }')
    [void]$Builder.AppendLine('    .claim-status { border: 1px solid var(--line-2); border-radius: 999px; color: var(--accent); padding: 1px 7px; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }')
    [void]$Builder.AppendLine('    .claim-hebrew { color: var(--hebrew); font-size: 1.1rem; }')
    [void]$Builder.AppendLine('    .claim-transliteration, .claim-source, .claim-license { color: var(--muted); font-size: 0.86rem; margin: 0; }')
    [void]$Builder.AppendLine('    .claim-renderings { color: var(--text); margin: 0; }')
    [void]$Builder.AppendLine('    .other-entries { margin-top: 12px; }')
    [void]$Builder.AppendLine('    .claim-row-list details { margin-top: 8px; }')
    [void]$Builder.AppendLine('    .source-details { margin-top: 16px; }')
    [void]$Builder.AppendLine('    .source-row { border-top: 1px solid var(--line); padding: 12px 0; }')
    [void]$Builder.AppendLine('    .source-row:first-child { border-top: 0; }')
    [void]$Builder.AppendLine('    .source-row strong { color: var(--text); font-weight: 400; }')
    [void]$Builder.AppendLine('    .source-claim { color: var(--text); margin: 0 0 6px; }')
    [void]$Builder.AppendLine('    .source-claim span { color: var(--hebrew); }')
  }
  [void]$Builder.AppendLine('    .source-citation { overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    .source-note-index { color: var(--accent); font-size: 0.82rem; margin-left: 6px; }')
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
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .unit-grid.paired-text-grid, .lexical-fields, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  } else {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .unit-grid.paired-text-grid, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  }
  [void]$Builder.AppendLine('  </style>')
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
  [void]$Builder.AppendLine('      const sourceRows = new Map();')
  [void]$Builder.AppendLine('      let manifestPromise = null;')
  [void]$Builder.AppendLine('      const hud = document.querySelector("[data-lexical-hud]");')
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
  [void]$Builder.AppendLine("      const normalizeHebrewDisplay = (value) => typeof value === ""string"" ? value.replace(/([\u0590-\u05FF])'/g, ""`$1$geresh"").replace(/([\u0590-\u05FF])\""(?=[\u0590-\u05FF])/g, ""`$1$gershayim"") : value;")
  [void]$Builder.AppendLine('      const hebrewTokenPattern = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4\x27\x22]*/gu;')
  [void]$Builder.AppendLine('      const makeWordSpan = (text, tokenIndexId, ordinal) => {')
  [void]$Builder.AppendLine('        const span = document.createElement("span");')
  [void]$Builder.AppendLine('        span.className = "lexical-word";')
  [void]$Builder.AppendLine('        span.lang = "he";')
  [void]$Builder.AppendLine('        span.role = "button";')
  [void]$Builder.AppendLine('        span.tabIndex = 0;')
  [void]$Builder.AppendLine('        span.dataset.lexicalToken = `${tokenIndexId}-${ordinal}`;')
  [void]$Builder.AppendLine('        span.dataset.lexicalIndex = tokenIndexId || "";')
  [void]$Builder.AppendLine('        span.dataset.lexicalEntry = "";')
  [void]$Builder.AppendLine('        span.dataset.lexicalStatus = "pending";')
  [void]$Builder.AppendLine('        span.setAttribute("aria-pressed", "false");')
  [void]$Builder.AppendLine('        span.textContent = normalizeHebrewDisplay(text);')
  [void]$Builder.AppendLine('        return span;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const wrapTextNode = (node, tokenIds, state) => {')
  [void]$Builder.AppendLine('        const text = node.nodeValue;')
  [void]$Builder.AppendLine('        const matches = Array.from(text.matchAll(hebrewTokenPattern));')
  [void]$Builder.AppendLine('        if (!matches.length) return;')
  [void]$Builder.AppendLine('        const fragment = document.createDocumentFragment();')
  [void]$Builder.AppendLine('        let position = 0;')
  [void]$Builder.AppendLine('        matches.forEach((match) => {')
  [void]$Builder.AppendLine('          if (match.index > position) fragment.appendChild(document.createTextNode(text.slice(position, match.index)));')
  [void]$Builder.AppendLine('          const tokenIndexId = tokenIds[state.index++];')
  [void]$Builder.AppendLine('          fragment.appendChild(tokenIndexId ? makeWordSpan(match[0], tokenIndexId, state.index) : document.createTextNode(match[0]));')
  [void]$Builder.AppendLine('          position = match.index + match[0].length;')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        if (position < text.length) fragment.appendChild(document.createTextNode(text.slice(position)));')
  [void]$Builder.AppendLine('        node.parentNode.replaceChild(fragment, node);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const wrapParagraph = (paragraph, tokenIds) => {')
  [void]$Builder.AppendLine('        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);')
  [void]$Builder.AppendLine('        const textNodes = [];')
  [void]$Builder.AppendLine('        while (walker.nextNode()) textNodes.push(walker.currentNode);')
  [void]$Builder.AppendLine('        const state = { index: 0 };')
  [void]$Builder.AppendLine('        textNodes.forEach((node) => wrapTextNode(node, tokenIds, state));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const loadedOccurrences = await loadOccurrences();')
  [void]$Builder.AppendLine('      document.querySelectorAll("[data-lexical-unit]").forEach((unit) => {')
  [void]$Builder.AppendLine('        const unitData = loadedOccurrences.units ? loadedOccurrences.units[unit.id] : null;')
  [void]$Builder.AppendLine('        if (!unitData) return;')
  [void]$Builder.AppendLine('        unit.querySelectorAll("[data-lexical-paragraph]").forEach((paragraph) => {')
  [void]$Builder.AppendLine('          const paragraphIndex = Number(paragraph.dataset.lexicalParagraph);')
  [void]$Builder.AppendLine('          const paragraphData = (unitData.paragraphs || []).find((item) => Number(item.paragraph_index) === paragraphIndex);')
  [void]$Builder.AppendLine('          wrapParagraph(paragraph, paragraphData ? (paragraphData.token_index_ids || []) : []);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      const buttons = Array.from(document.querySelectorAll("[data-lexical-token]"));')
  [void]$Builder.AppendLine('      if (!buttons.length || !hud) return;')
  [void]$Builder.AppendLine('      let activeHudButton = null;')
  [void]$Builder.AppendLine('      if (hud.parentElement !== document.body) document.body.appendChild(hud);')
  [void]$Builder.AppendLine('      const positionHudNearButton = (button) => {')
  [void]$Builder.AppendLine('        if (!button || hud.hidden) return;')
  [void]$Builder.AppendLine('        const rect = button.getBoundingClientRect();')
  [void]$Builder.AppendLine('        const margin = 12;')
  [void]$Builder.AppendLine('        const width = Math.min(560, Math.max(280, window.innerWidth - margin * 2));')
  [void]$Builder.AppendLine('        hud.style.width = width + "px";')
  [void]$Builder.AppendLine('        const preferredLeft = rect.right - width;')
  [void]$Builder.AppendLine('        const left = Math.min(Math.max(margin, preferredLeft), window.innerWidth - width - margin);')
  [void]$Builder.AppendLine('        const below = window.innerHeight - rect.bottom - margin;')
  [void]$Builder.AppendLine('        const above = rect.top - margin;')
  [void]$Builder.AppendLine('        const openAbove = below < 280 && above > below;')
  [void]$Builder.AppendLine('        const available = Math.max(220, (openAbove ? above : below) - margin);')
  [void]$Builder.AppendLine('        hud.style.maxHeight = Math.min(560, available) + "px";')
  [void]$Builder.AppendLine('        const measuredHeight = Math.min(hud.offsetHeight || 320, Math.min(560, available));')
  [void]$Builder.AppendLine('        const rawTop = openAbove ? rect.top - measuredHeight - margin : rect.bottom + margin;')
  [void]$Builder.AppendLine('        const top = Math.min(Math.max(margin, rawTop), window.innerHeight - measuredHeight - margin);')
  [void]$Builder.AppendLine('        hud.style.left = left + "px";')
  [void]$Builder.AppendLine('        hud.style.top = top + "px";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const scheduleHudPosition = () => {')
  [void]$Builder.AppendLine('        if (!activeHudButton || hud.hidden) return;')
  [void]$Builder.AppendLine('        window.requestAnimationFrame(() => positionHudNearButton(activeHudButton));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const setText = (root, selector, value) => {')
  [void]$Builder.AppendLine('        const node = root.querySelector(selector);')
  [void]$Builder.AppendLine('        if (node) node.textContent = normalizeHebrewDisplay(value) || "N/A";')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const setList = (root, selector, value) => {')
  [void]$Builder.AppendLine('        const node = root.querySelector(selector);')
  [void]$Builder.AppendLine('        if (!node) return;')
  [void]$Builder.AppendLine('        const values = Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);')
  [void]$Builder.AppendLine('        node.replaceChildren();')
  [void]$Builder.AppendLine('        if (!values.length) { node.textContent = "N/A"; return; }')
  [void]$Builder.AppendLine('        if (values.length === 1) { node.textContent = values[0]; return; }')
  [void]$Builder.AppendLine('        const ul = document.createElement("ul");')
  [void]$Builder.AppendLine('        values.forEach((value) => { const li = document.createElement("li"); li.textContent = value; ul.appendChild(li); });')
  [void]$Builder.AppendLine('        node.appendChild(ul);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const setRowHidden = (root, selector, hidden) => {')
  [void]$Builder.AppendLine('        const row = root.querySelector(selector);')
  [void]$Builder.AppendLine('        if (row) row.hidden = Boolean(hidden);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const cleanValues = (values) => Array.isArray(values) ? values.filter(Boolean) : (values ? [values] : []);')
  [void]$Builder.AppendLine('      const normalizeStrictRendering = (value) => String(value || "").trim().replace(/\s+/g, " ").replace(/\.$/, "");')
  [void]$Builder.AppendLine('      const cleanStrictRenderings = (values) => {')
  [void]$Builder.AppendLine('        const raw = cleanValues(values).map(normalizeStrictRendering).filter(Boolean);')
  [void]$Builder.AppendLine('        const explanatorySet = raw.some((value) => /[()]|^usually\b|^specifically\b|i\.e\.|by implication|transitively|and hence/i.test(value));')
  [void]$Builder.AppendLine('        return [...new Set(raw.filter((value) => {')
  [void]$Builder.AppendLine('          if (value.length > 64) return false;')
  [void]$Builder.AppendLine('          if (/[()]/.test(value)) return false;')
  [void]$Builder.AppendLine('          if (/^(usually|specifically|i\.e\.|by implication|transitively|and hence|aloud)$/i.test(value)) return false;')
  [void]$Builder.AppendLine('          if (explanatorySet && /^(priest|saint|king)$/i.test(value)) return false;')
  [void]$Builder.AppendLine('          return true;')
  [void]$Builder.AppendLine('        }))];')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const uniqueValues = (values) => [...new Set(cleanValues(values))];')
  [void]$Builder.AppendLine('      const getStrictRenderings = (view) => cleanStrictRenderings([...(view.surface_renderings || []), ...(view.strict_renderings || [])]);')
  [void]$Builder.AppendLine('      const normalizeHebrewKey = (value) => normalizeHebrewDisplay(String(value || "")).normalize("NFC").replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, "").replace(/\u05DA/g, "\u05DB").replace(/\u05DD/g, "\u05DE").replace(/\u05DF/g, "\u05E0").replace(/\u05E3/g, "\u05E4").replace(/\u05E5/g, "\u05E6");')
  [void]$Builder.AppendLine('      const entryHaystack = (entry) => [entry.source_name, entry.relation_label, entry.language, entry.language_code, entry.register].filter(Boolean).join(" ").toLowerCase();')
  [void]$Builder.AppendLine('      const isAramaicEntry = (entry) => entryHaystack(entry).includes("aramaic") || entryHaystack(entry).includes("aram-") || entryHaystack(entry).includes("project_aramaic");')
  [void]$Builder.AppendLine('      const isAramaicView = (view) => {')
  [void]$Builder.AppendLine('        const haystack = [view.match_method, view.source_name, view.context_note, view.surface_context_note, view.lexical_language, view.language, view.language_code, view.register].filter(Boolean).join(" ").toLowerCase();')
  [void]$Builder.AppendLine('        if (haystack.includes("aramaic") || haystack.includes("aram-") || haystack.includes("project_aramaic")) return true;')
  [void]$Builder.AppendLine('        return cleanValues(view.possible_entries).some((entry) => entry.context_role === "likely_contextual" && isAramaicEntry(entry));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const strictEntriesForView = (view) => {')
  [void]$Builder.AppendLine('        const likelyEntries = cleanValues(view.possible_entries).filter((entry) => entry.context_role === "likely_contextual");')
  [void]$Builder.AppendLine('        const exactCleanEntries = cleanValues(view.possible_entries).filter((entry) => entry.source_family !== "kaikki" && entry.source_family !== "wiktionary" && (normalizeHebrewKey(entry.match_key) === view.normalized_word || normalizeHebrewKey(entry.lemma) === view.normalized_word));')
  [void]$Builder.AppendLine('        return [...likelyEntries, ...exactCleanEntries].filter((entry, index, entries) => {')
  [void]$Builder.AppendLine('          const key = entry.entry_key || `${entry.source_family || ""}|${entry.source_id || ""}|${entry.lemma || ""}|${entry.match_key || ""}`;')
  [void]$Builder.AppendLine('          return entries.findIndex((candidate) => (candidate.entry_key || `${candidate.source_family || ""}|${candidate.source_id || ""}|${candidate.lemma || ""}|${candidate.match_key || ""}`) === key) === index;')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const getStrictBuckets = (view) => {')
  [void]$Builder.AppendLine('        const topLevel = getStrictRenderings(view);')
  [void]$Builder.AppendLine('        const strictEntries = strictEntriesForView(view);')
  [void]$Builder.AppendLine('        const hebrewLikely = cleanStrictRenderings(strictEntries.filter((entry) => !isAramaicEntry(entry)).flatMap((entry) => entry.strict_renderings || []));')
  [void]$Builder.AppendLine('        const aramaicLikely = cleanStrictRenderings(strictEntries.filter(isAramaicEntry).flatMap((entry) => entry.strict_renderings || []));')
  [void]$Builder.AppendLine('        const lemmaLikely = cleanStrictRenderings(strictEntries.flatMap((entry) => entry.strict_renderings || []));')
  [void]$Builder.AppendLine('        if (isAramaicView(view)) return { hebrew: hebrewLikely.length && aramaicLikely.length ? hebrewLikely : [], aramaic: uniqueValues([...topLevel, ...aramaicLikely]), lemma: lemmaLikely };')
  [void]$Builder.AppendLine('        return { hebrew: uniqueValues([...topLevel, ...hebrewLikely]), aramaic: aramaicLikely, lemma: lemmaLikely };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const strictEntryKeys = (view) => {')
  [void]$Builder.AppendLine('        return new Set(strictEntriesForView(view).map((entry) => entry.entry_key).filter(Boolean));')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const appendRenderings = (node, values) => {')
  [void]$Builder.AppendLine('        const filtered = Array.isArray(values) ? values.filter(Boolean) : [];')
  [void]$Builder.AppendLine('        if (!filtered.length) { node.append("N/A"); return; }')
  [void]$Builder.AppendLine('        if (filtered.length === 1) { node.append(filtered[0]); return; }')
  [void]$Builder.AppendLine('        const ul = document.createElement("ul");')
  [void]$Builder.AppendLine('        filtered.forEach((value) => { const li = document.createElement("li"); li.textContent = value; ul.appendChild(li); });')
  [void]$Builder.AppendLine('        node.appendChild(ul);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderBreakdown = (root, view) => {')
  [void]$Builder.AppendLine('        const node = root.querySelector("[data-hud-breakdown]");')
  [void]$Builder.AppendLine('        if (!node) return;')
  [void]$Builder.AppendLine('        node.replaceChildren();')
  [void]$Builder.AppendLine('        const rows = Array.isArray(view.breakdown) ? view.breakdown : [];')
  [void]$Builder.AppendLine('        setRowHidden(root, "[data-hud-breakdown-row]", !rows.length);')
  [void]$Builder.AppendLine('        if (!rows.length) { node.textContent = ""; return; }')
  [void]$Builder.AppendLine('        const list = document.createElement("div");')
  [void]$Builder.AppendLine('        list.className = "breakdown-list";')
  [void]$Builder.AppendLine('        rows.forEach((row) => {')
  [void]$Builder.AppendLine('          const section = document.createElement("section");')
  [void]$Builder.AppendLine('          section.className = "breakdown-row";')
  [void]$Builder.AppendLine('          const head = document.createElement("p");')
  [void]$Builder.AppendLine('          const hebrew = document.createElement("strong");')
  [void]$Builder.AppendLine('          hebrew.lang = "he";')
  [void]$Builder.AppendLine('          hebrew.dir = "rtl";')
  [void]$Builder.AppendLine('          hebrew.textContent = normalizeHebrewDisplay(row.hebrew || "");')
  [void]$Builder.AppendLine('          head.appendChild(hebrew);')
  [void]$Builder.AppendLine('          section.appendChild(head);')
  [void]$Builder.AppendLine('          const renderings = document.createElement("div");')
  [void]$Builder.AppendLine('          appendRenderings(renderings, row.strict_renderings || []);')
  [void]$Builder.AppendLine('          section.appendChild(renderings);')
  [void]$Builder.AppendLine('          list.appendChild(section);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        node.appendChild(list);')
  [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const isRelatedEntry = (entry) => {')
      [void]$Builder.AppendLine('        const relation = String(entry.relation_label || "").toLowerCase();')
      [void]$Builder.AppendLine('        return entry.context_role === "related" || relation.includes("related") || relation.includes("cognate") || relation.includes("root-field");')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const entryMatchesClickedForm = (entry, view) => normalizeHebrewKey(entry.match_key) === view.normalized_word || normalizeHebrewKey(entry.lemma) === view.normalized_word;')
      [void]$Builder.AppendLine('      const isNoisyAlternateEntry = (entry) => {')
      [void]$Builder.AppendLine('        const text = cleanValues(entry.strict_renderings).join(" ").toLowerCase();')
      [void]$Builder.AppendLine('        return /(maid|slave|bondmaid|cubit|forearm|middle finger|door-base|\bnut\b|llama|\blama\b|hill|shrub|bush|plant|shoot)/i.test(text);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const renderEntryList = (entries, roleLabel) => {')
  [void]$Builder.AppendLine('        const list = document.createElement("div");')
  [void]$Builder.AppendLine('        list.className = "lexical-entry-list";')
  [void]$Builder.AppendLine('        const groupedEntries = new Map();')
  [void]$Builder.AppendLine('        entries.forEach((entry) => {')
  [void]$Builder.AppendLine('          const spelling = entry.lemma || entry.match_key || "N/A";')
  [void]$Builder.AppendLine('          const key = `${entry.context_role || "entry"}|${spelling}`;')
  [void]$Builder.AppendLine('          if (!groupedEntries.has(key)) groupedEntries.set(key, { spelling, context_role: entry.context_role || "other_possible", relation_label: entry.relation_label || "", source_refs: [], strict_renderings: [] });')
  [void]$Builder.AppendLine('          const group = groupedEntries.get(key);')
  [void]$Builder.AppendLine('          group.source_refs.push(`${entry.source_name || "source N/A"} ${entry.source_id || ""}`.trim());')
      [void]$Builder.AppendLine('          cleanStrictRenderings(entry.strict_renderings || []).forEach((rendering) => { if (rendering && !group.strict_renderings.includes(rendering)) group.strict_renderings.push(rendering); });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        const sorted = [...groupedEntries.values()].sort((a, b) => (a.context_role === "likely_contextual" ? -1 : 1) - (b.context_role === "likely_contextual" ? -1 : 1));')
  [void]$Builder.AppendLine('        sorted.forEach((entry) => {')
  [void]$Builder.AppendLine('          const card = document.createElement("section");')
  [void]$Builder.AppendLine('          card.className = "lexical-entry";')
  [void]$Builder.AppendLine('          const title = document.createElement("h3");')
  [void]$Builder.AppendLine('          const role = roleLabel || (entry.context_role === "likely_contextual" ? "Contextual entry" : (isRelatedEntry(entry) ? "Related option" : "Potential option"));')
  [void]$Builder.AppendLine('          title.append(role, ": ");')
  [void]$Builder.AppendLine('          const spelling = document.createElement("span");')
  [void]$Builder.AppendLine('          spelling.className = "entry-hebrew";')
  [void]$Builder.AppendLine('          spelling.lang = "he";')
  [void]$Builder.AppendLine('          spelling.dir = "rtl";')
  [void]$Builder.AppendLine('          spelling.textContent = normalizeHebrewDisplay(entry.spelling);')
  [void]$Builder.AppendLine('          title.appendChild(spelling);')
  [void]$Builder.AppendLine('          const meta = document.createElement("p");')
  [void]$Builder.AppendLine('          meta.className = "entry-meta";')
  [void]$Builder.AppendLine('          const relation = entry.relation_label ? ` | ${entry.relation_label}` : "";')
  [void]$Builder.AppendLine('          meta.textContent = `${[...new Set(entry.source_refs)].join(" | ") || "source N/A"}${relation}`;')
  [void]$Builder.AppendLine('          const renderings = document.createElement("div");')
  [void]$Builder.AppendLine('          const renderLabel = document.createElement("p");')
  [void]$Builder.AppendLine('          renderLabel.className = "entry-label";')
  [void]$Builder.AppendLine('          renderLabel.textContent = "Strict renderings";')
  [void]$Builder.AppendLine('          renderings.appendChild(renderLabel);')
  [void]$Builder.AppendLine('          appendRenderings(renderings, entry.strict_renderings || []);')
  [void]$Builder.AppendLine('          card.append(title, meta, renderings);')
  [void]$Builder.AppendLine('          list.appendChild(card);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        return list;')
  [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const sourceRowKey = (row) => `${row.source_family || ""}|${row.source_id || ""}`;')
      [void]$Builder.AppendLine('      const sourceRowsByKey = (view) => {')
      [void]$Builder.AppendLine('        const map = new Map();')
      [void]$Builder.AppendLine('        [...cleanValues(view.source_rows), ...cleanValues(view.secondary_source_rows)].forEach((row) => { const key = sourceRowKey(row); if (key !== "|") map.set(key, row); });')
      [void]$Builder.AppendLine('        return map;')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const sourceRowsForEntry = (view, entry) => {')
      [void]$Builder.AppendLine('        const map = sourceRowsByKey(view);')
      [void]$Builder.AppendLine('        const row = map.get(`${entry.source_family || ""}|${entry.source_id || ""}`);')
      [void]$Builder.AppendLine('        return row ? [row] : [];')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const cleanTransliteration = (value) => {')
      [void]$Builder.AppendLine('        const text = String(value || "").trim();')
      [void]$Builder.AppendLine('        return /^[A-Za-z0-9 .,\-ʻʿʾʼ()]+$/.test(text) && text.length <= 80 ? text : "";')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const clampScore = (value, min = 0, max = 99) => Math.max(min, Math.min(max, Math.round(value)));')
      [void]$Builder.AppendLine('      const sourceQualityScore = (rows) => {')
      [void]$Builder.AppendLine('        const families = cleanValues(rows).map((row) => String(row.source_family || "").toLowerCase());')
      [void]$Builder.AppendLine('        const sourceIds = cleanValues(rows).map((row) => String(row.source_id || "").toLowerCase());')
      [void]$Builder.AppendLine('        const licenses = cleanValues(rows).map((row) => String(row.license || "").toLowerCase());')
      [void]$Builder.AppendLine('        if (families.includes("workspace")) return { delta: 10, reason: "project-approved lexical layer" };')
      [void]$Builder.AppendLine('        if (families.includes("openscriptures")) return { delta: 8, reason: "OpenScriptures source row" };')
      [void]$Builder.AppendLine('        if (families.includes("wikidata")) return { delta: 7, reason: "Wikidata lexeme source row" };')
      [void]$Builder.AppendLine('        if (families.includes("kaikki") || families.includes("wiktionary")) return { delta: -6, reason: "Kaikki/Wiktionary enrichment source" };')
      [void]$Builder.AppendLine('        if (licenses.some((license) => license.includes("incomplete"))) return { delta: -12, reason: "incomplete source metadata" };')
      [void]$Builder.AppendLine('        if (sourceIds.some((sourceId) => sourceId)) return { delta: 2, reason: "source id present" };')
      [void]$Builder.AppendLine('        return { delta: -10, reason: "missing source row" };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const parserScore = (view) => {')
      [void]$Builder.AppendLine('        const status = String(view.surface_context_status || view.disambiguation_status || "").toLowerCase();')
      [void]$Builder.AppendLine('        if (status.includes("fixed_expression")) return { delta: 8, reason: "fixed expression rule" };')
      [void]$Builder.AppendLine('        if (status.includes("particle")) return { delta: 8, reason: "particle/grammar rule" };')
      [void]$Builder.AppendLine('        if (status.includes("prefix_base")) return { delta: 6, reason: "prefix/base parser with resolved base" };')
      [void]$Builder.AppendLine('        if (status.includes("abbreviation")) return { delta: 7, reason: "abbreviation table" };')
      [void]$Builder.AppendLine('        return { delta: 0, reason: "" };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const applyDisplayBoost = (status, rawScore, view) => {')
      [void]$Builder.AppendLine('        return { score: rawScore, reasons: [] };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const scoreClaim = (status, hebrew, renderings, rows, evidence = {}) => {')
      [void]$Builder.AppendLine('        const reasons = [];')
      [void]$Builder.AppendLine('        let score = 0;')
      [void]$Builder.AppendLine('        if (status === "Unresolved") return { raw_score: 0, score: 0, display_score: 0, reasons: ["no resolved lexical row"], raw_reasons: ["no resolved lexical row"], display_reasons: [] };')
      [void]$Builder.AppendLine('        if (status === "Caution") { score = 35; reasons.push("caution tier"); }')
      [void]$Builder.AppendLine('        else if (status === "Related") { score = 42; reasons.push("related option, not contextual"); }')
      [void]$Builder.AppendLine('        else if (status === "Potential") { score = 58; reasons.push("potential option, context unresolved"); }')
      [void]$Builder.AppendLine('        else if (status === "Strict Aramaic") { score = 84; reasons.push("strict Aramaic row"); }')
      [void]$Builder.AppendLine('        else if (status === "Strict Lemma") { score = 78; reasons.push("strict lemma row"); }')
      [void]$Builder.AppendLine('        else { score = 84; reasons.push("strict Hebrew row"); }')
      [void]$Builder.AppendLine('        const rendered = cleanStrictRenderings(renderings || []);')
      [void]$Builder.AppendLine('        if (rendered.length) { score += 5; reasons.push("usable strict renderings"); } else { score -= 15; reasons.push("no usable renderings"); }')
      [void]$Builder.AppendLine('        const sourceQuality = sourceQualityScore(rows);')
      [void]$Builder.AppendLine('        score += sourceQuality.delta;')
      [void]$Builder.AppendLine('        if (sourceQuality.reason) reasons.push(sourceQuality.reason);')
      [void]$Builder.AppendLine('        const view = evidence.view || {};')
      [void]$Builder.AppendLine('        const entry = evidence.entry || {};')
      [void]$Builder.AppendLine('        const clicked = normalizeHebrewDisplay(view.hebrew_word || view.surface_word || "");')
      [void]$Builder.AppendLine('        const entryMatch = normalizeHebrewDisplay(entry.match_key || "");')
      [void]$Builder.AppendLine('        const entryLemma = normalizeHebrewDisplay(entry.lemma || hebrew || "");')
      [void]$Builder.AppendLine('        if (evidence.surfaceClaim) { score += 5; reasons.push("clicked surface-form rendering"); }')
      [void]$Builder.AppendLine('        if (clicked && (entryMatch === clicked || entryLemma === clicked || normalizeHebrewDisplay(hebrew || "") === clicked)) { score += 6; reasons.push("exact clicked surface match"); }')
      [void]$Builder.AppendLine('        else if (view.normalized_word && (normalizeHebrewKey(entry.match_key || hebrew || "") === view.normalized_word || normalizeHebrewKey(entry.lemma || hebrew || "") === view.normalized_word)) { score += 4; reasons.push("exact normalized match"); }')
      [void]$Builder.AppendLine('        if (entry.context_role === "likely_contextual" || evidence.surfaceClaim) { score += 5; reasons.push("contextual row selected"); }')
      [void]$Builder.AppendLine('        if (entry.context_role === "other_possible") { score -= 8; reasons.push("other-possible candidate"); }')
      [void]$Builder.AppendLine('        const parser = parserScore(view);')
      [void]$Builder.AppendLine('        score += evidence.surfaceClaim ? parser.delta : 0;')
      [void]$Builder.AppendLine('        if (evidence.surfaceClaim && parser.reason) reasons.push(parser.reason);')
      [void]$Builder.AppendLine('        if (isNoisyAlternateEntry(entry)) { score -= 28; reasons.push("homograph/noise risk"); }')
      [void]$Builder.AppendLine('        if (!cleanValues(rows).length && status !== "Caution" && status !== "Unresolved") { score -= 20; reasons.push("source/license row missing"); }')
      [void]$Builder.AppendLine('        const caps = { "Strict Hebrew": 99, "Strict Aramaic": 99, "Strict Lemma": 95, Potential: 75, Related: 60, Caution: 49, Unresolved: 0 };')
      [void]$Builder.AppendLine('        const floors = { "Strict Hebrew": 60, "Strict Aramaic": 60, "Strict Lemma": 50, Potential: 25, Related: 15, Caution: 1, Unresolved: 0 };')
      [void]$Builder.AppendLine('        const rawScore = clampScore(score, floors[status] ?? 0, caps[status] ?? 99);')
      [void]$Builder.AppendLine('        const display = applyDisplayBoost(status, rawScore, view);')
      [void]$Builder.AppendLine('        return { raw_score: rawScore, score: display.score, display_score: display.score, reasons: uniqueValues([...reasons, ...display.reasons]), raw_reasons: uniqueValues(reasons), display_reasons: uniqueValues(display.reasons) };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const claimRowKey = (claim) => `${claim.status || ""}|${claim.hebrew || ""}|${claim.renderings.join(";")}|${claim.rows.map(sourceRowKey).join(";")}`;')
      [void]$Builder.AppendLine('      const uniqueClaims = (claims) => {')
      [void]$Builder.AppendLine('        const seen = new Set();')
      [void]$Builder.AppendLine('        return cleanValues(claims).filter((claim) => {')
      [void]$Builder.AppendLine('          const key = claimRowKey(claim);')
      [void]$Builder.AppendLine('          if (seen.has(key)) return false;')
      [void]$Builder.AppendLine('          seen.add(key);')
      [void]$Builder.AppendLine('          return true;')
      [void]$Builder.AppendLine('        });')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const makeClaim = (status, hebrew, renderings, rows, transliteration = "", evidence = {}) => {')
      [void]$Builder.AppendLine('        const sourceRows = cleanValues(rows);')
      [void]$Builder.AppendLine('        const rowStatus = (!sourceRows.length && status !== "Caution" && status !== "Unresolved") ? "Caution" : status;')
      [void]$Builder.AppendLine('        const cleanRenderings = cleanStrictRenderings(renderings || []);')
      [void]$Builder.AppendLine('        const scored = scoreClaim(rowStatus, hebrew, cleanRenderings, sourceRows, evidence);')
      [void]$Builder.AppendLine('        return { status: rowStatus, raw_confidence: scored.raw_score, confidence: scored.score, display_confidence: scored.display_score, confidence_reasons: scored.reasons, raw_confidence_reasons: scored.raw_reasons, display_confidence_reasons: scored.display_reasons, hebrew: normalizeHebrewDisplay(hebrew || "N/A"), transliteration: cleanTransliteration(transliteration), renderings: cleanRenderings, rows: sourceRows };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const entryHebrewLabel = (entry, view) => entry.lemma || entry.match_key || view.hebrew_word || view.surface_word || "N/A";')
      [void]$Builder.AppendLine('      const claimFromEntry = (view, entry, status, renderings = null) => makeClaim(status, entryHebrewLabel(entry, view), renderings || entry.strict_renderings || [], sourceRowsForEntry(view, entry), entry.transliteration || entry.surface_transliteration || "", { view, entry });')
      [void]$Builder.AppendLine('      const displayLicense = (row) => {')
      [void]$Builder.AppendLine('        const license = String(row && row.license || "").trim();')
      [void]$Builder.AppendLine('        if (String(row && row.source_family || "").toLowerCase() === "workspace" && /^N\/A\s*-\s*project/i.test(license)) return "project-authored / CC0";')
      [void]$Builder.AppendLine('        return license || "N/A";')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const sourceSummary = (rows) => {')
      [void]$Builder.AppendLine('        const cleanRows = cleanValues(rows);')
      [void]$Builder.AppendLine('        if (!cleanRows.length) return null;')
      [void]$Builder.AppendLine('        const sources = uniqueValues(cleanRows.map((row) => `${row.source_name || "Source"}${row.source_id ? ` ${row.source_id}` : ""}`));')
      [void]$Builder.AppendLine('        const licenses = uniqueValues(cleanRows.map(displayLicense));')
      [void]$Builder.AppendLine('        const sourceText = sources.length > 2 ? `${sources.slice(0, 2).join("; ")}; +${sources.length - 2} more` : sources.join("; ");')
      [void]$Builder.AppendLine('        return { source: sourceText || "Source metadata incomplete", license: licenses.join(" / ") || "N/A" };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const DISPLAY_THRESHOLD = 50;')
      [void]$Builder.AppendLine('      const MAX_VISIBLE_CLAIMS = 5;')
      [void]$Builder.AppendLine('      const claimConfidence = (claim) => Number.isFinite(claim.display_confidence) ? claim.display_confidence : (Number.isFinite(claim.confidence) ? claim.confidence : 0);')
      [void]$Builder.AppendLine('      const statusOrder = { "Strict Hebrew": 0, "Strict Aramaic": 1, "Strict Lemma": 2, Potential: 3, Related: 4, Caution: 5, Unresolved: 6 };')
      [void]$Builder.AppendLine('      const sortClaimsForDisplay = (claims) => uniqueClaims(claims).sort((a, b) => (claimConfidence(b) - claimConfidence(a)) || ((statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)) || String(a.hebrew || "").localeCompare(String(b.hebrew || "")));')
      [void]$Builder.AppendLine('      const isDisplayableClaim = (claim) => claim.status === "Unresolved" || claimConfidence(claim) >= DISPLAY_THRESHOLD;')
      [void]$Builder.AppendLine('      const hasDisplayableClaims = (claims) => sortClaimsForDisplay(claims).some(isDisplayableClaim);')
      [void]$Builder.AppendLine('      const appendClaimCard = (list, claim) => {')
      [void]$Builder.AppendLine('        const card = document.createElement("section");')
      [void]$Builder.AppendLine('        card.className = "claim-row";')
      [void]$Builder.AppendLine('        const head = document.createElement("div");')
      [void]$Builder.AppendLine('        head.className = "claim-row-head";')
      [void]$Builder.AppendLine('        const badge = document.createElement("span");')
      [void]$Builder.AppendLine('        badge.className = "claim-status";')
      [void]$Builder.AppendLine('        const confidence = claimConfidence(claim);')
      [void]$Builder.AppendLine('        badge.textContent = `${claim.status || "Potential"} - ${confidence}%`;')
      [void]$Builder.AppendLine('        if (Number.isFinite(claim.raw_confidence) && claim.raw_confidence !== confidence) badge.title = `Raw assurance ${claim.raw_confidence}%; display/order assurance ${confidence}%`;')
      [void]$Builder.AppendLine('        const hebrew = document.createElement("strong");')
      [void]$Builder.AppendLine('        hebrew.className = "claim-hebrew";')
      [void]$Builder.AppendLine('        hebrew.lang = "he";')
      [void]$Builder.AppendLine('        hebrew.dir = "rtl";')
      [void]$Builder.AppendLine('        hebrew.textContent = normalizeHebrewDisplay(claim.hebrew || "N/A");')
      [void]$Builder.AppendLine('        head.append(badge, hebrew);')
      [void]$Builder.AppendLine('        card.appendChild(head);')
      [void]$Builder.AppendLine('        if (claim.transliteration) { const transliteration = document.createElement("p"); transliteration.className = "claim-transliteration"; transliteration.textContent = claim.transliteration; card.appendChild(transliteration); }')
      [void]$Builder.AppendLine('        const renderings = document.createElement("p");')
      [void]$Builder.AppendLine('        renderings.className = "claim-renderings";')
      [void]$Builder.AppendLine('        renderings.textContent = claim.renderings.length ? claim.renderings.join(" / ") : (claim.status === "Unresolved" ? "No lexical entry yet." : "N/A");')
      [void]$Builder.AppendLine('        card.appendChild(renderings);')
      [void]$Builder.AppendLine('        const source = sourceSummary(claim.rows);')
      [void]$Builder.AppendLine('        if (source) {')
      [void]$Builder.AppendLine('          const sourceLine = document.createElement("p");')
      [void]$Builder.AppendLine('          sourceLine.className = "claim-source";')
      [void]$Builder.AppendLine('          sourceLine.textContent = `Source: ${source.source}`;')
      [void]$Builder.AppendLine('          const licenseLine = document.createElement("p");')
      [void]$Builder.AppendLine('          licenseLine.className = "claim-license";')
      [void]$Builder.AppendLine('          licenseLine.textContent = `License: ${source.license}`;')
      [void]$Builder.AppendLine('          card.append(sourceLine, licenseLine);')
      [void]$Builder.AppendLine('        } else if (claim.status === "Caution") {')
      [void]$Builder.AppendLine('          const sourceLine = document.createElement("p");')
      [void]$Builder.AppendLine('          sourceLine.className = "claim-source";')
      [void]$Builder.AppendLine('          sourceLine.textContent = "Source: metadata incomplete";')
      [void]$Builder.AppendLine('          card.appendChild(sourceLine);')
      [void]$Builder.AppendLine('        }')
      [void]$Builder.AppendLine('        list.appendChild(card);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const appendClaimsUnderDetails = (parent, label, claims) => {')
      [void]$Builder.AppendLine('        if (!claims.length) return;')
      [void]$Builder.AppendLine('        const details = document.createElement("details");')
      [void]$Builder.AppendLine('        details.className = "other-entries";')
      [void]$Builder.AppendLine('        const summary = document.createElement("summary");')
      [void]$Builder.AppendLine('        summary.textContent = label;')
      [void]$Builder.AppendLine('        const box = document.createElement("div");')
      [void]$Builder.AppendLine('        box.className = "claim-row-list";')
      [void]$Builder.AppendLine('        claims.forEach((claim) => appendClaimCard(box, claim));')
      [void]$Builder.AppendLine('        details.append(summary, box);')
      [void]$Builder.AppendLine('        parent.appendChild(details);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const appendClaimRows = (node, claims) => {')
      [void]$Builder.AppendLine('        if (!node) return;')
      [void]$Builder.AppendLine('        node.replaceChildren();')
      [void]$Builder.AppendLine('        const rows = sortClaimsForDisplay(claims);')
      [void]$Builder.AppendLine('        if (!rows.length) { node.textContent = "N/A"; return; }')
      [void]$Builder.AppendLine('        const list = document.createElement("div");')
      [void]$Builder.AppendLine('        list.className = "claim-row-list";')
      [void]$Builder.AppendLine('        const displayRows = rows.filter(isDisplayableClaim);')
      [void]$Builder.AppendLine('        const lowRows = rows.filter((claim) => !isDisplayableClaim(claim));')
      [void]$Builder.AppendLine('        const visibleRows = displayRows.length ? displayRows : lowRows;')
      [void]$Builder.AppendLine('        visibleRows.slice(0, MAX_VISIBLE_CLAIMS).forEach((claim) => appendClaimCard(list, claim));')
      [void]$Builder.AppendLine('        appendClaimsUnderDetails(list, "Show more", visibleRows.slice(MAX_VISIBLE_CLAIMS));')
      [void]$Builder.AppendLine('        if (!visibleRows.length) { node.textContent = "N/A"; return; }')
      [void]$Builder.AppendLine('        node.appendChild(list);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const placeholderClaim = (status, hebrew, message) => makeClaim("Unresolved", hebrew || "Clicked form", [message], [], "", { statusOverride: status });')
      [void]$Builder.AppendLine('      const strictClaimsForView = (view, strictBuckets) => {')
      [void]$Builder.AppendLine('        const claims = { hebrew: [], aramaic: [], lemma: [] };')
      [void]$Builder.AppendLine('        const surfaceRenderings = cleanStrictRenderings(view.surface_renderings || []);')
      [void]$Builder.AppendLine('        if (surfaceRenderings.length) {')
      [void]$Builder.AppendLine('          const status = isAramaicView(view) ? "Strict Aramaic" : "Strict Hebrew";')
      [void]$Builder.AppendLine('          const claim = makeClaim(status, view.hebrew_word || view.surface_word || "Clicked form", surfaceRenderings, view.source_rows, view.surface_transliteration || view.transliteration || "", { view, surfaceClaim: true });')
      [void]$Builder.AppendLine('          claims[status === "Strict Aramaic" ? "aramaic" : "hebrew"].push(claim);')
      [void]$Builder.AppendLine('        }')
      [void]$Builder.AppendLine('        strictEntriesForView(view).forEach((entry) => {')
      [void]$Builder.AppendLine('          const bucketName = isAramaicEntry(entry) ? "aramaic" : "hebrew";')
      [void]$Builder.AppendLine('          const bucket = strictBuckets[bucketName] || [];')
      [void]$Builder.AppendLine('          const renderings = cleanStrictRenderings(entry.strict_renderings || []).filter((rendering) => bucket.includes(rendering));')
      [void]$Builder.AppendLine('          if (!renderings.length) return;')
      [void]$Builder.AppendLine('          claims.lemma.push(claimFromEntry(view, entry, "Strict Lemma", renderings));')
      [void]$Builder.AppendLine('          if (surfaceRenderings.length && renderings.every((rendering) => surfaceRenderings.includes(rendering))) return;')
      [void]$Builder.AppendLine('          claims[bucketName].push(claimFromEntry(view, entry, bucketName === "aramaic" ? "Strict Aramaic" : "Strict Hebrew", renderings));')
      [void]$Builder.AppendLine('        });')
      [void]$Builder.AppendLine('        if (!claims.hebrew.length && !claims.aramaic.length && (strictBuckets.hebrew.length || strictBuckets.aramaic.length)) {')
      [void]$Builder.AppendLine('          if (strictBuckets.hebrew.length) claims.hebrew.push(makeClaim("Strict Hebrew", view.hebrew_word || view.surface_word || "Clicked form", strictBuckets.hebrew, view.source_rows, view.surface_transliteration || view.transliteration || "", { view, surfaceClaim: true }));')
      [void]$Builder.AppendLine('          if (strictBuckets.aramaic.length) claims.aramaic.push(makeClaim("Strict Aramaic", view.hebrew_word || view.surface_word || "Clicked form", strictBuckets.aramaic, view.source_rows, view.surface_transliteration || view.transliteration || "", { view, surfaceClaim: true }));')
      [void]$Builder.AppendLine('        }')
      [void]$Builder.AppendLine('        return { hebrew: uniqueClaims(claims.hebrew), aramaic: uniqueClaims(claims.aramaic), lemma: uniqueClaims(claims.lemma) };')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const makeSourceGroup = (label, renderings, rows, confidence = null, confidenceReasons = []) => ({ label: normalizeHebrewDisplay(label || "Lexical claim"), renderings: cleanStrictRenderings(renderings || []), rows: cleanValues(rows), confidence: Number.isFinite(confidence) ? confidence : null, confidence_reasons: uniqueValues(confidenceReasons) });')
      [void]$Builder.AppendLine('      const uniqueSourceGroups = (groups) => {')
      [void]$Builder.AppendLine('        const seen = new Set();')
      [void]$Builder.AppendLine('        return cleanValues(groups).filter((group) => {')
      [void]$Builder.AppendLine('          if (!group.rows.length) return false;')
      [void]$Builder.AppendLine('          const key = `${group.label}|${group.renderings.join(";")}|${group.rows.map(sourceRowKey).join(";")}`;')
      [void]$Builder.AppendLine('          if (seen.has(key)) return false;')
      [void]$Builder.AppendLine('          seen.add(key);')
      [void]$Builder.AppendLine('          return true;')
      [void]$Builder.AppendLine('        });')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const sourceGroupsForEntries = (view, entries) => uniqueSourceGroups(cleanValues(entries).map((entry) => makeSourceGroup(entry.lemma || entry.match_key || view.hebrew_word || view.surface_word, entry.strict_renderings || [], sourceRowsForEntry(view, entry))));')
      [void]$Builder.AppendLine('      const sourceGroupsForClaims = (claims) => uniqueSourceGroups(cleanValues(claims).map((claim) => makeSourceGroup(claim.hebrew, claim.renderings, claim.rows, claim.confidence, claim.confidence_reasons)));')
      [void]$Builder.AppendLine('      const sourceGroupsForStrict = (strictClaims) => sourceGroupsForClaims([...(strictClaims.hebrew || []), ...(strictClaims.aramaic || []), ...(strictClaims.lemma || [])]);')
      [void]$Builder.AppendLine('      const sourceGroupsForVisible = (view, strictClaims, secondaryClaims = {}) => {')
      [void]$Builder.AppendLine('        return sourceGroupsForClaims([...(strictClaims.hebrew || []), ...(strictClaims.aramaic || []), ...(strictClaims.lemma || []), ...(secondaryClaims.potential || []), ...(secondaryClaims.related || []), ...(secondaryClaims.caution || [])]);')
      [void]$Builder.AppendLine('      };')
      [void]$Builder.AppendLine('      const appendSecondarySources = (container, view, entries, label) => {')
      [void]$Builder.AppendLine('        const groups = sourceGroupsForEntries(view, entries);')
      [void]$Builder.AppendLine('        if (!groups.length) return;')
  [void]$Builder.AppendLine('        const sourceDetails = document.createElement("details");')
  [void]$Builder.AppendLine('        sourceDetails.className = "source-details";')
  [void]$Builder.AppendLine('        const sourceSummary = document.createElement("summary");')
  [void]$Builder.AppendLine('        sourceSummary.textContent = label;')
  [void]$Builder.AppendLine('        const sourceBox = document.createElement("div");')
  [void]$Builder.AppendLine('        sourceDetails.append(sourceSummary, sourceBox);')
      [void]$Builder.AppendLine('        renderSourceGroups(sourceBox, groups);')
  [void]$Builder.AppendLine('        container.appendChild(sourceDetails);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderPotentialAndRelatedEntries = (root, view, hasLexicalEntry, hasStrict) => {')
  [void]$Builder.AppendLine('        const potentialNode = root.querySelector("[data-hud-potential]");')
  [void]$Builder.AppendLine('        const relatedNode = root.querySelector("[data-hud-related]");')
  [void]$Builder.AppendLine('        const cautionNode = root.querySelector("[data-hud-caution]");')
  [void]$Builder.AppendLine('        const result = { potential: [], related: [], caution: [] };')
  [void]$Builder.AppendLine('        if (!potentialNode || !relatedNode || !cautionNode) return result;')
  [void]$Builder.AppendLine('        potentialNode.replaceChildren();')
  [void]$Builder.AppendLine('        relatedNode.replaceChildren();')
  [void]$Builder.AppendLine('        cautionNode.replaceChildren();')
  [void]$Builder.AppendLine('        if (!hasLexicalEntry) {')
  [void]$Builder.AppendLine('          result.potential = [makeClaim("Unresolved", view.hebrew_word || view.surface_word || "Clicked form", ["No lexical entry yet."], [])];')
  [void]$Builder.AppendLine('          setRowHidden(root, "[data-hud-potential-row]", false);')
  [void]$Builder.AppendLine('          setRowHidden(root, "[data-hud-related-row]", true);')
  [void]$Builder.AppendLine('          setRowHidden(root, "[data-hud-caution-row]", true);')
  [void]$Builder.AppendLine('          appendClaimRows(potentialNode, result.potential);')
  [void]$Builder.AppendLine('          return result;')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        const entries = cleanValues(view.possible_entries);')
  [void]$Builder.AppendLine('        const strictKeys = strictEntryKeys(view);')
      [void]$Builder.AppendLine('        const noisyEntries = entries.filter((entry) => hasStrict && isNoisyAlternateEntry(entry) && !strictKeys.has(entry.entry_key));')
      [void]$Builder.AppendLine('        const relatedEntries = entries.filter((entry) => isRelatedEntry(entry) && !(hasStrict && isNoisyAlternateEntry(entry)));')
      [void]$Builder.AppendLine('        const potentialEntries = entries.filter((entry) => !isRelatedEntry(entry) && !strictKeys.has(entry.entry_key) && (!hasStrict || entry.context_role !== "likely_contextual") && (!hasStrict || entryMatchesClickedForm(entry, view)) && !(hasStrict && isNoisyAlternateEntry(entry)));')
  [void]$Builder.AppendLine('        const potentialClaims = uniqueClaims(potentialEntries.map((entry) => claimFromEntry(view, entry, "Potential")));')
  [void]$Builder.AppendLine('        const relatedClaims = uniqueClaims(relatedEntries.map((entry) => claimFromEntry(view, entry, "Related")));')
  [void]$Builder.AppendLine('        const cautionClaims = uniqueClaims([...potentialClaims, ...relatedClaims].filter((claim) => claim.status === "Caution").concat(noisyEntries.map((entry) => claimFromEntry(view, entry, "Caution"))));')
  [void]$Builder.AppendLine('        const visiblePotentialClaims = potentialClaims.filter((claim) => claim.status !== "Caution");')
  [void]$Builder.AppendLine('        const visibleRelatedClaims = relatedClaims.filter((claim) => claim.status !== "Caution");')
  [void]$Builder.AppendLine('        const highClaims = [...visiblePotentialClaims, ...visibleRelatedClaims, ...cautionClaims].filter(isDisplayableClaim);')
  [void]$Builder.AppendLine('        const allowLowConfidenceFallback = !hasStrict && !highClaims.length;')
  [void]$Builder.AppendLine('        const keepForDisplay = (claims) => allowLowConfidenceFallback ? claims : claims.filter(isDisplayableClaim);')
  [void]$Builder.AppendLine('        result.potential.push(...keepForDisplay(visiblePotentialClaims));')
  [void]$Builder.AppendLine('        result.related.push(...keepForDisplay(visibleRelatedClaims));')
  [void]$Builder.AppendLine('        result.caution.push(...keepForDisplay(cautionClaims));')
  [void]$Builder.AppendLine('        if (!hasStrict && !highClaims.length && !result.potential.length && !result.related.length && !result.caution.length) result.potential.push(makeClaim("Unresolved", view.hebrew_word || view.surface_word || "Clicked form", ["No lexical entry yet."], []));')
  [void]$Builder.AppendLine('        setRowHidden(root, "[data-hud-potential-row]", !result.potential.length);')
  [void]$Builder.AppendLine('        setRowHidden(root, "[data-hud-related-row]", !result.related.length);')
  [void]$Builder.AppendLine('        setRowHidden(root, "[data-hud-caution-row]", !result.caution.length);')
  [void]$Builder.AppendLine('        if (result.potential.length) appendClaimRows(potentialNode, result.potential);')
  [void]$Builder.AppendLine('        if (result.related.length) appendClaimRows(relatedNode, result.related);')
  [void]$Builder.AppendLine('        if (result.caution.length) appendClaimRows(cautionNode, result.caution);')
  [void]$Builder.AppendLine('        return result;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderSourceRow = (row) => {')
  [void]$Builder.AppendLine('        const title = document.createElement("p");')
  [void]$Builder.AppendLine('        const strong = document.createElement("strong");')
  [void]$Builder.AppendLine('        const sourceHref = resolveSourceUrl(row.source_url);')
  [void]$Builder.AppendLine('        if (sourceHref) {')
  [void]$Builder.AppendLine('          const link = document.createElement("a");')
  [void]$Builder.AppendLine('          link.href = sourceHref;')
  [void]$Builder.AppendLine('          link.textContent = row.source_name || "Source";')
  [void]$Builder.AppendLine('          strong.appendChild(link);')
  [void]$Builder.AppendLine('        } else {')
  [void]$Builder.AppendLine('          strong.textContent = row.source_name || "Source";')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('        title.appendChild(strong);')
  [void]$Builder.AppendLine('        title.append(` | ${row.source_id || "N/A"} | License: ${displayLicense(row)}`);')
  [void]$Builder.AppendLine('        return title;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderSourceGroups = (sourceBox, groups) => {')
  [void]$Builder.AppendLine('        if (!sourceBox) return;')
  [void]$Builder.AppendLine('        sourceBox.replaceChildren();')
  [void]$Builder.AppendLine('        const sourceGroups = cleanValues(groups);')
  [void]$Builder.AppendLine('        if (!sourceGroups.length) { const note = document.createElement("p"); note.className = "placeholder"; note.textContent = "No cached lexical source row yet."; sourceBox.appendChild(note); return; }')
  [void]$Builder.AppendLine('        sourceGroups.forEach((group) => {')
  [void]$Builder.AppendLine('          const section = document.createElement("div");')
  [void]$Builder.AppendLine('          section.className = "source-row";')
  [void]$Builder.AppendLine('          const claim = document.createElement("p");')
  [void]$Builder.AppendLine('          claim.className = "source-claim";')
  [void]$Builder.AppendLine('          claim.append("For ");')
  [void]$Builder.AppendLine('          const lemma = document.createElement("span");')
  [void]$Builder.AppendLine('          lemma.lang = "he";')
  [void]$Builder.AppendLine('          lemma.dir = "rtl";')
  [void]$Builder.AppendLine('          lemma.textContent = group.label || "Lexical claim";')
  [void]$Builder.AppendLine('          claim.appendChild(lemma);')
      [void]$Builder.AppendLine('          if (group.renderings && group.renderings.length) claim.append(` - ${group.renderings.join(", ")}`);')
      [void]$Builder.AppendLine('          if (Number.isFinite(group.confidence)) claim.append(` | Assurance: ${group.confidence}%`);')
      [void]$Builder.AppendLine('          section.appendChild(claim);')
      [void]$Builder.AppendLine('          if (group.confidence_reasons && group.confidence_reasons.length) { const reasons = document.createElement("p"); reasons.className = "source-claim"; reasons.textContent = `Score basis: ${group.confidence_reasons.join("; ")}`; section.appendChild(reasons); }')
  [void]$Builder.AppendLine('          uniqueValues(group.rows.map(sourceRowKey)).map((key) => group.rows.find((row) => sourceRowKey(row) === key)).filter(Boolean).forEach((row) => section.appendChild(renderSourceRow(row)));')
  [void]$Builder.AppendLine('          sourceBox.appendChild(section);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const buildWordView = async (button) => {')
  [void]$Builder.AppendLine('        const tokenRow = await loadTokenRow(button.dataset.lexicalIndex);')
  [void]$Builder.AppendLine('        const entryId = button.dataset.lexicalEntry || tokenRow.lexicon_entry_id || "";')
  [void]$Builder.AppendLine('        const entry = entryId ? (lexiconEntries.get(entryId) || {}) : {};')
  [void]$Builder.AppendLine('        return { ...entry, ...tokenRow, hebrew_word: button.textContent.trim() || tokenRow.surface_word, source_rows: entry.source_rows || [], secondary_source_rows: entry.secondary_source_rows || [] };')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderWord = async (button) => {')
  [void]$Builder.AppendLine('        const unit = button.closest("[data-lexical-unit]");')
  [void]$Builder.AppendLine('        const slot = unit ? unit.querySelector("[data-lexical-slot]") : null;')
  [void]$Builder.AppendLine('        if (!unit || !slot) return;')
  [void]$Builder.AppendLine('        activeHudButton = button;')
  [void]$Builder.AppendLine('        if (hud.parentElement !== document.body) document.body.appendChild(hud);')
  [void]$Builder.AppendLine('        document.querySelectorAll("[data-lexical-token]").forEach((wordButton) => wordButton.setAttribute("aria-pressed", "false"));')
  [void]$Builder.AppendLine('        button.setAttribute("aria-pressed", "true");')
  [void]$Builder.AppendLine('        hud.hidden = false;')
  [void]$Builder.AppendLine('        positionHudNearButton(button);')
      [void]$Builder.AppendLine('        setText(hud, "[data-hud-word]", button.textContent.trim());')
      [void]$Builder.AppendLine('        setRowHidden(hud, "[data-hud-hebrew-strict-row]", false);')
      [void]$Builder.AppendLine('        setRowHidden(hud, "[data-hud-aramaic-strict-row]", false);')
      [void]$Builder.AppendLine('        setRowHidden(hud, "[data-hud-lemma-strict-row]", false);')
      [void]$Builder.AppendLine('        setRowHidden(hud, "[data-hud-caution-row]", true);')
      [void]$Builder.AppendLine('        setList(hud, "[data-hud-hebrew-strict]", ["Loading lexical entry..."]);')
      [void]$Builder.AppendLine('        setList(hud, "[data-hud-aramaic-strict]", ["Loading lexical entry..."]);')
      [void]$Builder.AppendLine('        setList(hud, "[data-hud-lemma-strict]", ["Loading lexical entry..."]);')
  [void]$Builder.AppendLine('        renderBreakdown(hud, {});')
  [void]$Builder.AppendLine('        renderPotentialAndRelatedEntries(hud, {}, false, false);')
  [void]$Builder.AppendLine('        renderSourceGroups(hud.querySelector("[data-hud-sources]"), []);')
  [void]$Builder.AppendLine('        try {')
  [void]$Builder.AppendLine('          const view = await buildWordView(button);')
  [void]$Builder.AppendLine('          if (button.getAttribute("aria-pressed") !== "true") return;')
  [void]$Builder.AppendLine('          setText(hud, "[data-hud-word]", view.hebrew_word);')
  [void]$Builder.AppendLine('          const hasLexicalEntry = Boolean(view.lexicon_entry_id || button.dataset.lexicalEntry);')
  [void]$Builder.AppendLine('          const strictBuckets = hasLexicalEntry ? getStrictBuckets(view) : { hebrew: [], aramaic: [] };')
      [void]$Builder.AppendLine('          const strictClaims = hasLexicalEntry ? strictClaimsForView(view, strictBuckets) : { hebrew: [], aramaic: [], lemma: [] };')
      [void]$Builder.AppendLine('          const hasStrict = strictClaims.hebrew.length > 0 || strictClaims.aramaic.length > 0 || strictClaims.lemma.length > 0;')
      [void]$Builder.AppendLine('          const clickedForm = view.hebrew_word || view.surface_word || "Clicked form";')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-hebrew-strict-row]", false);')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-aramaic-strict-row]", false);')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-lemma-strict-row]", false);')
      [void]$Builder.AppendLine('          appendClaimRows(hud.querySelector("[data-hud-hebrew-strict]"), strictClaims.hebrew.length ? strictClaims.hebrew : [placeholderClaim("Strict Hebrew", clickedForm, "No Hebrew strict match yet.")]);')
      [void]$Builder.AppendLine('          appendClaimRows(hud.querySelector("[data-hud-aramaic-strict]"), strictClaims.aramaic.length ? strictClaims.aramaic : [placeholderClaim("Strict Aramaic", clickedForm, "No Aramaic strict match yet.")]);')
      [void]$Builder.AppendLine('          appendClaimRows(hud.querySelector("[data-hud-lemma-strict]"), strictClaims.lemma.length ? strictClaims.lemma : [placeholderClaim("Strict Lemma", clickedForm, "No lemma strict match yet.")]);')
  [void]$Builder.AppendLine('          renderBreakdown(hud, view);')
  [void]$Builder.AppendLine('          const secondaryClaims = renderPotentialAndRelatedEntries(hud, view, hasLexicalEntry, hasStrict);')
  [void]$Builder.AppendLine('          renderSourceGroups(hud.querySelector("[data-hud-sources]"), sourceGroupsForVisible(view, strictClaims, secondaryClaims));')
  [void]$Builder.AppendLine('          const details = hud.querySelector("details");')
  [void]$Builder.AppendLine('          if (details) details.open = false;')
  [void]$Builder.AppendLine('          positionHudNearButton(button);')
  [void]$Builder.AppendLine('        } catch (error) {')
      [void]$Builder.AppendLine('          console.error(error);')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-hebrew-strict-row]", false);')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-aramaic-strict-row]", false);')
      [void]$Builder.AppendLine('          setRowHidden(hud, "[data-hud-lemma-strict-row]", false);')
      [void]$Builder.AppendLine('          setList(hud, "[data-hud-hebrew-strict]", ["No lexical entry yet."]);')
      [void]$Builder.AppendLine('          setList(hud, "[data-hud-aramaic-strict]", ["No Aramaic strict match yet."]);')
      [void]$Builder.AppendLine('          setList(hud, "[data-hud-lemma-strict]", ["No lemma strict match yet."]);')
  [void]$Builder.AppendLine('          positionHudNearButton(button);')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      buttons.forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => {')
  [void]$Builder.AppendLine('          renderWord(button);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        button.addEventListener("keydown", (event) => {')
  [void]$Builder.AppendLine('          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); button.click(); }')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      document.querySelectorAll("[data-hud-close]").forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => {')
  [void]$Builder.AppendLine('          const hud = button.closest("[data-lexical-hud]");')
  [void]$Builder.AppendLine('          if (hud) hud.hidden = true;')
  [void]$Builder.AppendLine('          activeHudButton = null;')
  [void]$Builder.AppendLine('          document.querySelectorAll("[data-lexical-token]").forEach((wordButton) => wordButton.setAttribute("aria-pressed", "false"));')
  [void]$Builder.AppendLine('        });')
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
  $entryIds = @{}
  if ($null -ne $WorkOccurrence -and $null -ne $WorkOccurrence.units) {
    foreach ($unitProperty in @($WorkOccurrence.units.PSObject.Properties)) {
      foreach ($paragraph in @($unitProperty.Value.paragraphs)) {
        foreach ($tokenIndexId in @($paragraph.token_index_ids)) {
          if ($tokenIndexId) {
            $tokenKey = [string]$tokenIndexId
            $tokenIds[$tokenKey] = $true
            if ($LexicalCache.token_index_by_id.ContainsKey($tokenKey)) {
              $row = $LexicalCache.token_index_by_id[$tokenKey]
              if ($row.lexicon_entry_id) { $entryIds[[string]$row.lexicon_entry_id] = $true }
            }
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
        lexicon_entry_id = $row.lexicon_entry_id
        status = $row.status
        surface_renderings = $row.surface_renderings
        surface_context_status = $row.surface_context_status
        surface_context_note = $row.surface_context_note
        breakdown = @($row.breakdown | ForEach-Object {
          [pscustomobject]@{
            hebrew = $_.hebrew
            strict_renderings = $_.strict_renderings
          }
        })
      }
    }
  })
  $entries = @($entryIds.Keys | Sort-Object | ForEach-Object {
    if ($LexicalCache.lexicon_by_id.ContainsKey($_)) {
      $entry = $LexicalCache.lexicon_by_id[$_]
      $rawPossibleEntries = @($entry.possible_entries | Where-Object {
        -not (Test-ExcludedOtherLexicalEntry -Entry $_)
      })
      $primaryEntries = @($rawPossibleEntries | Where-Object {
        $_.context_role -eq 'likely_contextual' -or (
          $_.source_family -ne 'kaikki' -and
          $_.source_family -ne 'wiktionary' -and
          (($_.match_key -eq $entry.hebrew_word) -or ($_.lemma -eq $entry.hebrew_word))
        )
      })
      $primaryEntryKeys = @{}
      foreach ($primaryEntry in @($primaryEntries)) {
        if ($primaryEntry.entry_key) { $primaryEntryKeys[[string]$primaryEntry.entry_key] = $true }
      }
      $secondaryEntries = @($rawPossibleEntries | Where-Object { -not ($_.entry_key -and $primaryEntryKeys.ContainsKey([string]$_.entry_key)) })
      $selectionSourceRows = Add-LexicalFallbackSourceRows -SourceRows @($entry.source_rows) -Entries @($rawPossibleEntries)
      $primarySourceRows = Select-LexicalSourceRows -SourceRows @($selectionSourceRows) -Keys @($primaryEntries | ForEach-Object { @(Get-LexicalEntrySourceKeys -Entry $_) })
      $secondarySourceRows = Select-LexicalSourceRows -SourceRows @($selectionSourceRows) -Keys @($secondaryEntries | ForEach-Object { @(Get-LexicalEntrySourceKeys -Entry $_) })
      if ($primarySourceRows.Count -eq 0 -and @($entry.strict_renderings).Count -gt 0) {
        $strictRenderingRows = @($selectionSourceRows | Where-Object { $_.source_family -eq 'kaikki' -or $_.source_family -eq 'wiktionary' })
        if ($strictRenderingRows.Count -gt 0) {
          $primarySourceRows = $strictRenderingRows
        }
      }
      $possibleEntries = @($rawPossibleEntries | ForEach-Object {
        [pscustomobject]@{
          entry_key = $_.entry_key
          lemma = $_.lemma
          match_key = $_.match_key
          source_name = $_.source_name
          source_family = $_.source_family
          source_id = $_.source_id
          strict_renderings = $_.strict_renderings
          context_role = $_.context_role
          relation_label = $_.relation_label
        }
      })
      [pscustomobject]@{
        entry_id = $entry.entry_id
        hebrew_word = $entry.hebrew_word
        strict_renderings = $entry.strict_renderings
        disambiguation_status = $entry.disambiguation_status
        context_note = $entry.context_note
        possible_entries = $possibleEntries
        source_rows = [object[]]@($primarySourceRows)
        secondary_source_rows = [object[]]@($secondarySourceRows)
      }
    }
  })
  return [pscustomobject]@{
    generated_at = $LexicalCache.token_index.generated_at
    token_index = [pscustomobject]@{ schema_version = 1; forms = $forms }
    lexicon = [pscustomobject]@{ schema_version = 1; entries = $entries }
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

  $entriesById = @{}
  foreach ($entry in @($WorkLexicalPayload.lexicon.entries)) {
    if ($entry.entry_id) {
      $entriesById[[string]$entry.entry_id] = $entry
    }
  }

  $forms = @($WorkLexicalPayload.token_index.forms)
  $maxFormsPerChunk = 1000
  $chunks = @()
  $tokenChunks = [ordered]@{}
  for ($start = 0; $start -lt $forms.Count; $start += $maxFormsPerChunk) {
    $chunkForms = @($forms[$start..([Math]::Min($start + $maxFormsPerChunk - 1, $forms.Count - 1))])
    $chunkNumber = [int]($start / $maxFormsPerChunk)
    $chunkId = ('chunk-{0:D3}' -f $chunkNumber)

    $chunkEntryIds = @{}
    foreach ($form in @($chunkForms)) {
      if ($form.token_index_id) {
        $tokenChunks[[string]$form.token_index_id] = $chunkId
      }
      if ($form.lexicon_entry_id) {
        $chunkEntryIds[[string]$form.lexicon_entry_id] = $true
      }
    }

    $sourceRows = [ordered]@{}
    $sourceRowIdsByKey = @{}
    $getSourceRowIds = {
      param([object[]]$Rows)

      $ids = @()
      foreach ($row in @($Rows)) {
        if ($null -eq $row) { continue }
        $key = "$($row.source_family)|$($row.source_id)|$($row.license)"
        if (-not $sourceRowIdsByKey.ContainsKey($key)) {
          $sourceRowId = $key
          $sourceRowIdsByKey[$key] = $sourceRowId
          $sourceRows[$sourceRowId] = $row
        }
        $ids += $sourceRowIdsByKey[$key]
      }
      return $ids
    }

    $entries = @($chunkEntryIds.Keys | Sort-Object | ForEach-Object {
      if ($entriesById.ContainsKey($_)) {
        $entry = $entriesById[$_]
        [pscustomobject]@{
          entry_id = $entry.entry_id
          hebrew_word = $entry.hebrew_word
          strict_renderings = $entry.strict_renderings
          disambiguation_status = $entry.disambiguation_status
          context_note = $entry.context_note
          possible_entries = $entry.possible_entries
          source_row_ids = @(& $getSourceRowIds -Rows @($entry.source_rows))
          secondary_source_row_ids = @(& $getSourceRowIds -Rows @($entry.secondary_source_rows))
        }
      }
    })

    $chunk = [pscustomobject]@{
      schema_version = 1
      chunk_id = $chunkId
      token_index = [pscustomobject]@{
        schema_version = 1
        forms = $chunkForms
      }
      lexicon = [pscustomobject]@{
        schema_version = 1
        entries = $entries
      }
      source_rows = $sourceRows
    }

    $chunkPath = Join-Path $chunkDir "$chunkId.json"
    Write-Utf8 -Path $chunkPath -Content ((ConvertTo-Json -InputObject $chunk -Depth 40 -Compress) + "`n")
    $chunks += [pscustomobject]@{
      chunk_id = $chunkId
      url = "$WorkId-chunks/$chunkId.json"
      token_count = $chunkForms.Count
      entry_count = $entries.Count
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
    manifest_url = "$RootHref$LexicalDir/$WorkId.manifest.json"
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
    $groupBadge = if (Test-UnitsHaveLexical -WorkOccurrence $WorkOccurrence -Units $groupUnits) { ' <span class="hud-badge">Lexical layer active</span>' } else { '' }

    [void]$Builder.AppendLine('            <details class="toc-group">')
    [void]$Builder.AppendLine("              <summary>$(Encode-Html $groupTitle)$groupBadge</summary>")
    [void]$Builder.AppendLine("              <a class=""toc-start"" href=""#$groupAnchor"">Start</a>")

    foreach ($section in (Get-OrderedGroups -Items $groupUnits -KeyScript { param($item) $item.section_slug })) {
      $sectionUnits = @($section.Items)
      if ($sectionUnits.Count -eq 0) { continue }
      $firstSectionUnit = $sectionUnits[0]
      $sectionTitle = if ($firstSectionUnit.section_title -and $firstSectionUnit.section_slug -ne 'text') { $firstSectionUnit.section_title } else { $groupTitle }
      $sectionAnchor = Get-SectionStartAnchor -Unit $firstSectionUnit -Source $Source
      $sectionBadge = if (Test-UnitsHaveLexical -WorkOccurrence $WorkOccurrence -Units $sectionUnits) { ' <span class="hud-badge">Lexical layer active</span>' } else { '' }

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
  $sourceFiles = if ($targetWorkIds.Count -gt 0 -and $SkipSitePages) {
    @($targetWorkIds | ForEach-Object { Join-Path $SourceDir "$_.json" } | Where-Object { Test-Path -LiteralPath $_ } | ForEach-Object { Get-Item -LiteralPath $_ })
  } else {
    @(Get-ChildItem -Path $SourceDir -Filter '*.json')
  }

  $sources = @($sourceFiles | ForEach-Object { Read-Json -Path $_.FullName } | Sort-Object work_title)
  if ($targetWorkIds.Count -gt 0 -and $SkipSitePages) {
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

  $workId = [string]$Source.work_id
  if (-not $workId) { return }

  $links = New-Object System.Collections.Generic.List[string]
  if ($null -ne $WorkLexicalExternal -and $WorkLexicalExternal.manifest_url) {
    $links.Add("<a class=""export-button"" href=""$($WorkLexicalExternal.manifest_url)"">Lexical manifest</a>")
  }

  $workClaimCsv = "data/public-lexical/by-work/$workId.csv"
  if (Test-Path -LiteralPath $workClaimCsv) {
    $href = if ($AssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $AssetBaseUrl -RelativePath $workClaimCsv } else { "$RootHref$workClaimCsv" }
    $links.Add("<a class=""export-button"" href=""$href"" download>Book claims CSV</a>")
  }

  $tokenStatusCsv = "data/public-lexical/by-work/$workId-token-status.csv"
  if (Test-Path -LiteralPath $tokenStatusCsv) {
    $href = if ($AssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $AssetBaseUrl -RelativePath $tokenStatusCsv } else { "$RootHref$tokenStatusCsv" }
    $links.Add("<a class=""export-button"" href=""$href"" download>Token status CSV</a>")
  }

  $compactTokenClaimsCsv = "data/public-lexical/by-work/$workId-token-claims-min60.csv"
  if (Test-Path -LiteralPath $compactTokenClaimsCsv) {
    $href = if ($AssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $AssetBaseUrl -RelativePath $compactTokenClaimsCsv } else { "$RootHref$compactTokenClaimsCsv" }
    $links.Add("<a class=""export-button"" href=""$href"" download>Token claims CSV</a>")
  }

  $aiOptionsCsv = "data/public-lexical/by-work/$workId-ai-options-min60.csv"
  if (Test-Path -LiteralPath $aiOptionsCsv) {
    $href = if ($AssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $AssetBaseUrl -RelativePath $aiOptionsCsv } else { "$RootHref$aiOptionsCsv" }
    $links.Add("<a class=""export-button"" href=""$href"" download>AI options CSV</a>")
  }

  if ($links.Count -gt 0) {
    [void]$Builder.AppendLine('        <div class="license-notice lexical-downloads">')
    [void]$Builder.AppendLine('          <strong>Downloads:</strong> Book-local lexical files. CSV rows are lexical options, not translations; preserve row-level source/license columns.')
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
  [void]$page.AppendLine('        <p>Browse imported Hebrew source texts by corpus with lexical HUD support. Work pages preserve source/version/license metadata and expose book-local lexical HUD data when available.</p>')
  [void]$page.AppendLine('        <p>No public English translation layer is displayed here; lexical rows are source-indexed study options.</p>')
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

if (-not $SkipSitePages) {
  Write-Utf8 -Path 'index.html' -Content (New-LibraryPageHtml -Sources $sources -HrefPrefix '' -HomeHref './' -AboutHref 'about/')

  $aboutPage = New-Object System.Text.StringBuilder
  Append-SiteHead -Builder $aboutPage -Title 'About / License'
  [void]$aboutPage.AppendLine('  <main>')
  [void]$aboutPage.AppendLine('    <div class="shell">')
  [void]$aboutPage.AppendLine('      <div class="hero">')
  [void]$aboutPage.AppendLine('        <p class="crumbs"><a href="../">Home</a> &middot; <a href="../library/">Full Library</a></p>')
  [void]$aboutPage.AppendLine('        <h1>About / License</h1>')
  [void]$aboutPage.AppendLine('        <p>This site is a Hebrew-first source-text workbench with clickable lexical HUD support and explicit source/license layers. It is not an official edition, not a translation publication, and not a replacement for checking the cited source versions.</p>')
  [void]$aboutPage.AppendLine('      </div>')
  [void]$aboutPage.AppendLine('      <div style="padding:22px">')
  [void]$aboutPage.AppendLine('        <section class="home-section">')
  [void]$aboutPage.AppendLine('          <h2>Source Texts</h2>')
  [void]$aboutPage.AppendLine('          <p>Hebrew source texts retain their original source/version licenses. Each work page preserves version title, source URL, digitization source, and license metadata where available.</p>')
  [void]$aboutPage.AppendLine('          <p>No copyrighted English translations are imported into the source layer.</p>')
  [void]$aboutPage.AppendLine('        </section>')
  [void]$aboutPage.AppendLine('        <section class="home-section">')
  [void]$aboutPage.AppendLine('          <h2>Lexical HUD</h2>')
  [void]$aboutPage.AppendLine('          <p>Lexical rows retain per-source licensing. Wikidata rows remain CC0, OpenScriptures rows remain CC BY 4.0, Wiktionary/Kaikki rows remain CC BY-SA 4.0 / GFDL, and project-authored grammar, abbreviation, formula, and scoped lexical rows are labeled separately.</p>')
  [void]$aboutPage.AppendLine('          <p>Lexical HUD rows are study aids and source-indexed options. They are not polished English translations.</p>')
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
      $assetRoot = if ($LexicalAssetBaseUrl.Trim()) { $LexicalAssetBaseUrl.TrimEnd('/') + '/' } else { $rootHref }
      [pscustomobject]@{
        manifest_url = if ($LexicalAssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $LexicalAssetBaseUrl -RelativePath $manifestRelative } else { "$rootHref$manifestRelative" }
        occurrence_url = if ($LexicalAssetBaseUrl.Trim()) { Join-PublicUrl -BaseUrl $LexicalAssetBaseUrl -RelativePath $occurrenceRelative } else { "$rootHref$occurrenceRelative" }
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

  $pairedBaseSource = $null
  $pairedBaseLookup = @{}
  if ($source.work_type -eq 'commentary' -and $source.base_work_id -and $sourceById.ContainsKey([string]$source.base_work_id)) {
    $pairedBaseSource = $sourceById[[string]$source.base_work_id]
    $pairedBaseLookup = New-BaseUnitLookup -BaseSource $pairedBaseSource
  }

  Append-SiteHead -Builder $page -Title $source.work_title -IncludeLexicalStyles:$workHasLexical
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <div class="shell">')
  [void]$page.AppendLine('      <div class="hero" id="work-top">')
  [void]$page.AppendLine("        <p class=""crumbs""><a href=""$rootHref"">Home</a> &middot; <a href=""${rootHref}about/"">About / License</a></p>")
  [void]$page.AppendLine("        <h1>$(Encode-Html $source.work_title)</h1>")
  if ($source.display_label) {
    [void]$page.AppendLine("        <p class=""work-label"">$(Encode-Html $source.display_label)</p>")
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
  [void]$page.AppendLine("        <p class=""meta"">$(@($source.units).Count) total source units | imported $(Encode-Html $source.import_date)</p>")
  if ($singleSourceNote) {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$(Get-SourceSummaryHtml -Note $sourceNotes[0])</p>")
  } else {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$($sourceNotes.Count) source/license notes. See footer table for details.</p>")
  }
  if ($workHasLexical) {
    $workLexicalForms = if ($null -ne $workLexicalPayload) { @($workLexicalPayload.token_index.forms) } else { @() }
    $lexicalMatched = if ($null -ne $workLexicalCounts -and $null -ne $workLexicalCounts.matched_surface_forms) {
      [int]$workLexicalCounts.matched_surface_forms
    } else {
      @($workLexicalForms | Where-Object { $_.status -eq 'matched' -and $_.lexicon_entry_id }).Count
    }
    $lexicalTotal = if ($null -ne $workLexicalCounts -and $null -ne $workLexicalCounts.total_unique_surface_forms) {
      [int]$workLexicalCounts.total_unique_surface_forms
    } else {
      $workLexicalForms.Count
    }
    if ($lexicalTotal -gt 0) {
      [void]$page.AppendLine("        <p class=""meta lexical-coverage"">Lexical HUD coverage: <strong>$lexicalMatched matched</strong> / $lexicalTotal unique forms.</p>")
    }
  }
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
        $groupBadge = if (Test-UnitsHaveLexical -WorkOccurrence $workOccurrence -Units $groupUnitsForBadge) { ' <span class="hud-badge">Lexical layer active</span>' } else { '' }
        [void]$page.AppendLine("          <h2 id=""group-$($unit.group_slug)"">$(Encode-Html $unit.group_title)$groupBadge</h2>")
      }
    }

    if ($unit.section_slug -ne $currentSection) {
      $currentSection = $unit.section_slug
      $currentChapter = ''
      if ($unit.section_title -ne $source.work_title -and $unit.section_slug -ne 'text') {
        $sectionUnitsForBadge = @($visibleUnits | Where-Object { $_.group_slug -eq $unit.group_slug -and $_.section_slug -eq $unit.section_slug })
        $sectionBadge = if (Test-UnitsHaveLexical -WorkOccurrence $workOccurrence -Units $sectionUnitsForBadge) { ' <span class="hud-badge">Lexical layer active</span>' } else { '' }
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

    [void]$page.AppendLine("          <section class=""unit"" id=""$($unit.anchor_id)"" data-unit$lexicalAttrs>")
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
    [void]$page.AppendLine('  <section class="lexical-hud" data-lexical-hud hidden aria-live="polite">')
    [void]$page.AppendLine('    <div class="hud-head"><h2>Lexical HUD</h2><button class="hud-close" type="button" data-hud-close>Close</button></div>')
    [void]$page.AppendLine('    <dl class="lexical-fields">')
    [void]$page.AppendLine('      <div class="lexical-field-row"><dt>Clicked Hebrew form</dt><dd data-hud-word lang="he" dir="rtl">N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-hebrew-strict-row><dt>Strict Hebrew</dt><dd data-hud-hebrew-strict>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-aramaic-strict-row><dt>Strict Aramaic</dt><dd data-hud-aramaic-strict>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-lemma-strict-row><dt>Strict Lemma</dt><dd data-hud-lemma-strict>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-breakdown-row><dt>Breakdown</dt><dd data-hud-breakdown>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-potential-row><dt>Potential options</dt><dd data-hud-potential>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-related-row hidden><dt>Related options</dt><dd data-hud-related>N/A</dd></div>')
    [void]$page.AppendLine('      <div class="lexical-field-row" data-hud-caution-row hidden><dt>Caution</dt><dd data-hud-caution>N/A</dd></div>')
    [void]$page.AppendLine('    </dl>')
    [void]$page.AppendLine('    <details class="source-details">')
    [void]$page.AppendLine('      <summary>Sources / licenses</summary>')
    [void]$page.AppendLine('      <div data-hud-sources></div>')
    [void]$page.AppendLine('    </details>')
    [void]$page.AppendLine('  </section>')
    if ($null -ne $workLexicalExternal) {
      $lexicalConfigJson = (ConvertTo-Json -InputObject $workLexicalExternal -Depth 10 -Compress) -replace '</script', '<\/script'
      $occurrenceUrl = [System.Net.WebUtility]::HtmlEncode([string]$workLexicalExternal.occurrence_url)
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-occurrences data-src=""$occurrenceUrl"">{}</script>")
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-config>$lexicalConfigJson</script>")
    } else {
      $occurrenceJson = (ConvertTo-Json -InputObject $workOccurrence -Depth 30 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-occurrences>$occurrenceJson</script>")
      $tokenIndexJson = (ConvertTo-Json -InputObject $workLexicalPayload.token_index -Depth 30 -Compress) -replace '</script', '<\/script'
      $lexiconJson = (ConvertTo-Json -InputObject $workLexicalPayload.lexicon -Depth 30 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-token-index>$tokenIndexJson</script>")
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-lexicon>$lexiconJson</script>")
    }
  }
  if ($workHasLexical) {
    Append-LexicalHudScript -Builder $page
  }
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')

  Write-Utf8 -Path "$($source.work_slug)\index.html" -Content $page.ToString()
}

if (-not $SkipOverlayExports) {
  Write-FullSiteOverlayManifest -Sources $sources
}
