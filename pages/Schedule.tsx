import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  I18nManager,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
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

/* =======================
   Calendar Localization
======================= */
LocaleConfig.locales.en = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
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
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

LocaleConfig.locales.ar = {
  monthNames: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  monthNamesShort: [
    'ينا',
    'فبر',
    'مار',
    'أبر',
    'ماي',
    'يون',
    'يول',
    'أغس',
    'سبت',
    'أكت',
    'نوف',
    'ديس',
  ],
  dayNames: [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ],
  dayNamesShort: ['أحد', 'إثن', 'ثلث', 'أرب', 'خم', 'جم', 'سبت'],
};

/* =======================
   Helpers
======================= */
function formatAgendaTitle(ymd: string, isArabic: boolean): string {
  const d = new Date(`${ymd}T00:00:00`);
  const day = d.getDate();

  const monthsEn = [
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

  const monthsAr = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const month = isArabic ? monthsAr[d.getMonth()] : monthsEn[d.getMonth()];

  return isArabic ? `جدول اليوم ${day} ${month}` : `Agenda for ${month} ${day}`;
}

/* =======================
   Screen
======================= */
export default function Schedule() {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const shipments = useAppSelector(s => s.shipments.items);

  const isArabic = i18n.language.startsWith('ar');
  const isRTL = isArabic || I18nManager.isRTL;

  LocaleConfig.defaultLocale = isArabic ? 'ar' : 'en';

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
    return Object.keys(grouped).sort()[0] ?? today;
  }, [grouped, today]);

  const [selected, setSelected] = React.useState(today);

  React.useEffect(() => {
    if (Object.keys(grouped).length) {
      setSelected(preferredInitialDay);
    }
  }, [grouped, preferredInitialDay]);

  const markedDates = React.useMemo(() => {
    const result: Record<string, any> = {};

    for (const [day, list] of Object.entries(grouped)) {
      const dots = [];

      if (list.some(s => s.status === 'Active')) {
        dots.push({ key: 'active', color: '#22C55E' });
      }
      if (list.some(s => s.status === 'Pending')) {
        dots.push({ key: 'pending', color: '#9CA3AF' });
      }

      if (dots.length) {
        result[day] = { marked: true, dots };
      }
    }

    result[selected] = {
      ...(result[selected] ?? {}),
      selected: true,
      selectedColor: theme.colors.primary,
    };

    return result;
  }, [grouped, selected, theme.colors.primary]);

  const listForDay = React.useMemo(() => {
    return [...(grouped[selected] ?? [])].sort(
      (a, b) =>
        new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime(),
    );
  }, [grouped, selected]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('schedule')}
        </Text>
      </View>

      {/* Calendar */}
      <View
        style={[styles.calendarWrap, { backgroundColor: theme.colors.surface }]}
      >
        <Calendar
          current={selected}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(d: DateData) => setSelected(d.dateString)}
          hideExtraDays
          renderArrow={direction => (
            <Icon
              name={
                isRTL
                  ? direction === 'left'
                    ? 'chevron-right'
                    : 'chevron-left'
                  : direction === 'left'
                  ? 'chevron-left'
                  : 'chevron-right'
              }
              size={20}
              color={theme.colors.arrow}
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
          }}
        />
      </View>

      {/* Agenda */}
      <View style={styles.agenda}>
        <View style={styles.agendaHeader}>
          <Text
            style={[
              styles.agendaTitle,
              { color: theme.colors.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {formatAgendaTitle(selected, isArabic)}
          </Text>

          <Pressable
            style={[styles.addTaskBtn, { backgroundColor: theme.colors.pill }]}
          >
            <Text style={[styles.addTaskText, { color: theme.colors.primary }]}>
              + {t('addTask')}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={listForDay}
          keyExtractor={item => String(item.orderId)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ScheduleTaskCard
              item={item}
              onPress={() => {
                setSelectedShipment(item);
                setDetailsVisible(true);
              }}
              onPressNavigate={
                item.latitude && item.longitude
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
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={{ color: theme.colors.textMuted, fontWeight: '700' }}>
              {t('noTasksForDate')}
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

/* =======================
   Styles
======================= */
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  calendarWrap: {
    marginHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
  },
  agenda: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  agendaHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  agendaTitle: { fontSize: 13, fontWeight: '900' },
  addTaskBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
  },
  addTaskText: { fontSize: 12, fontWeight: '900' },
  listContent: { paddingBottom: 22 },
  separator: { height: 20 },
});
