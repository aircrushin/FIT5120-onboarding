"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
  Calendar,
  Building2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Info,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import {
  searchProductsAction,
  ProductSearchResult,
  getRandomProductsAction,
  FeaturedProduct,
  getSimilarApprovedProductsAction,
  SimilarProductResult,
} from "../actions/product-actions";
import { ProductCard } from "../components/ProductCard";

// Use the interface from the database queries
type Product = ProductSearchResult;

// Add this new component after the type definition
const SafetyRatingsChart = () => {
  const safetyData = [
    {
      label: "85-100",
      category: "Excellent",
      count: 45,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      label: "70-84",
      category: "Good",
      count: 30,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: "50-69",
      category: "Fair",
      count: 15,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      label: "1-49",
      category: "Poor",
      count: 8,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      label: "0",
      category: "Dangerous",
      count: 2,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      icon: <ShieldX className="w-4 h-4" />,
    },
  ];

  const maxCount = Math.max(...safetyData.map((item) => item.count));

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 bg-purple-100 rounded-full">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h4 className="font-medium text-gray-900">Safety Score Distribution</h4>
      </div>
      <div className="space-y-3">
        {safetyData.map((item, index) => (
          <div
            key={index}
            className={`p-3 ${item.bgColor} rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`${item.textColor} flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span
                    className={`ml-2 text-sm font-semibold ${item.textColor}`}
                  >
                    {item.category}
                  </span>
                </div>
                <span className={`text-lg font-bold ${item.textColor}`}>
                  {item.count}%
                </span>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${item.color} h-full rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700">
            Distribution based on analysis of products in our database.
            Percentages represent relative frequency of each safety score range.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ProductSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [similarByNotif, setSimilarByNotif] = useState<
    Record<string, SimilarProductResult[]>
  >({});
  const [loadingSimilar, setLoadingSimilar] = useState<Record<string, boolean>>(
    {}
  );
  const [searchError, setSearchError] = useState<string>("");

  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingFeatured, startFeaturedTransition] = useTransition();

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError("");
      return;
    }

    setHasSearched(true);
    setSearchError("");

    startSearchTransition(async () => {
      try {
        const dbResults = await searchProductsAction(query);
        setSearchResults(dbResults);
        if (dbResults.length === 0) {
          setSearchError(
            `No products found for "${query}". Try different keywords.`
          );
        }
      } catch (error) {
        console.error("Database search failed:", error);
        setSearchError("Search failed. Please try again later.");
        setSearchResults([]);
      }
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load featured products on first render
  useEffect(() => {
    startFeaturedTransition(async () => {
      try {
        const items = await getRandomProductsAction(6);
        if (items.length > 0) {
          setFeatured(items);
        }
      } catch (e) {
        setFeatured([]);
      }
    });
  }, []);

  const calculateTrustScore = (product: Product) => {
    let score = 100;

    // Product status penalty
    if (product.prod_status_type === "C") {
      score = 0; // Cancelled products get 0 score
      return { score: 0, level: "dangerous" };
    }

    // Ingredient risk penalties
    const bannedCount = product.ingredients.filter(
      (ing) => ing.risk_type === "B"
    ).length;
    const highRiskCount = product.ingredients.filter(
      (ing) => ing.risk_type === "H"
    ).length;
    const lowRiskCount = product.ingredients.filter(
      (ing) => ing.risk_type === "L"
    ).length;

    // Severe penalty for banned ingredients
    score -= bannedCount * 50;

    // Moderate penalty for high-risk ingredients
    score -= highRiskCount * 25;

    // Small bonus for having more low-risk ingredients
    score += Math.min(lowRiskCount * 2, 10);

    // Ensure score stays within 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine trust level
    let level: "excellent" | "good" | "fair" | "poor" | "dangerous";
    if (score >= 85) level = "excellent";
    else if (score >= 70) level = "good";
    else if (score >= 50) level = "fair";
    else if (score > 0) level = "poor";
    else level = "dangerous";

    return { score, level };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Safety Search
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for cosmetic products by name or notification number to check
            their safety status and ingredients.
          </p>
        </div>

        {/* Search Section */}
        <div className="relative mb-8">
          {/* Floating Search Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-2xl blur-xl transform scale-105"></div>

            {/* Main Search Container */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-3xl hover:bg-white/90">
              {/* Search Input Container */}
              <div className="relative group">
                {/* Animated Border Gradient */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300 group-focus-within:opacity-60"></div>

                {/* Input Wrapper */}
                <div className="relative flex items-center bg-white rounded-xl border-2 border-gray-100 group-focus-within:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-md">
                  {/* Search Icon */}
                  <div className="pl-5 pr-3">
                    <Search
                      className={`w-5 h-5 transition-all duration-300 ${
                        searchQuery
                          ? "text-purple-500 scale-110"
                          : "text-gray-400 group-hover:text-gray-500 group-focus-within:text-purple-500"
                      }`}
                    />
                  </div>

                  {/* Main Input */}
                  <input
                    type="text"
                    placeholder=" Search by product name or notification number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-4 pr-4 text-lg placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0 transition-all duration-300"
                  />

                  {/* Clear Button */}
                  {searchQuery && (
                    <div className="pr-4">
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setHasSearched(false);
                          setSearchError("");
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Placeholder Text */}
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {[
                    "Try: Vitamin C",
                    "NOT110307162K",
                    "Face cream",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSearchQuery(suggestion.replace(/['"]/g, ""))
                      }
                      className="px-3 py-1 text-xs text-gray-500 hover:text-purple-400 hover:bg-purple-25 rounded-full transition-all duration-200 border border-gray-200 hover:border-purple-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {isSearching && (
                <div className="flex items-center justify-center mt-6 py-4">
                  <div className="relative">
                    {/* Spinning Gradient Ring */}
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1.5s",
                      }}
                    ></div>
                  </div>
                  <div className="ml-4">
                    <div className="text-gray-700 font-medium">
                      Analyzing products...
                    </div>
                    <div className="text-sm text-gray-500">
                      Checking safety database
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Error State */}
              {searchError && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-yellow-800">Notice</div>
                      <div className="text-sm text-yellow-700">
                        {searchError}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            {searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </h2>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map((product) => {
                    const trustData = calculateTrustScore(product);
                    
                    return (
                      <ProductCard
                        key={product.prod_notif_no}
                        product={{
                          prod_notif_no: product.prod_notif_no,
                          prod_name: product.prod_name,
                          prod_brand: product.prod_brand,
                          prod_category: product.prod_category,
                          holder_name: product.holder_name,
                          prod_status_type: product.prod_status_type,
                          prod_status_date: product.prod_status_date,
                        }}
                        href={`/product/${encodeURIComponent(product.prod_notif_no)}`}
                        isReference={true}
                      />
                    );
                  })}
                </div>

                {/* Quick Actions Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <div
                        key={`action-${product.prod_notif_no}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {product.prod_name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.prod_notif_no}
                          </p>
                        </div>
                        <Link
                          href={`/alternatives/${encodeURIComponent(product.prod_notif_no)}`}
                          className="ml-4 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          Find Alternatives
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try searching with a different product name or notification
                  number.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!hasSearched && (
          <div className="space-y-6">
            {/* Featured Products */}
            {isLoadingFeatured ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading featured products...
                  </span>
                </div>
              </div>
            ) : (
              featured.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      You may want to search:
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {featured.map((p) => (
                      <ProductCard
                        key={p.prod_notif_no}
                        product={{
                          prod_notif_no: p.prod_notif_no,
                          prod_name: p.prod_name,
                          prod_status_type: p.prod_status_type,
                        }}
                        href={`/product/${encodeURIComponent(p.prod_notif_no)}`}
                      />
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Safety Rating Guide and Smart Shopping Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Safety Rating Guide */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Understanding Safety Ratings:
                </h3>

                {/* Trust Score Legend */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Trust Score System:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-green-800">
                          85-100
                        </span>
                        <span className="text-xs text-green-600 ml-2">
                          Excellent
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-blue-800">70-84</span>
                        <span className="text-xs text-blue-600 ml-2">Good</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-yellow-800">
                          50-69
                        </span>
                        <span className="text-xs text-yellow-600 ml-2">
                          Fair
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-orange-800">
                          1-49
                        </span>
                        <span className="text-xs text-orange-600 ml-2">
                          Poor
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <ShieldX className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-red-800">0</span>
                        <span className="text-xs text-red-600 ml-2">
                          Dangerous
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Score Distribution Chart */}
                <SafetyRatingsChart />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
