#!/usr/bin/env bash
# check-tools.sh — ¿este repo "tiene" SpecKit / graphify / RTK?
# Uso:  bash check-tools.sh [ruta-al-repo]      (default: directorio actual)
#
# Dos carriles, dos formas de validar:
#   • SpecKit  = REPO-EMBEBIDO  → un solo veredicto, mirando archivos del repo.
#   • graphify / RTK = HERRAMIENTAS DE MÁQUINA (operator tools, pin+receta)
#       → DOS señales separadas:
#         - MÁQUINA: ¿el CLI está instalado en este equipo? (igual para todo repo)
#         - REPO:    ¿ESTE repo lo usa/declara? (cache graphify-out + refs en docs)
#       Estar instalado en la máquina NO implica que un repo lo adopte.
set -u
R="${1:-.}"; R="${R%/}"
[ -d "$R" ] || { echo "✗ repo no existe: $R"; exit 2; }

# ── señales de MÁQUINA (iguales para cualquier repo) ───────────────────
gf_ver="$( { py -m pip show graphifyy 2>/dev/null || python3 -m pip show graphifyy 2>/dev/null || python -m pip show graphifyy 2>/dev/null; } | awk -F': ' '/^Version/{print $2; exit}')"
gf_cli="$(command -v graphify 2>/dev/null || true)"
rtk_bin="$(command -v rtk 2>/dev/null || ls "$HOME/.vtwb-tools/rtk/"*/rtk* 2>/dev/null | head -1 || ls "$HOME/.vt-tools/rtk/"*/rtk* 2>/dev/null | head -1 || true)"
rtk_ver="$(printf '%s' "$rtk_bin" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
# graphify: "instalado" (paquete presente) NO implica "disponible" (CLI resuelve por
# nombre). El gotcha "instalado != en PATH" hizo que 5 ejecutores lo vieran unavailable.
gf_state=none   # none | nopath | ok
if   [ -n "$gf_cli" ]; then gf_state=ok        # el CLI graphify RESUELVE por nombre → usable
elif [ -n "$gf_ver" ]; then gf_state=nopath    # paquete instalado pero el CLI no resuelve (PATH)
fi
gf_hint=""
if [ "$gf_state" = nopath ]; then
  ubase="$( { py -m site --user-base 2>/dev/null || python3 -m site --user-base 2>/dev/null || python -m site --user-base 2>/dev/null; } )"
  case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) gf_hint="$ubase\\Scripts" ;; *) gf_hint="$ubase/bin" ;; esac
fi
rtk_machine=no; [ -n "$rtk_bin" ] && rtk_machine=si

# ── señales por-REPO ───────────────────────────────────────────────────
sk_specify=no; [ -d "$R/.specify" ] && sk_specify=si
sk_cmds="$(ls "$R/.claude/commands/speckit."*.md 2>/dev/null | wc -l | tr -d ' ')"
sk_parity=no;  grep -rsq "spec-kit/templates" "$R/tools/" 2>/dev/null && sk_parity=si
gf_out=no;     [ -d "$R/graphify-out" ] && gf_out=si
gf_ref="$(grep -rIl -i "graphify" "$R/AGENTS.md" "$R/docs" "$R/setup" 2>/dev/null | wc -l | tr -d ' ')"
rtk_ref="$(grep -rIl -iE "\brtk\b" "$R/AGENTS.md" "$R/docs" "$R/setup" 2>/dev/null | wc -l | tr -d ' ')"

# ── veredictos ─────────────────────────────────────────────────────────
sk=NO; { [ "$sk_specify" = si ] || [ "${sk_cmds:-0}" -gt 0 ]; } && sk="SÍ"
gf_repo=no; { [ "$gf_out" = si ] || [ "${gf_ref:-0}" -gt 0 ]; } && gf_repo=si
rtk_repo=no; [ "${rtk_ref:-0}" -gt 0 ] && rtk_repo=si

mlabel(){ [ "$2" = si ] && echo "instalado ${3:-?}" || echo "NO instalado"; }
rlabel(){ [ "$2" = si ] && echo "$3" || echo "no"; }

case "$gf_state" in
  ok)     gf_m="disponible ${gf_ver:-?}" ;;
  nopath) gf_m="instalado ${gf_ver:-?} · NO en PATH" ;;
  *)      gf_m="NO instalado" ;;
esac

echo "REPO: $(basename "$R")"
echo "────────────────────────────────────────────────────────────────────"
printf '  %-9s %-7s  %s\n' "SpecKit" "[$sk]" "repo-embebido · .specify=$sk_specify · speckit.*=$sk_cmds · parity→kit=$sk_parity"
printf '  %-9s máquina:[%-26s]  repo:[%-3s]  (graphify-out=%s · refs=%s)\n' \
       "graphify" "$gf_m" "$(rlabel x "$gf_repo" usa)" "$gf_out" "$gf_ref"
printf '  %-9s máquina:[%-26s]  repo:[%-7s] (refs=%s)\n' \
       "RTK" "$(mlabel x "$rtk_machine" "$rtk_ver")" "$(rlabel x "$rtk_repo" declara)" "$rtk_ref"
echo "────────────────────────────────────────────────────────────────────"
if [ "$gf_state" = nopath ]; then
  echo "  ⚠ graphify instalado pero el CLI no RESUELVE por nombre (gotcha 'instalado ≠ disponible')."
  [ -n "$gf_hint" ] && echo "    Agregá al PATH:  $gf_hint"
  echo "    Ojo stale-shell: un shell ya abierto congela su PATH — abrí uno NUEVO tras arreglarlo."
fi
