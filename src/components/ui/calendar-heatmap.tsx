import * as React from "react";
import { Calendar as CalendarIcon, Clock, Users, Info, AlertCircle } from "lucide-react";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parse, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailedDateAvailability, TimeSlotInfo } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

export interface CalendarHeatmapProps {
  onDateSelect: (date: Date | undefined, timeSlot?: string) => void;
  availabilityData: Record<string, DetailedDateAvailability>;
  isLoading?: boolean;
}

export function CalendarHeatmap({ onDateSelect, availabilityData, isLoading = false }: CalendarHeatmapProps) {
  const [date, setDate] = React.useState<Date>();
  const [month, setMonth] = React.useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>();
  const { toast } = useToast();
  
  // Al cambiar la fecha, notificamos al componente padre
  React.useEffect(() => {
    // Solo notificar si tanto fecha como hora están seleccionados
    if (date && selectedTimeSlot) {
      onDateSelect(date, selectedTimeSlot);
    } else if (date) {
      onDateSelect(date);
    }
  }, [date, selectedTimeSlot, onDateSelect]);
  
  // Función para determinar el color de fondo según disponibilidad
  // Basado en la proporción de slots disponibles
  const getAvailabilityColor = (date: Date) => {
    if (isLoading) return "bg-muted";
    
    const dateString = format(date, "yyyy-MM-dd");
    const dateAvailability = availabilityData[dateString];
    
    if (!dateAvailability) return "bg-muted"; // Sin datos de disponibilidad
    
    const availableSlots = dateAvailability.availableSlots || 0;
    const totalSlots = dateAvailability.totalSlots || 8;
    const occupancyRate = (totalSlots - availableSlots) / totalSlots;
    
    if (occupancyRate === 0) return "bg-green-500/50 text-white"; // Completamente disponible
    if (occupancyRate <= 0.25) return "bg-green-500/60 text-white"; // Mayormente disponible
    if (occupancyRate <= 0.5) return "bg-yellow-500/50 text-white"; // Mitad disponible
    if (occupancyRate <= 0.75) return "bg-orange-500/60 text-white"; // Poco disponible
    if (occupancyRate < 1) return "bg-destructive/50 text-white"; // Muy poco disponible
    return "bg-destructive/70 text-white"; // Completamente reservado
  };
  
  const getAvailabilityTooltip = (date: Date) => {
    if (isLoading) return "Cargando disponibilidad...";
    
    const dateString = format(date, "yyyy-MM-dd");
    const dateAvailability = availabilityData[dateString];
    
    if (!dateAvailability) return "Sin datos de disponibilidad";
    
    const availableSlots = dateAvailability.availableSlots || 0;
    const totalSlots = dateAvailability.totalSlots || 8;
    
    if (availableSlots === totalSlots) return "Todos los horarios disponibles";
    if (availableSlots === 0) return "Completamente reservado";
    
    return `${availableSlots} horario${availableSlots === 1 ? "" : "s"} disponible${availableSlots === 1 ? "" : "s"}`;
  };

  return (
    <div className="space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <span>{date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}</span>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={month}
              onMonthChange={setMonth}
              initialFocus
              disabled={(date) => date < addDays(new Date(), 1)}
              modifiers={{
              booked: (date) => {
                const dateString = format(date, "yyyy-MM-dd");
                const dateAvailability = availabilityData[dateString];
                return dateAvailability && dateAvailability.availableSlots === 0; // completamente reservado
              },
              available: (date) => {
                const dateString = format(date, "yyyy-MM-dd");
                const dateAvailability = availabilityData[dateString];
                return dateAvailability && dateAvailability.availableSlots === dateAvailability.totalSlots; // completamente disponible
              },
              partiallyBooked: (date) => {
                const dateString = format(date, "yyyy-MM-dd");
                const dateAvailability = availabilityData[dateString];
                return dateAvailability && 
                       dateAvailability.availableSlots > 0 && 
                       dateAvailability.availableSlots < dateAvailability.totalSlots; // parcialmente reservado
              }
            }}
            modifiersClassNames={{
              booked: "opacity-60",
              available: "font-bold text-white",
            }}
            components={{
              Day: ({ date, ...props }) => {
                const dateString = format(date, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(date, month);
                const isSelected = date.toDateString() === (date?.toDateString() || '');
                const dayClassName = cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100", // Estilos base
                  isSelected && "bg-primary text-primary-foreground font-bold ring-2 ring-offset-1", 
                  isToday(date) && "border border-primary",
                  isCurrentMonth && getAvailabilityColor(date)
                );
                
                const dateAvailability = availabilityData[dateString];
                const isFullyBooked = dateAvailability && dateAvailability.availableSlots === 0;
                const isDateDisabled = date < addDays(new Date(), 1) || isFullyBooked;
                
                const handleDateClick = () => {
                  if (isFullyBooked) {
                    toast({
                      title: "Fecha no disponible",
                      description: "Esta fecha ya está completamente reservada. Por favor, selecciona otra fecha.",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (!isDateDisabled) {
                    setDate(date);
                  }
                };
                
                return (
                  <div className="relative" title={isCurrentMonth ? getAvailabilityTooltip(date) : undefined}>
                    {isLoading && isCurrentMonth ? (
                      <Skeleton className="absolute inset-0 h-10 w-10 rounded-full" />
                    ) : (
                      <button
                        type="button"
                        role="grid-cell"
                        tabIndex={-1}
                        onClick={handleDateClick}
                        className={`${dayClassName} ${isFullyBooked ? 'cursor-not-allowed' : ''}`}
                        disabled={date < addDays(new Date(), 1)}
                      >
                        {date.getDate()}
                        {isFullyBooked && isCurrentMonth && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                        )}
                      </button>
                    )}
                  </div>
                );
              }
            }}
          />
          <div className="p-3 border-t">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded bg-green-500/50"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded bg-yellow-500/50"></div>
                <span>Limitado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded bg-destructive/70"></div>
                <span>Sin horarios</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {date && (
        <Card className="overflow-hidden border-2 border-muted">
          <CardContent className="p-4 bg-gradient-to-br from-background to-muted/30">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Horarios para {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                {availabilityData[format(date, "yyyy-MM-dd")]?.timeSlots ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availabilityData[format(date, "yyyy-MM-dd")]?.timeSlots
                      .map((slot, index) => {
                        // Manejador de clics para mostrar mensaje si no está disponible
                        const handleTimeClick = () => {
                          if (!slot.isAvailable) {
                            toast({
                              title: "Horario no disponible",
                              description: "Este horario ya está reservado. Por favor, selecciona otro.",
                              variant: "destructive"
                            });
                            return;
                          }
                          setSelectedTimeSlot(slot.time);
                          onDateSelect(date, slot.time);
                        };
                        
                        return (
                          <Button
                            key={slot.time}
                            variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full justify-center relative transition-all",
                              selectedTimeSlot === slot.time ? "bg-primary text-primary-foreground shadow-md scale-105" : "",
                              !slot.isAvailable ? "bg-muted/50 text-muted-foreground" : "hover:bg-primary/20"
                            )}
                            onClick={handleTimeClick}
                          >
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            {slot.time}
                            {!slot.isAvailable && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                            )}
                          </Button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center justify-center py-6">
                    <Info className="mr-2 h-4 w-4" />
                    No hay información de horarios para este día.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
