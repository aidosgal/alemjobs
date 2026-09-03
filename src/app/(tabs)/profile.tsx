import { Text, View } from 'react-native';

import { RequireAuth } from '@/components/require-auth';

export default function ProfileScreen() {
  return (
    <RequireAuth>
      <View>
        <Text>Profile Screen</Text>
      </View>
    </RequireAuth>
  );
}
