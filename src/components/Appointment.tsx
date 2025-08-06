import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NativeMobileSelect from "./NativeMobileSelect"; // Importamos el componente nativo para móviles
import { Textarea } from "@/components/ui/textarea";
import { X, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

// CSS for visual feedback and fixes
import "./appointment.css";
import "./appointment-fix.css"; // Importamos correcciones específicas
import "./cross-browser-fixes.css"; // Correcciones para diferentes navegadores
import "./calendar-transition-fix.css"; // Correcciones para transiciones entre calendario y formulario
import "./native-mobile-select.css"; // Estilos para los selects nativos en móviles
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { checkAppointmentAvailability, createAppointment } from "@/lib/firestore";
import { AppointmentCalendarNew } from "./AppointmentCalendarNew";

const Appointment = () => {
  const [appointmentData, setAppointmentData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    participants: "1",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  
  const { toast } = useToast();
  const { currentUser, userData } = useAuth();

  // Pre-llenar el formulario con los datos del usuario si está autenticado
  useEffect(() => {
    if (currentUser && userData) {
      setAppointmentData(prev => ({
        ...prev,
        name: userData.name || "",
        email: currentUser.email || "",
        phone: userData.phone || ""
      }));
    }
  }, [currentUser, userData]);
  
  // Efecto para manejar interacciones con selectores en móviles
  useEffect(() => {
    // Función para limpiar estados y clases cuando se desmonta el componente o cambia la página
    const cleanupSelects = () => {
      document.body.classList.remove("select-open");
      document.body.style.touchAction = "auto";
      
      // Limpiar cualquier selector abierto
      const openSelects = document.querySelectorAll('[data-state="open"]');
      openSelects.forEach(select => {
        (select as HTMLElement).setAttribute('data-state', 'closed');
      });
    };
    
    // Agregar detector para cuando el usuario abandona la página
    window.addEventListener('beforeunload', cleanupSelects);
    
    // Limpiar al desmontar el componente
    return () => {
      cleanupSelects();
      window.removeEventListener('beforeunload', cleanupSelects);
    };
  }, []);
  
  // Script para manejar transiciones sin scroll visible y garantizar que el overlay desaparezca
  useEffect(() => {
    // Esta función evita que se vea el scroll cuando se navega por el sitio
    const preventVisibleScrolling = (event: CustomEvent) => {
      // Cuando comienza la transición, añadimos la clase que impide el scroll visible
      document.body.classList.add('invisible-scroll');
      
      // Después de la transición, restauramos el scroll normal
      setTimeout(() => {
        document.body.classList.remove('invisible-scroll');
      }, 1500);
    };
    
    // Mecanismo de seguridad para asegurar que el overlay desaparezca
    const ensureOverlayRemoved = () => {
      setTimeout(() => {
        const overlay = document.getElementById('transition-overlay');
        if (overlay) {
          console.log("Aplicando mecanismo de seguridad para eliminar overlay");
          overlay.style.opacity = '0';
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          }, 500);
        }
        
        // También nos aseguramos de que el formulario sea visible
        const form = document.getElementById('reservation-form');
        if (form) {
          form.style.opacity = '1';
        }
        
        // Y restauramos el scroll normal si no se hizo antes
        document.body.classList.remove('invisible-scroll');
      }, 4000); // Tiempo suficiente para que todo se complete normalmente, pero si no, forzamos la limpieza
    };
    
    // Escuchar el evento que indica el inicio de una transición
    document.addEventListener('calendar:selectionComplete', preventVisibleScrolling as EventListener);
    document.addEventListener('calendar:selectionComplete', ensureOverlayRemoved as EventListener);
    
    return () => {
      // Limpiar los listeners cuando el componente se desmonta
      document.removeEventListener('calendar:selectionComplete', preventVisibleScrolling as EventListener);
      document.removeEventListener('calendar:selectionComplete', ensureOverlayRemoved as EventListener);
    };
  }, []);

  // Verificar si hay datos preseleccionados o datos de recuperación en sessionStorage
  useEffect(() => {
    try {
      // First check if there's a full appointment data object to recover
      const savedAppointmentData = sessionStorage.getItem('appointmentData');
      if (savedAppointmentData) {
        try {
          const parsedData = JSON.parse(savedAppointmentData);
          setAppointmentData(prev => ({
            ...prev,
            ...parsedData
          }));
          
          toast({
            title: "Datos recuperados",
            description: "Hemos restaurado la información que estabas completando",
            variant: "default"
          });
          
          return; // If we've recovered full data, no need to check individual fields
        } catch (e) {
          console.error("Error parsing saved appointment data:", e);
        }
      }
      
      // If no full recovery data, check for individual fields
      const selectedDate = sessionStorage.getItem('selectedDate');
      const selectedTime = sessionStorage.getItem('selectedTime');
      const selectedService = sessionStorage.getItem('selected_service');
      const selectedParticipants = sessionStorage.getItem('selected_participants');
      
      // Build an object with all recovered data
      const recoveredData: Partial<typeof appointmentData> = {};
      
      if (selectedDate) recoveredData.date = selectedDate;
      if (selectedTime) recoveredData.time = selectedTime;
      if (selectedService) recoveredData.service = selectedService;
      if (selectedParticipants) recoveredData.participants = selectedParticipants;
      
      // Update state with recovered data
      if (Object.keys(recoveredData).length > 0) {
        setAppointmentData(prev => ({
          ...prev,
          ...recoveredData
        }));
        
        // Highlight fields with recovered data
        setTimeout(() => {
          // Highlight date field if recovered
          if (selectedDate) {
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) {
              dateInput.classList.add('highlight-pulse');
              setTimeout(() => {
                dateInput.classList.remove('highlight-pulse');
              }, 2000);
            }
          }
          
          // Highlight time field if recovered
          if (selectedTime) {
            const timeSelect = document.querySelector('[name="time"]');
            if (timeSelect) {
              const parent = timeSelect.closest('.space-y-2');
              if (parent) {
                parent.classList.add('highlight-pulse');
                setTimeout(() => {
                  parent.classList.remove('highlight-pulse');
                }, 2000);
              }
            }
          }
          
          // Highlight service field if recovered
          if (selectedService) {
            const serviceSelect = document.querySelector('[name="service"]');
            if (serviceSelect) {
              const parent = serviceSelect.closest('.space-y-2');
              if (parent) {
                parent.classList.add('highlight-pulse');
                setTimeout(() => {
                  parent.classList.remove('highlight-pulse');
                }, 2000);
              }
            }
          }
          
          // Highlight participants field if recovered
          if (selectedParticipants) {
            const participantsSelect = document.querySelector('[name="participants"]');
            if (participantsSelect) {
              const parent = participantsSelect.closest('.space-y-2');
              if (parent) {
                parent.classList.add('highlight-pulse');
                setTimeout(() => {
                  parent.classList.remove('highlight-pulse');
                }, 2000);
              }
            }
          }
        }, 500);
        
        // If we have date and time, verify availability in the background
        if (selectedDate && selectedTime) {
          checkAppointmentAvailability(selectedDate, selectedTime)
            .then(({ available }) => {
              if (!available) {
                console.log("El horario seleccionado no está disponible, pero continuamos la transición");
                // Store this info to show after transition if needed
                sessionStorage.setItem('appointmentAvailabilityWarning', 'true');
              } else {
                sessionStorage.removeItem('appointmentAvailabilityWarning');
              }
            })
            .catch(error => {
              console.error("Error verificando disponibilidad:", error);
            });
        }
      }
    } catch (e) {
      console.error("Error recovering appointment data:", e);
    }
  }, []);
  
  const verifyAvailability = async (date: string, time: string) => {
    try {
      setCheckingAvailability(true);
      const { available } = await checkAppointmentAvailability(date, time);
      
      if (!available) {
        toast({
          title: "Horario no disponible",
          description: "Lo sentimos, este horario ya está reservado. Por favor, selecciona otro.",
          variant: "destructive"
        });
        
        // Resaltar visualmente que el horario no está disponible
        const timeSelect = document.querySelector('[name="time"]');
        if (timeSelect) {
          const parent = timeSelect.closest('.flex-1');
          if (parent) {
            parent.classList.add('border-destructive', 'ring', 'ring-destructive/20', 'shake-animation');
            setTimeout(() => {
              parent.classList.remove('border-destructive', 'ring', 'ring-destructive/20', 'shake-animation');
            }, 2000);
          }
        }
        
        setAppointmentData(prev => ({ ...prev, time: "" }));
      } else {
        toast({
          title: "Horario disponible",
          description: "¡Excelente elección! Este horario está disponible.",
          variant: "default"
        });
        
        // Resaltar visualmente que el horario está disponible
        const timeSelect = document.querySelector('[name="time"]');
        if (timeSelect) {
          const parent = timeSelect.closest('.flex-1');
          if (parent) {
            parent.classList.add('border-green-500', 'ring', 'ring-green-500/20', 'pulse-animation');
            setTimeout(() => {
              parent.classList.remove('border-green-500', 'ring', 'ring-green-500/20', 'pulse-animation');
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error("Error verificando disponibilidad:", error);
      toast({
        title: "Error",
        description: "Hubo un error al verificar la disponibilidad. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent default behavior that might cause form submission or navigation
    if (event) {
      event.preventDefault();
      
      // Extra safety - stop propagation as well to prevent form events
      if (event.stopPropagation) {
        event.stopPropagation();
      }
    }
    
    // Use setTimeout to defer state update and avoid potential form submission
    setTimeout(() => {
      // Update the form data state
      setAppointmentData(prev => ({ ...prev, [name]: value }));
      
      // Si se cambia la fecha o la hora, verificar disponibilidad
      if ((name === "date" && appointmentData.time) || (name === "time" && appointmentData.date)) {
        verifyAvailability(
          name === "date" ? value : appointmentData.date,
          name === "time" ? value : appointmentData.time
        );
      }
      
      // Store the selection in session storage to preserve it across page refreshes
      try {
        sessionStorage.setItem(`selected_${name}`, value);
      } catch (e) {
        console.error("Error storing selection in session storage:", e);
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      // Stop propagation to prevent any parent handlers from being triggered
      if (e.stopPropagation) e.stopPropagation();
      
      // Set form status to submitting to provide visual feedback
      setFormStatus('submitting');
    
    // Validación básica con mensajes de error específicos
    const requiredFields: { [key: string]: string } = {
      name: "Nombre completo",
      email: "Correo electrónico",
      date: "Fecha de la visita",
      time: "Hora",
      service: "Tipo de visita",
      participants: "Número de personas"
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, _]) => !appointmentData[key as keyof typeof appointmentData])
      .map(([_, label]) => label);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos incompletos",
        description: `Por favor, completa los siguientes campos: ${missingFields.join(', ')}.`,
        variant: "destructive"
      });
      
      // Resaltar visualmente los campos faltantes
      missingFields.forEach(fieldLabel => {
        const fieldName = Object.entries(requiredFields).find(([_, label]) => label === fieldLabel)?.[0];
        if (fieldName) {
          const element = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
          if (element) {
            const container = element.closest('.space-y-2') || element.parentElement;
            if (container) {
              container.classList.add('error-highlight');
              setTimeout(() => container.classList.remove('error-highlight'), 2000);
            }
          }
        }
      });
      
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(appointmentData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, introduce una dirección de correo válida.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Guardar datos en sessionStorage como respaldo
      try {
        sessionStorage.setItem('appointmentData', JSON.stringify(appointmentData));
      } catch (err) {
        console.error('Error saving to sessionStorage:', err);
      }
      
      // Verificar disponibilidad antes de enviar
      const { available } = await checkAppointmentAvailability(
        appointmentData.date,
        appointmentData.time
      );
      
      if (!available) {
        toast({
          title: "Horario no disponible",
          description: "Lo sentimos, este horario ya no está disponible. Por favor, selecciona otro.",
          variant: "destructive"
        });
        return;
      }
      
      // Crear la cita - añadir duración según el tipo de visita seleccionada
      const duracion = appointmentData.service === 'corta' ? '30 min' : '60 min';
      
      await createAppointment({
        ...appointmentData,
        userId: currentUser?.uid || null,
        status: 'pending',
        duracion,
        createdAt: new Date()
      });
      
      // Set status to submitted to provide visual feedback
      setFormStatus('submitted');
      
      toast({
        title: "¡Reserva exitosa!",
        description: "Tu cita ha sido programada. Te enviaremos un correo de confirmación.",
        variant: "default"
      });
      
      // Limpiar el formulario y sessionStorage
      setAppointmentData({
        name: userData?.name || "",
        email: currentUser?.email || "",
        phone: userData?.phone || "",
        date: "",
        time: "",
        service: "",
        participants: "1",
        notes: ""
      });
      
      // Limpiar sessionStorage relacionado con la cita
      try {
        sessionStorage.removeItem('appointmentData');
        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('selectedTime');
      } catch (err) {
        console.error('Error clearing sessionStorage:', err);
      }
      
    } catch (error) {
      console.error("Error al crear la cita:", error);
      // Set status to error to provide visual feedback
      setFormStatus('error');
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu reserva. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setFormStatus('idle');
    }
  } catch (error) {
    console.error("Unexpected error in handleSubmit:", error);
    setFormStatus('error');
    toast({
      title: "Error inesperado",
      description: "Ocurrió un error inesperado. Por favor, recarga la página e inténtalo de nuevo.",
      variant: "destructive"
    });
  }
  };
  
  const handleShowCalendar = () => {
    setShowCalendar(true);
  };
  
  const handleCalendarDateTimeSelect = (date?: Date, timeSlot?: string) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Actualizar los datos del formulario con la fecha seleccionada
      setAppointmentData(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      if (timeSlot) {
        // Actualizar los datos del formulario con la hora seleccionada y guardar en state
        setAppointmentData(prev => ({
          ...prev,
          time: timeSlot
        }));
        
        // También guardamos los datos en sessionStorage para mantenerlos
        // en caso de recarga de página u otras interacciones
        sessionStorage.setItem('selectedDateObj', JSON.stringify({
          date: formattedDate,
          time: timeSlot,
          formattedDate: format(date, "PPP", { locale: es })
        }));
        
        // Verificamos disponibilidad en segundo plano sin afectar la UX
        checkAppointmentAvailability(formattedDate, timeSlot)
          .then(({ available }) => {
            if (!available) {
              // Guardamos esta información para mostrarla después de la transición si es necesario
              sessionStorage.setItem('appointmentAvailabilityWarning', 'true');
            } else {
              // Si está disponible, limpiamos cualquier advertencia previa
              sessionStorage.removeItem('appointmentAvailabilityWarning');
            }
          })
          .catch(error => {
            console.error("Error al verificar disponibilidad:", error);
          });
      }
    }
  };
  
  const handleViewAppointmentForm = () => {
    // Cerrar el modal del calendario
    setShowCalendar(false);
    
    // Preparamos todo lo necesario antes de hacer cualquier cambio visual
    
    // 1. Preparar el formulario con la fecha y hora seleccionadas
    // 2. Posicionar el formulario correctamente en el DOM sin scroll
    // 3. Hacer visibles los elementos cuando todo esté listo

    // Buscar el overlay que creamos en AppointmentCalendarNew usando el ID específico
    const overlayElement = document.getElementById('transition-overlay');
    
    if (!overlayElement) {
      console.error("No se encontró el overlay de transición");
      return;
    }

    // Función para destacar los campos de fecha y hora
    const highlightDateTimeFields = () => {
      const dateInput = document.getElementById('appointment-date');
      const timeSelect = document.querySelector('[name="time"]');
      
      if (dateInput) {
        dateInput.classList.add('highlight-pulse');
        setTimeout(() => {
          dateInput.classList.remove('highlight-pulse');
        }, 2000);
      }
      
      if (timeSelect) {
        const parent = timeSelect.closest('.space-y-2');
        if (parent) {
          parent.classList.add('highlight-pulse');
          setTimeout(() => {
            parent.classList.remove('highlight-pulse');
          }, 2000);
        }
      }
    };

    // Preparar el formulario
    const formElement = document.getElementById('reservation-form');
    if (formElement) {
      // Posicionar el formulario en el viewport pero mantenerlo oculto
      formElement.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    
    // Iniciar la transición para mostrar el formulario
    setTimeout(() => {
      // Mover el overlay para revelar el formulario con una transición suave
      if (overlayElement) {
        // Animación para desvanecerse
        overlayElement.classList.add('transition-all', 'duration-500');
        overlayElement.style.opacity = '0';
        
        // Eliminar el overlay cuando termine la transición
        setTimeout(() => {
          if (overlayElement.parentNode) {
            overlayElement.parentNode.removeChild(overlayElement);
          }
          
          // Después de que el overlay desaparezca, destacar los campos
          highlightDateTimeFields();
          
          // Focus automático en el siguiente campo que requiera atención
          const nextEmptyInput = document.querySelector('input[required]:not([value]):not([id="appointment-date"]), select[required]:not([name="time"]) option:not([value]):checked');
          if (nextEmptyInput) {
            (nextEmptyInput as HTMLElement).focus();
          }
        }, 500);
      }
    }, 600); // Tiempo suficiente para que el formulario esté listo
  };

  return (
    <section id="agenda" className="py-20 bg-accent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-primary text-4xl md:text-5xl font-bold text-primary mb-6">
            ¿Listo para descubrir tu esencia?
          </h2>
          <p className="font-secondary text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Reserva tu asesoramiento personalizado y vive una experiencia olfativa inolvidable
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Formulario de Reserva */}
          <Card className="bg-background shadow-lg" id="appointment-card">
            <CardHeader>
              <CardTitle className="font-primary text-2xl">Reserva tu Visita</CardTitle>
              {appointmentData.date && appointmentData.time && (
                <div className="mt-2 text-sm text-muted-foreground form-appear">
                  <div className="flex items-center space-x-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Has seleccionado:</span>
                  </div>
                  <p className="pl-6 mt-1">
                    {format(new Date(appointmentData.date), "EEEE d 'de' MMMM", { locale: es })} a las {appointmentData.time}h
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form 
                id="reservation-form" 
                onSubmit={handleSubmit} 
                className={`space-y-4 opacity-100 transition-opacity duration-300 
                  ${formStatus === 'submitting' ? 'opacity-75 pointer-events-none' : ''} 
                  ${formStatus === 'submitted' ? 'submitted-form' : ''}
                  ${formStatus === 'error' ? 'error-form' : ''}`}
                data-submitting={formStatus === 'submitting' ? 'true' : 'false'}
                onClick={(e) => {
                  // Prevent clicks from accidentally submitting the form
                  if (e.target === e.currentTarget || 
                      (e.target as HTMLElement).tagName === 'DIV' ||
                      (e.target as HTMLElement).getAttribute('role') === 'combobox') {
                    e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent Enter key from submitting the form except in specific input elements
                  if (e.key === 'Enter' && 
                      (e.target as HTMLElement).tagName !== 'TEXTAREA' && 
                      (e.target as HTMLElement).tagName !== 'BUTTON' &&
                      (e.target as HTMLElement).getAttribute('type') !== 'submit') {
                    e.preventDefault();
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={appointmentData.name} 
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={appointmentData.email} 
                      onChange={handleInputChange}
                      placeholder="tu@email.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      value={appointmentData.phone} 
                      onChange={handleInputChange}
                      placeholder="+34 600 000 000" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Tipo de visita *</Label>
                    
                    {/* Componente para móviles */}
                    <NativeMobileSelect
                      name="service"
                      id="service"
                      value={appointmentData.service}
                      onChange={(value) => handleSelectChange("service", value)}
                      placeholder="Selecciona un tipo de visita"
                      options={[
                        { value: "corta", label: "Visita Express (30min)" },
                        { value: "completa", label: "Visita Completa (60min)" }
                      ]}
                      className="service-select-wrapper no-translate block md:hidden"
                      required={true}
                      disabled={formStatus === 'submitting'}
                    />
                    
                    {/* Mantenemos el select original pero solo se mostrará en desktop */}
                    <div className="hidden md:block">
                      <Select 
                        name="service" 
                        value={appointmentData.service} 
                        onValueChange={(value) => {
                          try {
                            handleSelectChange("service", value);
                          } catch (err) {
                            console.error("Error al seleccionar servicio:", err);
                            toast({
                              title: "Error",
                              description: "Ocurrió un problema al seleccionar el servicio. Inténtalo nuevamente.",
                              variant: "destructive"
                            });
                          }
                        }}
                        required
                      >
                        <SelectTrigger 
                          id="service-trigger" 
                          onClick={(e) => {
                            // Prevent triggering form submission when opening dropdown
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className={formStatus === 'submitting' ? 'opacity-50' : ''}
                        >
                          <SelectValue placeholder="Selecciona un tipo de visita" />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          sideOffset={5}
                          className="mobile-dropdown-fix"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                          onPointerDownOutside={(e) => {
                            e.preventDefault();
                            // Solución universal para todos los navegadores
                            setTimeout(() => {
                              const body = document.body;
                              body.style.touchAction = "auto";
                              body.classList.remove("select-open");
                              
                              // Verificar el dispositivo
                              if(/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                                // Forzar reflow del DOM para corregir problemas visuales
                                document.body.getBoundingClientRect();
                              }
                            }, 200);
                          }}
                        >
                          <SelectItem value="corta" onSelect={(e) => e.preventDefault()}>Visita Express (30 min)</SelectItem>
                          <SelectItem value="completa" onSelect={(e) => e.preventDefault()}>Visita Completa (60 min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="date">Fecha de la visita *</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleShowCalendar}
                        className="text-xs"
                      >
                        Ver disponibilidad
                      </Button>
                    </div>
                    <Input 
                      id="appointment-date" 
                      name="date" 
                      type="date" 
                      value={appointmentData.date} 
                      onChange={handleInputChange}
                      required 
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
                    
                    {/* Componente para móviles */}
                    <NativeMobileSelect
                      name="time"
                      id="time"
                      value={appointmentData.time}
                      onChange={(value) => handleSelectChange("time", value)}
                      placeholder="Selecciona una hora"
                      className="no-translate block md:hidden"
                      options={[
                        { value: "09:30", label: "09:30" },
                        { value: "10:00", label: "10:00" },
                        { value: "10:30", label: "10:30" },
                        { value: "11:00", label: "11:00" },
                        { value: "11:30", label: "11:30" },
                        { value: "12:00", label: "12:00" },
                        { value: "12:30", label: "12:30" },
                        { value: "15:00", label: "15:00" },
                        { value: "15:30", label: "15:30" },
                        { value: "16:00", label: "16:00" },
                        { value: "16:30", label: "16:30" },
                        { value: "17:00", label: "17:00" },
                        { value: "17:30", label: "17:30" },
                        { value: "18:00", label: "18:00" },
                        { value: "18:30", label: "18:30" },
                        { value: "19:00", label: "19:00" },
                        { value: "19:30", label: "19:30" },
                        { value: "20:00", label: "20:00" },
                        { value: "20:30", label: "20:30" }
                      ]}
                      required={true}
                      disabled={formStatus === 'submitting'}
                    />
                    
                    {/* Mantenemos el select original pero solo se mostrará en desktop */}
                    <div className="hidden md:block">
                      <Select 
                        name="time" 
                        value={appointmentData.time} 
                        onValueChange={(value) => {
                          try {
                            handleSelectChange("time", value);
                          } catch (err) {
                            console.error("Error al seleccionar hora:", err);
                            toast({
                              title: "Error",
                              description: "Ocurrió un problema al seleccionar la hora. Inténtalo nuevamente.",
                              variant: "destructive"
                            });
                          }
                        }}
                        required
                      >
                        <SelectTrigger 
                          id="time-trigger" 
                          onClick={(e) => {
                            // Prevent triggering form submission when opening dropdown
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className={formStatus === 'submitting' ? 'opacity-50' : ''}
                        >
                          <SelectValue placeholder="Selecciona una hora" />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          sideOffset={5}
                          className="mobile-dropdown-fix"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                          onPointerDownOutside={(e) => {
                            e.preventDefault();
                            setTimeout(() => {
                              document.body.style.touchAction = "auto";
                              document.body.classList.remove("select-open");
                            }, 200);
                          }}
                        >
                          <SelectItem value="09:30" onSelect={(e) => e.preventDefault()}>09:30</SelectItem>
                          <SelectItem value="10:00" onSelect={(e) => e.preventDefault()}>10:00</SelectItem>
                          <SelectItem value="10:30" onSelect={(e) => e.preventDefault()}>10:30</SelectItem>
                          <SelectItem value="11:00" onSelect={(e) => e.preventDefault()}>11:00</SelectItem>
                          <SelectItem value="11:30" onSelect={(e) => e.preventDefault()}>11:30</SelectItem>
                          <SelectItem value="12:00" onSelect={(e) => e.preventDefault()}>12:00</SelectItem>
                          <SelectItem value="12:30" onSelect={(e) => e.preventDefault()}>12:30</SelectItem>
                          <SelectItem value="15:00" onSelect={(e) => e.preventDefault()}>15:00</SelectItem>
                          <SelectItem value="15:30" onSelect={(e) => e.preventDefault()}>15:30</SelectItem>
                          <SelectItem value="16:00" onSelect={(e) => e.preventDefault()}>16:00</SelectItem>
                          <SelectItem value="16:30" onSelect={(e) => e.preventDefault()}>16:30</SelectItem>
                          <SelectItem value="17:00" onSelect={(e) => e.preventDefault()}>17:00</SelectItem>
                          <SelectItem value="17:30" onSelect={(e) => e.preventDefault()}>17:30</SelectItem>
                          <SelectItem value="18:00" onSelect={(e) => e.preventDefault()}>18:00</SelectItem>
                          <SelectItem value="18:30" onSelect={(e) => e.preventDefault()}>18:30</SelectItem>
                          <SelectItem value="19:00" onSelect={(e) => e.preventDefault()}>19:00</SelectItem>
                          <SelectItem value="19:30" onSelect={(e) => e.preventDefault()}>19:30</SelectItem>
                          <SelectItem value="20:00" onSelect={(e) => e.preventDefault()}>20:00</SelectItem>
                          <SelectItem value="20:30" onSelect={(e) => e.preventDefault()}>20:30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="participants">Número de personas *</Label>
                    
                    {/* Componente para móviles */}
                    <NativeMobileSelect
                      name="participants"
                      id="participants"
                      value={appointmentData.participants}
                      onChange={(value) => handleSelectChange("participants", value)}
                      placeholder="Selecciona cantidad"
                      className="no-translate block md:hidden"
                      options={[
                        { value: "1", label: "1 persona" },
                        { value: "2", label: "2 personas" },
                        { value: "3", label: "3 personas" },
                        { value: "4", label: "4 personas" },
                        { value: "5", label: "5 personas" },
                        { value: "6", label: "6 personas" }
                      ]}
                      required={true}
                      disabled={formStatus === 'submitting'}
                    />
                    
                    {/* Mantenemos el select original pero solo se mostrará en desktop */}
                    <div className="hidden md:block">
                      <Select 
                        name="participants" 
                        value={appointmentData.participants} 
                        onValueChange={(value) => {
                          try {
                            handleSelectChange("participants", value);
                          } catch (err) {
                            console.error("Error al seleccionar participantes:", err);
                            toast({
                              title: "Error",
                              description: "Ocurrió un problema al seleccionar la cantidad de personas. Inténtalo nuevamente.",
                              variant: "destructive"
                            });
                          }
                        }}
                        required
                      >
                        <SelectTrigger 
                          id="participants-trigger" 
                          onClick={(e) => {
                            // Prevent triggering form submission when opening dropdown
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          className={formStatus === 'submitting' ? 'opacity-50' : ''}
                        >
                          <SelectValue placeholder="Selecciona cantidad" />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          sideOffset={5}
                          className="mobile-dropdown-fix"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                          onPointerDownOutside={(e) => {
                            e.preventDefault();
                            setTimeout(() => {
                              document.body.style.touchAction = "auto";
                              document.body.classList.remove("select-open");
                            }, 200);
                          }}
                        >
                          <SelectItem value="1" onSelect={(e) => e.preventDefault()}>1 persona</SelectItem>
                          <SelectItem value="2" onSelect={(e) => e.preventDefault()}>2 personas</SelectItem>
                          <SelectItem value="3" onSelect={(e) => e.preventDefault()}>3 personas</SelectItem>
                          <SelectItem value="4" onSelect={(e) => e.preventDefault()}>4 personas</SelectItem>
                          <SelectItem value="5" onSelect={(e) => e.preventDefault()}>5 personas</SelectItem>
                          <SelectItem value="6" onSelect={(e) => e.preventDefault()}>6 personas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={appointmentData.notes} 
                      onChange={handleInputChange}
                      placeholder="Preferencias, alergias, consultas..." 
                      rows={4}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={`w-full font-secondary ${formStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={loading || checkingAvailability || formStatus === 'submitting' || formStatus === 'submitted'}
                >
                  {formStatus === 'submitting' ? "Procesando..." : 
                   formStatus === 'submitted' ? "¡Reservado!" : 
                   loading ? "Procesando..." : "Reservar Ahora"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de Calendario de Disponibilidad */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-primary text-xl font-semibold">Selecciona fecha y hora para tu visita</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCalendar(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-3 text-sm border-b pb-3">
                <p className="flex items-center mb-1">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span>Horario de atención: <span className="font-medium">De 9.30 a 13 y de 15 a 21</span></span>
                </p>
                <p className="text-muted-foreground">Nuestro servicio está disponible de lunes a viernes. No ofrecemos visitas en fines de semana.</p>
              </div>
              <AppointmentCalendarNew 
                onSelectDateTime={handleCalendarDateTimeSelect}
                onViewAppointmentForm={handleViewAppointmentForm}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Pantalla de carga al seleccionar fecha y hora - con mejoras visuales */}
      {showLoadingScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-background to-primary/10 backdrop-blur-sm flex items-center justify-center z-50 loading-screen-overlay transition-opacity duration-500">
          <div className="text-center px-8 py-10 rounded-xl bg-background/80 shadow-2xl border border-primary/20 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="font-primary text-2xl font-semibold mb-3">Preparando tu visita</h3>
            <p className="text-muted-foreground mb-2">Estamos configurando tu experiencia para el día seleccionado</p>
            <div className="flex justify-center space-x-1 mt-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Appointment;
