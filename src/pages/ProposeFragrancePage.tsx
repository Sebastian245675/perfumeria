import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProposeFragrance from "@/components/ProposeFragrance";

const ProposeFragrancePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pt-32 pb-20"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-primary mb-4">
                Propón tu Fragancia
              </h1>
              <p className="text-lg text-muted-foreground">
                Comparte tu visión olfativa y ayúdanos a crear la próxima esencia NUVÓ
              </p>
            </div>
            
            <ProposeFragrance />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProposeFragrancePage;
