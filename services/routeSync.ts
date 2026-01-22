import { NativeModules, Platform } from 'react-native';

// Native module interface
type RouteSyncNative = {
  schedulePeriodic?: () => Promise<void> | void;
  runOnceNow?: () => Promise<void> | void;
};

const RouteSync: RouteSyncNative = (NativeModules as any).RouteSync ?? {};

// Schedule periodic route synchronization (Android only)
export async function scheduleRouteSync() {
  if (Platform.OS !== 'android') return;
  try {
    await RouteSync.schedulePeriodic?.();
  } catch {}
}

// Trigger immediate route synchronization (Android only)
export async function runRouteSyncNow() {
  if (Platform.OS !== 'android') return;
  try {
    await RouteSync.runOnceNow?.();
  } catch {}
}
