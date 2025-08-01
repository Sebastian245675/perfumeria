import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { guardarPropuestaFragancia, verificarPropuestaReciente, PropuestaFragancia } from "@/lib/fragancias";
import { Loader2, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Definir el esquema de validación
const fragranceFormSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres."
  }),
  descripcion: z.string().min(20, {
    message: "La descripción debe tener al menos 20 caracteres."
  }),
  inspiracion: z.string().min(10, {
    message: "La inspiración debe tener al menos 10 caracteres."
  }),
  notasSalida: z.string().min(3, {
    message: "Ingresa al menos una nota de salida."
  }),
  notasCorazon: z.string().min(3, {
    message: "Ingresa al menos una nota de corazón."
  }),
  notasFondo: z.string().min(3, {
    message: "Ingresa al menos una nota de fondo."
  }),
  personalidad: z.string().min(5, {
    message: "La personalidad debe tener al menos 5 caracteres."
  }),
  genero: z.enum(["masculino", "femenino", "unisex"], {
    required_error: "Debes seleccionar un género."
  }),
  ocasion: z.string().min(3, {
    message: "La ocasión debe tener al menos 3 caracteres."
  }),
  intensidad: z.number().min(1).max(5),
  duracion: z.number().min(1).max(24),
  estaciones: z.array(z.string()).min(1, {
    message: "Selecciona al menos una estación."
  }),
  email: z.string().email({
    message: "Ingresa un email válido."
  }),
  nombre_contacto: z.string().min(3, {
    message: "Tu nombre debe tener al menos 3 caracteres."
  }),
});

// Definir el tipo del formulario
type FragranceFormValues = z.infer<typeof fragranceFormSchema>;

// Lista de estaciones
const estaciones = [
  { id: "primavera", label: "Primavera" },
  { id: "verano", label: "Verano" },
  { id: "otoño", label: "Otoño" },
  { id: "invierno", label: "Invierno" },
  { id: "todas", label: "Todas las estaciones" },
];

