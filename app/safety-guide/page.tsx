export const metadata = {
  title: "Safety Guide | SkinTelli",
  description:
    "Learn essential cosmetic product safety tips: ingredient awareness, patch testing, expiry checks, storage, and sensitive-skin guidance.",
};

export default function SafetyGuidePage() {
  const sections = [
    {
      title: "Understand Labels",
      points: [
        "Look for product registration numbers and reputable certifications",
        "Check PAO (Period After Opening) symbol and expiry date",
        "Fragrance-free ≠ Unscented: fragrances can be hidden",
      ],
      accent: "from-purple-600/10 to-pink-600/10",
      border: "border-purple-200",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-600"><path fill="currentColor" d="M12 2a5 5 0 0 1 5 5v1h1a3 3 0 1 1 0 6h-1.09a7.002 7.002 0 0 1-13.82 0H2a3 3 0 1 1 0-6h1V7a5 5 0 0 1 5-5h4Zm-2 14h4a3 3 0 1 0-4 0Z"/></svg>
      ),
    },
    {
      title: "Ingredient Awareness",
      points: [
        "Patch test new actives (AHAs, BHAs, retinoids, vitamin C)",
        "Avoid known irritants if sensitive: high alcohol, strong fragrance, dyes",
        "Combine actives carefully: avoid layering strong exfoliants with retinoids",
      ],
      accent: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-200",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600"><path fill="currentColor" d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12Zm0 4c2.5 3 3.75 5.5 3.75 8A3.75 3.75 0 1 1 8.25 14c0-2.5 1.25-5 3.75-8Z"/></svg>
      ),
    },
    {
      title: "Hygiene & Storage",
      points: [
        "Wash hands and tools; avoid sharing eye and lip products",
        "Keep products cool and away from direct sunlight",
        "Discard if texture, color, or smell changes",
      ],
      accent: "from-blue-600/10 to-indigo-600/10",
      border: "border-blue-200",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600"><path fill="currentColor" d="M7 3h10v4H7V3Zm0 6h10v12H7V9Zm2 2v8h6v-8H9Z"/></svg>
      ),
    },
    {
      title: "Special Populations",
      points: [
        "Pregnant/breastfeeding: consult professionals before retinoids or high-salicylic products",
        "Allergies/eczema: prefer short ingredient lists and patch test",
        "Teens: introduce one new product at a time",
      ],
      accent: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-200",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
      ),
    },
  ];

  return (
    <main className="relative">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-12 sm:py-16">
          <div className="text-center space-y-4 animate-fade-in">
            <span className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-semibold shadow">Guide</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800">
              Cosmetic Product Safety Guide
            </h1>
            <p className="mx-auto max-w-2xl text-slate-600 text-sm sm:text-base">
              Practical tips to help you choose, use, and store cosmetics safely every day.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {sections.map((s, i) => (
              <div
                key={s.title}
                className={`group relative rounded-2xl border ${s.border} bg-white/70 backdrop-blur p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative flex items-start space-x-3">
                  <div className="shrink-0 rounded-xl bg-white shadow p-2 animate-scale-in">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{s.title}</h3>
                    <ul className="mt-3 space-y-2 text-slate-600 text-sm list-disc pl-5">
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="text-slate-800 font-semibold">Patch Test</h4>
              <p className="mt-2 text-sm text-slate-600">Apply a small amount behind the ear or inner arm for 24-48 hours before full use.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="text-slate-800 font-semibold">Expiry & PAO</h4>
              <p className="mt-2 text-sm text-slate-600">Most mascaras: 3-6 months after opening. Sunscreen: follow expiry; store cool.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="text-slate-800 font-semibold">Sun Safety</h4>
              <p className="mt-2 text-sm text-slate-600">Use broad-spectrum SPF 30+ daily; reapply every 2 hours when outdoors.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-600 mr-2"><path fill="currentColor" d="M12 3a9 9 0 1 1-9 9 9.01 9.01 0 0 1 9-9Zm1 5h-2v6h2V8Zm0 8h-2v2h2v-2Z"/></svg>
              <p className="text-sm text-slate-600">
                This guide is educational and not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
