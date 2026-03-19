import React from 'react';
import { Star, Quote, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  User 
} from '../firebase';

export default function Reviews() {
  const [showForm, setShowForm] = React.useState(false);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState({ comment: '', rating: 5 });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Use Firestore for real-time updates
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribeReviews = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Failed to load reviews. Please check your connection.");
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReviews();
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

  const handleLogout = () => signOut(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.comment) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        comment: formData.comment,
        rating: formData.rating,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setFormData({ comment: '', rating: 5 });
      
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to add review:", error);
      setError("Failed to submit review. Please try again.");
    }
  };

  return (
    <section id="reviews" className="py-24 px-4 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">ক্লায়েন্ট <span className="text-gold">রিভিউ</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          আমাদের কাজের ব্যাপারে ক্লায়েন্টরা কী ভাবছেন তা জেনে নিন।
        </p>
        
        {!loading && (
          <div className="flex flex-col items-center gap-4">
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    <span className="text-sm font-medium">{user.displayName}</span>
                  </div>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="px-8 py-3 bg-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-gold/20"
                  >
                    রিভিউ লিখুন
                  </button>
                  <button onClick={handleLogout} className="p-3 text-gray-500 hover:text-red-400 transition-colors" title="লগ আউট">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" /> লগইন করে রিভিউ দিন
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto mb-16 glass-card p-8"
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 fill-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">ধন্যবাদ!</h3>
                <p className="text-gray-400">আপনার মূল্যবান রিভিউটি সফলভাবে জমা হয়েছে।</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6">আপনার অভিজ্ঞতা শেয়ার করুন</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-400">আপনার রেটিং:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          onClick={() => setFormData({ ...formData, rating: s })}
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            s <= formData.rating ? 'text-gold fill-gold' : 'text-gray-600'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <textarea 
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="আপনার মন্তব্য লিখুন..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold"
                  ></textarea>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      বাতিল করুন
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-3 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all"
                    >
                      রিভিউ জমা দিন
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
        {reviews.length > 0 ? reviews.map((review) => (
          <motion.div
            key={review.id}
            whileHover={{ y: -5 }}
            className="min-w-[300px] md:min-w-[400px] glass-card p-8 snap-center"
          >
            <Quote className="w-10 h-10 text-gold/20 mb-4" />
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'text-gold fill-gold' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-300 italic mb-6 leading-relaxed">
              "{review.comment}"
            </p>
            <div className="flex items-center gap-4">
              {review.photoURL ? (
                <img src={review.photoURL} alt="" className="w-12 h-12 rounded-full border border-gold/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center font-bold text-gold">
                  {review.name[0]}
                </div>
              )}
              <div>
                <h4 className="font-bold">{review.name}</h4>
                <span className="text-xs text-gray-500">হ্যাপি ক্লায়েন্ট</span>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="w-full text-center py-12 text-gray-500 italic">
            এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনি দিন!
          </div>
        )}
      </div>
    </section>
  );
}
