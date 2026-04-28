param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$EntryScript,

  [Parameter(ValueFromRemainingArguments = $true, Position = 1)]
  [string[]]$RemainingArgs
)

function Resolve-NodeExecutable {
  $fallbacks = @(
    "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
    "C:\Program Files\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
    "C:\Program Files\WindowsApps\OpenAI.Codex_26.417.5275.0_x64__2p2nqsd0c76g0\app\resources\node.exe"
  ) | Where-Object { $_ -and (Test-Path $_) }

  foreach ($candidate in $fallbacks) {
    try {
      & $candidate --version *> $null
      if ($LASTEXITCODE -eq 0) {
        return $candidate
      }
    } catch {
      continue
    }
  }

  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command -and $command.Source -and $command.Source -notmatch "\\WindowsApps\\") {
    return $command.Source
  }

  throw "Could not find node.exe. Install Node.js or add it to PATH."
}

$nodeExecutable = Resolve-NodeExecutable
$resolvedEntry = Resolve-Path $EntryScript

& $nodeExecutable $resolvedEntry @RemainingArgs
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
  exit $exitCode
}
