export interface User {
  id: number
  first_name: string
  last_name: string
  unique_employee_id: string
  position: string
  department: string
  joining_date: string
  is_active: boolean
  stock_threshold: number
}

export interface ProductCategory {
  id: number
  name: string
}

export interface ClothSize {
  id: number
  name: string
}

export interface Unit {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  cloth_size_id: number
  category_id: number
  unit_id: number
  remarks: string
}

export interface StockEntry {
  id: number
  product_id: number
  entry_date: string
  opening_quantity: number
  closing_balance: number
}

export interface ProductionOrder {
  id: number
  style_name: string
  order_date: string
  notes: string
  product_id: number
  stock_entry_id: number
  quantity_used: number
}

export interface InventoryData {
  users: User[]
  product_categories: ProductCategory[]
  cloth_sizes: ClothSize[]
  units: Unit[]
  products: Product[]
  stock_entries: StockEntry[]
  production_orders: ProductionOrder[]
}
