import React from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  const [packages, setPackages] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPackages(data);
      })
      .catch(err => console.error('Failed to fetch packages:', err));
  }, []);

  return (
    <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">প্যাকেজ ও <span className="text-gold">মূল্যতালিকা</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন। আমরা কোয়ালিটির সাথে কোনো আপস করি না।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className={`relative glass-card p-8 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 ${
              pkg.tier === 'Premium' ? 'ring-2 ring-gold z-10' : 'opacity-90 hover:opacity-100'
            }`}
          >
            {/* Tier Badge: Half-in, Half-out, Left-aligned */}
            <div className="absolute -top-4 left-6 z-20">
              <span className={`inline-block px-5 py-1.5 rounded-lg text-sm font-bold shadow-xl border-b-4 transform -rotate-2 ${
                pkg.tier === 'Gold' ? 'bg-gold text-black border-yellow-700' :
                pkg.tier === 'Premium' ? 'bg-purple-600 text-white border-purple-800' : 
                'bg-blue-600 text-white border-blue-800'
              }`}>
                {pkg.tier === 'Gold' ? 'গোল্ড' :
                 pkg.tier === 'Premium' ? 'প্রিমিয়াম' : 'ব্যাসিক'}
              </span>
            </div>

            {pkg.tier === 'Premium' && (
              <div className="absolute top-8 right-8">
                <div className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-1 rounded border border-gold/20 animate-pulse">
                  সেরা পছন্দ
                </div>
              </div>
            )}
            
            <div className="mb-8 mt-6 text-center">
              <h3 className="text-2xl font-bold mb-3 tracking-tight">{pkg.name}</h3>
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-gold">{pkg.price}</span>
                <span className="text-gray-500 text-sm">/ইভেন্ট</span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

            <ul className="space-y-4 mb-10 flex-grow">
              {pkg.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 group">
                  <div className="mt-1 p-0.5 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-95 ${
                pkg.tier === 'Premium'
                  ? 'bg-gold text-black hover:bg-white shadow-lg shadow-gold/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              প্যাকেজটি বেছে নিন
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
