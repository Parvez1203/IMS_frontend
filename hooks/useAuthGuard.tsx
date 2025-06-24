import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {jwtDecode} from "jwt-decode"
import { set } from "date-fns"

type JwtPayload = {
  id: number
  unique_employee_id: string
  exp: number
}

export const useAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/")
        return
      }

      try {
        const decoded: JwtPayload = jwtDecode(token)
        if (!decoded || !decoded.id || !decoded.unique_employee_id) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }
        
        const now = Date.now() / 1000

        if (decoded.exp < now) {
          localStorage.removeItem("token")
          router.push("/")
          return
        }

        setEmployeeId(decoded.id);
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem("token")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }
  
  return { isAuthenticated, isLoading, employeeId, logout}
}
