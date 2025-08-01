import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import AboutUs from "@/components/AboutUs";
import Products from "@/components/Products";
import Tasting from "@/components/Tasting";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Appointment from "@/components/Appointment";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  // Al cargar la página principal, añadir una clase al body para animaciones globales
  useEffect(() => {
    // Aseguramos que el body tiene los estilos correctos
    document.body.classList.add('page-loaded');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    
    // Forzar un reflow para evitar problemas de renderizado
    const forceReflow = () => {
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('resize'));
    };
    
    // Ejecutar dos veces con un pequeño retraso para asegurar el reflow
    forceReflow();
    setTimeout(forceReflow, 100);
    
    return () => {
      document.body.classList.remove('page-loaded');
    };
  }, []);
  
  return (
    <PageTransition>
      <div className="min-h-screen w-full m-0 p-0 overflow-x-hidden">
        <Navigation />
        <main className="w-full m-0 p-0 overflow-x-hidden">
          <div id="inicio" className="w-full m-0 p-0">
            <Hero />
          </div>
          <Products />
          <Tasting />
          <Testimonials />
          <Contact />
          <Appointment />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
