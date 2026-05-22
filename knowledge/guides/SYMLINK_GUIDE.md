# Guía Maestra de Symlinks (Enlaces Simbólicos)

## 🧐 ¿Qué son y por qué son "Mágicos"?

Imagina que tienes una biblioteca inmensa (tu disco duro) y un libro muy popular (tus `AGENTS.md`) que debería estar en dos estanterías diferentes al mismo tiempo:
1.  En la sección de "Ingeniería" (`_vibethink-dev-kit`)
2.  En la sección de "Novedades" (`vibethink-orchestrator-main`)

En lugar de comprar dos copias del libro (copiar y pegar el archivo), lo que haces es poner una **Nota de Referencia** en la estantería de "Novedades" que dice: *"Para leer este libro, ve a la sección de Ingeniería"*.

Un **Symlink** es esa nota, pero con superpoderes: **Para el sistema operativo y para los programas, la nota ES el libro.**

### ✨ La Magia
Cuando abres el Symlink, el sistema operativo te teletransporta instantáneamente al archivo original sin que te des cuenta.
- Si editas el Symlink, **estás editando el original.**
- Si borras el Symlink, **el original NO se borra**, solo quitas la referencia.

---

## 🤖 ¿Los Agentes (Gemini/Claude) los entienden?

**R: SÍ, Absolutamente.**

Para una IA (o cualquier programa como VS Code, Node.js, Python), un Symlink es **transparente**.
- Cuando Claude abre `AGENTS.md` (que es un symlink), el sistema operativo le entrega el contenido del archivo real.
- La IA **no sabe ni le importa** que es un enlace; solo ve el contenido y lo procesa.

**Beneficio:**
Esto garantiza que todos tus agentes, sin importar en qué proyecto estén trabajando, lean siempre la **Única Fuente de Verdad**. Si actualizas el archivo en el Dev-Kit, todos los agentes en todos tus proyectos se "actualizan" automáticamente al instante.

---

## 🌍 Windows vs. Linux (La Realidad Técnica)

Aunque el concepto es el mismo, la forma en que se crean es diferente.

| Característica | Windows (PowerShell) | Linux / Mac (Bash) |
| :--- | :--- | :--- |
| **Comando** | `New-Item -ItemType SymbolicLink -Path "Link" -Target "Real"` | `ln -s "Real" "Link"` |
| **Permisos** | **Requiere Administrador** (por seguridad) | Generalmente no requiere permisos especiales |
| **Soporte** | Win 10/11 (NTFS) | Nativo desde siempre |

### ⚠️ El "Gotcha" de Windows
En Windows, crear Symlinks es una operación privilegiada.
- **Problema:** Si intentas crearlo sin ser Admin, fallará.
- **Solución:** Debes abrir PowerShell como "Ejecutar como Administrador".
- **Git en Windows:** Si usas Git Bash, debes habilitar `core.symlinks = true` y ejecutarlo como Admin para que reconozca que son symlinks y no archivos de texto planos.

---

## 🛠️ Cómo crear tus Symlinks de IA

Para conectar tu `vibethink-orchestrator-main` con el cerebro en `_vibethink-dev-kit`, ejecuta esto (como Admin):

```powershell
# 1. Abre PowerShell como Administrador

# 2. Ve a la carpeta del proyecto
cd "C:\IA Marcelo Labs\vibethink-orchestrator-main"

# 3. Crea el link a AGENTS.md
New-Item -ItemType SymbolicLink -Path ".\AGENTS.md" -Target "C:\IA Marcelo Labs\_vibethink-dev-kit\knowledge\ai-agents\AGENTS.md"

# 4. Crea el link a .cursorrules
New-Item -ItemType SymbolicLink -Path ".\.cursorrules" -Target "C:\IA Marcelo Labs\_vibethink-dev-kit\knowledge\ai-agents\.cursorrules"
```

✅ **Resultado:** Ahora tienes "Portales Dimensionales" en tu proyecto que apuntan a tu cerebro central.
