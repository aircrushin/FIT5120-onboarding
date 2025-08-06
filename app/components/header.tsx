import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
      <div className="mx-auto px-3 sm:px-4 md:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform group-hover:scale-105">
              <Image
                src="/logo.svg"
                alt="Cosmetic Safety Platform Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                SkinTelli
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Product Safety
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="" 
              className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
            >
              Safety Guide
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
            >
              About
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Scan Product
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}