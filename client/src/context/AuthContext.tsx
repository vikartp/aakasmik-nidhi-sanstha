import { createContext, useContext, useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

type User = {
  id: string
  mobile: string
  exp: number
}

type AuthContextType = {
  user: User | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: User = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded)
        } else {
          localStorage.removeItem("token")
        }
      } catch {
        localStorage.removeItem("token")
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem("token", token)
    const decoded: User = jwtDecode(token)
    setUser(decoded)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)!
