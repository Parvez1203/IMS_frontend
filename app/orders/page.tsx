// Modify only data handling and form logic to integrate with your backend API
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Plus, Calendar, Package } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export default function OrdersPage() {
  const [styleName, setStyleName] = useState("")
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedStockEntry, setSelectedStockEntry] = useState("")
  const [quantityUsed, setQuantityUsed] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState([])
  const [stockEntries, setStockEntries] = useState([])
  const [orders, setOrders] = useState([])
  const { isAuthenticated, isLoading } = useAuthGuard()

  const BaseUrl = "http://localhost:3001"

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const [pRes, sRes, oRes] = await Promise.all([
          fetch(`${BaseUrl}/api/products`, { headers }),
          fetch(`${BaseUrl}/api/stock`, { headers }),
          fetch(`${BaseUrl}/api/orders`, { headers })
        ])

        const [pData, sData, oData] = await Promise.all([
          pRes.json(), sRes.json(), oRes.json()
        ])

        setProducts(pData)
        setStockEntries(sData)
        setOrders(oData)
      } catch (error) {
        console.error("Error fetching data", error)
      }
    }

    fetchData()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${BaseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          style_name: styleName,
          order_date: orderDate,
          product_id: Number(selectedProduct),
          stock_entry_id: Number(selectedStockEntry),
          quantity_used: Number(quantityUsed),
          notes
        })
      })

      if (!res.ok) throw new Error("Failed to create order")
      const newOrder = await res.json()
      setOrders((prev) => [newOrder, ...prev])

      setSuccess(true)
      setStyleName("")
      setSelectedProduct("")
      setSelectedStockEntry("")
      setQuantityUsed("")
      setNotes("")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }


  const availableStockEntries = selectedProduct
    ? stockEntries.filter((entry) => entry.product_id === Number(selectedProduct))
    : []

  const getProductById = (id: number) => products.find((p) => p.id === id)

  if (isLoading || !isAuthenticated) return null

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Production Orders</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New Production Order</span>
            </CardTitle>
            <CardDescription>Create a new production order and allocate stock</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="styleName">Style Name</Label>
                <Input id="styleName" value={styleName} onChange={(e) => setStyleName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {availableStockEntries.length > 0 && (
                <div className="space-y-2">
                  <Label>Stock Entry</Label>
                  <Select value={selectedStockEntry} onValueChange={setSelectedStockEntry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock entry" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStockEntries.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id.toString()}>
                          {entry.entry_date} - {entry.closing_balance} pcs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Used</Label>
                <Input id="quantity" type="number" value={quantityUsed} onChange={(e) => setQuantityUsed(e.target.value)} min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Production order created successfully!</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting || !styleName || !selectedProduct || !quantityUsed}>
                {isSubmitting ? "Creating Order..." : "Create Production Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest production orders and stock usage</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Style</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.style_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{order.product?.name || getProductById(order.product_id)?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.quantity_used} pcs</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
