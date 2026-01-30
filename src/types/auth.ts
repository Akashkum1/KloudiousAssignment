/**
 * User interface representing a registered user in the system
 */
export interface User {
  name: string;
  email: string;
  password: string;
}

/**
 * AuthContextType interface defining the shape of the authentication context
 */
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * FormErrors interface for validation error messages
 */
export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}
