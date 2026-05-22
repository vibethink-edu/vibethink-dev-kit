/**
 * Performance Load Tests with k6
 *
 * Load testing scenarios for VibeThink Orchestrator including:
 * - Authentication performance
 * - Dashboard loading performance
 * - API endpoint performance
 * - Multi-tenant performance
 * - Concurrent user scenarios
 *
 * @author AI Pair Platform - Testing Team
 * @version 1.0.0
 */

import { check, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const authDuration = new Trend("auth_duration");
const dashboardLoadDuration = new Trend("dashboard_load_duration");
const apiResponseDuration = new Trend("api_response_duration");

// Test configuration
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.1"], // Error rate should be below 10%
    auth_duration: ["p(95)<1000"], // Authentication should be below 1s
    dashboard_load_duration: ["p(95)<3000"], // Dashboard should load below 3s
    api_response_duration: ["p(95)<500"], // API responses should be below 500ms
  },
};

// Test data
const testUsers = [
  { email: "admin@testcompany.com", password: "12345", role: "ADMIN" },
  { email: "employee@testcompany.com", password: "12345", role: "EMPLOYEE" },
  { email: "owner@testcompany.com", password: "12345", role: "OWNER" },
];

const testCompanies = ["test-company-a", "test-company-b"];

// Helper functions
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getRandomCompany() {
  return testCompanies[Math.floor(Math.random() * testCompanies.length)];
}

function generateAuthToken(email, password) {
  const startTime = Date.now();

  const loginResponse = http.post(`${__ENV.BASE_URL || "http://localhost:5173"}/api/auth/login`, {
    email: email,
    password: password,
  });

  const duration = Date.now() - startTime;
  authDuration.add(duration);

  check(loginResponse, {
    "auth successful": (r) => r.status === 200,
    "auth response time < 1s": (r) => r.timings.duration < 1000,
  });

  if (loginResponse.status !== 200) {
    errorRate.add(1);
    return null;
  }

  const responseBody = JSON.parse(loginResponse.body);
  return responseBody.access_token;
}

