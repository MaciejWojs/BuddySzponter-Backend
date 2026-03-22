/**
 * Static application-level configuration constants.
 * Use this file for all non-environment values that appear in multiple places.
 * Environment-specific values (secrets, feature flags, URLs) belong in env.ts / configProvider.
 */
export const APP_CONFIG = {
  basic: {
    /** Application version, injected from package.json during build. */
    version: '1.0.0',
    /** Application name, used in logs and health check responses. */
    appName: 'BuddySzponter-Backend',
  },

  api: {
    /** API title and description for OpenAPI documentation. */
    title: 'Buddy Szponter API',
    /** API description for OpenAPI documentation. */
    description: 'API documentation for the Buddy Szponter backend',
  },

  server: {
    /** HTTP port the Bun server listens on. */
    port: 3000,
    /** Idle connection timeout in seconds. */
    idleTimeout: 30,
  },

  cache: {
    /** Redis key prefixes used across the application. */
    keys: {
      /** Prefix for ECDH session keys: `handshake:<sessionId>` */
      handshakePrefix: 'handshake:',
      /** Prefix for cached user records keyed by email: `user:<email>` */
      userPrefix: 'user:',
      /** `user:id:<userId>` -> email mapping to allow cache lookups by user ID */
      userIdPrefix: 'user:id:',
    },
    /** TTL values in seconds. */
    ttl: {
      /** Lifetime of a handshake/encryption session key (15 minutes). */
      handshakeSession: 900,
      /** Cached user record lifetime (1 minute). */
      user: 60,
    },
  },

  crypto: {
    /** ECDH named curve used for key-exchange. */
    ecdhCurve: 'prime256v1',
  },

  headers: {
    /** Header name carrying the client session UUID for payload encryption. */
    sessionId: 'X-session-id',
  },

  connection: {
    retries: {
      /** Maximum retries when generating a unique connection code. */
      createPendingMax: 5,
      /** Maximum allowed failed join attempts per connection code. */
      joinAttemptsLimit: 5,
    },
    cache: {
      keys: {
        /** Prefix for pending connection payload: `connection_code:<code>` */
        codePrefix: 'connection_code:',
        /** Prefix for UUID -> code lookup: `connection_UUID:<connectionId>` */
        uuidPrefix: 'connection_UUID:',
        /** Prefix for failed join attempts counter: `connection_attempts:<code>` */
        attemptsPrefix: 'connection_attempts:',
      },
      ttl: {
        /** Pending connection code lifetime (2 minutes). */
        pendingCodeSeconds: 120,
      },
    },
    errors: {
      codeAlreadyExists: 'Connection code already exists. Please try again.',
      failedAfterMaxRetries: 'Failed to create connection after max retries',
    },
  },

  auth: {
    tokens: {
      /** Access token lifetime (15 minutes). */
      accessTokenTtlSeconds: 15 * 60,
      /** Refresh token cookie max age (7 days). */
      refreshCookieMaxAgeSeconds: 7 * 24 * 60 * 60,
    },
    session: {
      /** Maximum active sessions per user. */
      maxActivePerUser: 5,
      /** Auth session expiration (7 days). */
      expiresInMs: 7 * 24 * 60 * 60 * 1000,
    },
  },

  /** Paths excluded from payload encryption/decryption middleware. */
  excludedPaths: [
    '/crypto/handshake',
    '/docs',
    '/docs/scalar',
    '/docs/ui',
  ] as const,
} as const;
