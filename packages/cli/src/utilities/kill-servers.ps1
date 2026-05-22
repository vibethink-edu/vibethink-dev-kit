# kill-servers.ps1 - Script para matar todos los servidores de desarrollo
# Mata procesos de Node.js, Vite, y otros servidores de desarrollo

Write-Host "Killing all development servers..." -ForegroundColor Yellow

# Function to kill process by name
function Kill-ProcessByName {
    param([string]$ProcessName, [string]$Description)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Found $($processes.Count) $Description process(es)" -ForegroundColor Yellow
        foreach ($process in $processes) {
            try {
                $process.Kill()
                Write-Host "Killed $Description (PID: $($process.Id))" -ForegroundColor Green
            } catch {
                Write-Host "Failed to kill $Description (PID: $($process.Id)): $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No $Description processes found" -ForegroundColor Gray
    }
}

# Function to kill process by port
function Kill-ProcessByPort {
    param([int]$Port, [string]$Description)
    
    try {
        $connections = netstat -ano | Select-String ":$Port\s"
        if ($connections) {
            Write-Host "Found process using port $Port" -ForegroundColor Yellow
            foreach ($connection in $connections) {
                $parts = $connection -split '\s+'
                $pid = $parts[-1]
                if ($pid -match '^\d+$') {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            $process.Kill()
                            Write-Host "Killed process on port $Port (PID: $pid, Name: $($process.ProcessName))" -ForegroundColor Green
                        }
                    } catch {
                        Write-Host "Failed to kill process on port $Port (PID: $pid): $_" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "No process found on port $Port" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error checking port $Port: $_" -ForegroundColor Red
    }
}

# Kill common development server processes
Write-Host "`nKilling Node.js processes..." -ForegroundColor Cyan
Kill-ProcessByName "node" "Node.js"

Write-Host "`nKilling Vite processes..." -ForegroundColor Cyan
Kill-ProcessByName "vite" "Vite"

Write-Host "`nKilling npm processes..." -ForegroundColor Cyan
Kill-ProcessByName "npm" "npm"

Write-Host "`nKilling bun processes..." -ForegroundColor Cyan
Kill-ProcessByName "bun" "bun"

Write-Host "`nKilling yarn processes..." -ForegroundColor Cyan
Kill-ProcessByName "yarn" "yarn"

Write-Host "`nKilling pnpm processes..." -ForegroundColor Cyan
Kill-ProcessByName "pnpm" "pnpm"

# Kill processes on common development ports
Write-Host "`nChecking common development ports..." -ForegroundColor Cyan
Kill-ProcessByPort 3000 "React default"
Kill-ProcessByPort 3001 "React alternative"
Kill-ProcessByPort 8080 "Vite default"
Kill-ProcessByPort 8081 "Vite alternative"
Kill-ProcessByPort 5173 "Vite default"
Kill-ProcessByPort 4173 "Vite preview"
Kill-ProcessByPort 4000 "Vite alternative"
Kill-ProcessByPort 5000 "Development server"
Kill-ProcessByPort 8000 "Development server"

# Kill any remaining Node.js processes that might be hanging
Write-Host "`nKilling any remaining Node.js processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Force killing remaining Node.js processes..." -ForegroundColor Red
    foreach ($process in $nodeProcesses) {
        try {
            $process.Kill($true) # Force kill
            Write-Host "Force killed Node.js (PID: $($process.Id))" -ForegroundColor Green
        } catch {
            Write-Host "Failed to force kill Node.js (PID: $($process.Id)): $_" -ForegroundColor Red
        }
    }
}

Write-Host "`nServer cleanup completed!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' safely" -ForegroundColor Cyan 