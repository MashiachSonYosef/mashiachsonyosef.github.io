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
  [void]$Builder.AppendLine('    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 20px; }')
  [void]$Builder.AppendLine('    .home-section { margin-top: 26px; }')
  [void]$Builder.AppendLine('    .home-section:first-child { margin-top: 0; }')
  [void]$Builder.AppendLine('    .work-card { display: block; border: 1px solid var(--line); background: var(--panel); padding: 18px; text-decoration: none; min-height: 140px; backdrop-filter: blur(3px); }')
  [void]$Builder.AppendLine('    .work-card strong { display: block; color: var(--text); font-size: 1.2rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    .work-card .meta { display: block; margin-top: 6px; }')
  [void]$Builder.AppendLine('    .work-card .work-label, .work-label { display: inline-block; margin-top: 8px; color: var(--accent); font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; }')
  [void]$Builder.AppendLine('    .reader-shell { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 22px; align-items: start; padding: 22px; }')
  [void]$Builder.AppendLine('    .toc { position: sticky; top: 12px; max-height: calc(100vh - 24px); overflow: auto; border: 1px solid var(--line); background: var(--panel); padding: 14px; }')
  [void]$Builder.AppendLine('    .toc ul { list-style: none; padding: 0; margin: 0; }')
  [void]$Builder.AppendLine('    .toc li { margin: 0 0 7px; }')
  [void]$Builder.AppendLine('    .toc a { text-decoration: none; font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .toc-start, .toc-unit { display: block; color: var(--muted); font-size: 0.86rem; margin: 5px 0 7px; overflow-wrap: anywhere; }')
  [void]$Builder.AppendLine('    .toc-start:hover, .toc-unit:hover { color: var(--accent); }')
  [void]$Builder.AppendLine('    .toc-units { display: grid; grid-template-columns: repeat(auto-fit, minmax(56px, 1fr)); gap: 2px 6px; margin-top: 5px; }')
  [void]$Builder.AppendLine('    .section-block { margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .unit { border-top: 1px solid var(--line); padding: 16px 0; }')
  [void]$Builder.AppendLine('    .unit[hidden] { display: none; }')
  [void]$Builder.AppendLine('    .unit-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .unit-nav { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-top: 12px; font-size: 0.84rem; }')
  [void]$Builder.AppendLine('    .unit-nav a { color: var(--muted); text-decoration: none; border-bottom: 1px solid var(--line); }')
  [void]$Builder.AppendLine('    .unit-nav a:hover { color: var(--accent); border-color: var(--accent); }')
  [void]$Builder.AppendLine('    .anchor { text-decoration: none; color: var(--accent); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .unit-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }')
  [void]$Builder.AppendLine('    .hebrew { color: var(--hebrew); direction: rtl; unicode-bidi: plaintext; text-align: right; font-size: 1.22rem; line-height: 1.82; }')
  [void]$Builder.AppendLine('    .hebrew strong { color: #fff5df; font-weight: 700; }')
  [void]$Builder.AppendLine('    .source-small { font-size: 0.82em; color: var(--muted); }')
  [void]$Builder.AppendLine('    .placeholder { color: #8c857c; }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    .lexical-inline { direction: rtl; unicode-bidi: plaintext; text-align: right; }')
    [void]$Builder.AppendLine('    .lexical-coverage strong { color: var(--text); font-weight: 400; }')
    [void]$Builder.AppendLine('    .lexical-word { display: inline; margin: 0 0.08em; padding: 0.04em 0.08em; border: 1px solid transparent; border-radius: 7px; color: var(--hebrew); background: transparent; font: inherit; cursor: pointer; direction: inherit; unicode-bidi: normal; }')
    [void]$Builder.AppendLine('    .lexical-word:hover, .lexical-word:focus-visible, .lexical-word[aria-pressed="true"] { border-color: var(--accent); background: rgba(214,190,138,0.1); outline: none; }')
    [void]$Builder.AppendLine('    .hud-badge { display: inline-block; margin-left: 0.45rem; padding: 1px 6px; border: 1px solid var(--line-2); border-radius: 999px; color: var(--accent); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; vertical-align: middle; }')
    [void]$Builder.AppendLine('    .lexical-slot { margin-top: 16px; }')
    [void]$Builder.AppendLine('    .lexical-hud { position: static; border: 1px solid var(--line); background: var(--panel-2); padding: 18px; box-shadow: 0 18px 60px rgba(0,0,0,0.28); }')
    [void]$Builder.AppendLine('    .lexical-hud[hidden] { display: none; }')
    [void]$Builder.AppendLine('    .hud-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 14px; }')
    [void]$Builder.AppendLine('    .hud-head h2 { margin: 0; font-size: 1.1rem; color: var(--text); }')
    [void]$Builder.AppendLine('    .hud-close { border: 1px solid var(--line-2); background: transparent; color: var(--muted); padding: 4px 8px; font: inherit; cursor: pointer; }')
    [void]$Builder.AppendLine('    .hud-close:hover { color: var(--text); border-color: var(--accent); }')
    [void]$Builder.AppendLine('    .lexical-fields { display: grid; grid-template-columns: minmax(140px, 220px) 1fr; gap: 10px 18px; margin: 0; }')
    [void]$Builder.AppendLine('    .lexical-fields dt { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.78rem; }')
    [void]$Builder.AppendLine('    .lexical-fields dd { margin: 0; color: var(--text); }')
    [void]$Builder.AppendLine('    .lexical-fields ul { margin: 0; padding-left: 18px; }')
    [void]$Builder.AppendLine('    .breakdown-list { display: grid; gap: 8px; }')
    [void]$Builder.AppendLine('    .breakdown-row { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 8px; }')
    [void]$Builder.AppendLine('    .breakdown-row strong { color: var(--hebrew); font-weight: 400; }')
    [void]$Builder.AppendLine('    .breakdown-row p { margin: 0 0 4px; }')
    [void]$Builder.AppendLine('    .lexical-entry-list { display: grid; gap: 10px; }')
    [void]$Builder.AppendLine('    .lexical-context-note { margin: 0 0 10px; color: var(--muted); font-size: 0.9rem; }')
    [void]$Builder.AppendLine('    .lexical-entry { border: 1px solid var(--line); background: rgba(255,255,255,0.025); padding: 10px; }')
    [void]$Builder.AppendLine('    .lexical-entry h3 { margin: 0 0 6px; color: var(--text); font-size: 0.94rem; font-weight: 400; }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-hebrew { color: var(--hebrew); }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-meta { margin: 0 0 6px; color: var(--muted); font-size: 0.86rem; }')
    [void]$Builder.AppendLine('    .lexical-entry .entry-label { color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }')
    [void]$Builder.AppendLine('    .other-entries { margin-top: 12px; }')
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
  [void]$Builder.AppendLine('    .toc details { border: 0; background: transparent; padding: 0; margin: 0 0 8px; }')
  [void]$Builder.AppendLine('    .toc details details { border-left: 1px solid var(--line); padding-left: 10px; margin-left: 4px; }')
  [void]$Builder.AppendLine('    .toc summary { color: var(--accent); font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .fallback-note { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--text); }')
  [void]$Builder.AppendLine('    .paired-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin-top: 14px; }')
  [void]$Builder.AppendLine('    .paired-panel { border: 1px solid var(--line-2); background: rgba(214,190,138,0.05); padding: 12px 14px; min-width: 0; }')
  [void]$Builder.AppendLine('    .paired-panel h2 { margin: 0 0 8px; color: var(--accent); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }')
  [void]$Builder.AppendLine('    .paired-panel p { margin: 6px 0 0; }')
  [void]$Builder.AppendLine('    .paired-panel a { color: var(--accent); }')
  if ($IncludeLexicalStyles) {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .lexical-fields, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  } else {
    [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid, .paired-shell { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
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
  [void]$Builder.AppendLine('    (() => {')
  [void]$Builder.AppendLine('      const tokenIndexNode = document.querySelector("[data-lexical-token-index]");')
  [void]$Builder.AppendLine('      const lexiconNode = document.querySelector("[data-lexical-lexicon]");')
  [void]$Builder.AppendLine('      const configNode = document.querySelector("[data-lexical-config]");')
  [void]$Builder.AppendLine('      const tokenIndex = tokenIndexNode ? JSON.parse(tokenIndexNode.textContent) : { forms: [] };')
  [void]$Builder.AppendLine('      const lexicon = lexiconNode ? JSON.parse(lexiconNode.textContent) : { entries: [] };')
  [void]$Builder.AppendLine('      const lexicalConfig = configNode ? JSON.parse(configNode.textContent) : {};')
  [void]$Builder.AppendLine('      const occurrenceNode = document.querySelector("[data-lexical-occurrences]");')
  [void]$Builder.AppendLine('      const occurrences = occurrenceNode ? JSON.parse(occurrenceNode.textContent) : { units: {} };')
  [void]$Builder.AppendLine('      const tokenRows = new Map((tokenIndex.forms || []).map((row) => [row.token_index_id, row]));')
  [void]$Builder.AppendLine('      const lexiconEntries = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));')
  [void]$Builder.AppendLine('      const chunkPromises = new Map();')
  [void]$Builder.AppendLine('      const sourceRows = new Map();')
  [void]$Builder.AppendLine('      let manifestPromise = null;')
  [void]$Builder.AppendLine('      const hud = document.querySelector("[data-lexical-hud]");')
  [void]$Builder.AppendLine('      const toAbsoluteUrl = (url, base = document.baseURI) => new URL(url, base).toString();')
  [void]$Builder.AppendLine('      const fetchJson = async (url, base = document.baseURI) => {')
  [void]$Builder.AppendLine('        const response = await fetch(toAbsoluteUrl(url, base));')
  [void]$Builder.AppendLine('        if (!response.ok) throw new Error(`Unable to load lexical payload: ${response.status} ${url}`);')
  [void]$Builder.AppendLine('        return response.json();')
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
  [void]$Builder.AppendLine('      document.querySelectorAll("[data-lexical-unit]").forEach((unit) => {')
  [void]$Builder.AppendLine('        const unitData = occurrences.units ? occurrences.units[unit.id] : null;')
  [void]$Builder.AppendLine('        if (!unitData) return;')
  [void]$Builder.AppendLine('        unit.querySelectorAll("[data-lexical-paragraph]").forEach((paragraph) => {')
  [void]$Builder.AppendLine('          const paragraphIndex = Number(paragraph.dataset.lexicalParagraph);')
  [void]$Builder.AppendLine('          const paragraphData = (unitData.paragraphs || []).find((item) => Number(item.paragraph_index) === paragraphIndex);')
  [void]$Builder.AppendLine('          wrapParagraph(paragraph, paragraphData ? (paragraphData.token_index_ids || []) : []);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('      const buttons = Array.from(document.querySelectorAll("[data-lexical-token]"));')
  [void]$Builder.AppendLine('      if (!buttons.length || !hud) return;')
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
  [void]$Builder.AppendLine('        if (!rows.length) { node.textContent = "N/A"; return; }')
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
  [void]$Builder.AppendLine('      const renderEntryList = (entries) => {')
  [void]$Builder.AppendLine('        const list = document.createElement("div");')
  [void]$Builder.AppendLine('        list.className = "lexical-entry-list";')
  [void]$Builder.AppendLine('        const groupedEntries = new Map();')
  [void]$Builder.AppendLine('        entries.forEach((entry) => {')
  [void]$Builder.AppendLine('          const spelling = entry.lemma || entry.match_key || "N/A";')
  [void]$Builder.AppendLine('          const key = `${entry.context_role || "entry"}|${spelling}`;')
  [void]$Builder.AppendLine('          if (!groupedEntries.has(key)) groupedEntries.set(key, { spelling, context_role: entry.context_role || "other_possible", relation_label: entry.relation_label || "", source_refs: [], strict_renderings: [] });')
  [void]$Builder.AppendLine('          const group = groupedEntries.get(key);')
  [void]$Builder.AppendLine('          group.source_refs.push(`${entry.source_name || "source N/A"} ${entry.source_id || ""}`.trim());')
  [void]$Builder.AppendLine('          (entry.strict_renderings || []).forEach((rendering) => { if (rendering && !group.strict_renderings.includes(rendering)) group.strict_renderings.push(rendering); });')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('        const sorted = [...groupedEntries.values()].sort((a, b) => (a.context_role === "likely_contextual" ? -1 : 1) - (b.context_role === "likely_contextual" ? -1 : 1));')
  [void]$Builder.AppendLine('        sorted.forEach((entry) => {')
  [void]$Builder.AppendLine('          const card = document.createElement("section");')
  [void]$Builder.AppendLine('          card.className = "lexical-entry";')
  [void]$Builder.AppendLine('          const title = document.createElement("h3");')
  [void]$Builder.AppendLine('          const role = entry.context_role === "likely_contextual" ? "Likely contextual entry" : "Other possible entry";')
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
  [void]$Builder.AppendLine('      const renderPossibleEntries = (root, view, hasLexicalEntry) => {')
  [void]$Builder.AppendLine('        const label = root.querySelector("[data-hud-renderings-label]");')
  [void]$Builder.AppendLine('        const node = root.querySelector("[data-hud-renderings]");')
  [void]$Builder.AppendLine('        if (!node) return;')
  [void]$Builder.AppendLine('        node.replaceChildren();')
  [void]$Builder.AppendLine('        if (label) label.textContent = "Possible lexical entries";')
  [void]$Builder.AppendLine('        if (!hasLexicalEntry) { node.textContent = "No lexical entry yet."; return; }')
  [void]$Builder.AppendLine('        let entries = Array.isArray(view.possible_entries) ? view.possible_entries : [];')
  [void]$Builder.AppendLine('        entries = entries.filter((entry) => entry.relation_label !== "related root-field");')
  [void]$Builder.AppendLine('        if (!entries.length) { setList(root, "[data-hud-renderings]", view.strict_renderings || ["No lexical entry yet."]); return; }')
  [void]$Builder.AppendLine('        const likelyEntries = entries.filter((entry) => entry.context_role === "likely_contextual");')
  [void]$Builder.AppendLine('        const otherEntries = entries.filter((entry) => entry.context_role !== "likely_contextual");')
  [void]$Builder.AppendLine('        const note = document.createElement("p");')
  [void]$Builder.AppendLine('        note.className = "lexical-context-note";')
  [void]$Builder.AppendLine('        note.textContent = likelyEntries.length ? (view.surface_context_note || view.context_note || "Context resolved.") : "Context not resolved.";')
  [void]$Builder.AppendLine('        node.appendChild(note);')
  [void]$Builder.AppendLine('        if (likelyEntries.length) node.appendChild(renderEntryList(likelyEntries));')
  [void]$Builder.AppendLine('        if (otherEntries.length) {')
  [void]$Builder.AppendLine('          const details = document.createElement("details");')
  [void]$Builder.AppendLine('          details.className = "other-entries";')
  [void]$Builder.AppendLine('          const summary = document.createElement("summary");')
  [void]$Builder.AppendLine('          summary.textContent = "Show other possible entries";')
  [void]$Builder.AppendLine('          details.appendChild(summary);')
  [void]$Builder.AppendLine('          details.appendChild(renderEntryList(otherEntries));')
  [void]$Builder.AppendLine('          if (view.secondary_source_rows && view.secondary_source_rows.length) {')
  [void]$Builder.AppendLine('            const sourceDetails = document.createElement("details");')
  [void]$Builder.AppendLine('            sourceDetails.className = "source-details";')
  [void]$Builder.AppendLine('            const sourceSummary = document.createElement("summary");')
  [void]$Builder.AppendLine('            sourceSummary.textContent = "Sources / licenses for other possible entries";')
  [void]$Builder.AppendLine('            const sourceBox = document.createElement("div");')
  [void]$Builder.AppendLine('            sourceDetails.append(sourceSummary, sourceBox);')
  [void]$Builder.AppendLine('            renderSources(sourceBox, view.secondary_source_rows);')
  [void]$Builder.AppendLine('            details.appendChild(sourceDetails);')
  [void]$Builder.AppendLine('          }')
  [void]$Builder.AppendLine('          node.appendChild(details);')
  [void]$Builder.AppendLine('        }')
  [void]$Builder.AppendLine('      };')
  [void]$Builder.AppendLine('      const renderSources = (sourceBox, rows) => {')
  [void]$Builder.AppendLine('        if (!sourceBox) return;')
  [void]$Builder.AppendLine('        sourceBox.replaceChildren();')
  [void]$Builder.AppendLine('        const sourceRows = Array.isArray(rows) ? rows : (rows && rows.source_id ? [rows] : []);')
  [void]$Builder.AppendLine('        if (!sourceRows.length) { const note = document.createElement("p"); note.className = "placeholder"; note.textContent = "No cached lexical source row yet."; sourceBox.appendChild(note); return; }')
  [void]$Builder.AppendLine('        sourceRows.forEach((row) => {')
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
  [void]$Builder.AppendLine('        if (hud.parentElement !== slot) slot.appendChild(hud);')
  [void]$Builder.AppendLine('        document.querySelectorAll("[data-lexical-token]").forEach((wordButton) => wordButton.setAttribute("aria-pressed", "false"));')
  [void]$Builder.AppendLine('        button.setAttribute("aria-pressed", "true");')
  [void]$Builder.AppendLine('        hud.hidden = false;')
  [void]$Builder.AppendLine('        setText(hud, "[data-hud-word]", button.textContent.trim());')
  [void]$Builder.AppendLine('        setList(hud, "[data-hud-surface-renderings]", ["Loading lexical entry..."]);')
  [void]$Builder.AppendLine('        renderBreakdown(hud, {});')
  [void]$Builder.AppendLine('        renderPossibleEntries(hud, {}, false);')
  [void]$Builder.AppendLine('        renderSources(hud.querySelector("[data-hud-sources]"), []);')
  [void]$Builder.AppendLine('        try {')
  [void]$Builder.AppendLine('          const view = await buildWordView(button);')
  [void]$Builder.AppendLine('          if (button.getAttribute("aria-pressed") !== "true") return;')
  [void]$Builder.AppendLine('          setText(hud, "[data-hud-word]", view.hebrew_word);')
  [void]$Builder.AppendLine('          const hasLexicalEntry = Boolean(view.lexicon_entry_id || button.dataset.lexicalEntry);')
  [void]$Builder.AppendLine('          setList(hud, "[data-hud-surface-renderings]", (view.surface_renderings && view.surface_renderings.length) ? view.surface_renderings : (hasLexicalEntry ? view.strict_renderings : ["No lexical entry yet."]));')
  [void]$Builder.AppendLine('          renderBreakdown(hud, view);')
  [void]$Builder.AppendLine('          renderPossibleEntries(hud, view, hasLexicalEntry);')
  [void]$Builder.AppendLine('          renderSources(hud.querySelector("[data-hud-sources]"), view.source_rows);')
  [void]$Builder.AppendLine('          const details = hud.querySelector("details");')
  [void]$Builder.AppendLine('          if (details) details.open = false;')
  [void]$Builder.AppendLine('        } catch (error) {')
  [void]$Builder.AppendLine('          console.error(error);')
  [void]$Builder.AppendLine('          setList(hud, "[data-hud-surface-renderings]", ["No lexical entry yet."]);')
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
  [void]$Builder.AppendLine('          document.querySelectorAll("[data-lexical-token]").forEach((wordButton) => wordButton.setAttribute("aria-pressed", "false"));')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('    })();')
  [void]$Builder.AppendLine('  </script>')
}

function Get-LexicalCache {
  param([string]$LexicalDir = 'data/lexical')

  $lexiconPath = Join-Path $LexicalDir 'lexicon.json'
  $tokenIndexPath = Join-Path $LexicalDir 'token-index.json'
  $occurrencesDir = Join-Path $LexicalDir 'occurrences'

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

  $tokenIndexById = @{}
  foreach ($row in @($tokenIndex.forms)) {
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
    foreach ($file in @(Get-ChildItem -Path $occurrencesDir -Filter '*.json')) {
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
        $_.relation_label -ne 'related root-field' -and -not (Test-ExcludedOtherLexicalEntry -Entry $_)
      })
      if ($entry.disambiguation_status -eq 'likely') {
        $rawPossibleEntries = @($rawPossibleEntries | Where-Object { $_.context_role -eq 'likely_contextual' })
      }
      $primaryEntries = @($rawPossibleEntries | Where-Object { $_.context_role -eq 'likely_contextual' })
      $secondaryEntries = @($rawPossibleEntries | Where-Object { $_.context_role -ne 'likely_contextual' })
      $primarySourceRows = Select-LexicalSourceRows -SourceRows @($entry.source_rows) -Keys @($primaryEntries | ForEach-Object { @($_.source_row_keys) })
      $secondarySourceRows = Select-LexicalSourceRows -SourceRows @($entry.source_rows) -Keys @($secondaryEntries | ForEach-Object { @($_.source_row_keys) })
      if ($primarySourceRows.Count -eq 0 -and @($entry.strict_renderings).Count -gt 0) {
        $strictRenderingRows = @($entry.source_rows | Where-Object { $_.source_family -eq 'kaikki' -or $_.source_family -eq 'wiktionary' })
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
    [string]$LexicalDir = 'data/lexical'
  )

  if ($WorkId -ne 'orot' -or $null -eq $WorkLexicalPayload) {
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
    $chunkId = ('{0}-{1:D3}' -f $WorkId, $chunkNumber)

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
    manifest_url = "../$LexicalDir/$WorkId.manifest.json"
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

$sources = @(Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object { Read-Json -Path $_.FullName } | Sort-Object work_title)
$sourceById = @{}
foreach ($source in $sources) {
  $sourceById[[string]$source.work_id] = $source
}
$lexicalCache = Get-LexicalCache

$homePage = New-Object System.Text.StringBuilder
Append-SiteHead -Builder $homePage -Title 'Hebrew Source Workbench'
[void]$homePage.AppendLine('  <main>')
[void]$homePage.AppendLine('    <div class="shell">')
[void]$homePage.AppendLine('      <div class="hero">')
[void]$homePage.AppendLine('        <h1>Hebrew Source Workbench</h1>')
[void]$homePage.AppendLine('        <p>Hebrew source texts with stable anchors, source metadata, and lexical HUD support.</p>')
[void]$homePage.AppendLine('      </div>')
[void]$homePage.AppendLine('      <div style="padding:22px">')
$homeGroups = $sources | Group-Object { Get-HomeGroup $_ } | Sort-Object @{ Expression = { if ($_.Name -eq 'Works') { 0 } elseif ($_.Name -eq 'Tanakh') { 1 } else { 2 } } }, Name
foreach ($homeGroup in $homeGroups) {
  [void]$homePage.AppendLine('        <section class="home-section">')
  [void]$homePage.AppendLine("          <h2>$(Encode-Html $homeGroup.Name)</h2>")
  [void]$homePage.AppendLine('          <div class="home-grid">')
  foreach ($source in @($homeGroup.Group | Sort-Object work_title)) {
    [void]$homePage.AppendLine("            <a class=""work-card"" href=""$($source.work_slug)/"">")
    [void]$homePage.AppendLine("              <strong>$(Encode-Html $source.work_title)</strong>")
    if ($source.display_label) {
      [void]$homePage.AppendLine("              <span class=""work-label"">$(Encode-Html $source.display_label)</span>")
    }
    [void]$homePage.AppendLine("              <span class=""meta"">$(@($source.units).Count) source units | $(Encode-Html $source.source_system) | imported $(Encode-Html $source.import_date)</span>")
    [void]$homePage.AppendLine('            </a>')
  }
  [void]$homePage.AppendLine('          </div>')
  [void]$homePage.AppendLine('        </section>')
}
[void]$homePage.AppendLine('      </div>')
[void]$homePage.AppendLine('    </div>')
[void]$homePage.AppendLine('  </main>')
[void]$homePage.AppendLine('</body>')
[void]$homePage.AppendLine('</html>')
Write-Utf8 -Path 'index.html' -Content $homePage.ToString()

$allExportRows = New-Object System.Collections.Generic.List[object]
foreach ($source in $sources) {
  $overlay = Get-OverlayForSource -Source $source -OverlayDir $OverlayDir
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
  $workOccurrence = if ($lexicalCache.occurrences_by_work.ContainsKey([string]$source.work_id)) { $lexicalCache.occurrences_by_work[[string]$source.work_id] } else { $null }
  $workHasLexical = ($null -ne $workOccurrence)
  $workLexicalPayload = if ($workHasLexical) { Get-WorkLexicalPayload -WorkOccurrence $workOccurrence -LexicalCache $lexicalCache } else { $null }
  $workLexicalExternal = if ($workHasLexical) { Write-WorkLexicalPayloadFiles -WorkId $source.work_id -WorkLexicalPayload $workLexicalPayload } else { $null }

  Append-SiteHead -Builder $page -Title $source.work_title -IncludeLexicalStyles:$workHasLexical
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <div class="shell">')
  [void]$page.AppendLine('      <div class="hero" id="work-top">')
  [void]$page.AppendLine("        <p class=""crumbs""><a href=""$rootHref"">Home</a></p>")
  [void]$page.AppendLine("        <h1>$(Encode-Html $source.work_title)</h1>")
  if ($source.display_label) {
    [void]$page.AppendLine("        <p class=""work-label"">$(Encode-Html $source.display_label)</p>")
  }
  if ($source.work_type -eq 'commentary') {
    $baseImported = $false
    $baseHref = ''
    $baseTitle = if ($source.base_work_title) { [string]$source.base_work_title } else { 'Base Work' }
    if ($source.base_work_id -and $sourceById.ContainsKey([string]$source.base_work_id)) {
      $baseSource = $sourceById[[string]$source.base_work_id]
      $baseHref = "$rootHref$($baseSource.work_slug)/"
      $baseTitle = [string]$baseSource.work_title
      $baseImported = $true
    }
    $displayLabel = if ($source.display_label) { [string]$source.display_label } else { "Commentary on $baseTitle" }
    [void]$page.AppendLine('        <div class="paired-shell" aria-label="Commentary paired-text status">')
    [void]$page.AppendLine('          <section class="paired-panel">')
    [void]$page.AppendLine('            <h2>Base Text</h2>')
    if ($baseImported) {
      [void]$page.AppendLine("            <p><a href=""$baseHref"">Open $(Encode-Html $baseTitle)</a></p>")
      [void]$page.AppendLine('            <p class="placeholder">Base text is imported. Exact paired ref linking is not implemented yet.</p>')
    } else {
      [void]$page.AppendLine('            <p class="placeholder">[Base text not imported or not linked yet]</p>')
    }
    [void]$page.AppendLine('          </section>')
    [void]$page.AppendLine('          <section class="paired-panel">')
    [void]$page.AppendLine('            <h2>Commentary</h2>')
    [void]$page.AppendLine("            <p>$(Encode-Html $displayLabel)</p>")
    [void]$page.AppendLine('            <p class="placeholder">Commentary text appears below.</p>')
    [void]$page.AppendLine('          </section>')
    [void]$page.AppendLine('        </div>')
  }
  [void]$page.AppendLine("        <p class=""meta"">$(@($source.units).Count) total source units | imported $(Encode-Html $source.import_date)</p>")
  if ($singleSourceNote) {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$(Get-SourceSummaryHtml -Note $sourceNotes[0])</p>")
  } else {
    [void]$page.AppendLine("        <p class=""meta source-citation"">$($sourceNotes.Count) source/license notes. See footer table for details.</p>")
  }
  if ($workHasLexical -and [string]$source.work_id -eq 'orot') {
    $lexicalMatched = [int]$lexicalCache.token_index.matched_surface_forms
    $lexicalTotal = [int]$lexicalCache.token_index.total_unique_surface_forms
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

    [void]$page.AppendLine("          <section class=""unit"" id=""$($unit.anchor_id)"" data-unit$lexicalAttrs>")
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

  [void]$page.AppendLine('        </article>')
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </main>')
  if ($workHasLexical) {
    [void]$page.AppendLine('  <section class="lexical-hud" data-lexical-hud hidden aria-live="polite">')
    [void]$page.AppendLine('    <div class="hud-head"><h2>Lexical HUD</h2><button class="hud-close" type="button" data-hud-close>Close</button></div>')
    [void]$page.AppendLine('    <dl class="lexical-fields">')
    [void]$page.AppendLine('      <dt>Clicked Hebrew form</dt><dd data-hud-word lang="he" dir="rtl">N/A</dd>')
    [void]$page.AppendLine('      <dt>Strict renderings</dt><dd data-hud-surface-renderings>N/A</dd>')
    [void]$page.AppendLine('      <dt>Breakdown</dt><dd data-hud-breakdown>N/A</dd>')
    [void]$page.AppendLine('      <dt data-hud-renderings-label>Possible lexical entries</dt><dd data-hud-renderings>N/A</dd>')
    [void]$page.AppendLine('    </dl>')
    [void]$page.AppendLine('    <details class="source-details">')
    [void]$page.AppendLine('      <summary>Sources / licenses</summary>')
    [void]$page.AppendLine('      <div data-hud-sources></div>')
    [void]$page.AppendLine('    </details>')
    [void]$page.AppendLine('  </section>')
    $occurrenceJson = (ConvertTo-Json -InputObject $workOccurrence -Depth 30 -Compress) -replace '</script', '<\/script'
    [void]$page.AppendLine("  <script type=""application/json"" data-lexical-occurrences>$occurrenceJson</script>")
    if ($null -ne $workLexicalExternal) {
      $lexicalConfigJson = (ConvertTo-Json -InputObject $workLexicalExternal -Depth 10 -Compress) -replace '</script', '<\/script'
      [void]$page.AppendLine("  <script type=""application/json"" data-lexical-config>$lexicalConfigJson</script>")
    } else {
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

Write-OverlayExports -WorkSlug '.' -Rows $allExportRows.ToArray()