const ProposeFragrance = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [puedeEnviar, setPuedeEnviar] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const { toast } = useToast();
  const { currentUser, userData } = useAuth();

  // Inicializar el formulario
  const form = useForm<FragranceFormValues>({
    resolver: zodResolver(fragranceFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      inspiracion: "",
      notasSalida: "",
      notasCorazon: "",
      notasFondo: "",
      personalidad: "",
      genero: "unisex",
      ocasion: "",
      intensidad: 3,
      duracion: 6,
      estaciones: [],
      email: userData?.email || "",
      nombre_contacto: userData?.name || "",
    },
  });

  // Verificar si el usuario puede enviar una propuesta
  useEffect(() => {
    const verificarSiPuedeEnviar = async () => {
      try {
        const email = form.getValues("email");
        if (!email) return;

        const { puedeEnviar, tiempoRestante } = await verificarPropuestaReciente(
          currentUser?.uid || null,
          email
        );
        
        setPuedeEnviar(puedeEnviar);
        if (tiempoRestante) setTiempoRestante(tiempoRestante);
      } catch (error) {
        console.error("Error al verificar si puede enviar propuesta:", error);
      }
    };

    if (currentUser?.uid || form.getValues("email")) {
      verificarSiPuedeEnviar();
    }
  }, [currentUser?.uid, form]);

  // Llenar datos del usuario si está autenticado
  useEffect(() => {
    if (userData) {
      form.setValue("email", userData.email || "");
      form.setValue("nombre_contacto", userData.name || "");
    }
  }, [userData, form]);

  // Manejar envío del formulario
  const onSubmit = async (data: FragranceFormValues) => {
    try {
      setIsSubmitting(true);

      // Formatear los datos para el formato esperado
      const propuestaData: Omit<PropuestaFragancia, "id" | "createdAt"> = {
        userId: currentUser?.uid || null,
        nombre: data.nombre,
        descripcion: data.descripcion,
        inspiracion: data.inspiracion,
        notas: {
          salida: data.notasSalida,
          corazon: data.notasCorazon,
          fondo: data.notasFondo,
        },
        personalidad: data.personalidad,
        genero: data.genero,
        ocasion: data.ocasion,
        intensidad: data.intensidad,
        duracion: data.duracion,
        estacion: data.estaciones,
        status: "pendiente",
        email: data.email,
        nombre_contacto: data.nombre_contacto,
      };

      // Guardar en Firestore
      await guardarPropuestaFragancia(propuestaData);

      // Notificar éxito
      toast({
        title: "¡Propuesta enviada!",
        description:
          "Gracias por compartir tu idea. Hemos recibido tu propuesta de fragancia.",
        variant: "default",
      });

      // Resetear formulario
      form.reset();
      
      // Actualizar estado
      setPuedeEnviar(false);
      setTiempoRestante(24);
    } catch (error: any) {
      toast({
        title: "Error al enviar",
        description: error.message || "No pudimos enviar tu propuesta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-primary">Proponer una Fragancia</CardTitle>
        <CardDescription>
          Comparte tu idea para una nueva fragancia. Nuestros perfumistas evaluarán tu propuesta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!puedeEnviar ? (
          <div className="p-6 text-center bg-secondary/10 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Ya has enviado una propuesta recientemente</h3>
            <p className="mb-4">
              Por favor espera aproximadamente {Math.ceil(tiempoRestante)} horas antes de enviar otra propuesta.
            </p>
            <Button variant="outline" onClick={() => form.reset()}>
              Crear Nueva Propuesta Después
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección: Información Básica */}
              <div className="space-y-4 border rounded-lg p-4 bg-background/50">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Fragancia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Amanecer Dorado" {...field} />
                      </FormControl>
                      <FormDescription>
                        Un nombre evocador para tu creación.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe cómo sería esta fragancia, qué emociones evoca..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspiracion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspiración</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="¿Qué te inspiró para crear esta fragancia?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección: Perfil Olfativo */}
              <div className="space-y-4 border rounded-lg p-4 bg-background/50">
                <h3 className="text-lg font-semibold">Perfil Olfativo</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>¿Qué son las notas olfativas?</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm space-y-2">
                        <p><strong>Notas de Salida:</strong> Lo primero que percibes, duran aproximadamente 15 minutos.</p>
                        <p><strong>Notas de Corazón:</strong> El cuerpo principal del perfume, duran entre 2-3 horas.</p>
                        <p><strong>Notas de Fondo:</strong> La base duradera que permanece durante horas.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="notasSalida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas de Salida</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: bergamota, limón, lavanda" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Separa con comas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notasCorazon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas de Corazón</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: jazmín, rosa, pachulí" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Separa con comas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notasFondo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas de Fondo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: vainilla, ámbar, almizcle" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Separa con comas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sección: Características */}
              <div className="space-y-4 border rounded-lg p-4 bg-background/50">
                <h3 className="text-lg font-semibold">Características</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personalidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personalidad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: elegante, misterioso, fresco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ocasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocasión ideal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: eventos de noche, uso diario, ocasiones especiales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="intensidad"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Intensidad</FormLabel>
                          <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs">
                            {field.value}/5
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sutil</span>
                          <span>Intensa</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Duración estimada</FormLabel>
                          <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs">
                            {field.value} horas
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={1}
                            max={24}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Breve</span>
                          <span>Duradera</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estaciones"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Estaciones del año</FormLabel>
                        <FormDescription>
                          Selecciona las estaciones ideales para usar esta fragancia
                        </FormDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {estaciones.map((estacion) => (
                          <FormField
                            key={estacion.id}
                            control={form.control}
                            name="estaciones"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={estacion.id}
                                  className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(estacion.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, estacion.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== estacion.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {estacion.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección: Contacto */}
              <div className="space-y-4 border rounded-lg p-4 bg-background/50">
                <h3 className="text-lg font-semibold">Información de contacto</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="tu@email.com" 
                            {...field}
                            disabled={!!userData?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nombre_contacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu nombre</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tu nombre" 
                            {...field}
                            disabled={!!userData?.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto" 
                        disabled={isSubmitting || !puedeEnviar}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar Propuesta"
                        )}
                      </Button>
                    </TooltipTrigger>
                    {!puedeEnviar && (
                      <TooltipContent>
                        <p>Ya enviaste una propuesta en las últimas 24 horas</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 border-t pt-4">
        <p className="text-sm text-muted-foreground">
          * Tu propuesta será revisada por nuestro equipo de perfumistas. Si es seleccionada, nos pondremos en contacto contigo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Creatividad</Badge>
          <Badge variant="outline">Innovación</Badge>
          <Badge variant="outline">Perfumería</Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProposeFragrance;
