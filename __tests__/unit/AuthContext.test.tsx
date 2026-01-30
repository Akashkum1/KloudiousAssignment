/**
 * Unit tests for AuthContext
 * Feature: user-authentication
 */

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

describe('AuthContext Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Context provides all required functions
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  describe('Context provides all required functions', () => {
    it('should provide login, signup, logout functions and user state', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify all required properties exist
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('signup');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isLoading');

      // Verify functions are callable
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.signup).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });

  /**
   * Test: useAuth throws error outside provider
   * Validates: Requirements 4.1
   */
  describe('useAuth throws error outside provider', () => {
    it('should throw error when useAuth is used outside of AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      // Restore console.error
      console.error = originalError;
    });
  });

  /**
   * Test: Context maintains user state structure
   * Validates: Requirements 4.4
   */
  describe('Context maintains user state structure', () => {
    it('should maintain user object with name, email, and password properties after login', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially user should be null
      expect(result.current.user).toBeNull();

      // Signup a user (user should still be null after signup)
      await act(async () => {
        await result.current.signup(
          'John Doe',
          'john@example.com',
          'password123',
        );
      });

      // After signup, user should still be null (not auto-authenticated)
      expect(result.current.user).toBeNull();

      // Now login with the same credentials
      await act(async () => {
        await result.current.login('john@example.com', 'password123');
      });

      // Verify user object has correct structure after login
      expect(result.current.user).not.toBeNull();
      expect(result.current.user).toHaveProperty('name');
      expect(result.current.user).toHaveProperty('email');
      expect(result.current.user).toHaveProperty('password');
      expect(result.current.user?.name).toBe('John Doe');
      expect(result.current.user?.email).toBe('john@example.com');
      expect(result.current.user?.password).toBe('password123');
    });
  });

  /**
   * Test: Initial loading state
   */
  describe('Initial loading state', () => {
    it('should start with isLoading true and then set to false after initialization', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  /**
   * Test: Signup validation errors
   */
  describe('Signup validation errors', () => {
    it('should throw error for empty name', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.signup('', 'test@example.com', 'password123');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Name is required');
    });

    it('should throw error for empty email', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.signup('John Doe', '', 'password123');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Email is required');
    });

    it('should throw error for invalid email format', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.signup(
            'John Doe',
            'invalid-email',
            'password123',
          );
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Invalid email format');
    });

    it('should throw error for short password', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.signup('John Doe', 'test@example.com', '12345');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe(
        'Password must be at least 6 characters',
      );
    });

    it('should throw error for duplicate email', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First signup
      await act(async () => {
        await result.current.signup(
          'John Doe',
          'test@example.com',
          'password123',
        );
      });

      // Try to signup with same email
      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.signup(
            'Jane Doe',
            'test@example.com',
            'password456',
          );
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Email already registered');
    });
  });

  /**
   * Test: Login validation errors
   */
  describe('Login validation errors', () => {
    it('should throw error for empty email', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.login('', 'password123');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Email is required');
    });

    it('should throw error for invalid email format', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.login('invalid-email', 'password123');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Invalid email format');
    });

    it('should throw error for invalid credentials', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let error: unknown = null;
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (e) {
          error = e;
        }
      });

      expect(error).not.toBeNull();
      expect((error as Error).message).toBe('Invalid credentials');
    });
  });
});
