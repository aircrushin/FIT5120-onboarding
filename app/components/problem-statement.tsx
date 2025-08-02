export default function ProblemStatement() {
  return (
    <div className="col-span-1 md:row-span-2 bg-slate-900 rounded-2xl p-4 sm:p-6 text-white hover:bg-slate-800 transition-colors duration-300">
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4 hover:bg-red-400 transition-colors duration-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-3">The Hidden Danger</h2>
        </div>
        
        <div className="flex-1 space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-300">
          <p className="hover:text-slate-200 transition-colors duration-200">
            Young adults in Malaysia are increasingly exposed to cosmetic products promoted through 
            social media and influencer marketing.
          </p>
          <p className="hover:text-slate-200 transition-colors duration-200">
            <span className="text-red-400 font-medium">The problem:</span> Many rely on popularity 
            and reviews rather than verified safety information.
          </p>
          <p className="hover:text-slate-200 transition-colors duration-200">
            Products may contain harmful substances like <span className="text-orange-400 font-medium hover:text-orange-300 transition-colors duration-200">mercury</span>, 
            <span className="text-orange-400 font-medium hover:text-orange-300 transition-colors duration-200"> hydroquinone</span>, or <span className="text-orange-400 font-medium hover:text-orange-300 transition-colors duration-200">steroids</span>.
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-200">
          <p className="text-red-300 text-xs font-medium">
            ⚠️ Long-term risks include skin damage, hormonal disruption, and organ toxicity
          </p>
        </div>
      </div>
    </div>
  );
} 