import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, ExternalLink, Instagram, Clock, Calendar, Heart, ChevronRight, Check, AlertCircle } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import gsap from "@/lib/gsap-config";
import { saveEmail } from "@/lib/firestore";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  
  // Estados para manejo de formulario de email
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Animation setup
  useEffect(() => {
    if (!sectionRef.current) return;

    const setupAnimations = () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom bottom",
          toggleActions: "play none none reverse"
        }
      });

      // Animate heading letters if ref exists
      if (headingRef.current) {
        const text = headingRef.current.innerText;
        headingRef.current.innerHTML = "";
        
        [...text].forEach(char => {
          const span = document.createElement("span");
          span.textContent = char === " " ? "\u00A0" : char;
          span.style.opacity = "0";
          span.style.display = "inline-block";
          span.style.transform = "translateY(20px)";
          headingRef.current?.appendChild(span);
        });
        
        tl.to(headingRef.current.children, {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          ease: "power3.out",
          duration: 0.8
        });
      }
      
      // Animate contact cards
      if (contactRef.current) {
        tl.fromTo(
          contactRef.current.children,
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            stagger: 0.15, 
            ease: "power3.out", 
            duration: 0.8 
          },
          "-=0.2"
        );
      }
    };
    
    setupAnimations();
  }, []);

  const contactInfo = [
    {
      icon: Instagram,
      title: "Instagram",
      content: "@nuvoparfumiere",
      description: "Síguenos para novedades",
      gradient: "from-pink-400 to-purple-400",
      action: "Ver perfil",
      link: "https://www.instagram.com/nuvoparfumiere/"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      content: "+54 387 221-8029",
      description: "De 9.30 a 13 y de 15 a 21",
      gradient: "from-violet-400 to-indigo-500",
      action: "Enviar mensaje",
      link: "https://wa.me/5493872218029"
    },
    {
      icon: MapPin,
      title: "Ubicación",
      content: "Avenida san Martín 3430, Vaqueros",
      description: "Visitas con previa reserva",
      gradient: "from-teal-400 to-emerald-500",
      action: "Ver en mapa",
      link: "https://maps.app.goo.gl/S45kEwLyta7EFFSp8"
    },
    {
      icon: Clock,
      title: "Horarios",
      content: "9:30 - 13:00 y 15:00 - 21:00",
      description: "De Lunes a Sábados",
      gradient: "from-amber-400 to-orange-500",
      action: "Ver calendario",
      link: "#agenda"
    }
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      link: "https://www.instagram.com/nuvoparfumiere/profilecard/?igsh=ZGw2NjVkd2h2djRq",
      color: "hover:text-pink-500"
    },
    {
      name: "Email",
      icon: Mail,
      link: "mailto:Nuvonicheparfum@gmail.com",
      color: "hover:text-blue-500"
    }
  ];

  // Define animations directamente en los componentes en lugar de usar variantes

  const handleSubscribe = async () => {
    if (emailRef.current?.value) {
      const email = emailRef.current.value.trim();
      console.log("Intentando registrar email:", email);
      
      // Validar el formato del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setAlert({ type: 'error', message: 'Por favor, introduce un email válido.' });
        return;
      }
      
      setIsSubmitting(true);
      setAlert(null);
      
      try {
        console.log("Llamando a saveEmail...");
        const result = await saveEmail(email);
        console.log("Email guardado exitosamente:", result);
        setAlert({ type: 'success', message: '¡Gracias por suscribirte! Te mantendremos informado de todas nuestras novedades.' });
        emailRef.current.value = '';
      } catch (error: any) {
        console.error("Error al guardar email:", error);
        setAlert({ 
          type: 'error', 
          message: error.message || 'Ha ocurrido un error al suscribirte. Inténtalo de nuevo más tarde.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section ref={sectionRef} id="contacto" className="py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute left-0 top-20 w-72 h-72 rounded-full bg-rose-gold/5 blur-3xl"></div>
        <div className="absolute right-0 bottom-20 w-96 h-96 rounded-full bg-rose-gold/5 blur-3xl"></div>
        <div className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full bg-rose-gold/5 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with animated text */}
        <div className="text-center mb-16">
          <div className="inline-block relative mb-8">
            <div className="h-px w-20 bg-primary absolute -top-4 left-1/2 -translate-x-1/2"></div>
            <h2 ref={headingRef} className="font-primary text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
              Contacto
            </h2>
            <div className="h-px w-20 bg-primary absolute -bottom-4 left-1/2 -translate-x-1/2"></div>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-secondary text-lg md:text-xl font-light text-muted-foreground max-w-3xl mx-auto"
          >
            Estamos aquí para acompañarte en tu búsqueda de la esencia perfecta
          </motion.p>
        </div>

        {/* Contact Cards - Advanced Design */}
        <div ref={contactRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              whileHover={{ y: -8 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.1
              }}
              className="group"
            >
              <a 
                href={info.link}
                className="block h-full"
                target={info.link.startsWith('http') ? "_blank" : "_self"}
                rel="noopener noreferrer"
              >
                <Card className="bg-background/80 backdrop-blur-lg border-primary/10 overflow-hidden h-full transition-all duration-500 group-hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                  
                  <CardContent className="p-8 relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <h4 className="font-primary text-xl font-medium text-primary mb-2">
                        {info.title}
                      </h4>
                      
                      <p className="font-secondary text-lg text-foreground mb-2">
                        {info.content}
                      </p>
                      
                      <p className="font-secondary text-sm text-muted-foreground mb-6">
                        {info.description}
                      </p>
                      
                      <div className="mt-auto pt-4 flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium mr-2">{info.action}</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
        
        {/* Newsletter and Social Links */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-3xl mx-auto bg-background/90 backdrop-blur-lg border border-primary/10 rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <h3 className="font-primary text-2xl md:text-3xl font-semibold text-primary mb-4">
                Mantengámonos en contacto
              </h3>
              <p className="font-secondary text-base text-muted-foreground mb-6">
                Recibe actualizaciones exclusivas, novedades y eventos especiales directamente en tu bandeja de entrada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  ref={emailRef}
                  type="email"
                  placeholder="tu@email.com"
                  className="font-secondary"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubscribe();
                    }
                  }}
                />
                <Button 
                  onClick={handleSubscribe}
                  className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white font-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Suscribirme
                    </>
                  )}
                </Button>
              </div>
              
              {alert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="bg-transparent">
                    {alert.type === 'success' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="font-secondary">Prometemos no enviarte spam.</span>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center">
                <h4 className="font-primary text-lg font-medium text-primary mb-4">Síguenos</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full bg-background border border-primary/20 flex items-center justify-center ${social.color} transition-colors`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;