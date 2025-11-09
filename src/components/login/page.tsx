import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import logo from '../../components/logo.png'
import { API_BASE_URL, withApi } from '@/lib/api.ts';
import { sendLoginNotification } from '@/lib/LoginNotification';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
  // Store token in localStorage
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  // ✅ SEND TELEGRAM NOTIFICATION (non-blocking)
  sendLoginNotification({
    name: data.user.name,
    email: data.user.email || email,
    phone: data.user.phone || data.user.mobile,
    id: data.user.id || data.user._id,
  }).catch((err) => {
    // Silent fail - don't block login if notification fails
    console.error('Notification error:', err);
  });
  
  // Show success message
  alert(`Welcome back, ${data.user.name}!`)
        
        // Check if admin login
        if (email === 'admin@nsvfinserv.com' && password === 'password') {
          window.location.href = '/admin'
        } else {
          // Redirect to main page for regular users
          window.location.href = '/'
        }
      } else {
        // Better error handling
        if (response.status === 401) {
          alert('Invalid email or password. Please check your credentials.')
        } else if (response.status === 500) {
          alert('Server error. Please try again later.')
        } else {
          alert(data.message || 'Login failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Please make sure the backend is running.')
      } else {
        alert('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link to="/" className="inline-flex items-center text-gray-900 hover:text-gray-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src={logo} alt="NSV Finance Logo" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NSV FinServ</h1>
                <p className="text-xs text-gray-500">Your Smart Loan Partner</p>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to access your loan dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-gray-900 hover:text-gray-500">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link to="/signup" className="text-gray-900 hover:text-gray-500 font-medium">
                Create a new account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Contact us at</p>
          <p className="font-medium">+91-9885885847 | nsvfinserv@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
