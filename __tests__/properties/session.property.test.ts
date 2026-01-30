import * as fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser, getUser } from '../../src/services/storage';
import { User } from '../../src/types/auth';

/**
 * Property-Based Tests for Session Restoration
 * Feature: user-authentication
 */

describe('Session Restoration Properties', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  /**
   * Property 10: Session restoration on app launch
   * Feature: user-authentication, Property 10: Session restoration on app launch
   * Validates: Requirements 5.3, 5.4, 6.5
   *
   * For any valid session data stored in AsyncStorage, when the app initializes,
   * the Auth_System should restore the user session and navigate to the Home screen.
   */
  it('should restore user session from AsyncStorage on app launch', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random valid user data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc
            .string({ minLength: 1, maxLength: 30 })
            .map(s => `${s}@example.com`),
          password: fc.string({ minLength: 6, maxLength: 50 }),
        }),
        async (user: User) => {
          // Store valid session data in AsyncStorage
          await saveUser(user);

          // Simulate app initialization by retrieving stored user
          const restoredUser = await getUser();

          // Verify user session is restored
          expect(restoredUser).not.toBeNull();
          expect(restoredUser?.name).toBe(user.name);
          expect(restoredUser?.email).toBe(user.email);
          expect(restoredUser?.password).toBe(user.password);

          // Clean up
          await AsyncStorage.clear();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional property: Session restoration should handle missing data gracefully
   * Feature: user-authentication, Property 10: Session restoration on app launch
   * Validates: Requirements 5.3, 5.4
   *
   * For any app initialization when no session data exists in AsyncStorage,
   * the Auth_System should return null and show the Login screen.
   */
  it('should return null when no session data exists in AsyncStorage', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Ensure AsyncStorage is empty
        await AsyncStorage.clear();

        // Attempt to retrieve user
        const restoredUser = await getUser();

        // Verify no user is restored
        expect(restoredUser).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Additional property: Session restoration should handle corrupted data gracefully
   * Feature: user-authentication, Property 10: Session restoration on app launch
   * Validates: Requirements 5.3, 5.4
   *
   * For any corrupted session data in AsyncStorage, the Auth_System should
   * handle the error gracefully and return null.
   */
  it('should handle corrupted session data gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random invalid JSON strings
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
          try {
            JSON.parse(s);
            return false; // Valid JSON, skip
          } catch {
            return true; // Invalid JSON, use it
          }
        }),
        async (corruptedData: string) => {
          // Store corrupted data in AsyncStorage
          await AsyncStorage.setItem('@auth_user', corruptedData);

          // Attempt to retrieve user
          const restoredUser = await getUser();

          // Verify no user is restored (graceful failure)
          expect(restoredUser).toBeNull();

          // Clean up
          await AsyncStorage.clear();
        },
      ),
      { numRuns: 100 },
    );
  });
});
