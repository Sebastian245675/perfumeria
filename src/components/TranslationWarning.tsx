import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

const TranslationWarning = () => {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Verificamos si la página ha sido traducida automáticamente
    const checkTranslation = () => {
      // Verificar si el usuario ha descartado manualmente la alerta
      const hasDisabledWarning = sessionStorage.getItem('translation-warning-dismissed') === 'true';
      if (hasDisabledWarning) {
        return;
      }
      
      // Método 1: Verificar meta tags añadidos por Google Translate
      const googleTranslateMeta = document.querySelector('meta[name="google-translate-translation"]');
      
      // Método 2: Verificar atributos de Google Translate en el html
      const htmlEl = document.documentElement;
      const isGoogleTranslated = htmlEl.getAttribute('translated') === 'true' || 
                                htmlEl.getAttribute('google-translate-translated') === 'true';
      
      // Método 3: Verificar cambios estructurales típicos de la traducción
      const hasTranslationSpans = document.querySelectorAll('font[style*="vertical-align"]').length > 0;
      
      // Método 4: Verificar si hay iframes de traducción
      const hasTranslationIframe = document.querySelectorAll('iframe[src*="translate"]').length > 0;
      
      // Método 5: Verificar cambios en el DOM que típicamente hace el traductor
      const translationMarkers = document.querySelectorAll(
        '[x-webkit-grammar], [translate="no"], .skiptranslate, #google_translate_element'
      ).length > 0;
      
      // Método 6: Verificar cambios en las etiquetas de selección (común en traducciones)
      const selectsWithChangedText = document.querySelectorAll('select option[translated]').length > 0;
      
      // Si detectamos traducción, mostrar la alerta
      const translationDetected = googleTranslateMeta || isGoogleTranslated || hasTranslationSpans || 
                                  hasTranslationIframe || translationMarkers || selectsWithChangedText;
                                  
      if (translationDetected) {
        setIsTranslated(true);
        // Mostrar la alerta con un pequeño retraso para asegurar que el usuario la vea
        setTimeout(() => {
          setIsVisible(true);
        }, 500);
      }
    };
    
    // Ejecutar la comprobación después de que la página termine de cargarse
    setTimeout(checkTranslation, 2000);
    
    // También comprobar cuando cambia el DOM (puede indicar que se activó la traducción)
    const observer = new MutationObserver((mutations) => {
      const translationRelatedChange = mutations.some(mutation => 
        mutation.type === 'attributes' && 
        (mutation.attributeName === 'translated' || 
         mutation.attributeName === 'lang' ||
         mutation.target.nodeName === 'FONT')
      );
      
      if (translationRelatedChange) {
        checkTranslation();
      }
    });
    
    // Añadir evento para cerrar con la tecla Escape
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible && !isDismissed) {
        dismissWarning();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      childList: true, 
      subtree: true 
    });
    
    // Limpiar cuando el componente se desmonta
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, isDismissed]);
  
  // Si el usuario descarta la alerta, guardamos esa información solo para esta sesión
  const dismissWarning = () => {
    setIsVisible(false);
    
    // Después de la animación de salida, actualizar el estado
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('translation-warning-dismissed', 'true');
    }, 300);
  };
  
  if (!isTranslated || isDismissed) {
    return null;
  }
  
  return (
    <div 
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-[95%] shadow-lg translation-warning-container
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transition: 'opacity 0.3s ease-out, transform 0.4s ease-out' }}
      onClick={(e) => e.stopPropagation()} // Evitar que los clicks se propaguen
      role="alert"
      aria-live="assertive"
    >
      <Alert variant="destructive" className="relative bg-black/90 text-white border border-destructive/30 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <AlertTitle className="text-white font-medium mb-2 text-base sm:text-lg">Traductor automático detectado</AlertTitle>
            <AlertDescription className="text-white/90 text-sm sm:text-base">
              El uso del traductor automático puede causar problemas con el formulario.
              Por favor, desactívelo para una mejor experiencia.
            </AlertDescription>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissWarning(); }}
            className="ml-4 flex-shrink-0 p-2 rounded-full bg-destructive/30 hover:bg-destructive transition-colors duration-200"
            aria-label="Cerrar alerta"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
        
        <div className="mt-3 flex justify-end">
          <button 
            onClick={dismissWarning}
            className="bg-white text-destructive font-medium text-sm py-1.5 px-3 rounded hover:bg-gray-100 transition-colors"
          >
            Entendido
          </button>
        </div>
      </Alert>
    </div>
  );
};

export default TranslationWarning;
