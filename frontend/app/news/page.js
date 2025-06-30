"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicNews } from "../../lib/newsService";
import Header from "../../components/layout/header";
import Footer from "../../components/layout/footer";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchNews();
  }, [currentPage, activeCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getPublicNews(currentPage, 9, activeCategory);

      // Check if response has the expected structure
      if (response.success && response.data) {
        setNews(response.data.news || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        // Handle unexpected response structure
        console.error("Unexpected API response format:", response);
        setError("Received invalid data format from server");
        setNews([]);
      }
    } catch (err) {
      setError(
        "Failed to load news: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500/90 to-primary-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-64 -top-64 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-24 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white text-shadow">
            Health News
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Stay updated with the latest research, insights, and developments in mental health and obesity
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
                  activeCategory === ""
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryChange("")}>
                All
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium ${
                  activeCategory === "mental_health"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryChange("mental_health")}>
                Mental Health
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
                  activeCategory === "obesity"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleCategoryChange("obesity")}>
                Obesity
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No news articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
                  {article.imageUrl && (
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex-grow">
                      <Link
                        href={`/news/${article.id}`}
                        className="hover:text-primary-600">
                        {article.title}
                      </Link>
                    </h2>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            article.category === "mental_health"
                              ? "bg-blue-100 text-blue-800"
                              : article.category === "obesity"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {article.category === "mental_health"
                            ? "Mental Health"
                            : article.category === "obesity"
                            ? "Obesity"
                            : "General"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>

                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPage(num + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === num + 1
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    {num + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}