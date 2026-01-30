/**
 * Property-based tests for validation utilities
 * Feature: user-authentication
 */

import * as fc from 'fast-check';
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../src/utils/validation';

describe('Validation Property Tests', () => {
  /**
   * Property 2: Invalid email format rejected
   * Validates: Requirements 1.5, 2.4, 9.3
   * Feature: user-authentication, Property 2: Invalid email format rejected
   */
  describe('Property 2: Invalid email format rejected', () => {
    it('should reject any string without "@" symbol', () => {
      fc.assert(
        fc.property(
          // Generate strings that don't contain "@"
          fc.string().filter(s => !s.includes('@') && s.length > 0),
          email => {
            const result = validateEmail(email);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject emails with "@" at the start', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0),
          domain => {
            const email = '@' + domain;
            const result = validateEmail(email);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject emails with "@" at the end', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0 && !s.includes('@')),
          localPart => {
            const email = localPart + '@';
            const result = validateEmail(email);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 3: Short password rejected
   * Validates: Requirements 1.6, 9.4
   * Feature: user-authentication, Property 3: Short password rejected
   */
  describe('Property 3: Short password rejected', () => {
    it('should reject any password with fewer than 6 characters', () => {
      fc.assert(
        fc.property(
          // Generate strings with length 0-5
          fc.string({ maxLength: 5 }),
          password => {
            const result = validatePassword(password);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept any password with 6 or more characters', () => {
      fc.assert(
        fc.property(
          // Generate strings with length >= 6
          fc.string({ minLength: 6 }),
          password => {
            const result = validatePassword(password);
            expect(result).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 15: Required field validation
   * Validates: Requirements 9.5
   * Feature: user-authentication, Property 15: Required field validation
   */
  describe('Property 15: Required field validation', () => {
    it('should reject empty strings', () => {
      const result = validateRequired('');
      expect(result).toBe(false);
    });

    it('should reject any string composed entirely of whitespace', () => {
      fc.assert(
        fc.property(
          // Generate strings with only whitespace characters
          fc
            .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1 })
            .map(arr => arr.join('')),
          whitespaceString => {
            const result = validateRequired(whitespaceString);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept any non-empty string with at least one non-whitespace character', () => {
      fc.assert(
        fc.property(
          // Generate strings that have at least one non-whitespace character
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          value => {
            const result = validateRequired(value);
            expect(result).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
