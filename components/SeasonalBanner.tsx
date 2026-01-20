import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  visible: boolean;
};

export function SeasonalBanner({ visible }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  if (!visible) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: '#F97316' }]}
      accessibilityRole="summary"
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Icon name="alert" size={16} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>{t('seasonalRush')}</Text>
          <Text style={styles.subtitle}>{t('highTraffic')}</Text>
        </View>
      </View>
      <Icon name="close" size={18} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
});
