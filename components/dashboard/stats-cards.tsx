"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, AlertTriangle, Clock } from "lucide-react"
import { inventoryData, getTotalStock, getLowStockProducts, getRecentStockEntries } from "@/lib/data"

export function StatsCards() {
  const totalStock = getTotalStock()
  const lowStockItems = getLowStockProducts(100)
  const recentEntries = getRecentStockEntries()
  const totalProducts = inventoryData.products.length

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      trend: "+12%",
      trendUp: true,
      description: "Active products",
    },
    {
      title: "Total Stock",
      value: totalStock.toLocaleString(),
      icon: TrendingUp,
      trend: "+8%",
      trendUp: true,
      description: "Pieces in inventory",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      trend: lowStockItems.length > 0 ? "Attention needed" : "All good",
      trendUp: lowStockItems.length === 0,
      description: "Items below threshold",
    },
    {
      title: "Recent Entries",
      value: recentEntries.length.toString(),
      icon: Clock,
      trend: "This week",
      trendUp: true,
      description: "New stock entries",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Badge variant={stat.trendUp ? "default" : "destructive"} className="text-xs">
                {stat.trend}
              </Badge>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
