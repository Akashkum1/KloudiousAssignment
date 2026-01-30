/**
 * Property-based tests for signup functionality
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

describe('Signup Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 1: Valid signup creates user
   * Validates: Requirements 1.1
   * Feature: user-authentication, Property 1: Valid signup creates user
   */
  describe('Property 1: Valid signup creates user', () => {
    it('should create user for any valid user data (without auto-authentication)', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid name (non-empty string with at least one non-whitespace char)
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          // Generate valid email (has @ with chars before and after)
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
          // Generate valid password (>= 6 characters AND has at least one non-whitespace)
          fc
            .string({ minLength: 6 })
            .filter(s => s.length >= 6 && s.trim().length > 0),
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

            // Perform signup
            await act(async () => {
              await result.current.signup(name, email, password);
            });

            // Verify user is NOT auto-authenticated after signup
            expect(result.current.user).toBeNull();

            // Now login with the same credentials
            await act(async () => {
              await result.current.login(email, password);
            });

            // Verify user is authenticated after login
            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.name).toBe(name);
            expect(result.current.user?.email).toBe(email);
            expect(result.current.user?.password).toBe(password);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });

  /**
   * Property 6: Session persistence after authentication
   * Validates: Requirements 5.2
   * Feature: user-authentication, Property 6: Session persistence after authentication
   */
  describe('Property 6: Session persistence after authentication', () => {
    it('should store users data in AsyncStorage after successful signup', async () => {
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
          // Generate valid password (>= 6 characters AND has at least one non-whitespace)
          fc
            .string({ minLength: 6 })
            .filter(s => s.length >= 6 && s.trim().length > 0),
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

            // Perform signup
            await act(async () => {
              await result.current.signup(name, email, password);
            });

            // Verify AsyncStorage.setItem was called to save users array
            const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
            const usersCall = setItemCalls.find(
              (call: any[]) => call[0] === '@auth_users',
            );
            expect(usersCall).toBeDefined();

            // Parse the saved users data and verify it contains the new user
            const savedUsers = JSON.parse(usersCall[1]);
            expect(Array.isArray(savedUsers)).toBe(true);
            const newUser = savedUsers.find((u: any) => u.email === email);
            expect(newUser).toBeDefined();
            expect(newUser.name).toBe(name);
            expect(newUser.password).toBe(password);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // Increase timeout for property tests
  });
});
