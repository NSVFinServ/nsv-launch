import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Phone, ArrowLeft, Gift } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import logo from '../../components/logo.png'
import { API_BASE_URL, withApi } from '@/lib/api';

export default function ReferralPage() {
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [yourNumber, setYourNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        alert('Please login first to submit a referral');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/referral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          referrer_id: user.id,
          referred_name: contactName,
          referred_email: contactNumber, // Using contactNumber as email for simplicity
          referred_phone: contactNumber // Using contactNumber as referred phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          `Thank you! We've received your referral for ${contactName}.`
        );
        // Reset form
        setContactName("");
        setContactNumber("");
        setYourNumber("");
      } else {
        alert(data.message || 'Referral submission failed');
      }
    } catch (error) {
      console.error('Referral error:', error);
      alert('Referral submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
                <h1 className="text-xl font-bold" style={{ color: "rgb(46,46,46)" }}>
                  NSV FinServ
                </h1>
                <p className="text-xs" style={{ color: "rgb(46,46,46)" }}>
                  Your Smart Loan Partner
                </p>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold" style={{ color: "rgb(46,46,46)" }}>
              Refer & Earn Rewards
            </CardTitle>
            <CardDescription style={{ color: "rgb(46,46,46)" }}>
              Refer your contact who needs a loan and earn a prize when their
              loan is approved!
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact Name */}
              <div className="space-y-2">
                <label
                  htmlFor="contactName"
                  className="text-sm font-medium"
                  style={{ color: "rgb(46,46,46)" }}
                >
                  Contact’s Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgb(46,46,46)" }}
                  />
                  <Input
                    id="contactName"
                    type="text"
                    placeholder="Enter contact's full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-12 pl-10 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                    required
                    style={{ borderColor: "rgb(46,46,46)", color: "rgb(46,46,46)" }}
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label
                  htmlFor="contactNumber"
                  className="text-sm font-medium"
                  style={{ color: "rgb(46,46,46)" }}
                >
                  Contact’s Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgb(46,46,46)" }}
                  />
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter contact's phone number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="h-12 pl-10 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                    required
                    style={{ borderColor: "rgb(46,46,46)", color: "rgb(46,46,46)" }}
                  />
                </div>
              </div>

              {/* Your Number */}
              <div className="space-y-2">
                <label
                  htmlFor="yourNumber"
                  className="text-sm font-medium"
                  style={{ color: "rgb(46,46,46)" }}
                >
                  Your Phone Number
                </label>
                <div className="relative">
                  <Gift
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgb(46,46,46)" }}
                  />
                  <Input
                    id="yourNumber"
                    type="tel"
                    placeholder="Enter your phone number (for rewards)"
                    value={yourNumber}
                    onChange={(e) => setYourNumber(e.target.value)}
                    className="h-12 pl-10 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                    required
                    style={{ borderColor: "rgb(46,46,46)", color: "rgb(46,46,46)" }}
                  />
                </div>
              </div>

              {/* Submit Button */}
                <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-500 text-white font-medium">

                {isSubmitting ? "Submitting..." : "Submit Referral"}
              </Button>
            </form>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 text-center font-medium" style={{ color: "rgb(46,46,46)" }}>
                {successMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm" style={{ color: "rgb(46,46,46)" }}>
          <p>Need help? Contact us at</p>
          <p className="font-medium">+91-9885885847 | nsvfinserv@gmail.com</p>
        </div>
      </div>
    </div>
  );
}