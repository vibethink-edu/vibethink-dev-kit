# Runbook — Stack de IA Local en la Máquina de Dev (Windows + GPU NVIDIA)

> **Capa:** Adaptador de plataforma **Windows (L3)** — el *cómo* concreto para montar y usar IA local en una laptop/PC con **GPU NVIDIA dedicada**. **Puramente informativo** (no es canon, gate ni verifier).
> **Principios agnósticos:** [`DEV-MACHINE-HEALTH.md`](./DEV-MACHINE-HEALTH.md). **Mantenimiento:** [`RUNBOOK-DEV-MACHINE-HEALTH-WINDOWS.md`](./RUNBOOK-DEV-MACHINE-HEALTH-WINDOWS.md).
>
> **Origen:** montaje 2026-07-16 en una ASUS TUF (RTX 5060 8GB VRAM, 64GB RAM). Ver también el testing comunitario de modelos locales que valida las conclusiones de abajo.

## 0. Filosofía — dónde SÍ y dónde NO usar IA local

**La IA local COMPLEMENTA, no reemplaza a los modelos frontera.** Regla dura:

| Tarea | Usar |
|---|---|
| Agentes, código de producción, razonamiento complejo, orquestación | **Frontera** (Codex, Opus) — el local NO alcanza |
| Prototipar prompts/flujos, tareas de volumen, datos sensibles (PII local), transcripción, visión, embeddings | **Local** — gratis y privado |

**Límite real (validado por testing comunitario):** con **<128 GB de RAM** los modelos locales **no sirven como orquestador de agentes** (contexto largo + tool-calling los ahoga: swap, timeouts, compactación infinita). Una GPU de 8 GB corre modelos 7-8B para tareas puntuales, no un agente que lee archivos y ejecuta comandos en loop. **No caer en la trampa de reemplazar el frontera.**

## 1. El stack

| Capa | Herramienta | Nota |
|---|---|---|
| Motor | **Ollama** (`winget install Ollama.Ollama`) | corre los modelos en la GPU, solo |
| Modelo código/tools | `qwen2.5-coder:7b` | **el mejor para código y tool-calling** |
| Modelo general | `gemma3:4b` | multilingüe, rápido; **NO soporta tools** |
| Modelo visión | `llava:7b` | lee imágenes/screenshots; **NO soporta tools** |
| Chat UI | **Open WebUI** (Docker) | historial, subir docs/imágenes, multi-modelo |
| Acceso remoto | **Tailscale** | usar la máquina desde otras (celular/Mac) |
| Transcripción (STT) | **faster-whisper** (venv Python 3.12) | audio → texto, usa la GPU; ver §5 |

## 2. Setup

```powershell
# Ollama + modelos
winget install Ollama.Ollama
ollama pull qwen2.5-coder:7b   # codigo
ollama pull gemma3:4b          # general
ollama pull llava:7b           # vision

# Open WebUI (Docker) — corre en WSL, apunta a Ollama en Windows
# 1) Ollama debe escuchar en 0.0.0.0 (NO solo 127.0.0.1) para que el contenedor lo alcance:
#    App Ollama -> Settings -> "Expose Ollama to the network"  (o env OLLAMA_HOST=0.0.0.0 + reiniciar el SERVIDOR, no solo la app tray)
# 2) IP del host Windows vista desde WSL:  wsl -d Ubuntu -- ip route show default | awk '{print $3}'
# 3) Contenedor (puerto 3111 porque el 3000 suele estar ocupado por dev servers):
docker run -d -p 3111:8080 -e "OLLAMA_BASE_URL=http://<IP-host>:11434" -v open-webui:/app/backend/data --name open-webui --restart unless-stopped ghcr.io/open-webui/open-webui:main
# -> abrir http://localhost:3111 , crear cuenta local (no sale de la maquina)

# Tailscale (red privada entre tus maquinas)
winget install tailscale.tailscale
# luego: iniciar sesion (abre el navegador) en cada maquina que quieras conectar
```

## 3. Uso

- **Chatear:** app de Ollama (bandeja) o **Open WebUI** (`localhost:3111`). Elegir el modelo arriba.
- **Código en tu editor/scripts:** Ollama expone API **OpenAI-compatible** en `http://localhost:11434` → apuntá tu código a esa URL para prototipar sin costo.
- **Visión:** en Open WebUI elegir `llava`, adjuntar 📎 una imagen, preguntar.
- **Remoto:** con Tailscale, desde el celular/Mac te conectás por SSH o alcanzás `localhost:3111`/`11434` de la máquina como si estuvieras al lado.

