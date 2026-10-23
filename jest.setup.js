// Runs before every Jest test file.
// AsyncStorage needs a native module, so tests use the official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
