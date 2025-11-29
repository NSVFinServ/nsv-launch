import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { eligibilityAPI } from '../lib/api.ts';
import { Link } from 'react-router-dom';

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

  const nameRegex = /^[a-zA-Z\s.'-]{2,60}$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  const calculateEligibility = () => {
    const salary = parseFloat(inputs.salary) || 0;
    const existing = parseFloat(inputs.existingEmi) || 0;
    const age = parseInt(inputs.age) || 0;
    const annualRate = parseFloat(inputs.rate) || 0;
    const desiredYears = parseInt(inputs.desiredYears) || 0;

    if (!inputs.name.trim()) return alert('Please enter your Full Name.');
    if (!nameRegex.test(inputs.name.trim())) return alert('Invalid Name.');
    if (!mobileRegex.test(inputs.mobile.trim())) return alert('Invalid Mobile Number.');
    if (salary <= 0) return alert('Enter valid Salary.');
    if (age <= 0) return alert('Enter valid Age.');
    if (desiredYears <= 0) return alert('Enter valid Tenure.');

    const retirementAge = inputs.employment === 'salaried' ? 60 : 65;
    const maxTenureYears = Math.min(30, Math.max(0, retirementAge - age));
    const usedTenureYears = Math.min(desiredYears, maxTenureYears);

    const baseFOIR = inputs.employment === 'salaried' ? 0.55 : 0.50;
    const affordableEMI = Math.max(0, salary * baseFOIR - existing);

    if (usedTenureYears <= 0 || affordableEMI <= 0) {
      setResult({
        affordableEMI: 0,
        eligibleLoan: 0,
        postDTI: salary > 0 ? (existing / salary) * 100 : 0,
        usedTenureYears,
        error: usedTenureYears <= 0 ? 'Tenure exceeds retirement age.' : 'No FOIR headroom.'
      });
      setShowContactForm(false);
      return;
    }

    const r = (annualRate / 100) / 12;
    const n = usedTenureYears * 12;

    const factor = r === 0
      ? n
      : (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

    const eligibleLoan = affordableEMI * factor;
    const postDTI = ((existing + affordableEMI) / salary) * 100;

    setResult({
      affordableEMI,
      eligibleLoan,
      postDTI,
      usedTenureYears,
      error: undefined
    });

    setContactData({
      name: inputs.name,
      phone: inputs.mobile,
      email: '' // user will fill later
    });

    setShowContactForm(true);
  };

  return (
    <section id="eligibility-calculator" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 grid lg:grid-cols-2 gap-8">

          {/* Input Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="w-6 h-6 mr-2" />
              Eligibility Calculator
            </h3>

            {/* Name + Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.name}
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              />

              <input
                type="tel"
                placeholder="Mobile Number *"
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.mobile}
                onChange={(e) => setInputs({ ...inputs, mobile: e.target.value })}
              />
            </div>

            <input
              type="number"
              placeholder="Monthly Income (₹) *"
              className="w-full border px-4 py-3 rounded-lg"
              value={inputs.salary}
              onChange={(e) => setInputs({ ...inputs, salary: e.target.value })}
            />

            <input
              type="number"
              placeholder="Existing EMIs (₹)"
              className="w-full border px-4 py-3 rounded-lg"
              value={inputs.existingEmi}
              onChange={(e) => setInputs({ ...inputs, existingEmi: e.target.value })}
            />

            {/* Age + Employment */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Age *"
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.age}
                onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
              />

              <select
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.employment}
                onChange={(e) => setInputs({ ...inputs, employment: e.target.value })}
              >
                <option value="salaried">Salaried</option>
                <option value="self">Self-Employed</option>
              </select>
            </div>

            {/* Rate + Tenure */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Rate %"
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.rate}
                onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
              />

              <input
                type="number"
                placeholder="Tenure (Years) *"
                className="w-full border px-4 py-3 rounded-lg"
                value={inputs.desiredYears}
                onChange={(e) => setInputs({ ...inputs, desiredYears: e.target.value })}
              />
            </div>

            <button
              onClick={calculateEligibility}
              className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-lg"
            >
              Calculate Eligibility
            </button>
          </div>

          {/* Results */}
          <div className="bg-gray-50 rounded-xl p-6">

            {result && !result.error && (
              <>
                <div className="p-4 bg-white rounded-lg border-l-4 border-green-500 flex justify-between">
                  <span>Eligible Loan</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{Math.round(result.eligibleLoan).toLocaleString()}
                  </span>
                </div>

                {/* Contact Form → Ask Expert Button */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border">
                  <h5 className="text-lg font-bold mb-4">Get Expert Assistance</h5>

                  <Link
                    to="/askexpert"
                    state={{
                      fullName: contactData.name,
                      phone: contactData.phone,
                      email: contactData.email
                    }}
                    className="w-full block"
                  >
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center">
                      Get Expert Consultation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
                </div>
              </>
            )}

            {!result && (
              <p className="text-center text-gray-500">Enter details to see results</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EligibilityCalculator;
