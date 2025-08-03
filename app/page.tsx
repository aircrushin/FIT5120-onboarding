import HeroSection from './components/hero-section';
import ProblemStatement from './components/problem-statement';
import { CosmeticSafetyBentoGrid } from '@/components/ui/colorful-bento-grid';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
          {/* Hero Section - Takes up 2 columns and 2 rows */}
          <HeroSection />
          
          {/* Problem Statement - 1 column, 2 rows */}
          <ProblemStatement />
        </div>
        
        {/* Professional Bento Grid for Platform Features */}
        <CosmeticSafetyBentoGrid />
        
        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center text-sm text-slate-500 px-4">
          <p>© FIT5120 TM01</p>
          <p className="mt-2">Built with open-data and love ❤ </p>
        </footer>
      </div>
    </div>
  );
}
