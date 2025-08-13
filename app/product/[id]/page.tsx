import { CheckCircle, AlertTriangle, Building2, Calendar, Package, Shield, ShieldAlert, ShieldCheck, ShieldX, Info, Lightbulb, ArrowLeft, HelpCircle, Star, ExternalLink } from 'lucide-react'
import { getProductByNotificationNumber, getSimilarApprovedProducts } from '../../../db/queries/search'
import Link from 'next/link'
import { ProductCard } from '../../components/ProductCard'
import { notFound } from 'next/navigation'
import { Tabs } from '../../../components/ui/tabs'
import { IngredientsDisplay } from '../../components/ingredients-display'

interface ProductDetailPageProps {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const productId = decodeURIComponent(params.id)
  const product = await getProductByNotificationNumber(productId)
  
  if (!product) {
    notFound()
  }

  const similarProducts = await getSimilarApprovedProducts(productId, 6)

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

  const calculateTrustScore = () => {
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
      <div className="relative group">
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
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ml-1" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <div className="text-sm">
            <h4 className="font-semibold text-gray-900 mb-2">How Trust Score is Calculated</h4>
            <div className="space-y-2 text-gray-700">
              <p><strong>Starting Score:</strong> 100 points</p>
              <p><strong>Penalties:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Cancelled products: Score becomes 0</li>
                <li>Banned ingredients: -50 points each</li>
                <li>High-risk ingredients: -25 points each</li>
              </ul>
              <p><strong>Bonus:</strong> +2 points per low-risk ingredient (max +10)</p>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="font-medium mb-1">Score Ranges:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>85-100:</span>
                    <span className="text-green-600 font-medium">Excellent Safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span>70-84:</span>
                    <span className="text-blue-600 font-medium">Good Safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50-69:</span>
                    <span className="text-yellow-600 font-medium">Fair Safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1-49:</span>
                    <span className="text-orange-600 font-medium">Poor Safety</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0:</span>
                    <span className="text-red-600 font-medium">Dangerous</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateDecisionReasoning = () => {
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

  const getOverallSafetyStatus = () => {
    const trustData = calculateTrustScore();
    const reasoning = generateDecisionReasoning();
    
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

  const safetyStatus = getOverallSafetyStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/product-search" className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>

        {/* Product Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-4 border-l-gray-200 mb-6">
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {product.prod_name}
                  </h1>
                  {/* Trust Score - Mobile/Tablet Position */}
                  <div className="lg:hidden">
                    {getTrustScoreComponent(safetyStatus.trustScore, safetyStatus.trustLevel)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
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
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Notification Number</div>
                  <div className="font-mono text-xs">
                    {product.prod_notif_no}
                  </div>
                </div>
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
              <h2 className="text-lg font-semibold text-gray-900">
                Why was this product {safetyStatus.reasoning.decision}?
              </h2>
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
                  <h3 className={`font-semibold mb-1 ${
                    safetyStatus.reasoning.primaryReason.type === 'critical' ? 'text-red-800' :
                    safetyStatus.reasoning.primaryReason.type === 'warning' ? 'text-orange-800' :
                    safetyStatus.reasoning.primaryReason.type === 'caution' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {safetyStatus.reasoning.primaryReason.title}
                  </h3>
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
                        <h4 className={`font-medium text-sm ${
                          reason.type === 'critical' ? 'text-red-800' :
                          reason.type === 'warning' ? 'text-orange-800' :
                          reason.type === 'caution' ? 'text-yellow-800' :
                          'text-green-800'
                        }`}>
                          {reason.title}
                        </h4>
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
                  <h4 className="font-semibold text-blue-900 mb-1">💡 Learning Point</h4>
                  <p className="text-sm text-blue-800">
                    {safetyStatus.reasoning.learningPoint}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Alternatives Section */}
          {similarProducts.length > 0 && (
            <div className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50"></div>
              <div className="absolute inset-0 bg-white/80"></div>
              
              <div className="relative p-6 border-t border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-rose-400 to-purple-600 rounded-full">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Recommended Safe Alternatives
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {safetyStatus.status === 'unsafe' || safetyStatus.status === 'caution' 
                        ? 'Consider these safer approved alternatives instead'
                        : 'Other trusted products you might also like'
                      }
                    </p>
                  </div>
                  <Link
                    href={`/alternatives/${encodeURIComponent(product.prod_notif_no)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-purple-600 hover:from-rose-500 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    View All
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {/* Alert for unsafe products */}
                {(safetyStatus.status === 'unsafe' || safetyStatus.status === 'caution') && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-amber-800 font-medium">
                          {safetyStatus.status === 'unsafe' 
                            ? '⚠️ This product has safety concerns. We strongly recommend choosing from the alternatives below.'
                            : '⚠️ This product requires caution. Consider these safer alternatives if you have sensitive skin.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarProducts.slice(0, 4).map((p) => (
                    <div key={p.prod_notif_no} className="relative">
                      <ProductCard
                        product={{
                          prod_notif_no: p.prod_notif_no,
                          prod_name: p.prod_name,
                          prod_brand: p.prod_brand,
                          prod_category: p.prod_category,
                          holder_name: p.holder_name,
                          holderApprovedCount: p.holderApprovedCount,
                          prod_status_type: 'A'
                        }}
                        href={`/product/${encodeURIComponent(p.prod_notif_no)}`}
                      />
                      {/* Approved Badge Overlay */}
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        ✓ SAFE
                      </div>
                    </div>
                  ))}
                </div>

                {similarProducts.length > 4 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/alternatives/${encodeURIComponent(product.prod_notif_no)}`}
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View more alternatives
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Details Tabs */}
          <div className="p-6 border-t">
            <Tabs
              defaultTab="overview"
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Product Summary
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{product.prod_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{product.prod_brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{product.prod_category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Product ID:</span>
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {product.prod_notif_no.replace(/(.{4})/g, '$1 ').trim()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Holder:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{product.holder_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(product.prod_status_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'ingredients',
                  label: 'Ingredients',
                  content: (
                    <IngredientsDisplay 
                      ingredients={product.ingredients} 
                      productName={product.prod_name}
                    />
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 