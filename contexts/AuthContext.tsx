"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;

  // Auth popup control
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  popupDismissed: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "lux-auth-user";
const USERS_DB_KEY = "lux-mock-users-db";
const POPUP_DISMISSED_KEY = "lux-auth-popup-dismissed";

// Admin credentials are handled server-side via /api/auth/login
// Never expose them in client-side code.

interface MockUserRecord extends AuthUser {
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) setUser(JSON.parse(savedUser));

      const dismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
      if (dismissed === "true") setPopupDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user, isMounted]);

  const login = useCallback(
    async (email: string, password: string) => {

      // Check mock user DB
      try {
        const db: MockUserRecord[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || "[]");
        const found = db.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) return { ok: false, error: "No account found with that email" };
        if (found.password !== password) return { ok: false, error: "Incorrect password" };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...publicUser } = found;
        setUser(publicUser);
        return { ok: true, user: publicUser };
      } catch {
        return { ok: false, error: "Login failed" };
      }
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const db: MockUserRecord[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || "[]");
        if (db.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: "An account with that email already exists" };
        }
        const newUser: MockUserRecord = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role: "customer",
          createdAt: new Date().toISOString(),
        };
        db.push(newUser);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...publicUser } = newUser;
        setUser(publicUser);
        return { ok: true, user: publicUser };
      } catch {
        return { ok: false, error: "Signup failed" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const openPopup = useCallback(() => setIsPopupOpen(true), []);
  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setPopupDismissed(true);
    try {
      sessionStorage.setItem(POPUP_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        isPopupOpen,
        openPopup,
        closePopup,
        popupDismissed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
