export default function TargetAudience() {
  const audiences = [
    {
      title: "Social Media Users",
      desc: "Those who discover products through Instagram, TikTok, and beauty influencers"
    },
    {
      title: "Safety-Conscious Buyers",
      desc: "Individuals who want to make informed purchasing decisions"
    },
    {
      title: "Urban Professionals",
      desc: "Young adults in KL and other cities with disposable income for skincare"
    }
  ];

  return (
    <div className="col-span-1 bg-green-50 rounded-2xl p-4 sm:p-6 border border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 hover:bg-green-600 transition-colors duration-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Who We Help</h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Targeting young adults in urban Malaysia who are active in beauty communities
        </p>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {audiences.map((audience, index) => (
          <div 
            key={index} 
            className="flex items-start gap-2 sm:gap-3 hover:bg-green-100 rounded-lg p-2 -m-2 transition-colors duration-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 transition-colors duration-200">
              <span className="font-medium hover:text-green-700 transition-colors duration-200">{audience.title}</span><br/>
              {audience.desc}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200">
        <p className="text-green-800 text-xs font-medium">
          🎯 Ages 18-35, tech-savvy, health-aware consumers
        </p>
      </div>
    </div>
  );
} 