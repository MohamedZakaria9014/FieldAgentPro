import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import RNRestart from 'react-native-restart';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  persistSettings,
  setLanguage,
  setSeasonalBannerEnabled,
  setTheme,
} from '../redux/settingsSlice';
import { bootstrapAndSyncShipments } from '../redux/shipmentsSlice';
import { useAppTheme } from '../theme/useAppTheme';
import { runRouteSyncNow, scheduleRouteSync } from '../services/routeSync';

export default function Settings() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);

  React.useEffect(() => {
    // ensure background work is scheduled when settings screen is visited
    scheduleRouteSync();
  }, []);

  const updateSettings = (next: typeof settings) => {
    dispatch(persistSettings(next));
  };

  const toggleTheme = () => {
    const nextTheme: typeof settings.theme =
      settings.theme === 'dark' ? 'light' : 'dark';
    const next = {
      ...settings,
      theme: nextTheme,
    };
    dispatch(setTheme(next.theme));
    updateSettings(next);
  };

  const toggleLanguage = () => {
    const nextLang: typeof settings.language =
      settings.language === 'en' ? 'ar' : 'en';
    const next = { ...settings, language: nextLang };

    dispatch(setLanguage(nextLang));
    updateSettings(next);

    const shouldBeRtl = nextLang === 'ar';
    if (I18nManager.isRTL !== shouldBeRtl) {
      I18nManager.allowRTL(shouldBeRtl);
      I18nManager.forceRTL(shouldBeRtl);
      RNRestart.Restart();
    }
  };

  const toggleBanner = () => {
    const next = {
      ...settings,
      seasonalBannerEnabled: !settings.seasonalBannerEnabled,
    };
    dispatch(setSeasonalBannerEnabled(next.seasonalBannerEnabled));
    updateSettings(next);
  };

  const manualSync = async () => {
    await dispatch(bootstrapAndSyncShipments());
    await runRouteSyncNow();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('settings')}
        </Text>
      </View>

      <View style={styles.content}>
        <SettingRow
          title={t('language')}
          value={settings.language === 'en' ? t('english') : t('arabic')}
          onPress={toggleLanguage}
        />
        <SettingRow
          title={t('theme')}
          value={settings.theme === 'dark' ? t('dark') : t('light')}
          onPress={toggleTheme}
        />
        <SettingRow
          title="Seasonal Banner"
          value={settings.seasonalBannerEnabled ? 'On' : 'Off'}
          onPress={toggleBanner}
        />

        <Pressable
          style={[styles.syncBtn, { backgroundColor: theme.colors.primary }]}
          onPress={manualSync}
        >
          <Text style={styles.syncBtnText}>{t('manualSync')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SettingRow({
  title,
  value,
  onPress,
}: {
  title: string;
  value: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      style={[styles.row, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.rowValue, { color: theme.colors.textMuted }]}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  content: { paddingHorizontal: 18, paddingTop: 10, gap: 12 },
  row: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: { fontSize: 13, fontWeight: '900' },
  rowValue: { fontSize: 12, fontWeight: '800' },
  syncBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  syncBtnText: { color: '#fff', fontWeight: '900' },
});
