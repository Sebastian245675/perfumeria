import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";
import gsap from "@/lib/gsap-config";

interface AboutUsProps {
  isFullPage?: boolean;
}

const AboutUs = ({ isFullPage = false }: AboutUsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const values = [
    {
      title: "SUTILEZA",
      description: "Creemos que el lujo no necesita anunciarse. NUVÓ es elegancia que se percibe, no que se impone.",
      icon: "✦" // Elegant symbol
    },
    {
      title: "RITUALIDAD",
      description: "Cada fragancia es un ritual íntimo, una experiencia que se integra a la piel y a la memoria.",
      icon: "⟐" // Elegant symbol
    },
    {
      title: "AUTENTICIDAD",
      description: "No seguimos tendencias. Creamos esencias atemporales, hechas para quienes buscan la verdad en lo simple.",
      icon: "◈" // Elegant symbol
    }
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    // Text reveal effect
    const splitTextAnimation = () => {
      if (!titleRef.current) return;
      
      const textContent = titleRef.current.textContent || "";
      titleRef.current.innerHTML = "";
      
      // Create individual spans for each letter
      [...textContent].forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.opacity = "0";
        span.style.display = "inline-block";
        span.style.transform = "translateY(20px)";
        titleRef.current?.appendChild(span);
      });
    };

    splitTextAnimation();

    // Animation timeline
    const setupScrollAnimations = () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "center center",
          toggleActions: "play none none reverse"
        }
      });

      // Title animation
      timeline.to(titleRef.current?.children, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
      });

      // Mission and Vision cards animation
      if (missionRef.current && visionRef.current) {
        timeline
          .fromTo(
            missionRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.4"
          )
          .fromTo(
            visionRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.6"
          );
      }

      // Values animation
      if (valuesRef.current) {
        timeline.fromTo(
          valuesRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        );
      }

      // Story animation
      if (storyRef.current) {
        timeline.fromTo(
          storyRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.2"
        );
      }
    };

    // Initialize animation
    setupScrollAnimations();
  }, []);

  // Card hover effect variants
  const cardVariants = {
    initial: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: { 
      scale: 1.03, 
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Text reveal variants
  const textRevealVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section 
      id="nosotros" 
      ref={sectionRef}
      className={`${isFullPage ? 'pt-0' : 'py-32'} relative overflow-hidden`}
    >
      {/* Background perfume image with overlay */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <img 
          src="/fondo2.jpg" 
          alt="Perfume NUVÓ" 
          className="w-full h-full object-cover opacity-20" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/90"></div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none z-1">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with elegant animation and floating accents */}
        {!isFullPage && (
          <div className="text-center mb-24 relative">
            {/* Decorative accents */}
            <motion.div 
              className="absolute top-0 left-1/4 w-1 h-8 bg-primary/30"
              initial={{ height: 0 }}
              animate={isInView ? { height: 40 } : { height: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
            <motion.div 
              className="absolute top-0 right-1/4 w-1 h-8 bg-primary/30"
              initial={{ height: 0 }}
              animate={isInView ? { height: 40 } : { height: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            ></motion.div>
            
            {/* Elegant line across */}
            <motion.div 
              className="absolute top-6 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ width: 0 }}
              animate={isInView ? { width: "200px" } : { width: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            ></motion.div>
            
            <div className="inline-block relative py-4 px-6">
              <motion.div
                className="absolute inset-0 border-2 border-primary/20 rounded-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              ></motion.div>
              <h2 
                ref={titleRef}
                className="font-primary text-5xl md:text-7xl font-bold text-primary my-8 tracking-wider"
              >
                Quiénes Somos
              </h2>
            </div>
            
            <motion.div 
              className="max-w-4xl mx-auto relative"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {/* Decorative elements */}
              <motion.div 
                className="absolute -left-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/40"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              ></motion.div>
              <motion.div 
                className="absolute -right-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/40"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              ></motion.div>
              
              {/* First paragraph with highlighted first letter */}
              <motion.p 
                variants={textRevealVariants}
                className="font-secondary text-xl md:text-3xl font-light text-foreground leading-relaxed mb-8"
              >
                <span className="inline-block text-4xl md:text-5xl text-primary font-primary font-semibold mr-1">N</span>
                UVÓ crea experiencias sensoriales únicas para quienes buscan perfumes exclusivos.
              </motion.p>
              
              <motion.p 
                variants={textRevealVariants}
                className="font-secondary text-lg md:text-xl font-extralight text-muted-foreground leading-relaxed"
              >
                No elegimos una fragancia solo por apariencia, sino para <span className="italic text-primary/80">evocar recuerdos</span>, 
                <span className="italic text-primary/80"> conectar con lo auténtico</span> y 
                <span className="italic text-primary/80"> acompañar el ritual</span> de habitar el cuerpo.
              </motion.p>
              
              {/* Elegant separator */}
              <motion.div 
                className="w-20 h-[1px] bg-primary/30 mx-auto mt-12"
                initial={{ width: 0 }}
                animate={isInView ? { width: 80 } : { width: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              ></motion.div>
            </motion.div>
          </div>
        )}

        {/* Mission & Vision with advanced glass morphism effect */}
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <motion.div 
            ref={missionRef}
            whileHover="hover"
            initial="initial"
            variants={cardVariants}
            className="relative group"
          >
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -top-4 -left-4 w-20 h-20 border border-primary/20 rounded-sm z-0 opacity-0 group-hover:opacity-100"
              initial={{ rotate: 0 }}
              whileHover={{ rotate: -10 }}
              transition={{ duration: 0.5 }}
            ></motion.div>
            
            <motion.div 
              className="absolute -bottom-3 -right-3 w-12 h-12 border border-primary/20 rounded-sm z-0 opacity-0 group-hover:opacity-100"
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.7 }}
            ></motion.div>
            
            {/* Main card with glass morphism */}
            <Card className="bg-background/60 backdrop-blur-lg border-primary/20 shadow-lg overflow-hidden h-full z-10 relative">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Animated border line */}
              <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-700 ease-out"></div>
              <div className="absolute bottom-0 right-0 w-1 h-0 bg-primary/50 group-hover:h-full transition-all duration-700 delay-100 ease-out"></div>
              
              <CardContent className="p-12 relative">
                {/* Elegant title with decorative element */}
                <div className="mb-8 relative">
                  <div className="absolute -top-6 -left-6 w-12 h-12 border-t border-l border-primary/30"></div>
                  <h3 className="font-primary text-4xl font-semibold text-primary tracking-wider">MISIÓN</h3>
                  <div className="h-px w-16 bg-primary/30 mt-2"></div>
                </div>
                
                <p className="font-secondary text-lg font-light text-foreground leading-relaxed">
                  Redefinir el perfume como una <span className="text-primary/80 font-medium">obra sensorial atemporal</span>, 
                  íntima y auténtica. Crear experiencias que acompañen momentos personales, 
                  desde lo sutil y lo esencial sin artificios ni excesos.
                </p>
                
                <motion.div 
                  className="mt-8 flex items-center text-primary/70 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <span className="font-secondary text-sm font-medium tracking-wider mr-2">DESCUBRE MÁS</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            ref={visionRef}
            whileHover="hover"
            initial="initial"
            variants={cardVariants}
            className="relative group"
          >
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-20 h-20 border border-primary/20 rounded-sm z-0 opacity-0 group-hover:opacity-100"
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.5 }}
            ></motion.div>
            
            <motion.div 
              className="absolute -bottom-3 -left-3 w-12 h-12 border border-primary/20 rounded-sm z-0 opacity-0 group-hover:opacity-100"
              initial={{ rotate: 0 }}
              whileHover={{ rotate: -10 }}
              transition={{ duration: 0.7 }}
            ></motion.div>
            
            {/* Main card with glass morphism */}
            <Card className="bg-background/60 backdrop-blur-lg border-primary/20 shadow-lg overflow-hidden h-full z-10 relative">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Animated border line */}
              <div className="absolute top-0 right-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-700 ease-out"></div>
              <div className="absolute bottom-0 left-0 w-1 h-0 bg-primary/50 group-hover:h-full transition-all duration-700 delay-100 ease-out"></div>
              
              <CardContent className="p-12 relative">
                {/* Elegant title with decorative element */}
                <div className="mb-8 relative">
                  <div className="absolute -top-6 -right-6 w-12 h-12 border-t border-r border-primary/30"></div>
                  <h3 className="font-primary text-4xl font-semibold text-primary tracking-wider">VISIÓN</h3>
                  <div className="h-px w-16 bg-primary/30 mt-2 ml-auto"></div>
                </div>
                
                <p className="font-secondary text-lg font-light text-foreground leading-relaxed">
                  Ser una casa de perfumes reconocida por su <span className="text-primary/80 font-medium">elegancia y conexión emocional</span> con quienes 
                  eligen vivir la belleza como una experiencia auténtica. Queremos que NUVÓ sea sinónimo 
                  de arte, esencia y presencia.
                </p>
                
                <motion.div 
                  className="mt-8 flex items-center justify-end text-primary/70 group cursor-pointer"
                  whileHover={{ x: -5 }}
                >
                  <span className="font-secondary text-sm font-medium tracking-wider mr-2">DESCUBRE MÁS</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* New section with full-width image banner */}
        <div className="relative w-full my-24 overflow-hidden">
          <motion.div 
            className="h-[300px] md:h-[400px] relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            {/* Background image */}
            <img 
              src="/fondo2.jpg" 
              alt="Colección de perfumes NUVÓ" 
              className="w-full h-full object-cover object-center"
            />
            
            {/* Elegant overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <motion.div
                className="max-w-3xl mx-auto text-center"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="font-primary text-4xl md:text-5xl font-semibold text-white mb-6 tracking-wider">
                  ARTE Y ELEGANCIA
                </h3>
                <div className="h-px w-40 bg-primary/50 mx-auto mb-8"></div>
                <p className="font-secondary text-xl md:text-2xl text-white/90 leading-relaxed">
                  Cada fragancia cuenta una historia, cada aroma despierta emociones que trascienden el tiempo
                </p>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute top-8 left-8 w-24 h-24 border border-white/20 rounded-sm"
              initial={{ rotate: 0, opacity: 0 }}
              whileInView={{ rotate: 45, opacity: 0.7 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              viewport={{ once: true }}
            ></motion.div>
            
            <motion.div 
              className="absolute bottom-8 right-8 w-24 h-24 border border-white/20 rounded-sm"
              initial={{ rotate: 0, opacity: 0 }}
              whileInView={{ rotate: -45, opacity: 0.7 }}
              transition={{ duration: 1.5, delay: 0.6 }}
              viewport={{ once: true }}
            ></motion.div>
          </motion.div>
        </div>

        {/* Values with premium design and interactive elements */}
        <div className="mb-32 relative">
          {/* Decorative side image */}
          <div className="absolute -right-20 top-1/4 w-40 h-80 opacity-10 hidden lg:block">
            <img 
              src="/fondo2.jpg" 
              alt="Perfume detalle" 
              className="w-full h-full object-cover rounded-l-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background"></div>
          </div>
          
          <div className="relative mb-20">
            <motion.div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-primary/30"
              initial={{ height: 0 }}
              whileInView={{ height: 64 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative z-10 bg-background/50 backdrop-blur-sm py-4 px-8 inline-block rounded-sm mx-auto text-center"
            >
              <h3 className="font-primary text-4xl md:text-5xl font-semibold text-center text-primary mt-6 tracking-widest">
                NUESTROS VALORES
              </h3>
              <div className="h-px w-40 bg-primary/30 mx-auto mt-4"></div>
            </motion.div>
          </div>

          <ScrollArea className="w-full h-[500px] px-4 md:px-10 relative">
            {/* Decorative elements */}
            <motion.div 
              className="absolute -left-10 top-1/2 w-20 h-1 bg-primary/10"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            ></motion.div>
            
            <motion.div 
              className="absolute -right-10 top-1/3 w-20 h-1 bg-primary/10"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            ></motion.div>
            
            <div className="grid md:grid-cols-3 gap-14" ref={valuesRef}>
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.3 }}
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover={{ y: -15 }}
                  className="group"
                >
                  <Card className="bg-background/70 backdrop-blur-md border-primary/20 h-full transform transition-all duration-700 group-hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] overflow-hidden rounded-sm">
                    {/* Fancy gradient effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
                      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    </div>
                    
                    <CardContent className="p-12 text-center relative z-10">
                      {/* Floating icon with animation */}
                      <motion.div 
                        className="mb-8 flex justify-center relative"
                        whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 1.2 }}
                      >
                        <div className="w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                          <span className="text-4xl text-primary">{value.icon}</span>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                      </motion.div>
                      
                      <h4 className="font-primary text-2xl md:text-3xl font-medium text-primary mb-6 tracking-wider relative inline-block">
                        {value.title}
                        <motion.div 
                          className="absolute -bottom-2 left-0 right-0 h-[1px] bg-primary/30"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                        ></motion.div>
                      </h4>
                      
                      <p className="font-secondary text-base md:text-lg font-light text-foreground leading-relaxed">
                        {value.description}
                      </p>
                      
                      {/* Animated bottom line */}
                      <motion.div 
                        className="absolute bottom-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 + index * 0.2 }}
                      ></motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Brand Story with advanced design and perfume image */}
        <motion.div 
          ref={storyRef}
          className="mt-32 mb-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Decorative image display */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <motion.div
                className="relative p-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {/* Elegant border frame */}
                <div className="absolute top-0 left-0 w-1/3 h-1/3 border-t-2 border-l-2 border-primary/20"></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 border-b-2 border-r-2 border-primary/20"></div>
                
                <div className="max-w-xl">
                  <h3 className="font-primary text-3xl md:text-4xl font-semibold text-primary mb-8 tracking-wide">
                    NUESTRA ESENCIA
                  </h3>
                  
                  <motion.p 
                    className="font-secondary text-xl font-light text-foreground leading-relaxed mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    Aplicar una esencia es también un <span className="italic text-primary/80">acto de presencia</span>. 
                    Una forma sutil de decir "estoy acá", de ser fiel a lo que somos y permitir 
                    que los demás lo intuyan.
                  </motion.p>
                  
                  <motion.div
                    className="relative inline-block"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/90 to-primary/70 blur-sm opacity-20"></div>
                    <p className="font-primary text-2xl md:text-3xl font-medium text-primary relative tracking-wider py-2 px-4 border-l-2 border-primary/30">
                      Elegancia que perdura en el tiempo
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="order-1 md:order-2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {/* Image with decorative elements */}
              <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <img 
                  src="/fondo3.jpg" 
                  alt="Perfume NUVÓ" 
                  className="w-full h-full object-cover object-center rounded-sm shadow-lg"
                />
                
                {/* Elegant overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                
                {/* Decorative elements */}
                <motion.div 
                  className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-sm"
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: 45 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  viewport={{ once: true }}
                ></motion.div>
                
                <motion.div 
                  className="absolute bottom-10 left-10 w-16 h-16 border border-white/20 rounded-sm"
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: -30 }}
                  transition={{ duration: 1, delay: 1 }}
                  viewport={{ once: true }}
                ></motion.div>
                
                {/* Elegant caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-6 text-center">
                  <p className="font-primary text-lg text-primary/90 tracking-widest">NUVÓ ESSENCE</p>
                  <div className="h-px w-16 bg-primary/40 mx-auto mt-2"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;