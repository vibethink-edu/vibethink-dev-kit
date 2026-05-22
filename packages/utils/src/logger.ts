/**
 * Logger estructurado centralizado para el monorepo.
 * Cumple con VThink 1.0 y CMMI-ML3.
 *
 * @example
 *   import { logger } from '@/shared/utils/logger';
 *   logger.info({ userId }, 'Usuario autenticado');
 *   logger.error({ error }, 'Error al guardar datos');
 *
 * @remarks
 *   - En desarrollo, los logs se muestran en consola.
 *   - En producción, se recomienda integrar con un sistema externo (Sentry, Datadog, etc.).
 *   - No usar console.log directamente en el código fuente.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogOptions {
  [key: string]: unknown;
}

export const logger = {
  info: (meta: LogOptions, message: string) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, meta);
    }
    // TODO: Integrar con sistema externo en producción
  },
  warn: (meta: LogOptions, message: string) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta);
    // TODO: Integrar con sistema externo en producción
  },
  error: (meta: LogOptions, message: string) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta);
    // TODO: Integrar con sistema externo en producción
  },
  debug: (meta: LogOptions, message: string) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },
};
