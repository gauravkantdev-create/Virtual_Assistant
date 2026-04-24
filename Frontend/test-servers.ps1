# Test Servers PowerShell Script
# Usage: .\test-servers.ps1

Write-Host "🔍 Testing Frontend and Backend Servers..." -ForegroundColor Cyan

# Test Frontend
Write-Host "`n📱 Testing Frontend (http://localhost:8080)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri http://localhost:8080 -Method Head -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running correctly!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend is not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Backend
Write-Host "`n🔧 Testing Backend (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri http://localhost:5000/test-gemini?prompt=test -Method Get -UseBasicParsing
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is running correctly!" -ForegroundColor Green
        $content = $backendResponse.Content
        $shortContent = if ($content.Length -gt 100) { $content.Substring(0, 100) + "..." } else { $content }
        Write-Host "📝 Sample response: $shortContent" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backend returned status: $($backendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test React Router DOM (the problematic dependency)
Write-Host "`n🔄 Testing React Router DOM dependency..." -ForegroundColor Yellow
try {
    $routerResponse = Invoke-WebRequest -Uri http://localhost:8080/node_modules/.vite/deps/react-router-dom.js -Method Head -UseBasicParsing
    if ($routerResponse.StatusCode -eq 200) {
        Write-Host "✅ React Router DOM is loading correctly!" -ForegroundColor Green
    } else {
        Write-Host "❌ React Router DOM returned status: $($routerResponse.StatusCode)" -ForegroundColor Red
        Write-Host "💡 Try running: npm run deep-clean && npm run dev" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ React Router DOM is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running: npm run deep-clean && npm run dev" -ForegroundColor Cyan
}

Write-Host "`n🎉 Testing complete!" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor White
