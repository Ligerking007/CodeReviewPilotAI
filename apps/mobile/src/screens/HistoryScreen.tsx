import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { getHistory } from '../services/api';
import { getLocalHistory } from '../services/storage';
import { useAuth } from '../store/auth-context';
import { buildTheme } from '../theme/theme';
import { RootStackParamList } from '../types/navigation';
import { ReviewResponse } from '../types/review';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const colors = buildTheme(useColorScheme() === 'dark');
  const { token } = useAuth();
  const [items, setItems] = useState<ReviewResponse[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        const local = await getLocalHistory();
        if (active) {
          setItems(local);
        }
        if (token) {
          try {
            const remote = await getHistory(token);
            if (active) {
              setItems(remote.length ? remote : local);
            }
          } catch {
            if (active) {
              setItems(local);
            }
          }
        }
      }
      load();
      return () => {
        active = false;
      };
    }, [token])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={[styles.backButton, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{t('history')}</Text>
      </View>

      {items.length === 0 ? <Text style={[styles.empty, { color: colors.muted }]}>{t('noHistory')}</Text> : null}
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate('Result', { review: item })}
          style={({ pressed }) => [styles.item, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.itemUrl, { color: colors.muted }]}>{item.prUrl}</Text>
          <Text style={[styles.itemDate, { color: colors.muted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800' },
  empty: { fontSize: 15 },
  item: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 6 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemUrl: { fontSize: 13 },
  itemDate: { fontSize: 12 }
});
