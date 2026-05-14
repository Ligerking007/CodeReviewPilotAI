import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { createReview, loginWithGithubCli, loginWithGithubToken } from '../services/api';
import { saveLocalReview } from '../services/storage';
import { useAuth } from '../store/auth-context';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';
import { isValidPullRequestUrl } from '../utils/pr-url';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type LoginMethod = 'oauth' | 'pat' | 'cli';

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, mode, cycleMode } = useAppTheme();
  const { token, login, logout, setSessionToken } = useAuth();
  const [prUrl, setPrUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('pat');
  const [loading, setLoading] = useState(false);
  const [patLoading, setPatLoading] = useState(false);
  const [cliLoading, setCliLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const language = i18n.language === 'th' ? 'th' : 'en';

  async function onReview() {
    if (!token) {
      setError(t('loginRequired'));
      return;
    }
    if (!isValidPullRequestUrl(prUrl)) {
      setError(t('prPlaceholder'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const review = await createReview(token, prUrl, language);
      await saveLocalReview(review);
      navigation.navigate('Result', { review });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setLoading(false);
    }
  }

  async function onConnectPat() {
    setPatLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await loginWithGithubToken(githubPat.trim());
      await setSessionToken(result.appToken);
      setGithubPat('');
      setNotice(t('githubPatSaved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub token connection failed');
    } finally {
      setPatLoading(false);
    }
  }

  async function onConnectCli() {
    setCliLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await loginWithGithubCli();
      await setSessionToken(result.appToken);
      setNotice(t('githubCliSaved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub CLI connection failed');
    } finally {
      setCliLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('appName')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('subtitle')}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityLabel={t('themeMode')} style={[styles.iconButton, { borderColor: colors.border }]} onPress={cycleMode}>
            <Ionicons name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline'} size={20} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => i18n.changeLanguage(language === 'en' ? 'th' : 'en')}>
            <Text style={[styles.iconButtonText, { color: colors.text }]}>{language.toUpperCase()}</Text>
          </Pressable>
          <Pressable style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => navigation.navigate('History')}>
            <Ionicons name="time-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>{t('pastePr')}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={prUrl}
          onChangeText={setPrUrl}
          placeholder={t('prPlaceholder')}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.codeBackground }]}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        {notice ? <Text style={[styles.notice, { color: colors.success }]}>{notice}</Text> : null}
        <View style={styles.buttonRow}>
          {token ? (
            <Button onPress={logout} variant="secondary">
              {t('logout')}
            </Button>
          ) : null}
          <Button onPress={onReview} loading={loading} disabled={!prUrl}>
            {loading ? t('reviewing') : t('review')}
          </Button>
        </View>
      </View>

      {!token ? (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('connectGithub')}</Text>
          <View style={[styles.segmented, { borderColor: colors.border, backgroundColor: colors.codeBackground }]}>
            {(['pat', 'oauth', 'cli'] as LoginMethod[]).map((method) => {
              const active = loginMethod === method;
              return (
                <Pressable
                  key={method}
                  accessibilityRole="button"
                  onPress={() => {
                    setLoginMethod(method);
                    setError(null);
                    setNotice(null);
                  }}
                  style={[styles.segment, { backgroundColor: active ? colors.accent : 'transparent' }]}
                >
                  <Text style={[styles.segmentText, { color: active ? '#fff' : colors.text }]}>
                    {method === 'pat' ? t('patMethod') : method === 'oauth' ? t('oauthMethod') : t('cliMethod')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {loginMethod === 'pat' ? (
            <>
              <Text style={[styles.help, { color: colors.muted }]}>{t('patMethodHelp')}</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                value={githubPat}
                onChangeText={setGithubPat}
                placeholder={t('githubPatPlaceholder')}
                placeholderTextColor={colors.muted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.codeBackground }]}
              />
              <Text style={[styles.help, { color: colors.muted }]}>{t('githubPatHelp')}</Text>
            </>
          ) : loginMethod === 'oauth' ? (
            <Text style={[styles.help, { color: colors.muted }]}>{t('oauthMethodHelp')}</Text>
          ) : (
            <Text style={[styles.help, { color: colors.muted }]}>{t('cliMethodHelp')}</Text>
          )}
          <View style={styles.buttonRow}>
            {loginMethod === 'pat' ? (
              <Button onPress={onConnectPat} loading={patLoading} disabled={!githubPat.trim()}>
                {t('connectPat')}
              </Button>
            ) : loginMethod === 'oauth' ? (
              <Button onPress={login}>{t('loginGithub')}</Button>
            ) : (
              <Button onPress={onConnectCli} loading={cliLoading}>
                {t('connectCli')}
              </Button>
            )}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' },
  title: { fontSize: 34, fontWeight: '800' },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 22, maxWidth: 560 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontWeight: '800' },
  panel: { borderWidth: 1, borderRadius: 8, padding: 18, gap: 12 },
  label: { fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  error: { fontSize: 13 },
  notice: { fontSize: 13, fontWeight: '700' },
  help: { fontSize: 13, lineHeight: 18 },
  segmented: { borderWidth: 1, borderRadius: 8, padding: 4, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, minHeight: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  segmentText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }
});
