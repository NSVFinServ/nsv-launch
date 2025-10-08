import React from 'react';
import { Phone, Mail, MapPin, Facebook, X, Instagram, Youtube } from 'lucide-react';
import logo from './logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Loan Services', href: '#services' },
    { name: 'Calculators', href: '#calculators' },
    { name: 'Contact', href: '#contact' },
  ];

  const loanTypes = [
    { name: 'Personal Loan', href: '#personal-loan' },
    { name: 'Home Loan', href: '#home-loan' },
    { name: 'Vehicle Loan', href: '#vehicle-loan' },
    { name: 'Business Loan', href: '#business-loan' },
    { name: 'Education Loan', href: '#education-loan' },
    { name: 'Gold Loan', href: '#gold-loan' },
    { name: 'Loan Transfer', href: '#loan-transfer' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-conditions' }
  ];

  return (
    <footer id="contact" className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="NSV Finance Logo" className="w-10 h-10 rounded-full object-cover"/>
              <div>
                <h3 className="text-xl font-bold">NSV FinServ</h3>
                <p className="text-gray-400 text-sm">Your Smart Loan Partner</p>
              </div>
            </div>
{/*             
            <p className="text-gray-300 leading-relaxed">
              NSV Finance is a leading loan comparison platform connecting customers 
              with top loan providers across India. We ensure the best rates and terms 
              for all your loan needs.
            </p> */}

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-white-400" />
                <span className="text-gray-300">+91-9885885847</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-white-400" />
                <span className="text-gray-300">nsvfinserv@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-white-400 mt-1" />
                <span className="text-gray-300">
                  123 Business Center, Financial District,<br />
                  Mumbai - 400001, Maharashtra
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-blue-400 p-2 rounded-lg hover:bg-blue-500 transition-colors duration-200">
                <X className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/channel/UCrNaDV3dkGS4VHTujxhLbbA" className="bg-red-700 p-2 rounded-lg hover:bg-red-800 transition-colors duration-200">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="bg-pink-600 p-2 rounded-lg hover:bg-pink-700 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Loan Products</h4>
            <ul className="space-y-3">
              {loanTypes.map((loan, index) => (
                <li key={index}>
                  <Link to="/loan-application">
                  <a
                    href={loan.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {loan.name}
                  </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Legal & Compliance</h4>
            <ul className="space-y-3 mb-6">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Certifications */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-3">Certifications</h5>
              <div className="space-y-2 text-xs text-gray-400">
                <div>✓ RBI Registered</div>
                <div>✓ ISO 27001 Certified</div>
                <div>✓ SSL Secured</div>
                <div>✓ PCI DSS Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 NSV Finance. All rights reserved. | CIN: U00000TG2024PLC000000
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span>Made in India</span>
              <span>•</span>
              <span>Serving PAN India</span>
              <span>•</span>
              <span>400+ Happy Customers</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Disclaimer:</strong> NSV Finance is a loan aggregation platform. 
              We are not a lender but act as an intermediary between customers and loan companies. 
              Loan rates and terms are subject to lender policies and customer eligibility. 
              All loan applications are subject to approval. Please read all terms and conditions carefully before applying.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;