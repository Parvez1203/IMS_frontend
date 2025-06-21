"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package } from "lucide-react"
import { inventoryData, getProductById, getLowStockProducts } from "@/lib/data"

export function LowStockAlert() {
  const user = inventoryData.users[0]
  const lowStockItems = getLowStockProducts(user.stock_threshold)

  if (lowStockItems.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>Stock Status</span>
          </CardTitle>
          <CardDescription>All items are well stocked</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <Package className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All products are above the minimum threshold of {user.stock_threshold} pieces.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Low Stock Alert</span>
        </CardTitle>
        <CardDescription>Items below threshold of {user.stock_threshold} pieces</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{lowStockItems.length} item(s) need immediate attention for restocking.</AlertDescription>
        </Alert>

        <div className="space-y-3">
          {lowStockItems.map((stockEntry) => {
            const product = getProductById(stockEntry.product_id)
            return (
              <div key={stockEntry.id} className="flex items-center justify-between p-3 rounded-lg border bg-red-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Package className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product?.name}</p>
                    <p className="text-xs text-gray-600">Last updated: {stockEntry.entry_date}</p>
                  </div>
                </div>
                <Badge variant="destructive">{stockEntry.closing_balance} pcs left</Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
