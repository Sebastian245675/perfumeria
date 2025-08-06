import React, { useState, useEffect } from 'react';

// Interfaz para las propiedades del componente
interface NativeMobileSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  name: string;
  id: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

// Componente que muestra un select nativo en móviles y el select de Radix en desktop
const NativeMobileSelect: React.FC<NativeMobileSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  triggerClassName = '',
  onOpen,
  onClose
}) => {
  // Estado para controlar si estamos en un dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si estamos en un dispositivo móvil al montar el componente
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkIfMobile();
    
    // También verificar si cambia el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Manejar el cambio en el select nativo
  const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Renderizar el select nativo para móviles
  return (
    <div className={`mobile-select-wrapper ${className} ${isMobile ? 'block' : 'hidden'}`}>
      <label className={`native-select-container ${name}-container`}>
        <select
          id={`native-${id}`}
          name={name}
          value={value}
          onChange={handleNativeChange}
          className={`native-mobile-select native-select-${name}`}
          required={required}
          disabled={disabled}
          style={{textOverflow: 'ellipsis'}}
          data-fulltext="true"
          translate="no"
          data-no-translate="true"
        >
          <option value="" disabled hidden translate="no">{placeholder}</option>
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value} 
              title={option.label}
              translate="no"
              className="no-translate"
            >
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default NativeMobileSelect;
