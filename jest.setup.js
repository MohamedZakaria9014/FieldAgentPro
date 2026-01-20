import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require('react-native-reanimated/mock');
  // Work around missing `call` for some versions.
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@gorhom/bottom-sheet', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  return {
    BottomSheetModalProvider: ({ children }) => children,
    BottomSheetModal: React.forwardRef(() => null),
  };
});

jest.mock('expo-sqlite', () => {
  return {
    openDatabaseSync: () => ({
      execAsync: async () => {},
    }),
  };
});

jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

jest.mock('react-native-screens', () => ({
  enableScreens: () => {},
}));

jest.mock('react-native-restart', () => ({
  Restart: jest.fn(),
}));
