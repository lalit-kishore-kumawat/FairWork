import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USERS } from '@/src/data/mockData';
import { User, UserRole } from '@/src/types';

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  loginAsRole: (role: UserRole) => User;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
  }) => Promise<{ ok: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateCurrentUser: (partial: Partial<User>) => void;
}

const STORAGE_KEY = 'fairwork_active_user_v1';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as User;
      }
    } catch {
      // Ignore storage parsing errors
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Please enter both your email address and password.' };
    }
    const normalized = email.trim().toLowerCase();
    const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);
    if (matched) {
      if (matched.status === 'Suspended') {
        return {
          ok: false,
          error: 'This account is currently suspended pending administrative review.',
        };
      }
      setCurrentUser(matched);
      return { ok: true, user: matched };
    }

    // Prototype convenience: allow any valid email format to sign in as a client
    const fallbackUser: User = {
      ...MOCK_USERS[0],
      id: `usr-custom-${Date.now()}`,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: normalized,
    };
    setCurrentUser(fallbackUser);
    return { ok: true, user: fallbackUser };
  };

  const loginAsRole = (role: UserRole): User => {
    const target =
      role === 'client'
        ? MOCK_USERS.find((u) => u.id === 'usr-client-1')!
        : role === 'freelancer'
          ? MOCK_USERS.find((u) => u.id === 'usr-freelancer-1')!
          : MOCK_USERS.find((u) => u.id === 'usr-admin-1')!;
    setCurrentUser(target);
    return target;
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
  }) => {
    const newUser: User = {
      id: `usr-${payload.role}-${Date.now()}`,
      name: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      title: payload.role === 'client' ? 'Project Owner' : 'Independent Specialist',
      company: payload.role === 'client' ? 'Independent Team' : undefined,
      phone: '',
      location: 'Remote',
      skills: payload.role === 'freelancer' ? ['Product Delivery', 'Milestone Planning'] : [],
      portfolioLinks: [],
      bio: '',
      status: 'Active',
      joinedAt: new Date().toISOString().slice(0, 10),
      notificationPrefs: {
        milestoneUpdates: true,
        deliverableSubmissions: true,
        paymentStatusChanges: true,
        inactivityAlerts: true,
        disputeUpdates: true,
      },
      privacyPrefs: {
        showPortfolioPublicly: true,
        allowDirectInvites: true,
        shareActivityTimestamps: true,
      },
    };
    setCurrentUser(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUser = (partial: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        loginAsRole,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
