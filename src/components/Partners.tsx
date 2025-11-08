import Avanse from './images/Avanse.png';
import HDFC from './images/HDFC.png';
import Nomad from './images/nomad.jpg';
import Poonewalla from './images/poonewalla.jpg';
import PSB from './images/PSB.jpg';
import SBI from './images/SBI.jpg';
import Tata from './images/Tata.jpg';
import union from './images/union.png';
import React from 'react';
import { Shield, Award } from 'lucide-react';

const Partners = () => {
  const partnerLogos = [
    { name: 'Avanse', logo: Avanse },
    { name: 'HDFC', logo: HDFC },
    { name: 'Nomad', logo: Nomad },
    { name: 'Poonewalla Finance', logo: Poonewalla },
    { name: 'Punjab And Sind Bank', logo: PSB },
    { name: 'SBI Housing Loan', logo: SBI },
    { name: 'Tata Capital', logo: Tata },
    { name: 'Union Bank', logo: union },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Award className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Our Trusted Loan Partners
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We've partnered with 51 leading Loan providers to offer you the best policy at competitive rates.
          </p>
        </div>

        {/* Partner Logos */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8" data-aos="fade-up" data-aos-delay="100">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
            {partnerLogos.map((partner, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center p-2 sm:p-4 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                data-aos="zoom-in"
                data-aos-delay={100 * (index + 1)}
              >
                <div className="bg-white p-3 sm:p-4 rounded-full shadow-sm mb-2 sm:mb-3">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`} 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain" 
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4" data-aos="fade-up" data-aos-delay="200">
            <div className="bg-gray-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">RBI Registered</h3>
              <p className="text-sm text-gray-600">All our partners are registered with the Reserve Bank Of India.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4" data-aos="fade-up" data-aos-delay="300">
            <div className="bg-gray-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Loan Grant Ratio</h3>
              <p className="text-sm text-gray-600">Our partners maintain an average loan grant ratio of 98%, ensuring your loans are processed smoothly.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start space-x-4" data-aos="fade-up" data-aos-delay="400">
            <div className="bg-gray-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">24/7 Customer Support</h3>
              <p className="text-sm text-gray-600">All our loan partners provide round-the-clock customer support for policy and loan related queries.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
