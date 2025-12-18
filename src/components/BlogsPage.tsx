import React from "react";
import { Link } from "react-router-dom";

const blogs = [
  {
    id: "product-roadmap",
    title: "10 Inspiring Product Roadmap Examples",
    desc: "Examples and templates used by top product teams.",
    icon: "/images/icons/roadmap.svg",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "customer-feedback",
    title: "Customer Feedback in SaaS",
    desc: "How to collect and act on feedback effectively.",
    icon: "/images/icons/feedback.svg",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "product-tools",
    title: "Product Management Tools",
    desc: "Best tools for PMs in 2024.",
    icon: "/images/icons/tools.svg",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "feature-priority",
    title: "Feature Prioritization Methods",
    desc: "RICE, MoSCoW, Kano explained.",
    icon: "/images/icons/prioritize.svg",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "user-research",
    title: "User Research Basics",
    desc: "Understand users before building.",
    icon: "/images/icons/research.svg",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "product-failure",
    title: "Why Products Fail",
    desc: "Common mistakes & lessons.",
    icon: "/images/icons/failure.svg",
    gradient: "from-red-500 to-pink-600",
  },
  {
    id: "roadmap-tools",
    title: "Roadmap Tools Compared",
    desc: "Compare the best roadmap tools.",
    icon: "/images/icons/compare.svg",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    id: "feedback-loop",
    title: "Building a Feedback Loop",
    desc: "Continuous product improvement.",
    icon: "/images/icons/loop.svg",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    id: "saas-growth",
    title: "SaaS Product Growth",
    desc: "Scaling with data-driven decisions.",
    icon: "/images/icons/growth.svg",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "ux-decisions",
    title: "UX Decisions That Matter",
    desc: "UX choices that impact conversions.",
    icon: "/images/icons/ux.svg",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "product-metrics",
    title: "Product Metrics That Matter",
    desc: "KPIs every PM should track.",
    icon: "/images/icons/metrics.svg",
    gradient: "from-blue-500 to-sky-500",
  },
  {
    id: "idea-validation",
    title: "Validating Product Ideas",
    desc: "Test ideas before building.",
    icon: "/images/icons/idea.svg",
    gradient: "from-lime-500 to-green-500",
  },
];

const BlogsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">
            Blogs on Product Management & User Feedback
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Curated insights, templates, and frameworks for modern teams.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <div
                className={`h-36 bg-gradient-to-br ${blog.gradient} flex items-center justify-center`}
              >
                <img src={blog.icon} alt={blog.title} className="w-14 h-14" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {blog.desc}
                </p>

                <Link
                  to={`/blogs/${blog.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
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
