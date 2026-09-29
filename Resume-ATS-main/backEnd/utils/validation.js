export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateCredentials({ name, email, password }, isSignup) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return 'Password must be between 8 and 72 characters.';
  if (isSignup && (!name || String(name).trim().length < 2)) return 'Enter your name.';
  return null;
}
