// =============================================================================
// RELIEFROUTE: Authentication & Role Context
// Provides quick role switching for faculty demonstration
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
  logout: () => void;
}

const DEFAULT_ADMIN: User = {
  id: 'usr-admin-01',
  name: 'Dr. Rajeshwar Sharma',
  email: 'admin@reliefroute.gov.in',
  role: 'ADMINISTRATOR',
  phone: '+91-98765-43210',
  organization: 'Uttarakhand State Disaster Management Authority (USDMA)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reliefroute_user');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });
  const [isLoading, setIsLoading] = useState(false);

  const role: UserRole = user ? user.role : 'ADMINISTRATOR';

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.login(newRole);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('reliefroute_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Error switching role, applying local fallback:', err);
      // Fallback local dummy user
      const fallbackUser: User = {
        id: `usr-${newRole.toLowerCase()}-01`,
        name: newRole === 'ADMINISTRATOR' ? 'Dr. Rajeshwar Sharma' : newRole === 'VOLUNTEER' ? 'Sunita Rawat' : 'Anand Mohan Joshi',
        email: `${newRole.toLowerCase()}@reliefroute.gov.in`,
        role: newRole,
        organization: newRole === 'ADMINISTRATOR' ? 'USDMA Command' : newRole === 'VOLUNTEER' ? 'Garhwal Quick Response' : 'Chamoli Resident Council'
      };
      setUser(fallbackUser);
      localStorage.setItem('reliefroute_user', JSON.stringify(fallbackUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reliefroute_user');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
