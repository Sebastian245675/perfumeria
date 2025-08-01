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
  'cata-intima': 'Cata Íntima (45 min)',
  'cata-pareja': 'Cata de Pareja (60 min)',
  'cata-grupal': 'Cata Grupal (90 min)',
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
    
    const mailOptions = {
      from: '"NUVÓ Essence Ritual" <Nuvonicheparfum@gmail.com>',
      to: email,
      subject: 'Recibimos tu solicitud - NUVÓ Essence Ritual',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E7DCD1; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="NUVÓ Essence Ritual" style="max-width: 150px; margin-bottom: 10px;" />
          </div>
          
          <div style="background-color: #FAF9F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #C2A59D; margin-top: 0;">¡Hola ${name}!</h2>
            <p style="color: #1C1C1C; line-height: 1.5;">Tu solicitud de reserva ha sido recibida. A continuación, encontrarás los detalles:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #E7DCD1; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceNames[service] || service}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            
            <p style="color: #1C1C1C; line-height: 1.5;">En caso de haber algún cambio, nos pondremos en contacto contigo próximamente.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E7DCD1;">
            <p style="color: #1C1C1C; font-size: 14px;">Si tienes alguna pregunta, por favor contáctanos a <a href="mailto:Nuvonicheparfum@gmail.com" style="color: #C2A59D;">Nuvonicheparfum@gmail.com</a></p>
            <p style="color: #1C1C1C; font-size: 12px; margin-top: 20px;">© 2025 NUVÓ Essence Ritual. Todos los derechos reservados.</p>
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
        to: 'juansalazat100@gmail.com',
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

// Función para enviar correo cuando el estado de la cita cambia a confirmada
exports.sendAppointmentStatusUpdate = onDocumentUpdated('appointments/{appointmentId}', async (event) => {
  const beforeSnapshot = event.data.before;
  const afterSnapshot = event.data.after;
  
  if (!beforeSnapshot || !afterSnapshot) {
    logger.log('No data associated with the event');
    return;
  }
  
  const before = beforeSnapshot.data();
  const after = afterSnapshot.data();
  
  // Solo proceder si el estado cambió a 'confirmed'
  if (before.status !== 'confirmed' && after.status === 'confirmed') {
      const { email, name, date, time, service, phone = 'No proporcionado' } = after;
      
      // Función para capitalizar la primera letra del nombre
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
          <div style="font-family: 'Playfair Display', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #FFFFFF, #F8F6F2); box-shadow: 0 8px 30px rgba(0,0,0,0.12); border-radius: 12px; overflow: hidden;">
            <!-- Header Banner with Gold Accent -->
            <div style="background: linear-gradient(135deg, #222222 0%, #3A3A3A 100%); padding: 30px 20px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #C2A383 0%, #E2D1BB 50%, #C2A383 100%);"></div>
              <img src="${LOGO_URL}" alt="NUVÓ Essence Ritual" style="max-width: 180px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
              <h1 style="color: #E2D1BB; margin: 20px 0 5px; font-size: 28px; font-weight: 300; letter-spacing: 3px;">CITA CONFIRMADA</h1>
              <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #C2A383, transparent); margin: 15px auto;"></div>
            </div>
            
            <!-- Main Content with Elegant Layout -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #3A3A3A; font-weight: 400; font-size: 24px; margin-top: 0; text-align: center; letter-spacing: 1px;">
                <span style="border-bottom: 1px solid #C2A383; padding-bottom: 5px;">Tu cita está confirmada</span>
              </h2>
              
              <p style="color: #555555; line-height: 1.8; font-size: 16px; margin: 10px 0; text-align: center; font-style: italic;">
                Estimad${name.toLowerCase().endsWith('a') ? 'a' : 'o'} <span style="color: #C2A383; font-weight: 500;">${formattedName}</span>
              </p>
              
              <div style="background-color: #f5f0ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #333333; line-height: 1.8; font-size: 18px; text-align: center; font-weight: bold;">
                  Tu cita ya ha sido confirmada! Nuestro equipo te acompañará en un recorrido personalizado por fragancias de autor, seleccionadas especialmente para que encuentres ese aroma que hable de ti.
                </p>
              </div>
              
              <!-- Elegant Details Card -->
              <div style="background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,246,242,0.9) 100%); border-left: 3px solid #C2A383; padding: 25px; margin: 35px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-radius: 4px;">
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
                        <span style="color: #333333;">Avenida san Martín 3430, Vaqueros</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Location Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://maps.app.goo.gl/NqbLQLUD2CSCmAED7" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C2A383 0%, #E2D1BB 100%); color: #FFFFFF; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; letter-spacing: 1px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                  <span style="display: inline-flex; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13C19 5.1 15.9 2 12 2z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
                    IR A LA UBICACIÓN
                  </span>
                </a>
              </div>

              <!-- Important Notes -->
              <div style="background-color: rgba(194,163,131,0.1); border-radius: 4px; padding: 20px; margin: 30px 0; border-left: 3px solid #C2A383;">
                <h3 style="color: #C2A383; margin-top: 0; font-size: 18px; font-weight: 500;">Información importante:</h3>
                <ul style="color: #555555; line-height: 1.7; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Te esperamos con una <span style="color: #333333; font-weight: 500;">tolerancia de 15 minutos</span>. Recomendamos llegar unos minutos antes para comenzar tu experiencia puntualmente.</li>
                  <li style="margin-bottom: 10px;">Te sugerimos evitar usar perfumes el día de tu visita para apreciar mejor las fragancias.</li>
                  <li style="margin-bottom: 10px;">Nuestro equipo está a tu disposición por cualquier consulta o cambio que necesites realizar.</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer with Gold Details -->
            <div style="background: linear-gradient(to bottom, rgba(58,58,58,0.95) 0%, rgba(34,34,34,0.95) 100%); color: #FFFFFF; text-align: center; padding: 30px 20px; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #C2A383 0%, #E2D1BB 50%, #C2A383 100%);"></div>
              <p style="color: #C2A383; font-size: 18px; letter-spacing: 1px; margin-bottom: 15px;">NUVÓ</p>
              <p style="color: #E2D1BB; font-size: 14px; margin-bottom: 5px; font-weight: 300;">ESSENCE RITUAL</p>
              <div style="width: 40px; height: 1px; background: rgba(194,163,131,0.5); margin: 20px auto;"></div>
              <p style="color: #AAA; font-size: 14px; margin-top: 20px; font-weight: 300;">© 2025 NUVÓ Essence Ritual. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      };
      
      try {
        await mailTransport.sendMail(mailOptions);
        logger.log('Correo de confirmación de estado enviado a:', email);
        
        // Enviar notificación al administrador sobre la confirmación
        const adminMailOptions = {
          from: '"NUVÓ Essence Ritual" <Nuvonicheparfum@gmail.com>',
          to: 'juansalazat100@gmail.com',
          subject: 'Nueva cita agendada - NUVÓ Essence Ritual',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E7DCD1; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${LOGO_URL}" alt="NUVÓ Essence Ritual" style="max-width: 150px; margin-bottom: 10px;" />
              </div>
              
              <div style="background-color: #FAF9F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #C2A59D; margin-top: 0;">Nueva cita agendada</h2>
                <p style="color: #1C1C1C; line-height: 1.5;">Detalles de la reserva:</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #E7DCD1; border-radius: 8px;">
                  <p style="margin: 5px 0;"><strong>Cliente:</strong> ${name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${phone}</p>
                  <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceNames[service] || service}</p>
                  <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
                  <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
                </div>
              </div>
            </div>
          `
        };
        
        await mailTransport.sendMail(adminMailOptions);
        logger.log('Notificación de cita confirmada enviada al administrador');
        
        return null;
      } catch (error) {
        logger.error('Error al enviar el correo de confirmación de estado:', error);
        return null;
      }
    }
    
    return null;
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
