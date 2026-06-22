#!/usr/bin/env bash
# install-external-tools.sh — POSIX (macOS/Linux) counterpart of install-external-tools.ps1.
# Provisions the kit's DEFAULT operator tools (ADR-20260612) from external-tools.lock.json.
# Idempotent: skips anything already installed. NON-BLOCKING: always exits 0
# (DEFAULT != gate — absence degrades, never blocks). Pairs with scripts/check-tools.sh.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
lock="$here/external-tools.lock.json"
[ -f "$lock" ] || { echo "✗ no external-tools.lock.json — aborto sin romper nada."; exit 0; }
py="$(command -v python3 || command -v python || true)"

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)  plat=linux-x64 ;;
  Linux-aarch64) plat=linux-arm64 ;;
  Darwin-x86_64) plat=macos-x64 ;;
  Darwin-arm64)  plat=macos-arm64 ;;
  *)             plat="" ;;
esac

field(){ "$py" -c "import json;d=json.load(open('$lock'));t=[x for x in d['tools'] if x['name']=='$1'][0];print(t.get('$2',''))" 2>/dev/null; }
asset(){ "$py" -c "import json;d=json.load(open('$lock'));t=[x for x in d['tools'] if x['name']=='$1'][0];print(t.get('assets',{}).get('$2',''))" 2>/dev/null; }

summary=()
printf '\n  Provisioning kit default tools (idempotent · non-blocking)\n\n'

# ── graphify (pip) ─────────────────────────────────────────────────────
gpkg="$(field graphify package)"; gpin="$(field graphify pin)"
if [ -n "$py" ] && "$py" -m pip show "$gpkg" >/dev/null 2>&1; then
  gv="$("$py" -m pip show "$gpkg" 2>/dev/null | awk -F': ' '/^Version/{print $2}')"
  note=""; [ "$gv" != "$gpin" ] && note=" (pin=$gpin · drift, version-forward por PR)"
  summary+=("✓ graphify: ya instalado ($gv) — skip$note")
elif [ -n "$py" ]; then
  echo "  → instalando graphify $gpin..."
  if "$py" -m pip install --user "$gpkg==$gpin"; then summary+=("✓ graphify: instalado $gpin")
  else summary+=("⚠ graphify: pip falló — degrada, no bloquea"); fi
else
  summary+=("⚠ graphify: falta python3 — degrada, no bloquea")
fi

# gotcha "instalado ≠ disponible": el paquete puede estar pero el CLI no resolver por
# nombre si el bin/ del --user site no está en PATH (multi-Python). Verificar y arreglar.
gcli="$(field graphify cli)"; [ -z "$gcli" ] && gcli=graphify
if [ -n "$py" ] && ! command -v "$gcli" >/dev/null 2>&1; then
  ubase="$("$py" -m site --user-base 2>/dev/null)"
  sdir="${ubase:+$ubase/bin}"
  [ -n "$sdir" ] && [ -d "$sdir" ] && PATH="$sdir:$PATH" && export PATH
  if command -v "$gcli" >/dev/null 2>&1; then
    summary+=("✓ graphify: CLI ahora resuelve (antepuse $sdir al PATH de ESTA sesión)")
    summary+=("  ↳ persistir: agregá '$sdir' al PATH (tu rc); un shell ya abierto NO lo toma — abrí uno nuevo")
  else
    summary+=("⚠ graphify: paquete instalado pero el CLI '$gcli' no resuelve por nombre (gotcha 'instalado ≠ disponible')")
    [ -n "$sdir" ] && summary+=("  ↳ agregá '$sdir' al PATH y abrí un shell NUEVO")
  fi
fi

# ── github-release tools (rtk, engram, … — loop genérico sobre el lock) ─
ghnames="$("$py" -c "import json;print(' '.join(t['name'] for t in json.load(open('$lock'))['tools'] if t['kind']=='github-release'))" 2>/dev/null)"
for name in $ghnames; do
  cli="$(field "$name" cli)"; pin="$(field "$name" pin)"; tag="$(field "$name" tag)"; repo="$(field "$name" repo)"; idir="$(field "$name" installDir)"
  if command -v "$cli" >/dev/null 2>&1; then summary+=("✓ $name: ya instalado (PATH) — skip"); continue; fi
  if [ -z "$plat" ]; then summary+=("⚠ $name: plataforma no reconocida — ver EXTERNAL-TOOLS.md"); continue; fi
  if ! command -v gh >/dev/null 2>&1; then summary+=("⚠ $name: falta 'gh' para descargar el release — degrada, no bloquea"); continue; fi
  a="$(asset "$name" "$plat")"
  target="${idir/#\~/$HOME}"
  mkdir -p "$target"
  echo "  → instalando $name $pin ($a) en $target..."
  if gh release download "$tag" -R "$repo" -p "$a" -D "$target" --clobber; then
    ( cd "$target" && tar -xzf "$a" 2>/dev/null ); chmod +x "$target/$cli" 2>/dev/null
    tcfg="$(field "$name" telemetryConfig)"
    if [ -n "$tcfg" ]; then tc="${tcfg/#\~/$HOME}"; mkdir -p "$(dirname "$tc")"; [ -f "$tc" ] || echo "telemetry = false" > "$tc"; fi
    extra=""; [ "$(field "$name" stateful)" = "True" ] && extra=" · STATEFUL: respaldá la BD con 'engram export' (ver engram-weekly-review.sh)"
    summary+=("✓ $name: instalado $pin — agregá $target al PATH$extra")
  else
    summary+=("⚠ $name: descarga falló — degrada, no bloquea")
  fi
done

printf '  Resumen:\n'
for s in "${summary[@]}"; do printf '    %s\n' "$s"; done
printf '\n  Verificá con: bash setup/check-tools.sh <repo>\n\n'
exit 0
