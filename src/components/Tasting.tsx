import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Sparkles, X } from "lucide-react";
import essenceImage from "@/assets/essence-abstract.jpg";
import { useState } from "react";
import { format } from "date-fns";
import { AppointmentCalendarNew } from "./AppointmentCalendarNew";
import { es } from "date-fns/locale";

const Tasting = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Manejador para cuando se selecciona una fecha y hora
  const handleDateTimeSelect = (date?: Date, timeSlot?: string) => {
    if (date && timeSlot) {
      // Guardar la fecha y hora seleccionadas en sessionStorage
      sessionStorage.setItem('selectedDate', format(date, 'yyyy-MM-dd'));
      sessionStorage.setItem('selectedTime', timeSlot);
    }
  };
  
  // Manejador para cuando se quiere ver el formulario de reserva
  const handleViewAppointmentForm = () => {
    const element = document.getElementById("agenda");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    // Cerrar el calendario después de la selección completa
    setShowCalendar(false);
  };
  const tastingExperiences = [
    {
      title: "Cita Personalizada",
      duration: "30 minutos",
      participants: "1-2 personas",
      description: "Nuestro equipo te acompañará en un recorrido personalizado por fragancias de autor, seleccionadas especialmente para que encuentres ese aroma que hable de ti."
    },
    {
      title: "Cita Personalizada",
      duration: "60 minutos",
      participants: "1-4 personas",
      description: "Nuestro equipo te acompañará en un recorrido personalizado por fragancias de autor, seleccionadas especialmente para que encuentres ese aroma que hable de ti."
    }
  ];

  return (
    <section id="cata" className="py-20 bg-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-primary text-4xl md:text-5xl font-bold text-primary mb-6">
            Asesoramiento Personalizado
          </h2>
          <p className="font-secondary text-lg md:text-xl font-light text-muted-foreground max-w-3xl mx-auto">
            Una experiencia sensorial única para descubrir la fragancia que realmente te representa
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16">
          <div 
            className="h-80 bg-cover bg-center rounded-lg shadow-lg relative overflow-hidden"
            style={{ backgroundImage: `url(${essenceImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="max-w-md ml-8 text-white">
                <h3 className="font-primary text-3xl font-bold mb-4">El Arte de Descubrir</h3>
                <p className="font-secondary text-lg font-light">
                  Cada aroma cuenta una historia. Déjanos ayudarte a encontrar la tuya.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasting Experiences */}
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-16 max-w-4xl mx-auto">
          {tastingExperiences.map((experience, index) => (
            <Card key={index} className="bg-background border-border hover:shadow-lg transition-all duration-300 flex-1">
              <CardHeader>
                <CardTitle className="font-primary text-xl font-semibold text-primary mb-4">
                  {experience.title}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-secondary">{experience.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="font-secondary">{experience.participants}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-secondary text-sm text-foreground mb-6 leading-relaxed">
                  {experience.description}
                </p>
                <div className="mb-6">
                  <h4 className="font-secondary text-sm font-medium text-primary mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reserva sin costo
                  </h4>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full font-secondary"
                  onClick={() => {
                    const element = document.getElementById("agenda");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Reservar Asesoramiento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process */}
        <div className="bg-background rounded-lg p-8 mb-16">
          <h3 className="font-primary text-3xl font-semibold text-center text-primary mb-12">
            El Proceso de Asesoramiento
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Preparación",
                description: "Creamos un ambiente sereno para que tus sentidos se abran a la experiencia"
              },
              {
                step: "02", 
                title: "Exploración",
                description: "Guiamos tu olfato a través de diferentes familias aromáticas"
              },
              {
                step: "03",
                title: "Conexión",
                description: "Identificamos las fragancias que resuenan con tu personalidad"
              },
              {
                step: "04",
                title: "Selección",
                description: "Encontramos juntos tu esencia perfecta"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="font-primary text-3xl font-bold text-accent mb-4">{step.step}</div>
                <h4 className="font-primary text-lg font-semibold text-primary mb-2">{step.title}</h4>
                <p className="font-secondary text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-elegant text-elegant-foreground max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-primary text-2xl font-semibold mb-4">
                ¿Listo para descubrir tu esencia?
              </h3>
              <p className="font-secondary text-base font-light mb-6">
                Reserva tu asesoramiento personalizado y vive una experiencia olfativa inolvidable
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  className="font-secondary"
                  onClick={() => setShowCalendar(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Disponibilidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Modal de Calendario de Disponibilidad */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-primary text-xl font-semibold">Disponibilidad de Asesoramiento</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCalendar(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                <AppointmentCalendarNew 
                  onSelectDateTime={handleDateTimeSelect}
                  onViewAppointmentForm={handleViewAppointmentForm}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Tasting;