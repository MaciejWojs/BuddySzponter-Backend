/**
 * Static application-level configuration constants.
 * Use this file for all non-environment values that appear in multiple places.
 * Environment-specific values (secrets, feature flags, URLs) belong in env.ts / configProvider.
 */
export const APP_CONFIG = {
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
    /** Byte length of the random refresh token used in auth sessions. */
    refreshTokenBytes: 32,
  },

  headers: {
    /** Header name carrying the client session UUID for payload encryption. */
    sessionId: 'X-session-id',
  },

  /** Paths excluded from payload encryption/decryption middleware. */
  excludedPaths: [
    '/crypto/handshake',
    '/docs',
    '/docs/scalar',
    '/docs/ui',
  ] as const,
} as const;
