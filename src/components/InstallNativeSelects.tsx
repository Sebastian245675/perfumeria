// InstallNativeSelects.tsx - Componente para instalar los selectores nativos a nivel global

import { useEffect } from 'react';

/**
 * Función para instalar los selectores nativos en la aplicación
 * Se debe llamar desde el componente App para que se aplique a toda la aplicación
 */
export const installNativeSelects = (): void => {
  useEffect(() => {
    // Detectar si estamos en un dispositivo móvil
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log("InstallNativeSelects: Detectando dispositivo móvil", { isMobileDevice });
    
    // Prevenir traducciones automáticas en toda la aplicación
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
    document.body.setAttribute('translate', 'no');
    document.body.classList.add('notranslate');
    
    // Aplicar atributos para prevenir traducción a elementos críticos
    const preventTranslation = () => {
      const criticalElements = document.querySelectorAll('select, .select-trigger, .select-content, select option, .native-mobile-select, input, textarea, button, label, form, [role="combobox"], [role="option"]');
      criticalElements.forEach(el => {
        el.setAttribute('translate', 'no');
        el.classList.add('notranslate');
      });
      
      // Añadir estilos específicos para corregir visualización de elementos traducidos
      const style = document.createElement('style');
      style.textContent = `
        select, .select-trigger, .select-content, option {
          translate: no !important;
          -webkit-translate: no !important;
          font-family: system-ui, sans-serif !important;
          font-size: 16px !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Aplicar prevención de traducción inmediatamente y después de la carga completa
    preventTranslation();
    window.addEventListener('load', preventTranslation);
    
    if (isMobileDevice) {
      console.log("Instalando fixes para selectores en dispositivos móviles");
      
      // Aplicar clase al body para identificar dispositivos móviles
      document.body.classList.add('mobile-device');
      document.body.classList.add('mobile-optimized');
      
      // Si es un dispositivo Android, aplicar clase específica
      if (/Android/i.test(navigator.userAgent)) {
        document.body.classList.add('android-device');
        // Especialmente para Chrome en Android
        if (/Chrome/i.test(navigator.userAgent)) {
          document.body.classList.add('chrome-android');
        }
      }
      
      // Si es un dispositivo iOS, aplicar clase específica
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.classList.add('ios-device');
        // Especialmente para Safari en iOS
        if (/Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
          document.body.classList.add('safari-ios');
        }
      }
      
      // Listener global para cerrar selectores al tocar fuera
      document.addEventListener('touchstart', (e) => {
        const target = e.target as HTMLElement;
        
        // Si tocamos fuera de un select, cerrar todos los selectores
        if (!target.closest('.native-select-container') && !target.closest('.native-mobile-select')) {
          // Eliminar clase de select abierto
          document.body.classList.remove('select-open');
          
          // Restaurar el comportamiento táctil normal
          document.body.style.touchAction = 'auto';
        }
      });
      
      // Prevenir problemas con scroll en selectores nativos
      const fixSelectScroll = () => {
        const openSelects = document.querySelectorAll('.select-open');
        if (openSelects.length > 0) {
          // Prevenir scroll mientras un select está abierto
          document.body.style.overflow = 'hidden';
        } else {
          // Restaurar scroll cuando no hay selects abiertos
          document.body.style.overflow = 'auto';
        }
      };
      
      // Observar cambios en la clase select-open del body
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            fixSelectScroll();
          }
        });
      });
      
      observer.observe(document.body, { attributes: true });
      
      // Mejorar la apariencia de inputs numéricos en móviles
      setTimeout(() => {
        // Aplicar mejoras a todos los inputs numéricos y telefónicos
        const numericInputs = document.querySelectorAll('input[type="number"], input[type="tel"]');
        numericInputs.forEach(input => {
          input.classList.add('mobile-numeric-input');
          // Asegurar que el tamaño de fuente es suficiente para evitar zoom en iOS
          (input as HTMLElement).style.fontSize = '16px';
          // Alinear números para mejor legibilidad
          (input as HTMLElement).style.fontFeatureSettings = '"tnum"';
          (input as HTMLElement).style.fontVariantNumeric = 'tabular-nums';
        });
        
        // Mejorar el aspecto de todos los selects nativos
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          select.classList.add('mobile-optimized-select');
          // Asegurar que el tamaño de fuente es suficiente
          (select as HTMLElement).style.fontSize = '16px';
          // Mayor área táctil
          (select as HTMLElement).style.minHeight = '42px';
        });
        
        console.log('Optimización móvil completa: inputs numéricos y selectores mejorados');
      }, 500); // Pequeño retraso para asegurar que el DOM está listo
    }
  }, []);
}

// Componente que aplica los selectores nativos
const InstallNativeSelects = () => {
  installNativeSelects();
  return null;
};

export default InstallNativeSelects;
