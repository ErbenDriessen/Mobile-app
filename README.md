# GeoFoto - Defect Registration App 📱

A mobile application built with Expo/React Native for registering and managing defects with photos and geolocation data.

## Features

- 📸 Take photos of defects
- 📍 Automatic location tracking
- 📝 Defect categorization
- 💾 Local storage of defects
- 📧 Email reporting functionality
- 🌓 Light/Dark mode support
- 📱 Responsive design (Portrait/Landscape)

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app on your mobile device (optional)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## Usage

The app consists of two main tabs:

### 1. New Defect Registration
- Enter monteur (technician) name
- Select defect category
- Take a photo
- Add description
- Location is automatically captured
- Save locally or send via email

### 2. Defect Overview
- View all registered defects
- Edit existing defects
- Delete defects
- Send defect reports via email

## Project Structure

```
GeoFoto/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # New defect registration screen
│   │   └── meldingen.tsx   # Defects overview screen
│   └── _layout.tsx         # Root layout configuration
├── components/
│   ├── MeldingBewerken.tsx # Defect editing component
│   └── [other components]
├── types/
│   └── melding.ts          # Type definitions
└── hooks/
    └── useScreenPadding.ts # Custom hooks
```
 
## Technologies Used

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker)
- [Expo Mail Composer](https://docs.expo.dev/versions/latest/sdk/mail-composer)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage)

## Development

To start developing:

1. Run the development server:
```bash
npx expo start
```

2. Choose your preferred development environment:
- Press 'i' for iOS simulator
- Press 'a' for Android emulator
- Scan QR code with Expo Go app for physical device testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Erben Driessen - [erben.driessen@student.aventus.nl]

