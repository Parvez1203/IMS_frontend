"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { StockChart } from "@/components/dashboard/stock-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { useAuthGuard } from "@/hooks/useAuthGuard"

type DashboardData = {
  totalProducts: number
  totalStock: number
  lowStockItems: {
    id: number
    name: string
    closing_balance: number
    entry_date: string
  }[]
  recentProductionOrders: {
    id: number
    style_name: string
    quantity_used: number
    product: {
      name: string
    }
    order_date: string
  }[]
  recentEntries: {
    id: number
    product_id: number
    entry_date: string
  }[]
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuthGuard()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Server responded with ${res.status}: ${errorText}`)
        }

        const data: DashboardData = await res.json()
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Global loading spinner
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Auth guard or data fetch failure
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">You must be logged in to view this page.</p>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">{error || "Something went wrong."}</p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <StatsCards
        totalProducts={dashboardData.totalProducts}
        totalStock={dashboardData.totalStock}
        lowStockCount={dashboardData.lowStockItems?.length || 0}
        recentEntriesCount={dashboardData.recentEntries?.length || 0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <StockChart />
        <RecentActivity recentOrders={dashboardData.recentProductionOrders || []} />
      </div>

      <LowStockAlert lowStockItems={dashboardData.lowStockItems || []} />
    </div>
  )
}
