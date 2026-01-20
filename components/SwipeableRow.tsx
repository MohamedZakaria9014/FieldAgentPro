import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
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

const DELETE_THRESHOLD = -90;

export function SwipeableRow({ children, onDelete, height = 92 }: Props) {
  const theme = useAppTheme();
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    // Require intentional horizontal movement so taps still work.
    .minDistance(10)
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      // Worklet (UI thread)
      translateX.value = Math.min(
        0,
        Math.max(DELETE_THRESHOLD * 1.4, e.translationX),
      );
    })
    .onEnd(() => {
      if (translateX.value <= DELETE_THRESHOLD) {
        translateX.value = withSpring(-140, { damping: 18, stiffness: 220 });
        runOnJS(onDelete)();
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.wrapper, { height }]} pointerEvents="box-none">
      <View style={[styles.underlay, { backgroundColor: theme.colors.danger }]}>
        <Icon name="trash-can" size={18} color="#fff" />
        <Text style={styles.deleteText}>DELETE</Text>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={rStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  underlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 96,
    borderRadius: 18,
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
