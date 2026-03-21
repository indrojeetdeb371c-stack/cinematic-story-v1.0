import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [settings, setSettings] = React.useState<any>(null);
  const [heroImage, setHeroImage] = React.useState('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2069');

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.heroImage) {
          setHeroImage(`${data.heroImage}${data.heroImage.includes('?') ? '&' : '?'}v=${Date.now()}`);
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err));
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Wedding Photography"
          className="w-full h-full object-cover opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/20 via-dark-bg/60 to-dark-bg"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
            <Camera className="w-4 h-4" /> {settings?.heroSubtitle || 'প্রফেশনাল ফটোগ্রাফি সার্ভিস'}
          </span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
            {settings?.heroTitle || 'মুহূর্তগুলো হোক অমর ও জীবন্ত'}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {settings?.heroDescription || 'আপনার জীবনের বিশেষ দিনটির গল্প ক্যামেরার লেন্সে ফুটিয়ে তোলাই আমাদের লক্ষ্য। বিয়ের প্রতিটি আবেগঘন মুহূর্ত ধরে রাখতে আমরা আছি আপনার পাশে।'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#booking"
              className="w-full sm:w-auto px-8 py-4 bg-gold text-black rounded-full font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-2 group"
            >
              বুকিং করুন <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              পোর্টফোলিও দেখুন
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-gray-500">নিচে দেখুন</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent"></div>
      </motion.div>
    </section>
  );
}
