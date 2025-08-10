'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Package, Calendar, Building2, Shield, ShieldAlert, ShieldCheck, ShieldX, Info, BookOpen, Lightbulb } from 'lucide-react';
import { searchProducts, ProductSearchResult, getRandomProducts, FeaturedProduct, getSimilarApprovedProducts, SimilarProductResult } from '../../db/queries/search';

// Mock data based on the database schema
const mockProducts = [
  {
    prod_notif_no: 'NOT(K)240000001',
    prod_name: 'Revitalizing Face Cream with Vitamin C',
    prod_brand: 'GlowBeauty',
    prod_category: 'Facial Care',
    prod_status_type: 'A' as const, // Approved
    prod_status_date: '2024-01-15',
    holder_name: 'Beauty Corp Malaysia',
    ingredients: [
      { name: 'Vitamin C', risk_type: 'L' as const, risk_summary: 'Low risk antioxidant' },
      { name: 'Hyaluronic Acid', risk_type: 'L' as const, risk_summary: 'Safe moisturizing agent' }
    ]
  },
  {
    prod_notif_no: 'NOT(K)240000002',
    prod_name: 'Whitening Face Serum',
    prod_brand: 'FairSkin',
    prod_category: 'Facial Care',
    prod_status_type: 'C' as const, // Cancelled
    prod_status_date: '2024-02-10',
    holder_name: 'Cosmetic Solutions Sdn Bhd',
    ingredients: [
      { name: 'Hydroquinone', risk_type: 'B' as const, risk_summary: 'Banned ingredient - can cause skin irritation' },
      { name: 'Mercury compounds', risk_type: 'B' as const, risk_summary: 'Toxic heavy metal - health hazard' }
    ]
  },
  {
    prod_notif_no: 'NOT(K)240000003',
    prod_name: 'Natural Herbal Face Mask',
    prod_brand: 'EcoBeauty',
    prod_category: 'Facial Care',
    prod_status_type: 'A' as const,
    prod_status_date: '2024-01-20',
    holder_name: 'Green Cosmetics Sdn Bhd',
    ingredients: [
      { name: 'Tea Tree Oil', risk_type: 'H' as const, risk_summary: 'May cause allergic reactions in sensitive individuals' },
      { name: 'Aloe Vera', risk_type: 'L' as const, risk_summary: 'Generally safe natural ingredient' }
    ]
  },
  {
    prod_notif_no: 'NOT(K)240000004',
    prod_name: 'Anti-Aging Foundation SPF 30',
    prod_brand: 'LuxCosmetics',
    prod_category: 'Makeup',
    prod_status_type: 'C' as const,
    prod_status_date: '2024-03-05',
    holder_name: 'Premium Beauty Ltd',
    ingredients: [
      { name: 'Lead acetate', risk_type: 'B' as const, risk_summary: 'Toxic lead compound - banned for safety' },
      { name: 'Titanium dioxide', risk_type: 'L' as const, risk_summary: 'Safe UV protection ingredient' }
    ]
  },
  {
    prod_notif_no: 'NOT(K)240000005',
    prod_name: 'Moisturizing Lip Balm',
    prod_brand: 'SoftLips',
    prod_category: 'Lip Care',
    prod_status_type: 'A' as const,
    prod_status_date: '2024-01-30',
    holder_name: 'Lip Care International',
    ingredients: [
      { name: 'Beeswax', risk_type: 'L' as const, risk_summary: 'Natural safe ingredient' },
      { name: 'Shea Butter', risk_type: 'L' as const, risk_summary: 'Natural moisturizer' }
    ]
  }
];

// Use the interface from the database queries
type Product = ProductSearchResult;

export default function ProductSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [similarByNotif, setSimilarByNotif] = useState<Record<string, SimilarProductResult[]>>({});
  const [loadingSimilar, setLoadingSimilar] = useState<Record<string, boolean>>({});

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Try to search using the database first
      const dbResults = await searchProducts(query);
      
      if (dbResults.length > 0) {
        setSearchResults(dbResults);
      } else {
        // Fallback to mock data if no database results
        const mockResults = mockProducts.filter(product => 
          product.prod_name.toLowerCase().includes(query.toLowerCase()) ||
          product.prod_notif_no.toLowerCase().includes(query.toLowerCase()) ||
          product.prod_brand.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(mockResults);
      }
    } catch (error) {
      console.error('Database search failed, using mock data:', error);
      // Fallback to mock data if database search fails
      const mockResults = mockProducts.filter(product => 
        product.prod_name.toLowerCase().includes(query.toLowerCase()) ||
        product.prod_notif_no.toLowerCase().includes(query.toLowerCase()) ||
        product.prod_brand.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
    }

    setIsSearching(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load featured products on first render
  useEffect(() => {
    (async () => {
      try {
        const items = await getRandomProducts(6);
        if (items.length > 0) {
          setFeatured(items);
        } else {
          // Fallback from mock set if DB empty
          const fallback = mockProducts.slice(0, 6).map(p => ({
            prod_notif_no: p.prod_notif_no,
            prod_name: p.prod_name,
            prod_status_type: p.prod_status_type,
          }));
          setFeatured(fallback);
        }
      } catch (e) {
        const fallback = mockProducts.slice(0, 6).map(p => ({
          prod_notif_no: p.prod_notif_no,
          prod_name: p.prod_name,
          prod_status_type: p.prod_status_type,
        }));
        setFeatured(fallback);
      }
    })();
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
      const rows = await getSimilarApprovedProducts(notifNo, 6);
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name or notification number (e.g., 'Face Cream' or 'NOT(K)240000001')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
            />
          </div>
          
          {isSearching && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}
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
            {featured.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">You may want to search:</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.map((p) => (
                    <button
                      key={p.prod_notif_no}
                      type="button"
                      aria-label={`Search for ${p.prod_name}`}
                      onClick={() => {
                        setSearchQuery(p.prod_notif_no);
                        setHasSearched(true);
                        handleSearch(p.prod_notif_no);
                      }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow w-full text-left focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900 line-clamp-2">{p.prod_name}</div>
                          <div className="text-xs text-gray-500 mt-1">{p.prod_notif_no}</div>
                        </div>
                        <div>
                          {p.prod_status_type === 'A' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3" /> Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            

            {/* Safety Rating Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Safety Ratings:</h3>
              
              {/* Trust Score Legend */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Trust Score System:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">85-100</div>
                      <div className="text-xs text-green-600">Excellent</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-800">70-84</div>
                      <div className="text-xs text-blue-600">Good</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-yellow-800">50-69</div>
                      <div className="text-xs text-yellow-600">Fair</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-orange-800">1-49</div>
                      <div className="text-xs text-orange-600">Poor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <ShieldX className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-red-800">0</div>
                      <div className="text-xs text-red-600">Dangerous</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredient Risk Legend */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ingredient Risk Levels:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Low Risk</div>
                      <div className="text-xs text-green-600">Generally safe ingredients</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-orange-800">High Risk</div>
                      <div className="text-xs text-orange-600">May cause reactions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ShieldX className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-red-800">Banned</div>
                      <div className="text-xs text-red-600">Prohibited substances</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Shopping Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6">
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
        )}
      </div>
    </div>
  );
}
