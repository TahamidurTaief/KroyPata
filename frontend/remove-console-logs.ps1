# PowerShell script to remove all console.log statements from frontend files

$frontendPath = "c:\Users\iZoom10\Desktop\icommerce\frontend"

# Exclude node_modules, .next, and other build directories
$excludeDirs = @('node_modules', '.next', 'dist', 'build', 'public\sounds')

# Get all JS and JSX files
$files = Get-ChildItem -Path "$frontendPath\app" -Include *.js,*.jsx -Recurse -File | 
    Where-Object { 
        $path = $_.FullName
        -not ($excludeDirs | Where-Object { $path -like "*\$_\*" })
    }

Write-Host "Found $($files.Count) files to process"

$totalRemoved = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        $originalLength = $content.Length
        
        # Remove console.log statements (various patterns)
        # Pattern 1: Single line console.log
        $content = $content -replace '^\s*console\.log\([^;]*\);\s*$', ''
        
        # Pattern 2: console.log with multi-line content
        $content = $content -replace 'console\.log\([^)]*\);?', ''
        
        # Pattern 3: Conditional console.log (if DEBUG)
        $content = $content -replace 'if\s*\(DEBUG_API\)\s*console\.log\([^)]*\);?', ''
        
        # Clean up excessive blank lines (more than 2 consecutive blank lines)
        $content = $content -replace '(\r?\n){3,}', "`r`n`r`n"
        
        if ($content.Length -ne $originalLength) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $totalRemoved++
            Write-Host "Processed: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "`nCompleted! Modified $totalRemoved files." -ForegroundColor Cyan
