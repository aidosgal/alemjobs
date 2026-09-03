import { StyleSheet, Text } from 'react-native';

import { AuthColors } from '@/constants/auth-theme';

export function LegalFooter() {
  return (
    <Text style={styles.text}>
      Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
});
