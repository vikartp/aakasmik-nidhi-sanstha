import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '@/services/user';
import type { User } from '@/types/users';

type AuthContextType = {
  user: User | null;
  login: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const getLoggedInUser = async () => {
    if (localStorage.getItem('cus-logout-key') === 'true') return;
    const response = await getMe();
    if (response) {
      setUser(response);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      await getLoggedInUser();
    };
    fetchLoggedInUser();
  }, []);

  const login = () => {
    localStorage.setItem('cus-logout-key', 'false');
    getLoggedInUser();
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem('cus-logout-key', 'true'); // Optional: Set a flag in localStorage to indicate logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
