import React, { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { loanAPI } from '../../lib/api'  // Use the new API service
import logo from '../../components/logo.png'

export default function LoanApplicationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    aadhaar: "",
    pan: "",
    loanAmount: "",
    purpose: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        alert('Please login first to submit a loan application');
        return;
      }

      // For now, using service_id = 1 (Home Loan) - you can add a dropdown to select service
      const response = await loanAPI.submit({
        user_id: user.id,
        service_id: 1, // Default to Home Loan
        amount: parseFloat(formData.loanAmount)
      });

      alert("✅ Your application is successful! Soon our expert will be contacted with you.");
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        aadhaar: "",
        pan: "",
        loanAmount: "",
        purpose: "",
      });
    } catch (error) {
      console.error('Loan application error:', error);
      alert('Loan application submission failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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

            <CardTitle className="text-2xl font-bold text-gray-900">Loan Application</CardTitle>
            <CardDescription className="text-gray-600">
              Please fill out the form to apply for a loan
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Input
                type="text"
                name="aadhaar"
                placeholder="Aadhaar Number"
                value={formData.aadhaar}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Input
                type="text"
                name="pan"
                placeholder="PAN Number"
                value={formData.pan}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Input
                type="number"
                name="loanAmount"
                placeholder="Loan Amount (₹)"
                value={formData.loanAmount}
                onChange={handleChange}
                required
                className="h-12 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              />
              <textarea
                name="purpose"
                placeholder="Purpose of Loan"
                value={formData.purpose}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl h-24 resize-none"
              />

              <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium">
                Submit Application
              </Button>
            </form>
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