import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { AuthProvider } from '../../src/contexts/AuthContext';
import * as AuthContext from '../../src/contexts/AuthContext';

// Mock the screens
jest.mock('../../src/screens/LoginScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function LoginScreen() {
    return <Text testID="login-screen">Login Screen</Text>;
  };
});

jest.mock('../../src/screens/SignupScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function SignupScreen() {
    return <Text testID="signup-screen">Signup Screen</Text>;
  };
});

jest.mock('../../src/screens/HomeScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function HomeScreen() {
    return <Text testID="home-screen">Home Screen</Text>;
  };
});

describe('AppNavigator', () => {
  it('should display loading indicator while isLoading is true', () => {
    // Mock useAuth to return loading state
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
    });

    render(
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>,
    );

    // Check that loading indicator is displayed
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should display Login screen for unauthenticated users', () => {
    // Mock useAuth to return unauthenticated state
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    });

    render(
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>,
    );

    // Check that Login screen is displayed
    expect(screen.getByTestId('login-screen')).toBeTruthy();
  });

  it('should display Home screen for authenticated users', () => {
    // Mock useAuth to return authenticated state
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    });

    render(
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>,
    );

    // Check that Home screen is displayed
    expect(screen.getByTestId('home-screen')).toBeTruthy();
  });
});
