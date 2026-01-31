# React Native Authentication App

A complete React Native authentication system with signup, login, logout functionality, and comprehensive testing suite including property-based testing.

## 🚀 Features

- **User Registration**: Secure signup with form validation
- **User Authentication**: Login with email and password
- **Session Management**: Persistent authentication using AsyncStorage
- **Form Validation**: Real-time validation with error handling
- **Password Visibility Toggle**: Show/hide password functionality
- **Responsive UI**: Clean, modern interface with proper keyboard handling
- **Navigation**: Stack-based navigation with authentication flow
- **Comprehensive Testing**: Unit tests, integration tests, and property-based tests

## 📱 Demo

### 🎥 Video Walkthrough

Watch the complete authentication flow in action:

[Watch demo video]([https://example.com/demo.mp4](https://github.com/Akashkum1/KloudiousAssignment/raw/main/src/assets/demo.mp4)

*The video demonstrates:*
- User signup process with form validation
- Login functionality with error handling
- Home screen with user information display
- Logout functionality
- Session persistence across app restarts

The app includes three main screens:
- **Login Screen**: Email and password authentication
- **Signup Screen**: User registration with name, email, and password
- **Home Screen**: Welcome screen displaying user information with logout option

## 🛠 Tech Stack

- **React Native**: 0.83.1
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation management
- **AsyncStorage**: Local data persistence
- **React Context**: State management
- **Jest**: Testing framework
- **React Native Testing Library**: Component testing
- **fast-check**: Property-based testing

## 📋 Prerequisites

- Node.js >= 20
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akashkum1/KloudiousAssignment.git
   cd KloudiousAssignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (if developing for iOS)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run the app**
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```

## 🏗 Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context and logic
├── navigation/
│   └── AppNavigator.tsx         # Navigation configuration
├── screens/
│   ├── LoginScreen.tsx          # Login interface
│   ├── SignupScreen.tsx         # Registration interface
│   └── HomeScreen.tsx           # Authenticated user home
├── services/
│   └── storage.ts               # AsyncStorage utilities
├── types/
│   └── auth.ts                  # TypeScript type definitions
└── utils/
    └── validation.ts            # Form validation utilities

__tests__/
├── unit/                        # Unit tests
├── integration/                 # Integration tests
└── properties/                  # Property-based tests
```

## 🔐 Authentication Flow

### Signup Process
1. User enters name, email, and password
2. Form validation checks for:
   - Required fields
   - Valid email format
   - Password minimum length (6 characters)
   - Email uniqueness
3. User data is stored locally
4. User is redirected to login screen (not auto-authenticated)

### Login Process
1. User enters email and password
2. Credentials are validated against stored users
3. On success, user session is created and stored
4. User is navigated to home screen

### Session Management
- User sessions persist across app restarts
- Logout clears session data
- Authentication state is managed globally via React Context

## 🧪 Testing

The project includes a comprehensive testing suite with three types of tests:

### Unit Tests
Test individual components and functions in isolation.

```bash
npm test -- __tests__/unit/
```

### Integration Tests
Test complete user flows and component interactions.

```bash
npm test -- __tests__/integration/
```

### Property-Based Tests
Test system properties across many generated inputs using fast-check.

```bash
npm test -- __tests__/properties/
```

### Run All Tests
```bash
npm test
```

### Test Coverage
The test suite covers:
- Authentication logic (signup, login, logout)
- Form validation
- Navigation flows
- Error handling
- Session persistence
- UI component behavior

## 📝 API Reference

### AuthContext

The `AuthContext` provides the following methods:

#### `signup(name: string, email: string, password: string): Promise<void>`
Registers a new user with validation.

**Throws:**
- "Name is required"
- "Email is required" 
- "Password is required"
- "Invalid email format"
- "Password must be at least 6 characters"
- "Email already registered"

#### `login(email: string, password: string): Promise<void>`
Authenticates an existing user.

**Throws:**
- "Email is required"
- "Password is required"
- "Invalid email format"
- "Invalid credentials"

#### `logout(): Promise<void>`
Clears the current user session.

#### Properties
- `user: User | null` - Current authenticated user
- `isLoading: boolean` - Loading state during initialization

### Validation Utils

#### `validateEmail(email: string): boolean`
Validates email format using regex pattern.

#### `validatePassword(password: string): boolean`
Validates password length (minimum 6 characters).

#### `validateRequired(value: string): boolean`
Validates that a field is not empty.

## 🎨 Styling

The app uses a consistent design system with:
- **Primary Color**: #007AFF (iOS blue)
- **Error Color**: #ff3b30 (iOS red)
- **Background**: #fff (white)
- **Text**: #333 (dark gray)
- **Borders**: #ddd (light gray)

## 🔍 Key Implementation Details

### Form Validation
- Real-time validation with error display
- Comprehensive error handling for all edge cases
- User-friendly error messages

### Password Security
- Secure text entry with visibility toggle
- Password requirements clearly communicated
- No password storage in plain text (demo purposes only)

### Navigation
- Stack-based navigation with proper typing
- Authentication-aware routing
- Smooth transitions between screens

### State Management
- React Context for global authentication state
- Local component state for form handling
- Persistent storage with AsyncStorage

## 🚨 Security Considerations

**Note**: This is a demo application. In production:
- Passwords should be hashed before storage
- Use secure authentication services (Firebase Auth, Auth0, etc.)
- Implement proper token-based authentication
- Add rate limiting and other security measures
- Use HTTPS for all network requests

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Test failures**
   ```bash
   npm test -- --clearCache
   ```

## 📄 Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
