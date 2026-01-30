/**
 * Property-based tests for login functionality
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

describe('Login Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 4: Valid login authenticates user
   * Validates: Requirements 2.1, 6.4
   * Feature: user-authentication, Property 4: Valid login authenticates user
   */
  describe('Property 4: Valid login authenticates user', () => {
    it('should authenticate user for any registered user with correct credentials', async () => {
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
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const wrapper = createWrapper();

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial loading to complete
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // First signup to create the user
            await act(async () => {
              await result.current.signup(name, email, password);
            });

            // Clear the user state to simulate logout
            await act(async () => {
              await result.current.logout();
            });

            // Now login with the same credentials
            await act(async () => {
              await result.current.login(email, password);
            });

            // Verify user is authenticated
            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.email).toBe(email);
            expect(result.current.user?.password).toBe(password);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });

  /**
   * Property 5: Invalid credentials rejected
   * Validates: Requirements 2.5
   * Feature: user-authentication, Property 5: Invalid credentials rejected
   */
  describe('Property 5: Invalid credentials rejected', () => {
    it('should reject login for any credentials that do not match a registered user', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email
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
          // Generate valid password
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          async (email, password) => {
            // Reset mocks for each test
            (AsyncStorage.setItem as jest.Mock).mockClear();
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const wrapper = createWrapper();

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial loading to complete
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Try to login without signing up first
            let error: unknown = null;
            await act(async () => {
              try {
                await result.current.login(email, password);
              } catch (e) {
                error = e;
              }
            });

            // Verify login was rejected with correct error
            expect(error).not.toBeNull();
            expect((error as Error).message).toBe('Invalid credentials');
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });
});
