import { Linking } from 'react-native';

export async function callPhone(phone?: string | null) {
  if (!phone) return;
  const url = `tel:${phone}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
}
