/**
 * Import function triggers from their respective submodules:
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// URL del logo para usar en los correos - URL de Cloudinary
const LOGO_URL = "https://res.cloudinary.com/dh8paxjkd/image/upload/v1753989907/Picsart_25-07-31_10-55-25-354_zqrmxr.png"; // Logo alojado en Cloudinary

// Configuración de correo
const mailTransport = nodemailer.createTransport({
  service: 'gmail',  // Puedes usar otro servicio como 'sendgrid', 'mailgun', etc.
  auth: {
    user: 'j24291972@gmail.com',
    pass: 'ufxx grvv atvb jued'  // Reemplaza esto con la App Password que generaste en Google
  }
});

// Mapeo de servicios para el correo
const serviceNames = {
  'individual': 'Asesoramiento Personalizado (45 min)',
  'pareja': 'Asesoramiento Personalizado (60 min)',
  'grupo': 'Asesoramiento Personalizado (90 min)',
  'consulta-productos': 'Consulta de Productos (30 min)',
  'compra-perfumes': 'Compra Personalizada (60 min)'
};

// Función para enviar correo de confirmación cuando se crea una nueva cita
exports.sendAppointmentConfirmation = onDocumentCreated('appointments/{appointmentId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log('No data associated with the event');
    return;
  }
  
  const appointmentData = snapshot.data();
  const { email, name, date, time, service, phone = 'No proporcionado' } = appointmentData;
    
    // Función para formatear el nombre correctamente
    const formatName = (fullName) => {
      return fullName.split(' ').map(name => 
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      ).join(' ');
    };
    
    const formattedName = formatName(name);
    
    const mailOptions = {
      from: '"NUVÓ Essence Ritual" <Nuvonicheparfum@gmail.com>',
      to: email,
      subject: 'Tu cita ha sido confirmada - NUVÓ Essence Ritual',
      html: `
        <div style="font-family: 'Playfair Display', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden;">
          <!-- Header Banner with Gold Accent -->
          <div style="background-color: #F8F6F2; padding: 30px 20px; text-align: center; position: relative; border-bottom: 3px solid #C2A383;">
            <img src="${LOGO_URL}" alt="NUVÓ Essence Ritual" style="max-width: 180px;" />
            <h1 style="color: #C2A383; margin: 20px 0 5px; font-size: 24px; font-weight: 400; letter-spacing: 2px;">CITA CONFIRMADA</h1>
          </div>
          
          <!-- Main Content with Elegant Layout -->
          <div style="padding: 30px;">
            <p style="color: #555555; line-height: 1.8; font-size: 16px; margin: 10px 0; text-align: center;">
              Estimad${name.toLowerCase().endsWith('a') ? 'a' : 'o'} <span style="color: #C2A383; font-weight: 500;">${formattedName}</span>
            </p>
            
            <div style="background-color: #F8F6F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #C2A383;">
              <p style="color: #333333; line-height: 1.8; font-size: 18px; text-align: center; font-weight: 500;">
                Tu cita ya ha sido confirmada!
              </p>
              <p style="color: #555555; line-height: 1.8; font-size: 16px; text-align: center; margin-top: 12px;">
                Nuestro equipo te acompañará en un recorrido personalizado por fragancias de autor, seleccionadas especialmente para que encuentres ese aroma que hable de ti.
              </p>
            </div>
            
            <!-- Elegant Details Card -->
            <div style="background-color: #FFFFFF; border: 1px solid #E2D1BB; padding: 25px; margin: 25px 0; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 5px; border-bottom: 1px solid rgba(194,163,131,0.2);">
                    <div style="display: flex;">
                      <div style="width: 24px; text-align: center; margin-right: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#C2A383"><path d="M19,4h-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1H8V3c0-0.6-0.4-1-1-1S6,2.4,6,3v1H5C3.3,4,2,5.3,2,7v12c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V7C22,5.3,20.7,4,19,4z M20,19c0,0.6-0.4,1-1,1H5c-0.6,0-1-0.4-1-1V10h16V19z"></path></svg>
                      </div>
                      <strong style="color: #666666; font-weight: 500; width: 80px; display: inline-block;">Fecha:</strong>
                      <span style="color: #333333;">${date}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 5px; border-bottom: 1px solid rgba(194,163,131,0.2);">
                    <div style="display: flex;">
                      <div style="width: 24px; text-align: center; margin-right: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#C2A383"><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S16.4,20,12,20z M12.5,7H11v6l5.2,3.2l0.8-1.3l-4.5-2.7V7z"></path></svg>
                      </div>
                      <strong style="color: #666666; font-weight: 500; width: 80px; display: inline-block;">Hora:</strong>
                      <span style="color: #333333;">${time}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 5px; border-bottom: 1px solid rgba(194,163,131,0.2);">
                    <div style="display: flex;">
                      <div style="width: 24px; text-align: center; margin-right: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#C2A383"><path d="M19,2H5C3.3,2,2,3.3,2,5v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V5C22,3.3,20.7,2,19,2z M20,19c0,0.6-0.4,1-1,1H5c-0.6,0-1-0.4-1-1V5c0-0.6,0.4-1,1-1h14c0.6,0,1,0.4,1,1V19z M12,6c-3.9,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7S15.9,6,12,6z M12,18c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S14.8,18,12,18z"></path></svg>
                      </div>
                      <strong style="color: #666666; font-weight: 500; width: 80px; display: inline-block;">Servicio:</strong>
                      <span style="color: #333333;">${serviceNames[service] || service}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 5px;">
                    <div style="display: flex;">
                      <div style="width: 24px; text-align: center; margin-right: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#C2A383"><path d="M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z"></path></svg>
                      </div>
                      <strong style="color: #666666; font-weight: 500; width: 80px; display: inline-block;">Dirección:</strong>
                      <span style="color: #333333;">Avenida San Martín 3430, Vaqueros</span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Location Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://maps.app.goo.gl/Bz7ynmCPdZDRFruB9" target="_blank" style="display: inline-block; background-color: #C2A383; color: #FFFFFF; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: 500; letter-spacing: 1px;">
                <span style="display: inline-flex; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13C19 5.1 15.9 2 12 2z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
                  VER UBICACIÓN
                </span>
              </a>
            </div>

            <!-- Important Notes -->
            <div style="background-color: #F8F6F2; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #C2A383; margin-top: 0; font-size: 18px; font-weight: 500;">Información importante:</h3>
              <ul style="color: #555555; line-height: 1.7; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Te esperamos con una <span style="font-weight: 500;">tolerancia de 15 minutos</span>. Recomendamos llegar unos minutos antes para comenzar tu experiencia puntualmente.</li>
                <li style="margin-bottom: 10px;">Te sugerimos evitar usar perfumes el día de tu visita para apreciar mejor las fragancias.</li>
                <li style="margin-bottom: 10px;">Nuestro equipo está a tu disposición por cualquier consulta o cambio que necesites realizar.</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F8F6F2; text-align: center; padding: 20px; border-top: 1px solid #E2D1BB;">
            <p style="color: #C2A383; font-size: 18px; letter-spacing: 1px; margin-bottom: 5px;">NUVÓ</p>
            <p style="color: #666666; font-size: 14px; margin-bottom: 5px; font-weight: 300;">ESSENCE RITUAL</p>
            <p style="color: #999999; font-size: 12px; margin-top: 15px;">© 2025 NUVÓ Essence Ritual. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };
    
    try {
      await mailTransport.sendMail(mailOptions);
      console.log('Correo de confirmación enviado a:', email);
      
      // Enviar notificación al administrador
      const adminMailOptions = {
        from: '"NUVÓ Essence Ritual" <Nuvonicheparfum@gmail.com>',
        to: 'Nuvonicheparfum@gmail.com',
        subject: 'Nueva solicitud de reserva - NUVÓ Essence Ritual',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E7DCD1; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${LOGO_URL}" alt="NUVÓ Essence Ritual" style="max-width: 150px; margin-bottom: 10px;" />
            </div>
            
            <div style="background-color: #FAF9F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #C2A59D; margin-top: 0;">Nueva solicitud de reserva</h2>
              <p style="color: #1C1C1C; line-height: 1.5;">Se ha recibido una nueva solicitud de reserva:</p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #E7DCD1; border-radius: 8px;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${phone}</p>
                <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceNames[service] || service}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7DCD1;">
              <p style="color: #1C1C1C; font-size: 12px; margin-top: 20px;">© 2025 NUVÓ Essence Ritual. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      };
      
      await mailTransport.sendMail(adminMailOptions);
      console.log('Notificación de nueva reserva enviada al administrador');
      
      // Actualizar el documento para indicar que se envió el correo
      try {
        const appointmentId = event.params.appointmentId;
        const appointmentRef = admin.firestore().collection('appointments').doc(appointmentId);
        await appointmentRef.update({
          emailSent: true,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        logger.error('Error al actualizar el documento:', error);
      }
      
      return null;
    } catch (error) {
      logger.error('Error al enviar el correo de confirmación:', error);
      return null;
    }
});

// Import setGlobalOptions from the correct location
const { setGlobalOptions } = require("firebase-functions/v2");
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
