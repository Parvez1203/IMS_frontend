// components/ConfirmDeleteModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
}

export default function ConfirmDeleteModal({ open, onClose, onConfirm, productName }: Props) {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete <strong>{productName}</strong>?</p>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
