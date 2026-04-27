param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays',
  [int]$MaxUnits = 0
)

$ErrorActionPreference = 'Stop'

function Encode-Html {
  param([AllowNull()][string]$Text)
  if ($null -eq $Text) { return '' }
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Convert-SourceHtml {
  param([AllowNull()][string]$Text)
  if ($null -eq $Text) { return '' }
  $html = Encode-Html $Text
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

function Get-RootHref {
  param([string]$WorkSlug)
  $depth = @($WorkSlug -split '[\\/]' | Where-Object { $_ }).Count
  if ($depth -le 0) { return './' }
  return ('../' * $depth)
}

function Get-HomeGroup {
  param([object]$Source)
  if ($Source.work_id -eq 'orot') {
    return 'Rav Kook'
  }
  $slugParts = @($Source.work_slug -split '[\\/]' | Where-Object { $_ })
  if ($slugParts.Count -gt 1) {
    $first = $slugParts[0]
    if ($first -eq 'tanakh') { return 'Tanakh' }
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

function Test-HasContent {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return $false }
  if ($Value -is [string]) { return [bool]$Value.Trim() }
  foreach ($item in @($Value)) {
    if ($null -ne $item -and $item.ToString().Trim()) { return $true }
  }
  return $false
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

function Append-SiteHead {
  param(
    [System.Text.StringBuilder]$Builder,
    [string]$Title
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
  [void]$Builder.AppendLine('    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 20px; }')
  [void]$Builder.AppendLine('    .home-section { margin-top: 26px; }')
  [void]$Builder.AppendLine('    .home-section:first-child { margin-top: 0; }')
  [void]$Builder.AppendLine('    .work-card { display: block; border: 1px solid var(--line); background: var(--panel); padding: 18px; text-decoration: none; min-height: 140px; backdrop-filter: blur(3px); }')
  [void]$Builder.AppendLine('    .work-card strong { display: block; color: var(--text); font-size: 1.2rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    .reader-shell { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 22px; align-items: start; padding: 22px; }')
  [void]$Builder.AppendLine('    .toc { position: sticky; top: 12px; max-height: calc(100vh - 24px); overflow: auto; border: 1px solid var(--line); background: var(--panel); padding: 14px; }')
  [void]$Builder.AppendLine('    .toc ul { list-style: none; padding: 0; margin: 0; }')
  [void]$Builder.AppendLine('    .toc li { margin: 0 0 7px; }')
  [void]$Builder.AppendLine('    .toc a { text-decoration: none; font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .search { width: 100%; border: 1px solid var(--line-2); background: #090a0c; color: var(--text); padding: 10px; margin-bottom: 12px; font: inherit; }')
  [void]$Builder.AppendLine('    .section-block { margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .unit { border-top: 1px solid var(--line); padding: 16px 0; }')
  [void]$Builder.AppendLine('    .unit-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .anchor { text-decoration: none; color: var(--accent); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .unit-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 18px; }')
  [void]$Builder.AppendLine('    .hebrew { color: var(--hebrew); direction: rtl; unicode-bidi: plaintext; text-align: right; font-size: 1.22rem; line-height: 1.82; }')
  [void]$Builder.AppendLine('    .hebrew strong { color: #fff5df; font-weight: 700; }')
  [void]$Builder.AppendLine('    .source-small { font-size: 0.82em; color: var(--muted); }')
  [void]$Builder.AppendLine('    .placeholder { color: #8c857c; }')
  [void]$Builder.AppendLine('    .overlay-block { border: 1px solid var(--line); background: var(--panel-2); padding: 12px; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .overlay-label { display: block; color: var(--accent); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }')
  [void]$Builder.AppendLine('    .source-citation { overflow-wrap: anywhere; word-break: break-word; }')
  [void]$Builder.AppendLine('    .source-note-index { color: var(--accent); font-size: 0.82rem; margin-left: 6px; }')
  [void]$Builder.AppendLine('    .source-table { width: 100%; border-collapse: collapse; margin-top: 24px; color: var(--muted); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .source-table th, .source-table td { border-top: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: top; }')
  [void]$Builder.AppendLine('    details { border: 1px solid var(--line); background: var(--panel); padding: 10px 12px; }')
  [void]$Builder.AppendLine('    summary { cursor: pointer; color: var(--accent); }')
  [void]$Builder.AppendLine('    .fallback-note { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line-2); background: rgba(214,190,138,0.06); color: var(--text); }')
  [void]$Builder.AppendLine('    @media (max-width: 900px) { .reader-shell, .unit-grid { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
  [void]$Builder.AppendLine('  </style>')
  [void]$Builder.AppendLine('</head>')
  [void]$Builder.AppendLine('<body>')
}

function Append-Script {
  param([System.Text.StringBuilder]$Builder)

  [void]$Builder.AppendLine('  <script>')
  [void]$Builder.AppendLine('    const search = document.querySelector("[data-search]");')
  [void]$Builder.AppendLine('    if (search) {')
  [void]$Builder.AppendLine('      search.addEventListener("input", () => {')
  [void]$Builder.AppendLine('        const q = search.value.trim().toLowerCase();')
  [void]$Builder.AppendLine('        document.querySelectorAll("[data-unit]").forEach((unit) => {')
  [void]$Builder.AppendLine('          unit.hidden = q && !unit.textContent.toLowerCase().includes(q);')
  [void]$Builder.AppendLine('        });')
  [void]$Builder.AppendLine('      });')
  [void]$Builder.AppendLine('    }')
  [void]$Builder.AppendLine('  </script>')
}

$sources = @(Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object { Read-Json -Path $_.FullName } | Sort-Object work_title)

$homePage = New-Object System.Text.StringBuilder
Append-SiteHead -Builder $homePage -Title 'Translation Workspace'
[void]$homePage.AppendLine('  <main>')
[void]$homePage.AppendLine('    <div class="shell">')
[void]$homePage.AppendLine('      <div class="hero">')
[void]$homePage.AppendLine('        <h1>Translation Workspace</h1>')
[void]$homePage.AppendLine('        <p>Hebrew source infrastructure first. Overlays stay separate. English remains placeholder-only until you write it.</p>')
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

foreach ($source in $sources) {
  $overlayPath = Join-Path $OverlayDir "$($source.work_id).json"
  $overlay = if (Test-Path $overlayPath) { Read-Json -Path $overlayPath } else { $null }
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

  Append-SiteHead -Builder $page -Title $source.work_title
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
  if ($MaxUnits -gt 0) {
    [void]$page.AppendLine("        <p class=""fallback-note"">Fallback render active. Showing first $MaxUnits units only while route stability is verified.</p>")
  }
  [void]$page.AppendLine('      </div>')
  [void]$page.AppendLine('      <div class="reader-shell">')
  [void]$page.AppendLine('        <nav class="toc" aria-label="Table of contents">')
  [void]$page.AppendLine('          <input class="search" data-search type="search" placeholder="Search this work">')
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
    $transliteration = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'transliteration'
    $strict = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'strict_translation'
    $clean = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'clean_translation'
    $notes = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'notes'
    $pressureWords = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'pressure_words'
    $rejected = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'rejected_alternatives'
    $hasOverlayContent = (Test-HasContent $transliteration) -or (Test-HasContent $strict) -or (Test-HasContent $clean) -or (Test-HasContent $notes) -or (Test-HasContent $pressureWords) -or (Test-HasContent $rejected)

    [void]$page.AppendLine("          <section class=""unit"" id=""$($unit.anchor_id)"" data-unit>")
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
    foreach ($paragraph in @($unit.hebrew)) {
      [void]$page.AppendLine("                <p class=""hebrew"" lang=""he"">$(Convert-SourceHtml $paragraph)</p>")
    }
    [void]$page.AppendLine('              </div>')
    [void]$page.AppendLine('              <div>')

    if ($hasOverlayContent) {
      if (Test-HasContent $transliteration) {
      [void]$page.AppendLine('                <div class="overlay-block"><span class="overlay-label">Transliteration</span>')
      [void]$page.AppendLine("                  <p>$(Encode-Html $transliteration)</p></div>")
      }
      if (Test-HasContent $strict) {
        [void]$page.AppendLine('                <div class="overlay-block"><span class="overlay-label">Translation</span>')
        [void]$page.AppendLine("                  <p>$(Encode-Html $strict)</p></div>")
      }
      if (Test-HasContent $clean) {
        [void]$page.AppendLine('                <div class="overlay-block"><span class="overlay-label">Translator’s Notes</span>')
        [void]$page.AppendLine("                  <p>$(Encode-Html $clean)</p></div>")
      }
      if ((Test-HasContent $notes) -or (Test-HasContent $pressureWords) -or (Test-HasContent $rejected)) {
        [void]$page.AppendLine('                <details open>')
        [void]$page.AppendLine('                  <summary>Notes / Pressure Words</summary>')
        if (Test-HasContent $notes) {
          [void]$page.AppendLine("                  <p><span class=""overlay-label"">Notes</span>$(Encode-Html $notes)</p>")
        }
        if (Test-HasContent $pressureWords) {
          [void]$page.AppendLine("                  <p><span class=""overlay-label"">Pressure Words</span>$(Encode-Html (($pressureWords -join ', ')))</p>")
        }
        if (Test-HasContent $rejected) {
          [void]$page.AppendLine("                  <p><span class=""overlay-label"">Rejected Alternatives</span>$(Encode-Html (($rejected -join ', ')))</p>")
        }
        [void]$page.AppendLine('                </details>')
      }
    } else {
      [void]$page.AppendLine('                <details class="translation-panel">')
      [void]$page.AppendLine('                  <summary>Translation pending</summary>')
      [void]$page.AppendLine('                  <div class="overlay-block"><span class="overlay-label">Translation</span><p class="placeholder">[Awaiting translation]</p></div>')
      [void]$page.AppendLine('                  <div class="overlay-block"><span class="overlay-label">Translator’s Notes</span><p class="placeholder">[Awaiting translation]</p></div>')
      [void]$page.AppendLine('                  <div class="overlay-block"><span class="overlay-label">Notes / Pressure Words</span><p class="placeholder">[Awaiting notes]</p></div>')
      [void]$page.AppendLine('                </details>')
    }
    [void]$page.AppendLine('              </div>')
    [void]$page.AppendLine('            </div>')
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
  Append-Script -Builder $page
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')

  Write-Utf8 -Path "$($source.work_slug)\index.html" -Content $page.ToString()
}
