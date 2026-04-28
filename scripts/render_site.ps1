param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [int]$MaxUnits = 0
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
  $html = Convert-HebrewDisplayHtml $Text
  $html = $html -replace '(?i)&lt;br\s*/?&gt;', '<br>'
  $html = $html -replace '(?i)&lt;b&gt;', '<strong>'
  $html = $html -replace '(?i)&lt;/b&gt;', '</strong>'
  $html = $html -replace '(?i)&lt;strong&gt;', '<strong>'
  $html = $html -replace '(?i)&lt;/strong&gt;', '</strong>'
  $html = $html -replace '(?i)&lt;small&gt;', '<span class="source-small">'
  $html = $html -replace '(?i)&lt;/small&gt;', '</span>'
  return $html
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

function Get-HomeGroup {
  param([object]$Source)
  if ($Source.work_id -eq 'orot') {
    return 'Rav Kook School'
  }
  $slugParts = @($Source.work_slug -split '[\\/]' | Where-Object { $_ })
  if ($slugParts.Count -gt 1) {
    $first = $slugParts[0]
    if ($first -eq 'tanakh') { return 'Tanakh' }
    if ($first -eq 'ari') { return 'Ari School' }
    if ($first -eq 'gra') { return 'Gra School' }
    if ($first -eq 'rav-kook') { return 'Rav Kook School' }
    return (Get-Culture).TextInfo.ToTitleCase(($first -replace '-', ' '))
  }
  return 'Works'
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
  [void]$Builder.AppendLine('    body { margin: 0; background: radial-gradient(circle at top, rgba(147,167,209,0.14), transparent 32%), linear-gradient(180deg, #0a0b0d 0%, #0f1117 100%); color: var(--text); font-family: Georgia, "Times New Roman", serif; }')
  [void]$Builder.AppendLine('    a { color: var(--accent); }')
  [void]$Builder.AppendLine('    main { width: min(1440px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 60px; }')
  [void]$Builder.AppendLine('    h1, h2, h3, h4 { font-weight: 400; margin: 0; scroll-margin-top: 18px; }')
  [void]$Builder.AppendLine('    h1 { font-size: clamp(2.4rem, 6vw, 5.4rem); line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 14px; }')
  [void]$Builder.AppendLine('    h2 { color: var(--accent); font-size: 1.5rem; margin: 34px 0 14px; }')
  [void]$Builder.AppendLine('    h3 { color: var(--text); font-size: 1.15rem; margin: 22px 0 10px; }')
  [void]$Builder.AppendLine('    h4 { color: var(--accent-2); font-size: 0.95rem; margin: 16px 0 10px; text-transform: uppercase; letter-spacing: 0.08em; }')
  [void]$Builder.AppendLine('    p { color: var(--muted); line-height: 1.6; margin: 0 0 8px; }')
  [void]$Builder.AppendLine('    .shell { border: 1px solid var(--line); background: linear-gradient(180deg, rgba(17,19,24,0.94), rgba(10,11,13,0.94)); box-shadow: 0 24px 80px rgba(0,0,0,0.35); }')
  [void]$Builder.AppendLine('    .hero { padding: 22px 22px 18px; border-bottom: 1px solid var(--line); }')
  [void]$Builder.AppendLine('    .crumbs, .meta { color: var(--muted); font-size: 0.92rem; }')
  [void]$Builder.AppendLine('    .license-notice { margin-top: 12px; border: 1px solid var(--line); background: rgba(147,167,209,0.07); padding: 10px 12px; color: var(--muted); font-size: 0.92rem; line-height: 1.55; }')
  [void]$Builder.AppendLine('    .license-notice strong { color: var(--text); font-weight: 400; }')
  [void]$Builder.AppendLine('    .export-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .export-button { border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--accent); padding: 5px 9px; text-decoration: none; letter-spacing: 0.04em; }')
  [void]$Builder.AppendLine('    .progress-panel { margin-top: 14px; border: 1px solid var(--line); background: rgba(20,24,31,0.58); padding: 12px; }')
  [void]$Builder.AppendLine('    .progress-summary { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: baseline; color: var(--muted); font-size: 0.92rem; }')
  [void]$Builder.AppendLine('    .progress-summary strong { color: var(--text); font-weight: 400; }')
  [void]$Builder.AppendLine('    .progress-meter { height: 5px; margin-top: 10px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); overflow: hidden; }')
  [void]$Builder.AppendLine('    .progress-meter span { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }')
  [void]$Builder.AppendLine('    .progress-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }')
  [void]$Builder.AppendLine('    .filter-button { border: 1px solid var(--line-2); background: transparent; color: var(--muted); padding: 6px 10px; font: inherit; cursor: pointer; }')
  [void]$Builder.AppendLine('    .filter-button[aria-pressed="true"], .filter-button:hover { color: var(--text); border-color: var(--accent); background: rgba(214,190,138,0.08); }')
  [void]$Builder.AppendLine('    .filter-button:disabled { cursor: default; opacity: 0.45; }')
  [void]$Builder.AppendLine('    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 20px; }')
  [void]$Builder.AppendLine('    .home-section { margin-top: 26px; }')
  [void]$Builder.AppendLine('    .home-section:first-child { margin-top: 0; }')
  [void]$Builder.AppendLine('    .work-card { display: block; border: 1px solid var(--line); background: var(--panel); padding: 18px; text-decoration: none; min-height: 140px; backdrop-filter: blur(3px); }')
  [void]$Builder.AppendLine('    .work-card strong { display: block; color: var(--text); font-size: 1.2rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    .work-card .meta { display: block; margin-top: 6px; }')
  [void]$Builder.AppendLine('    .reader-shell { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 22px; align-items: start; padding: 22px; }')
  [void]$Builder.AppendLine('    .toc { position: sticky; top: 12px; max-height: calc(100vh - 24px); overflow: auto; border: 1px solid var(--line); background: var(--panel); padding: 14px; }')
  [void]$Builder.AppendLine('    .toc ul { list-style: none; padding: 0; margin: 0; }')
  [void]$Builder.AppendLine('    .toc li { margin: 0 0 7px; }')
  [void]$Builder.AppendLine('    .toc a { text-decoration: none; font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .section-block { margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .unit { border-top: 1px solid var(--line); padding: 16px 0; }')
  [void]$Builder.AppendLine('    .unit[hidden] { display: none; }')
  [void]$Builder.AppendLine('    .unit-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .anchor { text-decoration: none; color: var(--accent); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .unit-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 18px; }')
  [void]$Builder.AppendLine('    .hebrew { color: var(--hebrew); direction: rtl; unicode-bidi: plaintext; text-align: right; font-size: 1.22rem; line-height: 1.82; }')
  [void]$Builder.AppendLine('    .hebrew strong { color: #fff5df; font-weight: 700; }')
  [void]$Builder.AppendLine('    .source-small { font-size: 0.82em; color: var(--muted); }')
  [void]$Builder.AppendLine('    .placeholder { color: #8c857c; }')
  [void]$Builder.AppendLine('    .overlay-block { border: 1px solid var(--line); background: var(--panel-2); padding: 12px; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .overlay-label { display: block; color: var(--accent); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    .lexical-word { display: inline-block; margin: 0 0.08em; padding: 0.04em 0.08em; border: 1px solid transparent; border-radius: 7px; color: var(--hebrew); background: transparent; font: inherit; cursor: pointer; direction: rtl; unicode-bidi: isolate; }')
    [void]$Builder.AppendLine('    .lexical-word:hover, .lexical-word[aria-pressed="true"] { border-color: var(--accent); background: rgba(214,190,138,0.1); }')
    [void]$Builder.AppendLine('    .lexical-hud { position: sticky; top: 14px; border: 1px solid var(--line); background: var(--panel-2); padding: 18px; box-shadow: 0 18px 60px rgba(0,0,0,0.28); }')
    [void]$Builder.AppendLine('    .lexical-hud[hidden] { display: none; }')
    [void]$Builder.AppendLine('    .hud-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 14px; }')
    [void]$Builder.AppendLine('    .hud-head h2 { margin: 0; font-size: 1.1rem; color: var(--text); }')
    [void]$Builder.AppendLine('    .hud-close { border: 1px solid var(--line-2); background: transparent; color: var(--muted); padding: 4px 8px; font: inherit; cursor: pointer; }')
    [void]$Builder.AppendLine('    .hud-close:hover { color: var(--text); border-color: var(--accent); }')
    [void]$Builder.AppendLine('    .lexical-fields { display: grid; grid-template-columns: minmax(140px, 220px) 1fr; gap: 10px 18px; margin: 0; }')
    [void]$Builder.AppendLine('    .lexical-fields dt { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.78rem; }')
    [void]$Builder.AppendLine('    .lexical-fields dd { margin: 0; color: var(--text); }')
    [void]$Builder.AppendLine('    .lexical-fields ul { margin: 0; padding-left: 18px; }')
    [void]$Builder.AppendLine('    .source-details { margin-top: 16px; }')
    [void]$Builder.AppendLine('    .source-row { border-top: 1px solid var(--line); padding: 12px 0; }')
    [void]$Builder.AppendLine('    .source-row:first-child { border-top: 0; }')
    [void]$Builder.AppendLine('    .source-row strong { color: var(--text); font-weight: 400; }')
  }
  [void]$Builder.AppendLine('    .source-citation { overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    .source-note-index { color: var(--accent); font-size: 0.82rem; margin-left: 6px; }')
  [void]$Builder.AppendLine('    .source-table { width: 100%; border-collapse: collapse; margin-top: 24px; color: var(--muted); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .source-table th, .source-table td { border-top: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: top; }')
  [void]$Builder.AppendLine('    details { border: 1px solid var(--line); background: var(--panel); padding: 10px 12px; }')
  [void]$Builder.AppendLine('    summary { cursor: pointer; color: var(--accent); }')
  [void]$Builder.AppendLine('    .fallback-note { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--text); }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .lexical-fields { grid-template-columns: 1fr; } .toc, .lexical-hud { position: static; max-height: none; } }')
  } else {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  }
  [void]$Builder.AppendLine('  </style>')
  [void]$Builder.AppendLine('</head>')
  [void]$Builder.AppendLine('<body>')
}

