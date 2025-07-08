"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/"

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLoginPage ? (
          children
        ) : (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <Toaster position="top-right" />
            <main className="flex-1 overflow-auto lg:ml-0">{children}</main>
          </div>
        )}
      </body>
    </html>
  )
}
