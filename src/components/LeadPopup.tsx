import React, { useState } from 'react'
import { X, User, Mail, Phone, IndianRupee, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LeadPopupProps {
  onClose: () => void
}

const LeadPopup: React.FC<LeadPopupProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loanType: '',
    loanAmount: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const loanTypes = [
    'Home Loan',
    'Car Loan',
    'Personal Loan',
    'Business Loan',
    'Education Loan',
    'Loan Against Property',
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // ✅ WhatsApp redirect
    const whatsappNumber = '+91-9885885847'
    const whatsappMessage = `Hello, I am ${formData.name}. I am interested in a ${formData.loanType} of ${formData.loanAmount}. Please connect me with an expert.`
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`
    window.open(whatsappUrl, '_blank')

    // ✅ Auto-close after redirect
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // ✅ Close when clicking outside
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fadeIn max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // ✅ Prevent inside clicks from closing
      >
        {/* Header */}
        <div className="bg-[rgb(46,46,46)] text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-xl font-bold mb-2">Get Your Best Loan Offer</h3>
          <p className="text-gray-200 text-sm">
            Fill in your details and we'll connect you with a loan expert instantly!
          </p>
        </div>

        {/* ✅ Scrollable form content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)]"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)]"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)]"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Loan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Type *
                </label>
                <select
                  name="loanType"
                  required
                  value={formData.loanType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)] bg-white"
                >
                  <option value="">Select loan type</option>
                  {loanTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount Required
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)]"
                    placeholder="e.g., 10 Lakhs"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(46,46,46)] focus:border-[rgb(46,46,46)] resize-none"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[rgb(46,46,46)] text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:opacity-90 hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Get Best Offers</span>
                  </>
                )}
              </button>

              {/* Apply Now link */}
              <div className="text-center mt-4">
                <Link
                  to="/loan-application"
                  className="text-[rgb(46,46,46)] hover:underline font-medium"
                  onClick={onClose}
                >
                  👉 Apply Now for Full Loan Application
                </Link>
              </div>
            </form>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LeadPopup