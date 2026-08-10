# Post-conversion cleanup:
#  - Remove `dark:text-gray-600` where paired with `text-gray-300`
#    (text-gray-300 is typically used on dark backgrounds or as a decorative low-contrast color;
#    dark:text-gray-600 makes it invisible on dark backgrounds)

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..\src'
$files = Get-ChildItem -Path $root -Recurse -Include *.tsx

$patterns = @(
  @{ find = 'text-gray-300 dark:text-gray-600'; replace = 'text-gray-300' }
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
Write-Host "Cleaned $changedCount file(s)."
