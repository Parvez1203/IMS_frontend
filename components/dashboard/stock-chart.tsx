"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", stock: 450, used: 120 },
  { month: "Feb", stock: 380, used: 150 },
  { month: "Mar", stock: 520, used: 180 },
  { month: "Apr", stock: 393, used: 107 },
  { month: "May", stock: 420, used: 90 },
  { month: "Jun", stock: 480, used: 140 },
]

const chartConfig = {
  stock: {
    label: "Stock Balance",
    color: "hsl(var(--chart-1))",
  },
  used: {
    label: "Stock Used",
    color: "hsl(var(--chart-2))",
  },
}

export function StockChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
        <CardDescription>Monthly stock balance and usage trends</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="stock" fill="var(--color-stock)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="used" fill="var(--color-used)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
