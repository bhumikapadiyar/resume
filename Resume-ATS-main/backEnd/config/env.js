const requiredInProduction = ['JWT_SECRET'];

export function validateEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
