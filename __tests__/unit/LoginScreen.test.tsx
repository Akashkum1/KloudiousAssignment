/**
 * Unit tests for LoginScreen
 * Feature: user-authentication
 */

import React from 'react';
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

describe('LoginScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Screen renders all required fields
   * Validates: Requirements 2.1
   */
  describe('Screen renders all required fields', () => {
    it('should render email input, password input, login button, and signup navigation button', async () => {
      const { getByPlaceholderText, getByText, getAllByText, getByTestId } =
        render(
          <AuthProvider>
            <LoginScreen navigation={mockNavigation} />
          </AuthProvider>,
        );

      // Wait for loading to complete
      await waitFor(() => {
        expect(getAllByText('Login').length).toBeGreaterThan(0);
      });

      // Check for email input
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();

      // Check for password input
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();

      // Check for Login button
      expect(getByTestId('login-button')).toBeTruthy();

      // Check for "Go to Signup" button
      expect(getByText('Go to Signup')).toBeTruthy();
    });
  });

  /**
   * Test: "Go to Signup" navigation
   * Validates: Requirements 6.2
   */
  describe('"Go to Signup" navigation', () => {
    it('should navigate to Signup screen when "Go to Signup" button is pressed', async () => {
      const { getByText } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByText('Go to Signup')).toBeTruthy();
      });

      const signupButton = getByText('Go to Signup');
      fireEvent.press(signupButton);

      expect(mockNavigate).toHaveBeenCalledWith('Signup');
    });
  });

  /**
   * Test: Error messages display correctly
   * Validates: Requirements 2.1, 6.2
   */
  describe('Error messages display correctly', () => {
    it('should display error message for empty email', async () => {
      const { getByText, getByTestId } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('login-button')).toBeTruthy();
      });

      // Press login button without entering email
      const loginButton = getByTestId('login-button');
      fireEvent.press(loginButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should display error message for empty password', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('login-button')).toBeTruthy();
      });

      // Enter email but not password
      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      // Press login button
      const loginButton = getByTestId('login-button');
      fireEvent.press(loginButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should display error message for invalid email format', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('login-button')).toBeTruthy();
      });

      // Enter invalid email
      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'invalid-email');

      // Enter password
      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');

      // Press login button
      const loginButton = getByTestId('login-button');
      fireEvent.press(loginButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });
  });

  /**
   * Test: Password visibility toggle
   * Validates: Requirements 8.1, 8.3
   */
  describe('Password visibility toggle', () => {
    it('should toggle password visibility when eye icon is pressed', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      });

      const passwordInput = getByPlaceholderText('Enter your password');

      // Initially password should be hidden (secureTextEntry = true)
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Find and press the eye icon
      // The eye icon is rendered as a Text component with emoji
      const eyeIcons = getByText(/👁️/);
      fireEvent.press(eyeIcons);

      // Password should now be visible (secureTextEntry = false)
      await waitFor(() => {
        expect(passwordInput.props.secureTextEntry).toBe(false);
      });

      // Press again to hide
      fireEvent.press(eyeIcons);

      // Password should be hidden again
      await waitFor(() => {
        expect(passwordInput.props.secureTextEntry).toBe(true);
      });
    });
  });
});
