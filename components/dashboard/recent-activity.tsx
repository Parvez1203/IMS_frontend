"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar } from "lucide-react"

type Order = {
  id: number
  style_name: string
  quantity_used: number
  order_date: string
  product: {
    name: string
  }
}

type RecentActivityProps = {
  recentOrders: Order[]
}

export function RecentActivity({ recentOrders }: RecentActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Production Orders</CardTitle>
        <CardDescription>Latest orders and stock usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders && recentOrders.map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-gray-50/50">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{order.style_name}</p>
                <p className="text-xs text-gray-600">
                  {order.product.name} - {order.quantity_used} pcs used
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(order.order_date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
