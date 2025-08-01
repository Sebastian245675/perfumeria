import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
  xPercentage: number;
  yPercentage: number;
}

export const useMouse = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    xPercentage: 0,
    yPercentage: 0
  });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({
        x: ev.clientX,
        y: ev.clientY,
        xPercentage: ev.clientX / window.innerWidth,
        yPercentage: ev.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};

export const useParallaxEffect = (
  intensity: number = 20, 
  inverted: boolean = false
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.clientX) / intensity;
      const y = (window.innerHeight / 2 - e.clientY) / intensity;
      
      setPosition({ 
        x: inverted ? -x : x, 
        y: inverted ? -y : y 
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity, inverted]);

  return position;
};

interface ScrollInfo {
  scrollY: number;
  scrollYProgress: number;
}

export const useScrollInfo = (): ScrollInfo => {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    scrollY: 0,
    scrollYProgress: 0
  });

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollInfo({
        scrollY: window.scrollY,
        scrollYProgress: window.scrollY / windowHeight
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollInfo;
};
