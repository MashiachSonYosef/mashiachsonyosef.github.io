param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays'
)

$ErrorActionPreference = 'Stop'

function Encode-Html {
  param([AllowNull()][string]$Text)
  if ($null -eq $Text) { return '' }
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Read-Json {
  param([string]$Path)
  return Get-Content -Path $Path -Raw -Encoding UTF8 | ConvertFrom-Json
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
  [void]$Builder.AppendLine('    :root { color-scheme: dark; --bg: #0a0b0d; --panel: #111318; --panel-2: #171a21; --text: #ece7dd; --muted: #aaa296; --line: #2a2d35; --accent: #d6be8a; --hebrew: #f4efe5; }')
  [void]$Builder.AppendLine('    * { box-sizing: border-box; }')
  [void]$Builder.AppendLine('    body { margin: 0; background: var(--bg); color: var(--text); font-family: Georgia, "Times New Roman", serif; }')
  [void]$Builder.AppendLine('    a { color: var(--accent); }')
  [void]$Builder.AppendLine('    main { width: min(1400px, calc(100% - 24px)); margin: 0 auto; padding: 24px 0 48px; }')
  [void]$Builder.AppendLine('    h1, h2, h3 { font-weight: 400; margin: 0; scroll-margin-top: 18px; }')
  [void]$Builder.AppendLine('    h1 { font-size: clamp(2rem, 5vw, 4.8rem); line-height: 0.95; margin-bottom: 14px; }')
  [void]$Builder.AppendLine('    h2 { color: var(--accent); font-size: 1.25rem; margin: 28px 0 12px; }')
  [void]$Builder.AppendLine('    h3 { font-size: 1.05rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    p { color: var(--muted); line-height: 1.5; margin: 0 0 8px; }')
  [void]$Builder.AppendLine('    .crumbs, .meta { color: var(--muted); font-size: 0.92rem; }')
  [void]$Builder.AppendLine('    .home-grid, .works-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 20px; }')
  [void]$Builder.AppendLine('    .work-card { display: block; border: 1px solid var(--line); background: var(--panel); padding: 16px; text-decoration: none; min-height: 120px; }')
  [void]$Builder.AppendLine('    .work-card strong { display: block; color: var(--text); font-size: 1.1rem; margin-bottom: 8px; }')
  [void]$Builder.AppendLine('    .reader-shell { display: grid; grid-template-columns: minmax(210px, 280px) 1fr; gap: 20px; align-items: start; }')
  [void]$Builder.AppendLine('    .toc { position: sticky; top: 12px; max-height: calc(100vh - 24px); overflow: auto; border: 1px solid var(--line); background: var(--panel); padding: 14px; }')
  [void]$Builder.AppendLine('    .toc ul { list-style: none; padding: 0; margin: 0; }')
  [void]$Builder.AppendLine('    .toc li { margin: 0 0 7px; }')
  [void]$Builder.AppendLine('    .toc a { text-decoration: none; font-size: 0.94rem; }')
  [void]$Builder.AppendLine('    .search { width: 100%; border: 1px solid var(--line); background: #090a0c; color: var(--text); padding: 10px; margin-bottom: 12px; font: inherit; }')
  [void]$Builder.AppendLine('    .unit { border-top: 1px solid var(--line); padding: 18px 0; }')
  [void]$Builder.AppendLine('    .unit-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .anchor { text-decoration: none; color: var(--accent); font-size: 0.9rem; }')
  [void]$Builder.AppendLine('    .unit-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 18px; }')
  [void]$Builder.AppendLine('    .hebrew { color: var(--hebrew); direction: rtl; unicode-bidi: plaintext; text-align: right; font-size: 1.18rem; line-height: 1.7; }')
  [void]$Builder.AppendLine('    .placeholder { color: #8c857c; }')
  [void]$Builder.AppendLine('    .overlay-block { border: 1px solid var(--line); background: var(--panel-2); padding: 12px; margin-bottom: 10px; }')
  [void]$Builder.AppendLine('    .overlay-label { display: block; color: var(--accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0; margin-bottom: 6px; }')
  [void]$Builder.AppendLine('    details { border: 1px solid var(--line); background: var(--panel); padding: 10px 12px; }')
  [void]$Builder.AppendLine('    summary { cursor: pointer; color: var(--accent); }')
  [void]$Builder.AppendLine('    @media (max-width: 820px) { .reader-shell, .unit-grid { grid-template-columns: 1fr; } .toc { position: static; max-height: none; } }')
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

$sources = Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object { Read-Json -Path $_.FullName }

$homePage = New-Object System.Text.StringBuilder
Append-SiteHead -Builder $homePage -Title 'Translation Workspace'
[void]$homePage.AppendLine('  <main>')
[void]$homePage.AppendLine('    <h1>Translation Workspace</h1>')
[void]$homePage.AppendLine('    <p>Hebrew source texts with empty overlay fields for future translation work.</p>')
[void]$homePage.AppendLine('    <div class="home-grid">')
[void]$homePage.AppendLine('      <a class="work-card" href="orot/">')
[void]$homePage.AppendLine('        <strong>Orot</strong>')
[void]$homePage.AppendLine('        <span class="meta">Imported Hebrew source texts and translation overlays.</span>')
[void]$homePage.AppendLine('      </a>')
[void]$homePage.AppendLine('    </div>')
[void]$homePage.AppendLine('  </main>')
[void]$homePage.AppendLine('</body>')
[void]$homePage.AppendLine('</html>')
Write-Utf8 -Path 'index.html' -Content $homePage.ToString()

$orot = New-Object System.Text.StringBuilder
Append-SiteHead -Builder $orot -Title 'Orot'
[void]$orot.AppendLine('  <main>')
[void]$orot.AppendLine('    <p class="crumbs"><a href="../">Home</a></p>')
[void]$orot.AppendLine('    <h1>Orot</h1>')
[void]$orot.AppendLine('    <p>One work per page. Hebrew source data is imported separately from human overlays.</p>')
[void]$orot.AppendLine('    <div class="works-grid">')
foreach ($source in $sources) {
  [void]$orot.AppendLine("      <a class=""work-card"" href=""$($source.work_slug)/"">")
  [void]$orot.AppendLine("        <strong>$(Encode-Html $source.work_title)</strong>")
  [void]$orot.AppendLine("        <span class=""meta"">$(@($source.units).Count) units | $((Encode-Html $source.source_system)) | imported $((Encode-Html $source.import_date))</span>")
  [void]$orot.AppendLine('      </a>')
}
[void]$orot.AppendLine('    </div>')
[void]$orot.AppendLine('  </main>')
[void]$orot.AppendLine('</body>')
[void]$orot.AppendLine('</html>')
Write-Utf8 -Path 'orot/index.html' -Content $orot.ToString()

foreach ($source in $sources) {
  $overlayPath = Join-Path $OverlayDir "$($source.work_id).json"
  $overlay = if (Test-Path $overlayPath) { Read-Json -Path $overlayPath } else { $null }
  $page = New-Object System.Text.StringBuilder

  Append-SiteHead -Builder $page -Title $source.work_title
  [void]$page.AppendLine('  <main>')
  [void]$page.AppendLine('    <p class="crumbs"><a href="../../">Home</a> / <a href="../">Orot</a></p>')
  [void]$page.AppendLine("    <h1>$(Encode-Html $source.work_title)</h1>")
  [void]$page.AppendLine("    <p class=""meta"">$(@($source.units).Count) source units | $((Encode-Html $source.source_system)) | imported $((Encode-Html $source.import_date))</p>")
  [void]$page.AppendLine('    <div class="reader-shell">')
  [void]$page.AppendLine('      <nav class="toc" aria-label="Table of contents">')
  [void]$page.AppendLine('        <input class="search" data-search type="search" placeholder="Search this work">')
  foreach ($section in $source.toc) {
    [void]$page.AppendLine("        <h2 id=""toc-$($section.section_slug)"">$(Encode-Html $section.section_title)</h2>")
    [void]$page.AppendLine('        <ul>')
    foreach ($unit in $section.units) {
      [void]$page.AppendLine("          <li><a href=""#$($unit.unit_id)"">$(Encode-Html $unit.label)</a></li>")
    }
    [void]$page.AppendLine('        </ul>')
  }
  [void]$page.AppendLine('      </nav>')
  [void]$page.AppendLine('      <article>')

  $currentSection = ''
  foreach ($unit in $source.units) {
    if ($unit.section_title -ne $currentSection) {
      $currentSection = $unit.section_title
      [void]$page.AppendLine("        <h2 id=""$($unit.section_slug)"">$(Encode-Html $currentSection)</h2>")
    }

    $overlayUnit = Get-OverlayUnit -Overlay $overlay -UnitId $unit.unit_id
    $transliteration = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'transliteration'
    $strict = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'strict_translation'
    $clean = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'clean_translation'
    $notes = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'notes'
    $pressureWords = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'pressure_words'
    $rejected = Get-OverlayValue -OverlayUnit $overlayUnit -Field 'rejected_alternatives'

    [void]$page.AppendLine("        <section class=""unit"" id=""$($unit.anchor_id)"" data-unit>")
    [void]$page.AppendLine('          <div class="unit-head">')
    [void]$page.AppendLine("            <h3>$(Encode-Html $unit.source_ref)</h3>")
    [void]$page.AppendLine("            <a class=""anchor"" href=""#$($unit.anchor_id)"" aria-label=""Copy link to $($unit.source_ref)"">#</a>")
    [void]$page.AppendLine('          </div>')
    [void]$page.AppendLine('          <div class="unit-grid">')
    [void]$page.AppendLine('            <div>')
    foreach ($paragraph in $unit.hebrew) {
      [void]$page.AppendLine("              <p class=""hebrew"" lang=""he"">$(Encode-Html $paragraph)</p>")
    }
    [void]$page.AppendLine("              <p class=""meta"">Source: $(Encode-Html $unit.source_ref) | Version: $(Encode-Html $unit.version_title) | License: $(Encode-Html $unit.license)</p>")
    [void]$page.AppendLine('            </div>')
    [void]$page.AppendLine('            <div>')

    if ($transliteration) {
      [void]$page.AppendLine('              <div class="overlay-block"><span class="overlay-label">Transliteration</span>')
      [void]$page.AppendLine("                <p>$(Encode-Html $transliteration)</p></div>")
    }

    [void]$page.AppendLine('              <div class="overlay-block"><span class="overlay-label">Strict Translation</span>')
    [void]$page.AppendLine("                <p class=""placeholder"">$(if ($strict) { Encode-Html $strict } else { '[Awaiting translation]' })</p></div>")
    [void]$page.AppendLine('              <div class="overlay-block"><span class="overlay-label">Clean Translation</span>')
    [void]$page.AppendLine("                <p class=""placeholder"">$(if ($clean) { Encode-Html $clean } else { '[Awaiting translation]' })</p></div>")
    [void]$page.AppendLine('              <details>')
    [void]$page.AppendLine('                <summary>Notes / Pressure Words</summary>')
    [void]$page.AppendLine("                <p><span class=""overlay-label"">Notes</span>$(if ($notes) { Encode-Html $notes } else { '[Awaiting notes]' })</p>")
    [void]$page.AppendLine("                <p><span class=""overlay-label"">Pressure Words</span>$(if ($pressureWords) { Encode-Html (($pressureWords -join ', ')) } else { '[Awaiting pressure words]' })</p>")
    [void]$page.AppendLine("                <p><span class=""overlay-label"">Rejected Alternatives</span>$(if ($rejected) { Encode-Html (($rejected -join ', ')) } else { '[Awaiting rejected alternatives]' })</p>")
    [void]$page.AppendLine('              </details>')
    [void]$page.AppendLine('            </div>')
    [void]$page.AppendLine('          </div>')
    [void]$page.AppendLine('        </section>')
  }

  [void]$page.AppendLine('      </article>')
  [void]$page.AppendLine('    </div>')
  [void]$page.AppendLine('  </main>')
  Append-Script -Builder $page
  [void]$page.AppendLine('</body>')
  [void]$page.AppendLine('</html>')

  Write-Utf8 -Path "$($source.work_slug)\index.html" -Content $page.ToString()
}
