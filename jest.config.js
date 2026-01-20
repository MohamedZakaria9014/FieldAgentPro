module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-worklets|@gorhom|react-native-calendars|react-native-localize|react-native-screens|react-native-safe-area-context|@reduxjs/toolkit|react-redux|redux|immer)/)',
  ],
};
