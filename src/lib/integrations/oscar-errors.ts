/**
 * Base error class for all OSCAR API related errors
 */
export abstract class OscarError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly httpStatus?: number;
  public readonly originalError?: Error;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    retryable: boolean = false,
    httpStatus?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.retryable = retryable;
    this.httpStatus = httpStatus;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get structured error details for logging
   */
  toLogObject() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      retryable: this.retryable,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

/**
 * Authentication-related errors
 */
export class OscarAuthenticationError extends OscarError {
  public readonly authType: 'oauth' | 'credentials' | 'token' | 'permission';

  constructor(
    message: string,
    authType: 'oauth' | 'credentials' | 'token' | 'permission',
    httpStatus?: number,
    originalError?: Error
  ) {
    const errorCodes = {
      oauth: 'OSCAR_OAUTH_ERROR',
      credentials: 'OSCAR_INVALID_CREDENTIALS',
      token: 'OSCAR_TOKEN_ERROR',
      permission: 'OSCAR_PERMISSION_DENIED'
    };

    super(message, errorCodes[authType], false, httpStatus, originalError);
    this.authType = authType;
  }

  static fromHttpStatus(status: number, message?: string, originalError?: Error): OscarAuthenticationError {
    switch (status) {
      case 401:
        return new OscarAuthenticationError(
          message || 'Invalid credentials or expired tokens',
          'credentials',
          status,
          originalError
        );
      case 403:
        return new OscarAuthenticationError(
          message || 'Access denied - insufficient permissions',
          'permission',
          status,
          originalError
        );
      default:
        return new OscarAuthenticationError(
          message || `Authentication failed with status ${status}`,
          'oauth',
          status,
          originalError
        );
    }
  }
}

/**
 * OAuth-specific errors
 */
export class OscarOAuthError extends OscarAuthenticationError {
  public readonly oauthStep: 'request_token' | 'authorize' | 'access_token' | 'signature';

  constructor(
    message: string,
    oauthStep: 'request_token' | 'authorize' | 'access_token' | 'signature',
    originalError?: Error
  ) {
    super(message, 'oauth', undefined, originalError);
    this.oauthStep = oauthStep;
    this.code = `OSCAR_OAUTH_${oauthStep.toUpperCase()}_ERROR`;
  }
}

/**
 * Network connectivity errors
 */
export class OscarNetworkError extends OscarError {
  public readonly networkType: 'timeout' | 'connection' | 'dns' | 'unknown';

  constructor(
    message: string,
    networkType: 'timeout' | 'connection' | 'dns' | 'unknown',
    originalError?: Error
  ) {
    const retryable = networkType !== 'dns'; // DNS errors usually indicate config issues
    super(message, `OSCAR_NETWORK_${networkType.toUpperCase()}`, retryable, undefined, originalError);
    this.networkType = networkType;
  }

  static fromFetchError(error: Error): OscarNetworkError {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('aborted')) {
      return new OscarNetworkError('Request timeout', 'timeout', error);
    } else if (message.includes('enotfound') || message.includes('dns')) {
      return new OscarNetworkError('DNS resolution failed', 'dns', error);
    } else if (message.includes('econnrefused') || message.includes('connect')) {
      return new OscarNetworkError('Connection refused', 'connection', error);
    } else {
      return new OscarNetworkError(`Network error: ${error.message}`, 'unknown', error);
    }
  }
}

/**
 * API response and validation errors
 */
export class OscarApiError extends OscarError {
  public readonly apiType: 'validation' | 'not_found' | 'rate_limit' | 'server_error' | 'invalid_response';
  public readonly endpoint?: string;
  public readonly requestData?: any;

  constructor(
    message: string,
    apiType: 'validation' | 'not_found' | 'rate_limit' | 'server_error' | 'invalid_response',
    httpStatus?: number,
    endpoint?: string,
    requestData?: any,
    originalError?: Error
  ) {
    const retryable = apiType === 'rate_limit' || apiType === 'server_error';
    super(message, `OSCAR_API_${apiType.toUpperCase()}`, retryable, httpStatus, originalError);
    this.apiType = apiType;
    this.endpoint = endpoint;
    this.requestData = requestData;
  }

  static fromHttpStatus(
    status: number, 
    endpoint?: string, 
    responseBody?: any, 
    requestData?: any,
    originalError?: Error
  ): OscarApiError {
    let message = `API request failed with status ${status}`;
    let apiType: OscarApiError['apiType'] = 'server_error';

    switch (status) {
      case 400:
        apiType = 'validation';
        message = 'Invalid request data';
        break;
      case 404:
        apiType = 'not_found';
        message = 'Resource not found';
        break;
      case 429:
        apiType = 'rate_limit';
        message = 'Rate limit exceeded';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        apiType = 'server_error';
        message = 'Server error occurred';
        break;
      default:
        apiType = 'invalid_response';
        message = `Unexpected response status: ${status}`;
    }

    // Try to extract more specific error message from response
    if (responseBody) {
      if (typeof responseBody === 'string') {
        message += ` - ${responseBody}`;
      } else if (responseBody.error) {
        message += ` - ${responseBody.error}`;
      } else if (responseBody.message) {
        message += ` - ${responseBody.message}`;
      }
    }

    if (endpoint) {
      message += ` (${endpoint})`;
    }

    return new OscarApiError(message, apiType, status, endpoint, requestData, originalError);
  }
}

