'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, ShieldX, Info, Loader2 } from 'lucide-react'

interface Ingredient {
  name: string
  risk_type: 'L' | 'H' | 'B'
  risk_summary: string
}

interface IngredientRiskModalProps {
  isOpen: boolean
  onClose: () => void
  ingredient: Ingredient | null
}

export function IngredientRiskModal({ isOpen, onClose, ingredient }: IngredientRiskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [riskData, setRiskData] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && ingredient) {
      setIsLoading(true)
      
      // Simulate loading delay (up to 5 seconds as per requirement)
      const loadingTime = Math.random() * 2000 + 500 // 0.5-2.5 seconds for demo
      
      setTimeout(() => {
        // Set the risk data from the ingredient
        setRiskData(ingredient.risk_summary || null)
        setIsLoading(false)
      }, loadingTime)
    } else {
      setRiskData(null)
      setIsLoading(false)
    }
  }, [isOpen, ingredient])

  if (!isOpen || !ingredient) return null

  const getRiskIcon = () => {
    switch (ingredient.risk_type) {
      case 'B':
        return <ShieldX className="w-6 h-6 text-red-600" />
      case 'H':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'L':
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getRiskLevel = () => {
    switch (ingredient.risk_type) {
      case 'B':
        return { label: 'Banned Ingredient', color: 'text-red-800', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
      case 'H':
        return { label: 'High Risk Ingredient', color: 'text-yellow-800', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
      case 'L':
      default:
        return { label: 'Low Risk Ingredient', color: 'text-green-800', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    }
  }

  const riskLevel = getRiskLevel()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {getRiskIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ingredient.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${riskLevel.bgColor} ${riskLevel.color} ${riskLevel.borderColor}`}>
                  {riskLevel.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading risk information...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Risk Summary
                  </h4>
                  {riskData ? (
                    <div className={`p-4 rounded-lg border ${riskLevel.bgColor} ${riskLevel.borderColor}`}>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {riskData}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Info className="w-4 h-4" />
                        <p className="text-sm">
                          No risk information available for this ingredient.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional safety information based on risk type */}
                {ingredient.risk_type === 'B' && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <ShieldX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                          ⚠️ Warning: Banned Ingredient
                        </h5>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This ingredient has been banned for use in cosmetic products. 
                          Products containing this ingredient should not be used.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {ingredient.risk_type === 'H' && (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                          ⚠️ Caution: High-Risk Ingredient
                        </h5>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          This ingredient may pose health risks. Use products containing 
                          this ingredient with caution and consider safer alternatives.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 