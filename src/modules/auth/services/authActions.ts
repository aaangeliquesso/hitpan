import Constants, { AppOwnership } from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../../../lib/supabase';

let googleSignInConfigured = false;

export class GoogleSignInUnavailableError extends Error {}

export async function signInWithGoogle(): Promise<boolean> {
  if (Constants.appOwnership === AppOwnership.Expo) {
    throw new GoogleSignInUnavailableError(
      'Google sign-in requires an installed development build. Please open the app in its development build instead of Expo Go.',
    );
  }
  if (Platform.OS === 'web') {
    throw new GoogleSignInUnavailableError(
      'Google sign-in is available in the iOS and Android app.',
    );
  }

  const { GoogleSignin } = await import(
    '@react-native-google-signin/google-signin'
  );

  if (!googleSignInConfigured) {
    GoogleSignin.configure({
      webClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
        'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    });
    googleSignInConfigured = true;
  }

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') {
    return false;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('Google did not return an ID token.');
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) {
    throw error;
  }

  return true;
}
