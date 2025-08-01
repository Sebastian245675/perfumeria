import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Efecto para asegurar que la página se muestra correctamente
  useEffect(() => {
    // Asegurarse de que la página comienza desde arriba
    window.scrollTo(0, 0);
    
    // Forzar un reflow para solucionar problemas de renderizado
    const handlePageFullyLoaded = () => {
      // Asegurar que el body tiene el estilo correcto
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      
      // Trigger resize para forzar recálculo de elementos
      window.dispatchEvent(new Event('resize'));
    };
    
    // Ejecutar después de un breve retraso para asegurar que todos los elementos estén renderizados
    setTimeout(handlePageFullyLoaded, 50);
    
    return () => {
      // Limpieza si es necesario
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full m-0 p-0 overflow-x-hidden"
      style={{ width: '100vw', margin: 0, padding: 0, maxWidth: '100%', overflowX: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
