import React from 'react';
import { Gift, X, Users, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom";
interface ReferralBannerProps {
  onClose: () => void;
}

const ReferralBanner: React.FC<ReferralBannerProps> = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-0 right-0 -mt-4 -mr-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-12 w-24 h-24 rounded-full bg-white opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icon */}
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Gift className="w-6 h-6" />
            </div>
            
            {/* Content */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div>
                <h3 className="text-lg font-bold">🎉 Refer & Earn Program</h3>
                <p className="text-orange-100 text-sm">
                  Earn up to ₹10,000 for every successful loan referral!
                </p>
              </div>
              
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Unlimited Referrals</span>
                </div>
                <div className="text-orange-200">•</div>
                <div>Fast Payments</div>
                <div className="text-orange-200">•</div>
                <div>No Limits</div>
              </div>
            </div>
          </div>

          {/* CTA and Close */}
          <div className="flex items-center space-x-3">
            <Link to="/referalpage">
            <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 flex items-center space-x-2 text-sm">
              <span>Start Earning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            </Link>
            <button
              onClick={onClose}
              className="text-orange-100 hover:text-white transition-colors duration-200"
              aria-label="Close referral banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile CTA */}
        <div className="md:hidden mt-3 flex justify-center">
          <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4" />
            <span>Join Referral Program</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralBanner;