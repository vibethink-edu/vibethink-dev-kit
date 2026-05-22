# Create-Desktop-Shortcuts.ps1
# Crea accesos directos en el escritorio para comandos frecuentes

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProjectPath = $PSScriptRoot

Write-Host "Creando accesos directos en el escritorio..." -ForegroundColor Cyan

# 1. Command Center HTML
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\VThink Command Center.lnk")
$Shortcut.TargetPath = "$ProjectPath\VThink-Command-Center.html"
$Shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
$Shortcut.Save()
Write-Host "✓ Command Center creado" -ForegroundColor Green

# 2. Iniciar Dashboard
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\VThink Dashboard.lnk")
$Shortcut.TargetPath = "$ProjectPath\start-dashboard.bat"
$Shortcut.WorkingDirectory = $ProjectPath
$Shortcut.IconLocation = "%SystemRoot%\System32\imageres.dll,10"
$Shortcut.Save()
Write-Host "✓ Dashboard shortcut creado" -ForegroundColor Green

# 3. Master Orchestrator
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\VThink Orchestrator.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$ProjectPath\dev-tools\master-orchestrator.ps1`" -List"
$Shortcut.WorkingDirectory = $ProjectPath
$Shortcut.IconLocation = "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe,0"
$Shortcut.Save()
Write-Host "✓ Orchestrator shortcut creado" -ForegroundColor Green

# 4. Documentación rápida
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\VThink Docs.lnk")
$Shortcut.TargetPath = "$ProjectPath\COMMAND_CENTER.md"
$Shortcut.IconLocation = "%SystemRoot%\System32\imageres.dll,97"
$Shortcut.Save()
Write-Host "✓ Documentation shortcut creado" -ForegroundColor Green

Write-Host "`n✅ Todos los accesos directos creados en el escritorio!" -ForegroundColor Yellow
Write-Host "Ahora puedes acceder rápidamente a:" -ForegroundColor White
Write-Host "  • VThink Command Center - Dashboard visual de comandos" -ForegroundColor Gray
Write-Host "  • VThink Dashboard - Iniciar el dashboard (puerto 3001)" -ForegroundColor Gray
Write-Host "  • VThink Orchestrator - Sistema central de scripts" -ForegroundColor Gray
Write-Host "  • VThink Docs - Documentación de comandos" -ForegroundColor Gray