"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { StockChart } from "@/components/dashboard/stock-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated")
      if (!auth) {
        router.push("/")
        return
      }
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <StatsCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <StockChart />
        <RecentActivity />
      </div>

      <LowStockAlert />
    </div>
  )
}
