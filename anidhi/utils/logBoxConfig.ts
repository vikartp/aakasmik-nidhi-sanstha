import { LogBox } from 'react-native';

// Suppress specific deprecation warnings that are known issues in Expo/React Native
// These warnings come from third-party libraries and don't affect app functionality
LogBox.ignoreLogs([
  // React Native deprecation warnings
  /.*"shadow.*" style props are deprecated. Use "boxShadow".*/,
  /.*props\.pointerEvents is deprecated. Use style\.pointerEvents.*/,
  
  // Additional common Expo warnings you might encounter
  /.*Sending `onAnimatedValueUpdate` with no listeners registered.*/,
  /.*Non-serializable values were found in the navigation state.*/,
]);

// If you want to see all warnings except these specific ones, you can also use:
// LogBox.ignoreAllLogs(false); // Enable all logs except the ones we're ignoring above

export default LogBox;
