import * as React from "react";
import { format, getYear, getMonth, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  getDetailedMonthlyAvailability, 
  getAvailableTimeSlotsForDate, 
  DetailedDateAvailability 
} from "@/lib/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, ArrowRight, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AppointmentCalendarProps {
  onSelectDateTime?: (date: Date | undefined, timeSlot?: string) => void;
  onViewAppointmentForm?: () => void;
  isDialog?: boolean;
}

export function AppointmentCalendar({ 
  onSelectDateTime, 
  onViewAppointmentForm, 
  isDialog = false 
}: AppointmentCalendarProps) {
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
      onSelectDateTime?.(date, timeSlot); // Notificar al componente padre
    } else {
      setSelectedTimeSlot(undefined);
      onSelectDateTime?.(date);
    }
  };
  
  // Continuar al formulario de reserva
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
        <CardTitle className="text-2xl">Reserva tu cata personalizada</CardTitle>
        <CardDescription>Selecciona una fecha y horario disponible para tu experiencia olfativa.</CardDescription>
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
                <p className="text-sm font-medium mb-2">Sobre tu cita:</p>
                <ul className="text-sm space-y-2">
                  <li>• Duración aproximada: 45 minutos</li>
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
        <Button variant="ghost" onClick={() => setActiveTab("calendario")}>
          Regresar al Calendario
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedDate || !selectedTimeSlot}
        >
          Continuar con Reserva
        </Button>
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
              <DialogTitle>Disponibilidad de Citas</DialogTitle>
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
    let day = new Date(startDate);
    
    // Obtener el día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = startDate.getDay();
    
    // Añadir días vacíos al principio para alinear el calendario
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Añadir los días del mes
    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Días de la semana */}
        {["D", "L", "M", "X", "J", "V", "S"].map((dayName, index) => (
          <div key={`header-${index}`} className="text-center text-xs font-medium p-1">
            {dayName}
          </div>
        ))}
        
        {/* Días del mes */}
        {days.map((date, index) => {
          if (date === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }
          
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = dateStr === selectedDate;
          const isPast = date < new Date() && !isSelected;
          const bookedCount = availabilityData[dateStr] || 0;
          const isFullyBooked = bookedCount >= timeSlots.length;
          
          // Determinar color según disponibilidad
          let availabilityClass = "bg-success/10 hover:bg-success/20"; // Completamente disponible
          if (isFullyBooked) {
            availabilityClass = "bg-gray-200 text-gray-400 cursor-not-allowed";
          } else if (bookedCount > 0) {
            if (bookedCount <= 2) availabilityClass = "bg-success/30 hover:bg-success/40";
            else if (bookedCount <= 4) availabilityClass = "bg-yellow-500/30 hover:bg-yellow-500/40";
            else if (bookedCount <= 6) availabilityClass = "bg-orange-500/30 hover:bg-orange-500/40";
            else availabilityClass = "bg-red-500/30 hover:bg-red-500/40";
          }
          
          return (
            <button
              key={dateStr}
              className={`p-2 rounded-md text-sm transition-colors ${isSelected ? 'border-2 border-primary' : ''} ${isPast ? 'opacity-50 cursor-not-allowed' : availabilityClass}`}
              onClick={() => !isPast && !isFullyBooked && setSelectedDate(dateStr)}
              disabled={isPast || isFullyBooked}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    );
  };
  
  // Renderizar la lista de horarios disponibles
  const renderTimeSlots = () => {
    if (!selectedDate) return null;
    
    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Horarios disponibles</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableTimeSlots.map(time => (
            <button
              key={time}
              className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                selectedTime === time 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => setSelectedTime(time)}
            >
              <Clock className="w-3 h-3 mr-1.5" />
              {time}
            </button>
          ))}
        </div>
        
        {availableTimeSlots.length === 0 && (
          <Alert className="mt-2">
            <AlertDescription>
              No hay horarios disponibles para este día. Por favor selecciona otra fecha.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Button 
        variant="secondary" 
        className="font-secondary"
        onClick={() => setIsOpen(true)}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Ver Disponibilidad
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-primary">Disponibilidad de Catas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selector de mes */}
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              
              <h3 className="text-lg font-medium">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </h3>
              
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Leyenda */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded-full bg-success/20"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded-full bg-yellow-500/30"></div>
                <span>Limitado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded-full bg-red-500/30"></div>
                <span>Pocos horarios</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded-full bg-gray-200"></div>
                <span>Sin disponibilidad</span>
              </div>
            </div>
            
            {/* Calendario */}
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-6">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cargando disponibilidad...</p>
                  </div>
                ) : (
                  renderCalendar()
                )}
              </CardContent>
            </Card>
            
            {/* Horarios disponibles */}
            {selectedDate && renderTimeSlots()}
            
            {/* Acciones */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              
              <Button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => {
                  // Redirigimos a la sección de agenda con los datos preseleccionados
                  if (selectedDate && selectedTime) {
                    // Almacenamos los datos seleccionados en sessionStorage para que el
                    // componente Appointment pueda acceder a ellos
                    sessionStorage.setItem('selectedDate', selectedDate);
                    sessionStorage.setItem('selectedTime', selectedTime);
                    
                    // Redirigimos a la sección de agenda
                    const element = document.getElementById("agenda");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                    
                    // Mostrar notificación o mensaje
                    const event = new CustomEvent('appointmentSelected', {
                      detail: { date: selectedDate, time: selectedTime }
                    });
                    document.dispatchEvent(event);
                    
                    setIsOpen(false);
                  }
                }}
              >
                Continuar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCalendar;
