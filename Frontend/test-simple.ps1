# Test Servers PowerShell Script
Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8080 -Method Head -UseBasicParsing
    Write-Host "Frontend Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Frontend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/test-gemini?prompt=test -Method Get -UseBasicParsing
    Write-Host "Backend Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing React Router DOM..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8080/node_modules/.vite/deps/react-router-dom.js -Method Head -UseBasicParsing
    Write-Host "React Router DOM Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "React Router DOM Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Done!" -ForegroundColor Cyan
