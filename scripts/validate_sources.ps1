param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays'
)

$ErrorActionPreference = 'Stop'

$errors = New-Object System.Collections.Generic.List[string]
$unitIds = @{}
$anchorIds = @{}

Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object {
  $source = Get-Content -Path $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  $overlayPath = Join-Path $OverlayDir "$($source.work_id).json"

  foreach ($field in @('work_id', 'work_title', 'work_slug', 'sefaria_ref', 'source_system', 'import_date')) {
    if (-not $source.$field) {
      $errors.Add("Missing work field $field in $($_.Name)")
    }
  }

  if (-not (Test-Path $overlayPath)) {
    $errors.Add("Missing overlay file for $($source.work_id)")
  }

  if (-not $source.outline -or @($source.outline).Count -eq 0) {
    $errors.Add("Missing outline in $($source.work_id)")
  }

  foreach ($unit in $source.units) {
    foreach ($field in @('unit_id', 'anchor_id', 'source_ref', 'license', 'version_title', 'import_date', 'group_title', 'section_title')) {
      if (-not $unit.$field) {
        $errors.Add("Missing $field in $($unit.unit_id)")
      }
    }

    if (-not $unit.hebrew -or @($unit.hebrew).Count -eq 0) {
      $errors.Add("Missing Hebrew in $($unit.unit_id)")
    }

    foreach ($paragraph in @($unit.hebrew)) {
      if (-not $paragraph -or -not $paragraph.ToString().Trim()) {
        $errors.Add("Blank Hebrew paragraph in $($unit.unit_id)")
      }
    }

    if ($unit.PSObject.Properties.Name -contains 'translation' -or
        $unit.PSObject.Properties.Name -contains 'english' -or
        $unit.PSObject.Properties.Name -contains 'strict_translation' -or
        $unit.PSObject.Properties.Name -contains 'clean_translation') {
      $errors.Add("Source unit contains English/translation field: $($unit.unit_id)")
    }

    if ($unitIds.ContainsKey($unit.unit_id)) {
      $errors.Add("Duplicate unit_id: $($unit.unit_id)")
    } else {
      $unitIds[$unit.unit_id] = $true
    }

    if ($anchorIds.ContainsKey($unit.anchor_id)) {
      $errors.Add("Duplicate anchor_id: $($unit.anchor_id)")
    } else {
      $anchorIds[$unit.anchor_id] = $true
    }
  }
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "Validation passed. $($unitIds.Count) source units checked."
