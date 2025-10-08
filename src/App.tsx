import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './Services'; // ✅ fixed import path
import Partners from './components/Partners';
import Benefits from './components/Benefits';
import EligibilityCalculator from './components/EligibilityCalculator';
import Calculators from './components/Calculators';
import RegulatoryUpdates from './components/RegulatoryUpdates';
import CustomerReviews from './components/CustomerReviews';
import TestimonialVideos from './components/TestimonialVideos';
import Footer from './components/Footer';
import LeadPopup from './components/LeadPopup';
import ReferralBanner from './components/ReferralBanner';
import EventBanner from './components/EventBanner';

import { trackPageView } from './lib/analytics';

function App() {
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [showReferralBanner, setShowReferralBanner] = useState(true);


  useEffect(() => {
    // Track page view when component mounts
    trackPageView('home');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {showReferralBanner && (
        <ReferralBanner onClose={() => setShowReferralBanner(false)} />
      )}

      <Hero />
      <Benefits />
      <EventBanner />
      <Services />
      <EligibilityCalculator />
      <Calculators />
      <Partners />
      <RegulatoryUpdates />
      <CustomerReviews />
      <TestimonialVideos />
      <Footer />

      {/* Floating Lead Capture Button */}
      <button
        onClick={() => setShowLeadPopup(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-40 animate-pulse"
        aria-label="Get Quote"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>



      {showLeadPopup && <LeadPopup onClose={() => setShowLeadPopup(false)} />}

    </div>
  );
}

export default App;