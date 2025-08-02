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
    // Hide overflow during loading
    document.body.style.overflow = 'hidden';
    
    // Preload only essential images, reduced list for better performance
    const preloadImages = [
      "/logo.png",
      "/logocarga.png"
    ];

    const imagePromises = preloadImages.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        // Don't reject on error, just continue loading
        img.onerror = resolve;
      });
    });

    // Set a maximum loading time to ensure the app loads even if images don't
    const timeoutPromise = new Promise(resolve => {
      setTimeout(resolve, 2000); // 2 seconds maximum loading time
    });

    // Use race to proceed with either images loaded or timeout reached
    Promise.race([Promise.all(imagePromises), timeoutPromise])
      .finally(() => {
        // Don't need additional timeout
      });
  }, []);

  const handleLoadingComplete = () => {
    // Show content immediately
    setContentVisible(true);
    
    // Remove loading screen with minimal delay
    setTimeout(() => {
      setIsLoading(false);
      // Restore scroll behavior
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      // Scroll to top
      window.scrollTo(0, 0);
    }, 300); // Reduced delay for faster transition
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
