"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, ClipboardList } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (role: string) => {
    setIsLoading(true);
    
    try {
      // For demo roles, use the existing flow
      if (role !== 'admin') {
        const validRoles = ['superadmin', 'supervisor', 'client'];
        const userRole = validRoles.includes(role) ? role : 'client';
        
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userEmail", email);
        router.push("/dashboard");
        return;
      }

      // For admin login, use the login API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Login successful
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("adminName", data.user.adminName || 'Admin');
      router.push("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      // Simple error handling
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

              <Button 
                onClick={() => handleLogin("admin")} 
                disabled={isLoading}
                className={`  w-full ${isLoading ? "bg-gray-400" : ""}`}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("superadmin")}
                >
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="font-medium">Super Admin</span>
                  <span className="text-xs text-muted-foreground">Full system access</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("supervisor")}
                >
                  <ClipboardList className="w-6 h-6 text-green-600" />
                  <span className="font-medium">Supervisor</span>
                  <span className="text-xs text-muted-foreground">Project management</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 bg-transparent"
                  onClick={() => handleLogin("client")}
                >
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <span className="font-medium">Client</span>
                  <span className="text-xs text-muted-foreground">Project tracking</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
