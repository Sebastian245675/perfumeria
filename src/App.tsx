import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AboutUsPage from "./pages/AboutUsPage";
import ProposeFragrancePage from "./pages/ProposeFragrancePage";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import { AnimatePresence, motion } from "framer-motion";
import "./global-styles.css"; // Importamos los estilos globales personalizados

const queryClient = new QueryClient();

const App = () => {
  // Estado para controlar la carga y la visibilidad de la aplicación
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Aseguramos que la pantalla de carga se muestre primero
    document.body.style.overflow = 'hidden';
    
    // Precargar imágenes importantes para evitar parpadeos después de la pantalla de carga
    const preloadImages = [
      "/logo.png",
      "/logocarga.png",
      "/src/assets/hero-perfume.jpg",
      "/src/assets/essence-abstract.jpg",
      "/src/assets/perfume-collection.jpg",
      "/fondo1.jpg",
      "/fondo2.jpg",
      "/revista1.png",
      "/revista2.png",
      "/revista3.png",
      "/revistas-banner.jpg",
      "/products-banner.jpg",
      "/perfume1.jpg",
      "/perfume2.jpg",
      "/perfume3.jpg",
      "/perfume4.jpg",
    ];

    const imagePromises = preloadImages.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    // Esperar a que se carguen todas las imágenes importantes
    Promise.all(imagePromises)
      .catch((err) => console.error("Error precargando imágenes:", err))
      .finally(() => {
        // Marcar la aplicación como lista después de un tiempo mínimo
        // Mantenemos la pantalla de carga por al menos 3 segundos para asegurar una buena experiencia
        setTimeout(() => {
          // No hacemos nada aquí, dejamos que LoadingScreen controle cuando termina
        }, 3000);
      });
  }, []);

  const handleLoadingComplete = () => {
    // Cuando la animación de carga termina, permitimos que se muestre el contenido
    setContentVisible(true);
    
    // Luego de un breve retraso para la transición, quitamos la pantalla de carga
    setTimeout(() => {
      setIsLoading(false);
      // Asegurar que el scroll se restaura correctamente
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      // Forzar un reflow para evitar que la pantalla quede en blanco
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }, 600); // Reducir el tiempo para una transición más rápida
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Siempre mostramos la pantalla de carga primero */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          )}
        </AnimatePresence>

        {/* Contenido de la aplicación - solo visible después de la animación de carga */}
        <AnimatePresence>
          {contentVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full m-0 p-0 overflow-x-hidden"
              style={{ width: '100vw', margin: 0, padding: 0, maxWidth: '100%', overflowX: 'hidden' }}
            >
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/nosotros" element={<AboutUsPage />} />
                  <Route path="/proponer-fragancia" element={<ProposeFragrancePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
