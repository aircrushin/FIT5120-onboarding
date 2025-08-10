import { CheckCircle, AlertTriangle, Building2, Calendar, Package, Shield } from 'lucide-react'
import { getSimilarApprovedProducts, getProductByNotificationNumber } from '../../../db/queries/search'
import Link from 'next/link'

interface AlternativesPageProps {
  params: { notif: string }
}

export default async function AlternativesPage({ params }: AlternativesPageProps) {
  const referenceNotif = decodeURIComponent(params.notif)
  const reference = await getProductByNotificationNumber(referenceNotif)
  const alternatives = await getSimilarApprovedProducts(referenceNotif, 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/product-search" className="text-sm text-purple-600 hover:text-purple-700">← Back to search</Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Similar Approved Alternatives</h1>
              <p className="text-gray-600">We found alternatives in the same category from brands with more approved products.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-purple-600" /> Trusted brand heuristic
            </div>
          </div>
        </div>

        {reference && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Reference Product</div>
                <div className="font-semibold text-gray-900">{reference.prod_name}</div>
                <div className="text-xs text-gray-500 mt-1">{reference.prod_notif_no}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {reference.prod_brand}</span>
                  <span>•</span>
                  <span>{reference.prod_category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {reference.holder_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reference.prod_status_type === 'A' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="w-4 h-4" /> Cancelled
                  </span>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" /> {new Date(reference.prod_status_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {alternatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alternatives.map((p) => (
              <Link
                key={p.prod_notif_no}
                href={`/product-search?notif=${encodeURIComponent(p.prod_notif_no)}`}
                className="border rounded-xl bg-white p-5 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900 line-clamp-2">{p.prod_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.prod_notif_no}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {p.prod_brand}</span>
                  <span>•</span>
                  <span>{p.prod_category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {p.holder_name}</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-500">Trusted brand approvals: {p.holderApprovedCount}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-gray-600">No similar approved alternatives found.</div>
        )}
      </div>
    </div>
  )
}


