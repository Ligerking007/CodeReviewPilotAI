import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import './src/i18n';
import { AuthProvider, useAuth } from './src/store/auth-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AuthCallbackScreen } from './src/screens/AuthCallbackScreen';
import { RootStackParamList } from './src/types/navigation';
import { buildTheme } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const scheme = useColorScheme();
  const colors = buildTheme(scheme === 'dark');
  const { tokenLoaded } = useAuth();

  if (!tokenLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: [Linking.createURL('/'), 'codereviewpilot://'],
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
        ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
        colors: {
          ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
          background: colors.background,
          card: colors.surface,
          primary: colors.accent,
          text: colors.text,
          border: colors.border
        }
      }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
