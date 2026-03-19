import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Award, Users, Heart } from 'lucide-react';

export default function About({ isHomePage = false }: { isHomePage?: boolean }) {
  const [aboutData, setAboutData] = React.useState({
    aboutTitle: 'আমার গল্প',
    aboutSubtitle: 'সিনেমেটিক স্টোরি: লেন্সের আড়ালে এক কারিগর',
    aboutDescription: 'ফটোগ্রাফি আমার কাছে শুধু একটি পেশা নয়, এটি একটি নেশা। গত ৫ বছর ধরে আমি মানুষের জীবনের সবচেয়ে সুন্দর মুহূর্তগুলোকে ক্যামেরাবন্দি করছি। "সিনেমেটিক স্টোরি" এর যাত্রা শুরু হয়েছিল প্রতিটি সাধারণ মুহূর্তকে অসাধারণভাবে ফুটিয়ে তোলার স্বপ্ন নিয়ে।',
    aboutImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=800',
    statsExperience: '৫+ বছর',
    statsEvents: '২০০+',
    statsPhotos: '৫০,০০০+',
    statsSatisfaction: '১০০%'
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.aboutTitle) {
          setAboutData({
            aboutTitle: data.aboutTitle,
            aboutSubtitle: data.aboutSubtitle,
            aboutDescription: data.aboutDescription,
            aboutImage: data.aboutImage,
            statsExperience: data.statsExperience || '৫+ বছর',
            statsEvents: data.statsEvents || '২০০+',
            statsPhotos: data.statsPhotos || '৫০,০০০+',
            statsSatisfaction: data.statsSatisfaction || '১০০%'
          });
        }
      })
      .catch(err => console.error('Failed to fetch about data:', err));
  }, []);

  return (
    <div className={`${isHomePage ? 'py-24' : 'pt-32 pb-24'} px-4 max-w-7xl mx-auto`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-gold/20 shadow-2xl shadow-gold/10">
            <img 
              src={`${aboutData.aboutImage}${aboutData.aboutImage.includes('?') ? '&' : '?'}v=${Date.now()}`} 
              alt="Indrojeet Deb" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 via-transparent to-transparent"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <span className="text-gold font-bold uppercase tracking-widest text-sm">{aboutData.aboutTitle}</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6 tracking-tighter leading-tight">
              {aboutData.aboutSubtitle}
            </h1>
            <p className="text-gray-400 leading-relaxed text-lg">
              {aboutData.aboutDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <Award className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-bold text-xl">{aboutData.statsExperience}</h3>
              <p className="text-gray-500 text-sm">অভিজ্ঞতা</p>
            </div>
            <div className="glass-card p-6">
              <Users className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-bold text-xl">{aboutData.statsEvents}</h3>
              <p className="text-gray-500 text-sm">সফল ইভেন্ট</p>
            </div>
            <div className="glass-card p-6">
              <Camera className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-bold text-xl">{aboutData.statsPhotos}</h3>
              <p className="text-gray-500 text-sm">ক্যাপচার করা ছবি</p>
            </div>
            <div className="glass-card p-6">
              <Heart className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-bold text-xl">{aboutData.statsSatisfaction}</h3>
              <p className="text-gray-500 text-sm">ক্লায়েন্ট সন্তুষ্টি</p>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed">
            আমরা বিশ্বাস করি প্রতিটি মানুষের একটি অনন্য গল্প আছে। আর সেই গল্পটি সিনেমাটিক স্টাইলে সবার সামনে তুলে ধরাই আমাদের সার্থকতা। আপনার জীবনের বিশেষ দিনটিকে স্মরণীয় করে রাখতে আমরা সর্বদা প্রতিশ্রুতিবদ্ধ।
          </p>
        </motion.div>
      </div>
    </div>
  );
}
