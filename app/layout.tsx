import type React from "react"
import "./globals.css"
import ClientLayout from "./clientLayout"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}<Toaster /></ClientLayout>
}

export const metadata = {
  generator: 'v0.dev'
};
