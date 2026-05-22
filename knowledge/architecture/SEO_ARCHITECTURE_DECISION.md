# Decisión de Arquitectura: Vite vs Next.js para SEO/AEO 🧠

**Contexto:**
El usuario desea priorizar **SEO** (Search Engine Optimization) y **AEO** (Answer Engine Optimization - Optimización para IAs como ChatGPT, Perplexity, Gemini).

---

## 🥊 Comparativa Técnica

| Característica | Opción A: Vite (SPA) + React Helmet | Opción B: Next.js (SSR) + Payload 3.0 |
| :--- | :--- | :--- |
| **Renderizado** | **Client-Side:** El navegador recibe un HTML vacío y JS lo llena. | **Server-Side:** El HTML sale completo del servidor. |
| **SEO Tradicional** | **Regular:** Googlebot renderiza JS, pero es lento y propenso a errores. | **Excelente:** HTML puro indexable instantáneamente. |
| **AEO (IA Agents)** | **Malo:** Muchos scrapers de IA no ejecutan JS complejo. Ven "pantalla en blanco". | **Superior:** Los LLMs leen el HTML estructurado y metadatos JSON-LD directamente. |
| **Payload Integration**| **Desacoplado:** Backend Express separado del Frontend. | **Nativo:** Payload 3.0 vive DENTRO de Next.js. (Monorrepo real). |
| **Performance** | Carga inicial lenta (descarga JS), navegación rápida. | Carga inicial instantánea (HTML), navegación híbrida. |

---

## 🤖 ¿Qué es el AEO (Answer Engine Optimization)?

Para que una IA como Gemini o Perplexity recomiende tu portal, necesita **leerlo** rápido y entender la estructura.

*   **Vite:** Envía `<div id="root"></div>`. La IA tiene que "esperar" a que cargue React.
*   **Next.js:** Envía `<h1>Ovi Portal</h1><p>Descripción...</p>`. La IA lee el contenido bruto inmediatamente.

## 🎯 Veredicto: El Cambio es Necesario

Si el objetivo es **posicionar el contenido ante IAs y Buscadores**:

### **❌ Vite NO es la mejor opción.**
Aunque `react-helmet-async` ayuda, sigue siendo una SPA. Es luchar contra la corriente para AEO.

### **✅ Next.js es la Arquitectura Ganadora.**
1.  **Payload 3.0** está diseñado para Next.js App Router.
2.  **Server Components** envían cero JS al cliente para contenido estático (super rápido).
3.  **Metadatos Dinámicos** se generan en el servidor antes de que llegue el crawler.

## 🛣️ Ruta de Migración Recomendada (Ovi-Portal)

No es necesario tirar todo. La lógica de componentes (`src/components/*`) es reutilizable.
Pero la "cáscara" debería cambiar de **Vite** a **Next.js**.

1.  **Mantener:** Componentes UI, Lógica de negocio, Hooks.
2.  **Cambiar:** Routing (`react-router` -> `next/navigation`), Entrypoint (`main.tsx` -> `layout.tsx`).