## 4. Gotchas / lecciones (lo que muerde)

- **⚠️ Tools solo Qwen.** `gemma3` y `llava` **no soportan tool-calling** → error `does not support tools`. Para agentes/tools usar **Qwen**; para el "task model" de Open WebUI (títulos) también Qwen.
- **⚠️ Disciplina de contexto.** No inflar el `context size` (dejarlo en 32-64K salvo necesidad). Un contexto de 256K puede comer toda la RAM → **swap → 0.4 tok/s** (la máquina se arrastra). Ollama por defecto es sano; si tocás `num_ctx`, cuidado.
- **⚠️ Persistencia de Ollama en red.** Si forzás `OLLAMA_HOST=0.0.0.0` a mano, la app tray lo revierte a `127.0.0.1` al reiniciar (y Open WebUI deja de ver los modelos). Fijalo con el toggle **"Expose Ollama to the network"** de la app.
- **⚠️ Python muy nuevo rompe el stack Python.** Con **Python 3.14** (o cualquier versión recién salida), `faster-whisper`, `torch`, `ComfyUI` **no tienen wheels** → hay que armar un **Python 3.12 dedicado** (uv/conda) para esos.
- **✅ GPU dedicada NVIDIA >> integrada AMD.** En integradas (Radeon/Vulkan/RADV) cargar un modelo puede **tumbar el driver y reiniciar la máquina** (la iGPU maneja compute + display). Con NVIDIA/CUDA dedicada esto no pasa.

## 5. Transcripción — faster-whisper (audio → texto, STT)

**Montado 2026-07-16** en la ASUS TUF (Python 3.12.9 ya presente, RTX 5060). Receta exacta que funcionó:

```powershell
# 1) venv AISLADO con Python 3.12 (NO tocar el Python del sistema: era 3.14 -> rompe wheels de torch/ctranslate2)
py -3.12 -m venv "C:\IA Marcelo Labs\_ai-local\whisper\venv"
$py = "C:\IA Marcelo Labs\_ai-local\whisper\venv\Scripts\python.exe"
# 2) faster-whisper + libs de CUDA 12 para GPU (las DLLs vienen EN los wheels; NO hace falta el CUDA toolkit)
& $py -m pip install faster-whisper nvidia-cublas-cu12 nvidia-cudnn-cu12
```

Wrapper `transcribe.cmd` (carpeta agregada al PATH del usuario) → `transcribe "audio.m4a" [modelo] [idioma]` genera `.txt` + `.srt` al lado. Default modelo `medium`, idioma `es`. El `.py` intenta `cuda/float16` y cae solo a `cpu/int8`.

### Gotchas de whisper (los que mordieron — 2026-07-16)
- **⚠️ `RuntimeError: Library cublas64_12.dll is not found` aunque ESTÉ instalada** (en `venv/Lib/site-packages/nvidia/cublas/bin/`). CTranslate2 (nativo) carga cublas **por nombre simple** → solo respeta el **PATH del proceso**, NO `os.add_dll_directory`. **Fix en el `.py`:** para `cublas`, `cudnn`, `cuda_nvrtc` hacer `os.environ["PATH"] = str(nvidia/<lib>/bin) + os.pathsep + PATH` **antes** de `import faster_whisper` (hacer AMBOS: PATH prepend + `add_dll_directory`).
- **⚠️ `UnicodeEncodeError: charmap codec` al imprimir tildes/símbolos** (ej. `✓`). La consola Windows es cp1252. **Fix:** `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` al inicio. Los `.txt`/`.srt` se escriben con `encoding="utf-8"` aparte.
- **✅ GPU confirmada** en la RTX 5060 (`cuda/float16`). cuDNN 9 + CUDA 12 vía wheels pip funcionan sin toolkit.
- Calidad: `base` es solo para smoke test; para español real usar `medium` (balance) o `large-v3` (máxima). Una voz robótica de TTS transcribe mal — es el TTS, no whisper.

## 6. Opcional / descartado
- `ComfyUI` (imágenes) → **descartado para esta máquina (2026-07-16):** el usuario genera imágenes en la nube (OpenAI, etc.), que en una GPU de 8 GB VRAM da mejor calidad/comodidad que SDXL/Flux local. Montar **solo** si aparece necesidad de volumen (batch sin costo por imagen), privacidad de datos, o workflows específicos (LoRA/ControlNet).
- TTS: `Piper` / `XTTS` (texto → voz) → si surge la necesidad; idem venv Python 3.12.
- Embeddings locales (`nomic-embed`) para RAG → idem.
