# 🤝 Contributing to VibeThink Dev Kit

Thank you for considering contributing to the VibeThink Dev Kit! This kit evolves with real-world experience from multiple projects.

---

## 🎯 Philosophy

This kit is built on **real experience** from actual projects, not theory:
- **27 sources analyzed** (16 projects + 6 experts + 4 own projects + 1 internal)
- **Conflict rules** come from real incompatibilities we've encountered
- **Best practices** are battle-tested in production

---

## 🚀 Ways to Contribute

### 1. **Report Real Conflicts You've Encountered**

If you've discovered a dependency conflict or incompatibility:

```markdown
**Conflict**: Package A + Package B
**Severity**: Error/Warning
**Reason**: Why they're incompatible
**Solution**: What to use instead
**Project**: Where you encountered this
```

Open an issue with this template.

---

### 2. **Share Useful Scripts**

Have a script that validates, checks, or automates something useful?

1. Add it to `scripts/` or `tools/`
2. Follow naming convention: `verb-noun.ps1` (e.g., `check-dependencies.ps1`)
3. Include header comment with purpose and version
4. Submit PR

---

### 3. **Improve Documentation**

- Fix typos or unclear explanations
- Add examples from your real projects
- Update compatibility matrices with new versions

---

### 4. **Suggest New Features**

Before suggesting a feature, check:
- [ ] Is it based on a real need from a real project?
- [ ] Does it fit the philosophy (prevent conflicts, detect stack, harvest knowledge)?
- [ ] Is it not already covered by existing tools?

Open an issue with:
- **Use case**: Real scenario where you needed this
- **Current workaround**: How you solve it now
- **Proposed solution**: How the kit could help

---

## 📋 Contribution Process

### For Bug Fixes or Small Changes:
1. Fork the repository
2. Create a branch: `fix/description` or `docs/description`
3. Make your changes
4. Test with `vibe-doctor.ps1`
5. Submit PR with clear description

### For New Features or Large Changes:
1. Open an issue first to discuss
2. Wait for approval/feedback
3. Follow the process above

---

## ✅ Code Standards

### PowerShell Scripts:
```powershell
# ============================================================================
# SCRIPT NAME - VERSION
# ============================================================================
# Purpose: What this script does
# Inspired by: Source if applicable
# ============================================================================

param(
    [switch]$Flag = $false
)

# Clear variable names
# Comments for complex logic
# Error handling with try/catch
```

### Documentation:
- Use clear headers (H1, H2, H3)
- Include examples with real scenarios
- Add references to related docs
- Keep it concise but complete

### JSON Files:
- Follow existing structure in `rules/conflicts.json`
- Include version, lastUpdated, description
- Add references to documentation

---

## 🔍 Testing Your Changes

Before submitting:

```powershell
# 1. Run vibe-doctor on a test project
.\scripts\vibe-doctor.ps1

# 2. Run setup-project on a new project
.\scripts\setup-project.ps1

# 3. Verify docs render correctly (markdown preview)

# 4. Check for typos and broken links
```

---

## 📚 Documentation to Update

When adding features, update:
- [ ] README.md (if user-facing)
- [ ] ROADMAP.md (if it's a planned feature)
- [ ] Relevant compatibility docs
- [ ] KNOWLEDGE_INHERITANCE.md (if inspired by external source)

---

## 🎓 Learning from External Sources

If you find a useful concept from another project:

1. Document it in `KNOWLEDGE_INHERITANCE.md`:
   - Project name and URL
   - What we learned
   - What we implemented vs documented
   - Version analyzed and next review date

2. Give proper credit in code/docs

3. Follow their license requirements

---

## ❌ What We Don't Accept

- **Theoretical features** without real-world use cases
- **Over-engineering** (we keep it simple)
- **Vendor lock-in** (prefer OSS alternatives)
- **Breaking changes** without migration path
- **Undocumented code**

---

## 🙏 Recognition

Contributors will be:
- Listed in ACKNOWLEDGMENTS section
- Credited in commit messages
- Mentioned in release notes (for significant contributions)

---

## 📞 Questions?

- Open an issue for questions
- Check existing issues first
- Be respectful and constructive

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make the VibeThink Dev Kit better!** 🚀
