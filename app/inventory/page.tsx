"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Search, Pencil, Trash2 } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { Button } from "@/components/ui/button"
import AddProductModal from "@/components/Inventory/AddProductModal"
import EditProductModal from "@/components/Inventory/EditProductModal"
import ConfirmDeleteModal from "@/components/Inventory/ConfirmDeleteModal"
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [stockEntries, setStockEntries] = useState<any[]>([])
  const [editProduct, setEditProduct] = useState<any | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<any | null>(null)
  const { isAuthenticated, isLoading } = useAuthGuard()

  const BaseUrl = process.env.NEXT_PUBLIC_BaseUrl || "http://localhost:3001"

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BaseUrl}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error("Failed to fetch products:", err)
    }
  }

  // Fetch all stock entries
  const fetchStockEntries = async () => {
    try {
      const res = await fetch(`${BaseUrl}/api/stock`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()
      setStockEntries(data)
    } catch (err) {
      console.error("Failed to fetch stock entries:", err)
    }
  }

  // Compute latest closing balance for a given product
  const getLatestClosingBalance = (productId: number) => {
    const entries = stockEntries
      .filter((entry) => entry.product_id === productId)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    return entries.length > 0 ? entries[0].closing_balance : 0
  }

  useEffect(() => {
    fetchProducts()
    fetchStockEntries()
  }, [])

  const handleEditSave = async (updatedProduct: any) => {
    try {
      const res = await fetch(`${BaseUrl}/api/products/${updatedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedProduct),
      })
      if (res.ok) {
        fetchProducts()
        setEditProduct(null)
      }
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return
    try {
      const res = await fetch(`${BaseUrl}/api/products/${deleteProduct.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (res.ok) {
        fetchProducts()
        setDeleteProduct(null)
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product Inventory</span>
          </CardTitle>
          <CardDescription>Overview of all products and their current stock levels</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <AddProductModal onProductAdded={fetchProducts} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const unit = product.unit || { name: "pcs" }
                const currentStock = getLatestClosingBalance(product.id)
                const isLowStock = currentStock < (product.stock_threshold || 100)

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>
                      <span className="font-medium">{currentStock.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLowStock ? "destructive" : "default"}>
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{product.remarks}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditProduct(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteProduct(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleEditSave}
        product={editProduct}
        units={products.map((p) => p.unit).filter((v, i, a) => v && a.findIndex(t => t.id === v.id) === i)}
      />

      <ConfirmDeleteModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteConfirm}
        productName={deleteProduct?.name || ""}
      />
    </div>
  )
}
