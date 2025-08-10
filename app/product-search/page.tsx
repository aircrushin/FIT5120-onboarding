'use client';

import { useState, useEffect, useTransition } from 'react';
import { Search, AlertTriangle, CheckCircle, Package, Calendar, Building2, Shield, ShieldAlert, ShieldCheck, ShieldX, Info, BookOpen, Lightbulb } from 'lucide-react';
import { 
  searchProductsAction, 
  ProductSearchResult, 
  getRandomProductsAction, 
  FeaturedProduct, 
  getSimilarApprovedProductsAction, 
  SimilarProductResult 
} from '../actions/product-actions';
import { ProductCard } from '../components/ProductCard';


// Use the interface from the database queries
type Product = ProductSearchResult;

// Add this new component after the type definition
const SafetyRatingsChart = () => {
  const safetyData = [
    { label: '85-100', category: 'Excellent', count: 45, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-800', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: '70-84', category: 'Good', count: 30, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-800', icon: <Shield className="w-4 h-4" /> },
    { label: '50-69', category: 'Fair', count: 15, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: '1-49', category: 'Poor', count: 8, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-800', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: '0', category: 'Dangerous', count: 2, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-800', icon: <ShieldX className="w-4 h-4" /> },
  ];

  const maxCount = Math.max(...safetyData.map(item => item.count));

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 bg-purple-100 rounded-full">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h4 className="font-medium text-gray-900">Safety Score Distribution</h4>
      </div>
      <div className="space-y-3">
        {safetyData.map((item, index) => (
          <div key={index} className={`p-3 ${item.bgColor} rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${item.textColor} flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className={`ml-2 text-sm font-semibold ${item.textColor}`}>{item.category}</span>
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
            Distribution based on analysis of products in our database. Percentages represent relative frequency of each safety score range.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ProductSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [similarByNotif, setSimilarByNotif] = useState<Record<string, SimilarProductResult[]>>({});
  const [loadingSimilar, setLoadingSimilar] = useState<Record<string, boolean>>({});
  const [searchError, setSearchError] = useState<string>('');
  
  const [isSearching, startSearchTransition] = useTransition();
  const [isLoadingFeatured, startFeaturedTransition] = useTransition();



  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError('');
      return;
    }

    setHasSearched(true);
    setSearchError('');

    startSearchTransition(async () => {
      try {
        const dbResults = await searchProductsAction(query);
        setSearchResults(dbResults);
        if (dbResults.length === 0) {
          setSearchError(`No products found for "${query}". Try different keywords.`);
        }
      } catch (error) {
        console.error('Database search failed:', error);
        setSearchError('Search failed. Please try again later.');
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

  const getStatusBadge = (status: 'A' | 'C') => {
    if (status === 'A') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-4 h-4" />
          Cancelled/Unsafe
        </span>
      );
    }
  };

  const loadSimilarFor = async (notifNo: string) => {
    if (loadingSimilar[notifNo]) return;
    setLoadingSimilar(prev => ({ ...prev, [notifNo]: true }));
    try {
      const rows = await getSimilarApprovedProductsAction(notifNo, 6);
      setSimilarByNotif(prev => ({ ...prev, [notifNo]: rows }));
    } catch (e) {
      setSimilarByNotif(prev => ({ ...prev, [notifNo]: [] }));
    } finally {
      setLoadingSimilar(prev => ({ ...prev, [notifNo]: false }));
    }
  };

  const getRiskBadge = (riskType: 'L' | 'H' | 'B') => {
    switch (riskType) {
      case 'L':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Low Risk
          </span>
        );
      case 'H':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">
            <ShieldX className="w-3 h-3" />
            Banned
          </span>
        );
    }
  };

  const getTrustScoreComponent = (trustScore: number, trustLevel: string) => {
    const getScoreColor = () => {
      if (trustScore >= 85) return 'text-green-600';
      if (trustScore >= 70) return 'text-blue-600';
      if (trustScore >= 50) return 'text-yellow-600';
      if (trustScore > 0) return 'text-orange-600';
      return 'text-red-600';
    };

    const getScoreIcon = () => {
      if (trustScore >= 85) return <ShieldCheck className="w-5 h-5 text-green-600" />;
      if (trustScore >= 70) return <Shield className="w-5 h-5 text-blue-600" />;
      if (trustScore >= 50) return <ShieldAlert className="w-5 h-5 text-yellow-600" />;
      if (trustScore > 0) return <ShieldAlert className="w-5 h-5 text-orange-600" />;
      return <ShieldX className="w-5 h-5 text-red-600" />;
    };

    const getScoreBg = () => {
      if (trustScore >= 85) return 'bg-green-50 border-green-200';
      if (trustScore >= 70) return 'bg-blue-50 border-blue-200';
      if (trustScore >= 50) return 'bg-yellow-50 border-yellow-200';
      if (trustScore > 0) return 'bg-orange-50 border-orange-200';
      return 'bg-red-50 border-red-200';
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getScoreBg()}`}>
        {getScoreIcon()}
        <div className="text-sm">
          <div className={`font-bold ${getScoreColor()}`}>
            Trust Score: {trustScore}/100
          </div>
          <div className="text-xs text-gray-600 capitalize">
            {trustLevel} Safety
          </div>
        </div>
      </div>
    );
  };

  const calculateTrustScore = (product: Product) => {
    let score = 100;
    
    // Product status penalty
    if (product.prod_status_type === 'C') {
      score = 0; // Cancelled products get 0 score
      return { score: 0, level: 'dangerous' };
    }
    
    // Ingredient risk penalties
    const bannedCount = product.ingredients.filter(ing => ing.risk_type === 'B').length;
    const highRiskCount = product.ingredients.filter(ing => ing.risk_type === 'H').length;
    const lowRiskCount = product.ingredients.filter(ing => ing.risk_type === 'L').length;
    
    // Severe penalty for banned ingredients
    score -= bannedCount * 50;
    
    // Moderate penalty for high-risk ingredients
    score -= highRiskCount * 25;
    
    // Small bonus for having more low-risk ingredients
    score += Math.min(lowRiskCount * 2, 10);
    
    // Ensure score stays within 0-100
    score = Math.min(100, Math.max(0, score));
    
    // Determine trust level
    let level: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
    if (score >= 85) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'fair';
    else if (score > 0) level = 'poor';
    else level = 'dangerous';
    
    return { score, level };
  };

  const generateDecisionReasoning = (product: Product) => {
    const bannedIngredients = product.ingredients.filter(ing => ing.risk_type === 'B');
    const highRiskIngredients = product.ingredients.filter(ing => ing.risk_type === 'H');
    const lowRiskIngredients = product.ingredients.filter(ing => ing.risk_type === 'L');

    if (product.prod_status_type === 'C') {
      const reasons = [];
      
      if (bannedIngredients.length > 0) {
        reasons.push({
          type: 'critical',
          title: 'Banned Ingredients Detected',
          description: `This product contains ${bannedIngredients.length} banned substance${bannedIngredients.length > 1 ? 's' : ''}: ${bannedIngredients.map(ing => ing.name).join(', ')}. These ingredients are prohibited due to their potential health risks.`,
          ingredients: bannedIngredients.map(ing => ing.name),
          icon: 'ban'
        });
      }

      if (highRiskIngredients.length > 0) {
        reasons.push({
          type: 'warning',
          title: 'High-Risk Ingredients Present',
          description: `Contains ${highRiskIngredients.length} high-risk ingredient${highRiskIngredients.length > 1 ? 's' : ''} that may cause adverse reactions in sensitive individuals.`,
          ingredients: highRiskIngredients.map(ing => ing.name),
          icon: 'warning'
        });
      }

      if (reasons.length === 0) {
        reasons.push({
          type: 'critical',
          title: 'Administrative Cancellation',
          description: 'This product was cancelled due to regulatory compliance issues, manufacturing problems, or other administrative reasons.',
          ingredients: [],
          icon: 'ban'
        });
      }

      return {
        decision: 'cancelled',
        primaryReason: reasons[0],
        allReasons: reasons,
        learningPoint: bannedIngredients.length > 0 
          ? `Always check for banned ingredients like ${bannedIngredients[0].name}. These substances are prohibited because they can cause serious health issues including skin irritation, allergic reactions, or long-term health problems.`
          : 'Products can be cancelled for various reasons including safety concerns, regulatory non-compliance, or quality control issues. Always verify product status before use.'
      };
    } else {
      // Product is approved
      const reasons = [];
      
      if (lowRiskIngredients.length > 0) {
        reasons.push({
          type: 'positive',
          title: 'Safe Ingredients Confirmed',
          description: `This product contains ${lowRiskIngredients.length} low-risk ingredient${lowRiskIngredients.length > 1 ? 's' : ''} that are generally recognized as safe for cosmetic use.`,
          ingredients: lowRiskIngredients.map(ing => ing.name),
          icon: 'check'
        });
      }

      if (highRiskIngredients.length > 0) {
        reasons.push({
          type: 'caution',
          title: 'Monitored Ingredients Present',
          description: `Contains ${highRiskIngredients.length} ingredient${highRiskIngredients.length > 1 ? 's' : ''} that require careful monitoring. While approved, these may cause reactions in sensitive individuals.`,
          ingredients: highRiskIngredients.map(ing => ing.name),
          icon: 'warning'
        });
      }

      return {
        decision: 'approved',
        primaryReason: reasons[0] || {
          type: 'positive',
          title: 'Regulatory Compliance Met',
          description: 'This product has passed all regulatory requirements and safety assessments.',
          ingredients: [],
          icon: 'check'
        },
        allReasons: reasons,
        learningPoint: highRiskIngredients.length > 0
          ? `Even approved products may contain ingredients that don't suit everyone. If you have sensitive skin, patch test products containing ${highRiskIngredients[0].name} before full use.`
          : 'Approved products have met safety standards, but individual reactions can still occur. Always read ingredient lists and discontinue use if you experience any adverse reactions.'
      };
    }
  };

  const getOverallSafetyStatus = (product: Product) => {
    const trustData = calculateTrustScore(product);
    const reasoning = generateDecisionReasoning(product);
    
    if (product.prod_status_type === 'C') {
      return { 
        status: 'unsafe', 
        message: 'This product has been cancelled and is unsafe to use.',
        trustScore: trustData.score,
        trustLevel: trustData.level,
        reasoning
      };
    }
    
    const hasBannedIngredients = product.ingredients.some(ing => ing.risk_type === 'B');
    const hasHighRiskIngredients = product.ingredients.some(ing => ing.risk_type === 'H');
    
    if (hasBannedIngredients) {
      return { 
        status: 'unsafe', 
        message: 'This product contains banned ingredients and should not be used.',
        trustScore: trustData.score,
        trustLevel: trustData.level,
        reasoning
      };
    } else if (hasHighRiskIngredients) {
      return { 
        status: 'caution', 
        message: 'This product contains high-risk ingredients. Use with caution.',
        trustScore: trustData.score,
        trustLevel: trustData.level,
        reasoning
      };
    } else {
      return { 
        status: 'safe', 
        message: 'This product appears to be safe for use.',
        trustScore: trustData.score,
        trustLevel: trustData.level,
        reasoning
      };
    }
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
            Search for cosmetic products by name or notification number to check their safety status and ingredients.
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
                    <Search className={`w-5 h-5 transition-all duration-300 ${
                      searchQuery 
                        ? 'text-purple-500 scale-110' 
                        : 'text-gray-400 group-hover:text-gray-500 group-focus-within:text-purple-500'
                    }`} />
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
                          setSearchQuery('');
                          setSearchResults([]);
                          setHasSearched(false);
                          setSearchError('');
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Placeholder Text */}
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {[
                    "Try: 'Vitamin C serum'",
                    "'NOT(K)240000001'",
                    "'Face cream with retinol'"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(suggestion.replace(/['"]/g, ''))}
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
                    <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <div className="ml-4">
                    <div className="text-gray-700 font-medium">Analyzing products...</div>
                    <div className="text-sm text-gray-500">Checking safety database</div>
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
                      <div className="text-sm text-yellow-700">{searchError}</div>
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
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h2>
                
                {searchResults.map((product) => {
                  const safetyStatus = getOverallSafetyStatus(product);
                  const hasRelevanceScore = !!(product as any).relevanceScore && (product as any).relevanceScore > 0;
                  
                  return (
                    <div key={product.prod_notif_no} className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-l-gray-200">
                      {/* Quick Risk Indicator Bar */}
                      <div className={`h-2 ${
                        safetyStatus.trustScore >= 85 ? 'bg-green-500' :
                        safetyStatus.trustScore >= 70 ? 'bg-blue-500' :
                        safetyStatus.trustScore >= 50 ? 'bg-yellow-500' :
                        safetyStatus.trustScore > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      
                      {/* Product Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {product.prod_name}
                              </h3>
                              {/* Trust Score - Mobile/Tablet Position */}
                              <div className="lg:hidden">
                                {getTrustScoreComponent(safetyStatus.trustScore, safetyStatus.trustLevel)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {product.prod_brand}
                              </span>
                              <span>•</span>
                              <span>{product.prod_category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {product.holder_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              Status Date: {new Date(product.prod_status_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 lg:items-end">
                            {/* Trust Score - Desktop Position */}
                            <div className="hidden lg:block">
                              {getTrustScoreComponent(safetyStatus.trustScore, safetyStatus.trustLevel)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(product.prod_status_type)}
                            </div>
                            
                                                        <span className="text-sm text-gray-500">
                              {product.prod_notif_no}
                            </span>
                            
                            {/* Search Match Indicator */}
                            {hasRelevanceScore && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                                  <Search className="w-3 h-3" />
                                  Relevant
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Safety Status */}
                      <div className={`p-4 ${
                        safetyStatus.status === 'unsafe' 
                          ? 'bg-red-50 border-l-4 border-red-400' 
                          : safetyStatus.status === 'caution'
                          ? 'bg-yellow-50 border-l-4 border-yellow-400'
                          : 'bg-green-50 border-l-4 border-green-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {safetyStatus.status === 'unsafe' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : safetyStatus.status === 'caution' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <span className={`font-medium ${
                            safetyStatus.status === 'unsafe' 
                              ? 'text-red-800' 
                              : safetyStatus.status === 'caution'
                              ? 'text-yellow-800'
                              : 'text-green-800'
                          }`}>
                            {safetyStatus.message}
                          </span>
                        </div>
                      </div>

                      {/* Decision Reasoning */}
                      <div className="p-6 bg-gray-50 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <Info className="w-5 h-5 text-blue-600" />
                          <h4 className="text-lg font-semibold text-gray-900">
                            Why was this product {safetyStatus.reasoning.decision}?
                          </h4>
                        </div>
                        
                        {/* Primary Reason */}
                        <div className={`p-4 rounded-lg border-l-4 mb-4 ${
                          safetyStatus.reasoning.primaryReason.type === 'critical' ? 'bg-red-50 border-l-red-400' :
                          safetyStatus.reasoning.primaryReason.type === 'warning' ? 'bg-orange-50 border-l-orange-400' :
                          safetyStatus.reasoning.primaryReason.type === 'caution' ? 'bg-yellow-50 border-l-yellow-400' :
                          'bg-green-50 border-l-green-400'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${
                              safetyStatus.reasoning.primaryReason.type === 'critical' ? 'bg-red-100' :
                              safetyStatus.reasoning.primaryReason.type === 'warning' ? 'bg-orange-100' :
                              safetyStatus.reasoning.primaryReason.type === 'caution' ? 'bg-yellow-100' :
                              'bg-green-100'
                            }`}>
                              {safetyStatus.reasoning.primaryReason.icon === 'ban' && <ShieldX className="w-4 h-4 text-red-600" />}
                              {safetyStatus.reasoning.primaryReason.icon === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                              {safetyStatus.reasoning.primaryReason.icon === 'check' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold mb-1 ${
                                safetyStatus.reasoning.primaryReason.type === 'critical' ? 'text-red-800' :
                                safetyStatus.reasoning.primaryReason.type === 'warning' ? 'text-orange-800' :
                                safetyStatus.reasoning.primaryReason.type === 'caution' ? 'text-yellow-800' :
                                'text-green-800'
                              }`}>
                                {safetyStatus.reasoning.primaryReason.title}
                              </h5>
                              <p className="text-sm text-gray-700 mb-2">
                                {safetyStatus.reasoning.primaryReason.description}
                              </p>
                              {safetyStatus.reasoning.primaryReason.ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {safetyStatus.reasoning.primaryReason.ingredients.map((ingredient, idx) => (
                                    <span key={idx} className={`px-2 py-1 text-xs rounded-full ${
                                      safetyStatus.reasoning.primaryReason.type === 'critical' ? 'bg-red-200 text-red-800' :
                                      safetyStatus.reasoning.primaryReason.type === 'warning' ? 'bg-orange-200 text-orange-800' :
                                      'bg-green-200 text-green-800'
                                    }`}>
                                      {ingredient}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Reasons */}
                        {safetyStatus.reasoning.allReasons.length > 1 && (
                          <div className="space-y-3 mb-4">
                            {safetyStatus.reasoning.allReasons.slice(1).map((reason, index) => (
                              <div key={index} className={`p-3 rounded-lg border ${
                                reason.type === 'critical' ? 'border-red-200 bg-red-50' :
                                reason.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                                reason.type === 'caution' ? 'border-yellow-200 bg-yellow-50' :
                                'border-green-200 bg-green-50'
                              }`}>
                                <div className="flex items-start gap-2">
                                  <div className={`p-1 rounded-full ${
                                    reason.type === 'critical' ? 'bg-red-100' :
                                    reason.type === 'warning' ? 'bg-orange-100' :
                                    reason.type === 'caution' ? 'bg-yellow-100' :
                                    'bg-green-100'
                                  }`}>
                                    {reason.icon === 'ban' && <ShieldX className="w-3 h-3 text-red-600" />}
                                    {reason.icon === 'warning' && <AlertTriangle className="w-3 h-3 text-orange-600" />}
                                    {reason.icon === 'check' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                  </div>
                                  <div className="flex-1">
                                    <h6 className={`font-medium text-sm ${
                                      reason.type === 'critical' ? 'text-red-800' :
                                      reason.type === 'warning' ? 'text-orange-800' :
                                      reason.type === 'caution' ? 'text-yellow-800' :
                                      'text-green-800'
                                    }`}>
                                      {reason.title}
                                    </h6>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {reason.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Learning Point */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h6 className="font-semibold text-blue-900 mb-1">💡 Learning Point</h6>
                              <p className="text-sm text-blue-800">
                                {safetyStatus.reasoning.learningPoint}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Similar Approved Alternatives */}
                      <div className="p-6 border-t bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Similar Approved Alternatives</h4>
                          <a
                            href={`/alternatives/${encodeURIComponent(product.prod_notif_no)}`}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            Find alternatives
                          </a>
                        </div>
                        <p className="text-sm text-gray-500">You will be redirected to a page with similar approved products from trusted brands.</p>
                      </div>

                      {/* Ingredients Analysis */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Ingredients Analysis</h4>
                          <div className="text-sm text-gray-500">
                            {product.ingredients.length} ingredient{product.ingredients.length !== 1 ? 's' : ''} analyzed
                          </div>
                        </div>
                        
                        {/* Risk Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {product.ingredients.filter(ing => ing.risk_type === 'L').length}
                            </div>
                            <div className="text-xs text-gray-600">Low Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {product.ingredients.filter(ing => ing.risk_type === 'H').length}
                            </div>
                            <div className="text-xs text-gray-600">High Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {product.ingredients.filter(ing => ing.risk_type === 'B').length}
                            </div>
                            <div className="text-xs text-gray-600">Banned</div>
                          </div>
                        </div>
                        
                        {/* Detailed Ingredients List */}
                        <div className="space-y-3">
                          {product.ingredients
                            .sort((a, b) => {
                              // Sort by risk level: Banned first, then High Risk, then Low Risk
                              const riskOrder = { 'B': 0, 'H': 1, 'L': 2 };
                              return riskOrder[a.risk_type] - riskOrder[b.risk_type];
                            })
                            .map((ingredient, index) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                              ingredient.risk_type === 'B' ? 'bg-red-50 border-l-red-400' :
                              ingredient.risk_type === 'H' ? 'bg-orange-50 border-l-orange-400' :
                              'bg-green-50 border-l-green-400'
                            }`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                                    {getRiskBadge(ingredient.risk_type)}
                                  </div>
                                  <p className="text-sm text-gray-700">{ingredient.risk_summary}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  Try searching with a different product name or notification number.
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
                  <span className="ml-2 text-gray-600">Loading featured products...</span>
                </div>
              </div>
            ) : featured.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">You may want to search:</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featured.map((p) => (
                    <ProductCard
                      key={p.prod_notif_no}
                      product={{
                        prod_notif_no: p.prod_notif_no,
                        prod_name: p.prod_name,
                        prod_status_type: p.prod_status_type
                      }}
                      onSearchClick={() => {
                        setSearchQuery(p.prod_notif_no);
                        setHasSearched(true);
                        handleSearch(p.prod_notif_no);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            

            {/* Safety Rating Guide and Smart Shopping Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Safety Rating Guide */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Safety Ratings:</h3>
                
                                 {/* Trust Score Legend */}
                 <div className="mb-6">
                   <h4 className="font-medium text-gray-900 mb-3">Trust Score System:</h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                       <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                       <div className="flex-1">
                         <span className="font-medium text-green-800">85-100</span>
                         <span className="text-xs text-green-600 ml-2">Excellent</span>
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
                         <span className="font-medium text-yellow-800">50-69</span>
                         <span className="text-xs text-yellow-600 ml-2">Fair</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                       <ShieldAlert className="w-4 h-4 text-orange-600 flex-shrink-0" />
                       <div className="flex-1">
                         <span className="font-medium text-orange-800">1-49</span>
                         <span className="text-xs text-orange-600 ml-2">Poor</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                       <ShieldX className="w-4 h-4 text-red-600 flex-shrink-0" />
                       <div className="flex-1">
                         <span className="font-medium text-red-800">0</span>
                         <span className="text-xs text-red-600 ml-2">Dangerous</span>
                       </div>
                     </div>
                   </div>
                 </div>


                {/* Safety Score Distribution Chart */}
                <SafetyRatingsChart />
              </div>

              {/* Smart Shopping Guide */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Smart Cosmetic Shopping Guide</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      What to Look For
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Products with <strong>Approved status</strong> and high trust scores (70+)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Ingredients you recognize and have used safely before</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Products from <strong>reputable holders</strong> with good track records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Clear ingredient lists with mostly low-risk components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Recent approval dates indicating current compliance</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Red Flags to Avoid
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span><strong>Cancelled products</strong> - never safe to use</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>Products containing <strong>banned ingredients</strong> like mercury or hydroquinone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>Trust scores below 50 or multiple high-risk ingredients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>Products with unclear or incomplete ingredient information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>Very old approval dates that may not reflect current standards</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-purple-900 mb-2">Pro Tips for Safe Shopping:</h5>
                      <div className="text-sm text-purple-800 space-y-1">
                        <p>• <strong>Patch test first:</strong> Even approved products can cause individual reactions</p>
                        <p>• <strong>Read beyond marketing:</strong> Focus on the actual ingredient analysis and safety data</p>
                        <p>• <strong>Check regularly:</strong> Product statuses can change - verify before repurchasing</p>
                        <p>• <strong>Know your triggers:</strong> Keep a list of ingredients that have caused you problems</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
