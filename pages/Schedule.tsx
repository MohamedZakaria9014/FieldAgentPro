import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ShipmentDetailsSheet } from '../components/ShipmentDetailsSheet';
import { ScheduleTaskCard } from '../components/ScheduleTaskCard';
import { useAppSelector } from '../redux/hooks';
import type { Shipment } from '../services/shipmentsRepo';
import {
  groupShipmentsByDay,
  isoToYmd,
} from '../services/shipmentsRepoHelpers';
import { useAppTheme } from '../theme/useAppTheme';
import { openMapsDirections } from '../utilis/maps';
import { callPhone } from '../utilis/phone';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatAgendaTitle(ymd: string): string {
  // ymd is YYYY-MM-DD
  const d = new Date(`${ymd}T00:00:00`);
  const month = MONTHS_SHORT[d.getMonth()] ?? '';
  const day = String(d.getDate()).padStart(2, '0');
  const label = `${month} ${day}`.trim();
  return `Agenda for ${label}`;
}

export default function Schedule() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const shipments = useAppSelector(s => s.shipments.items);

  const [selectedShipment, setSelectedShipment] =
    React.useState<Shipment | null>(null);
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  const grouped = React.useMemo(
    () => groupShipmentsByDay(shipments),
    [shipments],
  );

  const today = isoToYmd(new Date().toISOString());
  const preferredInitialDay = React.useMemo(() => {
    if (grouped[today]?.length) return today;
    const days = Object.keys(grouped).sort();
    return days[0] ?? today;
  }, [grouped, today]);

  const [selected, setSelected] = React.useState<string>(today);
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    if (Object.keys(grouped).length === 0) return;
    setSelected(preferredInitialDay);
    didInitRef.current = true;
  }, [grouped, preferredInitialDay]);

  const markedDates = React.useMemo(() => {
    const result: Record<string, any> = {};

    for (const [day, list] of Object.entries(grouped)) {
      const hasActive = list.some(s => s.status === 'Active');
      const hasPending = list.some(s => s.status === 'Pending');

      const dots = [] as Array<{ key: string; color: string }>;
      if (hasActive) dots.push({ key: 'active', color: '#22C55E' });
      if (hasPending) dots.push({ key: 'pending', color: '#9CA3AF' });

      result[day] = {
        marked: dots.length > 0,
        dots,
      };
    }

    result[selected] = {
      ...(result[selected] ?? {}),
      selected: true,
      selectedColor: theme.colors.primary,
    };

    return result;
  }, [grouped, selected, theme.colors.primary]);

  const listForDay: Shipment[] = React.useMemo(() => {
    const list = grouped[selected] ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime(),
    );
  }, [grouped, selected]);

  const onPressItem = (item: Shipment) => {
    setSelectedShipment(item);
    setDetailsVisible(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('schedule')}
        </Text>

        {__DEV__ ? (
          <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>
            Debug: selected #{selectedShipment?.orderId ?? '—'} | sheetIndex{' '}
            {detailsVisible ? 0 : -1}
          </Text>
        ) : null}
      </View>

      <View
        style={[styles.calendarWrap, { backgroundColor: theme.colors.surface }]}
      >
        <Calendar
          current={selected}
          monthFormat={'MMMM yyyy'}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(d: DateData) => setSelected(d.dateString)}
          hideExtraDays
          renderArrow={direction => (
            <Icon
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              size={20}
              color={theme.colors.text}
            />
          )}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            dayTextColor: theme.colors.text,
            monthTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textMuted,
            todayTextColor: theme.colors.primary,
            textSectionTitleColor: theme.colors.textMuted,
            textMonthFontWeight: '900',
            textMonthFontSize: 14,
            textDayFontWeight: '700',
            textDayHeaderFontWeight: '800',
            textDayFontSize: 12,
            textDayHeaderFontSize: 11,
          }}
        />
      </View>

      <View style={styles.agenda}>
        <View style={styles.agendaHeader}>
          <Text style={[styles.agendaTitle, { color: theme.colors.text }]}>
            {formatAgendaTitle(selected)}
          </Text>

          <Pressable
            onPress={() => {
              Alert.alert('Add Task', 'Coming soon.');
            }}
            style={[styles.addTaskBtn, { backgroundColor: theme.colors.pill }]}
          >
            <Text style={[styles.addTaskText, { color: theme.colors.primary }]}>
              + Add Task
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={listForDay}
          keyExtractor={item => String(item.orderId)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const canNavigate = !(item.latitude === 0 && item.longitude === 0);
            return (
              <ScheduleTaskCard
                item={item}
                onPress={() => onPressItem(item)}
                onPressNavigate={
                  canNavigate
                    ? () =>
                        openMapsDirections(
                          item.latitude,
                          item.longitude,
                          item.deliveryAddress,
                        )
                    : undefined
                }
                onPressCall={
                  item.contactPhone
                    ? () => callPhone(item.contactPhone)
                    : undefined
                }
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>
              No tasks for this date.
            </Text>
          }
        />
      </View>

      <ShipmentDetailsSheet
        shipment={selectedShipment}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedShipment(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  calendarWrap: {
    marginHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
  },
  agenda: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  agendaTitle: { fontSize: 13, fontWeight: '900' },
  addTaskBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskText: {
    fontSize: 12,
    fontWeight: '900',
  },
  listContent: { paddingBottom: 22 },
  separator: { height: 20 },
});
