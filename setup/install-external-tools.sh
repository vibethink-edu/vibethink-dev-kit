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

# ── rtk (github release) ───────────────────────────────────────────────
rpin="$(field rtk pin)"; rtag="$(field rtk tag)"; rrepo="$(field rtk repo)"
if command -v rtk >/dev/null 2>&1; then
  summary+=("✓ rtk: ya instalado (PATH) — skip")
elif [ -z "$plat" ]; then
  summary+=("⚠ rtk: plataforma no reconocida — ver EXTERNAL-TOOLS.md")
elif ! command -v gh >/dev/null 2>&1; then
  summary+=("⚠ rtk: falta 'gh' para descargar el release — degrada, no bloquea")
else
  ra="$(asset rtk "$plat")"
  target="$HOME/.vt-tools/rtk/$rpin"
  mkdir -p "$target"
  echo "  → instalando rtk $rpin ($ra)..."
  if gh release download "$rtag" -R "$rrepo" -p "$ra" -D "$target" --clobber; then
    ( cd "$target" && tar -xzf "$ra" 2>/dev/null ); chmod +x "$target/rtk" 2>/dev/null
    mkdir -p "$HOME/.config/rtk"
    [ -f "$HOME/.config/rtk/config.toml" ] || echo "telemetry = false" > "$HOME/.config/rtk/config.toml"
    summary+=("✓ rtk: instalado $rpin (telemetría OFF) — agregá $target al PATH")
  else
    summary+=("⚠ rtk: descarga falló — degrada, no bloquea")
  fi
fi

printf '  Resumen:\n'
for s in "${summary[@]}"; do printf '    %s\n' "$s"; done
printf '\n  Verificá con: bash setup/check-tools.sh <repo>\n\n'
exit 0
