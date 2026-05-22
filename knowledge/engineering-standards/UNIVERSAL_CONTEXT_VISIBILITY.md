# 🌐 Estándar de Visibilidad Universal (CLI Context)

**Problema:**
Herramientas como **Claude Code**, **Gemini CLI**, **OpenAI Codex** o scripts de **Python** operan estrictamente dentro del directorio actual (`pwd`). No pueden "ver" archivos fuera de la carpeta del proyecto (como en un `.code-workspace` de VS Code).

**Solución: "El Enlace Simbólico Fantasma"**
Creamos un enlace simbólico (Symlink) de la carpeta `_vibethink-dev-kit` *dentro* de la raíz del proyecto, pero la ocultamos de Git.

---

## 1. El Protocolo `.vibethink-core`

Cada proyecto VibeThink habilitado para trabajar con CI agéntico tendrá esta estructura:

```
VozFood-Agent/
├── .env
├── src/
├── .vibethink-core/   <-- SYMLINK (Apunta a c:\IA Marcelo Labs\_vibethink-dev-kit)
└── .gitignore         <-- Contiene ".vibethink-core"
```

### Ventajas:
1.  **Claude Code:** `claude "Lee las reglas en .vibethink-core/knowledge/..."`. Funciona perfecto.
2.  **Scripts:** `import { someConfig } from './.vibethink-core/...'`. Funciona perfecto.
3.  **Git:** No duplicamos archivos. El repo pesa lo mismo.
4.  **Sincronización:** Si actualizas el Dev-Kit, *todos* los proyectos ven el cambio al instante.

---

## 2. Herramienta de Montaje (`mount-devkit`)

No lo hagas manual. Usa el script oficial según tu OS:

### 🪟 Windows (PowerShell)
```powershell
..\ _vibethink-dev-kit\tools\mount-devkit.ps1
```

### 🐧 Linux / 🍎 Mac (Bash)
```bash
../_vibethink-dev-kit/tools/mount-devkit.sh
```
chmod +x mount-devkit.sh antes de usar si es necesario.

Esto:
1.  Verifica rutas.
2.  Crea el Symlink (Junction en Win, Soft Link en Linux).
3.  Agrega `.vibethink-core` al `.gitignore` si no existe.
