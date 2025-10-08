import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import logo from '../../components/logo.png'
import { API_BASE_URL, withApi } from '@/lib/api';
export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.message })
      }
    } catch (error) {
      console.error('Test email error:', error)
      setResult({ 
        success: false, 
        message: 'Cannot connect to server. Please make sure the backend is running.' 
      })
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

            <CardTitle className="text-2xl font-bold text-gray-900">Test Email System</CardTitle>
            <CardDescription className="text-gray-600">
              Test if the email system is working correctly
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleTestEmail} className="space-y-4">
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
                    placeholder="Enter your email to test"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* Test Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending Test Email..." : "Send Test Email"}
              </Button>
            </form>

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <p className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter your email address</li>
                <li>Click "Send Test Email"</li>
                <li>Check your email inbox</li>
                <li>If you receive the email, the system is working!</li>
              </ol>
            </div>

            {/* Troubleshooting */}
            <div className="mt-4 text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">If email doesn't work:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam folder</li>
                <li>Verify Gmail App Password is correct</li>
                <li>Ensure 2-Factor Authentication is enabled</li>
                <li>Check backend server is running</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}