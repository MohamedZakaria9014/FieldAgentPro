import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ShipmentDetailsSheet } from '../components/ShipmentDetailsSheet';
import { ShipmentCard } from '../components/ShipmentCard';
import { SeasonalBanner } from '../components/SeasonalBanner';
import { SwipeableRow } from '../components/SwipeableRow';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteShipmentById } from '../redux/shipmentsSlice';
import type { Shipment } from '../services/shipmentsRepo';
import { useAppTheme } from '../theme/useAppTheme';

export default function Assignments() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const shipments = useAppSelector(s => s.shipments.items);
  const bannerEnabled = useAppSelector(s => s.settings.seasonalBannerEnabled);
  const { width, height } = useWindowDimensions();

  const [selected, setSelected] = React.useState<Shipment | null>(null);
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  const isLandscape = width > height;
  const numColumns = isLandscape ? 2 : 1;

  const onPressItem = (item: Shipment) => {
    setSelected(item);
    setDetailsVisible(true);
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      accessibilityLabel="assignments-screen"
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          My {t('assignments')}
        </Text>
      </View>

      <View style={styles.content}>
        <SeasonalBanner visible={bannerEnabled} />

        <FlatList
          data={shipments}
          key={numColumns}
          keyExtractor={item => String(item.orderId)}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={numColumns === 2 ? styles.columnWrap : undefined}
          renderItem={({ item }) => (
            <View style={numColumns === 2 ? styles.gridItem : undefined}>
              <SwipeableRow
                onDelete={() => dispatch(deleteShipmentById(item.orderId))}
              >
                <ShipmentCard item={item} onPress={() => onPressItem(item)} />
              </SwipeableRow>
            </View>
          )}
        />
      </View>

      <ShipmentDetailsSheet
        shipment={selected}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelected(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  listContent: {
    paddingBottom: 18,
  },
  columnWrap: {
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
});
