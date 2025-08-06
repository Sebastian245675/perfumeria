import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Quote, User, Heart, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import gsap from "gsap";
import { useAuth } from "@/lib/AuthContext";
import { addTestimonial, getTestimonials } from "@/lib/firebase";

const Testimonials = () => {
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
    fragrance: "Esencia Minimalista",
    profession: ""
  });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonialHover, setTestimonialHover] = useState<number | null>(null);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentUser, userData } = useAuth();
  
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();

  const testimonials = [
    {
      name: "Marina S.",
      comment: "NUVÓ cambió completamente mi relación con los perfumes. Encontré una esencia que realmente me representa, no solo me gusta. La experiencia de selección fue tan íntima y personal que ahora entiendo que el perfume es mucho más que un aroma.",
      rating: 5,
      fragrance: "Esencia Minimalista",
      profession: "Diseñadora de Interiores"
    },
    {
      name: "Alejandro R.",
      comment: "El asesoramiento fue una experiencia increíble. Nunca pensé que un perfume pudiera evocar tantos recuerdos y emociones. El proceso me permitió conectar con mis sensaciones más auténticas, y ahora cada vez que uso mi esencia, revivo esa conexión.",
      rating: 5,
      fragrance: "Elegancia Atemporal",
      profession: "Arquitecto"
    },
    {
      name: "Sofia L.",
      comment: "La sutileza de estas fragancias es única. Es exactamente lo que buscaba: elegancia sin ostentación. Cada nota se despliega con el tiempo y te permite descubrir nuevas facetas del aroma a lo largo del día. Verdaderamente atemporal.",
      rating: 5,
      fragrance: "Ritual Íntimo",
      profession: "Fotógrafa"
    },
    {
      name: "Carlos M.",
      comment: "Después de años buscando una fragancia que me representara, NUVÓ me dio exactamente lo que necesitaba. No es solo un perfume, es una extensión de mi personalidad, sutil pero presente, exactamente como quería sentirme.",
      rating: 4,
      fragrance: "Esencia Minimalista",
      profession: "Músico"
    },
    {
      name: "Elena T.",
      comment: "El servicio personalizado y la dedicación por entender qué buscaba realmente me impresionaron. El resultado fue una fragancia que se adapta perfectamente a mi estilo de vida y personalidad. Una experiencia transformadora.",
      rating: 5,
      fragrance: "Ritual Íntimo",
      profession: "Editora"
    }
  ];

  // Cargar testimonios desde Firebase
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const { testimonials, error } = await getTestimonials();
        if (error) {
          console.error("Error al cargar testimonios:", error);
          return;
        }
        
        if (testimonials && testimonials.length > 0) {
          // Ordenar por fecha de creación (más recientes primero)
          const sortedTestimonials = testimonials.sort((a: any, b: any) => {
            return new Date(b.createdAt?.toDate() || 0).getTime() - 
                   new Date(a.createdAt?.toDate() || 0).getTime();
          });
          
          setTestimonialsList(sortedTestimonials);
        }
      } catch (error) {
        console.error("Error al cargar testimonios:", error);
      }
    };

    loadTestimonials();
  }, []);

  // Pre-llenar el formulario con datos del usuario si está autenticado
  useEffect(() => {
    if (currentUser && userData) {
      setNewTestimonial(prev => ({
        ...prev,
        name: userData.name || "",
        email: currentUser.email || "",
        profession: userData.profession || ""
      }));
    }
  }, [currentUser, userData]);

  // Text animation with split text effect
  useEffect(() => {
    if (!headingRef.current) return;
    
    const textContent = headingRef.current.textContent || "";
    headingRef.current.innerHTML = "";
    
    // Create individual spans for each letter for animation
    [...textContent].forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.opacity = "0";
      span.style.display = "inline-block";
      span.style.transform = "translateY(20px)";
      headingRef.current?.appendChild(span);
    });

    if (isInView) {
      // Animate letters when in view
      const timeline = gsap.timeline();
      timeline.to(headingRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
      });
    }
  }, [isInView]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dejar un testimonio",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTestimonial.comment) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa tu comentario.",
        variant: "destructive"
      });
      return;
    }

    setSubmissionStatus('submitting');
    setLoading(true);

    try {
      const testimonialData = {
        name: userData?.name || newTestimonial.name,
        comment: newTestimonial.comment,
        rating: newTestimonial.rating,
        fragrance: newTestimonial.fragrance,
        profession: newTestimonial.profession || userData?.profession || "",
        createdAt: new Date()
      };

      const { id, error } = await addTestimonial(currentUser.uid, testimonialData);
      
      if (error) {
        setSubmissionStatus('error');
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return;
      }
      
      setSubmissionStatus('success');
      toast({
        title: "¡Gracias por tu testimonio!",
        description: "Tu opinión será revisada y publicada pronto.",
      });

      // Actualizar el listado de testimonios
      setTestimonialsList([{ 
        id, 
        userId: currentUser.uid, 
        ...testimonialData
      }, ...testimonialsList]);

      setNewTestimonial({
        name: userData?.name || "",
        email: currentUser?.email || "",
        rating: 5,
        comment: "",
        fragrance: "Esencia Minimalista",
        profession: userData?.profession || ""
      });
    } catch (error: any) {
      setSubmissionStatus('error');
      toast({
        title: "Error al enviar el testimonio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const nextTestimonial = () => {
    const testimonialsArray = testimonialsList.length > 0 ? testimonialsList : testimonials;
    setActiveTestimonial((prev) => (prev + 1) % testimonialsArray.length);
  };

  const prevTestimonial = () => {
    const testimonialsArray = testimonialsList.length > 0 ? testimonialsList : testimonials;
    setActiveTestimonial((prev) => (prev - 1 + testimonialsArray.length) % testimonialsArray.length);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.5 }
    })
  };

  return (
    <section 
      id="testimonios" 
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-subtle to-background relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary"></div>
          <h2 
            ref={headingRef}
            className="font-primary text-5xl md:text-6xl font-bold text-primary mt-8 mb-8"
          >
            Testimonios
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-secondary text-xl md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto"
          >
            Las experiencias de quienes han encontrado su esencia única con NUVÓ
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="mb-24 relative">
          <motion.div
            className="flex justify-center items-center"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <div className="relative w-full max-w-4xl mx-auto">
              {/* Navigation Buttons for Desktop */}
              {!isMobile && (
                <>
                  <motion.button 
                    onClick={prevTestimonial}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-8 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-6 h-6 text-primary" />
                  </motion.button>
                  <motion.button 
                    onClick={nextTestimonial}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-8 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-6 h-6 text-primary" />
                  </motion.button>
                </>
              )}

              {/* Carousel */}
              <AnimatePresence initial={false} custom={activeTestimonial}>
                <motion.div
                  key={activeTestimonial}
                  custom={activeTestimonial}
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  <Card className="bg-background/60 backdrop-blur-md border-primary/10 overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <CardContent className="p-10">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3 flex flex-col items-center text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Quote className="w-8 h-8 text-primary" />
                          </div>
                          <div className="mb-2">
                            {renderStars((testimonialsList[activeTestimonial] || testimonials[activeTestimonial])?.rating || 5)}
                          </div>
                          <div className="font-secondary text-lg font-medium text-primary mb-1">
                            {(testimonialsList[activeTestimonial] || testimonials[activeTestimonial])?.name || 'Usuario'}
                          </div>
                          <div className="font-secondary text-sm text-muted-foreground mb-2">
                            {(testimonialsList[activeTestimonial] || testimonials[activeTestimonial])?.profession || ''}
                          </div>
                          <div className="text-xs font-light text-muted-foreground italic">
                            {(testimonialsList[activeTestimonial] || testimonials[activeTestimonial])?.fragrance || ''}
                          </div>
                        </div>
                        
                        <div className="md:w-2/3 flex items-center">
                          <p className="font-secondary text-lg text-foreground leading-relaxed italic">
                            "{(testimonialsList[activeTestimonial] || testimonials[activeTestimonial])?.comment || ''}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Dots Navigation */}
              <div className="flex justify-center mt-6 space-x-2">
                {(testimonialsList.length > 0 ? testimonialsList : testimonials).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeTestimonial === index 
                        ? 'bg-primary w-6' 
                        : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Small Testimonial Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-20"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {(testimonialsList.length > 0 ? testimonialsList : testimonials).slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              animate={{ y: -10 }}
              className="hover:scale-102"
              transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 20 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-xl transition-all duration-500 h-full overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-100 origin-left"></div>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Quote className="w-6 h-6 text-primary transition-colors duration-300 mr-3" />
                    <div className="flex-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <p className="font-secondary text-sm text-foreground mb-6 leading-relaxed italic line-clamp-4 p-3 rounded-lg border-l-2 border-primary/30 shadow-sm bg-white/50">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t border-border/40 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-secondary text-sm font-medium text-primary">
                            {testimonial.name}
                          </div>
                          <div className="font-secondary text-xs text-muted-foreground">
                            {testimonial.profession}
                          </div>
                        </div>
                      </div>
                      <span className="font-secondary text-xs text-muted-foreground italic">
                        {testimonial.fragrance}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Testimonial Form */}
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[url('/src/assets/essence-abstract.jpg')] bg-cover bg-center opacity-5"></div>
            <CardContent className="p-10 relative z-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-primary text-3xl font-semibold text-primary mb-3">
                  Comparte tu Experiencia
                </h3>
                <p className="font-secondary text-base text-muted-foreground max-w-md mx-auto">
                  Tu opinión nos ayuda a seguir creando experiencias únicas y personalizadas
                </p>
              </div>

              {!currentUser ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-primary/50" />
                  </div>
                  <h4 className="font-primary text-xl font-medium text-primary mb-4">
                    Inicia sesión para dejar un testimonio
                  </h4>
                  <p className="font-secondary text-muted-foreground mb-6">
                    Valorizamos tus comentarios. Por favor inicia sesión o regístrate para compartir tu experiencia.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => {
                      document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
                      // Aquí deberíamos abrir el diálogo de login
                      // Como no tenemos acceso directo, simplemente hacemos scroll hacia arriba
                    }}>
                      Iniciar Sesión
                    </Button>
                    <Button variant="default" onClick={() => {
                      document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
                      // Aquí deberíamos abrir el diálogo de registro
                    }}>
                      Crear Cuenta
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTestimonial} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="font-secondary text-sm font-medium text-primary">
                        Nombre
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={userData?.name || newTestimonial.name}
                        disabled={!!userData?.name}
                        onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                        className="mt-2 font-secondary bg-background/60 backdrop-blur-sm border-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession" className="font-secondary text-sm font-medium text-primary">
                        Profesión (opcional)
                      </Label>
                      <Input
                        id="profession"
                        type="text"
                        placeholder="Tu profesión"
                        value={newTestimonial.profession}
                        onChange={(e) => setNewTestimonial({...newTestimonial, profession: e.target.value})}
                        className="mt-2 font-secondary bg-background/60 backdrop-blur-sm border-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="font-secondary text-sm font-medium text-primary">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={currentUser.email || newTestimonial.email}
                        disabled={true}
                        className="mt-2 font-secondary bg-background/60 backdrop-blur-sm border-primary/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fragrance" className="font-secondary text-sm font-medium text-primary">
                        Fragancia
                      </Label>
                      <select
                        id="fragrance"
                        value={newTestimonial.fragrance}
                        onChange={(e) => setNewTestimonial({...newTestimonial, fragrance: e.target.value})}
                        className="mt-2 font-secondary w-full h-10 px-3 py-2 bg-background/60 backdrop-blur-sm border-primary/20 rounded-md"
                      >
                        <option value="Esencia Minimalista">Esencia Minimalista</option>
                        <option value="Elegancia Atemporal">Elegancia Atemporal</option>
                        <option value="Ritual Íntimo">Ritual Íntimo</option>
                        <option value="Otra">Otra</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="font-secondary text-sm font-medium text-primary mb-2 block">
                      Calificación
                    </Label>
                    {renderStars(
                      newTestimonial.rating, 
                      true, 
                      (rating) => setNewTestimonial({...newTestimonial, rating})
                    )}
                  </div>

                  <div>
                    <Label htmlFor="comment" className="font-secondary text-sm font-medium text-primary">
                      Tu experiencia *
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Cuéntanos sobre tu experiencia con NUVÓ..."
                      value={newTestimonial.comment}
                      onChange={(e) => setNewTestimonial({...newTestimonial, comment: e.target.value})}
                      className="mt-2 font-secondary min-h-[150px] bg-background/60 backdrop-blur-sm border-primary/20"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-secondary text-base py-6 bg-primary hover:bg-primary/90 group"
                    disabled={loading || submissionStatus === 'submitting'}
                  >
                    {loading || submissionStatus === 'submitting' ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <>
                        <span>Enviar Testimonio</span>
                        <motion.span
                          className="ml-2 inline-block"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          →
                        </motion.span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          <div className="text-center mt-6">
            <p className="font-secondary text-xs text-muted-foreground">
            
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
