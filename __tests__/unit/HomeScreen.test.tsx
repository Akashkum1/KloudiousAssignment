/**
 * Unit tests for HomeScreen
 * Feature: user-authentication
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Create a wrapper component that sets up a user in the auth context
const HomeScreenWithUser = () => {
  const auth = useAuth();

  // Mock a logged-in user
  React.useEffect(() => {
    // Simulate a user being logged in
    // First signup, then login (since signup no longer auto-authenticates)
    const setupUser = async () => {
      try {
        await auth.signup('John Doe', 'john@example.com', 'password123');
      } catch {
        // Ignore errors if user already exists
      }
      // Now login to authenticate
      try {
        await auth.login('john@example.com', 'password123');
      } catch {
        // Ignore login errors
      }
    };
    setupUser();
  }, [auth]);

  return <HomeScreen />;
};

describe('HomeScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Screen displays user name
   * Validates: Requirements 7.1
   */
  describe('Screen displays user name', () => {
    it('should display the user name', async () => {
      const { getByText } = render(
        <AuthProvider>
          <HomeScreenWithUser />
        </AuthProvider>,
      );

      // Wait for the user to be set and the name to appear
      await waitFor(
        () => {
          expect(getByText('John Doe')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });

  /**
   * Test: Screen displays user email
   * Validates: Requirements 7.2
   */
  describe('Screen displays user email', () => {
    it('should display the user email', async () => {
      const { getByText } = render(
        <AuthProvider>
          <HomeScreenWithUser />
        </AuthProvider>,
      );

      // Wait for the user to be set and the email to appear
      await waitFor(
        () => {
          expect(getByText('john@example.com')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });

  /**
   * Test: Logout button exists
   * Validates: Requirements 7.3
   */
  describe('Logout button exists', () => {
    it('should render a logout button', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <HomeScreenWithUser />
        </AuthProvider>,
      );

      // Wait for component to render
      await waitFor(
        () => {
          expect(getByTestId('logout-button')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });
});
