import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '@/services/user';
import type { User } from '@/types/users';

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const getLoggedInUser = async () => {
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
    }
    fetchLoggedInUser();
  }, []);

  const login = () => {
    getLoggedInUser();
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
