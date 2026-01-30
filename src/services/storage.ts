import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

// Storage keys
const USER_KEY = '@auth_user';
const USERS_KEY = '@auth_users';

/**
 * Save the current authenticated user to AsyncStorage
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(user);
    await AsyncStorage.setItem(USER_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving user to storage:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user from AsyncStorage
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    // Return null for corrupted data instead of throwing
    return null;
  }
};

/**
 * Remove the current authenticated user from AsyncStorage
 */
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user from storage:', error);
    throw error;
  }
};

/**
 * Save the list of all registered users to AsyncStorage
 */
export const saveUsers = async (users: User[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving users to storage:', error);
    throw error;
  }
};

/**
 * Get the list of all registered users from AsyncStorage
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USERS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting users from storage:', error);
    // Return empty array for corrupted data instead of throwing
    return [];
  }
};
