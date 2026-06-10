export const environment = {
  production: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5238/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:5238/hubs',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  appName: 'FreelanceHub',
  version: '1.0.0'
};
