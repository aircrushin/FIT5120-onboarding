export default function ImpactQuote() {
  return (
    <div className="col-span-1 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-4 sm:p-6 text-slate-800 relative overflow-hidden hover:bg-white/50 hover:backdrop-blur-lg transition-all duration-300 shadow-xl">
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3 sm:mb-4 text-slate-600 sm:w-8 sm:h-8">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
          </svg>
          
          <blockquote className="text-sm sm:text-lg font-medium mb-4 leading-relaxed hover:text-slate-700 transition-colors duration-200">
            "Many young consumers unknowingly purchase products that could harm their health, 
            simply because they lack access to verified safety information."
          </blockquote>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200/50 rounded-full flex items-center justify-center hover:bg-slate-200/70 transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z"/>
            </svg>
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm hover:text-slate-700 transition-colors duration-200">Health Research Initiative</div>
            <div className="text-slate-600 text-xs hover:text-slate-500 transition-colors duration-200">Malaysia Consumer Study 2024</div>
          </div>
        </div>
      </div>
    </div>
  );
} 