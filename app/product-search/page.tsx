"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
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
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  searchProductsAction,
  ProductSearchResult,
  getRandomProductsAction,
  FeaturedProduct,
  getSimilarApprovedProductsAction,
  SimilarProductResult,
  getFilterOptionsAction,
  getFilteredProductsAction,
  FilterOptions,
  ProductFilters,
} from "../actions/product-actions";
import { ProductCard } from "../components/ProductCard";

// Use the interface from the database queries
type Product = ProductSearchResult;

// Pagination configuration
const ITEMS_PER_PAGE = 12;

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange, isLoading = false }: PaginationProps) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Show max 5 page numbers at once
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    
    // Adjust start if we're near the end
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* First Page */}
        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={`px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              currentPage === page
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last Page */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Filter Panel Component
interface FilterPanelProps {
  filterOptions: FilterOptions;
  activeFilters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  isLoading: boolean;
}

const FilterPanel = ({ filterOptions, activeFilters, onFiltersChange, isLoading }: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(activeFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    safety: true,
    approval: true,
    ingredients: false,
    categories: false,
    brands: false,
  });
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    ingredients: '',
    categories: '',
    brands: '',
  });

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilters = (updates: Partial<ProductFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayValue = <T,>(array: T[], value: T): T[] => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const updateSearchTerm = (section: string, term: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: term,
    }));
  };

  const filterIngredients = () => {
    if (!searchTerms.ingredients.trim()) return filterOptions.ingredients;
    return filterOptions.ingredients.filter(ingredient =>
      ingredient.ing_name.toLowerCase().includes(searchTerms.ingredients.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading filters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Level Filter */}
      <div>
        <button
          onClick={() => toggleSection('safety')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Safety Level
          {expandedSections.safety ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.safety && (
          <div className="space-y-2">
            {[
              { value: 'safe' as const, label: 'Approved (Safe)', icon: <ShieldCheck className="w-4 h-4 text-green-600" />, color: 'green' },
              { value: 'risky' as const, label: 'Approved but contains risk ingredients', icon: <ShieldAlert className="w-4 h-4 text-yellow-600" />, color: 'yellow' },
              { value: 'unsafe' as const, label: 'Cancelled (Unsafe/High-risk)', icon: <ShieldX className="w-4 h-4 text-red-600" />, color: 'red' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.safetyLevels.includes(option.value)}
                  onChange={() => updateFilters({
                    safetyLevels: toggleArrayValue(localFilters.safetyLevels, option.value)
                  })}
                  className="cursor-pointer w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                {option.icon}
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Approval Status Filter */}
      <div>
        <button
          onClick={() => toggleSection('approval')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Approval Status
          {expandedSections.approval ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.approval && (
          <div className="space-y-2">
            {[
              { value: 'A' as const, label: 'Approved', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
              { value: 'C' as const, label: 'Cancelled', icon: <X className="w-4 h-4 text-red-600" /> },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.approvalStatuses.includes(option.value)}
                  onChange={() => updateFilters({
                    approvalStatuses: toggleArrayValue(localFilters.approvalStatuses, option.value)
                  })}
                  className="cursor-pointer w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                {option.icon}
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients Filter */}
      <div>
        <button
          onClick={() => toggleSection('ingredients')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Ingredients ({filterOptions.ingredients.length})
          {expandedSections.ingredients ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.ingredients && (
          <div className="space-y-3">
            {/* Search input for ingredients */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerms.ingredients}
                onChange={(e) => updateSearchTerm('ingredients', e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filterIngredients().map((ingredient) => (
                <label key={ingredient.ing_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.ingredientIds.includes(ingredient.ing_id)}
                    onChange={() => updateFilters({
                      ingredientIds: toggleArrayValue(localFilters.ingredientIds, ingredient.ing_id)
                    })}
                    className="cursor-pointer w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{ingredient.ing_name}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      ingredient.ing_risk_type === 'B' ? 'bg-red-100 text-red-700' :
                      ingredient.ing_risk_type === 'H' ? 'bg-orange-100 text-orange-700' :
                      ingredient.ing_risk_type === 'L' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ingredient.ing_risk_type === 'B' ? 'Banned' :
                       ingredient.ing_risk_type === 'H' ? 'High Risk' :
                       ingredient.ing_risk_type === 'L' ? 'Low Risk' :
                       'Normal'}
                    </span>
                  </div>
                </label>
              ))}
              {filterIngredients().length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No ingredients found matching &quot;{searchTerms.ingredients}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [allSearchResults, setAllSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [similarByNotif, setSimilarByNotif] = useState<
    Record<string, SimilarProductResult[]>
  >({});
  const [loadingSimilar, setLoadingSimilar] = useState<Record<string, boolean>>(
    {}
  );
  const [searchError, setSearchError] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ingredients: []
  });
  const [activeFilters, setActiveFilters] = useState<ProductFilters>({
    safetyLevels: [],
    ingredientIds: [],
    approvalStatuses: []
  });
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);

  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingFeatured, startFeaturedTransition] = useTransition();
  const [isLoadingFilters, startFiltersTransition] = useTransition();

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageResults = allSearchResults.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    const resultsSection = document.getElementById('search-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearch = useCallback((query: string, filters?: ProductFilters, resetPage = true) => {
    const filtersToUse = filters || activeFilters;
    const hasAnyFilters = 
      filtersToUse.safetyLevels.length > 0 ||
      filtersToUse.ingredientIds.length > 0 ||
      filtersToUse.approvalStatuses.length > 0;

    if (!query.trim() && !hasAnyFilters) {
      setAllSearchResults([]);
      setHasSearched(false);
      setSearchError("");
      setTotalItems(0);
      setCurrentPage(1);
      return;
    }

    setHasSearched(true);
    setSearchError("");
    
    if (resetPage) {
      setCurrentPage(1);
    }

    startSearchTransition(async () => {
      try {
        let dbResults: Product[];
        
        if (hasAnyFilters) {
          dbResults = await getFilteredProductsAction(filtersToUse, query.trim() || undefined);
        } else {
          dbResults = await searchProductsAction(query);
        }
        
        setAllSearchResults(dbResults);
        setTotalItems(dbResults.length);
        
        if (dbResults.length === 0) {
          if (hasAnyFilters) {
            setShowNoResultsModal(true);
          } else {
            setSearchError(
              `No products found for "${query}". Try different keywords.`
            );
          }
        }
      } catch (error) {
        console.error("Database search failed:", error);
        setSearchError("Search failed. Please try again later.");
        setAllSearchResults([]);
        setTotalItems(0);
      }
    });
  }, [activeFilters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilters, handleSearch]);

  // Load featured products and filter options on first render
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

    startFiltersTransition(async () => {
      try {
        const options = await getFilterOptionsAction();
        setFilterOptions(options);
      } catch (e) {
        console.error("Failed to load filter options:", e);
      }
    });
  }, []);

  const applyFilters = (newFilters: ProductFilters) => {
    setActiveFilters(newFilters);
    handleSearch(searchQuery, newFilters, true); // Reset to page 1 when filters change
  };

  const clearFilters = () => {
    const emptyFilters: ProductFilters = {
      safetyLevels: [],
      ingredientIds: [],
      approvalStatuses: []
    };
    setActiveFilters(emptyFilters);
    handleSearch(searchQuery, emptyFilters, true); // Reset to page 1 when clearing filters
  };

  const hasActiveFilters = 
    activeFilters.safetyLevels.length > 0 ||
    activeFilters.ingredientIds.length > 0 ||
    activeFilters.approvalStatuses.length > 0

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
                          setAllSearchResults([]);
                          setHasSearched(false);
                          setSearchError("");
                          setTotalItems(0);
                          setCurrentPage(1);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                        title="Clear search"
                        aria-label="Clear search input"
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

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                showFilters
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <FilterPanel
                filterOptions={filterOptions}
                activeFilters={activeFilters}
                onFiltersChange={applyFilters}
                isLoading={isLoadingFilters}
              />
            </div>
          )}
        </div>

        {/* No Results Modal */}
        {showNoResultsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-4">
                  No products match your filter criteria – try adjusting filters
                </p>
                <button
                  onClick={() => setShowNoResultsModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6" id="search-results">
            {allSearchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Found {totalItems} result{totalItems !== 1 ? "s" : ""}
                  </h2>
                  {totalPages > 1 && (
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentPageResults.map((product) => {
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

                {/* Pagination Component */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  isLoading={isSearching}
                />

                {/* Quick Actions Section */}
                {currentPageResults.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions (Current Page)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentPageResults.map((product) => (
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
                )}
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