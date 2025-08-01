import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <footer className="bg-elegant text-elegant-foreground py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-primary text-3xl font-bold mb-4">NUVÓ</h3>
            <p className="font-secondary text-sm font-light leading-relaxed mb-6 opacity-90">
              Resignificando el perfume como una experiencia íntima, artística y atemporal.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="p-2 border-elegant-foreground/20 hover:bg-elegant-foreground/10">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2 border-elegant-foreground/20 hover:bg-elegant-foreground/10">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2 border-elegant-foreground/20 hover:bg-elegant-foreground/10">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-primary text-lg font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              {[
                { name: "Quiénes Somos", href: "/nosotros" },
                { name: "Productos", href: "#productos" },
                { name: "Cata de Perfumes", href: "#cata" },
                { name: "Testimonios", href: "#testimonios" }
              ].map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    isHomePage ? (
                      <a
                        href={link.href}
                        className="font-secondary text-sm opacity-90 hover:opacity-100 transition-opacity duration-200"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={`/${link.href}`}
                        className="font-secondary text-sm opacity-90 hover:opacity-100 transition-opacity duration-200"
                      >
                        {link.name}
                      </Link>
                    )
                  ) : (
                    <Link
                      to={link.href}
                      className="font-secondary text-sm opacity-90 hover:opacity-100 transition-opacity duration-200"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-primary text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {[
                "Cata Íntima",
                "Cata de Pareja", 
                "Cata Grupal",
                "Consulta Personalizada",
                "Agenda tu Cita"
              ].map((service) => (
                <li key={service}>
                  <span className="font-secondary text-sm opacity-90">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-primary text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 opacity-70" />
                <span className="font-secondary text-sm">Nuvonicheparfum@gmail.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 opacity-70" />
                <span className="font-secondary text-sm">+54 11 1234-5678</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 opacity-70" />
                <span className="font-secondary text-sm">Avenida san Martín 3430, Vaqueros</span>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="font-secondary text-sm font-medium mb-2">Newsletter</h5>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="font-secondary bg-elegant-foreground/10 border-elegant-foreground/20 text-elegant-foreground placeholder:text-elegant-foreground/60 text-xs"
                />
                <Button variant="secondary" size="sm" className="font-secondary">
                  <Mail className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-elegant-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-secondary text-sm opacity-70 mb-4 md:mb-0">
              © {currentYear} NUVÓ. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="font-secondary text-sm opacity-70 hover:opacity-100 transition-opacity">
                Política de Privacidad
              </a>
              <a href="#" className="font-secondary text-sm opacity-70 hover:opacity-100 transition-opacity">
                Términos y Condiciones
              </a>
            </div>
          </div>
          
          {/* Brand Values */}
          <div className="mt-8 text-center">
            <p className="font-secondary text-xs opacity-60 leading-relaxed max-w-2xl mx-auto">
              "Elegancia que perdura en el tiempo. Perfumes exclusivos con un toque personal."
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;