#!/usr/bin/env bash
# check-tools.sh — repo adoption + local/session health for SpecKit, graphify and RTK.
# Usage:  bash check-tools.sh [--json] [ruta-al-repo]      (default: current dir)
#
# Product correctness stays non-blocking. Local/session health does not stay quiet:
# missing external dev tools print a loud RED/WARN with exact remediation.
set -u

JSON=no
if [ "${1:-}" = "--json" ]; then JSON=si; shift; fi
R="${1:-.}"; R="${R%/}"
[ -d "$R" ] || { echo "✗ repo no existe: $R"; exit 2; }

path_dirs() {
  printf '%s' "${PATH:-}" | tr ':' '\n'
}

find_cli() {
  cli="$1"
  command -v "$cli" 2>/dev/null && return 0
  command -v "$cli.exe" 2>/dev/null && return 0
  path_dirs | while IFS= read -r d; do
    [ -n "$d" ] || continue
    if [ -x "$d/$cli" ]; then printf '%s\n' "$d/$cli"; exit 0; fi
    if [ -x "$d/$cli.exe" ]; then printf '%s\n' "$d/$cli.exe"; exit 0; fi
  done
}

canonical_cli() {
  command -v "$1" 2>/dev/null || true
}

version_of() {
  bin="$1"
  [ -n "$bin" ] || return 0
  "$bin" --version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1 || true
}

python_show() {
  pkg="$1"
  { py -m pip show "$pkg" 2>/dev/null || python3 -m pip show "$pkg" 2>/dev/null || python -m pip show "$pkg" 2>/dev/null; } |
    awk -F': ' '/^Version/{print $2; exit}'
}

python_user_scripts() {
  ubase="$( { py -m site --user-base 2>/dev/null || python3 -m site --user-base 2>/dev/null || python -m site --user-base 2>/dev/null; } | head -1 )"
  [ -n "$ubase" ] || return 0
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) printf '%s\\Scripts\n' "$ubase" ;;
    *) printf '%s/bin\n%s/Scripts\n' "$ubase" "$ubase" ;;
  esac
}

windows_homes_from_path() {
  printf '%s' "${PATH:-}" | grep -oE '/mnt/[a-zA-Z]/Users/[^/:]+' | sort -u
}

rtk_expected_dirs() {
  for h in "${HOME:-}" "${USERPROFILE:-}" $(windows_homes_from_path); do
    [ -n "$h" ] || continue
    printf '%s\n' "$h/.vt-tools/rtk/0.39.0" "$h/.vtwb-tools/rtk/0.39.0" "$h/.vt-tools/rtk" "$h/.vtwb-tools/rtk"
  done | sort -u
}

find_known_rtk() {
  rtk_expected_dirs | while IFS= read -r d; do
    [ -d "$d" ] || continue
    find "$d" -maxdepth 3 \( -name rtk -o -name rtk.exe \) -type f 2>/dev/null | head -1
  done
}

join_lines() {
  awk 'BEGIN{first=1} { if (!first) printf " ; "; printf "%s", $0; first=0 } END{ print "" }'
}

state_for_cli() {
  cli="$1"; installed_hint="$2"; known_bin="${3:-}"
  canon="$(canonical_cli "$cli")"
  any="$(find_cli "$cli" | head -1)"
  if [ -n "$canon" ]; then printf 'ok|%s|%s\n' "$canon" "$(version_of "$canon")"; return 0; fi
  if [ -n "$any" ]; then printf 'shell-mismatch|%s|%s\n' "$any" "$(version_of "$any")"; return 0; fi
  if [ -n "$installed_hint" ] || [ -n "$known_bin" ]; then
    bin="${known_bin:-}"
    printf 'installed-not-in-path|%s|%s\n' "$bin" "$(version_of "$bin")"
    return 0
  fi
  printf 'missing||\n'
}

gf_pkg_ver="$(python_show graphifyy)"
gf_state_row="$(state_for_cli graphify "$gf_pkg_ver" "")"
gf_state="${gf_state_row%%|*}"
gf_rest="${gf_state_row#*|}"; gf_bin="${gf_rest%%|*}"; gf_ver="${gf_rest#*|}"
[ -z "$gf_ver" ] && gf_ver="$gf_pkg_ver"
gf_expected="$(python_user_scripts | join_lines)"
[ -n "$gf_bin" ] && gf_expected="$(printf '%s\n%s\n' "$(dirname "$gf_bin")" "$gf_expected" | sed '/^$/d' | sort -u | join_lines)"

rtk_known="$(find_known_rtk)"
rtk_state_row="$(state_for_cli rtk "" "$rtk_known")"
rtk_state="${rtk_state_row%%|*}"
rtk_rest="${rtk_state_row#*|}"; rtk_bin="${rtk_rest%%|*}"; rtk_ver="${rtk_rest#*|}"
rtk_expected="$(rtk_expected_dirs | join_lines)"
[ -n "$rtk_bin" ] && rtk_expected="$(printf '%s\n%s\n' "$(dirname "$rtk_bin")" "$rtk_expected" | sed '/^$/d' | sort -u | join_lines)"

severity() {
  case "$1" in
    ok) echo OK ;;
    shell-mismatch) echo WARN ;;
    installed-not-in-path|missing) echo RED ;;
    *) echo RED ;;
  esac
}

tool_label() {
  state="$1"; ver="$2"
  case "$state" in
    ok) echo "OK disponible ${ver:-?}" ;;
    shell-mismatch) echo "WARN shell mismatch ${ver:-?}" ;;
    installed-not-in-path) echo "RED instalado pero CLI no en PATH ${ver:-?}" ;;
    missing) echo "RED faltante" ;;
    *) echo "RED desconocido" ;;
  esac
}

