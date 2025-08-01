import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-perfume.jpg";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
}

const ParallaxText = ({ children, offset = 50 }: ParallaxProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2 }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.8"
      )
      .fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.8"
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      );

    // Parallax effect on scroll
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to(containerRef.current.querySelector('.bg-image'), {
        duration: 1.5,
        x: x,
        y: y,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section 
      id="inicio"
      ref={containerRef}
      className="relative h-screen w-screen flex items-center justify-center overflow-hidden"
      style={{ 
        position: 'relative', 
        margin: 0, 
        padding: 0, 
        width: '100vw', 
        maxWidth: '100vw',
        left: 0,
        right: 0
      }}
    >
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-image scale-110"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          opacity,
          scale,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-black/40 via-carbon-black/30 to-background"></div>
      </motion.div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 md:w-2 md:h-2 rounded-full bg-rose-gold/30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{ 
              y: [null, Math.random() * 200 - 100 + "vh"], 
              x: [null, Math.random() * 200 - 100 + "vw"] 
            }}
            transition={{ 
              duration: Math.random() * 120 + 80, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-ivory-white max-w-5xl mx-auto px-4">
        <ParallaxText offset={-20}>
          <motion.h1 
            ref={titleRef}
            className="font-primary text-7xl md:text-9xl font-bold mb-8 tracking-wider"
            style={{ textShadow: "0 0 40px rgba(0,0,0,0.5)" }}
          >
            NUVÓ
          </motion.h1>
        </ParallaxText>
        
        <ParallaxText offset={-15}>
          <motion.p 
            ref={subtitleRef}
            className="font-secondary text-xl md:text-3xl font-light mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Perfumes de 
            <span className="text-primary"> alta calidad </span> 
            con un 
            <span className="text-rose-gold"> toque personal</span>
          </motion.p>
        </ParallaxText>
        
        <ParallaxText offset={-10}>
          <motion.p 
            ref={textRef}
            className="font-secondary text-lg md:text-xl font-extralight mb-14 opacity-85 max-w-3xl mx-auto"
          >
            Descubre tu aroma único
          </motion.p>
        </ParallaxText>
        
        <motion.div 
          ref={buttonRef}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30"
          style={{
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            zIndex: 30
          }}
        >
          <Button 
            variant="outline" 
            size="lg"
            className="font-secondary text-ivory-white border-ivory-white hover:bg-ivory-white hover:text-carbon-black transition-all duration-500 hover:scale-105 group overflow-hidden relative"
            style={{ 
              opacity: 1, 
              visibility: 'visible', 
              position: 'relative', 
              zIndex: 20,
              transform: 'translateZ(0)',
              boxShadow: '0 0 15px rgba(0,0,0,0.5), 0 0 5px rgba(255,255,255,0.3)',
              borderWidth: '2px',
              borderColor: 'rgba(255,255,255,0.95)',
              padding: '8px 20px',
              letterSpacing: '0.5px',
              fontWeight: 500
            }}
          >
            <span className="relative z-10">Descubrir Esencias</span>
            <span className="absolute inset-0 bg-ivory-white w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
          </Button>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-ivory-white/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-xs font-secondary tracking-widest">DESLIZA</span>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;