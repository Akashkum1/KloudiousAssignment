/**
 * Property-based tests for logout functionality
 * Feature: user-authentication
 */

import * as fc from 'fast-check';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Helper function to create wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(AuthProvider, null, children);
};

describe('Logout Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 7: Logout clears session
   * Validates: Requirements 3.1, 3.3, 5.5
   * Feature: user-authentication, Property 7: Logout clears session
   */
  describe('Property 7: Logout clears session', () => {
    it('should clear user session and remove from AsyncStorage for any authenticated user', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid user data
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc
            .tuple(
              fc
                .string({ minLength: 1 })
                .filter(s => !s.includes('@') && s.trim().length > 0),
              fc
                .string({ minLength: 1 })
                .filter(s => !s.includes('@') && s.trim().length > 0),
            )
            .map(([local, domain]) => `${local}@${domain}`),
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          async (name, email, password) => {
            // Reset mocks for each test
            (AsyncStorage.setItem as jest.Mock).mockClear();
            (AsyncStorage.removeItem as jest.Mock).mockClear();
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const wrapper = createWrapper();

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial loading to complete
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Signup to create user (but not authenticate)
            await act(async () => {
              await result.current.signup(name, email, password);
            });

            // Login to authenticate the user
            await act(async () => {
              await result.current.login(email, password);
            });

            // Verify user is authenticated
            expect(result.current.user).not.toBeNull();

            // Perform logout
            await act(async () => {
              await result.current.logout();
            });

            // Verify user state is cleared
            expect(result.current.user).toBeNull();

            // Verify AsyncStorage.removeItem was called
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_user');
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });

  /**
   * Property 8: Logout triggers navigation
   * Validates: Requirements 3.2, 6.6
   * Feature: user-authentication, Property 8: Logout triggers navigation
   *
   * Note: This property tests that logout clears the user state, which will trigger
   * navigation to the Login screen in the actual app. The navigation itself is handled
   * by the navigation layer based on the auth state, not by the logout function directly.
   */
  describe('Property 8: Logout triggers navigation', () => {
    it('should clear user state which triggers navigation to Login screen', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid user data
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc
            .tuple(
              fc
                .string({ minLength: 1 })
                .filter(s => !s.includes('@') && s.trim().length > 0),
              fc
                .string({ minLength: 1 })
                .filter(s => !s.includes('@') && s.trim().length > 0),
            )
            .map(([local, domain]) => `${local}@${domain}`),
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          async (name, email, password) => {
            // Reset mocks for each test
            (AsyncStorage.setItem as jest.Mock).mockClear();
            (AsyncStorage.removeItem as jest.Mock).mockClear();
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const wrapper = createWrapper();

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial loading to complete
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Signup to create user (but not authenticate)
            await act(async () => {
              await result.current.signup(name, email, password);
            });

            // Login to authenticate the user
            await act(async () => {
              await result.current.login(email, password);
            });

            // Verify user is authenticated (would show Home screen)
            expect(result.current.user).not.toBeNull();

            // Perform logout
            await act(async () => {
              await result.current.logout();
            });

            // Verify user state is null (which triggers navigation to Login screen)
            expect(result.current.user).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });
});
