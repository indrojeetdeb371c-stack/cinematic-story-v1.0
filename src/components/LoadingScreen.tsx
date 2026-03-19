import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-bg z-[9999] flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Animated Background Glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.2, opacity: 0.8 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute w-64 h-64 bg-gold/20 blur-[100px] rounded-full"
        />

        {/* Logo and Icon */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-gold/20 rounded-full"
            />
            <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <Camera className="w-12 h-12 text-gold" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">
              সিনেমেটিক <span className="text-gold">স্টোরি</span>
            </h1>
            <p className="text-gray-500 text-sm tracking-widest uppercase font-medium">
              স্মৃতি হোক অমর
            </p>
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-gold text-black font-bold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>লোড হচ্ছে...</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
