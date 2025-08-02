export default function StatisticsCard() {
  const stats = [
    { value: "73%", label: "of young adults rely on social media for product recommendations", color: "text-blue-400" },
    { value: "45%", label: "don't check safety certifications before purchase", color: "text-orange-400" },
    { value: "28%", label: "have experienced adverse reactions", color: "text-red-400" },
  ];

  return (
    <div className="col-span-1 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 hover:bg-blue-200 transition-colors duration-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <rect width="3" height="11" x="4" y="11" rx="1"/>
            <rect width="3" height="6" x="10.5" y="16" rx="1"/>
            <rect width="3" height="13" x="17" y="9" rx="1"/>
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">By The Numbers</h2>
        <p className="text-xs sm:text-sm text-slate-600">The scale of the problem in Malaysia</p>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="border-l-4 border-slate-200 pl-3 sm:pl-4 hover:border-blue-300 transition-colors duration-200"
          >
            <div className={`text-xl sm:text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-tight hover:text-slate-800 transition-colors duration-200">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 