import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveUser,
  getUser,
  removeUser,
  saveUsers,
  getUsers,
} from '../../src/services/storage';
import { User } from '../../src/types/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUser and getUser', () => {
    it('should save and retrieve a user (round-trip)', async () => {
      const testUser: User = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock setItem to store the value
      const storage: { [key: string]: string } = {};
      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        async (key: string, value: string) => {
          storage[key] = value;
        },
      );

      // Mock getItem to retrieve the value
      (AsyncStorage.getItem as jest.Mock).mockImplementation(
        async (key: string) => {
          return storage[key] || null;
        },
      );

      // Save user
      await saveUser(testUser);

      // Retrieve user
      const retrievedUser = await getUser();

      // Verify round-trip
      expect(retrievedUser).toEqual(testUser);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@auth_user',
        JSON.stringify(testUser),
      );
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_user');
    });

    it('should return null when no user is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const user = await getUser();

      expect(user).toBeNull();
    });
  });

  describe('removeUser', () => {
    it('should clear user data from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await removeUser();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_user');
    });
  });

  describe('saveUsers and getUsers', () => {
    it('should save and retrieve users array (round-trip)', async () => {
      const testUsers: User[] = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password456',
        },
      ];

      // Mock setItem to store the value
      const storage: { [key: string]: string } = {};
      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        async (key: string, value: string) => {
          storage[key] = value;
        },
      );

      // Mock getItem to retrieve the value
      (AsyncStorage.getItem as jest.Mock).mockImplementation(
        async (key: string) => {
          return storage[key] || null;
        },
      );

      // Save users
      await saveUsers(testUsers);

      // Retrieve users
      const retrievedUsers = await getUsers();

      // Verify round-trip
      expect(retrievedUsers).toEqual(testUsers);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@auth_users',
        JSON.stringify(testUsers),
      );
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@auth_users');
    });

    it('should return empty array when no users are stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const users = await getUsers();

      expect(users).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle saveUser storage failures', async () => {
      const testUser: User = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(saveUser(testUser)).rejects.toThrow('Storage error');
    });

    it('should handle getUser storage failures', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      // getUser should return null gracefully when storage fails
      const result = await getUser();
      expect(result).toBeNull();
    });

    it('should handle removeUser storage failures', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      await expect(removeUser()).rejects.toThrow('Storage error');
    });

    it('should handle saveUsers storage failures', async () => {
      const testUsers: User[] = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      ];

      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(saveUsers(testUsers)).rejects.toThrow('Storage error');
    });

    it('should handle getUsers storage failures', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      // getUsers should return empty array gracefully when storage fails
      const result = await getUsers();
      expect(result).toEqual([]);
    });
  });
});
