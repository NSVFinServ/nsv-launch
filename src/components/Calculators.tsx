import React, { useState } from 'react';
import { IndianRupee, Clock, Shield } from 'lucide-react';

const Calculators = () => {
  const [activeCalculator, setActiveCalculator] = useState('emi');

  // ---- Normal EMI ----
  const [emiInputs, setEmiInputs] = useState({ loanAmount: 1000000, interestRate: 9.5, tenure: 240 });

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    if (monthlyRate === 0) return Math.round(principal / tenure);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI(emiInputs.loanAmount, emiInputs.interestRate, emiInputs.tenure);
  const totalAmount = emi * emiInputs.tenure;
  const totalInterest = totalAmount - emiInputs.loanAmount;

  // ---- Moratorium EMI ----
  const [moratoriumInputs, setMoratoriumInputs] = useState({ loanAmount: 1000000, interestRate: 9.5, tenure: 240, moratoriumMonths: 6 });

  const calculateMoratoriumEMI = (principal: number, rate: number, tenure: number, moratoriumMonths: number) => {
    const monthlyRate = rate / (12 * 100);
    const compoundedPrincipal = principal * Math.pow(1 + monthlyRate, moratoriumMonths);
    const remainingTenure = Math.max(1, tenure - moratoriumMonths);
    if (monthlyRate === 0) return Math.round(compoundedPrincipal / remainingTenure);
    const emiMo = (compoundedPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingTenure)) /
      (Math.pow(1 + monthlyRate, remainingTenure) - 1);
    return Math.round(emiMo);
    };
  const moratoriumEMI = calculateMoratoriumEMI(
    moratoriumInputs.loanAmount,
    moratoriumInputs.interestRate,
    moratoriumInputs.tenure,
    moratoriumInputs.moratoriumMonths
  );
  const regularEMI = calculateEMI(moratoriumInputs.loanAmount, moratoriumInputs.interestRate, moratoriumInputs.tenure);

  // ---- Term Insurance (simplified) ----
  const [termInputs, setTermInputs] = useState({ age: 30, coverAmount: 5000000, term: 20 });

  const calculateTermPremium = (age: number, coverAmount: number, term: number) => {
    const baseRate = 0.0015; // base rate per 1000
    const ageMultiplier = age < 35 ? 1 : age < 45 ? 1.5 : 2;
    const termMultiplier = term <= 10 ? 1 : term <= 20 ? 1.2 : 1.5;
    const premium = (coverAmount / 1000) * baseRate * ageMultiplier * termMultiplier * 1000;
    return Math.round(premium);
  };
  const termPremium = calculateTermPremium(termInputs.age, termInputs.coverAmount, termInputs.term);


  // ---- Tabs ----
  const calculatorTypes = [
    { id: 'emi', name: 'Normal EMI', icon: IndianRupee },
    { id: 'moratorium', name: 'Moratorium EMI', icon: Clock },
    { id: 'term', name: 'Term Insurance EMI', icon: Shield },
  ];
  // Helpers (place inside App component, above return)
