import { Text, View } from 'react-native';

import { RequireAuth } from '@/components/require-auth';

export default function ChatsScreen() {
  return (
    <RequireAuth>
      <View>
        <Text>chat screen</Text>
      </View>
    </RequireAuth>
  );
}
