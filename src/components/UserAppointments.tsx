import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getUserAppointments, Appointment, cancelAppointment } from "@/lib/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Package, Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const UserAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        const userAppointments = await getUserAppointments(currentUser.uid);
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
        toast({
          title: "Error",
          description: "No pudimos cargar tus citas. Por favor intenta nuevamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser, toast]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!appointmentId) return;
    
    setCancelLoading(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      
      // Actualizar la lista de citas
      setAppointments(appointments.map(app => 
        app.id === appointmentId 
          ? { ...app, status: 'cancelled' as const } 
          : app
      ));
      
      toast({
        title: "Cita cancelada",
        description: "Tu cita ha sido cancelada exitosamente."
      });
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
      toast({
        title: "Error",
        description: "No pudimos cancelar tu cita. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmada</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      default:
        return null;
    }
  };
  
  const getServiceName = (serviceValue: string) => {
    const services = {
      "cata-intima": "Cata Íntima",
      "cata-pareja": "Cata de Pareja",
      "cata-grupal": "Cata Grupal",
      "consulta-productos": "Consulta de Productos",
      "compra-perfumes": "Compra Personalizada"
    };
    
    return services[serviceValue as keyof typeof services] || serviceValue;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8">
          {/* Contenido vacío para mantener el espacio pero sin mostrar ningún texto */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <div className={`h-2 ${appointment.status === 'cancelled' ? 'bg-red-200' : appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-primary'}`} />
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg mb-1 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-primary" />
                      {getServiceName(appointment.service)}
                      <span className="ml-2">{getStatusBadge(appointment.status)}</span>
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {appointment.date}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.time} hs ({appointment.participants} {parseInt(appointment.participants) === 1 ? 'persona' : 'personas'})
                      </p>
                    </div>
                  </div>
                  
                  {appointment.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={cancelLoading === appointment.id}
                        >
                          {cancelLoading === appointment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          <span>Cancelar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Tu cita será cancelada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => appointment.id && handleCancelAppointment(appointment.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Sí, cancelar cita
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium mb-1">Notas:</p>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAppointments;
