"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type User } from "firebase/auth";
import { onAuthChange, signInWithGoogle, signInWithEmail, signUpWithEmail, logOut, getIdToken } from "@/lib/firebase/auth";
import { getUserProfile, createUserProfile, type UserProfile } from "@/lib/firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string, extra?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  signUpEmail: async () => {},
  signOut: async () => {},
  getToken: async () => null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          await createUserProfile(firebaseUser.uid, {
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: firebaseUser.phoneNumber || "",
            role: "CITIZEN",
            language: "en",
          });
          userProfile = await getUserProfile(firebaseUser.uid);
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Refresh token every 10 minutes when the user is logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      user.getIdToken(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const signInGoogle = async () => {
    try {
      setError(null);
      const firebaseUser = await signInWithGoogle();
      // Fetch the profile to determine the role for routing
      const userProfile = await getUserProfile(firebaseUser.uid);
      const route = userProfile?.role === "ADVOCATE" ? "/advocate" : "/dashboard";
      router.push(route);
    } catch (err: unknown) {
      setError((err as Error).message || "Google sign-in failed");
    }
  };

  const signInEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const firebaseUser = await signInWithEmail(email, password);
      // Fetch the profile to determine the role for routing
      const userProfile = await getUserProfile(firebaseUser.uid);
      const route = userProfile?.role === "ADVOCATE" ? "/advocate" : "/dashboard";
      router.push(route);
    } catch (err: unknown) {
      const msg = (err as { code?: string }).code;
      if (msg === "auth/invalid-credential") setError("Invalid email or password");
      else if (msg === "auth/user-not-found") setError("No account found with this email");
      else setError((err as Error).message || "Login failed");
    }
  };

  const signUpEmail = async (email: string, password: string, name: string, extra?: Partial<UserProfile>) => {
    try {
      setError(null);
      const firebaseUser = await signUpWithEmail(email, password, name);
      await createUserProfile(firebaseUser.uid, {
        name,
        email,
        role: "CITIZEN",
        language: "en",
        ...extra,
      });
      const route = extra?.role === "ADVOCATE" ? "/advocate" : "/dashboard";
      router.push(route);
    } catch (err: unknown) {
      const msg = (err as { code?: string }).code;
      if (msg === "auth/email-already-in-use") setError("An account with this email already exists");
      else if (msg === "auth/weak-password") setError("Password must be at least 6 characters");
      else setError((err as Error).message || "Sign up failed");
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setProfile(null);
      router.push("/");
    } catch (err: unknown) {
      setError((err as Error).message || "Sign out failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signInGoogle,
        signInEmail,
        signUpEmail,
        signOut: handleSignOut,
        getToken: getIdToken,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
