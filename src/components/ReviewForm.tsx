import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';// Import the new API service

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await reviewsAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        rating: formData.rating,
        reviewText: formData.message
      });

      alert('Thank you for your review! It will be published after approval.');
      setFormData({ name: '', email: '', phone: '', rating: 0, message: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Share Your Experience
          </h3>
          <p className="text-gray-600">
            Help others by sharing your experience with NSV Finserv
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <textarea
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Share your experience with NSV Finserv..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                Submit Review
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your review will be published after verification by our team.
        </p>
      </div>
    </div>
  );
};

export default ReviewForm;
