import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo: React.FC = () => {
  // Reduced number of particles for better performance (especially on mobile)
  const particles = Array.from({ length: 3 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 3;
    const radius = 50;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y, delay: i * 0.08 };
  });

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Rotating ring with simplified animation */}
      <motion.div
        className="absolute w-full h-full rounded-full border border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 6, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      
      {/* Second rotating ring removed for better performance */}
      
      {/* Logo image with simplified effect */}
      <motion.div
        className="relative z-10"
        animate={{ 
          scale: [1, 1.03, 1],
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop"
        }}
      >
        <img
          src="/logocarga.png"
          alt="NUVÓ"
          className="w-36 h-36 object-contain drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 0 8px rgba(194, 163, 131, 0.6))"
          }}
        />
      </motion.div>
      
      {/* Simplified light effect - static instead of animated for better performance */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(194, 163, 131, 0.2) 0%, rgba(194, 163, 131, 0) 70%)",
          zIndex: -1,
        }}
      />
      
      {/* Partículas orbitando - reduced and simplified */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 bg-primary/70 rounded-full"
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            opacity: 0.6,
          }}
        />
      ))}
      
      {/* Removed random sparkles for better performance */}
    </div>
  );
};

export default AnimatedLogo;
