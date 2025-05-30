import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, provider } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
  role?: "user" | "admin";
  lastLogin?: any;
}

interface AuthContextType {

  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: () => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("user 0")
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });

        const tokenRefreshInterval = setInterval(async () => {
          const token = await user.getIdToken(true);
          localStorage.setItem("token", token);
        }, 55 * 60 * 1000);

        return () => clearInterval(tokenRefreshInterval);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Auth state change error:", error);
    } finally {
      setIsLoading(false); // Ensure loading always completes
    }
  });

  return unsubscribe;
}, []);
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      return result.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      return result.user;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, {
        displayName: name,
      });

      const userDocRef = doc(db, "users", result.user.uid);
      await setDoc(userDocRef, {
        uid: result.user.uid,
        displayName: name,
        email: result.user.email,
        photoURL: result.user.photoURL,
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      return result.user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error("No user logged in");

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userDocRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));

      if (data.displayName || data.photoURL) {
        await updateProfile(currentUser, {
          displayName: data.displayName || currentUser.displayName,
          photoURL: data.photoURL || currentUser.photoURL,
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    login,
    googleLogin,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}