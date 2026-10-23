import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../../lib/supabase';

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }
  if (!data.url) {
    throw new Error('Supabase did not return a Google sign-in URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return;
  }

  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(result.url);
    if (exchangeError) {
      throw exchangeError;
    }
    return;
  }

  const authParams = new URLSearchParams(
    callbackUrl.hash.replace(/^#/, '') || callbackUrl.search.replace(/^\?/, ''),
  );
  const accessToken = authParams.get('access_token');
  const refreshToken = authParams.get('refresh_token');
  if (!accessToken || !refreshToken) {
    throw new Error('Google sign-in did not return a valid session.');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) {
    throw sessionError;
  }
}
