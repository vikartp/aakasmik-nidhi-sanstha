import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem("token")
    navigate("/")
  }, [navigate])

  return null
}
