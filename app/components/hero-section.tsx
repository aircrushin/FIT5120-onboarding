import Link from 'next/link'

export default function HeroSection() {
  return (
    <div className="col-span-1 md:col-span-2 md:row-span-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-start text-white relative overflow-hidden hover:from-red-600 hover:to-orange-700 transition-colors duration-300">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Protect Your Skin, 
          <br />
          <span className="text-orange-200">Protect Your Health</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-orange-100 mb-6 max-w-lg">
          Helping young adults in Malaysia make informed cosmetic choices and avoid harmful products.
        </p>
        <Link href="/product-search" className="bg-white text-red-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 text-sm sm:text-base">
          Check Product Safety
        </Link>
      </div>
      <div className="absolute bottom-4 right-4 opacity-20">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="sm:w-20 sm:h-20 md:w-24 md:h-24">
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M35 50L45 60L65 40" stroke="white" strokeWidth="3" fill="none"/>
        </svg>
      </div>
    </div>
  );
} 