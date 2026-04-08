import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCurrentUser, signIn, signUp, signOut, startUserTrial, getUserTrialInfo, type User, type AuthError } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthError | null>;
  register: (email: string, password: string, displayName: string) => Promise<AuthError | null>;
  logout: () => void;
  activateTrial: () => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const stored = getCurrentUser();
    if (stored) {
      // Sync trial info from storage (in case it was updated)
      const trialInfo = getUserTrialInfo(stored.id);
      stored.trialStartedAt = trialInfo.trialStartedAt;
      stored.isTrialUsed = trialInfo.isTrialUsed;
    }
    setUser(stored);
    return stored;
  }, []);

  useEffect(() => {
    loadUser();
    setLoading(false);
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthError | null> => {
    const result = await signIn(email, password);
    if (result.error) return result.error;
    setUser(result.user!);
    return null;
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string): Promise<AuthError | null> => {
      const result = await signUp(email, password, displayName);
      if (result.error) return result.error;
      setUser(result.user!);
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  const activateTrial = useCallback((): boolean => {
    if (!user) return false;
    const ok = startUserTrial(user.id);
    if (ok) {
      loadUser(); // Refresh user data
    }
    return ok;
  }, [user, loadUser]);

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, activateTrial, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
