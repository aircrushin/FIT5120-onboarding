import HeroSection from './components/hero-section';
import ProblemStatement from './components/problem-statement';
import { CosmeticSafetyBentoGrid } from '@/components/ui/colorful-bento-grid';

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
        {/* Main Bento Grid */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
            {/* Hero Section - Takes up 2 columns and 2 rows */}
            <HeroSection />
            
            {/* Problem Statement - 1 column, 2 rows */}
            <ProblemStatement />
          </div>
        </div>

        {/* Professional Bento Grid for Platform Features */}
        <div className="mt-8 sm:mt-10">
          <CosmeticSafetyBentoGrid />
        </div>
      </div>
    </div>
  );
}
