"use client";

import { useState, useTransition } from "react";
import { Search, AlertTriangle, ShieldX, TrendingUp, Calendar, X } from "lucide-react";
import { searchIngredientAction, getIngredientBannedTrendsAction } from "../actions/ingredient-actions";

interface IngredientSearchResult {
  ing_id: number;
  ing_name: string;
  ing_risk_summary: string;
  ing_risk_type: 'B' | 'H' | 'L' | 'N';
}

interface BannedTrendData {
  year: number;
  banned_count: number;
}

interface IngredientTrends {
  ingredient_name: string;
  total_banned_count: number;
  yearly_trends: BannedTrendData[];
}

export default function IngredientScannerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<IngredientSearchResult | null>(null);
  const [trends, setTrends] = useState<IngredientTrends | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [searchError, setSearchError] = useState<string>("");

  const [isSearching, startSearchTransition] = useTransition();

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setHasSearched(true);
    setSearchError("");
    setSearchResult(null);
    setTrends(null);

    startSearchTransition(async () => {
      try {
        // Search for the ingredient
        const ingredient = await searchIngredientAction(query);
        
        if (!ingredient) {
          setSearchError(`No ingredient found matching "${query}". Please try a different name.`);
          return;
        }

        setSearchResult(ingredient);

        // Get banned trends if ingredient is banned
        if (ingredient.ing_risk_type === 'B') {
          const trendData = await getIngredientBannedTrendsAction(ingredient.ing_name);
          
          if (trendData && trendData.total_banned_count > 0) {
            setTrends(trendData);
          } else {
            setShowNoDataModal(true);
          }
        } else {
          setShowNoDataModal(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchError("Search failed. Please try again later.");
      }
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchQuery);
  };

  const handleExampleSearch = async (ingredientName: string) => {
    setSearchQuery(ingredientName);
    await performSearch(ingredientName);
  };

  const closeModal = () => {
    setShowNoDataModal(false);
  };

  const getRiskBadge = (riskType: 'B' | 'H' | 'L' | 'N') => {
    switch (riskType) {
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 border border-red-200">
            <ShieldX className="w-4 h-4" />
            Banned
          </span>
        );
      case 'H':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertTriangle className="w-4 h-4" />
            High Risk
          </span>
        );
      case 'L':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 border border-green-200">
            Low Risk
          </span>
        );
      case 'N':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            No Risk Data
          </span>
        );
    }
  };

  const maxCount = trends ? Math.max(...trends.yearly_trends.map(t => t.banned_count)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Banned Substances Library
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Search for cosmetic ingredients to check their safety status and view banned substance trends over time.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter ingredient name or click an example below"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                disabled={isSearching}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSearching ? "Searching..." : "Scan Ingredient"}
            </button>
          </form>
          
          {/* Example Ingredient Cards */}
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-4 text-sm">
              Or click on these common ingredients to search:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleExampleSearch("Mercury")}
                disabled={isSearching}
                className="p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg hover:from-red-100 hover:to-red-150 transition-all duration-200 disabled:opacity-50 text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldX className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Mercury</span>
                </div>
                <p className="text-xs text-red-600">Heavy metal toxin</p>
              </button>
              
              <button
                onClick={() => handleExampleSearch("Tretinoin")}
                disabled={isSearching}
                className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-yellow-150 transition-all duration-200 disabled:opacity-50 text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">Tretinoin</span>
                </div>
                <p className="text-xs text-yellow-600">Prescription retinoid</p>
              </button>
              
              <button
                onClick={() => handleExampleSearch("Clindamycin")}
                disabled={isSearching}
                className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-150 transition-all duration-200 disabled:opacity-50 text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Clindamycin</span>
                </div>
                <p className="text-xs text-blue-600">Antibiotic treatment</p>
              </button>
              
              <button
                onClick={() => handleExampleSearch("Hydroquinone")}
                disabled={isSearching}
                className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-all duration-200 disabled:opacity-50 text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldX className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">Hydroquinone</span>
                </div>
                <p className="text-xs text-purple-600">Skin lightening agent</p>
              </button>
            </div>
          </div>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{searchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && searchResult && (
          <div className="max-w-4xl mx-auto">
            {/* Ingredient Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {searchResult.ing_name}
                  </h2>
                  {getRiskBadge(searchResult.ing_risk_type)}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {searchResult.ing_risk_summary}
              </p>
            </div>

            {/* Trends Chart - Only show for banned ingredients with data */}
            {trends && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Banned Substance Trends
                  </h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600">
                    Total number of times <span className="font-semibold">{trends.ingredient_name}</span> has been banned: 
                    <span className="ml-2 text-2xl font-bold text-red-600">{trends.total_banned_count}</span>
                  </p>
                </div>

                {/* Vertical Bar Chart */}
                <div className="relative">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Banned Frequency by Year
                  </h4>
                  
                  <div className="flex items-end justify-center space-x-4 h-64 bg-gray-50 rounded-lg p-4">
                    {trends.yearly_trends.map((data) => (
                      <div key={data.year} className="flex flex-col items-center">
                        <div className="relative flex flex-col items-center justify-end h-48">
                          <div
                            className="bg-red-500 rounded-t w-12 min-h-[4px] flex items-end justify-center text-white text-xs font-medium"
                            style={{
                              height: `${Math.max((data.banned_count / maxCount) * 100, 4)}%`
                            }}
                          >
                            {data.banned_count > 0 && (
                              <span className="mb-1">{data.banned_count}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 mt-2 font-medium">
                          {data.year}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>X-axis: Year</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Y-axis: Number of Banned Products</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data Modal */}
        {showNoDataModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    No Banned Records Available
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                No banned ingredient records are available at this time for the searched ingredient.
              </p>
              <button
                onClick={closeModal}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 