#!/bin/bash
# VibeThink Context Mounter (Linux/Mac Version)

set -e

# 1. Locate Dev-Kit (Assuming script is in tools/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVKIT_PATH="$(dirname "$SCRIPT_DIR")"
CURRENT_DIR="$(pwd)"
TARGET_LINK="$CURRENT_DIR/.vibethink-core"

echo " "
echo "🔗 VibeThink Context Mounter"
echo "   Source: $DEVKIT_PATH"
echo "   Target: $CURRENT_DIR"

# 2. Create Symlink
if [ -L "$TARGET_LINK" ]; then
    echo "⚠️  Link '.vibethink-core' already exists."
elif [ -d "$TARGET_LINK" ]; then
    echo "❌ Error: '.vibethink-core' exists and is a real directory (not a link)."
    exit 1
else
    ln -s "$DEVKIT_PATH" "$TARGET_LINK"
    echo "✅ Symlink created: .vibethink-core -> Dev-Kit"
fi

# 3. Update .gitignore
GITIGNORE="$CURRENT_DIR/.gitignore"
RULE=".vibethink-core"

if [ ! -f "$GITIGNORE" ]; then
    echo "# VibeThink Context Link" > "$GITIGNORE"
    echo "$RULE" >> "$GITIGNORE"
    echo "✅ Created .gitignore with rule"
else
    if grep -Fxq "$RULE" "$GITIGNORE"; then
        echo "ℹ️  .gitignore already contains rule"
    else
        echo "" >> "$GITIGNORE"
        echo "# VibeThink Context Link" >> "$GITIGNORE"
        echo "$RULE" >> "$GITIGNORE"
        echo "✅ Added rule to .gitignore"
    fi
fi

echo "🚀 Ready!"
