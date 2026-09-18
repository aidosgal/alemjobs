import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '@/components/auth/pill-button';
import { SpiralDots } from '@/components/welcome/spiral-dots';
import { Gilroy } from '@/constants/fonts';

const BUZZ_PULSES = 16;
const BUZZ_INTERVAL_MS = 75;

const UP_OFFSET = 70;

async function buzz() {
  for (let i = 0; i < BUZZ_PULSES; i++) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, BUZZ_INTERVAL_MS));
  }
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    buzz();
  }, []);

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']} onLayout={handleLayout}>
      <View style={styles.background}>
        {layout && <SpiralDots width={layout.width} height={layout.height} />}
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.textBlock}>
          <Text style={styles.eyebrow}>alem jobs</Text>
          <Text style={styles.headline}>Найди работу{'\n'}мечты в Европе</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.footer}>
        <PillButton label="Начать" onPress={handleStart} backgroundColor="#ffffff" textColor="#000000" />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: UP_OFFSET,
  },
  textBlock: {
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    fontFamily: Gilroy.semibold,
    fontSize: 13,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.55)',
  },
  headline: {
    fontFamily: Gilroy.semibold,
    fontSize: 40,
    letterSpacing: -0.8,
    textAlign: 'center',
    lineHeight: 44,
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
});
