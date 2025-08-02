import HeroSection from './components/hero-section';
import ProblemStatement from './components/problem-statement';
import StatisticsCard from './components/statistics-card';
import SolutionOverview from './components/solution-overview';
import ImpactQuote from './components/impact-quote';
import TargetAudience from './components/target-audience';

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
          
          {/* Statistics Card - 1 column, 1 row */}
          <StatisticsCard />
          
          {/* Impact Quote - 1 column, 1 row */}
          <ImpactQuote />
          
          {/* Target Audience - 1 column, 1 row */}
          <TargetAudience />
          
          {/* Solution Overview - 3 columns, 1 row */}
          <SolutionOverview />
        </div>
        
        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center text-sm text-slate-500 px-4">
          <p>© 2025 Cosmetic Safety Platform. Protecting young consumers in Malaysia.</p>
          <p className="mt-2">Built with data from Malaysian health authorities and safety research.</p>
        </footer>
      </div>
    </div>
  );
}
