"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Calendar } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { toast } from "@/components/ui/use-toast"

export default function AddStockPage() {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [entryDate, setEntryDate] = useState(() => {
    const indiaOffset = 5.5 * 60 * 60 * 1000
    const nowIST = new Date(Date.now() + indiaOffset)
    return nowIST.toISOString().split("T")[0]
  })
  const [openingQuantity, setOpeningQuantity] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { isAuthenticated, isLoading } = useAuthGuard()

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to fetch products." })
    }
  }

  const fetchClosingBalances = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/stock", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()

      const latestStockMap = new Map()
      data.forEach((entry: any) => {
        if (!latestStockMap.has(entry.product_id)) {
          latestStockMap.set(entry.product_id, entry)
        }
      })

      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          closing_balance: latestStockMap.get(product.id)?.closing_balance || 0,
        }))
      )
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to fetch stock balances." })
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      fetchClosingBalances()
    }
  }, [products])

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId))
  const currentBalance = selectedProduct?.closing_balance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("http://localhost:8000/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          entry_date: entryDate,
          opening_quantity: Number(openingQuantity),
          remarks,
        }),
      })

      if (!res.ok) throw new Error("Failed to add stock")

      setSuccess(true)
      setOpeningQuantity("")
      setRemarks("")
      setSelectedProductId("")
      fetchClosingBalances() // refresh after new entry
    } catch (error) {
      toast({ variant: "destructive", description: "Error adding stock entry." })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Add Stock</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Card */}
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
              <div>
                <Label>Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Balance:</span>
                    <Badge variant="outline" className="bg-white">
                      {currentBalance} pcs
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <Label>Entry Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Opening Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={openingQuantity}
                  onChange={(e) => setOpeningQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label>Remarks (Optional)</Label>
                <Textarea
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !selectedProductId || !openingQuantity}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding Stock...</span>
                  </span>
                ) : (
                  "Add Stock Entry"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Overview</CardTitle>
            <CardDescription>Overview of all products and their current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => {
                const isLowStock = (product.closing_balance || 0) < (product.stock_threshold || 100)

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
                    <Badge variant={isLowStock ? "destructive" : "default"}>
                      {product.closing_balance || 0} pcs
                    </Badge>
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
