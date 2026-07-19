import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthChange, getAdminProfile, ensureSuperAdmin, AdminProfile } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  profile: AdminProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  firebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isSuperAdmin: false,
  isAdmin: false,
  firebaseReady: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure Super Admin exists on first run (idempotent — safe to call always)
    ensureSuperAdmin().catch(console.error);

    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await getAdminProfile(u.uid);
          setProfile(p);
        } catch (err) {
          console.error("[RSSB AMS] Failed to load profile:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isSuperAdmin: profile?.role === "super_admin",
        isAdmin: profile?.role === "admin" || profile?.role === "super_admin",
        firebaseReady: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
