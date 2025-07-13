"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Truck, ClipboardList } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (role: string) => {
    setIsLoading(true)
    // Simulate authentication
    setTimeout(() => {
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)
      router.push("/dashboard")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Virukshaa Construction Product</CardTitle>
          <CardDescription>Construction Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Access</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => handleLogin("admin")} disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("admin")}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Super Admin</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("supervisor")}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-xs">Supervisor</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("client")}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs">Client</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("supplier")}
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-xs">Supplier</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
