import React, { useState, useEffect } from 'react';

interface ParticleEffectProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

// Create a minimal static particle background
const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 15, // Drastically reduced count
  colors = ['#D77B7C', '#ffffff', '#f3d3d3'],
  minSize = 1,
  maxSize = 3,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detect mobile devices
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);
  
  // Don't render particles on mobile for better performance
  if (isMobile) {
    return null;
  }
  
  // Generate static particles instead of animated ones
  const particles = Array.from({ length: count }).map((_, i) => {
    return {
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: minSize + Math.random() * (maxSize - minSize),
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.1 + Math.random() * 0.3
    };
  });
  
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
