# Fixes bg color collision: page (bg-gray-50) should be one shade darker than card (bg-white)
# in dark mode. Both were mapped to gray-900; page should be gray-950 instead.

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..\src'
$files = Get-ChildItem -Path $root -Recurse -Include *.tsx

$patterns = @(
  @{ find = 'bg-gray-50 dark:bg-gray-900';        replace = 'bg-gray-50 dark:bg-gray-950' },
  @{ find = 'hover:bg-gray-50 dark:hover:bg-gray-800'; replace = 'hover:bg-gray-50 dark:hover:bg-gray-900' }
)

$changedCount = 0
foreach ($file in $files) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  $original = $content
  foreach ($p in $patterns) {
    $content = $content.Replace($p.find, $p.replace)
  }
  if ($content -ne $original) {
    Set-Content -LiteralPath $file.FullName -Value $content -NoNewline
    $changedCount++
  }
}
Write-Host "Fixed hierarchy in $changedCount file(s)."
