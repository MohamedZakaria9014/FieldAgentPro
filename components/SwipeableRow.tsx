import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  height?: number;
};

const ACTION_WIDTH = 96;
const OPEN_THRESHOLD = -60;

export function SwipeableRow({ children, onDelete, height }: Props) {
  const theme = useAppTheme();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const pan = Gesture.Pan()
    // Require intentional horizontal movement so taps still work.
    .minDistance(12)
    .activeOffsetX([-15, 15])
    // Let vertical scroll win (prevents FlatList from feeling "stuck")
    .failOffsetY([-10, 10])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate(e => {
      // Worklet (UI thread)
      const next = startX.value + e.translationX;
      translateX.value = Math.min(0, Math.max(-ACTION_WIDTH, next));
    })
    .onEnd(() => {
      const shouldOpen = translateX.value <= OPEN_THRESHOLD;
      translateX.value = withSpring(shouldOpen ? -ACTION_WIDTH : 0, {
        damping: 18,
        stiffness: 220,
      });
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.wrapper, height ? { height } : undefined]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="delete-row"
        onPress={() => {
          translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
          onDelete();
        }}
        style={[styles.underlay, { backgroundColor: theme.colors.danger }]}
      >
        <Icon name="trash-can" size={23} color="#fff" />
        <Text style={styles.deleteText}>DELETE</Text>
      </Pressable>

      <GestureDetector gesture={pan}>
        <Animated.View style={rStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 14,
    justifyContent: 'center',
    minHeight: 86,
  },
  underlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
