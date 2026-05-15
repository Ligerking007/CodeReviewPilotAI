import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function AppHeader() {
  const navigation = useNavigation<Navigation>();
  const { t, i18n } = useTranslation();
  const { isDark, mode, cycleMode } = useAppTheme();
  const language = i18n.language === 'th' ? 'th' : 'en';
  const headerColors = isDark ? (['#0d1117', '#0f2f56', '#2f81f7'] as const) : (['#0757b8', '#0969da', '#2f81f7'] as const);
  const headerBorder = isDark ? '#2f81f7' : '#0757b8';
  const headerMuted = isDark ? '#c9ddff' : '#eaf3ff';

  return (
    <LinearGradient colors={headerColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { borderColor: headerBorder }]}>
      <Pressable style={styles.brand} onPress={() => navigation.navigate('Home')}>
        <View style={styles.logoMark}>
          <Ionicons name="git-pull-request-outline" size={22} color="#fff" />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={[styles.subtitle, { color: headerMuted }]}>{t('subtitle')}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={t('themeMode')} style={styles.iconButton} onPress={cycleMode}>
          <Ionicons name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline'} size={20} color="#fff" />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => i18n.changeLanguage(language === 'en' ? 'th' : 'en')}>
          <Text style={styles.iconButtonText}>{language.toUpperCase()}</Text>
        </Pressable>
        <Pressable accessibilityLabel={t('history')} style={styles.iconButton} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={20} color="#fff" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <AppHeader />
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', gap: 16 },
  header: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  brand: { flex: 1, minWidth: 260, flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoMark: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  brandText: { flex: 1, minWidth: 0 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { marginTop: 4, fontSize: 14, lineHeight: 20, maxWidth: 560 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonText: { color: '#fff', fontWeight: '800' }
});
