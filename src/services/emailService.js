import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_16k0tde',
  templateId: 'template_acw6088',
  publicKey: 'stmTtyoYAX7_yd71t',
  privateKey: 'eUvIpj44ROgnORSuHmmXT'
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// Company branding
const COMPANY_NAME = 'Gazra Mitra';
const COMPANY_COLOR = '#6366f1';
const COMPANY_LOGO = '🌈';

/**
 * Base email template with beautiful styling
 */
const createEmailTemplate = (content, language = 'en') => {
  const brandColors = {
    primary: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    dark: '#1f2937',
    light: '#f3f4f6'
  };

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${COMPANY_NAME}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: ${brandColors.primary};
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: all 0.3s;
        }
        .button:hover {
          background: ${brandColors.secondary};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .info-box {
          background: ${brandColors.light};
          border-left: 4px solid ${brandColors.primary};
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .info-box h3 {
          margin-top: 0;
          color: ${brandColors.primary};
        }
        .footer {
          background: ${brandColors.dark};
          color: white;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: ${brandColors.secondary};
          text-decoration: none;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: white;
          font-size: 24px;
          text-decoration: none;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary});
          margin: 30px 0;
        }
        .highlight {
          color: ${brandColors.primary};
          font-weight: 600;
        }
        .success-badge {
          display: inline-block;
          background: ${brandColors.success};
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${COMPANY_LOGO}</div>
          <h1>${COMPANY_NAME}</h1>
        </div>
        ${content}
        <div class="footer">
          <div class="social-links">
            <a href="#" title="Facebook">📘</a>
            <a href="#" title="Twitter">🐦</a>
            <a href="#" title="Instagram">📸</a>
            <a href="#" title="LinkedIn">💼</a>
          </div>
          <p>
            <strong>${COMPANY_NAME}</strong><br>
            Connecting communities, empowering lives<br>
            Supporting LGBTQAI+ individuals & women
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            You're receiving this email because you're a valued member of our community.<br>
            <a href="#" style="color: ${brandColors.secondary};">Unsubscribe</a> | 
            <a href="#" style="color: ${brandColors.secondary};">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Welcome Email Template
 */
export const getWelcomeEmailContent = (name, language = 'en') => {
  const translations = {
    en: {
      greeting: `Hi ${name}!`,
      welcome: 'Welcome to Gazra Mitra',
      message: `We're thrilled to have you join our community! Gazra Mitra is your trusted companion for connecting with healthcare, employment, mental health support, and community resources.`,
      features: 'What you can do:',
      feature1: '🏥 Find LGBTQAI+ friendly healthcare professionals',
      feature2: '💼 Discover inclusive job opportunities',
      feature3: '💬 Connect with supportive community members',
      feature4: '🌟 Access mental health resources',
      cta: 'Get Started',
      support: 'Need help? Our support team is here for you 24/7.'
    },
    gu: {
      greeting: `નમસ્તે ${name}!`,
      welcome: 'ગઝરા મિત્રમાં આપનું સ્વાગત છે',
      message: 'અમારા સમુદાયમાં જોડાવા બદલ અમે રોમાંચિત છીએ! ગઝરા મિત્ર એ આરોગ્યસંભાળ, રોજગાર, માનસિક સ્વાસ્થ્ય સહાય અને સમુદાય સંસાધનો સાથે જોડવા માટે તમારો વિશ્વસનીય સાથી છે.',
      features: 'તમે શું કરી શકો છો:',
      feature1: '🏥 LGBTQAI+ મૈત્રીપૂર્ણ સ્વાસ્થ્ય વ્યાવસાયિકો શોધો',
      feature2: '💼 સમાવેશી નોકરીની તકો શોધો',
      feature3: '💬 સહાયક સમુદાય સભ્યો સાથે જોડાઓ',
      feature4: '🌟 માનસિક સ્વાસ્થ્ય સંસાધનોની ઍક્સેસ',
      cta: 'શરૂ કરો',
      support: 'મદદની જરૂર છે? અમારી સપોર્ટ ટીમ 24/7 તમારા માટે અહીં છે.'
    },
    hi: {
      greeting: `नमस्ते ${name}!`,
      welcome: 'गज़रा मित्र में आपका स्वागत है',
      message: 'हमारे समुदाय में शामिल होने के लिए हम रोमांचित हैं! गज़रा मित्र स्वास्थ्य सेवा, रोजगार, मानसिक स्वास्थ्य सहायता और सामुदायिक संसाधनों से जुड़ने के लिए आपका विश्वसनीय साथी है।',
      features: 'आप क्या कर सकते हैं:',
      feature1: '🏥 LGBTQAI+ अनुकूल स्वास्थ्य पेशेवरों को खोजें',
      feature2: '💼 समावेशी नौकरी के अवसरों की खोज करें',
      feature3: '💬 सहायक समुदाय के सदस्यों से जुड़ें',
      feature4: '🌟 मानसिक स्वास्थ्य संसाधनों तक पहुंचें',
      cta: 'शुरू करें',
      support: 'मदद चाहिए? हमारी सहायता टीम 24/7 आपके लिए यहां है।'
    },
    mr: {
      greeting: `नमस्कार ${name}!`,
      welcome: 'गझरा मित्रमध्ये तुमचे स्वागत आहे',
      message: 'आमच्या समुदायात सामील झाल्याबद्दल आम्ही रोमांचित आहोत! गझरा मित्र हा आरोग्यसेवा, रोजगार, मानसिक आरोग्य समर्थन आणि समुदाय संसाधनांशी जोडण्यासाठी तुमचा विश्वासू साथी आहे.',
      features: 'तुम्ही काय करू शकता:',
      feature1: '🏥 LGBTQAI+ अनुकूल आरोग्य व्यावसायिक शोधा',
      feature2: '💼 समावेशक नोकरीच्या संधी शोधा',
      feature3: '💬 सहाय्यक समुदाय सदस्यांशी कनेक्ट करा',
      feature4: '🌟 मानसिक आरोग्य संसाधनांमध्ये प्रवेश',
      cta: 'सुरू करा',
      support: 'मदत हवी आहे? आमची सपोर्ट टीम 24/7 तुमच्यासाठी येथे आहे.'
    }
  };

  const t = translations[language] || translations.en;

  return createEmailTemplate(`
    <div class="content">
      <h2>${t.greeting}</h2>
      <p style="font-size: 18px; color: #555;">
        <span class="success-badge">✓ ${t.welcome}</span>
      </p>
      <p>${t.message}</p>
      
      <div class="divider"></div>
      
      <div class="info-box">
        <h3>${t.features}</h3>
        <p style="margin: 10px 0;">${t.feature1}</p>
        <p style="margin: 10px 0;">${t.feature2}</p>
        <p style="margin: 10px 0;">${t.feature3}</p>
        <p style="margin: 10px 0;">${t.feature4}</p>
      </div>
      
      <center>
        <a href="https://gazra-mitra.app" class="button">${t.cta}</a>
      </center>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ${t.support}
      </p>
    </div>
  `, language);
};

/**
 * Booking Confirmation Email Template
 */
export const getBookingConfirmationContent = (bookingDetails, language = 'en') => {
  const { userName, professionalName, serviceName, date, time, location, bookingId } = bookingDetails;
  
  const translations = {
    en: {
      title: 'Booking Confirmed!',
      message: `Great news, ${userName}! Your appointment has been confirmed.`,
      details: 'Appointment Details',
      professional: `Professional: ${professionalName}`,
      service: `Service: ${serviceName}`,
      dateTime: `Date & Time: ${date} at ${time}`,
      location: `Location: ${location}`,
      bookingRef: `Booking ID: ${bookingId}`,
      reminder: 'We\'ll send you a reminder 24 hours before your appointment.',
      reschedule: 'Need to reschedule?',
      rescheduleText: 'You can reschedule or cancel your appointment anytime through the app.',
      viewBooking: 'View Booking Details'
    },
    gu: {
      title: 'બુકિંગ પુષ્ટિ થઈ!',
      message: `સારા સમાચાર, ${userName}! તમારી મુલાકાતની પુષ્ટિ થઈ છે.`,
      details: 'મુલાકાતની વિગતો',
      professional: `વ્યાવસાયિક: ${professionalName}`,
      service: `સેવા: ${serviceName}`,
      dateTime: `તારીખ અને સમય: ${date} ${time} વાગ્યે`,
      location: `સ્થાન: ${location}`,
      bookingRef: `બુકિંગ ID: ${bookingId}`,
      reminder: 'અમે તમારી મુલાકાતના 24 કલાક પહેલા તમને રીમાઇન્ડર મોકલીશું.',
      reschedule: 'ફરીથી શેડ્યૂલ કરવાની જરૂર છે?',
      rescheduleText: 'તમે કોઈપણ સમયે એપ દ્વારા તમારી મુલાકાત ફરીથી શેડ્યૂલ અથવા રદ કરી શકો છો.',
      viewBooking: 'બુકિંગ વિગતો જુઓ'
    },
    hi: {
      title: 'बुकिंग पुष्टि!',
      message: `बढ़िया खबर, ${userName}! आपकी अपॉइंटमेंट की पुष्टि हो गई है।`,
      details: 'अपॉइंटमेंट विवरण',
      professional: `पेशेवर: ${professionalName}`,
      service: `सेवा: ${serviceName}`,
      dateTime: `तारीख और समय: ${date} ${time} बजे`,
      location: `स्थान: ${location}`,
      bookingRef: `बुकिंग ID: ${bookingId}`,
      reminder: 'हम आपकी अपॉइंटमेंट से 24 घंटे पहले आपको रिमाइंडर भेजेंगे।',
      reschedule: 'फिर से शेड्यूल करना है?',
      rescheduleText: 'आप किसी भी समय ऐप के माध्यम से अपनी अपॉइंटमेंट को फिर से शेड्यूल या रद्द कर सकते हैं।',
      viewBooking: 'बुकिंग विवरण देखें'
    },
    mr: {
      title: 'बुकिंग पुष्टी!',
      message: `छान बातमी, ${userName}! तुमच्या भेटीची पुष्टी झाली आहे.`,
      details: 'भेटीचे तपशील',
      professional: `व्यावसायिक: ${professionalName}`,
      service: `सेवा: ${serviceName}`,
      dateTime: `तारीख आणि वेळ: ${date} ${time} वाजता`,
      location: `स्थान: ${location}`,
      bookingRef: `बुकिंग ID: ${bookingId}`,
      reminder: 'आम्ही तुम्हाला तुमच्या भेटीच्या 24 तास आधी रिमाइंडर पाठवू.',
      reschedule: 'पुन्हा शेड्यूल करायचे आहे?',
      rescheduleText: 'तुम्ही कधीही अॅपद्वारे तुमची भेट पुन्हा शेड्यूल किंवा रद्द करू शकता.',
      viewBooking: 'बुकिंग तपशील पहा'
    }
  };

  const t = translations[language] || translations.en;

  return createEmailTemplate(`
    <div class="content">
      <h2>✓ ${t.title}</h2>
      <p style="font-size: 16px;">${t.message}</p>
      
      <div class="info-box">
        <h3>📅 ${t.details}</h3>
        <p style="margin: 8px 0;"><strong>${t.professional}</strong></p>
        <p style="margin: 8px 0;">${t.service}</p>
        <p style="margin: 8px 0;">${t.dateTime}</p>
        <p style="margin: 8px 0;">${t.location}</p>
        <p style="margin: 8px 0; color: #6366f1; font-family: monospace;">${t.bookingRef}</p>
      </div>
      
      <center>
        <a href="https://gazra-mitra.app/bookings/${bookingId}" class="button">${t.viewBooking}</a>
      </center>
      
      <div class="divider"></div>
      
      <p style="color: #666; font-size: 14px;">
        ⏰ ${t.reminder}
      </p>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>${t.reschedule}</strong><br>
        ${t.rescheduleText}
      </p>
    </div>
  `, language);
};

/**
 * Appointment Reminder Email Template
 */
export const getAppointmentReminderContent = (bookingDetails, language = 'en') => {
  const { userName, professionalName, serviceName, date, time, location } = bookingDetails;
  
  const translations = {
    en: {
      title: 'Appointment Reminder',
      message: `Hi ${userName}, this is a friendly reminder about your upcoming appointment.`,
      tomorrow: 'Your appointment is tomorrow!',
      details: 'Appointment Details',
      professional: `With: ${professionalName}`,
      service: `Service: ${serviceName}`,
      dateTime: `When: ${date} at ${time}`,
      location: `Where: ${location}`,
      prepare: 'How to prepare:',
      tip1: '✓ Arrive 10 minutes early',
      tip2: '✓ Bring any relevant documents',
      tip3: '✓ Note down any questions you have',
      contact: 'Need to make changes?',
      contactText: 'Contact us if you need to reschedule or cancel.',
      directions: 'Get Directions'
    },
    gu: {
      title: 'મુલાકાત રીમાઇન્ડર',
      message: `નમસ્તે ${userName}, તમારી આગામી મુલાકાત વિશે આ એક મૈત્રીપૂર્ણ રીમાઇન્ડર છે.`,
      tomorrow: 'તમારી મુલાકાત આવતીકાલે છે!',
      details: 'મુલાકાતની વિગતો',
      professional: `સાથે: ${professionalName}`,
      service: `સેવા: ${serviceName}`,
      dateTime: `ક્યારે: ${date} ${time} વાગ્યે`,
      location: `ક્યાં: ${location}`,
      prepare: 'કેવી રીતે તૈયાર થવું:',
      tip1: '✓ 10 મિનિટ વહેલા પહોંચો',
      tip2: '✓ કોઈપણ સંબંધિત દસ્તાવેજો લાવો',
      tip3: '✓ તમારા પ્રશ્નો નોંધો',
      contact: 'ફેરફારની જરૂર છે?',
      contactText: 'જો તમારે ફરીથી શેડ્યૂલ અથવા રદ કરવાની જરૂર હોય તો અમારો સંપર્ક કરો.',
      directions: 'દિશાનિર્દેશ મેળવો'
    },
    hi: {
      title: 'अपॉइंटमेंट रिमाइंडर',
      message: `नमस्ते ${userName}, यह आपकी आने वाली अपॉइंटमेंट के बारे में एक दोस्ताना अनुस्मारक है।`,
      tomorrow: 'आपकी अपॉइंटमेंट कल है!',
      details: 'अपॉइंटमेंट विवरण',
      professional: `किसके साथ: ${professionalName}`,
      service: `सेवा: ${serviceName}`,
      dateTime: `कब: ${date} ${time} बजे`,
      location: `कहाँ: ${location}`,
      prepare: 'कैसे तैयार करें:',
      tip1: '✓ 10 मिनट पहले पहुंचें',
      tip2: '✓ कोई भी संबंधित दस्तावेज़ लाएं',
      tip3: '✓ अपने सवाल नोट करें',
      contact: 'बदलाव करने की ज़रूरत है?',
      contactText: 'यदि आपको फिर से शेड्यूल या रद्द करने की आवश्यकता है तो हमसे संपर्क करें।',
      directions: 'दिशा-निर्देश प्राप्त करें'
    },
    mr: {
      title: 'भेट रिमाइंडर',
      message: `नमस्कार ${userName}, तुमच्या आगामी भेटीबद्दल हा एक मैत्रीपूर्ण रिमाइंडर आहे.`,
      tomorrow: 'तुमची भेट उद्या आहे!',
      details: 'भेटीचे तपशील',
      professional: `कोणासोबत: ${professionalName}`,
      service: `सेवा: ${serviceName}`,
      dateTime: `केव्हा: ${date} ${time} वाजता`,
      location: `कुठे: ${location}`,
      prepare: 'कसे तयार व्हायचे:',
      tip1: '✓ 10 मिनिटे लवकर पोहोचा',
      tip2: '✓ कोणतेही संबंधित कागदपत्र आणा',
      tip3: '✓ तुमचे प्रश्न नोंदवा',
      contact: 'बदल करायचे आहेत?',
      contactText: 'तुम्हाला पुन्हा शेड्यूल किंवा रद्द करण्याची गरज असल्यास आमच्याशी संपर्क साधा.',
      directions: 'दिशानिर्देश मिळवा'
    }
  };

  const t = translations[language] || translations.en;

  return createEmailTemplate(`
    <div class="content">
      <h2>⏰ ${t.title}</h2>
      <p>${t.message}</p>
      
      <div style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; font-size: 24px;">🗓️ ${t.tomorrow}</h3>
      </div>
      
      <div class="info-box">
        <h3>${t.details}</h3>
        <p style="margin: 8px 0;"><strong>${t.professional}</strong></p>
        <p style="margin: 8px 0;">${t.service}</p>
        <p style="margin: 8px 0;">${t.dateTime}</p>
        <p style="margin: 8px 0;">${t.location}</p>
      </div>
      
      <div class="divider"></div>
      
      <h3>${t.prepare}</h3>
      <p style="margin: 8px 0;">${t.tip1}</p>
      <p style="margin: 8px 0;">${t.tip2}</p>
      <p style="margin: 8px 0;">${t.tip3}</p>
      
      <center>
        <a href="https://maps.google.com/?q=${encodeURIComponent(location)}" class="button">${t.directions}</a>
      </center>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        <strong>${t.contact}</strong><br>
        ${t.contactText}
      </p>
    </div>
  `, language);
};

/**
 * New Message Notification Email Template
 */
export const getMessageNotificationContent = (messageDetails, language = 'en') => {
  const { recipientName, senderName, messagePreview } = messageDetails;
  
  const translations = {
    en: {
      title: 'New Message',
      message: `Hi ${recipientName}, you have a new message from ${senderName}.`,
      preview: 'Message Preview',
      viewMessage: 'View Message',
      reply: 'Reply Now',
      settings: 'Manage notification settings'
    },
    gu: {
      title: 'નવો સંદેશ',
      message: `નમસ્તે ${recipientName}, તમને ${senderName} તરફથી નવો સંદેશ મળ્યો છે.`,
      preview: 'સંદેશ પૂર્વાવલોકન',
      viewMessage: 'સંદેશ જુઓ',
      reply: 'હવે જવાબ આપો',
      settings: 'સૂચના સેટિંગ્સ મેનેજ કરો'
    },
    hi: {
      title: 'नया संदेश',
      message: `नमस्ते ${recipientName}, आपको ${senderName} से एक नया संदेश मिला है।`,
      preview: 'संदेश पूर्वावलोकन',
      viewMessage: 'संदेश देखें',
      reply: 'अभी जवाब दें',
      settings: 'सूचना सेटिंग प्रबंधित करें'
    },
    mr: {
      title: 'नवीन संदेश',
      message: `नमस्कार ${recipientName}, तुम्हाला ${senderName} कडून एक नवीन संदेश आला आहे.`,
      preview: 'संदेश पूर्वावलोकन',
      viewMessage: 'संदेश पहा',
      reply: 'आता उत्तर द्या',
      settings: 'सूचना सेटिंग्ज व्यवस्थापित करा'
    }
  };

  const t = translations[language] || translations.en;

  return createEmailTemplate(`
    <div class="content">
      <h2>💬 ${t.title}</h2>
      <p>${t.message}</p>
      
      <div class="info-box">
        <h3>${t.preview}</h3>
        <p style="font-style: italic; color: #555;">
          "${messagePreview}"
        </p>
      </div>
      
      <center>
        <a href="https://gazra-mitra.app/messages" class="button">${t.viewMessage}</a>
      </center>
      
      <p style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <a href="https://gazra-mitra.app/settings/notifications" style="color: #6366f1; text-decoration: none;">
          ${t.settings}
        </a>
      </p>
    </div>
  `, language);
};

/**
 * Professional Verification Email Template
 */
export const getProfessionalVerificationContent = (professionalDetails, language = 'en') => {
  const { name, profession, verificationStatus } = professionalDetails;
  
  const translations = {
    en: {
      approved: {
        title: 'Verification Approved!',
        message: `Congratulations ${name}! Your professional profile has been verified.`,
        status: 'You can now start accepting bookings from clients.',
        next: 'Next Steps',
        step1: '✓ Complete your profile with photos and bio',
        step2: '✓ Set your availability and pricing',
        step3: '✓ Start connecting with clients',
        dashboard: 'Go to Dashboard'
      },
      pending: {
        title: 'Verification Under Review',
        message: `Hi ${name}, we've received your verification request.`,
        status: 'Our team is reviewing your documents.',
        timeframe: 'This process typically takes 2-3 business days.',
        contact: 'If you have any questions, feel free to contact us.'
      },
      rejected: {
        title: 'Verification Update',
        message: `Hi ${name}, we need additional information to verify your profile.`,
        reason: 'Please provide the following:',
        resubmit: 'Resubmit Documents'
      }
    },
    gu: {
      approved: {
        title: 'ચકાસણી મંજૂર!',
        message: `અભિનંદન ${name}! તમારી વ્યાવસાયિક પ્રોફાઇલ ચકાસવામાં આવી છે.`,
        status: 'તમે હવે ક્લાયન્ટ્સ પાસેથી બુકિંગ સ્વીકારવાનું શરૂ કરી શકો છો.',
        next: 'આગલા પગલાં',
        step1: '✓ ફોટો અને બાયો સાથે તમારી પ્રોફાઇલ પૂર્ણ કરો',
        step2: '✓ તમારી ઉપલબ્ધતા અને કિંમત સેટ કરો',
        step3: '✓ ક્લાયન્ટ્સ સાથે કનેક્ટ કરવાનું શરૂ કરો',
        dashboard: 'ડેશબોર્ડ પર જાઓ'
      },
      pending: {
        title: 'ચકાસણી સમીક્ષા હેઠળ',
        message: `નમસ્તે ${name}, અમને તમારી ચકાસણી વિનંતી મળી છે.`,
        status: 'અમારી ટીમ તમારા દસ્તાવેજોની સમીક્ષા કરી રહી છે.',
        timeframe: 'આ પ્રક્રિયા સામાન્ય રીતે 2-3 કામકાજના દિવસો લે છે.',
        contact: 'જો તમારી કોઈ પ્રશ્નો હોય, તો અમારો સંપર્ક કરવા માટે સ્વતંત્ર લાગે.'
      }
    },
    hi: {
      approved: {
        title: 'सत्यापन स्वीकृत!',
        message: `बधाई हो ${name}! आपकी पेशेवर प्रोफ़ाइल सत्यापित कर दी गई है।`,
        status: 'अब आप ग्राहकों से बुकिंग स्वीकार करना शुरू कर सकते हैं।',
        next: 'अगले कदम',
        step1: '✓ फ़ोटो और बायो के साथ अपनी प्रोफ़ाइल पूरी करें',
        step2: '✓ अपनी उपलब्धता और मूल्य निर्धारण सेट करें',
        step3: '✓ ग्राहकों से जुड़ना शुरू करें',
        dashboard: 'डैशबोर्ड पर जाएं'
      },
      pending: {
        title: 'सत्यापन समीक्षाधीन',
        message: `नमस्ते ${name}, हमें आपका सत्यापन अनुरोध प्राप्त हुआ है।`,
        status: 'हमारी टीम आपके दस्तावेज़ों की समीक्षा कर रही है।',
        timeframe: 'इस प्रक्रिया में आमतौर पर 2-3 कार्य दिवस लगते हैं।',
        contact: 'यदि आपके कोई प्रश्न हैं, तो बेझिझक हमसे संपर्क करें।'
      }
    },
    mr: {
      approved: {
        title: 'पडताळणी मंजूर!',
        message: `अभिनंदन ${name}! तुमची व्यावसायिक प्रोफाइल पडताळली गेली आहे.`,
        status: 'तुम्ही आता क्लायंटकडून बुकिंग स्वीकारण्यास सुरुवात करू शकता.',
        next: 'पुढील पायऱ्या',
        step1: '✓ फोटो आणि बायो सह तुमची प्रोफाइल पूर्ण करा',
        step2: '✓ तुमची उपलब्धता आणि किंमत सेट करा',
        step3: '✓ क्लायंटशी कनेक्ट करण्यास सुरुवात करा',
        dashboard: 'डॅशबोर्डवर जा'
      },
      pending: {
        title: 'पडताळणी पुनरावलोकनाधीन',
        message: `नमस्कार ${name}, आम्हाला तुमची पडताळणी विनंती मिळाली आहे.`,
        status: 'आमची टीम तुमच्या कागदपत्रांचे पुनरावलोकन करत आहे.',
        timeframe: 'या प्रक्रियेस साधारणपणे 2-3 कामकाजाचे दिवस लागतात.',
        contact: 'तुम्हाला काही प्रश्न असल्यास, आमच्याशी संपर्क साधा.'
      }
    }
  };

  const t = translations[language]?.[verificationStatus] || translations.en[verificationStatus];

  return createEmailTemplate(`
    <div class="content">
      <h2>${verificationStatus === 'approved' ? '🎉' : '⏳'} ${t.title}</h2>
      <p style="font-size: 16px;">${t.message}</p>
      
      <div class="info-box">
        <p><strong>${t.status}</strong></p>
        ${verificationStatus === 'pending' ? `<p style="margin-top: 10px;">${t.timeframe}</p>` : ''}
      </div>
      
      ${verificationStatus === 'approved' ? `
        <h3>${t.next}</h3>
        <p style="margin: 8px 0;">${t.step1}</p>
        <p style="margin: 8px 0;">${t.step2}</p>
        <p style="margin: 8px 0;">${t.step3}</p>
        
        <center>
          <a href="https://gazra-mitra.app/dashboard" class="button">${t.dashboard}</a>
        </center>
      ` : ''}
      
      ${verificationStatus === 'pending' ? `
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          ${t.contact}
        </p>
      ` : ''}
    </div>
  `, language);
};

/**
 * Feedback Request Email Template
 */
export const getFeedbackRequestContent = (feedbackDetails, language = 'en') => {
  const { userName, professionalName, serviceName, bookingId } = feedbackDetails;
  
  const translations = {
    en: {
      title: 'How was your experience?',
      message: `Hi ${userName}, we hope you had a great experience with ${professionalName}!`,
      request: 'Your feedback helps us improve and helps others find quality services.',
      cta: 'Leave a Review',
      rating: 'Rate your experience:',
      stars: '⭐⭐⭐⭐⭐',
      thanks: 'Thank you for being part of our community!'
    },
    gu: {
      title: 'તમારો અનુભવ કેવો રહ્યો?',
      message: `નમસ્તે ${userName}, અમને આશા છે કે તમને ${professionalName} સાથે સરસ અનુભવ મળ્યો હશે!`,
      request: 'તમારો પ્રતિસાદ અમને સુધારવામાં મદદ કરે છે અને અન્યને ગુણવત્તાયુક્ત સેવાઓ શોધવામાં મદદ કરે છે.',
      cta: 'સમીક્ષા આપો',
      rating: 'તમારા અનુભવને રેટ કરો:',
      stars: '⭐⭐⭐⭐⭐',
      thanks: 'અમારા સમુદાયનો ભાગ બનવા બદલ આભાર!'
    },
    hi: {
      title: 'आपका अनुभव कैसा रहा?',
      message: `नमस्ते ${userName}, हमें उम्मीद है कि आपको ${professionalName} के साथ बढ़िया अनुभव मिला होगा!`,
      request: 'आपकी प्रतिक्रिया हमें सुधारने में मदद करती है और दूसरों को गुणवत्ता सेवाएं खोजने में मदद करती है।',
      cta: 'समीक्षा दें',
      rating: 'अपने अनुभव को रेट करें:',
      stars: '⭐⭐⭐⭐⭐',
      thanks: 'हमारे समुदाय का हिस्सा बनने के लिए धन्यवाद!'
    },
    mr: {
      title: 'तुमचा अनुभव कसा होता?',
      message: `नमस्कार ${userName}, आम्हाला आशा आहे की तुम्हाला ${professionalName} सोबत चांगला अनुभव आला असेल!`,
      request: 'तुमचा अभिप्राय आम्हाला सुधारण्यास मदत करतो आणि इतरांना दर्जेदार सेवा शोधण्यात मदत करतो.',
      cta: 'पुनरावलोकन द्या',
      rating: 'तुमच्या अनुभवाला रेट करा:',
      stars: '⭐⭐⭐⭐⭐',
      thanks: 'आमच्या समुदायाचा भाग बनल्याबद्दल धन्यवाद!'
    }
  };

  const t = translations[language] || translations.en;

  return createEmailTemplate(`
    <div class="content">
      <h2>⭐ ${t.title}</h2>
      <p>${t.message}</p>
      
      <div style="text-align: center; font-size: 48px; margin: 30px 0;">
        ${t.stars}
      </div>
      
      <p style="text-align: center; color: #666;">
        ${t.request}
      </p>
      
      <center>
        <a href="https://gazra-mitra.app/bookings/${bookingId}/review" class="button">${t.cta}</a>
      </center>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #6366f1; font-weight: 600;">
        ${t.thanks}
      </p>
    </div>
  `, language);
};

/**
 * Send Email using EmailJS
 */
export const sendEmail = async (to_email, from_name, subject, content, name = '') => {
  try {
    const templateParams = {
      to_email,
      from_name: from_name || COMPANY_NAME,
      subject,
      message: content,
      name
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

/**
 * Convenience functions for sending specific email types
 */
export const sendWelcomeEmail = async (userEmail, userName, language = 'en') => {
  const content = getWelcomeEmailContent(userName, language);
  const subject = `Welcome to ${COMPANY_NAME}, ${userName}!`;
  return sendEmail(userEmail, COMPANY_NAME, subject, content, userName);
};

export const sendBookingConfirmationEmail = async (userEmail, bookingDetails, language = 'en') => {
  const content = getBookingConfirmationContent(bookingDetails, language);
  const subject = `Booking Confirmed - ${bookingDetails.serviceName}`;
  return sendEmail(userEmail, COMPANY_NAME, subject, content, bookingDetails.userName);
};

export const sendAppointmentReminderEmail = async (userEmail, bookingDetails, language = 'en') => {
  const content = getAppointmentReminderContent(bookingDetails, language);
  const subject = `Reminder: Appointment Tomorrow with ${bookingDetails.professionalName}`;
  return sendEmail(userEmail, COMPANY_NAME, subject, content, bookingDetails.userName);
};

export const sendMessageNotificationEmail = async (userEmail, messageDetails, language = 'en') => {
  const content = getMessageNotificationContent(messageDetails, language);
  const subject = `New message from ${messageDetails.senderName}`;
  return sendEmail(userEmail, COMPANY_NAME, subject, content, messageDetails.recipientName);
};

export const sendProfessionalVerificationEmail = async (professionalEmail, professionalDetails, language = 'en') => {
  const content = getProfessionalVerificationContent(professionalDetails, language);
  const statusText = professionalDetails.verificationStatus === 'approved' ? 'Approved' : 'Update';
  const subject = `Professional Verification ${statusText} - ${COMPANY_NAME}`;
  return sendEmail(professionalEmail, COMPANY_NAME, subject, content, professionalDetails.name);
};

export const sendFeedbackRequestEmail = async (userEmail, feedbackDetails, language = 'en') => {
  const content = getFeedbackRequestContent(feedbackDetails, language);
  const subject = `How was your experience with ${feedbackDetails.professionalName}?`;
  return sendEmail(userEmail, COMPANY_NAME, subject, content, feedbackDetails.userName);
};
