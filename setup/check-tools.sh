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
gf_ver="$( { py -m pip show graphifyy 2>/dev/null || python -m pip show graphifyy 2>/dev/null; } | awk -F': ' '/^Version/{print $2; exit}')"
gf_cli="$(command -v graphify 2>/dev/null || true)"
rtk_bin="$(command -v rtk 2>/dev/null || ls "$HOME/.vtwb-tools/rtk/"*/rtk* 2>/dev/null | head -1 || ls "$HOME/.vt-tools/rtk/"*/rtk* 2>/dev/null | head -1 || true)"
rtk_ver="$(printf '%s' "$rtk_bin" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
gf_machine=no; { [ -n "$gf_ver" ] || [ -n "$gf_cli" ]; } && gf_machine=si
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

echo "REPO: $(basename "$R")"
echo "────────────────────────────────────────────────────────────────────"
printf '  %-9s %-7s  %s\n' "SpecKit" "[$sk]" "repo-embebido · .specify=$sk_specify · speckit.*=$sk_cmds · parity→kit=$sk_parity"
printf '  %-9s máquina:[%-15s]  repo:[%-3s]  (graphify-out=%s · refs=%s)\n' \
       "graphify" "$(mlabel x "$gf_machine" "$gf_ver")" "$(rlabel x "$gf_repo" usa)" "$gf_out" "$gf_ref"
printf '  %-9s máquina:[%-15s]  repo:[%-7s] (refs=%s)\n' \
       "RTK" "$(mlabel x "$rtk_machine" "$rtk_ver")" "$(rlabel x "$rtk_repo" declara)" "$rtk_ref"
echo "────────────────────────────────────────────────────────────────────"
