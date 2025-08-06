import * as React from "react";
import { format, getYear, getMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  getDetailedMonthlyAvailability, 
  DetailedDateAvailability 
} from "@/lib/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import "./calendar-transition-fix.css"; // Importamos las correcciones para la transición

interface AppointmentCalendarNewProps {
  onSelectDateTime?: (date: Date | undefined, timeSlot?: string) => void;
  onViewAppointmentForm?: () => void;
  isDialog?: boolean;
}

export function AppointmentCalendarNew({ 
  onSelectDateTime, 
  onViewAppointmentForm, 
  isDialog = false 
}: AppointmentCalendarNewProps) {
  // Estado del diálogo si es un modal
  const [isOpen, setIsOpen] = React.useState(isDialog);
  
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [availabilityData, setAvailabilityData] = React.useState<Record<string, DetailedDateAvailability>>({});
  const [activeTab, setActiveTab] = React.useState("calendario");
  
  const { toast } = useToast();

  // Cargar la disponibilidad del mes actual al montar el componente
  React.useEffect(() => {
    loadMonthlyAvailability(new Date());
  }, []);

  // Cargar la disponibilidad para un mes específico
  const loadMonthlyAvailability = async (date: Date) => {
    try {
      setIsLoading(true);
      const year = getYear(date);
      const month = getMonth(date) + 1; // date-fns usa 0-11 para meses
      
      const availabilityData = await getDetailedMonthlyAvailability(year, month);
      setAvailabilityData(availabilityData);
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la selección de fecha y hora
  const handleDateTimeSelect = (date: Date | undefined, timeSlot?: string) => {
    setSelectedDate(date);
    
    if (timeSlot) {
      setSelectedTimeSlot(timeSlot);
      
      // Si tenemos fecha y hora, automáticamente procedemos al formulario
      if (date && timeSlot) {
        // Notificar al componente padre con la fecha y hora seleccionada PRIMERO
        // para asegurar que los datos se actualicen antes de mostrar el formulario
        onSelectDateTime?.(date, timeSlot);
        
        // Esperamos a que termine la animación en el CalendarHeatmap (800ms)
        // y luego cerramos el modal y mostramos la pantalla de carga
        // Aumentamos el tiempo para dar más margen a dispositivos más lentos
        setTimeout(() => {
          try {
            // Forzamos actualización de sessionStorage para prevenir inconsistencias
            sessionStorage.setItem('selectedDate', format(date, 'yyyy-MM-dd'));
            sessionStorage.setItem('selectedTime', timeSlot);
            
            if (isDialog) {
              setIsOpen(false);
            }
            
            // Timeout adicional para permitir que el DOM se estabilice antes de cambiar la vista
            setTimeout(() => {
              // Llamar a la función para mostrar el formulario con pantalla de carga
              onViewAppointmentForm?.();
            }, 300);
          } catch (error) {
            console.error("Error en la transición del calendario:", error);
          }
        }, 1200); // Tiempo suficiente para que se vea la animación del calendario y se complete el proceso
      }
    } else {
      setSelectedTimeSlot(undefined);
      onSelectDateTime?.(date);
    }
  };
  
  // Continuar al formulario de reserva
  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      try {
        // Guardamos los datos en sessionStorage como respaldo
        sessionStorage.setItem('selectedDate', format(selectedDate, 'yyyy-MM-dd'));
        sessionStorage.setItem('selectedTime', selectedTimeSlot);
        
        // Primero cerramos el modal y luego llamamos al formulario
        if (isDialog) {
          setIsOpen(false);
          // Damos tiempo para que se complete la animación de cierre
          setTimeout(() => {
            onViewAppointmentForm?.();
          }, 300);
        } else {
          // Si no es un diálogo, llamamos directamente
          onViewAppointmentForm?.();
        }
        
        // Enviamos un evento personalizado para que el navegador sepa que estamos
        // haciendo una transición importante (útil para Chrome en Android)
        const transitionEvent = new CustomEvent('calendar:selectionComplete', {
          detail: { date: selectedDate, time: selectedTimeSlot }
        });
        document.dispatchEvent(transitionEvent);
      } catch (error) {
        console.error("Error al procesar la selección:", error);
        toast({
          title: "Error",
          description: "Ocurrió un problema al procesar tu selección. Por favor intenta de nuevo.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Selección incompleta",
        description: "Por favor, selecciona una fecha y un horario para continuar.",
        variant: "destructive"
      });
    }
  };

  // Renderizar como dialog si es modal, o como componente directo
  const calendarContent = (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Reserva tu visita personalizada</CardTitle>
        <CardDescription>
          <p>Selecciona una fecha y horario disponible para tu experiencia olfativa.</p>
          <div className="flex items-center mt-2 text-sm">
            <Clock className="h-4 w-4 mr-1 text-primary" />
            <span>Horario: De 9:30 a 13:00 y de 15:00 a 21:00 (Lunes a Viernes)</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="calendario" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendario" className="space-y-4 p-4">
          <CalendarHeatmap
            onDateSelect={handleDateTimeSelect}
            availabilityData={availabilityData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="detalles" className="space-y-4 p-4">
          {selectedDate && selectedTimeSlot ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Fecha seleccionada:</p>
                <p className="text-lg">{format(selectedDate, "PPP", { locale: es })}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Hora seleccionada:</p>
                <p className="text-lg">{selectedTimeSlot}</p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-2">Sobre tu visita:</p>
                <ul className="text-sm space-y-2">
                  <li>• Duración: 30 o 60 minutos según el tipo seleccionado</li>
                  <li>• Ubicación: Estudio NUVÓ, centro histórico</li>
                  <li>• Puedes traer hasta 3 acompañantes</li>
                  <li>• Te recomendamos venir sin perfume previo</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 flex-col space-y-4">
              <p className="text-muted-foreground">No has seleccionado fecha y hora</p>
              <Button variant="outline" onClick={() => setActiveTab("calendario")}>
                Seleccionar fecha y hora
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between pt-4 border-t">
        {activeTab === "detalles" && (
          <Button variant="ghost" onClick={() => setActiveTab("calendario")}>
            Regresar al Calendario
          </Button>
        )}
        
        {selectedDate && selectedTimeSlot && activeTab === "detalles" && (
          <Button 
            onClick={handleContinue}
            className="calendar-continue-button"
          >
            Continuar al formulario
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  // Si es un diálogo, mostrarlo en un modal
  if (isDialog) {
    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="outline">
          Ver Disponibilidad
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Selecciona fecha y hora para tu visita</DialogTitle>
            </DialogHeader>
            {calendarContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Si no es un diálogo, mostrar directamente
  return calendarContent;
}
