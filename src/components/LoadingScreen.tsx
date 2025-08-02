import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [showFinalText, setShowFinalText] = useState(false);
  
  // Simplified loading texts - fewer items
  const loadingTexts = useMemo(() => [
    "Cargando fragancias...",
    "Preparando experiencia...",
    "Casi listo..."
  ], []);
  
  const finalText = "NUVÓ Essence Ritual";

  // Simplified loading function with faster progression
  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 1500; // Reduced to 1.5 seconds for faster experience
    
    // Use more efficient loading progression
    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        // Faster progression
        const incrementFactor = prev < 50 ? 5 : 8;
        const newProgress = prev + incrementFactor;
        
        if (newProgress >= 100) {
          clearInterval(loadingInterval);
          setShowFinalText(true);
          
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
          
          setTimeout(() => {
            onLoadingComplete();
          }, remainingTime + 500); // Reduced to 500ms for faster transition
          
          return 100;
        }
        
        return newProgress;
      });
    }, 100); // Update every 100ms for smoother progression
    
    // Change text less frequently - every 2 seconds
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    
    return () => {
      clearInterval(loadingInterval);
      clearInterval(textInterval);
    };
  }, [onLoadingComplete, loadingTexts.length]);

  // Set up the body styling for the loading screen
  useEffect(() => {
    // Preload logo image
    const logoImage = new Image();
    logoImage.src = '/logocarga.png';
    
    // Configure body for loading screen
    document.body.classList.add('loading-active');
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.position = 'fixed';
    
    return () => {
      // Clean up body styling when component unmounts
      document.body.classList.remove('loading-active');
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.width = 'auto';
      document.body.style.position = 'static';
    };
  }, []);

  // Minimal static particles for visual interest without animation
  const perfumeParticles = useMemo(() => {
    return Array.from({ length: 4 }).map((_, index) => {
      const size = 3;
      const startPosition = 20 + (index * 20); // Even distribution
      
      return (
        <div
          key={`perfume-particle-${index}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            bottom: "40%",
            left: `${startPosition}%`,
            opacity: 0.5,
            background: "rgba(194, 163, 131, 0.4)"
          }}
        />
      );
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      data-loading-screen="true"
    >
      {/* Fondo mejorado con aspecto elegante para perfumes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#20181A] to-[#1a1a1a]" />
      
      {/* Simple gradient background */}
      <div className="absolute inset-0 opacity-30" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(194, 163, 131, 0.15), rgba(0, 0, 0, 0) 70%)"
      }} />
      
      {/* Minimal static particles */}
      {perfumeParticles}

      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        {/* Logo - simplified animation */}
        <div className="mb-12">
          <AnimatedLogo />
        </div>

        {/* Loading text - simplified with no exit animations */}
        <div className="text-center mb-8 h-8">
          {showFinalText ? (
            <p className="font-primary text-2xl text-primary font-semibold">
              {finalText}
            </p>
          ) : (
            <p className="font-primary text-lg text-white/90">
              {loadingTexts[textIndex]}
            </p>
          )}
        </div>
        
        {/* Simplified progress bar without animations */}
        <div className="relative w-full max-w-xs">
          {/* Base line */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            {/* Progress bar - no gradient or shine effect */}
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          {/* Percentage */}
          <p className="absolute -right-8 -top-6 text-xs font-medium text-primary/80">
            {Math.round(loadingProgress)}%
          </p>
        </div>
        
        {/* Removed concentric rings effect */}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
