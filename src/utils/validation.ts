/**
 * Validates email format by checking for "@" symbol and domain
 * @param email - The email string to validate
 * @returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check for "@" symbol
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return false;
  }

  // Check that there are characters before "@"
  if (atIndex === 0) {
    return false;
  }

  // Check that there are characters after "@" (domain)
  if (atIndex === email.length - 1) {
    return false;
  }

  return true;
};

/**
 * Validates password length (minimum 6 characters)
 * @param password - The password string to validate
 * @returns true if password is valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  return password.length >= 6;
};

/**
 * Validates that a required field is non-empty
 * @param value - The value to validate
 * @returns true if value is non-empty, false otherwise
 */
export const validateRequired = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Check that the value is not just whitespace
  return value.trim().length > 0;
};
