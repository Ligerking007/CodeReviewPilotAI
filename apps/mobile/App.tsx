import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { AuthProvider, useAuth } from './src/store/auth-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AuthCallbackScreen } from './src/screens/AuthCallbackScreen';
import { appInfo } from './src/constants/app-info';
import { RootStackParamList } from './src/types/navigation';
import { ThemeProvider, useAppTheme } from './src/theme/theme-context';

const Stack = createNativeStackNavigator<RootStackParamList>();
const webBaseUrl = process.env.EXPO_PUBLIC_APP_BASE_URL?.replace(/\/+$/, '');
const webLinkingPrefixes = webBaseUrl ? [webBaseUrl] : [Linking.createURL('/')];
const linkingPrefixes = [...webLinkingPrefixes, 'codereviewpilot://'];

function AppNavigator() {
  const { colors, isDark } = useAppTheme();
  const { tokenLoaded } = useAuth();

  if (!tokenLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      linking={{
        // GitHub Pages serves this app from a repository subpath, so web linking must include that base URL.
        prefixes: linkingPrefixes,
        config: {
          screens: {
            Home: '',
            Result: 'review/:id',
            History: 'history',
            AuthCallback: 'auth/callback'
          }
        }
      }}
      theme={{
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
          ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: colors.background,
          card: colors.surface,
          primary: colors.accent,
          text: colors.text,
          border: colors.border
        }
      }}
      documentTitle={{
        formatter: (options) => `${options?.title ?? 'Home'} - ${appInfo.name}`
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Review' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ title: 'Authentication' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
