// Environment variable validation
// This file validates that all required environment variables are set
// Import this file in app/layout.tsx to run validation on startup

function validateEnv() {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

// Run validation immediately when this module is imported
validateEnv();

export {};
