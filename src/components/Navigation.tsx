import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, LogIn, UserPlus, User, LogOut } from "lucide-react";
import { motion, AnimatePresence, Variant } from "framer-motion";
import AuthDialog from "./AuthDialog";
import { useAuth } from "@/lib/AuthContext";
import { logoutUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"login" | "register">("login");
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { name: "Inicio", href: "#inicio" },
    { name: "Productos", href: "#productos" },
    { name: "Cata", href: "#cata" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "Contacto", href: "#contacto" },
    { name: "Agenda", href: "#agenda" }
  ];

  const pageLinks = [
    { name: "Quiénes Somos", href: "/nosotros" }
  ];

  // Handle scroll transparency effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Update active section based on scroll position
      navItems.forEach(item => {
        const section = document.querySelector(item.href);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(item.href.replace('#', ''));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setAuthDialogTab("login");
    setAuthDialogOpen(true);
  };

  const handleRegister = () => {
    // Redirigir al login que ahora también incluye la opción de registro
    handleLogin();
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente"
        });
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No pudimos cerrar tu sesión",
        variant: "destructive"
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
      height: 0
    } as Variant,
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: {
        staggerChildren: 0.05
      }
    } as Variant
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-md border-b border-border/40 py-3' 
        : 'md:bg-black/30 md:backdrop-blur-sm bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a href="#inicio" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="NUVÓ Essence Ritual" 
              className="h-14 md:h-16" 
            />
          </a>
        </motion.div>

        {/* Desktop navigation */}
        <motion.div 
          className="hidden md:flex items-center gap-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Nav links */}
          <div className="flex items-center gap-6">
            {/* Inicio (Home) link first */}
            <motion.a
              key="#inicio"
              href="#inicio"
              className={`relative font-secondary text-sm transition-colors duration-300 hover:text-rose-gold ${
                activeSection === 'inicio' 
                  ? 'text-rose-gold' 
                  : scrolled ? 'text-foreground' : 'text-ivory-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Inicio
              {activeSection === 'inicio' && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-gold rounded-full"
                  layoutId="activeNavSection"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.a>
            
            {/* Page links (for separate pages) - after Inicio */}
            {pageLinks.map(item => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`relative font-secondary text-sm transition-colors duration-300 hover:text-rose-gold ${
                  window.location.pathname === item.href 
                    ? 'text-rose-gold' 
                    : scrolled ? 'text-foreground' : 'text-ivory-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.name}
                {window.location.pathname === item.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-gold rounded-full"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
            
            {/* Rest of section links (excluding Inicio which is already at the top) */}
            {navItems.filter(item => item.href !== "#inicio").map(item => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`relative font-secondary text-sm transition-colors duration-300 hover:text-rose-gold ${isActive ? 'text-rose-gold' : scrolled ? 'text-foreground' : 'text-ivory-white'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-gold rounded-full"
                      layoutId="activeNavSection"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              );
            })}
          </div>

          {/* Auth buttons - desktop */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-rose-gold/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-rose-gold" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-white">
                    {userData?.name?.split(' ')[0] || 'Usuario'}
                  </span>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="font-secondary text-xs bg-rose-gold/90 hover:bg-rose-gold text-white ml-1"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Mi Cuenta
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleLogout}
                  className={`ml-1 ${!scrolled && 'border-white/30 text-white hover:bg-white/10 hover:text-white'}`}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant={scrolled ? "outline" : "ghost"} 
                onClick={handleLogin}
                className={`font-secondary text-sm rounded-full px-4 border border-rose-gold/30 ${
                  !scrolled ? 'md:bg-black/20 md:backdrop-blur-sm text-white hover:bg-black/40 hover:border-rose-gold/50' : 
                  'bg-background hover:bg-background/80 text-rose-gold hover:text-rose-gold/80'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M12 14.5V16.5M7 10.5V8.5C7 6.5 9 4.5 12 4.5C15 4.5 17 6.5 17 8.5V10.5M5 10.5H19C19.5523 10.5 20 10.9477 20 11.5V18.5C20 19.0523 19.5523 19.5 19 19.5H5C4.44772 19.5 4 19.0523 4 18.5V11.5C4 10.9477 4.44772 10.5 5 10.5Z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </motion.div>

        {/* Mobile menu button */}
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant={scrolled ? "outline" : "ghost"}
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-full ${
              !scrolled 
                ? 'md:bg-black/20 md:backdrop-blur-sm md:border md:border-white/20 text-white hover:bg-black/40' 
                : 'border-rose-gold/30 text-rose-gold hover:border-rose-gold/50'
            }`}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col">
                {/* Inicio (Home) link first in mobile menu */}
                <motion.a
                  key="#inicio-mobile"
                  href="#inicio"
                  onClick={() => setIsOpen(false)}
                  variants={itemVariants}
                  className={`flex items-center justify-between py-3 px-2 font-secondary hover:bg-muted/50 rounded-lg ${activeSection === 'inicio' ? 'text-primary' : 'text-foreground'}`}
                >
                  <span>Inicio</span>
                  {activeSection === 'inicio' && (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </motion.a>
                
                {/* Mobile page links - after Inicio */}
                {pageLinks.map(item => {
                  const isActive = window.location.pathname === item.href;
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      variants={itemVariants}
                      className={`flex items-center justify-between py-3 px-2 font-secondary hover:bg-muted/50 rounded-lg ${isActive ? 'text-primary' : 'text-foreground'}`}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </motion.div>
                      )}
                    </motion.a>
                  );
                })}
                
                {/* Rest of mobile nav links (excluding Inicio which is already at the top) */}
                {navItems.filter(item => item.href !== "#inicio").map(item => {
                  const isActive = activeSection === item.href.replace('#', '');
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      variants={itemVariants}
                      className={`flex items-center justify-between py-3 px-2 font-secondary hover:bg-muted/50 rounded-lg ${isActive ? 'text-primary' : 'text-foreground'}`}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </motion.div>
                      )}
                    </motion.a>
                  );
                })}
                
                {/* Mobile Auth Buttons */}
                <div className="mt-4 pt-4 border-t border-border/30 flex flex-col gap-3">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-rose-gold/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-rose-gold" />
                        </div>
                        <span className="font-secondary text-sm text-foreground">
                          {userData?.name || 'Usuario'}
                        </span>
                      </div>
                      <motion.div variants={itemVariants}>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => window.location.href = '/dashboard'}
                          className="font-secondary text-xs w-full mb-2 bg-rose-gold/90 hover:bg-rose-gold text-white"
                        >
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          Mi Cuenta
                        </Button>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogout}
                          className="font-secondary text-xs w-full"
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1.5" />
                          Cerrar Sesión
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={itemVariants}>
                      <Button 
                        variant="default" 
                        onClick={handleLogin}
                        className="font-secondary text-sm justify-start w-full bg-rose-gold/80 hover:bg-rose-gold text-white"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                          <path d="M12 14.5V16.5M7 10.5V8.5C7 6.5 9 4.5 12 4.5C15 4.5 17 6.5 17 8.5V10.5M5 10.5H19C19.5523 10.5 20 10.9477 20 11.5V18.5C20 19.0523 19.5523 19.5 19 19.5H5C4.44772 19.5 4 19.0523 4 18.5V11.5C4 10.9477 4.44772 10.5 5 10.5Z" 
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Iniciar Sesión / Registrarse
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        defaultTab={authDialogTab}
      />
    </header>
  );
};

export default Navigation;
