import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import logo from '../../components/logo.png'
import { API_BASE_URL, withApi } from '@/lib/api';

export default function EmailDisplayPage() {
  const [emails, setEmails] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/get-emails`)
      const data = await response.json()
      setEmails(data.emails || [])
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-gray-900 hover:text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <Button onClick={fetchEmails} disabled={isLoading} className="flex items-center">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src={logo} alt="NSV Finance Logo" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NSV FinServ</h1>
            <p className="text-sm text-gray-500">Email Display Center</p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">📧 Email Log</CardTitle>
            <CardDescription>
              This shows all emails that would be sent by the system. Check the backend console for detailed logs.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emails Yet</h3>
                <p className="text-gray-600 mb-4">
                  Try sending a test email or using the forgot password feature.
                </p>
                <div className="space-x-4">
                  <Link to="/test-email">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Send Test Email
                    </Button>
                  </Link>
                  <Link to="/forgot-password">
                    <Button variant="outline">
                      Try Forgot Password
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">To: {email.to}</h4>
                        <p className="text-sm text-gray-600">Subject: {email.subject}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(email.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div 
                      className="text-sm text-gray-700 mt-2 p-3 bg-white rounded border"
                      dangerouslySetInnerHTML={{ __html: email.content }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📋 How to Test Email System:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Go to <Link to="/test-email" className="underline">Test Email page</Link></li>
                <li>Enter your email address and send a test email</li>
                <li>Go to <Link to="/forgot-password" className="underline">Forgot Password page</Link></li>
                <li>Try both email and OTP methods</li>
                <li>Check this page to see all sent emails</li>
                <li>Check the backend console for detailed logs</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}