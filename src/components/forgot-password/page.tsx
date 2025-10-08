import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, CheckCircle, Phone } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import logo from '../../components/logo.png'
import { API_BASE_URL, withApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [method, setMethod] = useState("email") // "email" or "otp"

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First check if email exists in database
      const checkResponse = await fetch(`${API_BASE_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        alert(checkData.message || 'Error checking email. Please try again.')
        return
      }

      if (!checkData.exists) {
        alert('No account found with this email address. Please check your email or create a new account.')
        return
      }

      // Email exists, now send reset link
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, method: 'email' }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
      } else {
        alert(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      alert('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First check if phone exists in database
      const checkResponse = await fetch(`${API_BASE_URL}/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        alert(checkData.message || 'Error checking phone. Please try again.')
        return
      }

      if (!checkData.exists) {
        alert('No account found with this phone number. Please check your phone number or create a new account.')
        return
      }

      // Phone exists, now send OTP
      const response = await fetch(`${API_BASE_URL}/forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        alert('OTP sent! Check your email for the 6-digit code.')
      } else {
        alert(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('OTP error:', error)
      alert('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('OTP verified! You can now reset your password.')
        // Redirect to reset password page with token
        window.location.href = `/reset-password?token=${data.resetToken}`
      } else {
        alert(data.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      alert('Failed to verify OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img src={logo} alt="NSV Finance Logo" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">NSV FinServ</h1>
                  <p className="text-xs text-gray-500">Your Smart Loan Partner</p>
                </div>
              </div>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-900">Email Sent!</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <Link to="/login">
                  <Button className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium">
                    Back to Login
                  </Button>
                </Link>
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="text-gray-900 hover:text-gray-500 font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Link to="/login" className="inline-flex items-center text-gray-900 hover:text-gray-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
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

            <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
            <CardDescription className="text-gray-600">
              Choose how you'd like to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Method Selection */}
            <div className="flex space-x-2 mb-6">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  method === "email"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("otp")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  method === "otp"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                OTP
              </button>
            </div>

            {/* Email Method */}
            {method === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            {/* OTP Method */}
            {method === "otp" && !otpSent && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* OTP Verification */}
            {method === "otp" && otpSent && (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Resend OTP
                </button>
              </form>
            )}

            {/* Contact Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Need help? Contact us at</p>
              <p className="font-medium">+91-9885885847 | nsvfinserv@gmail.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}