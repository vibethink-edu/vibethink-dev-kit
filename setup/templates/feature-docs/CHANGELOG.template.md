<!--
  CHANGELOG skeleton — instance of CANON-DEVELOPMENT-PROCESS §5 (per-unit changelog).
  Role: WHAT changed, per unit (package / app / feature), tied to versioning.
  This is where documentation and versioning meet: each entry maps to a version bump
  per CANON-VERSIONING-001 §3 (Conventional Commits → SemVer/CalVer). It LINKS the
  versioning rules; it does not restate them.
  Touch a unit → add an entry in the SAME change. Copy, rename, delete these comments.
-->
# Changelog — <package / app / unit name>

> Versioning model: <SemVer 2.0 | CalVer YYYY.MM.DD+sha | …> per `CANON-VERSIONING-001`
> (declared in this repo's `.versioning.yaml`). Newest version on top.
> Bump mapping (canon §3): `feat:` → MINOR · `fix:` → PATCH · `feat!:`/`BREAKING CHANGE:` → MAJOR.

## [<version>] — <YYYY-MM-DD>

### Added
- <new functionality (`feat:`)>

### Changed
- <behavior change>

### Fixed
- <bug fix (`fix:`)>

### BREAKING
- <breaking change — REQUIRES `!` / `BREAKING CHANGE:` in the commit (canon §9); never silent>

### Deprecated / Removed
- <with a one-line reason>

---

## [<previous version>] — <YYYY-MM-DD>

- <…>
