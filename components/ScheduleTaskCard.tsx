import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { Shipment } from '../services/shipmentsRepo';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  item: Shipment;
  onPress: () => void;
  onPressNavigate?: () => void;
  onPressCall?: () => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const hours24 = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${pad2(minutes)} ${ampm}`;
}

function statusStyles(status: string) {
  // Matches the screenshot vibe: green = completed, blue = pending, orange = break, gray = default.
  switch (status) {
    case 'Completed':
      return {
        accent: '#22C55E',
        pillBg: 'rgba(34, 197, 94, 0.16)',
        pillText: '#22C55E',
      };
    case 'Pending':
      return {
        accent: '#2196F3',
        pillBg: 'rgba(33, 150, 243, 0.16)',
        pillText: '#60A5FA',
      };
    case 'Active':
      return {
        accent: '#22C55E',
        pillBg: 'rgba(34, 197, 94, 0.16)',
        pillText: '#34D399',
      };
    case 'Break':
      return {
        accent: '#F59E0B',
        pillBg: 'rgba(245, 158, 11, 0.18)',
        pillText: '#FBBF24',
      };
    default:
      return {
        accent: '#64748B',
        pillBg: 'rgba(100, 116, 139, 0.18)',
        pillText: '#CBD5E1',
      };
  }
}

export function ScheduleTaskCard({
  item,
  onPress,
  onPressNavigate,
  onPressCall,
}: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const s = statusStyles(item.status);

  const statusText = React.useMemo(() => {
    if (item.status === 'Completed') return t('completed');
    if (item.status === 'Active') return t('active');
    if (item.status === 'Pending') return t('pending');
    if (item.status === 'Break') return t('break');
    return String(item.status);
  }, [item.status, t]);

  const start = formatTime(item.deliveryDate);
  const end = item.endTime ? formatTime(item.endTime) : undefined;

  const timeText = end ? `${start} – ${end}` : start;

  const title =
    item.taskType === 'Break'
      ? item.notes?.trim() || t('break')
      : `${item.taskType} #${item.orderId}`;

  const showCompany =
    !!item.clientCompany &&
    item.clientCompany !== 'Personal' &&
    item.taskType !== 'Break';

  const showLocation =
    !!item.deliveryAddress &&
    item.deliveryAddress !== 'N/A' &&
    item.taskType !== 'Break';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.accent, { backgroundColor: s.accent }]} />

      <View style={styles.topRow}>
        <View style={[styles.pill, { backgroundColor: s.pillBg }]}>
          <Text style={[styles.pillText, { color: s.pillText }]}>
            {statusText}
          </Text>
        </View>

        <Text style={[styles.time, { color: theme.colors.textMuted }]}>
          {timeText}
        </Text>
      </View>

      <Text
        style={[styles.title, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {showCompany ? (
        <View style={styles.metaRow}>
          <Icon
            name="office-building"
            size={14}
            color={theme.colors.textMuted}
          />
          <Text
            style={[styles.metaText, { color: theme.colors.textMuted }]}
            numberOfLines={1}
          >
            {item.clientCompany}
          </Text>
        </View>
      ) : null}

      {showLocation ? (
        <View style={styles.metaRow}>
          <Icon name="map-marker" size={14} color={theme.colors.textMuted} />
          <Text
            style={[styles.metaText, { color: theme.colors.textMuted }]}
            numberOfLines={2}
          >
            {item.deliveryAddress}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onPress}
          style={[styles.btn, { backgroundColor: theme.colors.surface2 }]}
        >
          <Text style={[styles.btnText, { color: theme.colors.text }]}>
            {t('viewDetails')}
          </Text>
        </Pressable>

        {onPressNavigate ? (
          <Pressable
            onPress={onPressNavigate}
            style={[styles.btn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>
              {t('navigate')}
            </Text>
          </Pressable>
        ) : null}

        {onPressCall ? (
          <Pressable
            onPress={onPressCall}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface2 }]}
            accessibilityLabel="call"
          >
            <Icon name="phone" size={16} color={theme.colors.text} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '900',
  },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
