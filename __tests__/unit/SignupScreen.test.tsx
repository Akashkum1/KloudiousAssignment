/**
 * Unit tests for SignupScreen
 * Feature: user-authentication
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../../src/screens/SignupScreen';
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

describe('SignupScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Screen renders all required fields
   * Validates: Requirements 1.1
   */
  describe('Screen renders all required fields', () => {
    it('should render name input, email input, password input, signup button, and login navigation button', async () => {
      const { getByPlaceholderText, getByText, getAllByText, getByTestId } =
        render(
          <AuthProvider>
            <SignupScreen navigation={mockNavigation} />
          </AuthProvider>,
        );

      // Wait for loading to complete
      await waitFor(() => {
        expect(getAllByText('Sign Up').length).toBeGreaterThan(0);
      });

      // Check for name input
      expect(getByPlaceholderText('Enter your name')).toBeTruthy();

      // Check for email input
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();

      // Check for password input
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();

      // Check for Signup button
      expect(getByTestId('signup-button')).toBeTruthy();

      // Check for "Go to Login" button
      expect(getByText('Go to Login')).toBeTruthy();
    });
  });

  /**
   * Test: "Go to Login" navigation
   * Validates: Requirements 6.3
   */
  describe('"Go to Login" navigation', () => {
    it('should navigate to Login screen when "Go to Login" button is pressed', async () => {
      const { getByText } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByText('Go to Login')).toBeTruthy();
      });

      const loginButton = getByText('Go to Login');
      fireEvent.press(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  /**
   * Test: Error messages display correctly
   * Validates: Requirements 1.1, 6.3
   */
  describe('Error messages display correctly', () => {
    it('should display error message for empty name', async () => {
      const { getByText, getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-button')).toBeTruthy();
      });

      // Press signup button without entering name
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });

    it('should display error message for empty email', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-button')).toBeTruthy();
      });

      // Enter name but not email
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'John Doe');

      // Press signup button
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should display error message for empty password', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-button')).toBeTruthy();
      });

      // Enter name and email but not password
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'John Doe');

      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      // Press signup button
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should display error message for invalid email format', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-button')).toBeTruthy();
      });

      // Enter name
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'John Doe');

      // Enter invalid email
      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'invalid-email');

      // Enter password
      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');

      // Press signup button
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Check for error message
      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    it('should display error message for short password', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-button')).toBeTruthy();
      });

      // Enter name
      const nameInput = getByPlaceholderText('Enter your name');
      fireEvent.changeText(nameInput, 'John Doe');

      // Enter email
      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      // Enter short password (less than 6 characters)
      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, '12345');

      // Press signup button
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Check for error message
      await waitFor(() => {
        expect(
          getByText('Password must be at least 6 characters'),
        ).toBeTruthy();
      });
    });
  });

  /**
   * Test: Password visibility toggle
   * Validates: Requirements 8.2, 8.3
   */
  describe('Password visibility toggle', () => {
    it('should toggle password visibility when eye icon is pressed', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
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
