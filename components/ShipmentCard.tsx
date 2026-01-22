import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { Shipment } from '../services/shipmentsRepo';
import { useAppTheme } from '../theme/useAppTheme';
import { useTranslation } from 'react-i18next';

type Props = {
  item: Shipment;
  onPress: () => void;
};

export function ShipmentCard({ item, onPress }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const pill =
    item.status === 'Active'
      ? { text: '#34D399', bg: 'rgba(52, 211, 153, 0.18)' }
      : item.status === 'Pending'
      ? { text: '#A3A3A3', bg: 'rgba(163, 163, 163, 0.18)' }
      : { text: theme.colors.textMuted, bg: 'rgba(255,255,255,0.06)' };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.top}>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {t('task')} #{item.orderId}
        </Text>
        <View
          style={[styles.badge, { backgroundColor: pill.bg }]}
          accessibilityLabel={`status-${item.status}`}
        >
          <Text
            style={[styles.badgeText, { color: pill.text }]}
            numberOfLines={1}
          >
            {t(item.status.toLowerCase())}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Icon name="office-building" size={14} color={theme.colors.textMuted} />
        <Text
          style={[styles.metaText, { color: theme.colors.textMuted }]}
          numberOfLines={1}
        >
          {item.clientCompany}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name="account" size={14} color={theme.colors.textMuted} />
        <Text
          style={[styles.metaText, { color: theme.colors.textMuted }]}
          numberOfLines={1}
        >
          Agent: {item.customerName}
        </Text>
      </View>

      <View style={styles.chevronWrap} pointerEvents="none">
        <Icon
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          size={18}
          color={theme.colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  chevronWrap: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
