import React from "react";
import { Link } from "react-router-dom";

const blogs = [
  {
    id: "home-loan-guide",
    title: "Complete Guide to Home Loans in India",
    desc: "Eligibility, interest rates, documents, and approval process explained.",
    icon: "/images/icons/roadmap.svg",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "customer-loan-experience",
    title: "How NSV Finserv Simplifies Loan Processing",
    desc: "Step-by-step process of hassle-free loan approvals.",
    icon: "/images/icons/feedback.svg",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "loan-types",
    title: "Types of Loans Offered by NSV Finserv",
    desc: "Home, personal, business, education & more.",
    icon: "/images/icons/tools.svg",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "loan-eligibility",
    title: "Loan Eligibility Criteria Explained",
    desc: "How income, age, and credit score affect eligibility.",
    icon: "/images/icons/prioritize.svg",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "cibil-score",
    title: "Understanding CIBIL Score for Loans",
    desc: "Why CIBIL matters and how to improve it.",
    icon: "/images/icons/research.svg",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "loan-rejection",
    title: "Top Reasons Why Loan Applications Get Rejected",
    desc: "Avoid common mistakes during loan application.",
    icon: "/images/icons/failure.svg",
    gradient: "from-red-500 to-pink-600",
  },
  {
    id: "interest-rates",
    title: "How Loan Interest Rates Are Calculated",
    desc: "Fixed vs floating interest rates explained simply.",
    icon: "/images/icons/compare.svg",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    id: "document-checklist",
    title: "Loan Documentation Checklist",
    desc: "Documents required for fast loan approval.",
    icon: "/images/icons/loop.svg",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    id: "business-loans",
    title: "Business Loans for MSMEs & Startups",
    desc: "Funding solutions to grow your business.",
    icon: "/images/icons/growth.svg",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "emi-planning",
    title: "Smart EMI Planning for Loans",
    desc: "How to manage EMIs without financial stress.",
    icon: "/images/icons/ux.svg",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "loan-settlement",
    title: "Loan Settlement vs Foreclosure Explained",
    desc: "Key differences every borrower must know.",
    icon: "/images/icons/metrics.svg",
    gradient: "from-blue-500 to-sky-500",
  },
  {
    id: "why-nsv-finserv",
    title: "Why Choose NSV Finserv for Your Loans",
    desc: "Trusted advisors, fast approvals, zero hidden charges.",
    icon: "/images/icons/idea.svg",
    gradient: "from-lime-500 to-green-500",
  },
];

const BlogsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO – MATCHES HEADER THEME */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-14 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Blogs & Financial Insights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expert guidance on loans, eligibility, EMIs, interest rates, and smart financial planning by NSV Finserv.
          </p>
        </div>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* Card Top (Colorful as requested) */}
              <div
                className={`h-36 bg-gradient-to-br ${blog.gradient} flex items-center justify-center`}
              >
                <img
                  src={blog.icon}
                  alt={blog.title}
                  className="w-14 h-14"
                />
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {blog.desc}
                </p>

                <Link
                  to={`/blogs/${blog.id}`}
                  className="text-sm font-medium text-gray-800 hover:text-gray-500"
                >
                  Read article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default BlogsPage;
