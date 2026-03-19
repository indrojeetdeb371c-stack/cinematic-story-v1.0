import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react';

export default function Contact() {
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(err => console.error('Failed to fetch settings:', err));
  }, []);

  return (
    <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">আমাদের সাথে <span className="text-gold">যোগাযোগ</span> করুন</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          আপনার কোনো প্রশ্ন থাকলে বা বুকিং সংক্রান্ত আলোচনার জন্য আমাদের সাথে যোগাযোগ করতে পারেন। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="glass-card p-8 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gold/10 text-gold">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ফোন করুন</h3>
              <p className="text-gray-400">{settings?.phone || '+৮৮০ ১৭০০-০০০০০০'}</p>
            </div>
          </div>

          <div className="glass-card p-8 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gold/10 text-gold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ইমেইল করুন</h3>
              <p className="text-gray-400">{settings?.email || 'info@cinematicstory.com'}</p>
            </div>
          </div>

          <div className="glass-card p-8 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gold/10 text-gold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">অফিস ঠিকানা</h3>
              <p className="text-gray-400">{settings?.address || 'হাউজ #১২, রোড #০৫, ধানমন্ডি, ঢাকা - ১২০৯'}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <a href={settings?.facebook || "#"} className="p-4 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
              <Facebook className="w-6 h-6" />
            </a>
            <a href={settings?.instagram || "#"} className="p-4 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
              <Instagram className="w-6 h-6" />
            </a>
            <a href={settings?.youtube || "#"} className="p-4 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 glass-card p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-8">সরাসরি মেসেজ পাঠান</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">আপনার নাম</label>
              <input 
                type="text" 
                placeholder="নাম লিখুন"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">ইমেইল এড্রেস</label>
              <input 
                type="email" 
                placeholder="example@mail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-400">বিষয়</label>
              <input 
                type="text" 
                placeholder="কি বিষয়ে জানতে চান?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-400">মেসেজ</label>
              <textarea 
                placeholder="আপনার মেসেজটি এখানে লিখুন..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button className="w-full md:w-auto px-10 py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2">
                মেসেজ পাঠান <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
