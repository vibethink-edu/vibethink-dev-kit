# REFERENCE — Vertical Deployment Topology (runtime complement to CANON-VERTICAL-BOUNDARY-001)

**Fecha:** 2026-06-13 · **Estado:** PROPUESTO (para sello de Marcelo) · **Tipo:** referencia neutral

> **Relación con el canon:** `CANON-VERTICAL-BOUNDARY-001` define la frontera de
> **datos/dominio** (cuándo un negocio es tenant vs vertical; la plataforma posee
> auth/SSO/infra). Este doc define la **topología de runtime/deployment** que
> materializa esa frontera: cómo se despliega y se navega un vertical respecto al
> núcleo. Neutral — sin nombres de tenant/producto.

## Patrón
Un vertical se despliega como **su propio servicio**, en **su propio subdominio**,
detrás de la **identidad central** de la plataforma:

```
                accounts/IdP central  (auth compartida = un solo login)
                        │  cookie en el dominio padre  (.empresa.tld)
        ┌───────────────┼────────────────┐
        ▼               ▼                 ▼
  núcleo.empresa.tld  vertical-a.empresa.tld  vertical-b.empresa.tld
   (plano relacional)   (operación propia)      (operación propia)
        servicio          servicio                servicio
        independiente     independiente           independiente
```

## Reglas
1. **Un vertical = un servicio independiente** (deploy/escala/rollback propios). No se
   embebe como módulo del núcleo (consistente con anti-contaminación del core).
2. **Subdominio, no path** (`vertical.empresa.tld`, no `app.empresa.tld/vertical`):
   - Mapea 1:1 con el servicio; evita un balanceador con URL-maps solo para rutear.
   - La app se sirve en `/` (sin `basePath` ni gimnasia de assets).
3. **Identidad central + SSO por cookie de dominio padre.** Mismo IdP para todos los
   verticales; la cookie de sesión se setea en `.empresa.tld` → la sesión vale en todos
   los subdominios sin re-login. (El núcleo posee auth/SSO — `CANON-VERTICAL-BOUNDARY-001` §Platform-first.)
4. **Integración por señales + API de lectura**, no por base de datos compartida ad-hoc:
   el vertical es la fuente de su dominio; el núcleo muestra vía señal. Tenant/IdP
   compartidos; schema de dominio del vertical es suyo.
5. **Scale-to-zero por servicio** → costo cero en inactividad; la infra puede existir
   antes de que el producto esté completo.

## Validación contra la industria
Este es el patrón estándar de **multi-producto SaaS con identidad central**, no una
invención: Google (`mail/drive/calendar.google.com` + `accounts.google.com`, cookie en
`.google.com`), Atlassian (`*.atlassian.net`), Microsoft (Outlook/Teams/OneDrive bajo
una cuenta). Lo replicamos a otra escala. Es **arquitectónicamente válido y conocido**.

## Diferencias de escala (decisiones, no defectos)
| Dimensión | Big-tech a escala | Nuestra escala (sano) |
|---|---|---|
| Código compartido | Monorepo + import directo | Repos separados + copy-parity desde el dev-kit |
| Edge/routing | Global HTTPS LB + front-end propio | Domain-mappings del runtime (más simple) |
| Identidad | Servicio IdP dedicado y endurecido | IdP gestionado (mismo *rol*, impl. liviana) |

## Cuándo escalar "hacia big-tech" (no antes)
- **HTTPS Load Balancer + WAF** delante de los servicios cuando se quiera: rutas mixtas
  (subdominio *y* path), multi-región, o reglas de borde/seguridad.
- **IdP dedicado / endurecido** (MFA, roles finos) cuando la auth multi-producto sea crítica.

## Anti-patrones
- Embeber un vertical como path/módulo del núcleo "para ahorrar un subdominio" → acopla
  deploy y rompe la independencia del vertical.
- Cookie de sesión scoped a un solo host → mata el SSO entre subdominios.
- Compartir tablas de dominio entre verticales sin frontera → viola `CANON-VERTICAL-BOUNDARY-001`.

---

*Sellar e integrar como sección "Deployment topology" de `CANON-VERTICAL-BOUNDARY-001`,
o mantener como REFERENCE enlazada — a criterio de Marcelo.*
