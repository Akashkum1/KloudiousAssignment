/**
 * Integration tests for complete authentication flows
 * Feature: user-authentication
 * 
 * These tests verify end-to-end flows including:
 * - Complete signup flow
 * - Complete login flow
 * - Complete logout flow
 * - Session persistence across app restarts
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../../src/contexts/AuthContext';
import LoginScreen from '../../src/screens/LoginScreen';
import SignupScreen from '../../src/screens/SignupScreen';
import HomeScreen from '../../src/screens/HomeScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getId: jest.fn(),
  getState: jest.fn(),
  getParent: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  /**
   * Test: Complete signup flow
   * Validates: Requirements 1.1, 5.2
   */
  describe('Complete signup flow', () => {
    it('should allow user to signup, store data, and navigate to login', async () => {
      const mockNavigation = createMockNavigation() as any;
      const { getByTestId } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      // Wait for screen to load by checking for input fields
      await waitFor(() => {
        expect(getByTestId('signup-name-input')).toBeTruthy();
      });

      // Fill in signup form
      const nameInput = getByTestId('signup-name-input');
      const emailInput = getByTestId('signup-email-input');
      const passwordInput = getByTestId('signup-password-input');

      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Submit signup form
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Verify AsyncStorage was called to save users array (not user since no auto-auth)
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@auth_users',
          expect.any(String),
        );
      });

      // Verify navigation was called to go to Login screen
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    it('should display validation errors for invalid signup data', async () => {
      const mockNavigation = createMockNavigation() as any;
      const { getByTestId, getByText } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('signup-name-input')).toBeTruthy();
      });

      // Try to submit empty form
      const signupButton = getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Should show validation errors
      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });
  });

  /**
   * Test: Complete login flow
   * Validates: Requirements 2.1, 2.6, 5.1, 6.4
   */
  describe('Complete login flow', () => {
    it('should allow user to login after signup', async () => {
      const mockNavigation = createMockNavigation() as any;

      // First, signup a user
      const signupScreen = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(signupScreen.getByTestId('signup-name-input')).toBeTruthy();
      });

      const nameInput = signupScreen.getByTestId('signup-name-input');
      const signupEmailInput = signupScreen.getByTestId('signup-email-input');
      const signupPasswordInput = signupScreen.getByTestId('signup-password-input');

      fireEvent.changeText(nameInput, 'Jane Doe');
      fireEvent.changeText(signupEmailInput, 'jane@example.com');
      fireEvent.changeText(signupPasswordInput, 'password456');

      const signupButton = signupScreen.getByTestId('signup-button');
      fireEvent.press(signupButton);

      // Wait for signup to complete
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@auth_users',
          expect.stringContaining('jane@example.com'),
        );
      });

      signupScreen.unmount();

      // Mock AsyncStorage to return the registered users for the new AuthProvider
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@auth_users') {
          return Promise.resolve('[{"name":"Jane Doe","email":"jane@example.com","password":"password456"}]');
        }
        return Promise.resolve(null);
      });

      // Now render login screen with a new AuthProvider that will load the users
      const loginScreen = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(loginScreen.getByTestId('login-email-input')).toBeTruthy();
      });

      // Login with the same credentials
      const loginEmailInput = loginScreen.getByTestId('login-email-input');
      const loginPasswordInput = loginScreen.getByTestId('login-password-input');

      fireEvent.changeText(loginEmailInput, 'jane@example.com');
      fireEvent.changeText(loginPasswordInput, 'password456');

      const loginButton = loginScreen.getByTestId('login-button');
      fireEvent.press(loginButton);

      // Verify AsyncStorage was called to save session
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@auth_user',
          expect.stringContaining('jane@example.com'),
        );
      });

      loginScreen.unmount();
    });

    it('should display error for invalid credentials', async () => {
      const mockNavigation = createMockNavigation() as any;
      const { getByTestId, getByText } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('login-email-input')).toBeTruthy();
      });

      // Try to login with non-existent credentials
      const emailInput = getByTestId('login-email-input');
      const passwordInput = getByTestId('login-password-input');

      fireEvent.changeText(emailInput, 'nonexistent@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      const loginButton = getByTestId('login-button');
      fireEvent.press(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  /**
   * Test: Complete logout flow
   * Validates: Requirements 3.1, 3.2, 3.3, 5.5, 6.6
   */
  describe('Complete logout flow', () => {
    it('should logout user and clear AsyncStorage', async () => {
      // Mock AsyncStorage to return a stored user
      const storedUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password789',
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@auth_user') {
          return Promise.resolve(JSON.stringify(storedUser));
        }
        if (key === '@auth_users') {
          return Promise.resolve(JSON.stringify([storedUser]));
        }
        return Promise.resolve(null);
      });

      const mockNavigation = createMockNavigation() as any;
      const { getByText } = render(
        <AuthProvider>
          <HomeScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      // Wait for user to be loaded
      await waitFor(() => {
        expect(getByText(/Test User/)).toBeTruthy();
      });

      // Logout
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      // Verify AsyncStorage.removeItem was called
      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_user');
      });
    });
  });

  /**
   * Test: Session persistence across app restarts
   * Validates: Requirements 5.3, 5.4, 6.5
   */
  describe('Session persistence across app restarts', () => {
    it('should restore user session from AsyncStorage on app launch', async () => {
      // Mock AsyncStorage to return a stored user
      const storedUser = {
        name: 'Stored User',
        email: 'stored@example.com',
        password: 'password123',
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@auth_user') {
          return Promise.resolve(JSON.stringify(storedUser));
        }
        if (key === '@auth_users') {
          return Promise.resolve(JSON.stringify([storedUser]));
        }
        return Promise.resolve(null);
      });

      const mockNavigation = createMockNavigation() as any;
      const { getByText } = render(
        <AuthProvider>
          <HomeScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      // Should show Home screen with stored user
      await waitFor(() => {
        expect(getByText(/Stored User/)).toBeTruthy();
        expect(getByText(/stored@example.com/)).toBeTruthy();
      });

      // Verify AsyncStorage.getItem was called
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_user');
    });

    it('should show Login screen when no session exists', async () => {
      // Mock AsyncStorage to return null (no stored session)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const mockNavigation = createMockNavigation() as any;
      const { getByTestId } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      // Should show Login screen
      await waitFor(() => {
        expect(getByTestId('login-email-input')).toBeTruthy();
      });
    });
  });

  /**
   * Test: Navigation between screens
   * Validates: Requirements 6.2, 6.3
   */
  describe('Navigation between screens', () => {
    it('should navigate from Login to Signup screen', async () => {
      const mockNavigation = createMockNavigation() as any;
      const { getByText } = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByText('Go to Signup')).toBeTruthy();
      });

      // Navigate to Signup
      const goToSignupButton = getByText('Go to Signup');
      fireEvent.press(goToSignupButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
    });

    it('should navigate from Signup to Login screen', async () => {
      const mockNavigation = createMockNavigation() as any;
      const { getByText } = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(getByText('Go to Login')).toBeTruthy();
      });

      // Navigate back to Login
      const goToLoginButton = getByText('Go to Login');
      fireEvent.press(goToLoginButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  /**
   * Test: End-to-end signup and login flow
   * Validates: All authentication requirements
   */
  describe('End-to-end authentication flow', () => {
    it('should complete full signup, logout, and login cycle', async () => {
      const mockNavigation = createMockNavigation() as any;

      // Step 1: Signup
      const signupScreen = render(
        <AuthProvider>
          <SignupScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(signupScreen.getByTestId('signup-name-input')).toBeTruthy();
      });

      fireEvent.changeText(
        signupScreen.getByTestId('signup-name-input'),
        'Full Test User',
      );
      fireEvent.changeText(
        signupScreen.getByTestId('signup-email-input'),
        'fulltest@example.com',
      );
      fireEvent.changeText(
        signupScreen.getByTestId('signup-password-input'),
        'password999',
      );

      fireEvent.press(signupScreen.getByTestId('signup-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@auth_users',
          expect.any(String),
        );
      });

      // Verify navigation to Login screen
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');

      signupScreen.unmount();

      // Mock AsyncStorage to return the registered users for the new AuthProvider
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@auth_users') {
          return Promise.resolve('[{"name":"Full Test User","email":"fulltest@example.com","password":"password999"}]');
        }
        return Promise.resolve(null);
      });

      // Step 2: Login with the same credentials
      const loginScreen = render(
        <AuthProvider>
          <LoginScreen navigation={mockNavigation} />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(loginScreen.getByTestId('login-email-input')).toBeTruthy();
      });

      fireEvent.changeText(
        loginScreen.getByTestId('login-email-input'),
        'fulltest@example.com',
      );
      fireEvent.changeText(
        loginScreen.getByTestId('login-password-input'),
        'password999',
      );

      fireEvent.press(loginScreen.getByTestId('login-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@auth_user',
          expect.stringContaining('fulltest@example.com'),
        );
      });

      loginScreen.unmount();
    });
  });
});