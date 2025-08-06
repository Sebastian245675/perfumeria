import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, Star, Sparkles, Droplets, Wind, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "@/lib/gsap-config";
import { useMouse, useParallaxEffect, useScrollInfo } from "@/hooks/use-mouse";
import TiltCard from "@/components/TiltCard";
import ParticleEffect from "@/components/ParticleEffect";
import OlfactoryFamilies from "@/components/OlfactoryFamilies";

const Products = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Avanzado: seguimiento del ratón y efectos de parallax
  const mouse = useMouse();
  const parallaxPos = useParallaxEffect(30);
  const scrollInfo = useScrollInfo();
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  
  // Motion values para animaciones avanzadas
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  
  useEffect(() => {
    scrollYProgress.set(scrollInfo.scrollYProgress);
  }, [scrollInfo.scrollYProgress]);
  
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [5, -5]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-5, 5]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0, 1]);
  const contentScale = useTransform(scrollYProgress, [0, 0.2, 0.3], [0.8, 0.8, 1]);
  
  // Actualizar valores de motion basados en posición del ratón
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Slides mejorados con más información
  const imageSlides = [
    {
      image: "/fondoproducto.jpg",
      title: "Lorenzo Pazzaglia",
      description: "El maestro italiano fusiona audacia y elegancia: materias primas gourmand, acordes marinos y maderas exóticas se convierten en piezas de alta perfumería que despiertan los sentidos y evocan paisajes mediterráneos con un toque irreverente.",
      color: "#D77B7C",
      icon: <Droplets className="h-5 w-5 mr-2" />,
      notes: ["Gourmand", "Acordes Marinos", "Maderas Exóticas"]
    },
    {
      image: "/segundoproducto.jpg",
      title: "Ramón Monegal",
      description: "Herencia perfumista de Barcelona desde 1916. Cada fragancia es una narrativa íntima que combina arte, literatura y la impecable técnica artesanal de la familia Monegal, revelando lujo silencioso y sofisticación atemporal.",
      color: "#9D7B8C",
      icon: <Flame className="h-5 w-5 mr-2" />,
      notes: ["Arte", "Literatura", "Artesanía"]
    },
    {
      image: "/fondo1.jpg",
      title: "Xerjoff",
      description: "Desde Turín, la casa italiana eleva la perfumería a un arte suntuoso. Ingredientes raros y presentaciones opulentas se funden en composiciones ricas y envolventes, donde la tradición artesanal se encuentra con la innovación para ofrecer experiencias olfativas de lujo absoluto.",
      color: "#B8A88A",
      icon: <Sparkles className="h-5 w-5 mr-2" />,
      notes: ["Ingredientes Raros", "Tradición", "Innovación"]
    }
  ];

  const classifications = [
    {
      type: "Según familias olfativas",
      categories: ["Floral", "Fougere", "Frutal", "Cítrico", "Aromático", "Amaderado", "Oriental", "Gourmand", "Chypre"]
    },
    {
      type: "Según estación del año",
      categories: ["Primavera", "Verano", "Otoño", "Invierno"]
    },
    {
      type: "Según intensidad",
      categories: ["Eau Fraiche", "Eau de Cologne", "Eau de Toilette", "Eau de Parfum", "Parfum"]
    }
  ];

  // Parallax effect for background
  useEffect(() => {
    if (!parallaxRef.current) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.25}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto image slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % imageSlides.length);
    }, 8000); // Aumentado a 8 segundos para dar más tiempo de lectura
    
    return () => clearInterval(timer);
  }, [imageSlides.length]);

  // Text animation with GSAP
  useEffect(() => {
    if (!headingRef.current) return;
    
    const textContent = headingRef.current.textContent || "";
    headingRef.current.innerHTML = "";
    
    // Split text into individual spans for animation
    [...textContent].forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.opacity = "0";
      span.style.display = "inline-block";
      span.style.transform = "translateY(20px)";
      headingRef.current?.appendChild(span);
    });

    // Set up scroll-triggered animations with longer display time
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none none", // Changed to prevent reverse animation
        once: false
      }
    });

    // Animate heading
    timeline.to(headingRef.current.children, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.8, // Slightly longer duration
      ease: "power3.out"
    });

    // Animate text paragraphs - keep them visible
    if (textRef.current) {
      timeline.to(
        textRef.current.children,
        {
          opacity: 1,
          y: 0,
          duration: 1.2, // Longer duration
          stagger: 0.3, // More time between paragraphs
          ease: "power2.out"
        },
        "-=0.3"
      );
    }

    // Animate image
    if (imageRef.current) {
      timeline.to(
        imageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1.5, // Longer duration
          ease: "power2.out"
        },
        "-=0.6"
      );
    }
  }, []);

  return (
    <section 
      id="productos" 
      ref={sectionRef}
      className="min-h-screen py-32 bg-gradient-to-b from-background to-subtle relative overflow-hidden"
    >
      {/* Parallax Background */}
      <div 
        ref={parallaxRef} 
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: "url('/fondoproducto.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "translateY(0px)"
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-primary/5 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header con efectos 3D y partículas */}
        <div className="text-center mb-24 relative overflow-hidden">
          {/* Partículas en el fondo */}
          <ParticleEffect count={40} className="opacity-40 !absolute" />
          
          <motion.div 
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          <motion.div 
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary"
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 0.8, width: 96 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: false }}
          />
          
          <motion.div 
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary opacity-60"
            animate={{ 
              opacity: [0.3, 0.9, 0.3],
              width: [20, 48, 20],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: false }}
            className="relative"
          >
            <h2 
              ref={headingRef}
              className="font-primary text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/90 to-primary/80 mt-8 mb-8"
            >
              Nuestra Filosofía
            </h2>
            
            <motion.div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full max-w-xs h-[2px] overflow-hidden"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              viewport={{ once: false }}
            >
              <motion.div 
                className="w-full h-full bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                animate={{ 
                  x: ["-100%", "100%"],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Sparkles className="h-4 w-4 text-primary/80" />
              <span className="text-sm uppercase tracking-widest text-primary/70 font-secondary">Maestros perfumistas</span>
              <Sparkles className="h-4 w-4 text-primary/80" />
            </motion.div>
          </motion.div>
        </div>

        {/* Impressive Hero Section */}
        <div className="grid lg:grid-cols-12 gap-8 mb-32">
          {/* Left text column with 3D effects and particles */}
          <div 
            ref={textRef}
            className="lg:col-span-5 flex flex-col justify-center space-y-8 order-2 lg:order-1 relative"
          >
            {/* Subtle rotating background shape */}
            <div className="absolute -left-[100px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-30 z-0 pointer-events-none">
              <motion.div 
                className="w-full h-full rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-[80px]"
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 8, repeat: Infinity, repeatType: "reverse" }
                }}
              />
            </div>
            
            <TiltCard 
              className="bg-black/10 backdrop-blur-sm p-6 rounded-xl border border-white/5"
              perspective={1200}
              tiltMaxAngleX={8}
              tiltMaxAngleY={8}
              glareEnabled={true}
              glareMaxOpacity={0.15}
              glareColor="255, 175, 175"
            >
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.5 }}
                className="relative"
              >
                <div className="absolute left-0 top-0 -ml-4 h-full w-1 bg-gradient-to-b from-primary/80 via-primary/30 to-transparent">
                  <motion.div
                    className="absolute top-0 left-0 w-full h-[30%] bg-primary/80 rounded-full blur-sm"
                    animate={{ y: [0, 100, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                  />
                </div>
                <motion.p 
                  className="text-lg lg:text-xl font-secondary italic"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  viewport={{ once: false, amount: 0.5 }}
                >
                  Nos especializamos en <span className="text-primary font-semibold relative inline-block">
                    perfumería nicho
                    <motion.span 
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 1.5 }}
                      viewport={{ once: false }}
                    />
                  </span>, un universo reservado para quienes buscan lo extraordinario.
                </motion.p>
              </motion.div>
            </TiltCard>
            
            <motion.div 
              className="relative backdrop-blur-[2px] p-6 rounded-xl border-l-2 border-white/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-50" />
              <motion.p 
                className="text-lg font-secondary relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.6 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                A diferencia de las fragancias comerciales, las creaciones de autor que habitan Nuvo son obras únicas, cuidadosamente elaboradas con <motion.span 
                  className="text-primary/90 relative"
                  whileHover={{
                    color: "#ffffff",
                    transition: { duration: 0.2 }
                  }}
                >ingredientes nobles
                <motion.span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/50" /></motion.span>, fórmulas originales y una profunda libertad creativa. Aquí no hay tendencias que seguir, sino experiencias que descubrir.
              </motion.p>
            </motion.div>
            
            <TiltCard 
              className="backdrop-blur-[2px] p-6 rounded-xl border-r-2 border-white/5"
              perspective={1200}
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnabled={true}
              glareMaxOpacity={0.1}
            >
              <motion.p 
                className="text-lg font-secondary"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.9 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                Cada perfume en Nuvo ha sido seleccionado no solo por su belleza olfativa, sino por su capacidad de provocar sensaciones, despertar recuerdos y acompañarte en el viaje íntimo de la autoexpresión.
              </motion.p>
            </TiltCard>
            
            <motion.div 
              className="backdrop-blur-[2px] p-6 rounded-xl bg-gradient-to-br from-black/10 to-black/0 border border-white/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <motion.p 
                className="text-lg font-secondary"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                Te invitamos a dejar atrás lo predecible y sumergirte en un ritual sensorial donde la exclusividad no es un lujo, sino un lenguaje.
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="backdrop-blur-[2px] p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <motion.p 
                className="text-xl font-secondary font-semibold text-primary text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.5 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                Bienvenido a Nuvo, donde el alma del perfume cobra vida.
              </motion.p>
              
              <motion.div 
                className="w-full flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.8 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                <div className="relative mt-4">
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/80 rounded-full blur opacity-30"
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [0.95, 1.05, 0.95],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                  <Button 
                    variant="outline" 
                    className="group border-primary text-primary relative bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-white transition-all duration-500 px-6 py-5 rounded-full"
                  >
                    <span className="mr-2">Descubre el ritual</span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Right image carousel column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative h-[500px] overflow-hidden rounded-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-white/10">
              {/* Slider controls */}
              <div className="absolute inset-0 z-20 flex items-center justify-between px-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white"
                  onClick={() => setActiveSlide(prev => (prev - 1 + imageSlides.length) % imageSlides.length)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white"
                  onClick={() => setActiveSlide(prev => (prev + 1) % imageSlides.length)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Image carousel - versión avanzada */}
              <div className="relative h-full" ref={carouselRef}>
                <AnimatePresence mode="wait">
                  {imageSlides.map((slide, index) => (
                    activeSlide === index && (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          filter: "blur(0px)",
                          transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] }
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.95, 
                          filter: "blur(4px)",
                          transition: { duration: 0.7 } 
                        }}
                        className="absolute inset-0 overflow-hidden"
                      >
                        <motion.div 
                          className="w-full h-full bg-cover bg-center will-change-transform"
                          style={{ 
                            backgroundImage: `url("${slide.image}")`,
                            transformOrigin: "center",
                          }}
                          animate={{
                            scale: [1, 1.05, 1],
                            transition: { 
                              duration: 10,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }
                          }}
                        />
                        
                        {/* Capa de gradiente animada */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 0.7 }}
                          exit={{ opacity: 0 }}
                        />
                        
                        {/* Contenido superpuesto */}
                        <motion.div 
                          className="absolute inset-0 flex flex-col justify-end p-8"
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
                          exit={{ y: 30, opacity: 0 }}
                        >
                          <div className="flex items-center gap-1 mb-3">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              style={{ color: slide.color }}
                            >
                              {slide.icon}
                            </motion.div>
                            
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ 
                                    opacity: i < 4 ? 1 : 0.5, 
                                    scale: 1,
                                    transition: { delay: 0.4 + i * 0.1 }
                                  }}
                                >
                                  <Star className={`h-4 w-4 ${i < 4 ? 'fill-primary' : 'fill-primary/30'} text-primary`} />
                                </motion.div>
                              ))}
                            </div>
                            
                            <motion.div 
                              className="ml-2 text-xs text-white/70"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.9 }}
                            >
                              4.8/5
                            </motion.div>
                          </div>
                          
                          <motion.div
                            className="overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: "auto", transition: { delay: 0.6 } }}
                          >
                            <motion.h3 
                              className="text-white text-3xl font-primary font-bold mb-3"
                              initial={{ y: 40, opacity: 0 }}
                              animate={{ 
                                y: 0, 
                                opacity: 1,
                                transition: { delay: 0.7, duration: 0.8 }
                              }}
                            >
                              {slide.title}
                            </motion.h3>
                          </motion.div>
                          
                          <motion.p 
                            className="text-white/90 font-secondary text-base mb-4 max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 0.9, y: 0, transition: { delay: 0.8 } }}
                          >
                            {slide.description}
                          </motion.p>
                          
                          <motion.div 
                            className="flex flex-wrap gap-2 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.9 } }}
                          >
                            {slide.notes.map((note, i) => (
                              <motion.span 
                                key={i}
                                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-secondary text-white/80"
                                initial={{ scale: 0 }}
                                animate={{ 
                                  scale: 1, 
                                  transition: { delay: 1 + i * 0.1 } 
                                }}
                                whileHover={{ 
                                  backgroundColor: slide.color,
                                  color: "#fff",
                                  scale: 1.05
                                }}
                              >
                                {note}
                              </motion.span>
                            ))}
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Slider indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {imageSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${activeSlide === index ? 'bg-white w-6' : 'bg-white/50'}`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Classifications with simplified design */}
        <div className="mb-24 relative">
          {/* Eliminado ParticleEffect para mejor rendimiento */}
          
          <div className="mb-16">
            <div className="w-20 h-1 bg-primary/60 mx-auto mb-6"></div>
            
            <h3 className="font-primary text-4xl lg:text-5xl font-semibold text-center mb-4 text-primary">
              Clasificación de Perfumes
            </h3>
            
            <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-10 font-secondary">
              Descubre el arte de la perfumería a través de nuestras clasificaciones profesionales, desde las familias olfativas tradicionales hasta recomendaciones según la estación del año y la intensidad deseada.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {classifications.map((classification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="h-full"
              >
                <Card className="bg-gradient-to-br from-background/80 to-background/90 border border-white/10 overflow-hidden h-full shadow-md">
                    {/* Barra decorativa superior simplificada */}
                    <div className="h-1 bg-primary/60 w-full"></div>
                    
                    <CardContent className="p-6 lg:p-8 relative z-10">
                      <div className="mb-6 flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                          {index === 0 ? (
                            <Droplets className="h-5 w-5 text-primary" />
                          ) : index === 1 ? (
                            <Flame className="h-5 w-5 text-primary" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        
                        <h4 className="font-primary text-xl lg:text-2xl font-semibold text-primary">
                          {classification.type}
                        </h4>
                      </div>
                      
                      {index === 0 ? (
                        <div className="py-4">
                          <OlfactoryFamilies />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-2">
                          {classification.categories.map((category, catIndex) => (
                            <div 
                              key={catIndex} 
                              className="font-secondary text-sm p-3 rounded-lg border border-white/5 bg-white/5 flex items-center"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary/80 mr-2"></div>
                              <span className="tracking-wide">{category}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call-to-Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-black/20 via-primary/10 to-black/20 backdrop-blur-lg text-foreground max-w-4xl mx-auto overflow-hidden border border-white/10 shadow-[0_20px_80px_-15px_rgba(215,123,124,0.3)]">
            <div className="absolute top-0 left-0 w-full h-full pattern-dots pattern-primary pattern-bg-transparent pattern-opacity-10 pattern-size-2 opacity-20"></div>
            
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] opacity-50"></div>
              <div className="absolute -top-[200px] -right-[100px] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] opacity-60 animate-pulse"></div>
            </div>
            
            <CardContent className="p-12 md:p-16 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-primary text-primary">N</span>
                </div>
              </motion.div>
              
              <h3 className="font-primary text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                ¿Tienes una fragancia especial?
              </h3>
              
              <p className="font-secondary text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                Nos encantaría conocer tu <span className="italic">esencia única</span> y considerarla para nuestra colección.
                Cada perfume cuenta una historia, <span className="text-primary">¿cuál es la tuya?</span>
              </p>
              
              <Link to="/proponer-fragancia">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="font-secondary group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-500 px-8 py-6"
                >
                  <span className="text-base">Proponer Fragancia</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-500 group-hover:translate-x-2" />
                </Button>
              </Link>
              
              <motion.div 
                className="mt-8 text-sm text-muted-foreground/70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                viewport={{ once: true }}
              >
                Únete a la experiencia NUVÓ
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Products;
