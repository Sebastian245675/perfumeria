import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  scale?: number;
  speed?: number;
  borderRadius?: string;
  glareEnabled?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
  glarePosition?: string;
  glareReverse?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  perspective = 1000,
  tiltMaxAngleX = 20,
  tiltMaxAngleY = 20,
  scale = 1.05,
  speed = 500,
  borderRadius = "1rem",
  glareEnabled = true,
  glareMaxOpacity = 0.2,
  glareColor = "255, 255, 255",
  glarePosition = "50%, 50%",
  glareReverse = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring animations for smoother movement
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltMaxAngleX, -tiltMaxAngleX]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMaxAngleY, tiltMaxAngleY]), springConfig);
  
  const glareX = useTransform(
    x,
    [-0.5, 0.5],
    glareReverse ? ["100%", "0%"] : ["0%", "100%"]
  );
  
  const glareY = useTransform(
    y,
    [-0.5, 0.5],
    glareReverse ? ["100%", "0%"] : ["0%", "100%"]
  );

  // Dynamically handle card movements
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate normalized position (-0.5 to 0.5)
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
    setIsHovering(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: perspective,
        borderRadius,
        rotateX: isHovering ? rotateX : 0,
        rotateY: isHovering ? rotateY : 0,
        transition: `all ${speed / 1000}s ease`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={resetPosition}
      whileHover={{ scale }}
    >
      {children}
      
      {glareEnabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at ${glarePosition}, rgba(${glareColor}, ${glareMaxOpacity}), transparent)`,
            backgroundPosition: `${glareX}% ${glareY}%`,
            opacity: isHovering ? 1 : 0,
            mixBlendMode: "overlay",
            transition: `opacity ${speed / 1000}s ease`,
          }}
        />
      )}
    </motion.div>
  );
};

export default TiltCard;
