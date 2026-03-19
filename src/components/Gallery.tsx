import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Maximize2, Download } from 'lucide-react';
import { Photo } from '../types';

export default function Gallery() {
  const [filter, setFilter] = React.useState<string>('all');
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPhotos(data);
      })
      .catch(err => console.error('Failed to fetch gallery:', err));
  }, []);

  const categories = [
    { id: 'all', name: 'সবগুলো' },
    { id: 'Wedding', name: 'বিয়ে' },
    { id: 'Portrait', name: 'পোর্ট্রেট' },
    { id: 'Event', name: 'ইভেন্ট' },
    { id: 'Nature', name: 'প্রকৃতি' },
  ];

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <section id="gallery" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">আমাদের <span className="text-gold">গ্যালারি</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          বিগত কয়েক বছরে আমাদের তোলা কিছু সেরা মুহূর্তের সংগ্রহ। প্রতিটি ছবি এক একটি গল্প বলে।
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === cat.id
                ? 'bg-gold text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-card-bg cursor-pointer"
            >
              <img
                src={`${photo.url}${photo.url.includes('?') ? '&' : '?'}v=${Date.now()}`}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gold text-xs font-bold uppercase tracking-widest mb-1">
                      {categories.find(c => c.id === photo.category)?.name}
                    </span>
                    <h3 className="text-xl font-bold text-white">{photo.title}</h3>
                  </div>
                  <div className="p-2 rounded-full bg-gold/20 text-gold backdrop-blur-sm">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              {/* Logo Watermark */}
              <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none flex items-center gap-1 bg-black/20 backdrop-blur-[2px] px-2 py-1 rounded-lg">
                <Camera className="w-3 h-3 text-gold" />
                <span className="text-[8px] font-bold tracking-tighter whitespace-nowrap">
                  সিনেমেটিক <span className="text-gold">স্টোরি</span>
                </span>
              </div>

              {/* Bottom Watermark */}
              <div className="absolute bottom-2 right-2 opacity-30 pointer-events-none text-[10px] font-bold tracking-tighter">
                INDROJEET DEB
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-0 right-0 md:-top-12 md:-right-12 p-3 text-white hover:text-gold transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                <img
                  src={`${selectedPhoto.url}${selectedPhoto.url.includes('?') ? '&' : '?'}v=${Date.now()}`}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                
                {/* Large Watermark in Lightbox */}
                <div className="absolute bottom-8 right-8 opacity-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <Camera className="w-6 h-6 text-gold" />
                  <span className="text-xl font-bold tracking-tighter">
                    সিনেমেটিক <span className="text-gold">স্টোরি</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-gold text-sm font-bold uppercase tracking-widest mb-2 block">
                  {categories.find(c => c.id === selectedPhoto.category)?.name}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{selectedPhoto.title || 'শিরোনামহীন ছবি'}</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
