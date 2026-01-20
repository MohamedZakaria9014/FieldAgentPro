import React from 'react';
import {
  Animated,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { Shipment } from '../services/shipmentsRepo';
import { useAppTheme } from '../theme/useAppTheme';
import { callPhone } from '../utilis/phone';
import { openMapsDirections } from '../utilis/maps';

// Local decorative background for the map preview card (no network requests).
// Place the file at: assets/map-preview-bg.png
const MAP_PREVIEW_BG = require('../assets/map-preview-bg.png');

// Pads a number to two digits with leading zero if necessary.
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Formats an ISO date string into a user-friendly time format.
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const hours24 = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${pad2(minutes)} ${ampm}`;
}

// Returns a user-friendly label for the shipment status.
function statusLabel(status: string): string {
  if (status === 'Completed') return 'Completed';
  if (status === 'Break') return 'Break';
  return 'Expected';
}

// Splits an address into two lines for better display.
function splitAddress(address: string): { line1: string; line2?: string } {
  const trimmed = String(address ?? '').trim();
  if (!trimmed) return { line1: '-' };
  const bullet = '•';
  if (trimmed.includes(bullet)) {
    const [a, ...rest] = trimmed.split(bullet);
    const line1 = a.trim();
    const line2 = rest.join(bullet).trim();
    return { line1, line2: line2 || undefined };
  }

  // Fallback: split on first comma
  const parts = trimmed.split(',');
  if (parts.length >= 2) {
    return { line1: parts[0]!.trim(), line2: parts.slice(1).join(',').trim() };
  }
  return { line1: trimmed };
}

type Props = {
  shipment?: Shipment | null;
  visible: boolean;
  onClose: () => void;
};

// ShipmentDetailsSheet component displays detailed information about a shipment in a modal sheet.
export function ShipmentDetailsSheet({ shipment, visible, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();

  const progress = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [progress, visible]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const canNavigate =
    !!shipment && !(shipment.latitude === 0 && shipment.longitude === 0);
  const canCall = !!shipment?.contactPhone;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateY }],
              maxHeight: Math.round(windowHeight * 0.82),
            },
          ]}
        >
          {!shipment ? (
            <View style={styles.content} />
          ) : (
            <View style={styles.content}>
              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                  Task Details
                </Text>
                <Pressable
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.colors.surface2 },
                  ]}
                  accessibilityLabel="close"
                >
                  <Icon name="close" size={16} color={theme.colors.textMuted} />
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.mapCard,
                  {
                    backgroundColor: theme.colors.surface2,
                    opacity: canNavigate ? 1 : 0.6,
                  },
                ]}
                onPress={() => {
                  if (!canNavigate) return;
                  openMapsDirections(
                    shipment.latitude,
                    shipment.longitude,
                    shipment.deliveryAddress,
                  );
                }}
                disabled={!canNavigate}
                accessibilityRole="button"
                accessibilityLabel="map-preview"
              >
                <ImageBackground
                  source={MAP_PREVIEW_BG}
                  style={styles.mapBg}
                  imageStyle={styles.mapBgImage}
                  resizeMode="cover"
                >
                  <View style={styles.mapBgScrim} />

                  {/* Map placeholder */}
                  <View style={styles.mapPlaceholder} pointerEvents="none">
                    <Icon
                      name="map-marker"
                      size={34}
                      color={
                        canNavigate
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.mapPlaceholderTitle,
                        {
                          color: !shipment.deliveryAddress
                            ? theme.colors.textMuted
                            : '#fff',
                        },
                      ]}
                    >
                      Open in Maps
                    </Text>
                    <Text
                      style={[
                        styles.mapPlaceholderSub,
                        {
                          color: !shipment.deliveryAddress
                            ? theme.colors.textMuted
                            : '#fff',
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {canNavigate
                        ? shipment.deliveryAddress
                        : 'No location for this task'}
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>

              {(() => {
                const addr = splitAddress(shipment.deliveryAddress);
                return (
                  <View
                    style={[
                      styles.addressCard,
                      { backgroundColor: theme.colors.surface2 },
                    ]}
                  >
                    <View
                      style={[
                        styles.addressIconWrap,
                        { backgroundColor: theme.colors.surface },
                      ]}
                    >
                      <Icon
                        name="warehouse"
                        size={18}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.addressTextWrap}>
                      <Text
                        style={[
                          styles.addressLine1,
                          { color: theme.colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {addr.line1}
                      </Text>
                      {addr.line2 ? (
                        <Text
                          style={[
                            styles.addressLine2,
                            { color: theme.colors.textMuted },
                          ]}
                          numberOfLines={1}
                        >
                          {addr.line2}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })()}

              <View style={styles.actions}>
                {canNavigate ? (
                  <Pressable
                    style={[
                      styles.pillBtnPrimary,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() =>
                      openMapsDirections(
                        shipment.latitude,
                        shipment.longitude,
                        shipment.deliveryAddress,
                      )
                    }
                  >
                    <Icon name="navigation" size={16} color="#fff" />
                    <Text style={[styles.pillBtnText, { color: '#fff' }]}>
                      Navigate
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.pillBtnDisabled,
                      { backgroundColor: theme.colors.surface2 },
                    ]}
                  >
                    <Icon
                      name="navigation"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.pillBtnText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      Navigate
                    </Text>
                  </View>
                )}

                {canCall ? (
                  <Pressable
                    style={[
                      styles.pillBtnSecondary,
                      { backgroundColor: theme.colors.surface2 },
                    ]}
                    onPress={() => callPhone(shipment.contactPhone)}
                  >
                    <Icon name="phone" size={16} color={theme.colors.text} />
                    <Text
                      style={[styles.pillBtnText, { color: theme.colors.text }]}
                    >
                      Call
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {/* Person row */}
              <View
                style={[
                  styles.personRow,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                {/* Avatar section */}
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.colors.surface2 },
                  ]}
                >
                  <Icon
                    name="account"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </View>

                {/* Middle section with customer name and order ID */}
                <View style={styles.personMid}>
                  <Text
                    style={[styles.personName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {shipment.customerName}
                  </Text>
                  <Text
                    style={[
                      styles.personSub,
                      { color: theme.colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    Recipient • #ORD-{shipment.orderId}
                  </Text>
                </View>

                <View style={styles.personRight}>
                  <Text
                    style={[styles.personTime, { color: theme.colors.text }]}
                  >
                    {formatTime(shipment.deliveryDate)}
                  </Text>
                  <Text
                    style={[
                      styles.personStatus,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {statusLabel(shipment.status)}
                  </Text>
                </View>
              </View>

              {!!shipment.notes?.trim() ? (
                <View
                  style={[
                    styles.notesBox,
                    { backgroundColor: theme.colors.surface2 },
                  ]}
                >
                  <Text
                    style={[
                      styles.notesLabel,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {t('notes')}
                  </Text>
                  <Text
                    style={[styles.notesText, { color: theme.colors.text }]}
                  >
                    {shipment.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    height: 168,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  mapBg: {
    flex: 1,
    justifyContent: 'center',
  },
  mapBgImage: {
    width: '100%',
    height: '100%',
  },
  mapBgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  mapPlaceholderTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  mapPlaceholderSub: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  addressCard: {
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  addressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTextWrap: { flex: 1 },
  addressLine1: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  addressLine2: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pillBtnPrimary: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pillBtnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pillBtnDisabled: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    opacity: 0.7,
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personMid: { flex: 1 },
  personName: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 1,
  },
  personSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  personRight: { alignItems: 'flex-end' },
  personTime: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 1,
  },
  personStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesBox: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
