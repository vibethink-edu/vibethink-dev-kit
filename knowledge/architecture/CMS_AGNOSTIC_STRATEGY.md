# ⚖️ Estrategia Aganóstica de CMS (The CMS-Agnostic Dilemma)

**Pregunta del Millón:** ¿Debemos abstraer el CMS para poder cambiar entre Payload, Strapi y Contentful?

**Veredicto del Arquitecto:**
*   **En el Backend (Definición de Esquemas):** ⛔ **NO.** Es una trampa de complejidad.
*   **En el Frontend (Consumo de Datos):** ✅ **SÍ.** Es obligatorio para una buena ingeniería.

---

## 1. La Trampa de la "Abstracción Total" (Backend)
Intentar crear un archivo de configuración único que "compile" a Payload, Strapi y Contentful es **anti-patrón** en esta escala.
*   **Payload** es Code-First (TypeScript).
*   **Strapi** es Schema-First (JSON).
*   **Contentful** es API-First (ClickOps).
*   **Riesgo:** Gastarás 6 meses construyendo un "Meta-CMS" y 1 mes construyendo el sitio.

## 2. La Solución Real: "Frontend Adapter Pattern"

El secreto no es que el CMS sea igual, sino que **a tus Componentes de UI no les importe quién es el CMS.**

### Arquitectura Incorrecta (Acoplada):
```tsx
// ❌ Mal: El componente sabe que usa Payload (lexical, docs, etc)
function Hero({ block }) {
  return <h1>{block.content.root.children[0].text}</h1>
}
```

### Arquitectura Correcta (Agnóstica):

**Capa 1: UI "Tonta" (Design System)**
```tsx
// ✅ Bien: Solo entiende de strings y urls. Pura UI.
interface HeroProps { title: string; image: string }
export function Hero({ title, image }: HeroProps) { ... }
```

**Capa 2: El Adaptador (Transformation Layer)**
Aquí es donde ocurre la magia. Creas un adaptador por cada CMS.

```typescript
// lib/adapters/payload-adapter.ts
export function toHeroProps(payloadBlock: PayloadBlock): HeroProps {
  return {
    title: payloadBlock.title,
    image: payloadBlock.image.url
  }
}

// lib/adapters/strapi-adapter.ts
export function toHeroProps(strapiBlock: StrapiBlock): HeroProps {
  return {
    title: strapiBlock.attributes.Headline,
    image: strapiBlock.attributes.Cover.data.attributes.url
  }
}
```

**Capa 3: La Página (Controller)**
```tsx
// pages/[slug].astro
const data = await fetchPageFromCMS(slug); // Payload o Strapi
const heroProps = currentAdapter.toHeroProps(data.hero);
return <Hero {...heroProps} />
```

## 3. Conclusión Estratégica

1.  **Vendor Lock-in Intencional en Backend:** Cásate con **Payload** por ahora. Es superior técnicamente (Next.js native). No diluyas esfuerzos soportando Strapi "por si acaso".
2.  **Desacoplamiento en Frontend:** Diseña tus componentes de UI (`@agency/ui-core`) esperando `props` simples, NUNCA objetos crudos del CMS.
3.  **Migración:** Si el día de mañana Payload desaparece, solo reescribes la caerta `lib/adapters`, pero tu Design System queda intacto.