/**
 * Configuration errors
 */
export class OscarConfigurationError extends OscarError {
  public readonly configType: 'missing_env' | 'invalid_url' | 'invalid_credentials' | 'missing_setup';

  constructor(
    message: string,
    configType: 'missing_env' | 'invalid_url' | 'invalid_credentials' | 'missing_setup'
  ) {
    super(message, `OSCAR_CONFIG_${configType.toUpperCase()}`, false);
    this.configType = configType;
  }
}

/**
 * Data validation and mapping errors
 */
export class OscarDataError extends OscarError {
  public readonly dataType: 'validation' | 'mapping' | 'missing_required' | 'format_invalid';
  public readonly fieldName?: string;
  public readonly fieldValue?: any;

  constructor(
    message: string,
    dataType: 'validation' | 'mapping' | 'missing_required' | 'format_invalid',
    fieldName?: string,
    fieldValue?: any
  ) {
    super(message, `OSCAR_DATA_${dataType.toUpperCase()}`, false);
    this.dataType = dataType;
    this.fieldName = fieldName;
    this.fieldValue = fieldValue;
  }
}

/**
 * Error factory for consistent error creation and handling
 */
export class OscarErrorFactory {
  /**
   * Create appropriate error from HTTP response
   */
  static async fromHttpResponse(
    response: Response,
    endpoint?: string,
    requestData?: any
  ): Promise<OscarError> {
    const status = response.status;
    let responseBody: any;

    try {
      const text = await response.text();
      responseBody = text ? JSON.parse(text) : null;
    } catch {
      responseBody = null;
    }

    // Authentication errors
    if (status === 401 || status === 403) {
      return OscarAuthenticationError.fromHttpStatus(status, responseBody?.message, undefined);
    }

    // API errors
    return OscarApiError.fromHttpStatus(status, endpoint, responseBody, requestData);
  }

  /**
   * Create appropriate error from fetch/network error
   */
  static fromNetworkError(error: Error, endpoint?: string): OscarError {
    // Check if it's a network-related error
    const message = error.message.toLowerCase();
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('dns')
    ) {
      return OscarNetworkError.fromFetchError(error);
    }

    // Default to API error
    return new OscarApiError(
      `API request failed: ${error.message}`,
      'invalid_response',
      undefined,
      endpoint,
      undefined,
      error
    );
  }

  /**
   * Validate OSCAR configuration and throw appropriate errors
   */
  static validateConfiguration(): void {
    const requiredEnvVars = [
      'OSCAR_BASE_URL',
      'OSCAR_CONSUMER_KEY',
      'OSCAR_CONSUMER_SECRET',
      'OSCAR_TOKEN',
      'OSCAR_TOKEN_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new OscarConfigurationError(
          `Missing required environment variable: ${envVar}`,
          'missing_env'
        );
      }
    }

    // Validate base URL format
    try {
      new URL(process.env.OSCAR_BASE_URL!);
    } catch {
      throw new OscarConfigurationError(
        'OSCAR_BASE_URL is not a valid URL',
        'invalid_url'
      );
    }
  }
}

/**
 * Error handler utility for consistent error processing
 */
export class OscarErrorHandler {
  /**
   * Determine if an error should be retried
   */
  static shouldRetry(error: OscarError, attemptCount: number, maxAttempts: number = 3): boolean {
    if (attemptCount >= maxAttempts) {
      return false;
    }

    return error.retryable;
  }

  /**
   * Calculate retry delay using exponential backoff
   */
  static getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptCount), 30000); // Max 30 seconds
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: OscarError): string {
    if (error instanceof OscarAuthenticationError) {
      switch (error.authType) {
        case 'credentials':
          return 'Authentication failed. Please check your OSCAR credentials.';
        case 'permission':
          return 'Access denied. Your account may not have sufficient permissions.';
        case 'token':
          return 'Session expired. Please re-authenticate with OSCAR.';
        default:
          return 'Authentication error occurred. Please try again.';
      }
    }

    if (error instanceof OscarNetworkError) {
      switch (error.networkType) {
        case 'timeout':
          return 'Request timed out. Please check your connection and try again.';
        case 'connection':
          return 'Unable to connect to OSCAR server. Please check server status.';
        case 'dns':
          return 'OSCAR server address could not be resolved. Please check configuration.';
        default:
          return 'Network error occurred. Please try again.';
      }
    }

    if (error instanceof OscarApiError) {
      switch (error.apiType) {
        case 'validation':
          return 'Invalid data provided. Please check your input and try again.';
        case 'not_found':
          return 'Requested resource not found.';
        case 'rate_limit':
          return 'Too many requests. Please wait a moment and try again.';
        case 'server_error':
          return 'OSCAR server error. Please try again later.';
        default:
          return 'API error occurred. Please try again.';
      }
    }

    if (error instanceof OscarConfigurationError) {
      return 'OSCAR integration is not properly configured. Please contact support.';
    }

    if (error instanceof OscarDataError) {
      return 'Data validation error. Please check your input.';
    }

    return 'An unexpected error occurred. Please try again.';
  }
} 