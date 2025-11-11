import { Shield, Clock, Wallet, Award, Heart, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const Benefits = () => {
  const benefits = [
    {
      title: 'Trusted Lenders',
      description:
        "Access loans from India's top financial institutions known for reliability and transparent lending practices.",
      icon: Shield,
    },
    {
      title: 'Fast Loan Processing',
      description:
        'Experience quick and hassle-free loan approval with our streamlined digital application and approval processes.',
      icon: Clock,
    },
    {
      title: 'Flexible Loan Options',
      description:
        'Choose from a variety of loan products designed to meet your personal and business financial needs with flexible repayment terms.',
      icon: Wallet,
    },
    {
      title: '24/7 Customer Support',
      description:
        'Our dedicated support team is available round-the-clock to assist you with any queries related to your loan application or repayment.',
      icon: Headphones,
    },
  ];

  return (
    <section id="benefits" className="py-10 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left side: Text */}
            <div className="text-left flex flex-col justify-center" data-aos="fade-right" data-aos-delay="50">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                What Makes NSV Finserv Different?
              </h3>

              <p className="text-gray-700 leading-relaxed mb-6">
                <strong style={{ color: 'rgb(46,46,46)' }}>
                  NSV Finserv: We offer more than just loan services - we
                  provide peace of mind with these exclusive advantages.
                </strong>
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                The loan market is a maze. With hundreds of banks and thousands
                of NBFCs, each offering different rates and complex conditions,
                finding the right loan can be confusing and overwhelming. Most
                people get stuck in endless research, leaving them frustrated
                and unsure where to turn, or choose the loan from a wrong place
                and end up paying high rate of interest or adjust with low loan
                amount.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                At NSV Finserv, we solve this problem. We are your dedicated
                partner, guiding you through every step of the loan process.
                Instead of you sifting through countless offers, we do the heavy
                lifting.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We start by understanding your unique profile and financial
                goals. From there, we navigate the complex landscape of lenders
                to find the perfect loan that matches your specific criteria. We
                also go a step further: we negotiate on your behalf to lower
                your interest rate and reduce fees, saving you both time and
                money.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We provide a single, simple path forward, so you can apply with
                confidence and get the loan you need without the headache.
              </p>

              {/* Button */}
              <div className="mt-8" data-aos="fade-up" data-aos-delay="300">
                <Link to="/loan-application">
                  <button>
                    <div className="inline-block bg-gray-900 hover:bg-gray-500 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md transition-colors duration-300">
                      Get Expert Advice
                    </div>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right side: Benefit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-aos="fade-left" data-aos-delay="200">
              {benefits.map(({ title, description, icon: Icon }, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                  data-aos="zoom-in" 
                  data-aos-delay={100 + (index * 75)}
                >
                  <div className="flex items-start justify-between">
                    {/* Text Left */}
                    <div className="text-left pr-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                        {title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {description}
                      </p>
                    </div>
                    {/* Icon Right */}
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;

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
          *
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start">
                <div className="mr-3 sm:mr-4 bg-gray-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

         Banks and ROIs Section 
        {/*
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Popular Banks & Their Interest Rates</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Bank Name</th>
                  <th className="py-2 px-4 border-b text-left">Interest Rate (ROI)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-4 border-b">State Bank of India (SBI)</td><td className="py-2 px-4 border-b">7.10%</td></tr>
                <tr><td className="py-2 px-4 border-b">Bank of Baroda (BOB)</td><td className="py-2 px-4 border-b">7.25%</td></tr>
                <tr><td className="py-2 px-4 border-b">HDFC Bank</td><td className="py-2 px-4 border-b">7.00%</td></tr>
                <tr><td className="py-2 px-4 border-b">ICICI Bank</td><td className="py-2 px-4 border-b">7.05%</td></tr>
                <tr><td className="py-2 px-4 border-b">Axis Bank</td><td className="py-2 px-4 border-b">7.10%</td></tr>
                <tr><td className="py-2 px-4 border-b">Canara Bank</td><td className="py-2 px-4 border-b">7.20%</td></tr>
                <tr><td className="py-2 px-4 border-b">Punjab National Bank (PNB)</td><td className="py-2 px-4 border-b">7.15%</td></tr>
                <tr><td className="py-2 px-4 border-b">Union Bank of India</td><td className="py-2 px-4 border-b">7.00%</td></tr>
                <tr><td className="py-2 px-4 border-b">Telangana Grameena Bank</td><td className="py-2 px-4 border-b">7.30%</td></tr>
                <tr><td className="py-2 px-4 border-b">Andhra Bank</td><td className="py-2 px-4 border-b">7.05%</td></tr>
                <tr><td className="py-2 px-4 border-b">AP Mahesh Co-op Urban Bank</td><td className="py-2 px-4 border-b">7.25%</td></tr>
                <tr><td className="py-2 px-4 border-b">Karimnagar DCCB</td><td className="py-2 px-4 border-b">7.35%</td></tr>
                <tr><td className="py-2 px-4 border-b">Hyderabad DCCB</td><td className="py-2 px-4 border-b">7.28%</td></tr>
                <tr><td className="py-2 px-4 border-b">IDFC First Bank</td><td className="py-2 px-4 border-b">7.10%</td></tr>
                <tr><td className="py-2 px-4 border-b">Kotak Mahindra Bank</td><td className="py-2 px-4 border-b">7.00%</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Link to="/askexpert/page.tsx">
          <button>
          <div className="inline-block bg-gray-900 hover:bg-gray-500 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md transition-colors duration-300">
            Get Expert Advice
          </div>
          </button>
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;*/}
