import React, { useState, useEffect } from 'react';
import { Star, Quote, ThumbsUp, Clock, Shield, Award, Send } from 'lucide-react';
import { reviewsAPI } from '../lib/api';  // Import the new API service

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  loan_type: string;
  loan_amount: string;
  review_text: string;
  created_at: string;
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewsAPI.getAll();
        setReviews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewForm.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await reviewsAPI.submit({
        name: reviewForm.name,
        email: reviewForm.email,
        phone: reviewForm.phone,
        rating: reviewForm.rating,
        reviewText: reviewForm.message
      });

      alert('Thank you for your review! It will be published after approval.');
      setReviewForm({ name: '', email: '', phone: '', rating: 0, message: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setReviewForm({ ...reviewForm, rating });
  };

  // Calculate time ago from timestamp
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const reviewDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const overallStats = {
    totalReviews: reviews.length || 0,
    averageRating: reviews.length ? 
      parseFloat((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 
      0,
    recommendationRate: 98, // This could be calculated from actual data if available
    successRate: 95, // This could be calculated from actual data if available
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who chose NSV Finserv for their loan needs. 
            Read real experiences from real people.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold mb-2" style={{ color: "rgb(46,46,46)" }}>
              {overallStats.totalReviews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold mb-2 flex items-center justify-center" style={{ color: "rgb(46,46,46)" }}>
              {overallStats.averageRating}
              <Star className="w-6 h-6 text-yellow-500 ml-1 fill-current" />
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold mb-2" style={{ color: "rgb(46,46,46)" }}>
              {overallStats.recommendationRate}%
            </div>
            <div className="text-sm text-gray-600">Would Recommend</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold mb-2" style={{ color: "rgb(46,46,46)" }}>
              {overallStats.successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            // Loading state
            <>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      ))}
                    </div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            // Error state
            <div className="col-span-3 text-center py-10">
              <div className="text-red-500 mb-2">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="text-white px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            // No reviews state
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500 mb-2">No reviews available yet.</p>
              <p className="text-gray-500">Be the first to share your experience!</p>
            </div>
          ) : (
            // Reviews display
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Quote Icon */}
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 opacity-50" style={{ color: "rgb(46,46,46)" }} />
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 mb-4 leading-relaxed italic">
                  "{review.review_text}"
                </p>

                {/* Loan Details */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Loan Type:</span>
                    <span className="font-medium" style={{ color: "rgb(46,46,46)" }}>{review.loan_type}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">{review.loan_amount}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-600">{review.location}</div>
                  </div>
                  <div className="text-xs text-gray-500">{getTimeAgo(review.created_at)}</div>
                </div>
              </div>
            ))
          )}

        {/* Add Review Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Experience
            </h3>
            <p className="text-gray-600 mb-6">
              Help others by sharing your experience with NSV Finserv
            </p>
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Write a Review
              </button>
            ) : (
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={reviewForm.phone}
                      onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Rating *
                  </label>
                  <div className="flex justify-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {reviewForm.rating > 0 && (
                    <p className="text-center text-sm text-gray-500">
                      {reviewForm.rating} star{reviewForm.rating > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={reviewForm.message}
                    onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                    placeholder="Share your experience with NSV Finserv..."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center mx-auto"
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
                  <p className="text-xs text-gray-500 mt-3">
                    Your review will be published after verification by our team.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
        </div>

        {/* Why Choose NSV Finserv
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            What Makes NSV Finserv Different?
          </h3>

          <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
            <strong style={{ color: "rgb(46,46,46)" }}>NSV Finserv: Your Partner for Smarter Loan Solutions.</strong>
          </p>
          <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
            The loan market is a maze. With hundreds of banks and thousands of NBFCs, each offering different rates and complex conditions, finding the right loan can be confusing and overwhelming. 
            Most people get stuck in endless research, leaving them frustrated and unsure where to turn, or choose the loan from a wrong place and end up paying high rate of interest or adjust with low loan amount.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
            At NSV Finserv, we solve this problem. We are your dedicated partner, guiding you through every step of the loan process. Instead of you sifting through countless offers, we do the heavy lifting.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
            We start by understanding your unique profile and financial goals. From there, we navigate the complex landscape of lenders to find the perfect loan that matches your specific criteria. 
            We also go a step further: we negotiate on your behalf to lower your interest rate and reduce fees, saving you both time and money.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto">
            We provide a single, simple path forward, so you can apply with confidence and get the loan you need without the headache.
          </p>

          {/* CTA Section
          <div className="text-center mt-12 pt-8 border-t border-gray-100">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Ready to Join Our Happy Customers?
            </h4>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get started with your loan application today and experience the NSV Finserv difference. 
              Our experts are ready to help you find the perfect loan solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium"
                style={{ backgroundColor: "rgb(46,46,46)" }}
              >
                Apply Now
              </button>
              <button
                className="border-2 px-8 py-3 rounded-lg transition-colors duration-200 font-medium"
                style={{ borderColor: "rgb(46,46,46)", color: "rgb(46,46,46)" }}
              >
                Talk to Expert
              </button>
            </div>
          </div>
        </div>*/}
      </div>
    </section>
  );
};

export default CustomerReviews;