import { OscarApiClient } from './oscar-api';
import { auditLog } from '../audit/audit-logger';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    httpStatus?: number;
    responseTime?: number;
    error?: string;
    testType: 'connectivity' | 'authentication' | 'api_functionality';
  };
}

export interface FullConnectionTest {
  connectivity: ConnectionTestResult;
  authentication: ConnectionTestResult;
  apiFunctionality: ConnectionTestResult;
  overall: {
    success: boolean;
    summary: string;
    timestamp: string;
  };
}

export class OscarConnectionTest {
  private oscarApi: OscarApiClient;

  constructor() {
    this.oscarApi = new OscarApiClient();
  }

  /**
   * Test basic connectivity to OSCAR server
   */
  async testConnectivity(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test if we can reach the OSCAR base URL
      const baseUrl = process.env.OSCAR_BASE_URL;
      if (!baseUrl) {
        return {
          success: false,
          message: 'OSCAR_BASE_URL environment variable not configured',
          details: {
            testType: 'connectivity',
            error: 'Missing OSCAR_BASE_URL configuration'
          }
        };
      }

      // Simple connectivity test - try to reach the base URL
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok || response.status === 401) {
        // 401 is expected without authentication, means server is reachable
        await auditLog({
          action: 'OSCAR_CONNECTIVITY_TEST_SUCCESS',
          resource: 'oscar_api',
          details: { responseTime, httpStatus: response.status }
        });

        return {
          success: true,
          message: 'Successfully connected to OSCAR server',
          details: {
            testType: 'connectivity',
            httpStatus: response.status,
            responseTime
          }
        };
      } else {
        return {
          success: false,
          message: `Server responded with unexpected status: ${response.status}`,
          details: {
            testType: 'connectivity',
            httpStatus: response.status,
            responseTime,
            error: `HTTP ${response.status}`
          }
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLog({
        action: 'OSCAR_CONNECTIVITY_TEST_FAILURE',
        resource: 'oscar_api',
        details: { error: errorMessage, responseTime }
      });

      return {
        success: false,
        message: `Connection failed: ${errorMessage}`,
        details: {
          testType: 'connectivity',
          responseTime,
          error: errorMessage
        }
      };
    }
  }

