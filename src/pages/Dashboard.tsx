import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, LogOut, Loader2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import UserAppointments from "@/components/UserAppointments";
import RequireAuth from "@/components/RequireAuth";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      navigate("/");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        title: "Error",
        description: "No pudimos cerrar tu sesión. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth
      fallback={
        <div className="py-20 text-center">
          <h2 className="font-primary text-3xl font-bold mb-4">Acceso Restringido</h2>
          <p className="mb-6 text-muted-foreground">
            Debes iniciar sesión para acceder a esta página.
          </p>
          <Button onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </div>
      }
    >
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h1 className="font-primary text-4xl md:text-5xl font-bold text-primary mb-2">
                Mi Cuenta
              </h1>
              <p className="font-secondary text-muted-foreground">
                {userData?.name ? `Bienvenido/a, ${userData.name}` : 'Bienvenido/a a tu cuenta'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4 md:mt-0"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Cerrar Sesión
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Mis Reservas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <UserProfile />
            </TabsContent>
            
            <TabsContent value="appointments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-primary text-2xl">Mis Reservas</CardTitle>
                  <CardDescription>Gestiona tus visitas con NUVÓ</CardDescription>
                </CardHeader>
              </Card>
              <div className="mt-6">
                <UserAppointments />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </RequireAuth>
  );
};

export default Dashboard;
