import { cn } from "@/lib/utils";
import { Shield, Search, Users, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const CosmeticSafetyBentoGrid = () => {
  return (
    <section id='safety-tools' className='bg-white rounded-3xl p-4 my-12 max-w-7xl mx-auto'>
      <div className='flex flex-col md:flex-row items-end justify-between w-full'>
        <div className='flex flex-col my-12 w-full items-start justify-start gap-4'>
          <div className='flex flex-col md:flex-row gap-2 items-end w-full justify-between '>
            <h2 className="relative text-4xl md:text-5xl font-sans font-semibold max-w-xl text-left leading-[1em] text-base-content">
              Cosmetic Safety, <br/> 
              <span className="bg-gradient-to-r from-rose-400 via-pink-600 to-purple-700 bg-clip-text text-transparent">simplified & accessible.</span>
            </h2>
            <p className='max-w-sm font-semibold text-md text-neutral/50'>
              Empowering young consumers in Malaysia with comprehensive safety information, ingredient analysis, and trusted product recommendations.
            </p>
          </div>

          <div className='flex flex-row text-accent gap-6 items-start justify-center'>
            <p className='text-base whitespace-nowrap font-medium italic'>Analyzed with open data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:items-start md:justify-start gap-4 ">
        
        <div className="cursor-pointer md:col-span-2 md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] transition-all duration-200 ease-in-out h-[330px] overflow-hidden relative bg-accent/20 rounded-xl flex flex-row items-center gap-8 justify-between px-3 pt-3 pb-6">
          <div className='relative w-full flex flex-col items-center justify-center ml-4 gap-3 z-10'>
            <Search className="text-accent/60" size={64} strokeWidth={1} />
            <p className='text-base-content'>AI-Powered Analysis</p>
            <h3 className='text-2xl whitespace-nowrap font-semibold text-center bg-base-content/90 text-black rounded-full'>Ingredient Scanner</h3>
          </div>  
          <Link href='/ingredient-scanner'>
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=400&fit=crop&crop=center"
              alt="Cosmetic ingredients analysis"
              className="w-full h-full object-cover rounded-xl opacity-30"
            />
          </div>
          </Link>
        </div>

        <Link href='/product-search' className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] transition-all duration-200 ease-in-out relative bg-highlight/20 h-[330px] rounded-xl flex flex-col items-center justify-between px-3 py-6">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&crop=center"
              alt="Safety alerts and warnings"
              className="w-full h-full object-cover rounded-xl opacity-25"
            />
          </div>
          <div className='h-full flex flex-col items-center justify-center gap-3 z-10'>
            <AlertTriangle className="text-accent/60" size={64} strokeWidth={1} />
            <p className='text-base-content'>Real-time Updates</p>
            <h3 className='text-2xl whitespace-nowrap font-semibold text-center bg-base-content/90 text-black rounded-full'>Safety Alerts</h3>
          </div>             
        </Link>

        <Link href='/safety-guide' className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] transition-all duration-200 ease-in-out relative bg-secondary/20 h-[330px] rounded-xl flex flex-col items-center justify-between px-5 py-6">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop&crop=center"
              alt="Skincare and skin types"
              className="w-full h-full object-cover rounded-xl opacity-25"
            />
          </div>
          <div className='flex flex-col items-center justify-center gap-3 z-10 h-full'>
            <Users className="text-secondary/80" size={60} strokeWidth={1} />
            <p className='text-base-content'>Personalized Recommendations</p>
            <h3 className='text-2xl font-semibold text-center bg-base-content/90 text-black rounded-full'>Skin Type Guide</h3>
          </div>
        </Link>

        <Link href='/safety-guide' className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:rotate-4 transition-all duration-200 ease-in-out relative bg-base-100 h-[330px] rounded-xl flex flex-col items-center justify-center px-5 py-6">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center"
              alt="Education and learning about cosmetics"
              className="w-full h-full object-cover rounded-xl opacity-20"
            />
          </div>
          <div className='flex flex-col items-center justify-center gap-3 z-10 h-full'>
            <BookOpen className="text-secondary/80" size={60} strokeWidth={1} />
            <p className='text-base-content'>Learn & Stay Safe</p>
            <h3 className='text-2xl font-semibold text-center bg-base-content/90 text-black rounded-full'>Safety Education</h3>
          </div>
        </Link>

        <Link href='' className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] transition-all duration-200 ease-in-out relative bg-primary/20 h-[330px] rounded-xl flex flex-col items-center justify-center px-5 py-6">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop&crop=center"
              alt="Verified safe cosmetic products"
              className="w-full h-full object-cover rounded-xl opacity-20"
            />
          </div>
          <div className='flex flex-col items-center justify-center gap-3 z-10 h-full'>
            <CheckCircle className="text-secondary/80" size={60} strokeWidth={1} />
            <p className='text-base-content'>Trusted Products</p>
            <h3 className='text-2xl font-semibold text-center bg-base-content/90 text-black rounded-full'>Verified Safe</h3>
          </div>
        </Link>
      </div>
    </section>
  );
}; 