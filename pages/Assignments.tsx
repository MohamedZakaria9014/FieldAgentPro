import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ShipmentDetailsSheet } from '../components/ShipmentDetailsSheet';
import { ShipmentCard } from '../components/ShipmentCard';
import { SeasonalBanner } from '../components/SeasonalBanner';
import { SwipeableRow } from '../components/SwipeableRow';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  bootstrapAndSyncShipments,
  deleteShipmentById,
  resetShipmentsToMock,
} from '../redux/shipmentsSlice';
import type { Shipment } from '../services/shipmentsRepo';
import { useAppTheme } from '../theme/useAppTheme';

export default function Assignments() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const shipments = useAppSelector(s => s.shipments.items);
  const loading = useAppSelector(s => s.shipments.loading);
  const bannerEnabled = useAppSelector(s => s.settings.seasonalBannerEnabled);
  const { width, height } = useWindowDimensions();

  const [selected, setSelected] = React.useState<Shipment | null>(null);
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  const [pullEnabled, setPullEnabled] = React.useState(true);
  const [refreshArmed, setRefreshArmed] = React.useState(false);
  const PULL_ARM_THRESHOLD = 80;

  const isLandscape = width > height;
  const numColumns = isLandscape ? 2 : 1;

  const onPressItem = (item: Shipment) => {
    setSelected(item);
    setDetailsVisible(true);
  };

  const refreshData = () => {
    if (loading) return;
    dispatch(bootstrapAndSyncShipments());
  };

  const onPullRefresh = () => {
    if (!refreshArmed) return;
    refreshData();
  };

  const resetToMockData = () => {
    if (loading) return;
    Alert.alert(t('resetToMockTitle'), t('resetToMockMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('reset'),
        style: 'destructive',
        onPress: () => dispatch(resetShipmentsToMock()),
      },
    ]);
  };

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      accessibilityLabel="assignments-screen"
    >
      <View
        pointerEvents="none"
        style={[
          styles.headerBackdrop,
          { backgroundColor: theme.colors.surface2 },
        ]}
      />

      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {t('myAssignments')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="refresh-assignments"
          onPress={refreshData}
          onLongPress={resetToMockData}
          disabled={loading}
          style={[
            styles.headerAction,
            {
              backgroundColor: theme.colors.pill,
              borderColor: theme.colors.border,
              opacity: loading ? 0.6 : 1,
            },
          ]}
        >
          <Icon
            name={loading ? 'loading' : 'refresh'}
            size={18}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <SeasonalBanner visible={bannerEnabled} />

        <FlatList
          data={shipments}
          key={numColumns}
          keyExtractor={item => String(item.orderId)}
          numColumns={numColumns}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={numColumns === 2 ? styles.columnWrap : undefined}
          scrollEventThrottle={16}
          onScroll={e => {
            const y = e.nativeEvent.contentOffset?.y ?? 0;
            const atTop = y <= 0;
            if (pullEnabled !== atTop) setPullEnabled(atTop);
            if (!atTop && refreshArmed) setRefreshArmed(false);

            // iOS reports negative y while overscrolling; some Android setups may too.
            if (atTop && y <= -PULL_ARM_THRESHOLD && !refreshArmed) {
              setRefreshArmed(true);
            }
            if (atTop && y > -10 && refreshArmed) {
              // user released / returned to top without triggering
              setRefreshArmed(false);
            }
          }}
          refreshControl={
            <RefreshControl
              enabled={pullEnabled}
              refreshing={loading}
              onRefresh={onPullRefresh}
              // Push spinner down so the user has to pull further.
              progressViewOffset={96}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
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
  headerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    opacity: 0.22,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 28,
  },
  columnWrap: {
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
});
