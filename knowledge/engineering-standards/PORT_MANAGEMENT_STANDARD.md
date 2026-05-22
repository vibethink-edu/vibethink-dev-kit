# Estándar de Gestión de Puertos: "Zero-Conflict Protocol" 🚦

## El Problema
Con múltiples proyectos (`Orchestrator`, `Ovi`, `Mobile`) corriendo a la vez, el riesgo de colisión en `localhost:3000` es alto.

## La Solución: Registro Descentralizado
Cada proyecto (Repo) debe declarar sus puertos en un archivo estándar `.env` o `project.json` que el `ProcessManager` leerá.

### 1. Estándar de Asignación (Propuesta)

| Proyecto | Puerto Frontend | Puerto API/Proxy | Puerto WS/Otros |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | `3000` | `3001` | `3002` |
| **Ovi-Portal** | `3010` | `3011` | `3012` |
| **Mobile App** | `3020` | `3021` | `3022` |
| **Shared Storybook** | `6006` | - | - |

### 2. Implementación Técnica

Modificaremos `ProcessManager` para que incluya una función `Get-ProjectPorts` que lea el archivo `.env` local del proyecto.

**Ejemplo `.env`:**
```ini
PORT_WEB=3010
PORT_API=3011
```

**Uso en Script:**
```powershell
$ports = Get-ProjectPorts
Ensure-PortFree -Port $ports.PORT_WEB
```

Esta estructura garantiza independencia total.
