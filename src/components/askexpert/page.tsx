import React, { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import logo from "../../components/logo.png"
import { API_BASE_URL } from "@/lib/api.ts"

export default function AskExpertPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    question: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/ask-expert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          question: formData.question,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("✅ Your question has been submitted! Our expert will contact you soon.")
        setFormData({ fullName: "", email: "", phone: "", question: "" })
      } else {
        console.error("Ask Expert submission failed:", data)
        alert(data.message || "Submission failed. Please try again.")
      }
    } catch (error) {
      console.error("Ask Expert error:", error)
      alert("Server connection failed. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center text-gray-900 hover:text-gray-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img
                src={logo}
                alt="NSV Finance Logo"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NSV FinServ</h1>
                <p className="text-xs text-gray-500">Your Smart Loan Partner</p>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              Ask an Expert
            </CardTitle>
            <CardDescription className="text-gray-600">
              Have a question or doubt? Our experts are here to help.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e: any) =>
                      setFormData(prev => ({ ...prev, fullName: e.target?.value ?? e }))
                }
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e: any) =>
                       setFormData(prev => ({ ...prev, email: e.target?.value ?? e }))
                }
                required
              />
              <Input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e: any) =>
                        setFormData(prev => ({ ...prev, phone: e.target?.value ?? e }))
                }
                required
              />
              <textarea
                name="question"
                placeholder="Write your doubt or question here..."
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl h-28 resize-none"
              />

              <Button
                type="submit"
                className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Question"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need assistance? Contact us at</p>
          <p className="font-medium">+91-9885885847 | nsvfinserv@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
