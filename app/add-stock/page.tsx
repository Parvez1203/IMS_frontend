"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { inventoryData, getProductById, getStockByProductId } from "@/lib/data"
import { Package, Plus, Calendar } from "lucide-react"

export default function AddStockPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0])
  const [openingQuantity, setOpeningQuantity] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      router.push("/")
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSuccess(true)
    setSelectedProduct("")
    setOpeningQuantity("")
    setRemarks("")
    setIsSubmitting(false)

    setTimeout(() => setSuccess(false), 3000)
  }

  const selectedProductData = selectedProduct ? getProductById(Number.parseInt(selectedProduct)) : null
  const currentStock = selectedProductData ? getStockByProductId(selectedProductData.id) : []
  const currentBalance = currentStock.length > 0 ? currentStock[currentStock.length - 1].closing_balance : 0

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add Stock</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New Stock Entry</span>
            </CardTitle>
            <CardDescription>Add new stock entry for existing products</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryData.products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductData && (
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Balance:</span>
                    <Badge variant="outline" className="bg-white">
                      {currentBalance} pcs
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Entry Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Opening Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={openingQuantity}
                  onChange={(e) => setOpeningQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any additional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Package className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Stock entry added successfully!</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !selectedProduct || !openingQuantity}>
                {isSubmitting ? "Adding Stock..." : "Add Stock Entry"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Stock Overview</CardTitle>
            <CardDescription>Overview of all products and their current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryData.products.map((product) => {
                const stock = getStockByProductId(product.id)
                const balance = stock.length > 0 ? stock[stock.length - 1].closing_balance : 0
                const isLowStock = balance < 100

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${isLowStock ? "bg-red-100" : "bg-green-100"}`}>
                        <Package className={`h-4 w-4 ${isLowStock ? "text-red-600" : "text-green-600"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.remarks}</p>
                      </div>
                    </div>
                    <Badge variant={isLowStock ? "destructive" : "default"}>{balance} pcs</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
