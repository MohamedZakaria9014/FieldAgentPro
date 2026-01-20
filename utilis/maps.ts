import { Linking, Platform } from 'react-native';

export async function openMapsDirections(
  lat: number,
  lng: number,
  label?: string,
) {
  const destination = `${lat},${lng}`;

  const url = Platform.select({
    ios: `maps:0,0?q=${encodeURIComponent(
      label ?? destination,
    )}@${destination}`,
    android: `google.navigation:q=${destination}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  });

  if (!url) return;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) return Linking.openURL(url);

  return Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  );
}
