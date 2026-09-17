import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const ARM_COUNT = 22;
const DOTS_PER_ARM = 7;
const SPIRAL_TURNS = 2;
const CYCLE_DURATION = 22000;
const DOT_SIZE = 4;

type Dot = {
  baseAngle: number;
  stagger: number;
  size: number;
};

type DotViewProps = Dot & {
  progress: SharedValue<number>;
  centerX: number;
  centerY: number;
  maxRadius: number;
};

function DotView({ baseAngle, stagger, size, progress, centerX, centerY, maxRadius }: DotViewProps) {
  const style = useAnimatedStyle(() => {
    const t = (progress.value + stagger) % 1;
    const radius = maxRadius * (1 - t);
    const angle = baseAngle + t * SPIRAL_TURNS * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const fade = Math.sin(t * Math.PI);

    return {
      opacity: fade,
      transform: [{ translateX: x - size / 2 }, { translateY: y - size / 2 }, { scale: 0.4 + 0.6 * fade }],
    };
  });

  return <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2 }, style]} />;
}

export function SpiralDots({ width, height }: { width: number; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: CYCLE_DURATION, easing: Easing.linear }), -1);
  }, [progress]);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(width * width + height * height) / 2;

  const dots = useMemo<Dot[]>(() => {
    const result: Dot[] = [];
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const armBaseAngle = (arm / ARM_COUNT) * Math.PI * 2;
      const armPhaseOffset = ((arm * 0.6180339887) % 1) / DOTS_PER_ARM;
      for (let j = 0; j < DOTS_PER_ARM; j++) {
        result.push({
          baseAngle: armBaseAngle,
          stagger: (j / DOTS_PER_ARM + armPhaseOffset) % 1,
          size: DOT_SIZE + (j % 3) * 1.5,
        });
      }
    }
    return result;
  }, []);

  return (
    <View style={[styles.container, { width, height }]}>
      {dots.map((dot, index) => (
        <DotView
          key={index}
          baseAngle={dot.baseAngle}
          stagger={dot.stagger}
          size={dot.size}
          progress={progress}
          centerX={centerX}
          centerY={centerY}
          maxRadius={maxRadius}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#9a9a9a',
  },
});
