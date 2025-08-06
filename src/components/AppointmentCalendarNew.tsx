import * as React from "react";
import { format, getYear, getMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  getDetailedMonthlyAvailability, 
  DetailedDateAvailability 
} from "@/lib/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";

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
  
  const { toast } = useToast();

  // Cargar la disponibilidad del mes actual al montar el componente
  React.useEffect(() => {
    loadMonthlyAvailability(new Date());
    
    // Escuchar el evento personalizado que indica que la selección está completa
    const handleSelectionComplete = (event: CustomEvent) => {
      const { date, time } = event.detail;
      // Cuando se completa la selección en el calendario, llamar a la función
      // para mostrar el formulario con una transición suave
      if (date && time && onViewAppointmentForm) {
        setTimeout(() => {
          onViewAppointmentForm();
          if (isDialog) {
            setIsOpen(false);
          }
        }, 300); // Un pequeño retraso para que sea más fluido
      }
    };
    
    // Añadir y limpiar el listener
    document.addEventListener('calendar:selectionComplete', handleSelectionComplete as EventListener);
    return () => {
      document.removeEventListener('calendar:selectionComplete', handleSelectionComplete as EventListener);
    };
  }, [onViewAppointmentForm, isDialog]);

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
      onSelectDateTime?.(date, timeSlot); // Notificar al componente padre PRIMERO
      
      // La idea es prevenir completamente que el usuario vea el scroll
      if (date && timeSlot) {
        // Inmediatamente hacemos visible una pantalla de carga a pantalla completa
        // antes de cualquier acción de scroll
        const overlayDiv = document.createElement('div');
        overlayDiv.id = 'transition-overlay'; // Añadimos un ID para facilitar su referencia
        overlayDiv.className = 'fixed inset-0 bg-background z-[9999] transition-opacity duration-500 flex items-center justify-center';
        overlayDiv.style.opacity = '0';
        overlayDiv.innerHTML = `
          <div class="text-center px-8 py-10">
            <div class="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 class="font-primary text-2xl font-semibold mt-6">Preparando tu visita...</h3>
          </div>
        `;
        document.body.appendChild(overlayDiv);
        
        // Forzamos un reflow para que la animación funcione
        overlayDiv.getBoundingClientRect();
        overlayDiv.style.opacity = '1';
        
        // Después de un breve momento, notificamos la selección completa
        setTimeout(() => {
          // Cerramos el diálogo si estamos en modo diálogo
          if (isDialog) {
            setIsOpen(false);
          }
          
          // Notificamos al componente principal para preparar el formulario
          document.dispatchEvent(new CustomEvent('calendar:selectionComplete', {
            detail: { date, time: timeSlot }
          }));
          
          // Establecemos un temporizador de seguridad para asegurarnos de que el overlay desaparezca
          // incluso si algo sale mal en el componente padre
          setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
              overlay.style.opacity = '0';
              setTimeout(() => {
                if (overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              }, 500); // Tiempo para la transición de desvanecimiento
            }
          }, 2500); // Tiempo máximo que puede estar visible el overlay
          
          // Guardamos el ID para que el componente padre pueda encontrarlo y eliminarlo antes si es necesario
          sessionStorage.setItem('transition-overlay-id', 'transition-overlay');
        }, 800);
      }
    } else {
      setSelectedTimeSlot(undefined);
      onSelectDateTime?.(date);
    }
  };
  
  // Función simplificada para continuar al formulario de reserva
  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      onViewAppointmentForm?.();
      if (isDialog) {
        setIsOpen(false);
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
        <CardTitle className="text-2xl">Selecciona fecha y hora para tu visita</CardTitle>
        <CardDescription>Elige una fecha y horario disponible para tu experiencia olfativa.</CardDescription>
      </CardHeader>
      
      <div className="space-y-4 p-4">
        <CalendarHeatmap
          onDateSelect={handleDateTimeSelect}
          availabilityData={availabilityData}
          isLoading={isLoading}
        />
        
        {selectedDate && selectedTimeSlot && (
          <div className="mt-4 py-3 px-4 border-t border-border flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Seleccionado: </span>
              <span>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTimeSlot}</span>
            </div>
          </div>
        )}
      </div>
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
