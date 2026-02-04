import React from 'react';
import { ArrowRight, Shield, Clock, Users, Award } from 'lucide-react';

const Hero = () => {
  const stats = [
    { icon: Users, value: '400+', label: 'Happy Customers' },
    { icon: Award, value: '51', label: 'Insurance Partners' },
    { icon: Clock, value: '24 hrs', label: 'Quick Approval' },
    { icon: Shield, value: '100%', label: 'Secure Process' },
  ];

  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div data-aos="fade-right" data-aos-delay="100">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-600 leading-tight">
                Let's find you
                <span className="text-gray-900"> the Best Loan</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mt-6 leading-relaxed">
                51 loaners offering lowest prices. Quick, easy & hassle free.
                Compare loan plans and get the best coverage at the lowest premiums.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4" data-aos="fade-up" data-aos-delay="300">
              <a href="#services">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-500 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                <span>View Services</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              </a>
              {/*<button className="border-2 border-gray-900 text-gray-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold">
                Compare Quotes
              </button>*/}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-4 text-sm text-gray-500" data-aos="fade-up" data-aos-delay="500">
              
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>0% GST on Term Plans</span>
              </div>
            </div>
          </div>

          {/* Visual/Stats */}
          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Choose NSV Finance?
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center" data-aos="zoom-in" data-aos-delay={300 + (index * 100)}>
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <IconComponent className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-100 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
