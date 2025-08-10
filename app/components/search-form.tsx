'use client';

import { useActionState } from 'react';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { searchProductsAction, ProductSearchResult } from '../actions/product-actions';

// State type for the action
type SearchState = {
  results: ProductSearchResult[];
  error?: string;
};

// Server Action wrapper for form submission
async function searchFormAction(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const query = formData.get('query') as string;
  
  if (!query || !query.trim()) {
    return {
      results: [],
      error: 'Please enter a search query'
    };
  }

  try {
    const results = await searchProductsAction(query.trim());
    return {
      results,
      error: undefined
    };
  } catch (error) {
    return {
      results: [],
      error: 'Search failed. Please try again.'
    };
  }
}

interface SearchFormProps {
  className?: string;
}

export default function SearchForm({ className = '' }: SearchFormProps) {
  const [state, formAction, isPending] = useActionState(searchFormAction, {
    results: []
  });

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Search Form */}
      <form action={formAction} className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="query"
            placeholder="Search by product name or notification number..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
            disabled={isPending}
          />
        </div>
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </div>
          ) : (
            'Search Products'
          )}
        </button>

        {/* Error Display */}
        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{state.error}</span>
            </div>
          </div>
        )}
      </form>

      {/* Results Display */}
      {state.results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Found {state.results.length} result{state.results.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="grid gap-6">
            {state.results.map((product) => (
              <div key={product.prod_notif_no} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.prod_name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Brand:</span> {product.prod_brand}</p>
                      <p><span className="font-medium">Category:</span> {product.prod_category}</p>
                      <p><span className="font-medium">Notification:</span> {product.prod_notif_no}</p>
                      <p><span className="font-medium">Holder:</span> {product.holder_name}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {product.prod_status_type === 'A' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        Cancelled/Unsafe
                      </span>
                    )}
                  </div>
                </div>

                {/* Ingredients */}
                {product.ingredients.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Ingredients ({product.ingredients.length})
                    </h4>
                    <div className="space-y-2">
                      {product.ingredients.slice(0, 3).map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{ingredient.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ingredient.risk_type === 'L' ? 'bg-green-100 text-green-800' :
                            ingredient.risk_type === 'H' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {ingredient.risk_type === 'L' ? 'Low Risk' :
                             ingredient.risk_type === 'H' ? 'High Risk' : 'Banned'}
                          </span>
                        </div>
                      ))}
                      {product.ingredients.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{product.ingredients.length - 3} more ingredients
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 