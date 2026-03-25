import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.nsvfinserv.com").replace(/\/+$/, "");

export default function NotFoundPage() {
  const location = useLocation();
  const canonical = `${SITE_URL}${location.pathname}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Helmet prioritizeSeoTags>
        <title>Page Not Found | NSV Finserv</title>
        <meta
          name="description"
          content="The page you are looking for could not be found on NSV Finserv."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page may have moved, been removed, or the URL may be incorrect.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
