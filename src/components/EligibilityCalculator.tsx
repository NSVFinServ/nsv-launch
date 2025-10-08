import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { eligibilityAPI } from 'src/lib/api';  // Import the new API service

interface EligibilityResult {
  affordableEMI: number;
  eligibleLoan: number;
  postDTI: number;
  usedTenureYears: number;
  error?: string;
}

const EligibilityCalculator = () => {
  const [inputs, setInputs] = useState({
    name: '',
    mobile: '',
    salary: '',
    existingEmi: '',
    age: '',
    employment: 'salaried',
    rate: '9.5',
    desiredYears: ''
  });

  const [showContactForm, setShowContactForm] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regex patterns
  const nameRegex = /^[a-zA-Z\s.'-]{2,60}$/;      // letters/spaces + common punctuation
  const mobileRegex = /^[6-9]\d{9}$/;             // India mobiles: 10 digits starting 6-9

  // Eligibility calculation logic
  const calculateEligibility = () => {
    const salary = parseFloat(inputs.salary) || 0;
    const existing = parseFloat(inputs.existingEmi) || 0;
    const age = parseInt(inputs.age) || 0;
    const annualRate = parseFloat(inputs.rate) || 0;
    const desiredYears = parseInt(inputs.desiredYears) || 0;

    // Basic required fields validation (including regex)
    if (!inputs.name.trim()) {
      alert('Please enter your Full Name.');
      return;
    }
    if (!nameRegex.test(inputs.name.trim())) {
      alert('Please enter a valid name (letters/spaces, 2–60 chars).');
      return;
    }
    if (!inputs.mobile.trim()) {
      alert('Please enter your Mobile Number.');
      return;
    }
    if (!mobileRegex.test(inputs.mobile.trim())) {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    if (salary <= 0) {
      alert('Please enter a valid Monthly Net Income.');
      return;
    }
    if (age <= 0) {
      alert('Please enter a valid Age.');
      return;
    }
    if (desiredYears <= 0) {
      alert('Please enter a valid Desired Tenure (Years).');
      return;
    }

    // Retirement age logic
    const retirementAge = inputs.employment === 'salaried' ? 60 : 65;
    const maxTenureYears = Math.min(30, Math.max(0, retirementAge - age));
    const usedTenureYears = Math.min(desiredYears, maxTenureYears);

    // FOIR calculation
    const baseFOIR = inputs.employment === 'salaried' ? 0.55 : 0.50;
    const affordableEMI = Math.max(0, salary * baseFOIR - existing);

    if (usedTenureYears <= 0 || affordableEMI <= 0) {
      setResult({
        affordableEMI: 0,
        eligibleLoan: 0,
        postDTI: salary > 0 ? (existing / salary) * 100 : 0,
        usedTenureYears,
        error: usedTenureYears <= 0 ? 'Tenure exceeds retirement age limit' : 'No FOIR headroom available'
      });
      setShowContactForm(false);
      return;
    }

    // EMI to loan conversion
    const r = (annualRate / 100) / 12;
    const n = usedTenureYears * 12;

    let factor;
    if (r === 0) {
      factor = n;
    } else {
      factor = (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    }

    const eligibleLoan = affordableEMI * factor;
    const postDTI = salary > 0 ? ((existing + affordableEMI) / salary) * 100 : 0;

    setResult({
      affordableEMI,
      eligibleLoan,
      postDTI,
      usedTenureYears,
      error: undefined
    });

    if (eligibleLoan > 0) {
      // Prefill contact form with provided name & mobile
      setContactData((prev) => ({
        ...prev,
        name: inputs.name.trim(),
        phone: inputs.mobile.trim()
      }));
      setShowContactForm(true);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await eligibilityAPI.submit({
        name: contactData.name,
        phone: contactData.phone,
        email: contactData.email,
        monthlySalary: parseFloat(inputs.salary),
        existingEmi: parseFloat(inputs.existingEmi) || 0,
        age: parseInt(inputs.age) || 0,
        employment: inputs.employment,
        rate: parseFloat(inputs.rate),
        desiredYears: parseInt(inputs.desiredYears),
        eligibleLoanAmount: result?.eligibleLoan,
        affordableEmi: result?.affordableEMI
      });

      alert('Your eligibility submission has been received! Our team will contact you soon.');
      setContactData({ name: '', phone: '', email: '' });
      setShowContactForm(false);
    } catch (error) {
      console.error('Error submitting eligibility:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="eligibility-calculator" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Check Your Loan Eligibility
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find out how much loan you're eligible for based on your income, age, and employment type.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calculator className="w-6 h-6 mr-2" />
                  Eligibility Calculator
                </h3>

                {/* Name & Mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.name}
                      onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., 9876543210"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.mobile}
                      onChange={(e) => setInputs({ ...inputs, mobile: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Net Income (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 80000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={inputs.salary}
                    onChange={(e) => setInputs({ ...inputs, salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Monthly EMIs (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 15000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={inputs.existingEmi}
                    onChange={(e) => setInputs({ ...inputs, existingEmi: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.age}
                      onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.employment}
                      onChange={(e) => setInputs({ ...inputs, employment: e.target.value })}
                    >
                      <option value="salaried">Salaried</option>
                      <option value="self">Self-Employed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (% p.a.) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="9.5"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.rate}
                      onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Tenure (Years) *
                    </label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={inputs.desiredYears}
                      onChange={(e) => setInputs({ ...inputs, desiredYears: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={calculateEligibility}
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Calculate Eligibility
                </button>
              </div>

              {/* Results */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Your Eligibility Results</h4>

                {result ? (
                  <div className="space-y-4">
                    {result.error ? (
                      <div className="p-4 bg-red-50 rounded-lg text-red-700">
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-green-500">
                          <span className="font-medium">Eligible Loan Amount</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{Math.round(result.eligibleLoan).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                          <span>Available EMI</span>
                          <span className="text-lg font-semibold">
                            ₹{Math.round(result.affordableEMI).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                          <span>Debt-to-Income Ratio</span>
                          <span className="font-semibold">
                            {result.postDTI.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                          <span>Approved Tenure</span>
                          <span className="font-semibold">
                            {result.usedTenureYears} Years
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Fill in your details and calculate to see your eligibility</p>
                  </div>
                )}

                {/* Contact Form */}
                {showContactForm && result && !result.error && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg border">
                    <h5 className="text-lg font-bold text-gray-900 mb-4">
                      Get Expert Assistance
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Our loan experts will contact you to help with your application process.
                    </p>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={contactData.name}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      />

                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      />

                      <input
                        type="email"
                        placeholder="Email Address *"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmitting ? 'Submitting...' : 'Get Expert Consultation'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EligibilityCalculator;