// Main test scenarios
export default function () {
  const user = getRandomUser();
  const company = getRandomCompany();

  // Scenario 1: Authentication Performance
  const token = generateAuthToken(user.email, user.password);

  if (!token) {
    console.error("Authentication failed for user:", user.email);
    return;
  }

  // Set auth headers for subsequent requests
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Scenario 2: Dashboard Loading Performance
  const dashboardStartTime = Date.now();

  const dashboardResponse = http.get(`${__ENV.BASE_URL || "http://localhost:5173"}/dashboard`, {
    headers: headers,
  });

  const dashboardDuration = Date.now() - dashboardStartTime;
  dashboardLoadDuration.add(dashboardDuration);

  check(dashboardResponse, {
    "dashboard loads successfully": (r) => r.status === 200,
    "dashboard load time < 3s": (r) => r.timings.duration < 3000,
    "dashboard contains user data": (r) => r.body.includes("welcome"),
  });

  if (dashboardResponse.status !== 200) {
    errorRate.add(1);
  }

  // Scenario 3: API Endpoint Performance
  const apiEndpoints = ["/api/companies", "/api/users", "/api/configurations", "/api/usage"];

  apiEndpoints.forEach((endpoint) => {
    const apiStartTime = Date.now();

    const apiResponse = http.get(`${__ENV.BASE_URL || "http://localhost:5173"}${endpoint}`, {
      headers: headers,
    });

    const apiDuration = Date.now() - apiStartTime;
    apiResponseDuration.add(apiDuration);

    check(apiResponse, {
      [`${endpoint} responds successfully`]: (r) => r.status === 200,
      [`${endpoint} response time < 500ms`]: (r) => r.timings.duration < 500,
      [`${endpoint} returns JSON`]: (r) => r.headers["Content-Type"].includes("application/json"),
    });

    if (apiResponse.status !== 200) {
      errorRate.add(1);
    }
  });

  // Scenario 4: Multi-tenant Data Access Performance
  const companyDataResponse = http.get(
    `${__ENV.BASE_URL || "http://localhost:5173"}/api/companies/${company}/data`,
    { headers: headers }
  );

  check(companyDataResponse, {
    "company data access successful": (r) => r.status === 200,
    "company data access time < 1s": (r) => r.timings.duration < 1000,
    "company data isolated": (r) => {
      const data = JSON.parse(r.body);
      return data.company_id === company;
    },
  });

  if (companyDataResponse.status !== 200) {
    errorRate.add(1);
  }

  // Scenario 5: Configuration Management Performance
  const configResponse = http.get(
    `${__ENV.BASE_URL || "http://localhost:5173"}/api/configurations`,
    { headers: headers }
  );

  check(configResponse, {
    "configurations load successfully": (r) => r.status === 200,
    "configurations response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Scenario 6: Usage Tracking Performance
  const usageData = {
    service_name: "openai",
    usage_type: "ai_generation",
    amount: Math.floor(Math.random() * 100) + 1,
    cost_usd: (Math.random() * 0.01).toFixed(4),
  };

  const usageResponse = http.post(
    `${__ENV.BASE_URL || "http://localhost:5173"}/api/usage/track`,
    JSON.stringify(usageData),
    { headers: headers }
  );

  check(usageResponse, {
    "usage tracking successful": (r) => r.status === 200,
    "usage tracking response time < 300ms": (r) => r.timings.duration < 300,
  });

  // Think time between requests
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Setup function for test initialization
export function setup() {
  console.log("🚀 Starting performance load tests...");
  console.log(`Base URL: ${__ENV.BASE_URL || "http://localhost:5173"}`);
  console.log(
    `Test duration: ${options.stages.reduce((total, stage) => total + stage.duration, 0)} minutes`
  );

  // Verify test environment is ready
  const healthCheck = http.get(`${__ENV.BASE_URL || "http://localhost:5173"}/health`);

  if (healthCheck.status !== 200) {
    throw new Error("Test environment is not ready. Health check failed.");
  }

  console.log("✅ Test environment is ready");
  return { baseUrl: __ENV.BASE_URL || "http://localhost:5173" };
}

// Teardown function for cleanup
export function teardown(data) {
  console.log("🧹 Cleaning up performance test data...");

  // Cleanup any test data created during performance tests
  const cleanupResponse = http.post(
    `${data.baseUrl}/api/test/cleanup`,
    {},
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (cleanupResponse.status === 200) {
    console.log("✅ Performance test cleanup completed");
  } else {
    console.warn("⚠️ Performance test cleanup failed");
  }
}

// Handle test results
export function handleSummary(data) {
  console.log("📊 Performance test results:");
  console.log(`Total requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Average response time: ${data.metrics.http_req_duration.values.avg}ms`);
  console.log(`95th percentile: ${data.metrics.http_req_duration.values["p(95)"]}ms`);
  console.log(`Error rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);

  return {
    "performance-results.json": JSON.stringify(data, null, 2),
    "performance-summary.txt": `
Performance Test Summary
=======================
Date: ${new Date().toISOString()}
Base URL: ${__ENV.BASE_URL || "http://localhost:5173"}

Metrics:
- Total Requests: ${data.metrics.http_reqs.values.count}
- Average Response Time: ${data.metrics.http_req_duration.values.avg}ms
- 95th Percentile: ${data.metrics.http_req_duration.values["p(95)"]}ms
- Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%

Thresholds:
- Response Time < 2s: ${data.metrics.http_req_duration.values["p(95)"] < 2000 ? "PASS" : "FAIL"}
- Error Rate < 10%: ${data.metrics.http_req_failed.values.rate < 0.1 ? "PASS" : "FAIL"}
- Auth Duration < 1s: ${data.metrics.auth_duration?.values["p(95)"] < 1000 ? "PASS" : "FAIL"}
- Dashboard Load < 3s: ${data.metrics.dashboard_load_duration?.values["p(95)"] < 3000 ? "PASS" : "FAIL"}
- API Response < 500ms: ${data.metrics.api_response_duration?.values["p(95)"] < 500 ? "PASS" : "FAIL"}
    `,
  };
}
