import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, CalendarDays } from 'lucide-react';

const BlogPage = () => {
  // 📝 You can easily change this info anytime
  const blog = {
    title: "Understanding Loans & Financial Services",
    author: "NSV Finserv Team",
    date: new Date().toLocaleDateString(),
    content: `
      Loans are one of the most effective ways to achieve financial goals — whether it’s buying a home, 
      funding education, expanding a business, or covering emergencies. At NSV Finserv, we connect 
      customers with trusted financial institutions that provide fast and transparent loan services.
    `,
    sections: [
      {
        heading: "1. What Are Financial Services?",
        text: `Financial services include a wide range of activities — from banking, insurance, and 
        investments to credit and advisory services. These services help individuals and businesses 
        manage money, reduce risk, and plan for the future.`,
      },
      {
        heading: "2. How NSV Finserv Helps",
        text: `NSV Finserv acts as a bridge between customers and lenders. We assist in finding the best 
        loan options based on your profile, credit score, and needs. Our experts ensure that 
        applications are processed smoothly with minimal paperwork.`,
        points: [
          "Home Loans, Business Loans, and Personal Loans",
          "Transparent documentation and processing",
          "Dedicated loan advisors to guide every step",
          "Zero hidden charges and fast disbursement",
        ],
      },
      {
        heading: "3. Benefits of Choosing NSV Finserv",
        text: `We simplify financial decisions by giving you expert guidance and comparing multiple 
        institutions. Whether you're an entrepreneur or a salaried employee, our team ensures you 
        get the best rates available.`,
        points: [
          "Compare offers from multiple banks",
          "Quick eligibility check",
          "Secure and confidential data handling",
          "Customer-first support system",
        ],
      },
      {
        heading: "4. Final Thoughts",
        text: `Loans are not just about borrowing money — they’re about building opportunities. 
        With NSV Finserv, you get a trusted financial partner that simplifies the process and 
        helps you achieve your dreams responsibly.`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{blog.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> {blog.date}
            </span>
          </div>
        </div>
      </header>

      {/* Blog Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <article className="bg-white rounded-xl shadow-md p-8 prose prose-gray max-w-none">
          <p className="lead text-gray-700 mb-8">{blog.content}</p>

          {blog.sections.map((section, index) => (
            <div key={index} className="mt-8">
              <h2>{section.heading}</h2>
              <p>{section.text}</p>
              {section.points && (
                <ul>
                  {section.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <hr className="my-10" />

          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} NSV Finserv. All rights reserved.
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPage;
