import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import logo from "../../components/logo.png";
import { API_BASE_URL } from "@/lib/api.ts";
import { sendExpertAdviceNotification } from "@/lib/notificationService";

export default function AskExpertPage() {
  const location = useLocation();
  const prefill = location.state || {};

  const [formData, setFormData] = useState({
    fullName: prefill.fullName || "",
    email: prefill.email || "",
    phone: prefill.phone || "",
    question: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      });

      const data = await response.json();

      if (response.ok) {
        sendExpertAdviceNotification({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          question: formData.question,
          category: "General",
        });

        alert("Your question has been submitted!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          question: "",
        });
      } else {
        alert(data.message || "Submission failed.");
      }
    } catch (error) {
      alert("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center text-gray-900 hover:text-gray-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img
                src={logo}
                alt="NSV Logo"
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-2">
                <h1 className="text-xl font-bold">NSV FinServ</h1>
              </div>
            </div>

            <CardTitle>Ask an Expert</CardTitle>
            <CardDescription>
              Our experts will assist you with your query.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <textarea
                name="question"
                placeholder="Write your question here..."
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl h-28 resize-none"
              />

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
