import { jest } from '@jest/globals';
import { OscarApiClient } from './oscar-api';
import { OscarConnectionTest } from './oscar-connection-test';
import { OscarOAuthSetup } from './oscar-oauth-setup';
import { oscarTokenManager } from './oscar-token-manager';
import {
  OscarError,
  OscarAuthenticationError,
  OscarNetworkError,
  OscarApiError,
  OscarConfigurationError,
  OscarErrorFactory
} from './oscar-errors';
import { auditLog } from '../audit/audit-logger';

// Mock dependencies
jest.mock('../audit/audit-logger');
jest.mock('./oscar-token-manager');
jest.mock('oauth-1.0a');

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('OSCAR API Authentication', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };
    
    // Set up test environment variables
    process.env.OSCAR_BASE_URL = 'https://test.oscar.com';
    process.env.OSCAR_CONSUMER_KEY = 'test_consumer_key';
    process.env.OSCAR_CONSUMER_SECRET = 'test_consumer_secret';
    process.env.OSCAR_TOKEN = 'test_token';
    process.env.OSCAR_TOKEN_SECRET = 'test_token_secret';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('OscarApiClient Configuration', () => {
    it('should initialize successfully with valid environment variables', () => {
      expect(() => new OscarApiClient()).not.toThrow();
    });

    it('should throw OscarConfigurationError when OSCAR_BASE_URL is missing', () => {
      delete process.env.OSCAR_BASE_URL;
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('Missing required environment variable: OSCAR_BASE_URL');
    });

    it('should throw OscarConfigurationError when OSCAR_CONSUMER_KEY is missing', () => {
      delete process.env.OSCAR_CONSUMER_KEY;
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('Missing required environment variable: OSCAR_CONSUMER_KEY');
    });

    it('should throw OscarConfigurationError when OSCAR_CONSUMER_SECRET is missing', () => {
      delete process.env.OSCAR_CONSUMER_SECRET;
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('Missing required environment variable: OSCAR_CONSUMER_SECRET');
    });

    it('should throw OscarConfigurationError when OSCAR_TOKEN is missing', () => {
      delete process.env.OSCAR_TOKEN;
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('Missing required environment variable: OSCAR_TOKEN');
    });

    it('should throw OscarConfigurationError when OSCAR_TOKEN_SECRET is missing', () => {
      delete process.env.OSCAR_TOKEN_SECRET;
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('Missing required environment variable: OSCAR_TOKEN_SECRET');
    });

    it('should throw OscarConfigurationError when OSCAR_BASE_URL is invalid', () => {
      process.env.OSCAR_BASE_URL = 'invalid-url';
      
      expect(() => new OscarApiClient()).toThrow(OscarConfigurationError);
      expect(() => new OscarApiClient()).toThrow('OSCAR_BASE_URL is not a valid URL');
    });

    it('should accept custom credentials', () => {
      const customCredentials = {
        baseUrl: 'https://custom.oscar.com',
        consumerKey: 'custom_key',
        consumerSecret: 'custom_secret',
        token: 'custom_token',
        tokenSecret: 'custom_token_secret'
      };

      expect(() => new OscarApiClient(customCredentials)).not.toThrow();
    });

    it('should report configuration status correctly', () => {
      const client = new OscarApiClient();
      expect(client.isConfigured()).toBe(true);
    });

    it('should not expose secrets in getCredentials()', () => {
      const client = new OscarApiClient();
      const credentials = client.getCredentials();
      
      expect(credentials.baseUrl).toBe('https://test.oscar.com');
      expect(credentials.consumerKey).toBe('test_consumer_key');
      expect(credentials.consumerSecret).toBeUndefined();
      expect(credentials.token).toBeUndefined();
      expect(credentials.tokenSecret).toBeUndefined();
    });
  });

  describe('OscarApiClient Authentication', () => {
    let client: OscarApiClient;

    beforeEach(() => {
      client = new OscarApiClient();
      
      // Mock token manager
      (oscarTokenManager.isHealthy as jest.Mock).mockResolvedValue(true);
      (oscarTokenManager.ensureValidTokens as jest.Mock).mockResolvedValue(undefined);
    });

    it('should make authenticated requests successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('{"success": true, "data": []}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.getProviders();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.oscar.com/oscar/ws/services/providers',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('OAuth'),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Zenith-Medical-Centre/1.0'
          })
        })
      );
    });

    it('should handle 401 authentication errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('{"error": "Unauthorized"}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(client.getProviders()).rejects.toThrow(OscarAuthenticationError);
      await expect(client.getProviders()).rejects.toThrow('Invalid credentials or expired tokens');
    });

    it('should handle 403 permission errors', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('{"error": "Forbidden"}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(client.getProviders()).rejects.toThrow(OscarAuthenticationError);
      await expect(client.getProviders()).rejects.toThrow('Access denied - insufficient permissions');
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('{"success": true}')
        });

      await client.getProviders();
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on authentication errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('{"error": "Unauthorized"}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(client.getProviders()).rejects.toThrow(OscarAuthenticationError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should ensure tokens are valid before requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('{"success": true}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await client.getProviders();
      
      expect(oscarTokenManager.ensureValidTokens).toHaveBeenCalled();
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new DOMException('The operation was aborted.', 'AbortError')
      );

      await expect(client.getProviders()).rejects.toThrow(OscarNetworkError);
    });
  });

  describe('OscarConnectionTest', () => {
    let connectionTest: OscarConnectionTest;

    beforeEach(() => {
      connectionTest = new OscarConnectionTest();
    });

    it('should test connectivity successfully', async () => {
      const mockResponse = {
        ok: false,
        status: 401 // Expected without auth
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await connectionTest.testConnectivity();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully connected to OSCAR server');
      expect(result.details?.testType).toBe('connectivity');
    });

    it('should fail connectivity test on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await connectionTest.testConnectivity();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
      expect(result.details?.testType).toBe('connectivity');
    });

    it('should test authentication successfully', async () => {
      // Mock OscarApiClient getProviders to succeed
      const mockApiClient = {
        getProviders: jest.fn().mockResolvedValue([
          { id: '1', name: 'Dr. Test' }
        ])
      };
      
      // Override the api client in the connection test
      (connectionTest as any).oscarApi = mockApiClient;

      const result = await connectionTest.testAuthentication();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Authentication successful');
      expect(result.details?.testType).toBe('authentication');
    });

    it('should fail authentication test on invalid credentials', async () => {
      // Mock OscarApiClient getProviders to throw auth error
      const mockApiClient = {
        getProviders: jest.fn().mockRejectedValue(
          new OscarAuthenticationError('Invalid credentials', 'credentials', 401)
        )
      };
      
      (connectionTest as any).oscarApi = mockApiClient;

      const result = await connectionTest.testAuthentication();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Authentication failed - invalid credentials');
      expect(result.details?.testType).toBe('authentication');
    });

    it('should run full connection test', async () => {
      // Mock successful connectivity
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      });

      // Mock successful authentication and API functionality
      const mockApiClient = {
        getProviders: jest.fn().mockResolvedValue([{ id: '1', name: 'Dr. Test' }]),
        searchPatient: jest.fn().mockResolvedValue({ results: [] })
      };
      
      (connectionTest as any).oscarApi = mockApiClient;

      const result = await connectionTest.runFullConnectionTest();
      
      expect(result.overall.success).toBe(true);
      expect(result.connectivity.success).toBe(true);
      expect(result.authentication.success).toBe(true);
      expect(result.apiFunctionality.success).toBe(true);
    });

    it('should skip dependent tests when prerequisites fail', async () => {
      // Mock failed connectivity
      (global.fetch as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await connectionTest.runFullConnectionTest();
      
      expect(result.overall.success).toBe(false);
      expect(result.connectivity.success).toBe(false);
      expect(result.authentication.success).toBe(false);
      expect(result.authentication.message).toContain('Skipped - connectivity test failed');
      expect(result.apiFunctionality.success).toBe(false);
      expect(result.apiFunctionality.message).toContain('Skipped - authentication test failed');
    });

    it('should perform quick health check', async () => {
      // Mock successful tests
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      });

      const mockApiClient = {
        getProviders: jest.fn().mockResolvedValue([])
      };
      
      (connectionTest as any).oscarApi = mockApiClient;

      const result = await connectionTest.quickHealthCheck();
      
      expect(result.healthy).toBe(true);
    });
  });

  describe('OscarOAuthSetup', () => {
    let oauthSetup: OscarOAuthSetup;

    beforeEach(() => {
      oauthSetup = new OscarOAuthSetup();
    });

    it('should validate required configuration', () => {
      expect(() => oauthSetup.validateOAuthConfig()).not.toThrow();
    });

    it('should fail validation when consumer credentials are missing', () => {
      delete process.env.OSCAR_CONSUMER_KEY;
      
      expect(() => oauthSetup.validateOAuthConfig()).toThrow(OscarConfigurationError);
    });

    it('should generate request token URL', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('oauth_token=test_token&oauth_token_secret=test_secret&oauth_callback_confirmed=true')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await oauthSetup.getRequestTokenUrl('http://callback.url');
      
      expect(result.authorizationUrl).toContain('oauth_token=test_token');
      expect(result.requestToken).toBe('test_token');
      expect(result.requestTokenSecret).toBe('test_secret');
    });

    it('should exchange authorization code for access tokens', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('oauth_token=access_token&oauth_token_secret=access_secret')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await oauthSetup.exchangeCodeForTokens(
        'oauth_verifier',
        'request_token',
        'request_token_secret'
      );
      
      expect(result.accessToken).toBe('access_token');
      expect(result.accessTokenSecret).toBe('access_secret');
      expect(result.envConfig).toContain('OSCAR_TOKEN=access_token');
      expect(result.envConfig).toContain('OSCAR_TOKEN_SECRET=access_secret');
    });
  });

  describe('Error Handling', () => {
    it('should create appropriate error from HTTP 401 response', async () => {
      const mockResponse = {
        status: 401,
        text: jest.fn().mockResolvedValue('{"error": "Invalid token"}')
      } as any;

      const error = await OscarErrorFactory.fromHttpResponse(mockResponse, '/test');
      
      expect(error).toBeInstanceOf(OscarAuthenticationError);
      expect((error as OscarAuthenticationError).authType).toBe('credentials');
      expect(error.httpStatus).toBe(401);
    });

    it('should create appropriate error from HTTP 403 response', async () => {
      const mockResponse = {
        status: 403,
        text: jest.fn().mockResolvedValue('{"error": "Access denied"}')
      } as any;

      const error = await OscarErrorFactory.fromHttpResponse(mockResponse, '/test');
      
      expect(error).toBeInstanceOf(OscarAuthenticationError);
      expect((error as OscarAuthenticationError).authType).toBe('permission');
      expect(error.httpStatus).toBe(403);
    });

    it('should create network error from fetch error', () => {
      const fetchError = new Error('ECONNREFUSED: Connection refused');
      const error = OscarErrorFactory.fromNetworkError(fetchError, '/test');
      
      expect(error).toBeInstanceOf(OscarNetworkError);
      expect((error as OscarNetworkError).networkType).toBe('connection');
      expect(error.retryable).toBe(true);
    });

    it('should create timeout error from timeout exception', () => {
      const timeoutError = new Error('Request timeout');
      const error = OscarErrorFactory.fromNetworkError(timeoutError, '/test');
      
      expect(error).toBeInstanceOf(OscarNetworkError);
      expect((error as OscarNetworkError).networkType).toBe('timeout');
      expect(error.retryable).toBe(true);
    });

    it('should provide user-friendly error messages', () => {
      const authError = new OscarAuthenticationError('Test error', 'credentials', 401);
      const message = OscarErrorHandler.getUserMessage(authError);
      
      expect(message).toBe('Authentication failed. Please check your OSCAR credentials.');
    });

    it('should calculate retry delays with exponential backoff', () => {
      expect(OscarErrorHandler.getRetryDelay(0)).toBe(1000);
      expect(OscarErrorHandler.getRetryDelay(1)).toBe(2000);
      expect(OscarErrorHandler.getRetryDelay(2)).toBe(4000);
      expect(OscarErrorHandler.getRetryDelay(10)).toBe(30000); // Max cap
    });

    it('should determine retry eligibility correctly', () => {
      const retryableError = new OscarNetworkError('Timeout', 'timeout');
      const nonRetryableError = new OscarAuthenticationError('Invalid auth', 'credentials', 401);
      
      expect(OscarErrorHandler.shouldRetry(retryableError, 0, 3)).toBe(true);
      expect(OscarErrorHandler.shouldRetry(retryableError, 3, 3)).toBe(false);
      expect(OscarErrorHandler.shouldRetry(nonRetryableError, 0, 3)).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    it('should log successful API operations', async () => {
      const client = new OscarApiClient();
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('{"success": true}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await client.getProviders();
      
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_PROVIDERS_FETCH',
          resource: 'oscar_api'
        })
      );
    });

    it('should log authentication errors', async () => {
      const client = new OscarApiClient();
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('{"error": "Unauthorized"}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await client.getProviders();
      } catch (error) {
        // Expected error
      }
      
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_API_ERROR',
          resource: 'oscar_api',
          details: expect.objectContaining({
            name: 'OscarAuthenticationError'
          })
        })
      );
    });

    it('should log retry attempts', async () => {
      const client = new OscarApiClient();
      
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('{"success": true}')
        });

      await client.getProviders();
      
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OSCAR_API_RETRY',
          resource: 'oscar_api',
          details: expect.objectContaining({
            retryCount: 1
          })
        })
      );
    });
  });
}); 