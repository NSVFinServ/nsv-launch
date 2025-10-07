import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">

            <h2>NSV Finserv Privacy Policy: Data Processing Framework</h2>
            <p>
              This Privacy Policy outlines NSV Finserv Limited's comprehensive approach to Data processing.
              NSV Finserv is deeply committed to maintaining data privacy with the utmost seriousness.
              It is critical that you, our Covered Person(s), are fully aware of what personal data you and others provide to or for us,
              the specific rationale behind its Processing, and its implications for you.
              We urge you to review this Privacy Policy carefully.
            </p>

            <h2>Definitions</h2>
            <p>The following capitalized terms shall be interpreted as defined below:</p>
            <ul>
              <li><strong>Banks/ NBFCs or NSV Finserv:</strong> NSV Finserv Limited, as referenced in the first paragraph.</li>
              <li><strong>Covered Person(s) or You:</strong> Any natural person whose personal data is processed by or for NSV Finserv.</li>
              <li><strong>Data:</strong> The categories of personal data as described in the Data section.</li>
              <li><strong>Derivation:</strong> The process by which Derivative Data is created.</li>
              <li><strong>Derivative Data:</strong> Data created or inferred from other Data.</li>
              <li><strong>Processing Entity:</strong> Any third party with whom the Banks/ NBFCs share your Data.</li>
              <li><strong>Product(s):</strong> All financial products, services, and businesses covered by this policy.</li>
              <li><strong>Specified Purposes:</strong> Legitimate activities including but not limited to credit/risk assessment, fraud prevention,
                KYC/AML compliance, due diligence, background checks, collections, recovery, reporting obligations, etc.
              </li>
            </ul>

            <h2>Applicability and Scope</h2>
            <p>
              This Privacy Policy applies to the personal data of any natural person ("Covered Person(s)" or "You")
              that is processed by or on behalf of NSV Finserv, irrespective of whether the data is in physical or electronic format.
            </p>
            <p>
              This policy extends to all Product(s), services, and businesses, encompassing:
            </p>
            <ul>
              <li>Our own offerings and those of our subsidiaries/affiliates.</li>
              <li>Situations where we distribute, refer, act as an agent, or sponsor Banks or NBFCs.</li>
              <li>
                A wide range of instruments and services, including loans, insurance, investments, cards,
                UPI, wallets, deposits, merchant acquiring, payment gateway, and more.
              </li>
            </ul>

            <h2>Data Categories</h2>
            <p>The personal data collected or received ("Data") falls into the following categories:</p>
            <ul>
              <li><strong>Identity & Contact Information:</strong> Name, DOB, PAN/Aadhaar, email, phone, address, photo, etc.</li>
              <li><strong>Financial & Transactional Data:</strong> Bank details, credit/debit info, income, ITR, transaction history, assets/liabilities.</li>
              <li><strong>Third-Party & Other Individuals’ Data:</strong> Information from credit bureaus, regulators, fraud prevention agencies, etc.</li>
              <li><strong>Digital Activity & Device Data:</strong> Cookies, IP address, location (with permission), device identifiers, browser info.</li>
              <li><strong>Biometric & Authentication Data:</strong> Fingerprints (only with explicit consent), passwords/PINs (securely encrypted).</li>
            </ul>

            <h2>Data Collection and Processing</h2>
            <p>We collect your Data through:</p>
            <ul>
              <li>Direct submission (applications, forms, surveys)</li>
              <li>Product usage & transactions</li>
              <li>Verification & compliance (KYC/AML, due diligence, fraud checks)</li>
              <li>Digital/physical interactions (website, app, branches, phone calls)</li>
              <li>Public and third-party sources (databases, regulators, credit agencies)</li>
              <li>Tracking technologies (cookies, device usage data)</li>
            </ul>

            <h2>Purposes of Processing</h2>
            <p>Your Data is processed for:</p>
            <ul>
              <li><strong>Core Service Delivery:</strong> To provide Products, manage relationships, process applications & transactions.</li>
              <li><strong>Compliance & Risk Management:</strong> Credit scoring, fraud detection, KYC/AML compliance.</li>
              <li><strong>Legitimate Interests:</strong> Service improvement, analytics, audits, customer experience enhancement.</li>
              <li><strong>Marketing & Cross-Selling:</strong> With your explicit consent, for promotions, surveys, and offers.</li>
              <li><strong>Emergency Purposes:</strong> Protecting your vital interests when you cannot provide consent.</li>
            </ul>

            <h2>Engagement of Processing Entities</h2>
            <p>
              NSV Finserv may partner with Banks, NBFCs, Insurance Companies, and service providers
              (Processing Entities) for approved purposes. Your Data will never be shared with unauthorized parties.
            </p>

            <h2>Commitment to Data Confidentiality</h2>
            <p>
              All Data will be treated with strict confidentiality and processed only within an authorized ecosystem.
              NSV Finserv maintains a zero-tolerance policy against malpractice, misuse, or unauthorized processing.
            </p>

            <h2>Contact Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p><strong>NSV Finserv</strong></p>
              <p>Email: nsvfinserv@gmail.com</p>
              <p>Phone: +91-9885885847</p>
              <p>Address: [Your Business Address]</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;