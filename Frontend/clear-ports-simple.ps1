# Quick Port Clear Script for PowerShell
Write-Host "Checking for processes on ports 8080 and 5000..." -ForegroundColor Yellow

# Check port 8080
$port8080 = netstat -ano | findstr "8080"
if ($port8080) {
    Write-Host "Found processes on port 8080:" -ForegroundColor Red
    Write-Host $port8080
    
    $lines = $port8080 -split "`n"
    foreach ($line in $lines) {
        if ($line -match "LISTENING\s+(\d+)") {
            $pid = $matches[1]
            Write-Host "Killing process $pid on port 8080..." -ForegroundColor Cyan
            taskkill /PID $pid /F
        }
    }
} else {
    Write-Host "Port 8080 is clear" -ForegroundColor Green
}

# Check port 5000
$port5000 = netstat -ano | findstr "5000"
if ($port5000) {
    Write-Host "Found processes on port 5000:" -ForegroundColor Red
    Write-Host $port5000
    
    $lines = $port5000 -split "`n"
    foreach ($line in $lines) {
        if ($line -match "LISTENING\s+(\d+)") {
            $pid = $matches[1]
            Write-Host "Killing process $pid on port 5000..." -ForegroundColor Cyan
            taskkill /PID $pid /F
        }
    }
} else {
    Write-Host "Port 5000 is clear" -ForegroundColor Green
}

Write-Host "Port clearing complete!" -ForegroundColor Green
Write-Host "Now you can run: npm run dev" -ForegroundColor White
