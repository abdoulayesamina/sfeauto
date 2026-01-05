// Simple validation utilities for internal tool

export function validatePassword(password: string): { valid: boolean; error?: string } {
  // Basic validation - minimum 8 characters
  // For internal tool with 15 users, we don't need complex rules
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères'
    };
  }

  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email.trim())) {
    return {
      valid: false,
      error: 'Format email invalide'
    };
  }

  return { valid: true };
}