function Append-ReaderScript {
  param([System.Text.StringBuilder]$Builder)

  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    (() => {')
  [void]$Builder.AppendLine('      const units = Array.from(document.querySelectorAll("[data-unit]"));')
  [void]$Builder.AppendLine('      const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));')
  [void]$Builder.AppendLine('      const nextButton = document.querySelector("[data-next-not-done]");')
  [void]$Builder.AppendLine('      let currentFilter = "all";')
  [void]$Builder.AppendLine('      const matchesFilter = (unit, filter) => {')
  [void]$Builder.AppendLine('        const done = unit.dataset.complete === "true";')
  [void]$Builder.AppendLine('        return filter === "all" || (filter === "done" && done) || (filter === "not-done" && !done);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const applyFilter = (filter) => {')
  [void]$Builder.AppendLine('        currentFilter = filter;')
  [void]$Builder.AppendLine('        units.forEach((unit) => { unit.hidden = !matchesFilter(unit, filter); });')
  [void]$Builder.AppendLine('        filterButtons.forEach((button) => {')
  [void]$Builder.AppendLine('          button.setAttribute("aria-pressed", String(button.dataset.filter === filter));')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      filterButtons.forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => applyFilter(button.dataset.filter));')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      if (nextButton) {')
  [void]$Builder.AppendLine('        nextButton.addEventListener("click", () => {')
  [void]$Builder.AppendLine('          const incomplete = units.filter((unit) => unit.dataset.complete !== "true");')
  [void]$Builder.AppendLine('          if (!incomplete.length) return;')
  [void]$Builder.AppendLine('          if (currentFilter === "done") applyFilter("not-done");')
  [void]$Builder.AppendLine('          const currentY = window.scrollY + 12;')
  [void]$Builder.AppendLine('          const target = incomplete.find((unit) => unit.getBoundingClientRect().top + window.scrollY > currentY) || incomplete[0];')
  [void]$Builder.AppendLine('          if (target.id) history.replaceState(null, "", "#" + target.id);')
  [void]$Builder.AppendLine('          target.scrollIntoView({ behavior: "smooth", block: "start" });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      }')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Append-HomeScript {
  param([System.Text.StringBuilder]$Builder)

  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    (() => {')
  [void]$Builder.AppendLine('      const cards = Array.from(document.querySelectorAll("[data-work-card]"));')
  [void]$Builder.AppendLine('      const sections = Array.from(document.querySelectorAll("[data-home-section]"));')
  [void]$Builder.AppendLine('      const buttons = Array.from(document.querySelectorAll("[data-work-filter]"));')
  [void]$Builder.AppendLine('      const matchesFilter = (card, filter) => {')
  [void]$Builder.AppendLine('        const done = card.dataset.workComplete === "true";')
  [void]$Builder.AppendLine('        return filter === "all" || (filter === "done" && done) || (filter === "not-done" && !done);')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const applyFilter = (filter) => {')
  [void]$Builder.AppendLine('        cards.forEach((card) => { card.hidden = !matchesFilter(card, filter); });')
  [void]$Builder.AppendLine('        sections.forEach((section) => {')
  [void]$Builder.AppendLine('          const visibleCard = section.querySelector("[data-work-card]:not([hidden])");')
  [void]$Builder.AppendLine('          section.hidden = !visibleCard;')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        buttons.forEach((button) => {')
  [void]$Builder.AppendLine('          button.setAttribute("aria-pressed", String(button.dataset.workFilter === filter));')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      buttons.forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => applyFilter(button.dataset.workFilter));')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Append-LexicalHudScript {
  param([System.Text.StringBuilder]$Builder)

  $geresh = [char]0x05F3
  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    (() => {')
  [void]$Builder.AppendLine('      const sampleNodes = Array.from(document.querySelectorAll("[data-lexical-json]"));')
  [void]$Builder.AppendLine('      if (!sampleNodes.length) return;')
  [void]$Builder.AppendLine('      const samples = new Map();')
  [void]$Builder.AppendLine('      sampleNodes.forEach((node) => {')
  [void]$Builder.AppendLine('        const sample = JSON.parse(node.textContent);')
  [void]$Builder.AppendLine('        samples.set(sample.sample_id, sample);')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      const buttons = Array.from(document.querySelectorAll("[data-lexical-token]"));')
  [void]$Builder.AppendLine("      const normalizeHebrewDisplay = (value) => typeof value === ""string"" ? value.replace(/([\u0590-\u05FF])'/g, ""`$1$geresh"") : value;")
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
  [void]$Builder.AppendLine('      const renderSources = (sourceBox, rows) => {')
  [void]$Builder.AppendLine('        if (!sourceBox) return;')
  [void]$Builder.AppendLine('        sourceBox.replaceChildren();')
  [void]$Builder.AppendLine('        (rows || []).forEach((row) => {')
  [void]$Builder.AppendLine('          const section = document.createElement("div");')
  [void]$Builder.AppendLine('          section.className = "source-row";')
  [void]$Builder.AppendLine('          const title = document.createElement("p");')
  [void]$Builder.AppendLine('          const link = document.createElement("a");')
  [void]$Builder.AppendLine('          link.href = row.source_url || "#";')
  [void]$Builder.AppendLine('          link.textContent = row.source_name || "Source";')
  [void]$Builder.AppendLine('          const strong = document.createElement("strong");')
  [void]$Builder.AppendLine('          strong.appendChild(link);')
  [void]$Builder.AppendLine('          title.appendChild(strong);')
  [void]$Builder.AppendLine('          title.append(` | ${row.source_id || "N/A"} | License: ${row.license || "N/A"}`);')
  [void]$Builder.AppendLine('          const fields = document.createElement("p");')
  [void]$Builder.AppendLine('          fields.textContent = `Fields: ${(row.fields_used || []).join(", ") || "N/A"}`;')
  [void]$Builder.AppendLine('          const notes = document.createElement("p");')
  [void]$Builder.AppendLine('          notes.textContent = row.notes || "";')
  [void]$Builder.AppendLine('          section.append(title, fields, notes);')
  [void]$Builder.AppendLine('          sourceBox.appendChild(section);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderWord = (unit, hud, word) => {')
  [void]$Builder.AppendLine('        if (!unit || !hud || !word) return;')
  [void]$Builder.AppendLine('        unit.querySelectorAll("[data-lexical-token]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lexicalToken === word.token_id)));')
  [void]$Builder.AppendLine('        setText(hud, "[data-hud-word]", word.hebrew_word);')
  [void]$Builder.AppendLine('        setText(hud, "[data-hud-transliteration]", word.transliteration);')
  [void]$Builder.AppendLine('        setList(hud, "[data-hud-renderings]", word.strict_renderings);')
  [void]$Builder.AppendLine('        setText(hud, "[data-hud-root]", word.root);')
  [void]$Builder.AppendLine('        setText(hud, "[data-hud-root-transliteration]", word.root_transliteration);')
  [void]$Builder.AppendLine('        setList(hud, "[data-hud-root-meaning]", word.root_meaning);')
  [void]$Builder.AppendLine('        renderSources(hud.querySelector("[data-hud-sources]"), word.source_rows);')
  [void]$Builder.AppendLine('        const details = hud.querySelector("details");')
  [void]$Builder.AppendLine('        if (details) details.open = false;')
  [void]$Builder.AppendLine('        hud.hidden = false;')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      buttons.forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => {')
  [void]$Builder.AppendLine('          const unit = button.closest("[data-lexical-unit]");')
  [void]$Builder.AppendLine('          const hud = unit ? unit.querySelector("[data-lexical-hud]") : null;')
  [void]$Builder.AppendLine('          const sample = unit ? samples.get(unit.dataset.lexicalSample) : null;')
  [void]$Builder.AppendLine('          const word = sample ? (sample.words || []).find((item) => item.token_id === button.dataset.lexicalToken) : null;')
  [void]$Builder.AppendLine('          renderWord(unit, hud, word);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      document.querySelectorAll("[data-hud-close]").forEach((button) => {')
  [void]$Builder.AppendLine('        button.addEventListener("click", () => {')
  [void]$Builder.AppendLine('          const hud = button.closest("[data-lexical-hud]");')
  [void]$Builder.AppendLine('          const unit = button.closest("[data-lexical-unit]");')
  [void]$Builder.AppendLine('          if (hud) hud.hidden = true;')
  [void]$Builder.AppendLine('          if (unit) unit.querySelectorAll("[data-lexical-token]").forEach((wordButton) => wordButton.setAttribute("aria-pressed", "false"));')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Get-LexicalSamplesByUnit {
  param([string]$LexicalDir = 'data/lexical')

  $samples = @{}
  if (-not (Test-Path $LexicalDir)) { return $samples }

  foreach ($file in @(Get-ChildItem -Path $LexicalDir -Filter '*.json')) {
    $sample = Read-Json -Path $file.FullName
    if ($sample.work_id -and $sample.unit_id) {
      $samples["$($sample.work_id)|$($sample.unit_id)"] = $sample
    }
  }
  return $samples
}

$sources = @(Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object { Read-Json -Path $_.FullName } | Sort-Object work_title)
$lexicalSamplesByUnit = Get-LexicalSamplesByUnit

$homePage = New-Object System.Text.StringBuilder
Append-SiteHead -Builder $homePage -Title 'Translation Workspace'
[void]$homePage.AppendLine('  <main>')
[void]$homePage.AppendLine('    <div class="shell">')
[void]$homePage.AppendLine('      <div class="hero">')
[void]$homePage.AppendLine('        <h1>Translation Workspace</h1>')
[void]$homePage.AppendLine('        <p>Hebrew source infrastructure first. Overlays stay separate. English remains placeholder-only until you write it.</p>')
[void]$homePage.AppendLine("        <div class=""license-notice""><strong>English overlay license:</strong> $(Encode-Html $overlayLicenseNotice)</div>")
[void]$homePage.AppendLine('        <div class="export-actions" aria-label="Full-site overlay exports">')
[void]$homePage.AppendLine('          <span>Full overlay export:</span>')
[void]$homePage.AppendLine('          <a class="export-button" href="overlay-export.csv" download>CSV</a>')
[void]$homePage.AppendLine('          <a class="export-button" href="overlay-export.json" download>JSON</a>')
[void]$homePage.AppendLine('          <a class="export-button" href="overlay-export.md" download>Markdown</a>')
[void]$homePage.AppendLine('        </div>')
[void]$homePage.AppendLine('      </div>')
[void]$homePage.AppendLine('      <div style="padding:22px">')
[void]$homePage.AppendLine('        <div class="progress-controls" aria-label="Work progress filters">')
[void]$homePage.AppendLine('          <button class="filter-button" type="button" data-work-filter="all" aria-pressed="true">All</button>')
[void]$homePage.AppendLine('          <button class="filter-button" type="button" data-work-filter="done" aria-pressed="false">Done</button>')
[void]$homePage.AppendLine('          <button class="filter-button" type="button" data-work-filter="not-done" aria-pressed="false">Not done</button>')
[void]$homePage.AppendLine('        </div>')
$homeGroups = $sources | Group-Object { Get-HomeGroup $_ } | Sort-Object @{ Expression = { if ($_.Name -eq 'Works') { 0 } elseif ($_.Name -eq 'Tanakh') { 1 } else { 2 } } }, Name
foreach ($homeGroup in $homeGroups) {
  [void]$homePage.AppendLine('        <section class="home-section" data-home-section>')
  [void]$homePage.AppendLine("          <h2>$(Encode-Html $homeGroup.Name)</h2>")
  [void]$homePage.AppendLine('          <div class="home-grid">')
  foreach ($source in @($homeGroup.Group | Sort-Object work_title)) {
    $homeOverlay = Get-OverlayForSource -Source $source -OverlayDir $OverlayDir
    $homeProgress = Get-WorkProgress -Source $source -Overlay $homeOverlay
    $workComplete = if ($homeProgress.total -gt 0 -and $homeProgress.done -eq $homeProgress.total) { 'true' } else { 'false' }
    [void]$homePage.AppendLine("            <a class=""work-card"" href=""$($source.work_slug)/"" data-work-card data-work-complete=""$workComplete"">")
    [void]$homePage.AppendLine("              <strong>$(Encode-Html $source.work_title)</strong>")
    [void]$homePage.AppendLine("              <span class=""meta"">$(@($source.units).Count) source units | $(Encode-Html $source.source_system) | imported $(Encode-Html $source.import_date)</span>")
    [void]$homePage.AppendLine("              <span class=""meta"">Progress: $($homeProgress.done) / $($homeProgress.total) done | $($homeProgress.percent_label)% complete</span>")
    [void]$homePage.AppendLine('            </a>')
  }
  [void]$homePage.AppendLine('          </div>')
  [void]$homePage.AppendLine('        </section>')
}
[void]$homePage.AppendLine('      </div>')
[void]$homePage.AppendLine('    </div>')
[void]$homePage.AppendLine('  </main>')
Append-HomeScript -Builder $homePage
[void]$homePage.AppendLine('</body>')
[void]$homePage.AppendLine('</html>')
Write-Utf8 -Path 'index.html' -Content $homePage.ToString()

$allExportRows = New-Object System.Collections.Generic.List[object]
foreach ($source in $sources) {
  $overlay = Get-OverlayForSource -Source $source -OverlayDir $OverlayDir
  $progress = Get-WorkProgress -Source $source -Overlay $overlay
  $exportRows = Get-OverlayExportRows -Source $source -Overlay $overlay
  Write-OverlayExports -WorkSlug $source.work_slug -Rows $exportRows
  foreach ($row in @($exportRows)) {
    $allExportRows.Add($row)
  }
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
  $workHasLexicalSample = $false
  foreach ($unit in $visibleUnits) {
    if ($lexicalSamplesByUnit.ContainsKey("$($source.work_id)|$($unit.unit_id)")) {
      $workHasLexicalSample = $true
      break
    }
  }

  Append-SiteHead -Builder $page -Title $source.work_title -IncludeLexicalStyles:$workHasLexicalSample
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <div class="shell">')
  [void]$page.AppendLine('      <div class="hero">')
  [void]$page.AppendLine("        <p class=""crumbs""><a href=""$rootHref"">Home</a></p>")
  [void]$page.AppendLine("        <h1>$(Encode-Html $source.work_title)</h1>")
  [void]$page.AppendLine("        <p class=""meta"">$(@($source.units).Count) total source units | imported $(Encode-Html $source.import_date)</p>")
  if ($singleSourceNote) {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$(Get-SourceSummaryHtml -Note $sourceNotes[0])</p>")
  } else {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$($sourceNotes.Count) source/license notes. See footer table for details.</p>")
  }
  [void]$page.AppendLine("        <div class=""license-notice""><strong>English overlay license:</strong> $(Encode-Html $overlayLicenseNotice)</div>")
  [void]$page.AppendLine('        <div class="export-actions" aria-label="Overlay exports">')
  [void]$page.AppendLine('          <span>Overlay export:</span>')
  [void]$page.AppendLine('          <a class="export-button" href="overlay-export.csv" download>CSV</a>')
  [void]$page.AppendLine('          <a class="export-button" href="overlay-export.json" download>JSON</a>')
  [void]$page.AppendLine('          <a class="export-button" href="overlay-export.md" download>Markdown</a>')
  [void]$page.AppendLine('        </div>')
  [void]$page.AppendLine('        <div class="progress-panel" data-progress-panel>')
  [void]$page.AppendLine("          <div class=""progress-summary""><span>Progress</span><strong>$($progress.done) / $($progress.total) done</strong><span>$($progress.percent_label)% complete</span></div>")
  [void]$page.AppendLine("          <div class=""progress-meter"" aria-label=""$($progress.percent_label)% complete""><span style=""width:$($progress.percent)%""></span></div>")
  [void]$page.AppendLine('          <div class="progress-controls" aria-label="Progress filters">')
  [void]$page.AppendLine('            <button class="filter-button" type="button" data-filter="all" aria-pressed="true">All</button>')
  [void]$page.AppendLine('            <button class="filter-button" type="button" data-filter="done" aria-pressed="false">Done</button>')
  [void]$page.AppendLine('            <button class="filter-button" type="button" data-filter="not-done" aria-pressed="false">Not done</button>')
  if ($progress.done -lt $progress.total) {
    [void]$page.AppendLine('            <button class="filter-button" type="button" data-next-not-done>Next not done</button>')
  } else {
    [void]$page.AppendLine('            <button class="filter-button" type="button" data-next-not-done disabled>Next not done</button>')
  }
  [void]$page.AppendLine('          </div>')
  [void]$page.AppendLine('        </div>')
  if ($MaxUnits -gt 0) {
    [void]$page.AppendLine("        <p class=""fallback-note"">Fallback render active. Showing first $MaxUnits units only while route stability is verified.</p>")
  }
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('      <div class="reader-shell">')
  [void]$page.AppendLine('        <nav class="toc" aria-label="Table of contents">')
  foreach ($group in $source.outline) {
    $showGroupTitle = ($group.group_title -ne $source.work_title -and $group.group_slug -ne 'text')
    $visibleSections = @($group.sections | Where-Object { $_.section_title -ne $source.work_title -and $_.section_slug -ne 'text' })
    if (-not $showGroupTitle -and $visibleSections.Count -eq 0) {
      continue
    }
    [void]$page.AppendLine('          <div class="section-block">')
    if ($showGroupTitle) {
      [void]$page.AppendLine("            <h2 id=""toc-$($group.group_slug)"">$(Encode-Html $group.group_title)</h2>")
    }
    if ($visibleSections.Count -gt 0) {
      [void]$page.AppendLine('            <ul>')
      foreach ($section in $visibleSections) {
        [void]$page.AppendLine("              <li><a href=""#section-$($group.group_slug)-$($section.section_slug)"">$(Encode-Html $section.section_title)</a></li>")
      }
      [void]$page.AppendLine('            </ul>')
    }
    [void]$page.AppendLine('          </div>')
  }
  [void]$page.AppendLine('        </nav>')
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
        [void]$page.AppendLine("          <h2 id=""group-$($unit.group_slug)"">$(Encode-Html $unit.group_title)</h2>")
      }
    }

    if ($unit.section_slug -ne $currentSection) {
      $currentSection = $unit.section_slug
      $currentChapter = ''
      if ($unit.section_title -ne $source.work_title -and $unit.section_slug -ne 'text') {
        [void]$page.AppendLine("          <h3 id=""section-$($unit.group_slug)-$($unit.section_slug)"">$(Encode-Html $unit.section_title)</h3>")
      }
    }

    if ($null -ne $unit.chapter_number -and $unit.chapter_number.ToString() -ne $currentChapter) {
      $currentChapter = $unit.chapter_number.ToString()
      [void]$page.AppendLine("          <h4 id=""chapter-$($unit.group_slug)-$($unit.section_slug)-$($unit.chapter_number)"">Chapter $($unit.chapter_number)</h4>")
    }

    $sourceNoteNumber = $sourceNoteByKey[(Get-SourceKey -Unit $unit)]
    $overlayUnit = Get-OverlayUnit -Overlay $overlay -UnitId $unit.unit_id
    $strict = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'strict_translation'
    $clean = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'clean_translation'
    $isDone = Test-HasContent $strict
    $completeState = if ($isDone) { 'true' } else { 'false' }
    $lexicalKey = "$($source.work_id)|$($unit.unit_id)"
    $lexicalSample = if ($lexicalSamplesByUnit.ContainsKey($lexicalKey)) { $lexicalSamplesByUnit[$lexicalKey] } else { $null }
    $lexicalAttrs = ''
    if ($null -ne $lexicalSample) {
      $lexicalAttrs = " data-lexical-unit data-lexical-sample=""$(Encode-Html $lexicalSample.sample_id)"""
    }

    [void]$page.AppendLine("          <section class=""unit"" id=""$($unit.anchor_id)"" data-unit data-complete=""$completeState""$lexicalAttrs>")
    [void]$page.AppendLine('            <div class="unit-head">')
    [void]$page.Append("              <div><h4 style=""margin:0;color:var(--text);text-transform:none;letter-spacing:0"">$(Encode-Html $unit.source_ref)")
    if (-not $singleSourceNote) {
      [void]$page.Append(" <span class=""source-note-index"">[$sourceNoteNumber]</span>")
    }
    [void]$page.AppendLine('</h4></div>')
    [void]$page.AppendLine("              <a class=""anchor"" href=""#$($unit.anchor_id)"" aria-label=""Copy link to $($unit.source_ref)"">#</a>")
    [void]$page.AppendLine('            </div>')
    [void]$page.AppendLine('            <div class="unit-grid">')
    [void]$page.AppendLine('              <div>')
    if ($null -ne $lexicalSample) {
      [void]$page.AppendLine('                <p class="hebrew lexical-inline" lang="he" dir="rtl">')
      foreach ($word in @($lexicalSample.words)) {
        [void]$page.Append("                  <button class=""lexical-word"" type=""button"" data-lexical-token=""$(Encode-Html $word.token_id)"" aria-pressed=""false"">$(Convert-HebrewDisplayHtml $word.hebrew_word)</button>")
        if ($word.trailing_punctuation) {
          [void]$page.Append((Convert-HebrewDisplayHtml $word.trailing_punctuation))
        }
        [void]$page.AppendLine('')
      }
      [void]$page.AppendLine('                </p>')
    } else {
      foreach ($paragraph in @($unit.hebrew)) {
        [void]$page.AppendLine("                <p class=""hebrew"" lang=""he"" dir=""rtl"">$(Convert-SourceHtml $paragraph)</p>")
      }
    }
    [void]$page.AppendLine('              </div>')
    [void]$page.AppendLine('              <div>')
    [void]$page.AppendLine('                <div class="overlay-block"><span class="overlay-label">Translation</span>')
    if ($isDone) {
      [void]$page.AppendLine("                  <p>$(Encode-Html $strict)</p>")
    } else {
      [void]$page.AppendLine('                  <p class="placeholder">N/A</p>')
    }
    [void]$page.AppendLine('                </div>')
    [void]$page.AppendLine('                <div class="overlay-block"><span class="overlay-label">Translator&rsquo;s Notes</span>')
    if (Test-HasContent $clean) {
      [void]$page.AppendLine("                  <p>$(Encode-Html $clean)</p>")
    } else {
      [void]$page.AppendLine('                  <p class="placeholder">N/A</p>')
    }
    [void]$page.AppendLine('                </div>')
    if ($null -ne $lexicalSample) {
      [void]$page.AppendLine('                <section class="lexical-hud" data-lexical-hud hidden aria-live="polite">')
      [void]$page.AppendLine('                  <div class="hud-head"><h2>Lexical HUD</h2><button class="hud-close" type="button" data-hud-close>Close</button></div>')
      [void]$page.AppendLine('                  <dl class="lexical-fields">')
      [void]$page.AppendLine('                    <dt>Hebrew word</dt><dd data-hud-word lang="he" dir="rtl">N/A</dd>')
      [void]$page.AppendLine('                    <dt>Transliteration</dt><dd data-hud-transliteration>N/A</dd>')
      [void]$page.AppendLine('                    <dt>Strict renderings</dt><dd data-hud-renderings>N/A</dd>')
      [void]$page.AppendLine('                    <dt>Root</dt><dd data-hud-root lang="he" dir="rtl">N/A</dd>')
      [void]$page.AppendLine('                    <dt>Root transliteration</dt><dd data-hud-root-transliteration>N/A</dd>')
      [void]$page.AppendLine('                    <dt>Root meaning</dt><dd data-hud-root-meaning>N/A</dd>')
      [void]$page.AppendLine('                  </dl>')
      [void]$page.AppendLine('                  <details class="source-details">')
      [void]$page.AppendLine('                    <summary>Sources / licenses</summary>')
      [void]$page.AppendLine('                    <div data-hud-sources></div>')
      [void]$page.AppendLine('                  </details>')
      [void]$page.AppendLine('                </section>')
    }
    [void]$page.AppendLine('              </div>')
    [void]$page.AppendLine('            </div>')
    if ($null -ne $lexicalSample) {
      $lexicalJson = (ConvertTo-Json -InputObject $lexicalSample -Depth 30 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("            <script type=""application/json"" data-lexical-json>$lexicalJson</script>")
    }
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

  [void]$page.AppendLine('        </article>')
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </main>')
  Append-ReaderScript -Builder $page
  if ($workHasLexicalSample) {
    Append-LexicalHudScript -Builder $page
  }
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')

  Write-Utf8 -Path "$($source.work_slug)\index.html" -Content $page.ToString()
}

Write-OverlayExports -WorkSlug '.' -Rows $allExportRows.ToArray()
