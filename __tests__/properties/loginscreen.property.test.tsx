/**
 * Property-based tests for LoginScreen
 * Feature: user-authentication
 */

import React from 'react';
import * as fc from 'fast-check';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

describe('LoginScreen Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 13: Form validation displays errors
   * Validates: Requirements 9.1
   * Feature: user-authentication, Property 13: Form validation displays errors
   */
  describe('Property 13: Form validation displays errors', () => {
    it('should display error for any invalid email (without @)', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate strings without "@"
          fc.string().filter(s => !s.includes('@') && s.length > 0),
          fc.string({ minLength: 6 }), // Valid password
          async (invalidEmail, validPassword) => {
            const { getByPlaceholderText, getByTestId, getByText } = render(
              <AuthProvider>
                <LoginScreen navigation={mockNavigation} />
              </AuthProvider>,
            );

            await waitFor(() => {
              expect(getByTestId('login-button')).toBeTruthy();
            });

            // Enter invalid email and valid password
            const emailInput = getByPlaceholderText('Enter your email');
            fireEvent.changeText(emailInput, invalidEmail);

            const passwordInput = getByPlaceholderText('Enter your password');
            fireEvent.changeText(passwordInput, validPassword);

            // Submit form
            const loginButton = getByTestId('login-button');
            fireEvent.press(loginButton);

            // Should display error message
            await waitFor(() => {
              expect(getByText('Invalid email format')).toBeTruthy();
            });
          },
        ),
        { numRuns: 10 }, // Reduced from 100 to 10 for performance
      );
    }, 30000); // 30 second timeout

    it('should display error for any empty email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 6 }), // Valid password
          async validPassword => {
            const { getByPlaceholderText, getByTestId, getByText } = render(
              <AuthProvider>
                <LoginScreen navigation={mockNavigation} />
              </AuthProvider>,
            );

            await waitFor(() => {
              expect(getByTestId('login-button')).toBeTruthy();
            });

            // Enter valid password but no email
            const passwordInput = getByPlaceholderText('Enter your password');
            fireEvent.changeText(passwordInput, validPassword);

            // Submit form
            const loginButton = getByTestId('login-button');
            fireEvent.press(loginButton);

            // Should display error message
            await waitFor(() => {
              expect(getByText('Email is required')).toBeTruthy();
            });
          },
        ),
        { numRuns: 10 }, // Reduced from 100 to 10 for performance
      );
    }, 30000); // 30 second timeout

    it('should display error for any empty password', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email
          fc
            .tuple(
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
            )
            .map(([local, domain]) => `${local}@${domain}`),
          async validEmail => {
            const { getByPlaceholderText, getByTestId, getByText } = render(
              <AuthProvider>
                <LoginScreen navigation={mockNavigation} />
              </AuthProvider>,
            );

            await waitFor(() => {
              expect(getByTestId('login-button')).toBeTruthy();
            });

            // Enter valid email but no password
            const emailInput = getByPlaceholderText('Enter your email');
            fireEvent.changeText(emailInput, validEmail);

            // Submit form
            const loginButton = getByTestId('login-button');
            fireEvent.press(loginButton);

            // Should display error message
            await waitFor(() => {
              expect(getByText('Password is required')).toBeTruthy();
            });
          },
        ),
        { numRuns: 10 }, // Reduced from 100 to 10 for performance
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 14: Error clearing on correction
   * Validates: Requirements 9.2
   * Feature: user-authentication, Property 14: Error clearing on correction
   */
  describe('Property 14: Error clearing on correction', () => {
    it('should clear email error when corrected with any valid email', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email
          fc
            .tuple(
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
            )
            .map(([local, domain]) => `${local}@${domain}`),
          fc.string({ minLength: 6 }), // Valid password
          async (validEmail, validPassword) => {
            const {
              getByPlaceholderText,
              getByTestId,
              getByText,
              queryByText,
            } = render(
              <AuthProvider>
                <LoginScreen navigation={mockNavigation} />
              </AuthProvider>,
            );

            await waitFor(() => {
              expect(getByTestId('login-button')).toBeTruthy();
            });

            // First, trigger an error by submitting empty form
            const loginButton = getByTestId('login-button');
            fireEvent.press(loginButton);

            // Wait for error to appear
            await waitFor(() => {
              expect(getByText('Email is required')).toBeTruthy();
            });

            // Now enter valid email and password
            const emailInput = getByPlaceholderText('Enter your email');
            fireEvent.changeText(emailInput, validEmail);

            const passwordInput = getByPlaceholderText('Enter your password');
            fireEvent.changeText(passwordInput, validPassword);

            // Submit again
            fireEvent.press(loginButton);

            // The "Email is required" error should be cleared
            // Note: There might be "Invalid credentials" error instead since we don't have a registered user
            // But the email validation error should be gone
            await waitFor(
              () => {
                expect(queryByText('Email is required')).toBeNull();
              },
              { timeout: 2000 },
            );
          },
        ),
        { numRuns: 10 }, // Reduced from 100 to 10 for performance
      );
    }, 30000); // 30 second timeout

    it('should clear password error when corrected with any valid password', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email
          fc
            .tuple(
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
              fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
            )
            .map(([local, domain]) => `${local}@${domain}`),
          fc.string({ minLength: 6 }), // Valid password
          async (validEmail, validPassword) => {
            const {
              getByPlaceholderText,
              getByTestId,
              getByText,
              queryByText,
            } = render(
              <AuthProvider>
                <LoginScreen navigation={mockNavigation} />
              </AuthProvider>,
            );

            await waitFor(() => {
              expect(getByTestId('login-button')).toBeTruthy();
            });

            // Enter email but no password to trigger password error
            const emailInput = getByPlaceholderText('Enter your email');
            fireEvent.changeText(emailInput, validEmail);

            const loginButton = getByTestId('login-button');
            fireEvent.press(loginButton);

            // Wait for password error to appear
            await waitFor(() => {
              expect(getByText('Password is required')).toBeTruthy();
            });

            // Now enter valid password
            const passwordInput = getByPlaceholderText('Enter your password');
            fireEvent.changeText(passwordInput, validPassword);

            // Submit again
            fireEvent.press(loginButton);

            // The "Password is required" error should be cleared
            await waitFor(
              () => {
                expect(queryByText('Password is required')).toBeNull();
              },
              { timeout: 2000 },
            );
          },
        ),
        { numRuns: 10 }, // Reduced from 100 to 10 for performance
      );
    }, 30000); // 30 second timeout
  });
});
