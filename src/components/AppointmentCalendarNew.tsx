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
