import { HeroDemo } from "@/components/ui/demo";
import { CosmeticSafetyBentoGrid } from "@/components/ui/colorful-bento-grid";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <HeroDemo />
        {/* Professional Bento Grid for Platform Features */}
        <div className="mt-8 sm:mt-10">
          <CosmeticSafetyBentoGrid />
        </div>
      </div>
    </div>
  );
}