# ── señales por-REPO ───────────────────────────────────────────────────
sk_specify=no; [ -d "$R/.specify" ] && sk_specify=si
sk_cmds="$(ls "$R/.claude/commands/speckit."*.md 2>/dev/null | wc -l | tr -d ' ')"
sk_parity=no;  grep -rsq "spec-kit/templates" "$R/tools/" 2>/dev/null && sk_parity=si
gf_out=no;     [ -d "$R/graphify-out" ] && gf_out=si
gf_ref="$(grep -rIl -i "graphify" "$R/AGENTS.md" "$R/docs" "$R/setup" 2>/dev/null | wc -l | tr -d ' ')"
rtk_ref="$(grep -rIl -iE "\brtk\b" "$R/AGENTS.md" "$R/docs" "$R/setup" 2>/dev/null | wc -l | tr -d ' ')"

sk=NO; { [ "$sk_specify" = si ] || [ "${sk_cmds:-0}" -gt 0 ]; } && sk="SÍ"
gf_repo=no; { [ "$gf_out" = si ] || [ "${gf_ref:-0}" -gt 0 ]; } && gf_repo=si
rtk_repo=no; [ "${rtk_ref:-0}" -gt 0 ] && rtk_repo=si

rlabel(){ [ "$2" = si ] && echo "$3" || echo "no"; }

overall=OK
for s in "$(severity "$gf_state")" "$(severity "$rtk_state")"; do
  [ "$s" = RED ] && overall=RED
  [ "$s" = WARN ] && [ "$overall" = OK ] && overall=WARN
done

if [ "$JSON" = si ]; then
  printf '{\n'
  printf '  "repo": "%s",\n' "$(basename "$R")"
  printf '  "externalTools": {\n'
  printf '    "status": "%s",\n' "$overall"
  printf '    "blocking": false,\n'
  printf '    "tools": [\n'
  printf '      {"name":"graphify","state":"%s","severity":"%s","version":"%s","executable":"%s","expectedPaths":"%s"},\n' "$gf_state" "$(severity "$gf_state")" "$gf_ver" "$gf_bin" "$gf_expected"
  printf '      {"name":"rtk","state":"%s","severity":"%s","version":"%s","executable":"%s","expectedPaths":"%s"}\n' "$rtk_state" "$(severity "$rtk_state")" "$rtk_ver" "$rtk_bin" "$rtk_expected"
  printf '    ]\n'
  printf '  },\n'
  printf '  "repoSignals": {"speckit":"%s","graphifyRepo":"%s","rtkRepo":"%s"}\n' "$sk" "$gf_repo" "$rtk_repo"
  printf '}\n'
  exit 0
fi

echo "REPO: $(basename "$R")"
echo "────────────────────────────────────────────────────────────────────"
printf '  %-9s %-7s  %s\n' "SpecKit" "[$sk]" "repo-embebido · .specify=$sk_specify · speckit.*=$sk_cmds · parity→kit=$sk_parity"
printf '  %-9s health:[%-34s] repo:[%-3s]  (graphify-out=%s · refs=%s)\n' \
       "graphify" "$(tool_label "$gf_state" "$gf_ver")" "$(rlabel x "$gf_repo" usa)" "$gf_out" "$gf_ref"
printf '  %-9s health:[%-34s] repo:[%-7s] (refs=%s)\n' \
       "RTK" "$(tool_label "$rtk_state" "$rtk_ver")" "$(rlabel x "$rtk_repo" declara)" "$rtk_ref"
echo "────────────────────────────────────────────────────────────────────"
if [ "$overall" != OK ]; then
  echo "  $overall external developer tools — NON-BLOCKING for product correctness, but NOT quiet."
fi
if [ "$gf_state" = shell-mismatch ]; then
  echo "  ⚠ graphify: '$gf_bin' existe, pero 'graphify' no resuelve en este shell."
  echo "    Fix: agregá el directorio al PATH de este shell o abrí PowerShell/Codex nuevo."
  echo "    Stale shell: PATH se congela al abrir la sesión."
  [ -n "$gf_expected" ] && echo "    Expected path(s): $gf_expected"
elif [ "$gf_state" = installed-not-in-path ]; then
  echo "  ✗ graphify: paquete instalado (${gf_ver:-?}) pero CLI no está en PATH."
  [ -n "$gf_expected" ] && echo "    Expected path(s): $gf_expected"
elif [ "$gf_state" = missing ]; then
  echo "  ✗ graphify: herramienta faltante. Fix: bash setup/install-external-tools.sh o pwsh setup/install-external-tools.ps1"
  [ -n "$gf_expected" ] && echo "    Expected path(s): $gf_expected"
fi
if [ "$rtk_state" = shell-mismatch ]; then
  echo "  ⚠ RTK: '$rtk_bin' existe, pero 'rtk' no resuelve en este shell."
  echo "    Fix: agregá el directorio al PATH de este shell o abrí PowerShell/Codex nuevo."
  echo "    Stale shell: PATH se congela al abrir la sesión."
  [ -n "$rtk_expected" ] && echo "    Expected path(s): $rtk_expected"
elif [ "$rtk_state" = installed-not-in-path ]; then
  echo "  ✗ RTK: binario instalado pero CLI no está en PATH."
  [ -n "$rtk_bin" ] && echo "    Found: $rtk_bin"
  [ -n "$rtk_expected" ] && echo "    Expected path(s): $rtk_expected"
elif [ "$rtk_state" = missing ]; then
  echo "  ✗ RTK: herramienta faltante. Fix: bash setup/install-external-tools.sh o pwsh setup/install-external-tools.ps1"
  [ -n "$rtk_expected" ] && echo "    Expected path(s): $rtk_expected"
fi
