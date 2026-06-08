import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { apiClient } from '../api/client';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export const syncUserWithBackend = async () => {
  try {
    const response = await apiClient.post('/users/sync');
    console.log("✅ Синхронізація з БД успішна:", response.data.message);
    return response.data.user;
  } catch (error) {
    console.error("❌ Помилка синхронізації з бекендом:", error);
    return null;
  }
};

export const loginWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
    if (!idToken) return { success: false, error: 'Token missing' };

    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);
    
    await syncUserWithBackend();

    return { success: true, user };
  } catch (error) {
    console.error("Помилка входу через Google:", error);
    return { success: false, error };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Помилка виходу:", error);
  }
};