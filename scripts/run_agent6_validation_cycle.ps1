param(
  [string]$Output = "",
  [string]$Json = ""
)

$ErrorActionPreference = "Continue"

$validators = @(
  @{ gate = "publication"; label = "Publication render contract"; command = @("node", "scripts\validate_publication_render_contract.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "Definition sources"; command = @("node", "scripts\validate_definition_sources.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "Definition outputs"; command = @("node", "scripts\validate_definition_outputs.mjs"); blocker = $false; timeout = 120000 },
  @{ gate = "definition"; label = "HUD route release stamp"; command = @("node", "scripts\validate_hud_route_release_stamp.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "HUD route release gate"; command = @("node", "scripts\validate_hud_route_release_gate.mjs"); blocker = $true; timeout = 420000 },
  @{ gate = "definition"; label = "HUD route lookup"; command = @("node", "scripts\validate_hud_route_lookup.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "Public HUD route lookup"; command = @("node", "scripts\validate_public_hud_route_lookup.mjs", "--skip-release-stamp"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "Route answer safety"; command = @("node", "scripts\validate_route_answer_safety.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "definition"; label = "Route publication boundary"; command = @("node", "scripts\validate_route_publication_boundary.mjs"); blocker = $true; timeout = 180000 },
  @{ gate = "usage"; label = "Agent 6 usage boundary packet"; command = @("node", "scripts\validate_workbench_usage_agent6_boundary_packet.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "usage"; label = "Usage concordance"; command = @("node", "scripts\validate_workbench_usage_concordance.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "control"; label = "Agent 5 control readiness"; command = @("node", "scripts\validate_agent5_control_readiness.mjs"); blocker = $false; timeout = 120000 },
  @{ gate = "provenance"; label = "Source license labels"; command = @("node", "scripts\audit_source_license_labels.mjs", "reports\source-license-label-audit.md"); blocker = $true; timeout = 120000 },
  @{ gate = "provenance"; label = "Translation memory"; command = @("node", "scripts\validate_translation_memory.mjs"); blocker = $true; timeout = 120000 },
  @{ gate = "provenance"; label = "Translation memory license profiles"; command = @("node", "scripts\audit_translation_memory_license_profiles.mjs"); blocker = $false; timeout = 120000 }
)

$results = @()
foreach ($validator in $validators) {
  $startedAt = (Get-Date).ToUniversalTime().ToString("o")
  $command = $validator.command
  $exe = $command[0]
  $args = @()
  if ($command.Count -gt 1) {
    $args = $command[1..($command.Count - 1)]
  }
  $tempOut = New-TemporaryFile
  $tempErr = New-TemporaryFile
  & $exe @args 1> $tempOut.FullName 2> $tempErr.FullName
  $exitCode = $LASTEXITCODE
  $stdout = Get-Content -Raw -LiteralPath $tempOut.FullName
  $stderr = Get-Content -Raw -LiteralPath $tempErr.FullName
  Remove-Item -LiteralPath $tempOut.FullName -Force
  Remove-Item -LiteralPath $tempErr.FullName -Force
  $ok = $exitCode -eq 0
  $severity = if ($ok) { "pass" } elseif ($validator.blocker) { "blocker" } else { "warning" }
  $results += [pscustomobject]@{
    gate = $validator.gate
    label = $validator.label
    command = ($command -join " ")
    started_at = $startedAt
    exit_code = $exitCode
    ok = $ok
    timed_out = $false
    severity = $severity
    stdout = if ($stdout.Length -gt 1200) { $stdout.Substring(0, 1197) + "..." } else { $stdout.Trim() }
    stderr = if ($stderr.Length -gt 1200) { $stderr.Substring(0, 1197) + "..." } else { $stderr.Trim() }
  }
}

$validatorPath = "reports\agent6-validation-cycle-validator-results.json"
$trackedSourcesPath = "reports\agent6-validation-cycle-tracked-sources.txt"
$trackedSources = & git ls-files -- "data/sources/*.json"
$trackedSources | Set-Content -LiteralPath $trackedSourcesPath -Encoding utf8

$payload = [pscustomobject]@{
  schema_version = 1
  artifact_type = "agent6_validation_cycle_validator_results"
  generated_at = (Get-Date).ToUniversalTime().ToString("o")
  validators = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $validatorPath -Encoding utf8

$nodeArgs = @("scripts\run_agent6_validation_cycle.mjs", "--validator-results", $validatorPath, "--tracked-sources", $trackedSourcesPath)
if ($Output) {
  $nodeArgs += @("--output", $Output)
}
if ($Json) {
  $nodeArgs += @("--json", $Json)
}

& node @nodeArgs
exit $LASTEXITCODE
