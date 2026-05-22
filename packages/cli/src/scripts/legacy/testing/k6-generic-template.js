import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "1m", target: 10 }, // 10 usuarios durante 1 minuto
    { duration: "3m", target: 50 }, // sube a 50 usuarios
    { duration: "1m", target: 0 }, // baja a 0
  ],
};

const BASE_URL = __ENV.BASE_URL || "https://api.tu-proyecto.com";
const ENDPOINT = "/api/health"; // Cambia por el endpoint a testear

export default function () {
  const res = http.get(`${BASE_URL}${ENDPOINT}`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);
}

/**
 * Script genérico de k6 para pruebas de carga.
 * - Modifica BASE_URL y ENDPOINT según tu API.
 * - Ajusta stages para simular diferentes escenarios de usuarios concurrentes.
 * - Ejecuta con: k6 run k6-generic-template.js --env BASE_URL=https://api.tu-proyecto.com
 */