const INR = new Intl.NumberFormat('en-IN');

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const parseNum = (v, fallback = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

// Centralized setters to keep slider & input linked
const setLoanAmount = (raw) => {
  const min = 100000, max = 10000000, step = 50000;
  let v = Math.round(clamp(parseNum(raw, emiInputs.loanAmount), min, max) / step) * step;
  setEmiInputs({ ...emiInputs, loanAmount: v });
};
const setInterestRate = (raw) => {
  const min = 6, max = 18;
  let v = clamp(parseNum(raw, emiInputs.interestRate), min, max);
  // keep one decimal like the slider
  v = Math.round(v * 10) / 10;
  setEmiInputs({ ...emiInputs, interestRate: v });
};
const setTenure = (raw) => {
  const min = 12, max = 360, step = 12;
  let v = Math.round(clamp(parseNum(raw, emiInputs.tenure), min, max) / step) * step;
  setEmiInputs({ ...emiInputs, tenure: v });
};


  return (
    <section id="calculators" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-left" data-aos-delay="100">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loan EMI Calculators
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quickly calculate your loan EMIs, compare repayment options with and without moratorium,
            and estimate your term insurance premium.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg p-2 shadow-sm max-w-2xl mx-auto" data-aos="fade-right" data-aos-delay="75">
          {calculatorTypes.map((calc) => {
            const IconComponent = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeCalculator === calc.id
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: activeCalculator === calc.id ? 'rgb(46, 46, 46)' : 'transparent'
                }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{calc.name}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" data-aos="zoom-in" data-aos-delay={300}>
          {/* ----- Normal EMI ----- */}
{activeCalculator === 'emi' && (
           <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Normal Loan EMI Calculator
                </h3>

                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (₹)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={100000}
                      max={10000000}
                      step={50000}
                      value={emiInputs.loanAmount}
                      onChange={(e) =>
                        setEmiInputs((s: any) => ({
                          ...s,
                          loanAmount: clamp(
                            parseInt(e.target.value),
                            100000,
                            10000000
                          ),
                        }))
                      }
                      className="w-full"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="pl-7 pr-3 py-2 w-40 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={emiInputs.loanAmount.toLocaleString("en-IN")}
                        onChange={(e) =>
                          setEmiInputs((s: any) => {
                            const v = parseNum(e.target.value, s.loanAmount);
                            return {
                              ...s,
                              loanAmount:
                                Math.round(
                                  clamp(v, 100000, 10000000) / 50000
                                ) * 50000,
                            };
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>₹1L</span>
                    <span className="font-medium">
                      ₹{(emiInputs.loanAmount / 100000).toFixed(1)}L
                    </span>
                    <span>₹1Cr</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate (% p.a.)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={6}
                      max={18}
                      step={0.1}
                      value={emiInputs.interestRate}
                      onChange={(e) =>
                        setEmiInputs((s: any) => ({
                          ...s,
                          interestRate:
                            Math.round(
                              clamp(parseFloat(e.target.value), 6, 18) * 10
                            ) / 10,
                        }))
                      }
                      className="w-full"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        step={0.1}
                        min={6}
                        max={18}
                        className="pr-10 pl-3 py-2 w-28 rounded-md border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={emiInputs.interestRate}
                        onChange={(e) =>
                          setEmiInputs((s: any) => ({
                            ...s,
                            interestRate:
                              Math.round(
                                clamp(parseNum(e.target.value, s.interestRate),
                                  6, 18
                                ) * 10
                              ) / 10,
                          }))
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>6%</span>
                    <span className="font-medium">
                      {emiInputs.interestRate}%
                    </span>
                    <span>18%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Tenure (Months)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={12}
                      max={360}
                      step={12}
                      value={emiInputs.tenure}
                      onChange={(e) =>
                        setEmiInputs((s: any) => ({
                          ...s,
                          tenure: clamp(parseInt(e.target.value), 12, 360),
                        }))
                      }
                      className="w-full"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        step={12}
                        min={12}
                        max={360}
                        className="pl-3 pr-14 py-2 w-40 rounded-md border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={emiInputs.tenure}
                        onChange={(e) =>
                          setEmiInputs((s: any) => ({
                            ...s,
                            tenure:
                              Math.round(
                                clamp(parseNum(e.target.value, s.tenure), 12, 360) /
                                  12
                              ) * 12,
                          }))
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        months
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>1 Year</span>
                    <span className="font-medium">
                      {Math.round(emiInputs.tenure / 12)} Years
                    </span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>

                {/* Results */}
                <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(46, 46, 46, 0.1)' }}>
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Calculation Results</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <span>Monthly EMI</span>
                      <span className="text-2xl font-bold" style={{ color: 'rgb(46, 46, 46)' }}>₹{emi.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <span>Total Payable</span>
                      <span className="text-lg font-semibold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                      <span>Total Interest</span>
                      <span className="text-lg font-semibold text-red-600">₹{totalInterest.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ----- Moratorium EMI ----- */}
          {activeCalculator === 'moratorium' && (
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Moratorium EMI Calculator</h3>

                  {/* Loan Amount */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (₹)</label>
  <div className="flex items-center gap-4">
    <input
      type="range"
      min={100000}
      max={10000000}
      step={50000}
      value={moratoriumInputs.loanAmount}
      onChange={(e) =>
        setMoratoriumInputs((s: any) => ({
          ...s,
          loanAmount: clamp(parseInt(e.target.value), 100000, 10000000),
        }))
      }
      className="w-full"
    />
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
      <input
        type="text"
        inputMode="numeric"
        className="pl-7 pr-3 py-2 w-40 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={moratoriumInputs.loanAmount.toLocaleString('en-IN')}
        onChange={(e) =>
          setMoratoriumInputs((s: any) => {
            const v = parseNum(e.target.value, s.loanAmount);
            return {
              ...s,
              loanAmount: Math.round(clamp(v, 100000, 10000000) / 50000) * 50000,
            };
          })
        }
        placeholder="1,00,000"
      />
    </div>
  </div>
  <div className="text-center mt-1">₹{(moratoriumInputs.loanAmount / 100000).toFixed(1)}L</div>
</div>

{/* Interest Rate */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (% p.a.)</label>
  <div className="flex items-center gap-4">
    <input
      type="range"
      min={6}
      max={18}
      step={0.1}
      value={moratoriumInputs.interestRate}
      onChange={(e) =>
        setMoratoriumInputs((s: any) => ({
          ...s,
          interestRate: Math.round(clamp(parseFloat(e.target.value), 6, 18) * 10) / 10,
        }))
      }
      className="w-full"
    />
    <div className="relative">
      <input
        type="number"
        step={0.1}
        min={6}
        max={18}
        className="pr-10 pl-3 py-2 w-28 rounded-md border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={moratoriumInputs.interestRate}
        onChange={(e) =>
          setMoratoriumInputs((s: any) => ({
            ...s,
            interestRate: Math.round(clamp(parseNum(e.target.value, s.interestRate), 6, 18) * 10) / 10,
          }))
        }
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
    </div>
  </div>
  <div className="text-center mt-1">{moratoriumInputs.interestRate}%</div>
</div>

{/* Total Tenure (Months) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Total Tenure (Months)</label>
  <div className="flex items-center gap-4">
    <input
      type="range"
      min={12}
      max={360}
      step={12}
      value={moratoriumInputs.tenure}
      onChange={(e) =>
        setMoratoriumInputs((s: any) => ({
          ...s,
          tenure: clamp(parseInt(e.target.value), 12, 360),
        }))
      }
      className="w-full"
    />
    <div className="relative">
      <input
        type="number"
        step={12}
        min={12}
        max={360}
        className="pl-3 pr-14 py-2 w-40 rounded-md border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={moratoriumInputs.tenure}
        onChange={(e) =>
          setMoratoriumInputs((s: any) => ({
            ...s,
            tenure: Math.round(clamp(parseNum(e.target.value, s.tenure), 12, 360) / 12) * 12,
          }))
        }
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">months</span>
    </div>
  </div>
  <div className="text-center mt-1">{moratoriumInputs.tenure / 12} Years</div>
</div>

{/* Moratorium Period (Months) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Moratorium Period (Months)</label>
  <div className="flex items-center gap-4">
    <input
      type="range"
      min={3}
      max={24}
      step={3}
      value={moratoriumInputs.moratoriumMonths}
      onChange={(e) =>
        setMoratoriumInputs((s: any) => ({
          ...s,
          moratoriumMonths: clamp(parseInt(e.target.value), 3, 24),
        }))
      }
      className="w-full"
    />
    <div className="relative">
      <input
        type="number"
        step={3}
        min={3}
        max={24}
        className="pl-3 pr-10 py-2 w-36 rounded-md border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={moratoriumInputs.moratoriumMonths}
        onChange={(e) =>
          setMoratoriumInputs((s: any) => ({
            ...s,
            moratoriumMonths: Math.round(clamp(parseNum(e.target.value, s.moratoriumMonths), 3, 24) / 3) * 3,
          }))
        }
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">mo</span>
    </div>
  </div>
  <div className="text-center mt-1">{moratoriumInputs.moratoriumMonths} Months</div>
</div>

                {/* Results */}
                <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(46, 46, 46, 0.1)' }}>
                  <h4 className="text-xl font-bold mb-6">Comparison Results</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <div>Regular EMI</div>
                      <div className="text-xl font-bold">₹{regularEMI.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-2" style={{ borderColor: 'rgb(46, 46, 46)' }}>
                      <div>EMI after Moratorium</div>
                      <div className="text-2xl font-bold" style={{ color: 'rgb(46, 46, 46)' }}>₹{moratoriumEMI.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div>Extra Cost due to Moratorium</div>
                      <div className="text-lg font-semibold text-orange-600">₹{(moratoriumEMI - regularEMI).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----- Term Insurance ----- */}
          {activeCalculator === 'term' && (
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Term Insurance EMI Calculator</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={termInputs.age}
                      onChange={(e) => setTermInputs({ ...termInputs, age: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center mt-1">{termInputs.age} Years</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Amount (₹)</label>
                    <input
                      type="range"
                      min="1000000"
                      max="50000000"
                      step="500000"
                      value={termInputs.coverAmount}
                      onChange={(e) => setTermInputs({ ...termInputs, coverAmount: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center mt-1">₹{(termInputs.coverAmount / 100000).toFixed(0)}L</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Term (Years)</label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={termInputs.term}
                      onChange={(e) => setTermInputs({ ...termInputs, term: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center mt-1">{termInputs.term} Years</div>
                  </div>
                </div>

                {/* Results */}
                <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(46, 46, 46, 0.1)' }}>
                  <h4 className="text-xl font-bold mb-6">Premium Results</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-white rounded-lg">
                      <span>Annual Premium</span>
                      <span className="text-2xl font-bold" style={{ color: 'rgb(46, 46, 46)' }}>₹{termPremium.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-white rounded-lg">
                      <span>Monthly Premium</span>
                      <span className="text-lg font-semibold">₹{Math.round(termPremium / 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-white rounded-lg">
                      <span>Total Premium (for {termInputs.term} yrs)</span>
                      <span className="font-semibold" style={{ color: 'rgb(46, 46, 46)' }}>₹{(termPremium * termInputs.term).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </section>
  );
};

export default Calculators;
