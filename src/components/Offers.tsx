import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Calendar, ArrowRight, Gift } from 'lucide-react';
import { Offer } from '../types';

export default function Offers() {
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, settingsRes] = await Promise.all([
          fetch('/api/offers'),
          fetch('/api/settings')
        ]);
        
        const offersData = await offersRes.json();
        const settingsData = await settingsRes.json();
        
        setOffers(offersData.filter((o: Offer) => o.isActive));
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">অফারগুলো লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (settings && !settings.showOffers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
        <div className="text-center glass-card p-12 max-w-md">
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl font-bold mb-4">অফার বর্তমানে বন্ধ আছে</h2>
          <p className="text-gray-400 mb-8">দুঃখিত, বর্তমানে আমাদের কোনো সক্রিয় অফার নেই। নতুন অফারের জন্য আমাদের ফেসবুক পেজে চোখ রাখুন।</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold font-bold text-sm mb-6"
        >
          <Gift className="w-4 h-4" /> বিশেষ অফার
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">আপনার জন্য <span className="text-gold">সেরা অফার</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          আমাদের প্রতিটি প্যাকেজে থাকছে আকর্ষণীয় ডিসকাউন্ট। আপনার পছন্দের অফারটি শেষ হওয়ার আগেই বুকিং করুন।
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center glass-card p-12">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">বর্তমানে কোনো অফার নেই</h3>
          <p className="text-gray-400">নতুন অফারের জন্য আমাদের সাথেই থাকুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 group hover:border-gold/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-gold text-black font-black px-4 py-2 rounded-bl-2xl rounded-tr-xl transform rotate-3 group-hover:rotate-0 transition-transform">
                  {offer.discount}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 pr-16">{offer.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                {offer.description}
              </p>

              <div className="flex items-center gap-2 text-gray-500 text-sm mb-8">
                <Calendar className="w-4 h-4" />
                মেয়াদ: {offer.expiryDate}
              </div>

              <button 
                onClick={() => window.location.href = '/booking'}
                className="w-full py-4 rounded-xl bg-white/5 group-hover:bg-gold group-hover:text-black font-bold transition-all flex items-center justify-center gap-2"
              >
                অফারটি নিন <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Terms */}
      <div className="mt-24 text-center text-gray-500 text-sm">
        <p>* শর্তাবলী প্রযোজ্য। অফারটি নির্দিষ্ট সময়ের জন্য কার্যকর।</p>
      </div>
    </div>
  );
}
