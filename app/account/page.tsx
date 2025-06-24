"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { inventoryData } from "@/lib/data"
import { User, Mail, Lock, Save, Shield } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export default function AccountPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const { isAuthenticated, isLoading, employeeId } = useAuthGuard()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`http://localhost:8000/users/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch user")
      }

      const data = await res.json()
      setUser(data)
      setFirstName(data.first_name || "")
      setLastName(data.last_name || "")
      setEmail(data.email || "ankit@inventory.com") // fallback
    } catch (err) {
      console.error("Error fetching user:", err)
    }
  }

  if (employeeId) {
    fetchUser()
  }
}, [employeeId])



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsUpdating(true)
  setError("")
  setSuccess("")

  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`http://localhost:8000/users/${employeeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || "Failed to update profile")
    } else {
      setSuccess("Profile updated successfully!")
    }
  } catch (err: any) {
    setError("Something went wrong while updating profile.")
    console.error(err)
  }

  setIsUpdating(false)
  setTimeout(() => setSuccess(""), 3000)
}

const handlePasswordUpdate = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsUpdating(true)
  setError("")
  setSuccess("")

  if (newPassword !== confirmPassword) {
    setError("New passwords don't match")
    setIsUpdating(false)
    return
  }

  if (newPassword.length < 6) {
    setError("Password must be at least 6 characters")
    setIsUpdating(false)
    return
  }

  const token = localStorage.getItem("token")

  try {
    const res = await fetch(`http://localhost:8000/users/${employeeId}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || "Failed to update password")
    } else {
      setSuccess(data.message || "Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  } catch (err: any) {
    setError("Something went wrong while updating password.")
    console.error(err)
  }

  setIsUpdating(false)
  setTimeout(() => setSuccess(""), 3000)
}


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={user?.unique_employee_id} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={user?.position} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={user?.department} disabled />
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>Change your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* <div className="space-y-3">
              <h4 className="text-sm font-medium">Stock Alert Threshold</h4>
              <div className="flex items-center space-x-2">
                <Input type="number" value={user?.stock_threshold} disabled className="w-20" />
                <span className="text-sm text-gray-600">pieces</span>
              </div>
              <p className="text-xs text-gray-500">You'll receive alerts when stock falls below this threshold</p>
            </div> */}
          </CardContent>
        </Card>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Save className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
