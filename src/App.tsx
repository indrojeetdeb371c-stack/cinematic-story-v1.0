import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Booking from './components/Booking';
import Pricing from './components/Pricing';
import Reviews from './components/Reviews';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import Contact from './components/Contact';
import Services from './components/Services';
import MyBookings from './components/MyBookings';
import ServiceDetail from './components/ServiceDetail';
import Offers from './components/Offers';
import { Camera, Facebook, Instagram, Youtube, Mail, Phone } from 'lucide-react';

function HomePage() {
  return (
    <main>
      <Hero />
      <div id="about">
        <About isHomePage />
      </div>
      <div id="services">
        <Services isHomePage />
      </div>
      <div id="gallery">
        <Gallery />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <div id="booking">
        <Booking />
      </div>
      <Reviews />
    </main>
  );
}

import { auth, onAuthStateChanged, User } from './firebase';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [settings, setSettings] = React.useState<any>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        // Add a slight delay for smoother transition
        setTimeout(() => setIsLoading(false), 1500);
      }
    };
    fetchSettings();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-dark-bg text-white selection:bg-gold selection:text-black flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<div className="pt-20"><Gallery /></div>} />
            <Route path="/booking" element={<div className="pt-20"><Booking /></div>} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
        
        {/* Footer */}
        <footer className="py-20 px-4 border-t border-white/5 bg-card-bg/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Camera className="w-8 h-8 text-gold" />
                  <span className="text-2xl font-bold tracking-tighter">
                    {settings?.siteName || 'সিনেমেটিক স্টোরি'}
                  </span>
                </div>
                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                  {settings?.footerDescription || 'আমরা শুধু ছবি তুলি না, আমরা আপনার জীবনের শ্রেষ্ঠ মুহূর্তগুলোকে একটি সিনেমাটিক গল্পের মতো করে ফুটিয়ে তুলি। ইন্দ্রজিৎ দেবের লেন্সের জাদুতে আপনার স্মৃতি হোক অমর।'}
                </p>
                <div className="flex gap-4">
                  <a href={settings?.facebook || "#"} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={settings?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href={settings?.youtube || "#"} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all">
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-6">কুইক লিঙ্ক</h4>
                <ul className="space-y-4">
                  <li><Link to="/" className="text-gray-400 hover:text-gold transition-colors">হোম</Link></li>
                  <li><Link to="/gallery" className="text-gray-400 hover:text-gold transition-colors">গ্যালারি</Link></li>
                  <li><Link to="/services" className="text-gray-400 hover:text-gold transition-colors">সেবাসমূহ</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-gold transition-colors">সম্পর্কে</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-gold transition-colors">যোগাযোগ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-6">যোগাযোগ</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-400">
                    <Phone className="w-4 h-4 text-gold" /> {settings?.phone || '+৮৮০ ১৭০০-০০০০০০'}
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-4 h-4 text-gold" /> {settings?.email || 'info@cinematicstory.com'}
                  </li>
                  <li className="text-gray-400">
                    {settings?.address || 'হাউজ #১২, রোড #০৫, ধানমন্ডি, ঢাকা'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-500 text-sm">
                  {settings?.footerCopyright || '© ২০২৬ সিনেমেটিক স্টোরি। ওনার: ইন্দ্রজিৎ দেব'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  All rights reserved By <a href="https://www.facebook.com/share/1CEzXthSi7/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Shuvo Deb</a>
                </p>
              </div>
              <div className="flex gap-6">
                <Link to="/admin" className="text-gray-500 hover:text-gold text-sm transition-colors">এডমিন লগইন</Link>
                <a href="#" className="text-gray-500 hover:text-gold text-sm transition-colors">প্রাইভেসি পলিসি</a>
                <a href="#" className="text-gray-500 hover:text-gold text-sm transition-colors">টার্মস ও কন্ডিশন</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
