"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Calendar, Package, ShoppingCart, Filter } from "lucide-react"

type ReportType = "stock" | "orders" | null

const BaseUrl = process.env.NEXT_PUBLIC_BaseUrl || "http://localhost:3001"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null)

  const getISTDateString = (date: Date) => {
    const offset = 5.5 * 60 * 60 * 1000
    const istDate = new Date(date.getTime() + offset)
    return istDate.toISOString().split("T")[0]
  }

  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return getISTDateString(firstDayLastMonth)
  })

  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    return getISTDateString(lastDayLastMonth)
  })

  const [isExporting, setIsExporting] = useState(false)
  const [stockData, setStockData] = useState<any[]>([])
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [formattedRange, setFormattedRange] = useState("")

  // Filters
  const [stockSearch, setStockSearch] = useState("")
  const [stockStatusFilter, setStockStatusFilter] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")

  useEffect(() => {
    const formatRange = () => {
      const start = new Date(startDate).toLocaleDateString("en-IN")
      const end = new Date(endDate).toLocaleDateString("en-IN")
      setFormattedRange(`${start} - ${end}`)
    }
    formatRange()
  }, [startDate, endDate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        if (selectedReport === "stock") {
          const res = await fetch(`${BaseUrl}/api/reports/stock?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const json = await res.json()
          setStockData(json.data || [])
        }

        if (selectedReport === "orders") {
          const res = await fetch(`${BaseUrl}/api/reports/orders?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const json = await res.json()
          setOrdersData(json.data || [])
        }
      } catch (err) {
        console.error("Failed to fetch report data", err)
      }
    }

    fetchData()
  }, [selectedReport, startDate, endDate])

  const exportToCSV = (data: any[], filename: string) => {
    setIsExporting(true)

    if (data.length === 0) {
      alert("No data to export")
      setIsExporting(false)
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && (value.includes(",") || value.includes("\""))
              ? `"${value.replace(/"/g, '""')}"`
              : value
          })
          .join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}_${startDate}_to_${endDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => setIsExporting(false), 1000)
  }

  const reportCards = [
    {
      id: "stock" as ReportType,
      title: "Current Stock Details",
      description: "Detailed report of all products and their current stock levels",
      icon: Package,
      count: stockData.length,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      id: "orders" as ReportType,
      title: "Orders Details",
      description: "Production orders and stock usage details",
      icon: ShoppingCart,
      count: ordersData.length,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
  ]

  const filteredStockData = stockData.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(stockSearch.toLowerCase())
    const matchesStatus =
      stockStatusFilter === "all" ||
      (stockStatusFilter === "in_stock" && item.status === "In Stock") ||
      (stockStatusFilter === "low_stock" && item.status === "Low Stock")
    return matchesSearch && matchesStatus
  })

  const filteredOrdersData = ordersData.filter((order) => {
    return (
      order.styleName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.productName.toLowerCase().includes(orderSearch.toLowerCase())
    )
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Date Range Filter</span>
          </CardTitle>
          <CardDescription>Select date range for reports (default: last month)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportCards.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedReport === report.id ? report.color : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <report.icon className={`h-5 w-5 ${report.iconColor}`} />
                  <span>{report.title}</span>
                </div>
                <Badge variant="outline">{report.count} records</Badge>
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Date range: {formattedRange}</span>
                {selectedReport === report.id && <Badge>Selected</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Table */}
      {selectedReport === "stock" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Stock Report</span>
                </CardTitle>
                <CardDescription>Showing {filteredStockData.length} of {stockData.length} stock entries</CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredStockData, "stock_report")}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export to CSV"}
              </Button>
            </div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <Input
                type="text"
                placeholder="Search by product name"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStockData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Entry Date</TableHead>
                    <TableHead>Opening Qty</TableHead>
                    <TableHead>Closing Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{new Date(item.entryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.openingQuantity}</TableCell>
                      <TableCell>{item.closingBalance}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "default"}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{item.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>No stock entries found for the selected filters.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {selectedReport === "orders" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Orders Report</span>
                </CardTitle>
                <CardDescription>Showing {filteredOrdersData.length} of {ordersData.length} orders</CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredOrdersData, "orders_report")}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export to CSV"}
              </Button>
            </div>
            {/* Filter */}
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Search by style or product name"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrdersData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Style Name</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Quantity Used</TableHead>
                    <TableHead>Stock Entry ID</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdersData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.styleName}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.unit}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>{order.quantityUsed}</TableCell>
                      <TableCell>{order.stockEntryId}</TableCell>
                      <TableCell className="text-sm text-gray-600">{order.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <ShoppingCart className="h-4 w-4" />
                <AlertDescription>No production orders found for the selected filters.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
