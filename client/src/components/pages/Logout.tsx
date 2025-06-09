import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function Logout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    logout()
    navigate("/")
  }, [logout, navigate])

  return null
}
