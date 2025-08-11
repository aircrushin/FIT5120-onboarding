'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldX, Info } from 'lucide-react'
import { IngredientRiskModal } from './ingredient-risk-modal'

interface Ingredient {
  name: string
  risk_type: 'L' | 'H' | 'B'
  risk_summary: string
}

interface IngredientsDisplayProps {
  ingredients: Ingredient[]
  productName: string
}

export function IngredientsDisplay({ ingredients, productName }: IngredientsDisplayProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleIngredientClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedIngredient(null)
  }

  // If no ingredients or empty ingredients array
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No ingredient data available for this product.
        </p>
      </div>
    )
  }

  // Helper function to get the appropriate icon and styling for each risk type
  const getRiskIcon = (riskType: 'L' | 'H' | 'B') => {
    switch (riskType) {
      case 'B': // Banned - Red with warning icon
        return <ShieldX className="w-5 h-5 text-red-600" />
      case 'H': // High Risk - Yellow with caution icon  
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'L': // Low Risk - No special icon needed
      default:
        return null
    }
  }

  const getRiskStyling = (riskType: 'L' | 'H' | 'B') => {
    switch (riskType) {
      case 'B': // Banned - Red background
        return 'bg-red-50 border-l-red-500 border-l-4'
      case 'H': // High Risk - Yellow background
        return 'bg-yellow-50 border-l-yellow-500 border-l-4'
      case 'L': // Low Risk - Default styling
      default:
        return 'bg-green-50 border-l-green-500 border-l-4'
    }
  }

  const getRiskBadge = (riskType: 'L' | 'H' | 'B') => {
    switch (riskType) {
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">
            <ShieldX className="w-3 h-3" />
            Banned
          </span>
        )
      case 'H':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        )
      case 'L':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
            Safe
          </span>
        )
    }
  }

  // Sort ingredients: Banned first, then High Risk, then Low Risk
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const riskOrder = { 'B': 0, 'H': 1, 'L': 2 }
    return riskOrder[a.risk_type] - riskOrder[b.risk_type]
  })

  // Check if there are any banned or high-risk ingredients to show summary
  const bannedCount = ingredients.filter(ing => ing.risk_type === 'B').length
  const highRiskCount = ingredients.filter(ing => ing.risk_type === 'H').length
  const lowRiskCount = ingredients.filter(ing => ing.risk_type === 'L').length

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{lowRiskCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Safe</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{highRiskCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{bannedCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Banned</div>
        </div>
      </div>

      {/* Warning message if there are banned or high-risk ingredients */}
      {(bannedCount > 0 || highRiskCount > 0) && (
        <div className={`p-4 rounded-lg ${bannedCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            {bannedCount > 0 ? (
              <ShieldX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className={`font-semibold ${bannedCount > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                {bannedCount > 0 ? '⚠️ Warning: Banned Ingredients Detected' : '⚠️ Caution: High-Risk Ingredients Present'}
              </h4>
              <p className={`text-sm ${bannedCount > 0 ? 'text-red-700' : 'text-yellow-700'} mt-1`}>
                {bannedCount > 0 
                  ? 'This product contains banned ingredients and should not be used.'
                  : 'This product contains high-risk ingredients. Use with caution and consider alternatives.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Ingredients ({ingredients.length})
        </h3>
        
        <div className="space-y-3 lg:col-span-1">
          {sortedIngredients.map((ingredient, index) => (
            <div key={index} className={`p-4 rounded-lg ${getRiskStyling(ingredient.risk_type)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getRiskIcon(ingredient.risk_type)}
                    <button
                      onClick={() => handleIngredientClick(ingredient)}
                      className="font-semibold text-gray-900 dark:text-white text-lg hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer underline decoration-transparent hover:decoration-current"
                    >
                      {ingredient.name}
                    </button>
                    {getRiskBadge(ingredient.risk_type)}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {ingredient.risk_summary || 'No additional information available for this ingredient.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Summary Modal */}
      <IngredientRiskModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ingredient={selectedIngredient}
      />
    </div>
  )
} 