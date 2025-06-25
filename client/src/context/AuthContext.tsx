import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, type User } from '@/services/user';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getLoggedInUser = async () => {
    if (localStorage.getItem('cus-logout-key') === 'true') {
      setLoading(false);
      return;
    }
    setLoading(true);
    const response = await getMe();
    if (response) {
      setUser(response);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      await getLoggedInUser();
    };
    fetchLoggedInUser();
  }, []);

  const login = async () => {
    localStorage.setItem('cus-logout-key', 'false');
    await getLoggedInUser();
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem('cus-logout-key', 'true'); // Optional: Set a flag in localStorage to indicate logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
