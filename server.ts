import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!process.env.NETLIFY && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir);
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cinematic-story',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});
const upload = multer({ storage: storage });

// Serve static uploads folder
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb: typeof mongoose | null = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    return null;
  }
  
  try {
    cachedDb = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return cachedDb;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return null;
  }
}

// Only connect automatically if not running in a serverless environment
if (!process.env.NETLIFY) {
  connectDB();
}

export { connectDB };

// Models
const BookingSchema = new mongoose.Schema({
  uid: String,
  name: String,
  phone: String,
  date: Date,
  location: String,
  package: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

const PackageSchema = new mongoose.Schema({
  name: String,
  price: String,
  tier: { type: String, enum: ['Basic', 'Premium', 'Gold'], default: 'Basic' },
  description: String,
  features: [String],
  createdAt: { type: Date, default: Date.now }
});
const Package = mongoose.model('Package', PackageSchema);

const GallerySchema = new mongoose.Schema({
  url: String,
  category: String,
  title: String,
  createdAt: { type: Date, default: Date.now }
});
const Gallery = mongoose.model('Gallery', GallerySchema);

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'সিনেমেটিক স্টোরি' },
  phone: String,
  email: String,
  facebook: String,
  instagram: String,
  youtube: String,
  address: String,
  heroImage: String,
  heroTitle: { type: String, default: 'মুহূর্তগুলো হোক অমর ও জীবন্ত' },
  heroSubtitle: { type: String, default: 'প্রফেশনাল ফটোগ্রাফি সার্ভিস' },
  heroDescription: { type: String, default: 'আপনার জীবনের বিশেষ দিনটির গল্প ক্যামেরার লেন্সে ফুটিয়ে তোলাই আমাদের লক্ষ্য। বিয়ের প্রতিটি আবেগঘন মুহূর্ত ধরে রাখতে আমরা আছি আপনার পাশে।' },
  aboutTitle: String,
  aboutSubtitle: String,
  aboutDescription: String,
  aboutImage: String,
  statsExperience: { type: String, default: '৫+ বছর' },
  statsEvents: { type: String, default: '২০০+' },
  statsPhotos: { type: String, default: '৫০,০০০+' },
  statsSatisfaction: { type: String, default: '১০০%' },
  footerDescription: { type: String, default: 'আমরা শুধু ছবি তুলি না, আমরা আপনার জীবনের শ্রেষ্ঠ মুহূর্তগুলোকে একটি সিনেমাটিক গল্পের মতো করে ফুটিয়ে তুলি। ইন্দ্রজিৎ দেবের লেন্সের জাদুতে আপনার স্মৃতি হোক অমর।' },
  footerCopyright: { type: String, default: '© ২০২৬ সিনেমেটিক স্টোরি। ওনার: ইন্দ্রজিৎ দেব' },
  showOffers: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', SettingsSchema);

const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  fullDescription: String,
  icon: String, // Icon name from lucide-react
  features: [String],
  createdAt: { type: Date, default: Date.now }
});
const Service = mongoose.model('Service', ServiceSchema);

const OfferSchema = new mongoose.Schema({
  title: String,
  description: String,
  discount: String,
  expiryDate: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Offer = mongoose.model('Offer', OfferSchema);

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model('Admin', AdminSchema);

// API Routes
const apiRouter = express.Router();

// API Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', api: true });
});

// Admin Login Route (Registered BEFORE DB middleware)
apiRouter.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  const adminEmail = "indrojeetdeb371c@gmail.com";
  const defaultPassword = "admin123";

  try {
    let admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    
    // Seed default admin if none exists
    if (!admin && email.trim().toLowerCase() === adminEmail.toLowerCase()) {
      admin = new Admin({ email: adminEmail, password: defaultPassword });
      await admin.save();
    }

    if (admin && admin.password === password.trim()) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

apiRouter.post('/admin/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (admin && admin.password === oldPassword.trim()) {
      admin.password = newPassword.trim();
      await admin.save();
      res.json({ success: true, message: 'Password changed successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid old password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Middleware to check DB connection for all OTHER API routes
apiRouter.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected', 
      details: 'Please ensure your MONGODB_URI is correct and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.' 
    });
  }
  next();
});

