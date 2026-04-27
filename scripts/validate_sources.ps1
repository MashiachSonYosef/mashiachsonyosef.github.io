param(
  [string]$SourceDir = 'data/sources',
  [string]$OverlayDir = 'data/overlays'
)

$ErrorActionPreference = 'Stop'

$errors = New-Object System.Collections.Generic.List[string]
$ids = @{}

Get-ChildItem -Path $SourceDir -Filter '*.json' | ForEach-Object {
  $source = Get-Content -Path $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  $overlayPath = Join-Path $OverlayDir "$($source.work_id).json"

  if (-not (Test-Path $overlayPath)) {
    $errors.Add("Missing overlay file for $($source.work_id)")
  }

  foreach ($unit in $source.units) {
    foreach ($field in @('unit_id', 'source_ref', 'license', 'version_title', 'import_date')) {
      if (-not $unit.$field) {
        $errors.Add("Missing $field in $($source.work_id)")
      }
    }

    if (-not $unit.hebrew -or @($unit.hebrew).Count -eq 0) {
      $errors.Add("Missing Hebrew in $($unit.unit_id)")
    }

    if ($unit.PSObject.Properties.Name -contains 'translation' -or
        $unit.PSObject.Properties.Name -contains 'english' -or
        $unit.PSObject.Properties.Name -contains 'strict_translation' -or
        $unit.PSObject.Properties.Name -contains 'clean_translation') {
      $errors.Add("Source unit contains English/translation field: $($unit.unit_id)")
    }

    if ($ids.ContainsKey($unit.unit_id)) {
      $errors.Add("Duplicate unit_id: $($unit.unit_id)")
    } else {
      $ids[$unit.unit_id] = $true
    }
  }
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "Validation passed. $($ids.Count) source units checked."
