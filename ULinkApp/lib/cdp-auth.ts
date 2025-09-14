import { generateJwt } from "@coinbase/cdp-sdk/auth";

interface CDPAuthConfig {
  requestMethod: string;
  requestHost: string;
  requestPath: string;
  audience?: string[];
}

/**
 * Get CDP API credentials from environment variables
 *
 * @throws Error if credentials are not configured
 */
export function getCDPCredentials() {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyId || !apiKeySecret) {
    throw new Error("CDP API credentials not configured");
  }

  return { apiKeyId, apiKeySecret };
}

/**
 * Generate JWT token for CDP API authentication
 *
 * @param config - Configuration for JWT generation
 * @returns JWT token string
 */
export async function generateCDPJWT(config: CDPAuthConfig): Promise<string> {
  const { apiKeyId, apiKeySecret } = getCDPCredentials();

  return generateJwt({
    apiKeyId,
    apiKeySecret,
    requestMethod: config.requestMethod,
    requestHost: config.requestHost,
    requestPath: config.requestPath,
  });
}

/**
 * Get the appropriate API base URL based on environment
 * Sandbox for testing, production for live transactions
 */
export function getOnrampApiBaseUrl(): string {
  const environment = process.env.CDP_ENVIRONMENT || 'production';
  
  if (environment === 'sandbox') {
    return "https://api.developer.coinbase.com"; // Sandbox URL
  }
  
  return "https://api.developer.coinbase.com"; // Production URL
}

/**
 * Base URL for ONRAMP API
 * Dynamically determined based on environment configuration
 */
export const ONRAMP_API_BASE_URL = getOnrampApiBaseUrl();