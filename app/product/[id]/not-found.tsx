import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-6">
            <Package className="w-24 h-24 text-gray-400 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            href="/product-search" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
      </div>
    </div>
  )
} 