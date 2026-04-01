import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const STORAGE_USER_KEY = "travel_recommender_user";
const STORAGE_THEME_KEY = "travel_recommender_theme";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return safeParse(localStorage.getItem(STORAGE_USER_KEY));
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const storedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(() => {
    const signIn = async ({ email }) => {
      // Frontend-only demo auth: replace with real backend auth endpoints when available.
      const nextUser = {
        id: `user_${btoa(unescape(encodeURIComponent(email))).slice(0, 10)}`,
        name: email.split("@")[0] || "Traveler",
        email,
        token: `fake_token_${email}`,
      };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      return nextUser;
    };

    const signUp = async ({ name, email }) => {
      const nextUser = {
        id: `user_${btoa(unescape(encodeURIComponent(email))).slice(0, 10)}`,
        name: name || "Traveler",
        email,
        token: `fake_token_${email}`,
      };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      return nextUser;
    };

    const signOut = () => {
      localStorage.removeItem(STORAGE_USER_KEY);
      setUser(null);
    };

    const toggleTheme = () => {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    };

    return {
      user,
      isAuthenticated: Boolean(user),
      theme,
      signIn,
      signUp,
      signOut,
      toggleTheme,
    };
  }, [user, theme]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

