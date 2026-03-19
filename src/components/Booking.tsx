import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { bn } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, MapPin, User, LogIn } from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  User as FirebaseUser 
} from '../firebase';

export default function Booking() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [bookedDates, setBookedDates] = React.useState<Date[]>([]);
  const [formData, setFormData] = React.useState({ phone: '', location: '', package: '' });
  const [packages, setPackages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const fetchInitialData = async () => {
      try {
        const [bookingsRes, packagesRes] = await Promise.all([
          fetch('/api/bookings/approved'),
          fetch('/api/packages')
        ]);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            setBookedDates(bookingsData.map((b: any) => new Date(b.date)));
          }
        }

        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          if (Array.isArray(packagesData)) {
            setPackages(packagesData);
            if (packagesData.length > 0) {
              setFormData(prev => ({ ...prev, package: packagesData[0].name }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !formData.phone || !formData.location) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          phone: formData.phone,
          date: selectedDate.toISOString(),
          location: formData.location,
          package: formData.package,
          status: 'pending',
        }),
      });

      if (response.ok) {
        alert('বুকিং রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!');
        setSelectedDate(null);
        setFormData({ phone: '', location: '', package: 'silver' });
      } else {
        throw new Error('Failed to save booking');
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert('বুকিং ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const isBooked = (date: Date) => bookedDates.some(d => isSameDay(d, date));

  return (
    <section id="booking" className="py-24 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Calendar */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">বুকিং <span className="text-gold">ক্যালেন্ডার</span></h2>
              <p className="text-gray-400">
                আপনার পছন্দের তারিখটি খালি আছে কিনা দেখে নিন। সবুজ রঙ মানে তারিখটি খালি, লাল মানে বুকড।
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold capitalize">
                  {format(currentDate, 'MMMM yyyy', { locale: bn })}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
                    {d}
                  </div>
                ))}
                {days.map((day, i) => {
                  const booked = isBooked(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={day.toString()}
                      disabled={booked}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                        ${booked ? 'calendar-day-booked cursor-not-allowed' : 'calendar-day-available'}
                        ${selected ? 'ring-2 ring-gold bg-gold/30 text-white' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/50"></div>
                  <span className="text-xs text-gray-400">খালি আছে</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 border border-red-700"></div>
                  <span className="text-xs text-gray-400">বুকড (অ্যাভেইলেবল নেই)</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-gray-500 italic">
                * নিরাপত্তার স্বার্থে বুকিংয়ের বিস্তারিত তথ্য গোপন রাখা হয়েছে। শুধুমাত্র তারিখটি বুকড হিসেবে দেখানো হচ্ছে।
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex flex-col justify-center">
            {!loading && (
              user ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <User className="w-4 h-4" /> আপনার নাম
                      </label>
                      <input 
                        type="text" 
                        readOnly
                        value={user.displayName || ''}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> ফোন নম্বর
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="০১৭XXXXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> ইভেন্টের স্থান
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="ঠিকানা লিখুন"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> নির্বাচিত তারিখ
                    </label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedDate ? format(selectedDate, 'PPP', { locale: bn }) : 'ক্যালেন্ডার থেকে তারিখ নির্বাচন করুন'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">প্যাকেজ নির্বাচন করুন</label>
                    <select 
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors appearance-none"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg.name} className="bg-card-bg">
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting || !selectedDate}
                    className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'প্রসেসিং হচ্ছে...' : 'বুকিং রিকোয়েস্ট পাঠান'}
                  </button>
                </form>
              ) : (
                <div className="text-center glass-card p-12">
                  <CalendarIcon className="w-16 h-16 text-gold/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">বুকিং করতে লগইন করুন</h3>
                  <p className="text-gray-400 mb-8">
                    আপনার বুকিং রিকোয়েস্ট পাঠাতে এবং ক্যালেন্ডার এক্সেস করতে গুগল দিয়ে লগইন করুন।
                  </p>
                  <button 
                    onClick={handleLogin}
                    className="px-10 py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <LogIn className="w-5 h-5" /> গুগল দিয়ে লগইন করুন
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
