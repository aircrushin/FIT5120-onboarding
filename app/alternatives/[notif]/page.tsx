import { CheckCircle, AlertTriangle, Building2, Calendar, Package, Shield } from 'lucide-react'
import { getSimilarApprovedProducts, getProductByNotificationNumber } from '../../../db/queries/search'
import Link from 'next/link'
import { ProductCard } from '../../components/ProductCard'

interface AlternativesPageProps {
  params: { notif: string }
}

export default async function AlternativesPage({ params }: AlternativesPageProps) {
  const referenceNotif = decodeURIComponent(params.notif)
  const reference = await getProductByNotificationNumber(referenceNotif)
  const alternatives = await getSimilarApprovedProducts(referenceNotif, 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/product-search" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">← Back to search</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Similar Approved Alternatives</h1>
              <p className="text-gray-600 dark:text-gray-300">We found alternatives in the same category from brands with more approved products.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Shield className="w-4 h-4 text-purple-600" /> Trusted brand heuristic
            </div>
          </div>
        </div>

        {reference && (
          <div className="mb-6">
            <ProductCard 
              product={{
                prod_notif_no: reference.prod_notif_no,
                prod_name: reference.prod_name,
                prod_brand: reference.prod_brand,
                prod_category: reference.prod_category,
                holder_name: reference.holder_name,
                prod_status_type: reference.prod_status_type,
                prod_status_date: reference.prod_status_date
              }}
              isReference={true}
            />
          </div>
        )}

        {alternatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {alternatives.map((p) => (
              <ProductCard
                key={p.prod_notif_no}
                product={{
                  prod_notif_no: p.prod_notif_no,
                  prod_name: p.prod_name,
                  prod_brand: p.prod_brand,
                  prod_category: p.prod_category,
                  holder_name: p.holder_name,
                  holderApprovedCount: p.holderApprovedCount
                }}
                href={`/product/${encodeURIComponent(p.prod_notif_no)}`}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-600 dark:text-gray-300">No similar approved alternatives found.</div>
        )}
      </div>
    </div>
  )
}


