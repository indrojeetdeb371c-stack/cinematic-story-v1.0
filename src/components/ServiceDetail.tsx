import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Camera, Video, Heart, Wind, Users, Award, Star } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Camera,
  Video,
  Heart,
  Wind,
  Users,
  Award,
  Star,
  CheckCircle2
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        const found = data.find((s: any) => s._id === id);
        setService(found);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch service:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 pb-24 px-4 text-center min-h-screen bg-dark-bg text-white">
        <h1 className="text-2xl font-bold">সার্ভিসটি পাওয়া যায়নি</h1>
        <button 
          onClick={() => navigate('/services')}
          className="mt-4 text-gold hover:underline flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> সেবাসমূহে ফিরে যান
        </button>
      </div>
    );
  }

  const IconComponent = ICON_MAP[service.icon] || Camera;

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="pt-32 pb-24 px-4 max-w-5xl mx-auto relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gold transition-colors group px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> ফিরে যান
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="glass-card p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <div className={`p-6 rounded-3xl bg-white/5 w-fit mb-8 text-gold shadow-lg`}>
                <IconComponent className="w-12 h-12" />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-tight text-white">
                {service.title}
              </h1>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  {service.fullDescription || service.description}
                </p>
              </div>

              {service.features && service.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                    <div className="w-8 h-1 bg-gold rounded-full"></div>
                    এই সার্ভিসের বৈশিষ্ট্যসমূহ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-gold/20 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-all">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-gray-200 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar Action */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 sticky top-32">
              <h3 className="text-xl font-bold mb-4 text-white">বুকিং করতে চান?</h3>
              <p className="text-gray-400 text-sm mb-8">
                আপনার বিশেষ দিনটিকে স্মরণীয় করে রাখতে আজই আমাদের সাথে যোগাযোগ করুন। আমরা আপনার প্রয়োজন অনুযায়ী প্যাকেজ কাস্টমাইজ করতে পারি।
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  ১০০% কোয়ালিটি গ্যারান্টি
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  দ্রুত ডেলিভারি সিস্টেম
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  প্রফেশনাল এডিটিং
                </div>
              </div>

              <button 
                onClick={() => navigate('/booking')}
                className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-gold/10 active:scale-95"
              >
                বুকিং শুরু করুন
              </button>
              
              <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">
                সিনেমেটিক স্টোরি বাই ইন্দ্রজিৎ দেব
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
