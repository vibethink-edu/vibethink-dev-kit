/**
 * Security Tests for VibeThink Orchestrator
 * 
 * Basic security testing including:
 * - Authentication security
 * - Authorization checks
 * - Input validation
 * - SQL injection prevention
 * - XSS prevention
 * - CSRF protection
 * 
 * @author AI Pair Platform - Testing Team
 * @version 1.0.0
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Custom metrics
const securityFailures = new Rate('security_failures');
const authBypassAttempts = new Rate('auth_bypass_attempts');
const injectionAttempts = new Rate('injection_attempts');

// Test configuration
export const options = {
  vus: 10,
  duration: '5m',
  thresholds: {
    security_failures: ['rate<0.01'], // Less than 1% security failures
    auth_bypass_attempts: ['rate<0.01'], // No successful auth bypasses
    injection_attempts: ['rate<0.01'], // No successful injections
  },
};

// Malicious payloads for testing
const maliciousPayloads = {
  sqlInjection: [
    "'; DROP TABLE companies; --",
    "' OR '1'='1",
    "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com'); --",
    "' UNION SELECT * FROM user_profiles --",
  ],
  xss: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
  ],
  pathTraversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
  ],
  commandInjection: [
    "; rm -rf /",
    "| cat /etc/passwd",
    "&& whoami",
    "; ls -la",
  ],
};

// Test scenarios
export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:5173';
  
  // Scenario 1: Authentication Security Tests
  testAuthenticationSecurity(baseUrl);
  
  // Scenario 2: Authorization Security Tests
  testAuthorizationSecurity(baseUrl);
  
  // Scenario 3: Input Validation Tests
  testInputValidation(baseUrl);
  
  // Scenario 4: SQL Injection Tests
  testSQLInjection(baseUrl);
  
  // Scenario 5: XSS Prevention Tests
  testXSSPrevention(baseUrl);
  
  // Scenario 6: CSRF Protection Tests
  testCSRFProtection(baseUrl);
  
  // Scenario 7: Path Traversal Tests
  testPathTraversal(baseUrl);
  
  // Scenario 8: Rate Limiting Tests
  testRateLimiting(baseUrl);
  
  sleep(1);
}

function testAuthenticationSecurity(baseUrl) {
  console.log('🔐 Testing authentication security...');
  
  // Test 1: Attempt to access protected routes without authentication
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/api/companies',
    '/api/users',
  ];
  
  protectedRoutes.forEach(route => {
    const response = http.get(`${baseUrl}${route}`);
    
    check(response, {
      [`${route} requires authentication`]: (r) => {
        const requiresAuth = r.status === 401 || r.status === 403 || r.url.includes('/login');
        if (!requiresAuth) {
          authBypassAttempts.add(1);
          securityFailures.add(1);
        }
        return requiresAuth;
      },
    });
  });
  
  // Test 2: Test weak password attempts
  const weakPasswords = ['password', '123456', 'admin', 'test'];
  
  weakPasswords.forEach(password => {
    const response = http.post(`${baseUrl}/api/auth/login`, {
      email: 'admin@testcompany.com',
      password: password,
    });
    
    check(response, {
      [`weak password ${password} is rejected`]: (r) => {
        const isRejected = r.status === 401 || r.status === 400;
        if (!isRejected) {
          securityFailures.add(1);
        }
        return isRejected;
      },
    });
  });
  
  // Test 3: Test brute force protection
  for (let i = 0; i < 10; i++) {
    const response = http.post(`${baseUrl}/api/auth/login`, {
      email: 'admin@testcompany.com',
      password: 'wrongpassword',
    });
    
    if (i >= 5) {
      // After 5 attempts, should be rate limited
      check(response, {
        'brute force protection active': (r) => {
          const isRateLimited = r.status === 429 || r.status === 403;
          if (!isRateLimited) {
            securityFailures.add(1);
          }
          return isRateLimited;
        },
      });
    }
  }
}

function testAuthorizationSecurity(baseUrl) {
  console.log('🔒 Testing authorization security...');
  
  // Login as employee (lower privileges)
  const employeeToken = getAuthToken(baseUrl, 'employee@testcompany.com', '12345');
  
  if (employeeToken) {
    const headers = {
      'Authorization': `Bearer ${employeeToken}`,
      'Content-Type': 'application/json',
    };
    
    // Test 1: Attempt to access admin routes
    const adminRoutes = [
      '/admin',
      '/api/admin/users',
      '/api/admin/configurations',
    ];
    
    adminRoutes.forEach(route => {
      const response = http.get(`${baseUrl}${route}`, { headers });
      
      check(response, {
        [`${route} requires admin privileges`]: (r) => {
          const requiresAdmin = r.status === 403 || r.status === 401;
          if (!requiresAdmin) {
            securityFailures.add(1);
          }
          return requiresAdmin;
        },
      });
    });
    
    // Test 2: Attempt to access other company data
    const otherCompanyResponse = http.get(
      `${baseUrl}/api/companies/test-company-b/data`,
      { headers }
    );
    
    check(otherCompanyResponse, {
      'cross-company access prevented': (r) => {
        const isPrevented = r.status === 403 || r.status === 404;
        if (!isPrevented) {
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
  }
}

function testInputValidation(baseUrl) {
  console.log('✅ Testing input validation...');
  
  // Test various input validation scenarios
  const invalidInputs = [
    { field: 'email', value: 'invalid-email', expectedError: true },
    { field: 'email', value: 'test@', expectedError: true },
    { field: 'email', value: '@example.com', expectedError: true },
    { field: 'email', value: 'test@example.com', expectedError: false },
    { field: 'password', value: '123', expectedError: true }, // Too short
    { field: 'password', value: 'password123', expectedError: false },
  ];
  
  invalidInputs.forEach(input => {
    const payload = {
      email: input.field === 'email' ? input.value : 'test@example.com',
      password: input.field === 'password' ? input.value : 'password123',
    };
    
    const response = http.post(`${baseUrl}/api/auth/login`, payload);
    
    check(response, {
      [`${input.field} validation for "${input.value}"`]: (r) => {
        const hasError = r.status === 400 || r.body.includes('validation');
        const isValid = input.expectedError ? hasError : !hasError;
        
        if (!isValid) {
          securityFailures.add(1);
        }
        return isValid;
      },
    });
  });
}

function testSQLInjection(baseUrl) {
  console.log('💉 Testing SQL injection prevention...');
  
  // Test SQL injection in various endpoints
  maliciousPayloads.sqlInjection.forEach(payload => {
    // Test in search endpoint
    const searchResponse = http.get(`${baseUrl}/api/companies?search=${encodeURIComponent(payload)}`);
    
    check(searchResponse, {
      `SQL injection prevented in search: ${payload}`]: (r) => {
        const isPrevented = r.status === 400 || r.status === 500 || r.body.includes('error');
        if (!isPrevented) {
          injectionAttempts.add(1);
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
    
    // Test in form submission
    const formResponse = http.post(`${baseUrl}/api/companies`, {
      name: payload,
      slug: payload,
    });
    
    check(formResponse, {
      `SQL injection prevented in form: ${payload}`]: (r) => {
        const isPrevented = r.status === 400 || r.status === 500 || r.body.includes('error');
        if (!isPrevented) {
          injectionAttempts.add(1);
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
  });
}

function testXSSPrevention(baseUrl) {
  console.log('🛡️ Testing XSS prevention...');
  
  // Test XSS in various input fields
  maliciousPayloads.xss.forEach(payload => {
    // Test in company name field
    const companyResponse = http.post(`${baseUrl}/api/companies`, {
      name: payload,
      slug: 'test-company',
    });
    
    check(companyResponse, {
      `XSS prevented in company name: ${payload}`]: (r) => {
        const isPrevented = r.status === 400 || r.body.includes('invalid') || r.body.includes('error');
        if (!isPrevented) {
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
    
    // Test in user profile
    const profileResponse = http.post(`${baseUrl}/api/users`, {
      full_name: payload,
      email: 'test@example.com',
    });
    
    check(profileResponse, {
      `XSS prevented in user profile: ${payload}`]: (r) => {
        const isPrevented = r.status === 400 || r.body.includes('invalid') || r.body.includes('error');
        if (!isPrevented) {
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
  });
}

function testCSRFProtection(baseUrl) {
  console.log('🔄 Testing CSRF protection...');
  
  // Test CSRF protection on state-changing operations
  const csrfEndpoints = [
    { method: 'POST', url: '/api/companies' },
    { method: 'PUT', url: '/api/companies/test-company' },
    { method: 'DELETE', url: '/api/companies/test-company' },
    { method: 'POST', url: '/api/users' },
  ];
  
  csrfEndpoints.forEach(endpoint => {
    const response = http.request(endpoint.method, `${baseUrl}${endpoint.url}`, {
      'Content-Type': 'application/json',
    }, JSON.stringify({ test: 'data' }));
    
    check(response, {
      `CSRF protection on ${endpoint.method} ${endpoint.url}`]: (r) => {
        const isProtected = r.status === 403 || r.status === 401 || r.body.includes('csrf');
        if (!isProtected) {
          securityFailures.add(1);
        }
        return isProtected;
      },
    });
  });
}

function testPathTraversal(baseUrl) {
  console.log('📁 Testing path traversal prevention...');
  
  maliciousPayloads.pathTraversal.forEach(payload => {
    // Test in file upload endpoint
    const uploadResponse = http.post(`${baseUrl}/api/files/upload`, {
      filename: payload,
      content: 'test content',
    });
    
    check(uploadResponse, {
      `Path traversal prevented: ${payload}`]: (r) => {
        const isPrevented = r.status === 400 || r.status === 403 || r.body.includes('invalid');
        if (!isPrevented) {
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
    
    // Test in file access endpoint
    const accessResponse = http.get(`${baseUrl}/api/files/${encodeURIComponent(payload)}`);
    
    check(accessResponse, {
      `Path traversal access prevented: ${payload}`]: (r) => {
        const isPrevented = r.status === 403 || r.status === 404 || r.status === 400;
        if (!isPrevented) {
          securityFailures.add(1);
        }
        return isPrevented;
      },
    });
  });
}

function testRateLimiting(baseUrl) {
  console.log('⏱️ Testing rate limiting...');
  
  // Test rate limiting on authentication endpoint
  for (let i = 0; i < 20; i++) {
    const response = http.post(`${baseUrl}/api/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    
    if (i >= 10) {
      // After 10 attempts, should be rate limited
      check(response, {
        'rate limiting active on auth endpoint': (r) => {
          const isRateLimited = r.status === 429 || r.status === 403;
          if (!isRateLimited) {
            securityFailures.add(1);
          }
          return isRateLimited;
        },
      });
    }
  }
  
  // Test rate limiting on API endpoints
  const apiEndpoints = ['/api/companies', '/api/users', '/api/configurations'];
  
  apiEndpoints.forEach(endpoint => {
    for (let i = 0; i < 100; i++) {
      const response = http.get(`${baseUrl}${endpoint}`);
      
      if (i >= 50) {
        // After 50 requests, should be rate limited
        check(response, {
          `rate limiting active on ${endpoint}`]: (r) => {
            const isRateLimited = r.status === 429 || r.status === 403;
            if (!isRateLimited) {
              securityFailures.add(1);
            }
            return isRateLimited;
          },
        });
      }
    }
  });
}

// Helper function to get authentication token
function getAuthToken(baseUrl, email, password) {
  const response = http.post(`${baseUrl}/api/auth/login`, {
    email: email,
    password: password,
  });
  
  if (response.status === 200) {
    const body = JSON.parse(response.body);
    return body.access_token;
  }
  
  return null;
}

// Setup function
export function setup() {
  console.log('🚀 Starting security tests...');
  console.log(`Base URL: ${__ENV.BASE_URL || 'http://localhost:5173'}`);
  
  // Verify test environment
  const healthCheck = http.get(`${__ENV.BASE_URL || 'http://localhost:5173'}/health`);
  
  if (healthCheck.status !== 200) {
    throw new Error('Test environment is not ready. Health check failed.');
  }
  
  console.log('✅ Security test environment is ready');
  return { baseUrl: __ENV.BASE_URL || 'http://localhost:5173' };
}

// Teardown function
export function teardown(data) {
  console.log('🧹 Cleaning up security test data...');
  
  // Cleanup any test data created during security tests
  const cleanupResponse = http.post(`${data.baseUrl}/api/test/cleanup`, {}, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (cleanupResponse.status === 200) {
    console.log('✅ Security test cleanup completed');
  } else {
    console.warn('⚠️ Security test cleanup failed');
  }
}

// Handle test results
export function handleSummary(data) {
  console.log('🔒 Security test results:');
  console.log(`Security failures: ${data.metrics.security_failures.values.rate * 100}%`);
  console.log(`Auth bypass attempts: ${data.metrics.auth_bypass_attempts.values.rate * 100}%`);
  console.log(`Injection attempts: ${data.metrics.injection_attempts.values.rate * 100}%`);
  
  return {
    'security-results.json': JSON.stringify(data, null, 2),
    'security-summary.txt': `
Security Test Summary
====================
Date: ${new Date().toISOString()}
Base URL: ${__ENV.BASE_URL || 'http://localhost:5173'}

Security Metrics:
- Security Failures: ${(data.metrics.security_failures.values.rate * 100).toFixed(2)}%
- Auth Bypass Attempts: ${(data.metrics.auth_bypass_attempts.values.rate * 100).toFixed(2)}%
- Injection Attempts: ${(data.metrics.injection_attempts.values.rate * 100).toFixed(2)}%

Security Status:
- Authentication Security: ${data.metrics.auth_bypass_attempts.values.rate < 0.01 ? 'PASS' : 'FAIL'}
- Input Validation: ${data.metrics.security_failures.values.rate < 0.01 ? 'PASS' : 'FAIL'}
- SQL Injection Protection: ${data.metrics.injection_attempts.values.rate < 0.01 ? 'PASS' : 'FAIL'}
- XSS Protection: ${data.metrics.security_failures.values.rate < 0.01 ? 'PASS' : 'FAIL'}
- CSRF Protection: ${data.metrics.security_failures.values.rate < 0.01 ? 'PASS' : 'FAIL'}
- Rate Limiting: ${data.metrics.security_failures.values.rate < 0.01 ? 'PASS' : 'FAIL'}
    `,
  };
} 