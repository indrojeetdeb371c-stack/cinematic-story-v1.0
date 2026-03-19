import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Camera, Video, Heart, Wind, Users, Award, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function Services({ isHomePage = false }: { isHomePage?: boolean }) {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className={`${isHomePage ? 'py-24' : 'pt-32 pb-24'} px-4 max-w-7xl mx-auto`}>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">আমাদের <span className="text-gold">সেবাসমূহ</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          আমরা শুধু ছবি তুলি না, আমরা স্মৃতি তৈরি করি। আমাদের প্রতিটি সার্ভিস আপনার প্রয়োজন অনুযায়ী কাস্টমাইজ করা সম্ভব।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const IconComponent = ICON_MAP[service.icon] || Camera;
          return (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 group hover:border-gold/30 transition-all flex flex-col"
            >
              <div className="p-4 rounded-2xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform text-gold">
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                {service.description}
              </p>
              <Link 
                to={`/services/${service._id}`}
                className="flex items-center gap-2 text-gold font-bold text-sm cursor-pointer group/link w-fit"
              >
                বিস্তারিত জানুন <Zap className="w-4 h-4 group-hover/link:fill-gold transition-all" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Why Choose Us */}
      <div className="mt-24 glass-card p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
        <h2 className="text-3xl font-bold mb-8">কেন আমাদের বেছে নেবেন?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-4xl font-bold text-gold mb-2">১০০%</div>
            <p className="text-gray-400">কোয়ালিটি গ্যারান্টি</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-gold mb-2">২৪/৭</div>
            <p className="text-gray-400">কাস্টমার সাপোর্ট</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-gold mb-2">দ্রুত</div>
            <p className="text-gray-400">ডেলিভারি সিস্টেম</p>
          </div>
        </div>
      </div>
    </div>
  );
}
