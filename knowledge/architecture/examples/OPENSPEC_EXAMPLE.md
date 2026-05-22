# 🚀 OVI Platform v1.0 - Especificación Técnica Consolidada

**Versión:** 1.0.0
**Fecha:** 2025-12-15
**Estado:** Definición Final para Implementación

---

## A. Resumen Ejecutivo

**OVI Platform v1.0** es la evolución de la plataforma "Ovitality" hacia una arquitectura **Headless CMS escalable**, diseñada para soportar contenido dinámico, multi-idioma (ES/EN) y consumo intensivo por parte de Agentes de IA (AEO).

**Arquitectura:**
El sistema abandona la SPA monolítica (Vite/React) en favor de una arquitectura desacoplada:
1.  **Backend:** **Payload CMS 3.0** (Node.js/Express) sobre **PostgreSQL**, actuando como fuente única de verdad para profesionales, eventos, y contenido.
2.  **Frontend:** **Astro 5** (Islands Architecture) para el sitio público, garantizando puntuaciones Lighthouse de 100/100 y SEO técnico perfecto. Componentes interactivos complejos se mantienen en React 19.
3.  **Infraestructura:** Monorepo gestionado con Turborepo, desplegado en contenedores Docker (Backend) y Vercel (Frontend).

**Estado Actual:**
Se ha completado la definición arquitectónica y los protocolos de seguridad. El siguiente paso crítico es el **Bootstrap del Monorepo** y la implementación del esquema dedatos en Payload CMS, seguido de la migración de datos desde los archivos JSON/TS legacy.

---

## B. Especificación Técnica OpenSpec (v1.0.0)

Esta especificación define el contrato estricto de la API. Todos los desarrollos de frontend y scripts de IA deben adherirse a esta estructura.

```yaml
openapi: 3.1.0
info:
  title: OVI Platform - Payload CMS API
  version: 1.0.0
  description: |
    API Headless para OVI Platform. Fuente de verdad para Astro Frontend y Agentes IA.
    Soporta localization 'es'/'en' vía query param `?locale=`.
  contact:
    name: OVI Platform Team
    email: dev@ovitality.org

servers:
  - url: https://cms.ovitality.org/api
    description: Production
  - url: http://localhost:3000/api
    description: Local Development

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    # --- CORE COLLECTIONS ---

    Professional:
      type: object
      description: Perfil médico, clínica o terapeuta.
      properties:
        id: { type: string, format: uuid }
        name: { type: string, example: "Dr. Juan Pérez" }
        slug: { type: string, example: "dr-juan-perez" }
        type: 
          type: string
          enum: [professional, clinic, therapy]
        category: { $ref: '#/components/schemas/Category' }
        specialties: 
          type: array
          items: { $ref: '#/components/schemas/Specialty' }
        description: { $ref: '#/components/schemas/LocalizedRichText' }
        location:
          type: object
          properties:
            city: { type: string }
            country: { type: string }
            address: { type: string }
            coordinates: { type: array, items: { type: number } }
        contact:
          type: object
          properties:
            email: { type: string }
            phone: { type: string }
            whatsapp: { type: string }
            bookingsUrl: { type: string }
        verified: { type: boolean }
        rating: { type: number }

    Event:
      type: object
      description: Eventos de calendario (virtuales/presenciales).
      properties:
        id: { type: string, format: uuid }
        title: { $ref: '#/components/schemas/LocalizedString' }
        slug: { type: string }
        description: { $ref: '#/components/schemas/LocalizedRichText' }
        startDate: { type: string, format: date-time }
        endDate: { type: string, format: date-time }
        modality: { type: string, enum: [virtual, in-person, hybrid] }
        isRecurring: { type: boolean }
        recurrenceRule: { type: string, example: "FREQ=WEEKLY;BYDAY=MO" }
        instructor: { type: string }
        virtualLink: { type: string }

    Page:
      type: object
      description: Páginas dinámicas construidas con bloques.
      properties:
        title: { $ref: '#/components/schemas/LocalizedString' }
        slug: { type: string }
        layout:
          type: array
          items: { $ref: '#/components/schemas/Block' }
        meta: { $ref: '#/components/schemas/SEO' }

    Post:
      type: object
      description: Artículos de blog y noticias.
      properties:
        title: { $ref: '#/components/schemas/LocalizedString' }
        slug: { type: string }
        content: { $ref: '#/components/schemas/LocalizedRichText' }
        author: { $ref: '#/components/schemas/User' }
        publishedDate: { type: string, format: date-time }
        tags: { type: array, items: { $ref: '#/components/schemas/Tag' } }

    # --- SHARED TYPES ---

    LocalizedString:
      type: object
      properties:
        es: { type: string }
        en: { type: string }

    LocalizedRichText:
      type: object
      properties:
        es: { type: object } # Lexical/Slate JSON
        en: { type: object }

    Block:
      type: object
      discriminator: { propertyName: blockType }
      properties:
        blockType: { type: string, enum: [hero, content, cta, gallery, grid] }
        # Propiedades específicas de cada bloque irían aquí

    Media:
      type: object
      properties:
        url: { type: string }
        alt: { $ref: '#/components/schemas/LocalizedString' }
        mimeType: { type: string }
        sizes:
          type: object
          properties:
            thumbnail: { type: string }
            card: { type: string }

    SEO:
      type: object
      properties:
        title: { $ref: '#/components/schemas/LocalizedString' }
        description: { $ref: '#/components/schemas/LocalizedString' }
        image: { $ref: '#/components/schemas/Media' }

paths:
  /api/professionals:
    get:
      summary: Listar profesionales
      parameters:
        - { $ref: '#/components/parameters/locale' }
        - { $ref: '#/components/parameters/where' }
        - { $ref: '#/components/parameters/limit' }
        - { $ref: '#/components/parameters/page' }
      responses:
        200:
          description: Lista paginada
          content:
            application/json:
              schema:
                type: object
                properties:
                  docs: { type: array, items: { $ref: '#/components/schemas/Professional' } }
                  totalDocs: { type: integer }
                  totalPages: { type: integer }

  /api/professionals/{id}:
    get:
      summary: Obtener profesional por ID
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
        - { $ref: '#/components/parameters/locale' }
      responses:
        200:
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Professional' }

  /api/events:
    get:
      summary: Listar eventos
      parameters:
        - { $ref: '#/components/parameters/locale' }
        - { $ref: '#/components/parameters/where' }
      responses:
        200:
          description: Lista de eventos
          content:
             application/json:
               schema:
                 type: object
                 properties:
                   docs: { type: array, items: { $ref: '#/components/schemas/Event' } }

  /api/pages:
    get:
      summary: Listar páginas
      responses:
        200:
          content:
            application/json:
              schema:
                properties:
                  docs: { type: array, items: { $ref: '#/components/schemas/Page' } }

components:
  parameters:
    locale:
      name: locale
      in: query
      schema: { type: string, enum: [es, en], default: es }
    where:
      name: where
      in: query
      schema: { type: string }
    limit:
      name: limit
      in: query
      schema: { type: integer }
    page:
      name: page
      in: query
      schema: { type: integer }
```
