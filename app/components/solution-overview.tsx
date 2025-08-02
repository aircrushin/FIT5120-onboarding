export default function SolutionOverview() {
  const features = [
    { icon: "🔍", title: "Product Scanner", desc: "Check any cosmetic product instantly" },
    { icon: "⚠️", title: "Safety Alerts", desc: "Get notified about banned products" },
    { icon: "📊", title: "Risk Analysis", desc: "Understand ingredient safety data" },
    { icon: "🏥", title: "Health Authority Data", desc: "Access verified safety information" },
  ];

  return (
    <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 hover:bg-blue-600 transition-colors duration-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1h-3V4c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1v3H3c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1h3v3c0 .552.448 1 1 1h10c.552 0 1-.448 1-1v-3h3z"/>
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Our Solution</h2>
        <p className="text-sm sm:text-base text-slate-700">
          A data-driven platform that empowers young consumers to make informed cosmetic choices
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 sm:mb-12">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white/70 rounded-lg p-3 sm:p-4 border border-white/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-xl sm:text-2xl mb-2">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base">{feature.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <button className="bg-blue-600 text-white px-6 py-3 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base">
          Start Scanning
        </button>
        <button className="bg-white text-blue-600 px-6 py-3 sm:px-4 sm:py-2 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base">
          Learn More
        </button>
      </div>
    </div>
  );
} 