import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { configureApiClient, publicRequest, apiGet, apiPatch, isUsingDemoBackend } from "../lib/api-client";
import { clearStoredSession, getStoredSession, storeSession } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const setSession = (nextSession) => {
    setSessionState(nextSession);
    storeSession(nextSession);
  };

  const clearSession = () => {
    setSessionState(null);
    clearStoredSession();
  };

  useEffect(() => {
    configureApiClient({
      getSession: () => session,
      setSession,
      clearSession,
    });
  }, [session]);

  useEffect(() => {
    const bootstrap = async () => {
      if (session?.mode === "demo" && !isUsingDemoBackend()) {
        clearSession();
        setIsBootstrapping(false);
        return;
      }

      if (!session?.refreshToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await apiGet("/auth/me");
        setSession({
          ...session,
          user,
        });
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload) => {
    const data = await publicRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await publicRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSession(data);
    return data;
  };

  const logout = async () => {
    try {
      if (session?.refreshToken) {
        await publicRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        });
      }
    } finally {
      clearSession();
    }
  };

  const updateProfile = async (payload) => {
    const user = await apiPatch("/auth/me", payload);
    const nextSession = {
      ...session,
      user,
    };
    setSession(nextSession);
    return user;
  };

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isBootstrapping,
      login,
      register,
      logout,
      updateProfile,
      setSession,
    }),
    [session, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
