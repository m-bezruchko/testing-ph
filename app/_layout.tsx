import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {PostHogProvider, PostHog, PostHogOptions} from 'posthog-react-native'
import {Platform} from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function getOptions(): PostHogOptions {
    return {
        host: 'https://phrp.levelshealth.com/',
        defaultOptIn: false,
        enableSessionReplay: Platform.OS === 'ios',
        sessionReplayConfig: {
            maskAllTextInputs: false,
        },
    }
}
export const posthog: PostHog = new PostHog('ADD_YOUR_API_KEY_HERE', getOptions())
posthog.debug(true)

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [analyticsId, setAnalyticsId] = useState<string | null>(null)
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    }, [loaded]);

    useEffect(() => {
        setTimeout(() => {
            setAnalyticsId('levels-934162ef8fd1c4ae266e146d931f294fb4739eaf53f484a8debaa2440f9dd157')
            console.log('[DEBUGGING] setAnalyticsId')
        }, 4000)

    }, []);

    useEffect(() => {
        async function init() {
            if(analyticsId) {
                await posthog.optIn()
                console.log('[DEBUGGING] Opted in')
                posthog.identify(analyticsId, {
                    email: 'm.bezruchko@geniusee.com'
                })
                console.log('[DEBUGGING] Identified')
            } else {
                await posthog.optOut()
                console.log('[DEBUGGING] Opted out')
            }
        }

        init()
    }, [analyticsId]);

  return (
      <PostHogProvider
          client={posthog}
          debug={true} // uncomment to debug in development mode
          autocapture={{
            captureLifecycleEvents: true,
            captureScreens: true,
            captureTouches: false,
          }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {loaded && <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="+not-found"/>
            </Stack>}
        </ThemeProvider>
      </PostHogProvider>
  );
}
