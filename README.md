# Fashion Recommendation App

A modern React Native mobile application built with Expo that provides personalized fashion recommendations through an intuitive swipe-based interface and AI-powered suggestions.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration system with token-based authentication
- **Swipe Interface**: Tinder-like card swiping to rate fashion items (like/dislike)
- **Smart Recommendations**: AI-powered personalized fashion recommendations based on user preferences
- **Advanced Filtering**: Dynamic filter system for gender, category, color, season, and more
- **Product Details**: Detailed product information with high-quality images
- **Responsive Design**: Optimized for both iOS and Android devices

### User Experience
- **Dark Theme**: Modern dark UI with elegant gradients and smooth animations
- **Gesture Support**: Intuitive swipe gestures with haptic feedback
- **Pull-to-Refresh**: Easy content refresh functionality
- **Loading States**: Smooth loading indicators and error handling
- **Offline Support**: Robust error handling and retry mechanisms

## 🛠 Tech Stack

### Frontend
- **React Native** (0.79.6) - Cross-platform mobile development
- **Expo** (~53.0.22) - Development platform and tools
- **TypeScript** (~5.8.3) - Type-safe JavaScript
- **React Navigation** (v7) - Navigation library
- **Zustand** (^5.0.8) - State management
- **React Native Deck Swiper** (^2.0.19) - Card swiping functionality

### Key Dependencies
- **Axios** (^1.11.0) - HTTP client for API calls
- **AsyncStorage** (2.1.2) - Local data persistence
- **React Native Reanimated** (~3.17.4) - Smooth animations
- **React Native Gesture Handler** (~2.24.0) - Touch gesture handling
- **Expo Secure Store** (~14.2.4) - Secure credential storage

## 📱 Screens

### Authentication
- **Login Screen**: Email/password authentication with form validation
- **Register Screen**: New user registration with secure password handling

### Main Application
- **Swipe Screen**: Interactive card swiping interface for rating products
- **Recommendations Screen**: Personalized fashion recommendations in a scrollable list
- **Product Detail Screen**: Detailed product information and specifications

## 🏗 Project Structure

```
src/
├── api/                    # API client configurations
├── components/             # Reusable UI components
│   ├── FilterBar.tsx      # Product filtering interface
│   ├── FilterControls.tsx # Filter selection controls
│   ├── ProductCard.tsx    # Product display component
│   └── Select.tsx         # Custom select component
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── data/                  # Static data and configurations
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
├── screens/               # Application screens
├── services/              # API service functions
├── store/                 # State management (Zustand)
├── theme/                 # Theme and styling
├── types.ts              # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-reco
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in terminal

### Available Scripts

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Lint code
npm run lint

# Reset project (removes example code)
npm run reset-project
```

## 🔧 Configuration

### Environment Setup
The app requires backend API endpoints for:
- User authentication (`/auth/login`, `/auth/register`)
- Product data (`/products/swipe-cards`)
- Recommendations (`/recommendations`)
- Product ratings (`/products/rate`)

### API Configuration
Update API endpoints in `src/api/clients.ts` and `src/services/api.ts` to match your backend configuration.

## 🎨 Customization

### Theme
Modify colors and styling in `src/theme/colors.ts` to customize the app's appearance.

### Filters
Add or modify filter options in `src/data/staticFilters.ts` to customize product filtering categories.

## 📱 Platform Support

- **iOS**: 11.0+
- **Android**: API level 21+ (Android 5.0)
- **Web**: Modern browsers with ES6 support

## 🔒 Security Features

- Secure token storage using Expo Secure Store
- Input validation and sanitization
- Error handling and user feedback
- Network request timeout and retry logic

## 🚀 Deployment

### Building for Production

1. **Configure app.json** with your app details
2. **Build for iOS**
   ```bash
   npx expo build:ios
   ```
3. **Build for Android**
   ```bash
   npx expo build:android
   ```

### App Store Submission
- Follow platform-specific guidelines for iOS App Store and Google Play Store
- Ensure all required permissions and metadata are configured
- Test thoroughly on physical devices before submission

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [Expo documentation](https://docs.expo.dev/)
- Join the [Expo Discord community](https://chat.expo.dev/)

## 🔮 Future Enhancements

- [ ] Social features (sharing, following)
- [ ] Wishlist functionality
- [ ] Push notifications
- [ ] AR try-on features
- [ ] Advanced recommendation algorithms
- [ ] Multi-language support
- [ ] Accessibility improvements
