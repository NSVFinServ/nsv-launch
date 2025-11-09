// ✅ Import your loan images
import personalLoanImg from './personal.png';
import mortgageLoanImg from './mortgage.png';
import vehicleLoanImg from './vehicle.png';
import goldLoanImg from './gold.png';
import homeLoanImg from './home.png';
import businessLoanImg from './business.png';
import educationLoanImg from './education.png';
import loanTransferImg from './loan-transfer.png';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const loanTypes = [
    {
      image: personalLoanImg,
      title: 'Personal Loan',
      description: 'Get instant personal loans with flexible EMIs and quick approval.',
      badge: 'Most Popular',
    },
    {
      image: mortgageLoanImg,
      title: 'Mortgage Loan',
      description: 'Unlock the value of your property with easy mortgage loans.',
      badge: 'Best Value',
    },
    {
      image: vehicleLoanImg,
      title: 'Vehicle Loan',
      description: 'Own your dream car or bike with our affordable vehicle loans.',
      badge: 'Easy EMI',
    },
    {
      image: goldLoanImg,
      title: 'Gold Loan',
      description: 'Get instant cash against your gold with minimal documentation.',
      badge: 'Quick Cash',
    },
    {
      image: homeLoanImg,
      title: 'Home Loan',
      description: 'Buy your dream house with our low-interest home loans.',
      badge: 'Low Interest',
    },
    {
      image: businessLoanImg,
      title: 'Business Loan',
      description: 'Fuel your business growth with our customized business loans.',
      badge: 'For SMEs',
    },
    {
      image: educationLoanImg,
      title: 'Educational Loan',
      description: 'Pursue your higher studies with our easy educational loans.',
      badge: 'Student Friendly',
    },
    {
      image: loanTransferImg,
      title: 'Loan Transfer',
      description: 'Transfer your existing loan to us and save big on EMIs.',
      badge: 'Save More',
    },
  ];

  return (
    <section id="services" className="py-16 bg-white" data-aos="fade-left" data-aos-delay="50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Loan Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quick, easy & hassle-free loans designed to meet your every need.
            Choose the right loan and get started today!
          </p>
        </div>

        {/* Loan Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {loanTypes.map((loan, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative"
               data-aos="zoom-in" data-aos-delay={150+(index * 50)}
            >
              {/* Badge */}
              {loan.badge && (
                <div className="absolute top-2 left-0 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-r-md">
                  {loan.badge}
                </div>
              )}

              {/* Image */}
              <div className="p-8 flex flex-col items-center">
                <div className="bg-[#fffcf5] rounded-full w-32 h-32 flex items-center justify-center mb-6 shadow">
                  <img
                    src={loan.image}
                    alt={loan.title}
                    className="w-20 h-20 object-contain mx-auto"
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {loan.title}
                </h3>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {loan.description}
                </p>
              </div>

              {/* CTA Button */}
              <Link to="/loan-application">
                <button className="w-full bg-gray-50 text-gray-900 py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-all duration-200 flex items-center justify-center space-x-1">
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
