import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, AuthContextType } from '../types/auth';
import {
  saveUser,
  getUser,
  removeUser,
  saveUsers,
  getUsers,
} from '../services/storage';
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from '../utils/validation';

/**
 * Create the AuthContext with undefined as default value
 * This ensures that useAuth will throw an error if used outside of AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the AuthContext
 * Throws an error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication functionality
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Load stored authentication data from AsyncStorage on component mount
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedUser = await getUser();
      const storedUsers = await getUsers();

      if (storedUser) {
        setUser(storedUser);
      }

      setUsers(storedUsers);
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stored auth on component mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Signup function to register a new user
   */
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    // Validate all required fields
    if (!validateRequired(name)) {
      throw new Error('Name is required');
    }

    if (!validateRequired(email)) {
      throw new Error('Email is required');
    }

    if (!validateRequired(password)) {
      throw new Error('Password is required');
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser: User = { name, email, password };

    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // Save to AsyncStorage (but don't authenticate the user)
    try {
      await saveUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  };

  /**
   * Login function to authenticate an existing user
   */
  const login = async (email: string, password: string): Promise<void> => {
    // Validate required fields
    if (!validateRequired(email)) {
      throw new Error('Email is required');
    }

    if (!validateRequired(password)) {
      throw new Error('Password is required');
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Find user by email
    const foundUser = users.find(u => u.email === email);

    // Verify user exists and password matches
    if (!foundUser || foundUser.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Set user as authenticated
    setUser(foundUser);

    // Save to AsyncStorage
    try {
      await saveUser(foundUser);
    } catch (error) {
      console.error('Error saving user session:', error);
      throw new Error('Failed to save session');
    }
  };

  /**
   * Logout function to clear user session
   */
  const logout = async (): Promise<void> => {
    // Clear user state
    setUser(null);

    // Remove user from AsyncStorage
    try {
      await removeUser();
    } catch (error) {
      console.error('Error removing user session:', error);
      throw new Error('Failed to clear session');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
