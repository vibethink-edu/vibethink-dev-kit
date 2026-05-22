# NEXT STEPS CHECKLIST

**Fecha:** {{FECHA_ACTUAL}}
**Responsable:** VITA (IA)

---

## 🔒 Seguridad y Organización
- [ ] Revisar advertencias de archivos/carpetas fuera de estándar en el root (ver `INFORME_AUTOMATICO.md`).
- [ ] Decidir si se reubican, exceptúan o documentan excepciones en `ROOT_CLEANLINESS_POLICY.md`.

## 🧩 Dependencias y Vulnerabilidades
- [ ] Revisar reporte de dependencias desactualizadas (`npm outdated`).
- [ ] Planificar actualización controlada de dependencias críticas.
- [ ] Revisar reporte de vulnerabilidades (`dev-tools/validation/npm-audit-report.json`).

## 🧪 Pruebas y Calidad de Código
- [ ] Instalar dependencias de testing faltantes:
  ```bash
  npm install --save-dev @testing-library/jest-dom
  ```
- [ ] Reintentar ejecución de pruebas con Vitest:
  ```bash
  npx vitest run --coverage
  ```
- [ ] Ajustar configuración de linting para Next.js si es necesario.

## 📄 Documentación y Reportes
- [ ] Revisar reportes generados en `docs/reports/quality/` y `dev-tools/validation/`.
- [ ] Actualizar documentación si se realizan cambios estructurales.

## 🏗️ Sugerencias adicionales
- [ ] Validar que los scripts de validación sigan funcionando tras cualquier cambio.
- [ ] Mantener este checklist actualizado tras cada ciclo de trabajo.

---

**Nota:**
- Todas las acciones aquí listadas son seguras y no destructivas.
- No ejecutar acciones de borrado o migración masiva sin revisión manual.

---

**Fin del checklist.** 