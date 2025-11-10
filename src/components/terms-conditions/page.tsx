import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using NSV Finserv's website and services, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on NSV Finserv's website for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on NSV Finserv's website;</li>
              <li>remove any copyright or other proprietary notations from the materials;</li>
            </ul>

            <h2>3. Financial Services</h2>
            <p>
              NSV Finserv acts as an intermediary between customers and financial institutions. We facilitate loan applications and provide advisory services. 
              All loan approvals are subject to the lending institution's terms and conditions.
            </p>
            <ul>
              <li>Interest rates and loan terms are determined by the lending institution</li>
              <li>NSV Finserv does not guarantee loan approval</li>
              <li>Processing fees may apply as per the lender's policy</li>
              <li>Customers are responsible for providing accurate information</li>
            </ul>

            <h2>4. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. NSV Finserv collects and processes personal information in accordance with our Privacy Policy. 
              By using our services, you consent to the collection and use of information in accordance with our privacy practices.
            </p>

            <h2>5. User Responsibilities</h2>
            <p>Users of NSV Finserv services agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in fraudulent or misleading activities</li>
            </ul>

            <h2>6. Disclaimer</h2>
            <p>
              The materials on NSV Finserv's website are provided on an 'as is' basis. NSV Finserv makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>7. Limitations</h2>
            <p>
              In no event shall NSV Finserv or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
              or due to business interruption) arising out of the use or inability to use the materials on NSV Finserv's website, 
              even if NSV Finserv or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2>8. Accuracy of Materials</h2>
            <p>
              The materials appearing on NSV Finserv's website could include technical, typographical, or photographic errors. 
              NSV Finserv does not warrant that any of the materials on its website are accurate, complete, or current. 
              NSV Finserv may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2>9. Links</h2>
            <p>
              NSV Finserv has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by NSV Finserv of the site. Use of any such linked website is at the user's own risk.
            </p>

            <h2>10. Modifications</h2>
            <p>
              NSV Finserv may revise these terms of service for its website at any time without notice. 
              By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the 
              exclusive jurisdiction of the courts in that State or location.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p><strong>NSV Finserv</strong></p>
              <p>Email: nsvfinserv@gmail.com</p>
              <p>Phone: +91-9885885847</p>
              <p>Address: 27-16-31/2a , Sri Krishna Nagar Colony, Neredmet,<br />
                  Secunderabad - 500056, Telangana</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
