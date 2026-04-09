"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { auth, db, googleProvider, hasFirebaseConfig } from "@/lib/firebase";
import { defaultUserProfile } from "@/lib/mock-data";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  userProfile: UserProfile | null;
  status: "loading" | "authenticated" | "unauthenticated";
  usingFirebase: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const DEMO_USER_STORAGE_KEY = "paynex-demo-user";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      const frame = window.requestAnimationFrame(() => {
        const storedUser = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
        startTransition(() => {
          if (storedUser) {
            setUserProfile(JSON.parse(storedUser) as UserProfile);
            setStatus("authenticated");
          } else {
            setUserProfile(null);
            setStatus("unauthenticated");
          }
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUserProfile(null);
        setStatus("unauthenticated");
        unsubscribeProfile?.();
      return;
      }

      const seedProfile = async (user: User) => {
        if (!db) {
          return;
        }

        const fallbackProfile: UserProfile = {
          name: user.displayName?.split(" ")[0] ?? defaultUserProfile.name,
          email: user.email ?? defaultUserProfile.email,
          tier: "Personal",
          preferredDestination: defaultUserProfile.preferredDestination,
        };

        await setDoc(
          doc(db, "users", user.uid),
          {
            ...fallbackProfile,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      };

      void seedProfile(firebaseUser);

      if (db) {
        unsubscribeProfile = onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            setUserProfile(defaultUserProfile);
          }
          setStatus("authenticated");
        });
      } else {
        setUserProfile(defaultUserProfile);
        setStatus("authenticated");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      userProfile,
      status,
      usingFirebase: hasFirebaseConfig,
      signInWithEmail: async (email: string) => {
        if (hasFirebaseConfig && auth) {
          const safePassword = "PaynexDemo2026!";
          try {
            await signInWithEmailAndPassword(auth, email, safePassword);
          } catch {
            throw new Error(
              "Firebase email/password sign-in needs a valid account. Add credentials or use demo mode.",
            );
          }
          return;
        }

        startTransition(() => {
          const demoProfile = {
            ...defaultUserProfile,
            email,
            name: email.split("@")[0].replace(/^\w/, (letter) => letter.toUpperCase()),
          };
          window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoProfile));
          setUserProfile(demoProfile);
          setStatus("authenticated");
        });
      },
      signInWithGoogle: async () => {
        if (hasFirebaseConfig && auth && googleProvider) {
          await signInWithPopup(auth, googleProvider);
          return;
        }

        startTransition(() => {
          window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(defaultUserProfile));
          setUserProfile(defaultUserProfile);
          setStatus("authenticated");
        });
      },
      signOutUser: async () => {
        if (hasFirebaseConfig && auth) {
          await signOut(auth);
          return;
        }

        startTransition(() => {
          window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          setUserProfile(null);
          setStatus("unauthenticated");
        });
      },
    }),
    [status, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
