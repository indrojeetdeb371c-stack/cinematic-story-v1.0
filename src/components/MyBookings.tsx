import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Package, Info } from 'lucide-react';
import { auth, onAuthStateChanged, User } from '../firebase';

export default function MyBookings() {
  const [user, setUser] = React.useState<User | null>(null);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchMyBookings(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyBookings = async (uid: string) => {
    try {
      const response = await fetch(`/api/bookings/user/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-md">
          <Calendar className="w-16 h-16 text-gold mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">আপনার বুকিং দেখতে লগইন করুন</h2>
          <p className="text-gray-400 mb-8">আপনার করা সকল বুকিং এবং সেগুলোর স্ট্যাটাস দেখতে আপনাকে অবশ্যই লগইন করতে হবে।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">আমার <span className="text-gold">বুকিংসমূহ</span></h1>
        <p className="text-gray-400">আপনার করা সকল বুকিং রিকোয়েস্ট এবং সেগুলোর বর্তমান অবস্থা এখানে দেখতে পাবেন।</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">কোনো বুকিং পাওয়া যায়নি</h3>
          <p className="text-gray-400 mb-8">আপনি এখনো কোনো বুকিং রিকোয়েস্ট পাঠাননি।</p>
          <a href="/booking" className="inline-block bg-gold text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-all">
            এখনই বুক করুন
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 md:p-8 relative overflow-hidden group"
            >
              {/* Status Badge */}
              <div className="absolute top-0 right-0">
                <div className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-bl-2xl ${
                  booking.status === 'approved' ? 'bg-emerald-500 text-white' :
                  booking.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {booking.status === 'approved' ? 'এপ্রুভড' :
                   booking.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/5 text-gold">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">তারিখ</p>
                      <p className="text-xl font-bold">{new Date(booking.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white/5 text-gold">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">লোকেশন</p>
                        <p className="text-gray-200">{booking.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white/5 text-gold">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">প্যাকেজ</p>
                        <p className="text-gray-200">{booking.package}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                  <div className="text-center md:text-right mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">বুকিং স্ট্যাটাস</p>
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                      {booking.status === 'approved' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : booking.status === 'rejected' ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-yellow-500" />
                      )}
                      <span className={`text-2xl font-bold ${
                        booking.status === 'approved' ? 'text-emerald-500' :
                        booking.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {booking.status === 'approved' ? 'সফল' :
                         booking.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}
                      </span>
                    </div>
                  </div>
                  
                  {booking.status === 'approved' && (
                    <p className="text-xs text-emerald-500/80 text-center md:text-right">
                      অভিনন্দন! আপনার বুকিংটি কনফার্ম করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                    </p>
                  )}
                  {booking.status === 'rejected' && (
                    <p className="text-xs text-red-500/80 text-center md:text-right">
                      দুঃখিত, আপনার বুকিংটি এই মুহূর্তে গ্রহণ করা সম্ভব হচ্ছে না। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
                    </p>
                  )}
                  {booking.status === 'pending' && (
                    <p className="text-xs text-yellow-500/80 text-center md:text-right">
                      আপনার বুকিং রিকোয়েস্টটি আমাদের কাছে পৌঁছেছে। এডমিন এটি রিভিউ করছেন।
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-12 glass-card p-8 flex items-start gap-4">
        <div className="p-3 rounded-full bg-gold/10 text-gold shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold mb-2">বুকিং সংক্রান্ত তথ্য</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            বুকিং রিকোয়েস্ট পাঠানোর পর আমাদের এডমিন প্যানেল থেকে সেটি যাচাই করা হয়। এপ্রুভ হওয়ার পর আপনার দেওয়া ফোন নম্বরে আমরা যোগাযোগ করব। কোনো কারণে বুকিং বাতিল হলে আপনি এখানে তা দেখতে পাবেন। যেকোনো প্রয়োজনে সরাসরি আমাদের ফোন করতে পারেন।
          </p>
        </div>
      </div>
    </div>
  );
}
