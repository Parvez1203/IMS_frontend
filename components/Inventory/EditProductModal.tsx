"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Unit {
  id: number
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  product: any
}

export default function EditProductModal({ open, onClose, onSave, product }: Props) {
  const [name, setName] = useState("")
  const [unitId, setUnitId] = useState<number>(1)
  const [remarks, setRemarks] = useState("")
  const [threshold, setThreshold] = useState(0)
  const [units, setUnits] = useState<Unit[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/units", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch units")
        const data = await res.json()
        setUnits(data)
      } catch (err) {
        console.error(err)
        toast({
          variant: "destructive",
          description: "Failed to load units.",
        })
      }
    }

    if (open) fetchUnits()
  }, [open])

  useEffect(() => {
    if (product) {
      setName(product.name)
      setUnitId(product.unit_id)
      setRemarks(product.remarks || "")
      setThreshold(product.stock_threshold || 0)
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await onSave({
      id: product.id,
      name,
      unit_id: unitId,
      remarks,
      stock_threshold: threshold,
    })
    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Unit</Label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(Number(e.target.value))}
              className="w-full border rounded px-2 py-2"
              required
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Remarks</Label>
            <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <div>
            <Label>Stock Threshold</Label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={0}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
