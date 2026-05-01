/**
 * Fail fast when required environment variables are missing.
 * Call from server.js before connecting to the database.
 */
export const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];

  for (const key of required) {
    if (!process.env[key]?.trim()) {
      throw new Error(
        `${key} is required. Copy .env.example to .env and set ${key}.`
      );
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
};
