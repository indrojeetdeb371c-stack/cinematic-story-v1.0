import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Package as PackageIcon, 
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Save,
  Upload,
  Globe,
  Phone,
  Mail,
  Facebook,
  Instagram,
  MapPin,
  Star,
  MessageSquare,
  Edit,
  Loader2,
  Eye,
  EyeOff,
  Info,
  Tag,
  Lock,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  Video,
  Heart,
  Wind,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  db, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc 
} from '../firebase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'summary' | 'bookings' | 'packages' | 'gallery' | 'offers' | 'settings' | 'reviews' | 'about' | 'security' | 'home' | 'services'>('summary');
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [packages, setPackages] = React.useState<any[]>([]);
  const [gallery, setGallery] = React.useState<any[]>([]);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>({
    siteName: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    youtube: '',
    address: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    statsExperience: '',
    statsEvents: '',
    statsPhotos: '',
    statsSatisfaction: '',
    footerDescription: '',
    footerCopyright: '',
    showOffers: false
  });
  const [loading, setLoading] = React.useState(true);
  const [isAdminSessionActive, setIsAdminSessionActive] = React.useState(
    sessionStorage.getItem('admin_session_active') === 'true'
  );
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // New Item States
  const [newPackage, setNewPackage] = React.useState({ name: '', price: '', tier: 'Basic', description: '', features: '' });
  const [newOffer, setNewOffer] = React.useState({ title: '', description: '', discount: '', expiryDate: '' });
  const [newService, setNewService] = React.useState({ title: '', description: '', icon: 'Camera', fullDescription: '', features: '' });
  const [newImage, setNewImage] = React.useState({ url: '', category: 'Wedding', title: '' });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [heroFile, setHeroFile] = React.useState<File | null>(null);
  const [aboutFile, setAboutFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUploadingHero, setIsUploadingHero] = React.useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<any>(null);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [bookingToDelete, setBookingToDelete] = React.useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = React.useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = React.useState<string | null>(null);
  const [offerToDelete, setOfferToDelete] = React.useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = React.useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = React.useState<string | null>(null);
  const [isDeletingBooking, setIsDeletingBooking] = React.useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = React.useState(false);
  const [isDeletingPackage, setIsDeletingPackage] = React.useState<string | null>(null);
  const [isDeletingOffer, setIsDeletingOffer] = React.useState<string | null>(null);
  const [isDeletingService, setIsDeletingService] = React.useState<string | null>(null);
  const [isDeletingReview, setIsDeletingReview] = React.useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState<string | null>(null);
  const [isAddingPackage, setIsAddingPackage] = React.useState(false);
  const [isAddingOffer, setIsAddingOffer] = React.useState(false);
  const [isAddingService, setIsAddingService] = React.useState(false);
  const [isUpdatingOfferStatus, setIsUpdatingOfferStatus] = React.useState<string | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = React.useState(false);
  const [settingsMessage, setSettingsMessage] = React.useState({ type: '', text: '' });
  const [isUpdatingReview, setIsUpdatingReview] = React.useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = React.useState<string | null>(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState({ type: '', text: '' });

  React.useEffect(() => {
    if (isAdminSessionActive) {
      fetchData();
      
      // Real-time reviews from Firestore
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const unsubscribeReviews = onSnapshot(q, (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
      }, (err) => {
        console.error("Firestore reviews error:", err);
      });

      return () => unsubscribeReviews();
    } else {
      setLoading(false);
    }
  }, [isAdminSessionActive]);

  const updateBookingStatus = async (id: string, status: string) => {
    setIsUpdatingStatus(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteBooking = (id: string) => {
    setBookingToDelete(id);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setIsDeletingBooking(bookingToDelete);
    try {
      const response = await fetch(`/api/bookings/${bookingToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        setBookingToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
    } finally {
      setIsDeletingBooking(null);
    }
  };

  const toggleBookingVisibility = async (id: string, currentHidden: boolean) => {
    setIsTogglingVisibility(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !currentHidden }),
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    } finally {
      setIsTogglingVisibility(null);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPackage(true);
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPackage,
          features: newPackage.features.split(',').map(f => f.trim())
        }),
      });
      if (response.ok) {
        setNewPackage({ name: '', price: '', tier: 'Basic', description: '', features: '' });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add package:", error);
    } finally {
      setIsAddingPackage(false);
    }
  };

  const handleDeletePackage = (id: string) => {
    setPackageToDelete(id);
  };

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;
    setIsDeletingPackage(packageToDelete);
    try {
      const response = await fetch(`/api/packages/${packageToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        setPackageToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
    } finally {
      setIsDeletingPackage(null);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('category', newImage.category);
        formData.append('title', newImage.title);

        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          setNewImage({ url: '', category: 'Wedding', title: '' });
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          fetchData();
        }
      } else if (newImage.url) {
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newImage),
        });
        if (response.ok) {
          setNewImage({ url: '', category: 'Wedding', title: '' });
          fetchData();
        }
      }
    } catch (error) {
      console.error("Failed to add image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setImageToDelete(id);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeletingImage(true);
    try {
      const response = await fetch(`/api/gallery/${imageToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        setImageToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    setSettingsMessage({ type: '', text: '' });
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSettingsMessage({ type: 'success', text: 'সেটিংস সফলভাবে আপডেট করা হয়েছে!' });
        fetchData();
        setTimeout(() => setSettingsMessage({ type: '', text: '' }), 3000);
      } else {
        setSettingsMessage({ type: 'error', text: 'সেটিংস আপডেট করতে সমস্যা হয়েছে।' });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      setSettingsMessage({ type: 'error', text: 'সার্ভার ত্রুটি! আবার চেষ্টা করুন।' });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleHeroUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroFile) return;
    
    setIsUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append('image', heroFile);
      
      const response = await fetch('/api/settings/hero-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setHeroFile(null);
        // Reset file input
        const fileInput = document.getElementById('hero-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchData();
        alert('হিরো ইমেজ আপডেট করা হয়েছে!');
      }
    } catch (error) {
      console.error("Failed to upload hero image:", error);
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleAboutUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutFile) return;
    
    setIsUploadingAbout(true);
    try {
      const formData = new FormData();
      formData.append('image', aboutFile);
      
      const response = await fetch('/api/settings/about-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setAboutFile(null);
        // Reset file input
        const fileInput = document.getElementById('about-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchData();
        alert('প্রোফাইল ইমেজ আপডেট করা হয়েছে!');
      }
    } catch (error) {
      console.error("Failed to upload about image:", error);
    } finally {
      setIsUploadingAbout(false);
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setIsUpdatingReview(true);
    try {
      const reviewRef = doc(db, 'reviews', editingReview.id);
      await updateDoc(reviewRef, {
        name: editingReview.name,
        rating: editingReview.rating,
        comment: editingReview.comment
      });
      setEditingReview(null);
    } catch (error) {
      console.error("Failed to update review:", error);
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleDeleteReview = (id: string) => {
    setReviewToDelete(id);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeletingReview(reviewToDelete);
    try {
      const reviewRef = doc(db, 'reviews', reviewToDelete);
      await deleteDoc(reviewRef);
      setReviewToDelete(null);
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setIsDeletingReview(null);
    }
  };

  const fetchData = async () => {
    try {
      const [bookingsRes, packagesRes, galleryRes, settingsRes, offersRes, servicesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/packages'),
        fetch('/api/gallery'),
        fetch('/api/settings'),
        fetch('/api/offers'),
        fetch('/api/services')
      ]);
      
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (packagesRes.ok) setPackages(await packagesRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingService(true);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newService,
          features: newService.features.split(',').map(f => f.trim()).filter(f => f !== '')
        }),
      });
      if (response.ok) {
        setNewService({ title: '', description: '', icon: 'Camera', fullDescription: '', features: '' });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add service:", error);
    } finally {
      setIsAddingService(false);
    }
  };

  const handleDeleteService = (id: string) => {
    setServiceToDelete(id);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeletingService(serviceToDelete);
    try {
      const response = await fetch(`/api/services/${serviceToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        setServiceToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
    } finally {
      setIsDeletingService(null);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingOffer(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });
      if (response.ok) {
        setNewOffer({ title: '', description: '', discount: '', expiryDate: '' });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add offer:", error);
    } finally {
      setIsAddingOffer(false);
    }
  };

  const handleDeleteOffer = (id: string) => {
    setOfferToDelete(id);
  };

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return;
    setIsDeletingOffer(offerToDelete);
    try {
      const response = await fetch(`/api/offers/${offerToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        setOfferToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete offer:", error);
    } finally {
      setIsDeletingOffer(null);
    }
  };

  const handleToggleOfferStatus = async (id: string, currentStatus: boolean) => {
    setIsUpdatingOfferStatus(id);
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Failed to toggle offer status:", error);
    } finally {
      setIsUpdatingOfferStatus(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মিলছে না!' });
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sessionStorage.getItem('admin_email'),
          oldPassword: currentPassword,
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'সার্ভার ত্রুটি! আবার চেষ্টা করুন।' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateSettingsDirectly = async (newSettings: any) => {
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (response.ok) {
        setSettings(newSettings);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem('admin_session_active');
    setIsAdminSessionActive(false);
    navigate('/');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('admin_session_active', 'true');
        sessionStorage.setItem('admin_email', adminEmail);
        setIsAdminSessionActive(true);
      } else {
        setLoginError('ভুল ইমেইল বা পাসওয়ার্ড।');
      }
    } catch (error) {
      setLoginError('লগইন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isAdminSessionActive && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-md w-full relative z-10"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-3xl font-bold mb-2">এডমিন লগইন</h2>
            <p className="text-gray-400">সিনেমেটিক স্টোরি এডমিন প্যানেলে প্রবেশ করতে লগইন করুন।</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ইমেইল এড্রেস</label>
              <input 
                type="email" 
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">পাসওয়ার্ড</label>
              <input 
                type="password" 
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {loginError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                'লগইন করুন'
              )}
            </button>
            <a href="/" className="block text-center text-sm text-gray-500 hover:text-gold transition-colors mt-4">হোমে ফিরে যান</a>
          </form>
          <p className="text-[10px] text-gray-600 mt-8">শুধুমাত্র অনুমোদিত এডমিনরাই প্রবেশ করতে পারবেন। রেজিষ্ট্রেশন সুবিধা বন্ধ রয়েছে।</p>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'মোট বুকিং', value: bookings.length.toString(), icon: Calendar, color: 'text-blue-400' },
    { label: 'পেন্ডিং বুকিং', value: bookings.filter(b => b.status === 'pending').length.toString(), icon: Clock, color: 'text-yellow-400' },
    { label: 'প্যাকেজ', value: packages.length.toString(), icon: PackageIcon, color: 'text-emerald-400' },
    { label: 'গ্যালারি ছবি', value: gallery.length.toString(), icon: ImageIcon, color: 'text-gold' },
    { label: 'রিভিউ', value: reviews.length.toString(), icon: MessageSquare, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 border-r border-white/5 hidden lg:block pt-24 p-6">
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'summary' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> ড্যাশবোর্ড সামারি
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Calendar className="w-5 h-5" /> বুকিং ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'packages' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <PackageIcon className="w-5 h-5" /> প্যাকেজ কন্ট্রোল
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'gallery' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <ImageIcon className="w-5 h-5" /> গ্যালারি ম্যানেজ
          </button>
          <button 
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'offers' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Tag className="w-5 h-5" /> অফার ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'services' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <CheckCircle2 className="w-5 h-5" /> সার্ভিসসমূহ
          </button>
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'home' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Globe className="w-5 h-5" /> হোম পেজ
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'about' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <User className="w-5 h-5" /> আমার সম্পর্কে
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <MessageSquare className="w-5 h-5" /> ক্লায়েন্ট রিভিউ
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <SettingsIcon className="w-5 h-5" /> সাইট সেটিংস
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'security' ? 'bg-gold text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Lock className="w-5 h-5" /> পাসওয়ার্ড পরিবর্তন
          </button>

          <div className="pt-8 mt-8 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" /> লগআউট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 pt-24 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="text-gold" /> এডমিন প্যানেল
              </h1>
              <p className="text-gray-400">ওয়েবসাইটের সম্পূর্ণ নিয়ন্ত্রণ এখান থেকে করুন।</p>
            </div>
            <button 
              onClick={handleLogout}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-all w-fit"
            >
              <XCircle className="w-4 h-4" /> লগআউট
            </button>
          </div>
          
          {/* Mobile Tab Selector */}
          <div className="lg:hidden flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
            {[
              { id: 'summary', icon: LayoutDashboard, label: 'সামারি' },
              { id: 'bookings', icon: Calendar, label: 'বুকিং' },
              { id: 'packages', icon: PackageIcon, label: 'প্যাকেজ' },
              { id: 'gallery', icon: ImageIcon, label: 'গ্যালারি' },
              { id: 'offers', icon: Tag, label: 'অফার' },
              { id: 'services', icon: CheckCircle2, label: 'সার্ভিস' },
              { id: 'home', icon: Globe, label: 'হোম পেজ' },
              { id: 'about', icon: User, label: 'আমার সম্পর্কে' },
              { id: 'reviews', icon: MessageSquare, label: 'রিভিউ' },
              { id: 'settings', icon: SettingsIcon, label: 'সেটিংস' },
              { id: 'security', icon: Lock, label: 'নিরাপত্তা' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'bg-gold text-black' : 'bg-white/5 text-gray-400'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'summary' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings Summary */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-gold" /> সাম্প্রতিক বুকিং</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs text-gold hover:underline">সব দেখুন</button>
                  </div>
                  <div className="p-4 space-y-4">
                    {bookings.slice(0, 5).map((b) => (
                      <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="font-bold text-sm">{b.name}</p>
                          <p className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                          b.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {b.status === 'approved' ? 'এপ্রুভড' : b.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                        </span>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">কোনো বুকিং নেই</p>}
                  </div>
                </div>

                {/* Recent Reviews Summary */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gold" /> সাম্প্রতিক রিভিউ</h3>
                    <button onClick={() => setActiveTab('reviews')} className="text-xs text-gold hover:underline">সব দেখুন</button>
                  </div>
                  <div className="p-4 space-y-4">
                    {reviews.slice(0, 5).map((r) => (
                      <div key={r._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <img src={r.photoURL} alt="" className="w-8 h-8 rounded-full border border-gold/20" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm">{r.name}</p>
                            <div className="flex items-center gap-1 text-gold">
                              <Star className="w-3 h-3 fill-gold" />
                              <span className="text-xs font-bold">{r.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">কোনো রিভিউ নেই</p>}
                  </div>
                </div>
              </div>

              {/* Quick Actions / System Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                  <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">গ্যালারি স্ট্যাটাস</h4>
                  <p className="text-2xl font-bold">{gallery.length} টি ছবি</p>
                  <button onClick={() => setActiveTab('gallery')} className="mt-4 text-xs text-blue-400 hover:underline flex items-center gap-1">ম্যানেজ করুন <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                  <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">সক্রিয় প্যাকেজ</h4>
                  <p className="text-2xl font-bold">{packages.length} টি প্যাকেজ</p>
                  <button onClick={() => setActiveTab('packages')} className="mt-4 text-xs text-emerald-400 hover:underline flex items-center gap-1">ম্যানেজ করুন <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="glass-card p-6 border-l-4 border-gold">
                  <h4 className="text-gray-400 text-xs font-bold uppercase mb-2">সাইট সেটিংস</h4>
                  <p className="text-sm text-gray-300">কন্টাক্ট ইনফো: {settings.phone ? 'সেট করা আছে' : 'অসম্পূর্ণ'}</p>
                  <button onClick={() => setActiveTab('settings')} className="mt-4 text-xs text-gold hover:underline flex items-center gap-1">আপডেট করুন <ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-bold">বুকিং রিকোয়েস্ট লিস্ট</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">নাম ও ফোন</th>
                      <th className="px-6 py-4">তারিখ</th>
                      <th className="px-6 py-4">প্যাকেজ</th>
                      <th className="px-6 py-4">স্ট্যাটাস</th>
                      <th className="px-6 py-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{new Date(item.date).toLocaleDateString('bn-BD')}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold">
                            {item.package}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold uppercase ${
                            item.status === 'approved' ? 'text-emerald-500' : 
                            item.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {item.status === 'approved' ? 'এপ্রুভড' : 
                             item.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedBooking(item)}
                              className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg"
                              title="ডিটেইলস"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => toggleBookingVisibility(item._id, item.hidden)}
                              disabled={isTogglingVisibility === item._id}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${item.hidden ? 'hover:bg-emerald-500/20 text-emerald-500' : 'hover:bg-gray-500/20 text-gray-400'}`}
                              title={item.hidden ? 'শো করুন' : 'হাইড করুন'}
                            >
                              {isTogglingVisibility === item._id ? <Loader2 className="w-5 h-5 animate-spin" /> : (item.hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />)}
                            </button>
                            <button 
                              onClick={() => handleDeleteBooking(item._id)}
                              disabled={isDeletingBooking === item._id}
                              className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg disabled:opacity-50"
                              title="ডিলিট"
                            >
                              {isDeletingBooking === item._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                            {item.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => updateBookingStatus(item._id, 'approved')} 
                                  disabled={isUpdatingStatus === item._id}
                                  className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg disabled:opacity-50" 
                                  title="এপ্রুভ"
                                >
                                  {isUpdatingStatus === item._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                </button>
                                <button 
                                  onClick={() => updateBookingStatus(item._id, 'rejected')} 
                                  disabled={isUpdatingStatus === item._id}
                                  className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg disabled:opacity-50" 
                                  title="রিজেক্ট"
                                >
                                  {isUpdatingStatus === item._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2"><Plus className="text-gold" /> নতুন প্যাকেজ যোগ করুন</h3>
                <form onSubmit={handleAddPackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="প্যাকেজের নাম" 
                    className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                    value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="মূল্য (যেমন: ৫০০০৳)" 
                    className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                    value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} required
                  />
                  <select 
                    className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                    value={newPackage.tier} onChange={e => setNewPackage({...newPackage, tier: e.target.value})} required
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Gold">Gold</option>
                  </select>
                  <textarea 
                    placeholder="সংক্ষিপ্ত বর্ণনা" className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                    value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} required
                  />
                  <input 
                    type="text" placeholder="ফিচারসমূহ (কমা দিয়ে আলাদা করুন)" 
                    className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                    value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} required
                  />
                  <button 
                    type="submit" 
                    disabled={isAddingPackage}
                    className="md:col-span-2 bg-gold text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingPackage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> সেভ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> প্যাকেজ সেভ করুন
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg._id} className="glass-card p-6 relative group">
                    <button 
                      onClick={() => handleDeletePackage(pkg._id)}
                      disabled={isDeletingPackage === pkg._id}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg transition-all disabled:opacity-50 z-10"
                      title="ডিলিট করুন"
                    >
                      {isDeletingPackage === pkg._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pkg.tier === 'Gold' ? 'bg-gold/20 text-gold' :
                        pkg.tier === 'Premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {pkg.tier}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gold mb-2 mt-6">{pkg.name}</h4>
                    <p className="text-2xl font-bold mb-4">{pkg.price}</p>
                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                    <ul className="space-y-2">
                      {pkg.features.map((f: string, i: number) => (
                        <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-gold" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2"><Plus className="text-gold" /> গ্যালারিতে ছবি যোগ করুন</h3>
                <form onSubmit={handleAddImage} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ছবি আপলোড করুন</label>
                      <input 
                        id="gallery-file-input"
                        type="file" 
                        accept="image/*"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">অথবা ছবির URL (Direct Link)</label>
                      <input 
                        type="url" placeholder="https://example.com/image.jpg" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newImage.url} onChange={e => setNewImage({...newImage, url: e.target.value})}
                        disabled={!!selectedFile}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ক্যাটাগরি</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold text-gray-400"
                        value={newImage.category} onChange={e => setNewImage({...newImage, category: e.target.value})}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Event">Event</option>
                        <option value="Nature">Nature</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ছবির শিরোনাম (ঐচ্ছিক)</label>
                      <input 
                        type="text" placeholder="যেমন: বিয়ের মুহূর্ত" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newImage.title} onChange={e => setNewImage({...newImage, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUploading || (!selectedFile && !newImage.url)}
                    className="w-full bg-gold text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isUploading ? 'আপলোড হচ্ছে...' : 'ছবি যোগ করুন'}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((img) => (
                  <div key={img._id} className="relative group rounded-xl overflow-hidden aspect-square border border-white/5">
                    <img src={`${img.url}${img.url.includes('?') ? '&' : '?'}v=${Date.now()}`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    
                    {/* Delete Icon Always Visible */}
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        onClick={() => handleDeleteImage(img._id)} 
                        disabled={isDeletingImage}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-all shadow-lg border border-white/10 flex items-center justify-center disabled:opacity-50"
                        title="ডিলিট করুন"
                      >
                        {isDeletingImage && imageToDelete === img._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"></div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-[10px] rounded text-gold z-10">{img.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gold/10">
                      <Tag className="text-gold w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">অফার ম্যানেজমেন্ট</h3>
                      <p className="text-sm text-gray-400">নতুন অফার যোগ করুন এবং নিয়ন্ত্রণ করুন।</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-6">
                    <div>
                      <p className="font-bold text-sm">অফার পেজ দেখান</p>
                      <p className="text-[10px] text-gray-500">মেইন ওয়েবসাইটে অফার লিঙ্ক শো/হাইড করুন</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleUpdateSettingsDirectly({ ...settings, showOffers: !settings.showOffers })}
                      disabled={isUpdatingSettings}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.showOffers ? 'bg-gold' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.showOffers ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold mb-6 flex items-center gap-2 text-gold"><Plus className="w-5 h-5" /> নতুন অফার যোগ করুন</h3>
                <form onSubmit={handleAddOffer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">অফার টাইটেল</label>
                      <input 
                        type="text" placeholder="যেমন: ঈদ স্পেশাল অফার" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ডিসকাউন্ট (যেমন: ২০%)</label>
                      <input 
                        type="text" placeholder="যেমন: ২০%" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newOffer.discount} onChange={e => setNewOffer({...newOffer, discount: e.target.value})} required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">অফার শেষ হওয়ার তারিখ</label>
                      <input 
                        type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newOffer.expiryDate} onChange={e => setNewOffer({...newOffer, expiryDate: e.target.value})} required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">অফার বর্ণনা</label>
                      <input 
                        type="text" placeholder="অফার সম্পর্কে বিস্তারিত" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isAddingOffer}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isAddingOffer ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> যোগ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> অফার যোগ করুন
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <div key={offer._id} className={`glass-card p-6 relative overflow-hidden group ${!offer.isActive ? 'opacity-60' : ''}`}>
                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                      <button 
                        onClick={() => handleToggleOfferStatus(offer._id, offer.isActive)}
                        disabled={isUpdatingOfferStatus === offer._id}
                        className={`p-2 rounded-lg transition-all ${offer.isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-500'}`}
                        title={offer.isActive ? 'হাইড করুন' : 'শো করুন'}
                      >
                        {isUpdatingOfferStatus === offer._id ? <Loader2 className="w-4 h-4 animate-spin" /> : (offer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)}
                      </button>
                      <button 
                        onClick={() => handleDeleteOffer(offer._id)} 
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                        <Tag className="text-gold w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{offer.title}</h4>
                        <p className="text-gold font-bold text-2xl mb-2">{offer.discount} ছাড়!</p>
                        <p className="text-sm text-gray-400 mb-4">{offer.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          মেয়াদ: {new Date(offer.expiryDate).toLocaleDateString('bn-BD')} পর্যন্ত
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                  <div className="p-3 rounded-xl bg-gold/10">
                    <CheckCircle2 className="text-gold w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">সার্ভিস ম্যানেজমেন্ট</h3>
                    <p className="text-sm text-gray-400">আপনার ফটোগ্রাফি সার্ভিসগুলো যোগ করুন এবং নিয়ন্ত্রণ করুন।</p>
                  </div>
                </div>

                <h3 className="font-bold mb-6 flex items-center gap-2 text-gold"><Plus className="w-5 h-5" /> নতুন সার্ভিস যোগ করুন</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">সার্ভিস টাইটেল</label>
                      <input 
                        type="text" placeholder="যেমন: ওয়েডিং ফটোগ্রাফি" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">আইকন (Lucide Icon Name)</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold text-gray-400"
                        value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})}
                      >
                        <option value="Camera">Camera</option>
                        <option value="Video">Video</option>
                        <option value="Calendar">Calendar</option>
                        <option value="Heart">Heart</option>
                        <option value="Image">Image</option>
                        <option value="Wind">Wind</option>
                        <option value="Users">Users</option>
                        <option value="Star">Star</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">সার্ভিস বর্ণনা (সংক্ষিপ্ত)</label>
                    <textarea 
                      placeholder="সার্ভিস সম্পর্কে সংক্ষিপ্ত বর্ণনা লিখুন..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                      value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} required
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">বিস্তারিত বর্ণনা</label>
                    <textarea 
                      placeholder="সার্ভিস সম্পর্কে বিস্তারিত বর্ণনা লিখুন..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                      value={newService.fullDescription} onChange={e => setNewService({...newService, fullDescription: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">ফিচারসমূহ (কমা দিয়ে আলাদা করুন)</label>
                    <input 
                      type="text" placeholder="যেমন: হাই-রেজ ছবি, ড্রোন শট, আনলিমিটেড এডিট" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                      value={newService.features} onChange={e => setNewService({...newService, features: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isAddingService}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isAddingService ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> যোগ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> সার্ভিস যোগ করুন
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service._id} className="glass-card p-6 relative group">
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => handleDeleteService(service._id)} 
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4">
                      {service.icon === 'Camera' && <ImageIcon className="text-gold w-6 h-6" />}
                      {service.icon === 'Video' && <Video className="text-gold w-6 h-6" />}
                      {service.icon === 'Calendar' && <Calendar className="text-gold w-6 h-6" />}
                      {service.icon === 'Heart' && <Heart className="text-gold w-6 h-6" />}
                      {service.icon === 'Image' && <ImageIcon className="text-gold w-6 h-6" />}
                      {service.icon === 'Wind' && <Wind className="text-gold w-6 h-6" />}
                      {service.icon === 'Users' && <User className="text-gold w-6 h-6" />}
                      {service.icon === 'Star' && <Star className="text-gold w-6 h-6" />}
                    </div>
                    <h4 className="font-bold text-lg mb-2">{service.title}</h4>
                    <p className="text-sm text-gray-400">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2 text-gold"><Globe className="w-5 h-5" /> হিরো সেকশন সেটিংস</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">হিরো শিরোনাম (Hero Title)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">হিরো উপ-শিরোনাম (Hero Subtitle)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">হিরো বর্ণনা (Hero Description)</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.heroDescription} onChange={e => setSettings({...settings, heroDescription: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingSettings}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isUpdatingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    তথ্য আপডেট করুন
                  </button>
                </form>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <h3 className="font-bold mb-8 flex items-center gap-2"><ImageIcon className="text-gold" /> হিরো ব্যাকগ্রাউন্ড ইমেজ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        {settings.heroImage ? (
                          <img 
                            src={`${settings.heroImage}${settings.heroImage.includes('?') ? '&' : '?'}v=${Date.now()}`} 
                            alt="Current Hero" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">কোনো ছবি নেই</div>
                        )}
                      </div>
                    </div>
                    <form onSubmit={handleHeroUpload} className="space-y-6">
                      <input 
                        type="file" accept="image/*"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/80"
                        onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                      />
                      <button 
                        type="submit" 
                        disabled={isUploadingHero || !heroFile}
                        className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        {isUploadingHero ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        হিরো ইমেজ আপডেট করুন
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2 text-gold"><TrendingUp className="w-5 h-5" /> স্ট্যাটিস্টিকস সেটিংস</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">অভিজ্ঞতা (Experience)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.statsExperience} onChange={e => setSettings({...settings, statsExperience: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ইভেন্ট সংখ্যা (Events)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.statsEvents} onChange={e => setSettings({...settings, statsEvents: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ছবি সংখ্যা (Photos)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.statsPhotos} onChange={e => setSettings({...settings, statsPhotos: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">সন্তুষ্টির হার (Satisfaction)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.statsSatisfaction} onChange={e => setSettings({...settings, statsSatisfaction: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingSettings}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isUpdatingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    স্ট্যাটস আপডেট করুন
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2"><SettingsIcon className="text-gold" /> কন্টাক্ট ও সাইট সেটিংস</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  {settingsMessage.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${settingsMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {settingsMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm font-medium">{settingsMessage.text}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Globe className="w-4 h-4" /> ওয়েবসাইটের নাম</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Phone className="w-4 h-4" /> ফোন নম্বর</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Mail className="w-4 h-4" /> ইমেইল অ্যাড্রেস</label>
                      <input 
                        type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Facebook className="w-4 h-4" /> ফেসবুক লিংক</label>
                      <input 
                        type="url" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Instagram className="w-4 h-4" /> ইনস্টাগ্রাম লিংক</label>
                      <input 
                        type="url" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.instagram} onChange={e => setSettings({...settings, instagram: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Globe className="w-4 h-4" /> ইউটিউব লিংক</label>
                      <input 
                        type="url" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.youtube} onChange={e => setSettings({...settings, youtube: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> ঠিকানা</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                    <h4 className="font-bold text-gold flex items-center gap-2"><Info className="w-4 h-4" /> ফুটার সেটিংস</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">ফুটার বর্ণনা (Footer Description)</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.footerDescription} onChange={e => setSettings({...settings, footerDescription: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">কপিরাইট টেক্সট (Footer Copyright)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.footerCopyright} onChange={e => setSettings({...settings, footerCopyright: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdatingSettings}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isUpdatingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    সেটিংস আপডেট করুন
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2"><User className="text-gold" /> আমার সম্পর্কে (About Me) সেটিংস</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">শিরোনাম (Title)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.aboutTitle} onChange={e => setSettings({...settings, aboutTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">উপ-শিরোনাম (Subtitle)</label>
                      <input 
                        type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.aboutSubtitle} onChange={e => setSettings({...settings, aboutSubtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">বর্ণনা (Description)</label>
                      <textarea 
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={settings.aboutDescription} onChange={e => setSettings({...settings, aboutDescription: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingSettings}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isUpdatingSettings ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> আপডেট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> তথ্য আপডেট করুন
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <h3 className="font-bold mb-8 flex items-center gap-2"><ImageIcon className="text-gold" /> প্রোফাইল ইমেজ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gold bg-white/5">
                        {settings.aboutImage ? (
                          <img 
                            src={`${settings.aboutImage}${settings.aboutImage.includes('?') ? '&' : '?'}v=${Date.now()}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            কোনো ছবি নেই
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">বর্তমান প্রোফাইল ইমেজ (সার্কেল শেপ)</p>
                    </div>
                    
                    <form onSubmit={handleAboutUpload} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">নতুন প্রোফাইল ইমেজ আপলোড করুন</label>
                        <input 
                          id="about-file-input"
                          type="file" 
                          accept="image/*"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/80"
                          onChange={(e) => setAboutFile(e.target.files?.[0] || null)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isUploadingAbout || !aboutFile}
                        className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingAbout ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            আপলোড হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" /> প্রোফাইল ইমেজ আপডেট করুন
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="font-bold mb-8 flex items-center gap-2 text-gold"><Lock className="w-5 h-5" /> পাসওয়ার্ড পরিবর্তন করুন</h3>
                <p className="text-gray-400 mb-8">আপনার এডমিন প্যানেলের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।</p>
                
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {passwordMessage.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {passwordMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm font-medium">{passwordMessage.text}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">বর্তমান পাসওয়ার্ড</label>
                      <input 
                        type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">নতুন পাসওয়ার্ড</label>
                        <input 
                          type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                          value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                        <input 
                          type="password" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> পরিবর্তন হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" /> পাসওয়ার্ড আপডেট করুন
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {editingReview && (
                <div className="glass-card p-6 border-gold/50">
                  <h3 className="font-bold mb-6 flex items-center gap-2 text-gold"><Edit className="w-5 h-5" /> রিভিউ এডিট করুন</h3>
                  <form onSubmit={handleUpdateReview} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">নাম</label>
                        <input 
                          type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                          value={editingReview.name} onChange={e => setEditingReview({...editingReview, name: e.target.value})} required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">রেটিং (১-৫)</label>
                        <input 
                          type="number" min="1" max="5" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                          value={editingReview.rating} onChange={e => setEditingReview({...editingReview, rating: parseInt(e.target.value)})} required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">কমেন্ট</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-gold"
                        rows={4} value={editingReview.comment} onChange={e => setEditingReview({...editingReview, comment: e.target.value})} required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        disabled={isUpdatingReview}
                        className="flex-1 bg-gold text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUpdatingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isUpdatingReview ? 'আপডেট হচ্ছে...' : 'আপডেট সেভ করুন'}
                      </button>
                      <button type="button" onClick={() => setEditingReview(null)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl">
                        বাতিল করুন
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold">সব রিভিউ ({reviews.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-4">ক্লায়েন্ট</th>
                        <th className="px-6 py-4">রেটিং</th>
                        <th className="px-6 py-4">কমেন্ট</th>
                        <th className="px-6 py-4">তারিখ</th>
                        <th className="px-6 py-4">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={review.photoURL} alt="" className="w-8 h-8 rounded-full border border-gold/20" referrerPolicy="no-referrer" />
                              <div className="font-medium text-sm">{review.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-gold">
                              <Star className="w-3 h-3 fill-gold" />
                              <span className="text-sm font-bold">{review.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-400 max-w-xs truncate" title={review.comment}>{review.comment}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('bn-BD') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => setEditingReview(review)} className="p-2 hover:bg-gold/20 text-gold rounded-lg"><Edit className="w-4 h-4" /></button>
                              <button 
                                onClick={() => handleDeleteReview(review.id)} 
                                disabled={isDeletingReview === review.id}
                                className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg disabled:opacity-50"
                              >
                                {isDeletingReview === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

      {/* Booking Details Modal */}
      {selectedBooking && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">বুকিং ডিটেইলস</h3>
                  <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/5 rounded-lg"><XCircle className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">নাম</p>
                    <p className="font-bold">{selectedBooking.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">ফোন</p>
                    <p className="font-bold text-gold">{selectedBooking.phone}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">তারিখ</p>
                    <p className="font-bold">{new Date(selectedBooking.date).toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">লোকেশন</p>
                    <p className="font-bold">{selectedBooking.location}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">প্যাকেজ</p>
                    <p className="font-bold text-gold">{selectedBooking.package}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">স্ট্যাটাস</p>
                    <span className={`text-xs font-bold uppercase ${
                      selectedBooking.status === 'approved' ? 'text-emerald-500' : 
                      selectedBooking.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {selectedBooking.status === 'approved' ? 'এপ্রুভড' : 
                       selectedBooking.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="w-full mt-8 py-3 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all"
                >
                  বন্ধ করুন
                </button>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {bookingToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">বুকিং ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই বুকিংটি ডিলিট করতে চান? এটি আর ফিরে পাওয়া যাবে না।</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setBookingToDelete(null)}
                    disabled={isDeletingBooking}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeleteBooking}
                    disabled={isDeletingBooking}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingBooking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {imageToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">ছবি ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই ছবিটি গ্যালারি থেকে ডিলিট করতে চান?</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setImageToDelete(null)}
                    disabled={isDeletingImage}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeleteImage}
                    disabled={isDeletingImage}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {packageToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">প্যাকেজ ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই প্যাকেজটি ডিলিট করতে চান? এটি আর ফিরে পাওয়া যাবে না।</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setPackageToDelete(null)}
                    disabled={isDeletingPackage === packageToDelete}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeletePackage}
                    disabled={isDeletingPackage === packageToDelete}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingPackage === packageToDelete ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {offerToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">অফার ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই অফারটি ডিলিট করতে চান?</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setOfferToDelete(null)}
                    disabled={!!isDeletingOffer}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeleteOffer}
                    disabled={!!isDeletingOffer}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingOffer ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {reviewToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">রিভিউ ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই রিভিউটি ডিলিট করতে চান?</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setReviewToDelete(null)}
                    disabled={!!isDeletingReview}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeleteReview}
                    disabled={!!isDeletingReview}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingReview ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {serviceToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">সার্ভিস ডিলিট করুন</h3>
                <p className="text-gray-400 mb-8">আপনি কি নিশ্চিত যে এই সার্ভিসটি ডিলিট করতে চান? এটি আর ফিরে পাওয়া যাবে না।</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setServiceToDelete(null)}
                    disabled={!!isDeletingService}
                    className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={confirmDeleteService}
                    disabled={!!isDeletingService}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingService ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> ডিলিট হচ্ছে...
                      </>
                    ) : (
                      'ডিলিট করুন'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

