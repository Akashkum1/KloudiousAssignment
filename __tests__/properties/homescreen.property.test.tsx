/**
 * Property-based tests for HomeScreen
 * Feature: user-authentication
 */

import * as fc from 'fast-check';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../src/types/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Create a wrapper component that provides a pre-authenticated user
const HomeScreenWithAuthenticatedUser = ({
  user,
}: {
  user: User;
}) => {
  const auth = useAuth();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const setupUser = async () => {
      // Mock AsyncStorage to return the user data
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@auth_user') {
          return Promise.resolve(JSON.stringify(user));
        }
        if (key === '@auth_users') {
          return Promise.resolve(JSON.stringify([user]));
        }
        return Promise.resolve(null);
      });

      // Wait for auth to load the user
      if (!auth.isLoading && auth.user) {
        setIsReady(true);
      }
    };

    setupUser();
  }, [auth, user]);

  // Wait for auth context to load the user from mocked storage
  React.useEffect(() => {
    if (!auth.isLoading && auth.user) {
      setIsReady(true);
    }
  }, [auth.isLoading, auth.user]);

  if (!isReady || !auth.user) {
    return null;
  }

  return <HomeScreen />;
};

describe('HomeScreen Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 11: Home screen displays user information
   * Validates: Requirements 7.1, 7.2
   * Feature: user-authentication, Property 11: Home screen displays user information
   */
  describe('Property 11: Home screen displays user information', () => {
    it('should display both name and email for any authenticated user', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid user data
          fc.record({
            name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            email: fc
              .tuple(
                fc
                  .string({ minLength: 1 })
                  .filter(s => !s.includes('@') && s.trim().length > 0),
                fc
                  .string({ minLength: 1 })
                  .filter(s => !s.includes('@') && s.trim().length > 0),
              )
              .map(([local, domain]) => `${local}@${domain}`),
            password: fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          }),
          async (user: User) => {
            // Reset mocks for each test
            (AsyncStorage.setItem as jest.Mock).mockClear();
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
              if (key === '@auth_user') {
                return Promise.resolve(JSON.stringify(user));
              }
              if (key === '@auth_users') {
                return Promise.resolve(JSON.stringify([user]));
              }
              return Promise.resolve(null);
            });

            const { getByText } = render(
              <AuthProvider>
                <HomeScreenWithAuthenticatedUser user={user} />
              </AuthProvider>,
            );

            // Wait for the user to be loaded and the screen to render
            await waitFor(
              () => {
                // Verify that both name and email are displayed
                expect(getByText(user.name)).toBeTruthy();
                expect(getByText(user.email)).toBeTruthy();
              },
              { timeout: 5000 },
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 60000); // 60 second timeout for property tests with 100 runs
  });
});