apiRouter.get('/bookings', async (req, res) => {
  console.log('GET /api/bookings');
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

apiRouter.get('/bookings/approved', async (req, res) => {
  console.log('GET /api/bookings/approved');
  try {
    const bookings = await Booking.find({ status: 'approved', hidden: { $ne: true } }, 'date');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching approved bookings:', err);
    res.status(500).json({ error: 'Failed to fetch approved bookings' });
  }
});

apiRouter.get('/bookings/user/:uid', async (req, res) => {
  console.log(`GET /api/bookings/user/${req.params.uid}`);
  try {
    const bookings = await Booking.find({ uid: req.params.uid }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

apiRouter.patch('/bookings/:id', async (req, res) => {
  console.log(`PATCH /api/bookings/${req.params.id}`);
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

apiRouter.delete('/bookings/:id', async (req, res) => {
  console.log(`DELETE /api/bookings/${req.params.id}`);
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

apiRouter.post('/bookings', async (req, res) => {
  console.log('POST /api/bookings');
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

apiRouter.patch('/bookings/:id', async (req, res) => {
  console.log(`PATCH /api/bookings/${req.params.id}`);
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Package Routes
apiRouter.get('/packages', async (req, res) => {
  try {
    let packages = await Package.find().sort({ createdAt: 1 });
    
    // Seed default packages if none exist
    if (packages.length === 0) {
      const defaultPackages = [
        {
          name: 'সিলভার প্যাকেজ',
          price: '৫,০০০৳',
          tier: 'Basic',
          description: 'ছোট ইভেন্ট বা পোর্ট্রেট সেশনের জন্য আদর্শ।',
          features: ['২ ঘণ্টা শ্যুট', '৫০টি এডিটেড ছবি', 'অনলাইন গ্যালারি', '১ জন ফটোগ্রাফার']
        },
        {
          name: 'গোল্ড প্যাকেজ',
          price: '১২,০০০৳',
          tier: 'Premium',
          description: 'বিয়ে বা বড় ইভেন্টের জন্য আমাদের সবচেয়ে জনপ্রিয় প্যাকেজ।',
          features: ['৫ ঘণ্টা শ্যুট', '১৫০টি এডিটেড ছবি', 'প্রিন্টেড অ্যালবাম', '২ জন ফটোগ্রাফার', 'সিনেমেটিক ভিডিও']
        },
        {
          name: 'ডায়মন্ড প্যাকেজ',
          price: '২৫,০০০৳',
          tier: 'Gold',
          description: 'প্রিমিয়াম কোয়ালিটি এবং সম্পূর্ণ কভারেজ।',
          features: ['ফুল ডে কভারেজ', '৩০০টি এডিটেড ছবি', 'লাক্সারি অ্যালবাম', '৩ জন ফটোগ্রাফার', 'ড্রোন শট', 'ফুল মুভি']
        }
      ];
      await Package.insertMany(defaultPackages);
      packages = await Package.find().sort({ createdAt: 1 });
    }
    
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

apiRouter.post('/packages', async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save package' });
  }
});

apiRouter.delete('/packages/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// Gallery Routes
apiRouter.get('/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

apiRouter.post('/gallery', async (req, res) => {
  console.log('POST /api/gallery');
  try {
    const newImage = new Gallery(req.body);
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

apiRouter.post('/gallery/upload', upload.single('image'), async (req, res) => {
  console.log('POST /api/gallery/upload');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { category, title } = req.body;
    const imageUrl = req.file.path;
    
    const newImage = new Gallery({
      url: imageUrl,
      category: category || 'General',
      title: title || ''
    });
    
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

apiRouter.delete('/gallery/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    // Deleting from Cloudinary would require public_id
    // For now, we just delete from MongoDB to keep it simple and free
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Offer Routes
apiRouter.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

apiRouter.post('/offers', async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save offer' });
  }
});

apiRouter.patch('/offers/:id', async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

apiRouter.delete('/offers/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// Services API
apiRouter.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    if (services.length === 0) {
      // Seed default services if none exist
      const defaultServices = [
        { title: 'ওয়েডিং ফটোগ্রাফি', description: 'আপনার বিয়ের প্রতিটি বিশেষ মুহূর্তকে আমরা ফ্রেমবন্দি করি পরম মমতায়।', icon: 'Camera' },
        { title: 'সিনেমেটিক ভিডিও', description: 'মুহূর্তগুলো শুধু ছবি নয়, জীবন্ত হয়ে উঠবে আমাদের সিনেমাটিক ভিডিওর মাধ্যমে।', icon: 'Video' },
        { title: 'ইভেন্ট কভারেজ', description: 'যেকোনো সামাজিক বা কর্পোরেট ইভেন্টের প্রফেশনাল কভারেজ প্রদান করি।', icon: 'Calendar' },
        { title: 'প্রি-ওয়েডিং শুট', description: 'বিয়ের আগের সেই রোমান্টিক মুহূর্তগুলো ক্যামেরার লেন্সে ফুটিয়ে তুলি।', icon: 'Heart' },
        { title: 'অ্যালবাম ডিজাইন', description: 'আপনার স্মৃতিগুলোকে একটি সুন্দর গল্পের মতো করে সাজিয়ে দিই প্রিমিয়াম অ্যালবামে।', icon: 'Image' },
        { title: 'ড্রোন কভারেজ', description: 'আকাশ থেকে আপনার ইভেন্টের এক অনন্য ও চমৎকার দৃশ্য ধারণ করি।', icon: 'Wind' }
      ];
      const seeded = await Service.insertMany(defaultServices);
      return res.json(seeded);
    }
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services' });
  }
});

apiRouter.post('/services', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service' });
  }
});

apiRouter.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service' });
  }
});

// Settings Routes
apiRouter.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        siteName: 'সিনেমেটিক স্টোরি',
        phone: '+৮৮০ ১৭০০-০০০০০০',
        email: 'info@cinematicstory.com',
        facebook: '',
        instagram: '',
        youtube: '',
        address: 'হাউজ #১২, রোড #০৫, ধানমন্ডি, ঢাকা',
        heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
        heroTitle: 'মুহূর্তগুলো হোক অমর ও জীবন্ত',
        heroSubtitle: 'প্রফেশনাল ফটোগ্রাফি সার্ভিস',
        heroDescription: 'আপনার জীবনের বিশেষ দিনটির গল্প ক্যামেরার লেন্সে ফুটিয়ে তোলাই আমাদের লক্ষ্য। বিয়ের প্রতিটি আবেগঘন মুহূর্ত ধরে রাখতে আমরা আছি আপনার পাশে।',
        aboutTitle: 'আমার গল্প',
        aboutSubtitle: 'সিনেমেটিক স্টোরি: লেন্সের আড়ালে এক কারিগর',
        aboutDescription: 'ফটোগ্রাফি আমার কাছে শুধু একটি পেশা নয়, এটি একটি নেশা। গত ৫ বছর ধরে আমি মানুষের জীবনের সবচেয়ে সুন্দর মুহূর্তগুলোকে ক্যামেরাবন্দি করছি। "সিনেমেটিক স্টোরি" এর যাত্রা শুরু হয়েছিল প্রতিটি সাধারণ মুহূর্তকে অসাধারণভাবে ফুটিয়ে তোলার স্বপ্ন নিয়ে।',
        aboutImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80',
        statsExperience: '৫+ বছর',
        statsEvents: '২০০+',
        statsPhotos: '৫০,০০০+',
        statsSatisfaction: '১০০%',
        footerDescription: 'আমরা শুধু ছবি তুলি না, আমরা আপনার জীবনের শ্রেষ্ঠ মুহূর্তগুলোকে একটি সিনেমাটিক গল্পের মতো করে ফুটিয়ে তুলি। ইন্দ্রজিৎ দেবের লেন্সের জাদুতে আপনার স্মৃতি হোক অমর।',
        footerCopyright: '© ২০২৬ সিনেমেটিক স্টোরি। ওনার: ইন্দ্রজিৎ দেব',
        showOffers: true
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

apiRouter.post('/settings/about-upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = req.file.path;
    
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { aboutImage: imageUrl, updatedAt: Date.now() }, 
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (err) {
    console.error('Error uploading about image:', err);
    res.status(500).json({ error: 'Failed to upload about image' });
  }
});

apiRouter.post('/settings/hero-upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = req.file.path;
    
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { heroImage: imageUrl, updatedAt: Date.now() }, 
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (err) {
    console.error('Error uploading hero image:', err);
    res.status(500).json({ error: 'Failed to upload hero image' });
  }
});

apiRouter.patch('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Catch-all for API routes to prevent falling through to Vite/HTML
apiRouter.use((req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Export for serverless functions
export { app, apiRouter };

// API Routes
app.use('/api', apiRouter);

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not running in a serverless environment
  if (!process.env.NETLIFY) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV === 'development') {
  startServer();
}
