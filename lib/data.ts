import type { InventoryData } from "./types"
import data from "../data/data.json"

export const inventoryData: InventoryData = data as InventoryData

export const getProductById = (id: number) => {
  return inventoryData.products.find((p) => p.id === id)
}

export const getStockByProductId = (productId: number) => {
  return inventoryData.stock_entries.filter((s) => s.product_id === productId)
}

export const getCategoryById = (id: number) => {
  return inventoryData.product_categories.find((c) => c.id === id)
}

export const getSizeById = (id: number) => {
  return inventoryData.cloth_sizes.find((s) => s.id === id)
}

export const getUnitById = (id: number) => {
  return inventoryData.units.find((u) => u.id === id)
}

export const getTotalStock = () => {
  return inventoryData.stock_entries.reduce((total, entry) => total + entry.closing_balance, 0)
}

export const getLowStockProducts = (threshold: number) => {
  return inventoryData.stock_entries.filter((entry) => entry.closing_balance < threshold)
}

export const getRecentStockEntries = (limit = 5) => {
  return inventoryData.stock_entries
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    .slice(0, limit)
}
