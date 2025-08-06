import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

// Definir las familias olfativas con sus descripciones
const olfactoryData = [
  {
    name: "FLORAL",
    title: "Fragancias delicadas, románticas y muy femeninas",
    points: [
      "Por ser en general bouquet de flores, son orientadas a un target con personalidad flexible",
      "Pueden encarnar variadas personalidades"
    ]
  },
  {
    name: "FRUTAL",
    title: "Notas de frutas frescas y vibrantes",
    points: [
      "Duraznos, frutillas, ananá, melón, sandía, frutos rojos, ciruelas",
      "Son unisex o femeninos",
      "Personalidad alegre, vibrante, jovial"
    ]
  },
  {
    name: "FOUGÈRE",
    title: "Evocan ambiente de bosque, aromas húmedos y frescos",
    points: [
      "Notas de lavanda, musgo, maderas húmedas y bergamota",
      "Fragancias masculinas",
      "Personalidad muy tradicional",
      "Base de muchas colonias tradicionales"
    ]
  },
  {
    name: "CÍTRICO",
    title: "Fragancias frescas, limpias y volátiles",
    points: [
      "Notas unisex u orientadas a femenino (si se combinan con flores)",
      "También pueden ser masculinas (cuando se combinan con madera)",
      "Target joven, alegre, divertidas, para el día a día"
    ]
  },
  {
    name: "AROMÁTICO",
    title: "Mezclas de hierbas y especias intensas",
    points: [
      "Salvia, romero, comino, lavanda y otras plantas",
      "Intenso aroma a hierba y especias",
      "A menudo se combinan con notas cítricas y especiadas",
      "Son muy masculinas"
    ]
  },
  {
    name: "MADEROSAS",
    title: "Esencias profundas y elegantes",
    points: [
      "Notas de cedro, abedul, sándalo, esencias de musgo, vetiver y alguna hierba de raíces",
      "Actualmente el 80% de los perfumes masculinos posee alguna nota de madera",
      "Principalmente de carácter masculino"
    ]
  },
  {
    name: "ORIENTAL",
    title: "Fragancias intensas, sensuales y cálidas",
    points: [
      "Conocida también como especiada o ambarina, femeninas o masculinas",
      "Incluyen aceites balsámicos, vainillas, resinas, clavo, pimienta, cardamomo, jengibre, cacao, regaliz, ámbar y almizcle",
      "Las fragancias son intensas, sensuales, cálidas y dulces",
      "Personalidades definidas"
    ]
  },
  {
    name: "CHYPRE",
    title: "Combinación armoniosa de contrastes",
    points: [
      "Notas de bergamota, flores, patchuli, musgo, ámbar y almizcle",
      "Perfumes unisex, juveniles, informales y frescos"
    ]
  }
];

const OlfactoryFamilies: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Bloquear el scroll cuando el modal está abierto
  useEffect(() => {
    if (expandedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedCategory]);

  const toggleExpand = (name: string) => {
    if (expandedCategory === name) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(name);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {olfactoryData.map((category, index) => (
        <div key={category.name} className="relative">
          <div 
            className="font-secondary text-sm p-3 rounded-lg border border-white/5 bg-white/5 flex items-center cursor-pointer hover:bg-white/10 transition-all duration-300"
            onClick={() => toggleExpand(category.name)}
          >
            <div className="w-2 h-2 rounded-full bg-primary/80 mr-2 flex-shrink-0"></div>
            <span className="tracking-wide leading-tight">{category.name}</span>
          </div>
          
          <AnimatePresence>
            {expandedCategory === category.name && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setExpandedCategory(null);
                }}
              >
                <motion.div 
                  className="bg-background/95 backdrop-blur-sm border border-primary/40 rounded-lg shadow-2xl p-6 w-full max-w-md"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-3">
                    <h3 className="font-primary text-xl text-primary font-semibold">{category.name}</h3>
                    <button 
                      onClick={() => setExpandedCategory(null)}
                      className="text-primary/60 hover:text-primary text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10"
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                  
                  <h4 className="text-lg font-medium mb-3 text-foreground">{category.title}</h4>
                  
                  <ul className="space-y-2 text-base text-foreground/80">
                    {category.points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/70 mt-2 mr-2.5 flex-shrink-0"></div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default OlfactoryFamilies;
