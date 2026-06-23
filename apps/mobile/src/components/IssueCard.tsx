import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/theme-context';
import { ReviewIssue } from '../types/review';

const severityColors = {
  critical: '#f85149',
  high: '#ff7b72',
  medium: '#d29922',
  low: '#3fb950',
  info: '#58a6ff'
};

export function IssueCard({ issue }: { issue: ReviewIssue }) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const badgeColor = severityColors[issue.severity];
  const hasCodeSuggestion = Boolean(issue.codeSuggestion?.before && issue.codeSuggestion.after);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>{issue.title}</Text>
        <Text style={[styles.badge, { backgroundColor: badgeColor }]}>{issue.severity.toUpperCase()}</Text>
      </View>
      {issue.file ? (
        <Text style={[styles.file, { color: colors.accent }]}>
          {issue.file}
          {issue.line ? `:${issue.line}` : ''}
        </Text>
      ) : null}
      <Text style={[styles.body, { color: colors.text }]}>{issue.description}</Text>
      <Text style={[styles.recommendation, { color: colors.muted }]}>{issue.recommendation}</Text>
      {hasCodeSuggestion ? (
        <View style={styles.codeSuggestion}>
          <Text style={[styles.codeSuggestionTitle, { color: colors.text }]}>{t('codeSuggestion')}</Text>
          <View style={styles.codeGrid}>
            <View style={styles.codeColumn}>
              <Text style={[styles.codeLabel, { color: colors.muted }]}>{t('before')}</Text>
              <Text
                selectable
                style={[
                  styles.codeBlock,
                  { backgroundColor: colors.codeBackground, borderColor: colors.border, color: colors.text }
                ]}
              >
                {issue.codeSuggestion?.before}
              </Text>
            </View>
            <View style={styles.codeColumn}>
              <Text style={[styles.codeLabel, { color: colors.muted }]}>{t('after')}</Text>
              <Text
                selectable
                style={[
                  styles.codeBlock,
                  { backgroundColor: colors.codeBackground, borderColor: colors.border, color: colors.text }
                ]}
              >
                {issue.codeSuggestion?.after}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 15, fontWeight: '700' },
  badge: { color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  file: { fontFamily: 'Courier', fontSize: 13 },
  body: { fontSize: 14, lineHeight: 20 },
  recommendation: { fontSize: 14, lineHeight: 20 },
  codeSuggestion: { gap: 8, marginTop: 2 },
  codeSuggestionTitle: { fontSize: 13, fontWeight: '700' },
  codeGrid: { gap: 10 },
  codeColumn: { gap: 4 },
  codeLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  codeBlock: {
    borderWidth: 1,
    borderRadius: 6,
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 17,
    padding: 10
  }
});
