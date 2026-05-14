import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { IssueCard } from '../components/IssueCard';
import { Screen } from '../components/Screen';
import { Section } from '../components/Section';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { review } = route.params;
  const [copied, setCopied] = useState(false);

  async function copyMarkdown() {
    await Clipboard.setStringAsync(review.result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={[styles.backButton, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{review.title}</Text>
          <Text style={[styles.url, { color: colors.muted }]}>{review.prUrl}</Text>
        </View>
        <Button onPress={copyMarkdown} variant="secondary">
          {copied ? t('copied') : t('copy')}
        </Button>
      </View>

      <Section title={t('summary')} defaultOpen>
        <Text style={[styles.summary, { color: colors.text }]}>{review.result.summary}</Text>
      </Section>

      {[
        ['criticalIssues', review.result.criticalIssues],
        ['suggestions', review.result.suggestions],
        ['security', review.result.security],
        ['performance', review.result.performance],
        ['bestPractices', review.result.bestPractices]
      ].map(([key, issues]) => (
        <Section key={key as string} title={t(key as string)} count={(issues as typeof review.result.suggestions).length} defaultOpen={key === 'criticalIssues'}>
          {(issues as typeof review.result.suggestions).map((issue, index) => (
            <IssueCard key={`${issue.title}-${index}`} issue={issue} />
          ))}
        </Section>
      ))}

      <View style={[styles.markdownPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Markdown style={{ body: { color: colors.text }, code_inline: { backgroundColor: colors.codeBackground, color: colors.text } }}>
          {review.result.markdown}
        </Markdown>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  backButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, gap: 6 },
  title: { fontSize: 24, fontWeight: '800' },
  url: { fontSize: 13 },
  summary: { fontSize: 15, lineHeight: 22 },
  markdownPanel: { borderWidth: 1, borderRadius: 8, padding: 16 }
});
