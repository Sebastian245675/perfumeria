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
import { motion, AnimatePresence } from "framer-motion";
import "./global-styles.css"; // Importamos los estilos globales personalizados

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Asegurar que el body tiene los estilos correctos
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    document.body.classList.add('page-loaded');
    document.body.classList.remove('loading-active');
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
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
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
