import React from 'react';
import { Camera, Menu, X, LogIn, LogOut, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '../firebase';
import { Settings } from '../types';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [settings, setSettings] = React.useState<Settings | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
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

  const isAdmin = user?.email === "indrojeetdeb371c@gmail.com";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <Camera className="w-8 h-8 text-gold" />
            <span className="text-2xl font-bold tracking-tighter text-white">
              {settings?.siteName || 'সিনেমেটিক স্টোরি'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">হোম</Link>
              <Link to="/gallery" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">গ্যালারি</Link>
              <Link to="/services" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">সেবাসমূহ</Link>
              {settings?.showOffers && (
                <Link to="/offers" className="text-gold hover:text-white px-3 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1 bg-gold/10 border border-gold/20">
                  <Tag className="w-3 h-3" /> অফার
                </Link>
              )}
              <Link to="/about" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">আমাদের সম্পর্কে</Link>
              <Link to="/contact" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">যোগাযোগ</Link>
              
              {isAdmin && (
                <Link to="/admin" className="text-gold hover:text-white px-3 py-2 rounded-md text-sm font-bold transition-colors border border-gold/20 bg-gold/5">এডমিন প্যানেল</Link>
              )}

              <div className="h-6 w-px bg-white/10 mx-2"></div>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/my-bookings" className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">আমার বুকিং</Link>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    <span className="text-xs font-medium text-gray-300">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="লগ আউট">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 text-gray-300 hover:text-gold text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" /> লগইন
                </button>
              )}

              <Link to="/booking" className="bg-gold text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-white transition-all transform hover:scale-105">বুক করুন</Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gold/20" referrerPolicy="no-referrer" />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card-bg border-b border-white/5"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">হোম</Link>
              <Link to="/gallery" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">গ্যালারি</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">সেবাসমূহ</Link>
              {settings?.showOffers && (
                <Link to="/offers" onClick={() => setIsOpen(false)} className="text-gold hover:text-white block px-3 py-4 text-base font-bold border-b border-white/5 bg-gold/5">
                  <Tag className="w-4 h-4 inline mr-2" /> অফার
                </Link>
              )}
              <Link to="/about" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">আমাদের সম্পর্কে</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">যোগাযোগ</Link>
              
              {user && (
                <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gold block px-3 py-4 text-base font-medium border-b border-white/5">আমার বুকিং</Link>
              )}

              {user?.email === "indrojeetdeb371c@gmail.com" && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="text-gold hover:text-white block px-3 py-4 text-base font-bold border-b border-white/5 bg-gold/5">এডমিন প্যানেল</Link>
              )}

              {user ? (
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left text-red-400 hover:bg-red-400/10 block px-3 py-4 text-base font-medium border-b border-white/5 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> লগ আউট ({user.displayName})
                </button>
              ) : (
                <button 
                  onClick={() => { handleLogin(); setIsOpen(false); }}
                  className="w-full text-left text-gold hover:bg-gold/10 block px-3 py-4 text-base font-medium border-b border-white/5 flex items-center gap-2"
                >
                  <LogIn className="w-5 h-5" /> লগইন / একাউন্ট খুলুন
                </button>
              )}

              <div className="pt-4 pb-2 px-3">
                <Link to="/booking" onClick={() => setIsOpen(false)} className="block text-center bg-gold text-black px-6 py-3 rounded-xl font-bold">
                  বুক করুন
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
