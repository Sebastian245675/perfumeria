// src/lib/navigation-utils.ts
import { useLocation } from 'react-router-dom';

/**
 * Función para determinar si un enlace de navegación debería dirigirse a la página principal
 * o simplemente usar anclas dentro de la misma página
 * 
 * @param href El enlace original (con formato #seccion)
 * @returns El enlace adecuado basado en la ubicación actual
 */
export const getNavigationLink = (href: string): string => {
  // Si el enlace no comienza con #, es una ruta absoluta y se devuelve como está
  if (!href.startsWith('#')) {
    return href;
  }
  
  // Obtener la ruta actual
  const currentPath = window.location.pathname;
  
  // Si estamos en la página principal, usamos el ancla directamente
  if (currentPath === '/') {
    return href;
  }
  
  // Si estamos en otra página, redirigimos a la página principal con el ancla
  return `/${href}`;
};

/**
 * Hook personalizado para obtener un enlace apropiado basado en la ubicación actual
 */
export const useNavigationLink = () => {
  const location = useLocation();
  
  return (href: string): string => {
    if (!href.startsWith('#')) {
      return href;
    }
    
    return location.pathname === '/' ? href : `/${href}`;
  };
};
