# 🔄 Control de Versiones y Configuración

---

## Estrategia de Branching

### Git Flow Adaptado
```
main (producción)
├── develop (integración)
├── feature/feature-name (desarrollo)
├── hotfix/hotfix-name (correcciones urgentes)
└── release/release-name (preparación release)
```

### Políticas de Branching

#### Feature Branches
- **Nomenclatura:** `feature/descripción-breve`
- **Origen:** `develop`
- **Destino:** `develop`
- **Lifetime:** Máximo 2 semanas
- **Requisitos:** Tests pasando, code review aprobado

#### Hotfix Branches
- **Nomenclatura:** `hotfix/descripción-breve`
- **Origen:** `main`
- **Destino:** `main` y `develop`
- **Lifetime:** Máximo 24 horas
- **Requisitos:** Tests críticos pasando, aprobación urgente

#### Release Branches
- **Nomenclatura:** `release/v1.2.3`
- **Origen:** `develop`
- **Destino:** `main` y `develop`
- **Lifetime:** 1-2 semanas
- **Requisitos:** QA completo, documentación actualizada

---

## Estrategia de Versionado

### Semantic Versioning (SemVer)
```
MAJOR.MINOR.PATCH
```

- **MAJOR:** Cambios incompatibles con versiones anteriores
- **MINOR:** Nuevas funcionalidades compatibles
- **PATCH:** Correcciones de bugs compatibles

### Ejemplos de Versionado
- `1.0.0` - Primera versión estable
- `1.1.0` - Nueva funcionalidad
- `1.1.1` - Corrección de bug
- `2.0.0` - Cambio mayor (breaking changes)

---

## Procedimientos de Release

### Pre-Release Checklist
- [ ] Todos los tests pasando
- [ ] Code review completado
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Version bump realizado
- [ ] Release notes preparados

### Release Process
1. **Crear release branch:** `git checkout -b release/v1.2.3`
2. **Actualizar versiones:** Package.json, changelog
3. **QA final:** Testing completo
4. **Merge a main:** `git checkout main && git merge release/v1.2.3`
5. **Tag release:** `git tag -a v1.2.3 -m "Release v1.2.3"`
6. **Deploy:** Despliegue automático
7. **Merge a develop:** `git checkout develop && git merge release/v1.2.3`
8. **Cleanup:** Eliminar release branch

---

## Procedimientos de Rollback

### Rollback Automático
```yaml
# .github/workflows/rollback.yml
name: Auto Rollback
on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]

jobs:
  rollback:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to previous version
        run: |
          # Script de rollback
```

### Rollback Manual
1. **Identificar versión estable:** Última versión conocida
2. **Crear hotfix:** `git checkout -b hotfix/rollback-v1.2.2`
3. **Revertir cambios:** `git revert <commit-hash>`
4. **Testing:** Validar funcionalidad
5. **Deploy:** Despliegue de rollback
6. **Comunicación:** Notificar stakeholders

---

## Trazabilidad de Cambios

### Commit Messages
```
type(scope): description

[optional body]

[optional footer]
```

#### Tipos de Commit
- **feat:** Nueva funcionalidad
- **fix:** Corrección de bug
- **docs:** Documentación
- **style:** Formato, punto y coma, etc.
- **refactor:** Refactorización
- **test:** Tests
- **chore:** Mantenimiento

#### Ejemplos
```
feat(auth): add OAuth2 support for Google

fix(api): resolve user creation race condition

docs(readme): update installation instructions

refactor(components): extract reusable button component
```

### Changelog
```markdown
# Changelog

## [1.2.3] - 2024-06-24
### Added
- OAuth2 support for Google
- User profile management

### Changed
- Improved error handling
- Updated UI components

### Fixed
- User creation race condition
- Memory leak in dashboard

### Removed
- Deprecated API endpoints
```

---

## Configuración de Entornos

### Variables de Entorno
```bash
# Development
NODE_ENV=development
DATABASE_URL=postgresql://localhost/dev_db
API_KEY=dev_key

# Staging
NODE_ENV=staging
DATABASE_URL=postgresql://staging/db
API_KEY=staging_key

# Production
NODE_ENV=production
DATABASE_URL=postgresql://prod/db
API_KEY=prod_key
```

### Configuración por Entorno
```typescript
interface Config {
  database: {
    url: string;
    pool: number;
  };
  api: {
    key: string;
    rateLimit: number;
  };
  monitoring: {
    enabled: boolean;
    level: string;
  };
}
``` 