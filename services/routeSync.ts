import { NativeModules, Platform } from 'react-native';

type RouteSyncNative = {
  schedulePeriodic?: () => Promise<void> | void;
  runOnceNow?: () => Promise<void> | void;
};

const RouteSync: RouteSyncNative = (NativeModules as any).RouteSync ?? {};

export async function scheduleRouteSync() {
  if (Platform.OS !== 'android') return;
  try {
    await RouteSync.schedulePeriodic?.();
  } catch {}
}

export async function runRouteSyncNow() {
  if (Platform.OS !== 'android') return;
  try {
    await RouteSync.runOnceNow?.();
  } catch {}
}
