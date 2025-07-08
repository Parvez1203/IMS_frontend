"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import toast from 'react-hot-toast';

interface Unit {
  id: number
  name: string
}

interface AddProductModalProps {
  onProductAdded: () => void
}

export default function AddProductModal({ onProductAdded }: AddProductModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [unitId, setUnitId] = useState<number | null>(null)
  const [remarks, setRemarks] = useState("")
  const [stockThreshold, setStockThreshold] = useState("100")
  const [units, setUnits] = useState<Unit[]>([])

  const BaseUrl = process.env.NEXT_PUBLIC_BaseUrl || "http://localhost:3001"

  // Fetch units on mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${BaseUrl}/api/units`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch units")
        const data = await res.json()
        setUnits(data)
        if (data.length > 0) setUnitId(data[0].id)
      } catch (err) {
        toast.error("Error fetching units")
        console.error(err)
      }
    }

    fetchUnits()
  }, [])

  const handleAddProduct = async () => {
    if (!unitId) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${BaseUrl}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          unit_id: unitId,
          remarks,
          stock_threshold: parseInt(stockThreshold),
        }),
      })

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to add product")
        setOpen(false)
        setName("")
        setUnitId(units[0]?.id || null)
        setRemarks("")
        setStockThreshold("")
        onProductAdded();
        return;
      }

      toast.success("Product added successfully!")
      setOpen(false)
      setName("")
      setUnitId(units[0]?.id || null)
      setRemarks("")
      setStockThreshold("")
      onProductAdded()
    } catch (err) {
      toast.error("Failed to add product")
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:bg-black hover:text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={unitId ?? ""}
              onChange={(e) => setUnitId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Stock Threshold</Label>
            <Input
              id="threshold"
              type="number"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
