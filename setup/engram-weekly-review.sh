#!/usr/bin/env bash
# Engram weekly review — operator cadence: BACKUP + uso + salud + upstream + eficacia.
# Engram (class C) is STATEFUL — the DB is the operator's responsibility, so this ritual
# BACKS UP FIRST (engram export), then reviews. Agnostic: runs on the machine where
# ~/.engram lives; the consuming operator supplies its project alias via env.
#
# Config (env):
#   ENGRAM           path to the engram binary (default: PATH, then ~/bin/engram[.exe])
#   ENGRAM_PROJECT   project alias to scope efficacy search (optional; omit = all)
#   ENGRAM_BACKUP_DIR  where exports land (default: ~/.engram-backups, keeps last 8)
# Uso:  ENGRAM_PROJECT=<alias> bash setup/engram-weekly-review.sh
set -u

ENG="${ENGRAM:-$(command -v engram 2>/dev/null || true)}"
[ -n "$ENG" ] && [ -x "$ENG" ] || ENG="$(command -v engram.exe 2>/dev/null || echo "$HOME/bin/engram.exe")"
PROJ="${ENGRAM_PROJECT:-}"
projargs=(); [ -n "$PROJ" ] && projargs=(--project "$PROJ")

echo "=================================================="
echo " ENGRAM WEEKLY REVIEW — $(date '+%Y-%m-%d %H:%M')${PROJ:+ · project=$PROJ}"
echo "=================================================="

echo ""
echo "--- 0. BACKUP (la BD es STATEFUL — respaldar PRIMERO) ----"
BK="${ENGRAM_BACKUP_DIR:-$HOME/.engram-backups}"
mkdir -p "$BK"
OUT="$BK/engram-export-$(date '+%Y%m%d').json"
if "$ENG" export > "$OUT" 2>/dev/null && [ -s "$OUT" ]; then
  echo "   ✓ export → $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
  # retención: conservar los últimos 8 respaldos semanales, podar los más viejos
  ls -1t "$BK"/engram-export-*.json 2>/dev/null | tail -n +9 | xargs -r rm -f
else
  rm -f "$OUT" 2>/dev/null
  echo "   ⚠ export falló o vacío — verificá el binario ($ENG). La BD sigue en ~/.engram (no se tocó)."
fi

echo ""
echo "--- 1. USO (¿sube el número? ¿quién escribe?) -----"
"$ENG" stats         2>/dev/null | grep -E "Observations|Sessions|Projects"
"$ENG" projects list 2>/dev/null | grep -E "^  [a-z]"

echo ""
echo "--- 2. SALUD (engram doctor) ----------------------"
"$ENG" doctor 2>/dev/null | grep -E "Engram Doctor:|Checks:|^\[(warning|blocked|error)\]"
echo "   ESPERADO (benigno): si usás un --project alias distinto del nombre de carpeta,"
echo "   1 warning 'session_project_directory_mismatch' es intencional (alias declarado a propósito)."
echo "   ACCIONAR solo si aparece OTRO warning, o si sube a blocked/error."

echo ""
echo "--- 3. UPSTREAM (¿release nuevo que revisar?) -----"
CURRENT=$("$ENG" version 2>/dev/null | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | head -1)
LATEST=$(gh release view --repo Gentleman-Programming/engram --json tagName -q .tagName 2>/dev/null)
echo "   instalado: ${CURRENT:-?}   |   último: ${LATEST:-?}"
if [ -n "${LATEST:-}" ] && [ "v${CURRENT:-x}" != "$LATEST" ]; then
  echo "   >>> HAY VERSIÓN NUEVA — revisar changelog y decidir adoptar/saltar (upstream protocol)"
else
  echo "   al día"
fi

echo ""
echo "--- 4. EFICACIA (cualitativo — revisar a mano) ----"
echo "   ¿Hubo casos esta semana donde una búsqueda en Engram evitó re-derivar algo?"
"$ENG" search "recall util" "${projargs[@]}" 2>/dev/null | grep -cE "^\[" | sed 's/^/   casos registrados (recall util): /'
echo "=================================================="
