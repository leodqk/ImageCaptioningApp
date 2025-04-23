import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Định nghĩa hook để xử lý các navigation redirect
function useProtectedRoutes() {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inIntroScreen = segments[0] === 'intro';

    const checkIntroStatus = async () => {
      const isIntroCompleted = await AsyncStorage.getItem('introCompleted');

      if (!isIntroCompleted && !inIntroScreen) {
        // If intro not completed, redirect to intro
        router.replace('/intro');
      } else if (isIntroCompleted) {
        if (!isAuthenticated && !inAuthGroup) {
          // If not authenticated, redirect to login
          router.replace('/(auth)/login');
        } else if (isAuthenticated && (inAuthGroup || inIntroScreen)) {
          // If authenticated, redirect to home
          router.replace('/(tabs)');
        }
      }
    };

    checkIntroStatus();
  }, [isLoading, isAuthenticated, segments]);
}

// Component that handles redirects based on authentication state
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // Sử dụng hook bảo vệ route
  useProtectedRoutes();

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="intro" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
