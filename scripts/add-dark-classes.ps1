# Single-pass dark-class injector.
# For each color class we care about, we walk the class-string once and inject
# a `dark:` sibling ONLY when:
#   (a) the class is not followed by an opacity modifier `/N` (bg-white/10 stays intact)
#   (b) the class string does not already contain a `dark:` variant for that exact prefix
#
# We work on quoted class strings (className="..." / className={`...`}) so replacements
# stay local to a single element and can't leak into JS code.

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..\src'
$files = Get-ChildItem -Path $root -Recurse -Include *.tsx | Where-Object { $_.FullName -notmatch 'ThemeContext|Navbar\.tsx' }

# base class -> dark variant (without the `dark:` prefix)
$mappings = @(
  @{ base = 'bg-white';            dark = 'bg-gray-900' },
  @{ base = 'bg-gray-50';          dark = 'bg-gray-900' },
  @{ base = 'bg-gray-100';         dark = 'bg-gray-800' },
  @{ base = 'bg-gray-200';         dark = 'bg-gray-700' },

  @{ base = 'hover:bg-white';      dark = 'hover:bg-gray-800' },
  @{ base = 'hover:bg-gray-50';    dark = 'hover:bg-gray-800' },
  @{ base = 'hover:bg-gray-100';   dark = 'hover:bg-gray-800' },
  @{ base = 'hover:bg-gray-200';   dark = 'hover:bg-gray-700' },

  @{ base = 'text-gray-900';       dark = 'text-gray-100' },
  @{ base = 'text-gray-800';       dark = 'text-gray-200' },
  @{ base = 'text-gray-700';       dark = 'text-gray-300' },
  @{ base = 'text-gray-600';       dark = 'text-gray-400' },
  @{ base = 'text-gray-500';       dark = 'text-gray-400' },
  @{ base = 'text-gray-400';       dark = 'text-gray-500' },
  @{ base = 'text-gray-300';       dark = 'text-gray-600' },

  @{ base = 'hover:text-gray-900'; dark = 'hover:text-white' },
  @{ base = 'hover:text-gray-700'; dark = 'hover:text-gray-200' },

  @{ base = 'border-gray-100';     dark = 'border-gray-800' },
  @{ base = 'border-gray-200';     dark = 'border-gray-700' },
  @{ base = 'border-gray-300';     dark = 'border-gray-600' },

  @{ base = 'divide-gray-50';      dark = 'divide-gray-800' },
  @{ base = 'divide-gray-100';     dark = 'divide-gray-800' },
  @{ base = 'divide-gray-200';     dark = 'divide-gray-700' },

  @{ base = 'placeholder-gray-400';       dark = 'placeholder-gray-500' },
  @{ base = 'placeholder:text-gray-400';  dark = 'placeholder:text-gray-500' },

  @{ base = 'ring-gray-900';          dark = 'ring-gray-100' },
  @{ base = 'focus:ring-gray-900';    dark = 'focus:ring-gray-100' },
  @{ base = 'focus:border-gray-900';  dark = 'focus:border-gray-100' }
)

function Transform-ClassString {
  param([string]$s)

  # tokenize on whitespace, transform, re-join with single spaces preserved
  # (Tailwind class strings tolerate collapsed whitespace inside them)
  $tokens = [regex]::Split($s, '\s+') | Where-Object { $_ -ne '' }
  $existingDark = @{}
  foreach ($t in $tokens) {
    if ($t.StartsWith('dark:')) {
      # capture the un-prefixed part so we can check "is dark:X already present?"
      $existingDark[$t.Substring(5)] = $true
    }
  }

  $out = [System.Collections.Generic.List[string]]::new()
  foreach ($t in $tokens) {
    $out.Add($t)
    # skip tokens with opacity modifier (they'd need their own dark handling)
    if ($t -match '/') { continue }
    foreach ($m in $mappings) {
      if ($t -eq $m.base) {
        $darkToken = 'dark:' + $m.dark
        # skip if any dark: variant with same category (bg/text/border/etc) already exists
        # -> we only skip if the EXACT dark: token is already there OR a dark: for this prefix exists
        $prefix = $m.base.Split('-')[0]  # 'bg', 'text', 'border', 'hover:bg', etc
        $conflict = $false
        foreach ($k in $existingDark.Keys) {
          if ($k -eq $m.dark) { $conflict = $true; break }
          # Only treat as conflict if it's the same tailwind property AND same modifier chain
          if ($k.StartsWith("$prefix-") -and (-not $t.Contains(':'))) {
            # for base tokens like 'bg-white', another dark:bg-... in the same string wins
            $conflict = $true; break
          }
          if ($t.Contains(':')) {
            # for 'hover:bg-white' we want to skip only if dark:hover:bg-... exists
            $modifier = $t.Substring(0, $t.LastIndexOf(':'))
            if ($k.StartsWith("$modifier`:")) { $conflict = $true; break }
          }
        }
        if (-not $conflict) {
          $out.Add($darkToken)
          $existingDark[$m.dark] = $true
        }
      }
    }
  }
  return ($out -join ' ')
}

# Only transform inside className="..." and className={`...`} and className={'...'}
# (avoids touching JS variables / imports / whatnot)
$patternDoubleQuote = [regex]'className="([^"]*)"'
$patternSingleQuote = [regex]"className='([^']*)'"
$patternBacktick    = [regex]'className=\{`([^`]*)`\}'

$changedCount = 0
foreach ($file in $files) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  $original = $content

  $content = $patternDoubleQuote.Replace($content, {
      param($m); 'className="' + (Transform-ClassString $m.Groups[1].Value) + '"'
    })
  $content = $patternSingleQuote.Replace($content, {
      param($m); "className='" + (Transform-ClassString $m.Groups[1].Value) + "'"
    })
  $content = $patternBacktick.Replace($content, {
      param($m); 'className={`' + (Transform-ClassString $m.Groups[1].Value) + '`}'
    })

  if ($content -ne $original) {
    Set-Content -LiteralPath $file.FullName -Value $content -NoNewline
    $changedCount++
    Write-Host "  updated: $($file.FullName.Substring($root.Length + 1))"
  }
}

Write-Host ""
Write-Host "Done. $changedCount file(s) updated."