  /**
   * Test OAuth authentication with OSCAR
   */
  async testAuthentication(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Check if OAuth credentials are configured
      const requiredEnvVars = [
        'OSCAR_CONSUMER_KEY',
        'OSCAR_CONSUMER_SECRET',
        'OSCAR_TOKEN',
        'OSCAR_TOKEN_SECRET'
      ];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          return {
            success: false,
            message: `OAuth credentials incomplete: ${envVar} not configured`,
            details: {
              testType: 'authentication',
              error: `Missing ${envVar} configuration`
            }
          };
        }
      }

      // Test authentication by making a simple authenticated request
      // We'll use the providers endpoint as it's typically available and lightweight
      const providers = await this.oscarApi.getProviders();
      const responseTime = Date.now() - startTime;

      if (Array.isArray(providers)) {
        await auditLog({
          action: 'OSCAR_AUTH_TEST_SUCCESS',
          resource: 'oscar_api',
          details: { responseTime, providerCount: providers.length }
        });

        return {
          success: true,
          message: `Authentication successful - retrieved ${providers.length} providers`,
          details: {
            testType: 'authentication',
            responseTime
          }
        };
      } else {
        return {
          success: false,
          message: 'Authentication succeeded but received unexpected response format',
          details: {
            testType: 'authentication',
            responseTime,
            error: 'Invalid response format'
          }
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLog({
        action: 'OSCAR_AUTH_TEST_FAILURE',
        resource: 'oscar_api',
        details: { error: errorMessage, responseTime }
      });

      // Parse specific authentication errors
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
          success: false,
          message: 'Authentication failed - invalid credentials or expired tokens',
          details: {
            testType: 'authentication',
            responseTime,
            error: 'Authentication credentials invalid'
          }
        };
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        return {
          success: false,
          message: 'Authentication failed - access denied',
          details: {
            testType: 'authentication',
            responseTime,
            error: 'Access denied - check permissions'
          }
        };
      } else {
        return {
          success: false,
          message: `Authentication test failed: ${errorMessage}`,
          details: {
            testType: 'authentication',
            responseTime,
            error: errorMessage
          }
        };
      }
    }
  }

  /**
   * Test basic API functionality
   */
  async testApiFunctionality(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test multiple API endpoints to ensure comprehensive functionality
      const tests = await Promise.allSettled([
        this.oscarApi.getProviders(),
        this.oscarApi.searchPatientByHealthNumber('test-health-number-999999')
      ]);

      const responseTime = Date.now() - startTime;
      const successfulTests = tests.filter(test => test.status === 'fulfilled').length;
      const totalTests = tests.length;

      if (successfulTests === totalTests) {
        await auditLog({
          action: 'OSCAR_API_FUNCTIONALITY_TEST_SUCCESS',
          resource: 'oscar_api',
          details: { responseTime, testsExecuted: totalTests }
        });

        return {
          success: true,
          message: `All API functionality tests passed (${successfulTests}/${totalTests})`,
          details: {
            testType: 'api_functionality',
            responseTime
          }
        };
      } else if (successfulTests > 0) {
        return {
          success: false,
          message: `Partial API functionality - ${successfulTests}/${totalTests} tests passed`,
          details: {
            testType: 'api_functionality',
            responseTime,
            error: 'Some API endpoints not responding correctly'
          }
        };
      } else {
        const firstError = tests.find(test => test.status === 'rejected') as PromiseRejectedResult;
        const errorMessage = firstError?.reason?.message || 'All API tests failed';
        
        return {
          success: false,
          message: `API functionality tests failed: ${errorMessage}`,
          details: {
            testType: 'api_functionality',
            responseTime,
            error: errorMessage
          }
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLog({
        action: 'OSCAR_API_FUNCTIONALITY_TEST_FAILURE',
        resource: 'oscar_api',
        details: { error: errorMessage, responseTime }
      });

      return {
        success: false,
        message: `API functionality test failed: ${errorMessage}`,
        details: {
          testType: 'api_functionality',
          responseTime,
          error: errorMessage
        }
      };
    }
  }

  /**
   * Run comprehensive connection test including all checks
   */
  async runFullConnectionTest(): Promise<FullConnectionTest> {
    const timestamp = new Date().toISOString();
    
    await auditLog({
      action: 'OSCAR_FULL_CONNECTION_TEST_STARTED',
      resource: 'oscar_api',
      details: { timestamp }
    });

    try {
      // Run all tests in sequence
      const connectivity = await this.testConnectivity();
      const authentication = connectivity.success ? await this.testAuthentication() : {
        success: false,
        message: 'Skipped - connectivity test failed',
        details: { testType: 'authentication' as const, error: 'Connectivity prerequisite failed' }
      };
      const apiFunctionality = authentication.success ? await this.testApiFunctionality() : {
        success: false,
        message: 'Skipped - authentication test failed',
        details: { testType: 'api_functionality' as const, error: 'Authentication prerequisite failed' }
      };

      const allSuccessful = connectivity.success && authentication.success && apiFunctionality.success;
      const summary = allSuccessful 
        ? 'All OSCAR integration tests passed successfully'
        : `OSCAR integration issues detected: ${[
            !connectivity.success && 'connectivity',
            !authentication.success && 'authentication', 
            !apiFunctionality.success && 'api_functionality'
          ].filter(Boolean).join(', ')} failed`;

      const result: FullConnectionTest = {
        connectivity,
        authentication,
        apiFunctionality,
        overall: {
          success: allSuccessful,
          summary,
          timestamp
        }
      };

      await auditLog({
        action: allSuccessful ? 'OSCAR_FULL_CONNECTION_TEST_SUCCESS' : 'OSCAR_FULL_CONNECTION_TEST_FAILURE',
        resource: 'oscar_api',
        details: { 
          timestamp,
          summary,
          connectivityPassed: connectivity.success,
          authenticationPassed: authentication.success,
          apiFunctionalityPassed: apiFunctionality.success
        }
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await auditLog({
        action: 'OSCAR_FULL_CONNECTION_TEST_ERROR',
        resource: 'oscar_api',
        details: { timestamp, error: errorMessage }
      });

      throw error;
    }
  }

  /**
   * Quick health check for monitoring purposes
   */
  async quickHealthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const connectivity = await this.testConnectivity();
      if (!connectivity.success) {
        return { healthy: false, message: connectivity.message };
      }

      const authentication = await this.testAuthentication();
      return { 
        healthy: authentication.success, 
        message: authentication.message 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      return { healthy: false, message: errorMessage };
    }
  }
}

// Export singleton instance
export const oscarConnectionTest = new OscarConnectionTest(); 