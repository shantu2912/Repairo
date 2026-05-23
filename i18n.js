// ======================================================
// FIXZENIX GLOBAL LANGUAGE SYSTEM (i18n.js)
// ======================================================

window.FixZenI18n = {
  // 1. Get the saved language, default to English
  getSavedLang: function() {
    return localStorage.getItem('fixzen_lang') || 'en';
  },

  // 2. Save the language to the browser and instantly translate
  setLang: function(lang) {
    localStorage.setItem('fixzen_lang', lang);
    this.translatePage(); // Triggers update on non-Alpine pages
  },

  // 3. The Translator Engine (for standard HTML pages)
  translatePage: function() {
    const lang = this.getSavedLang();
    
    // Find every element on the page that has a data-i18n attribute
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translatedText = this.translations[lang]?.[key];

      if (translatedText) {
        // If it's an input box, translate the placeholder. Otherwise, replace inner text.
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translatedText;
        } else {
          el.innerText = translatedText;
        }
      }
    });
  },

  // 4. The Complete Master Dictionary
  translations: {
    en: {
      // -- ALPINE.JS AUTH PAGE KEYS --
      tagline: 'Premium Home Care',
      choose_lang: 'Choose Your Language',
      lang_continue: 'CONTINUE',
      welcome: 'Welcome to FixZen',
      create_account: 'Create Account',
      login: 'Login',
      full_name: 'Full Name',
      username: 'Username',
      password: 'Password',
      mobile: 'Mobile Number',
      send_otp: 'Send Verification',
      check_account: 'Check Account',
      sign_in: 'Sign In',
      already_member: 'Already a member? Sign In',
      new_user: 'New User? Create Account',
      verify_title: 'Verify Mobile',
      code_sent: 'Code sent to +91',
      enter_otp: '000000',
      verify_btn: 'Verify & Join',
      change_details: 'Change Details',
      name_placeholder: 'Rahul Sharma',
      user_placeholder: 'username',
      pass_placeholder: '••••••••',
      phone_placeholder: '9876543210',
      err_phone: 'ENTER VALID PHONE NUMBER',
      err_exists: 'ACCOUNT ALREADY EXISTS',
      err_not_found: 'NO ACCOUNT FOUND',
      err_otp: 'ENTER VALID OTP',
      err_pass: 'ENTER PASSWORD',
      err_login: 'INVALID LOGIN CREDENTIALS',
      welcome_back: 'Welcome Back',

      // -- DASHBOARD & REGISTER KEYS --
      "Your Username": "Your Username",
      "Your Password": "Your Password",
      "LOGIN": "LOGIN",
      "Enter username and password": "Enter username and password",
      "Invalid username or password": "Invalid username or password",
      "Active Jobs": "Active Jobs",
      "Earnings": "Earnings",
      "Today": "Today",
      "Available for Jobs": "Available for Jobs",
      "Loading jobs…": "Loading jobs…",
      "No active jobs": "No active jobs",
      "Accept": "Accept",
      "Reject": "Reject",
      "Mark Arrived": "Mark Arrived",
      "Complete Job": "Complete Job",
      "Call Customer": "Call Customer",
      "Open in Maps": "Open in Maps",
      "New Job Arrived": "New Job Arrived",
      "Join FixZenix": "Join FixZenix",
      "Fill in your details to get jobs and start earning": "Fill in your details to get jobs and start earning",
      "Full Name": "Full Name",
      "Mobile Number": "Mobile Number",
      "Username": "Username",
      "Password": "Password",
      "Specialization": "Specialization",
      "Experience": "Experience",
      "Aadhaar": "Aadhaar",
      "Service Area": "Service Area",
      "Select Specialization": "Select Specialization",
      "AC Repair": "AC Repair",
      "Refrigerator": "Refrigerator",
      "Washing Machine": "Washing Machine",
      "RO Water Purifier": "RO Water Purifier",
      "Geyser": "Geyser",
      "Television": "Television",
      "Submit Application": "Submit Application",
      "Registering...": "Registering...",
      "Application Sent!": "Application Sent!",
      "Return to Home": "Return to Home"
    },

    hi: {
      // -- ALPINE.JS AUTH PAGE KEYS --
      tagline: 'प्रीमियम होम केयर',
      choose_lang: 'अपनी भाषा चुनें',
      lang_continue: 'आगे बढ़ें',
      welcome: 'FixZen में आपका स्वागत है',
      create_account: 'नया खाता बनाएं',
      login: 'लॉगिन करें',
      full_name: 'पूरा नाम',
      username: 'उपयोगकर्ता नाम',
      password: 'पासवर्ड',
      mobile: 'मोबाइल नंबर',
      send_otp: 'OTP भेजें',
      check_account: 'खाता जांचें',
      sign_in: 'साइन इन करें',
      already_member: 'पहले से सदस्य हैं? साइन इन करें',
      new_user: 'नए उपयोगकर्ता? खाता बनाएं',
      verify_title: 'मोबाइल सत्यापित करें',
      code_sent: 'कोड भेजा गया +91',
      enter_otp: '000000',
      verify_btn: 'सत्यापित करें और जुड़ें',
      change_details: 'विवरण बदलें',
      name_placeholder: 'राहुल शर्मा',
      user_placeholder: 'उपयोगकर्ता नाम',
      pass_placeholder: '••••••••',
      phone_placeholder: '9876543210',
      err_phone: 'मान्य फ़ोन नंबर दर्ज करें',
      err_exists: 'खाता पहले से मौजूद है',
      err_not_found: 'कोई खाता नहीं मिला',
      err_otp: 'मान्य OTP दर्ज करें',
      err_pass: 'पासवर्ड दर्ज करें',
      err_login: 'लॉगिन जानकारी गलत है',
      welcome_back: 'वापसी पर स्वागत है',

      // -- DASHBOARD & REGISTER KEYS --
      "Your Username": "आपका यूजरनेम",
      "Your Password": "आपका पासवर्ड",
      "LOGIN": "लॉगिन",
      "Enter username and password": "यूजरनेम और पासवर्ड डालें",
      "Invalid username or password": "गलत यूजरनेम या पासवर्ड",
      "Active Jobs": "सक्रिय कार्य",
      "Earnings": "कमाई",
      "Today": "आज",
      "Available for Jobs": "काम के लिए उपलब्ध",
      "Loading jobs…": "कार्य लोड हो रहे हैं…",
      "No active jobs": "कोई सक्रिय कार्य नहीं",
      "Accept": "स्वीकार करें",
      "Reject": "अस्वीकार करें",
      "Mark Arrived": "पहुँच गया",
      "Complete Job": "कार्य पूर्ण करें",
      "Call Customer": "ग्राहक को कॉल करें",
      "Open in Maps": "मैप में खोलें",
      "New Job Arrived": "नया कार्य आया है",
      "Join FixZenix": "FixZenix से जुड़ें",
      "Fill in your details to get jobs and start earning": "काम पाने और कमाई शुरू करने के लिए अपनी जानकारी भरें",
      "Full Name": "पूरा नाम",
      "Mobile Number": "मोबाइल नंबर",
      "Username": "यूजरनेम",
      "Password": "पासवर्ड",
      "Specialization": "विशेषज्ञता",
      "Experience": "अनुभव",
      "Aadhaar": "आधार",
      "Service Area": "सेवा क्षेत्र",
      "Select Specialization": "विशेषज्ञता चुनें",
      "AC Repair": "एसी रिपेयर",
      "Refrigerator": "रेफ्रिजरेटर",
      "Washing Machine": "वॉशिंग मशीन",
      "RO Water Purifier": "आरओ वॉटर प्यूरिफायर",
      "Geyser": "गीजर",
      "Television": "टेलीविजन",
      "Submit Application": "आवेदन जमा करें",
      "Registering...": "रजिस्टर हो रहा है...",
      "Application Sent!": "आवेदन भेज दिया गया!",
      "Return to Home": "होम पर जाएं"
    },

    mr: {
      // -- ALPINE.JS AUTH PAGE KEYS --
      tagline: 'प्रीमियम होम केअर',
      choose_lang: 'तुमची भाषा निवडा',
      lang_continue: 'पुढे जा',
      welcome: 'FixZen मध्ये स्वागत आहे',
      create_account: 'नवीन खाते तयार करा',
      login: 'लॉगिन करा',
      full_name: 'पूर्ण नाव',
      username: 'वापरकर्ता नाव',
      password: 'पासवर्ड',
      mobile: 'मोबाइल नंबर',
      send_otp: 'OTP पाठवा',
      check_account: 'खाते तपासा',
      sign_in: 'साइन इन करा',
      already_member: 'आधीच सदस्य आहात? साइन इन करा',
      new_user: 'नवीन वापरकर्ता? खाते तयार करा',
      verify_title: 'मोबाइल सत्यापित करा',
      code_sent: 'कोड पाठवला +91',
      enter_otp: '000000',
      verify_btn: 'सत्यापित करा आणि सामील व्हा',
      change_details: 'तपशील बदला',
      name_placeholder: 'राहुल शर्मा',
      user_placeholder: 'वापरकर्ता नाव',
      pass_placeholder: '••••••••',
      phone_placeholder: '9876543210',
      err_phone: 'वैध फोन नंबर टाका',
      err_exists: 'खाते आधीपासून अस्तित्वात आहे',
      err_not_found: 'खाते सापडले नाही',
      err_otp: 'वैध OTP टाका',
      err_pass: 'पासवर्ड टाका',
      err_login: 'चुकीची लॉगिन माहिती',
      welcome_back: 'पुन्हा स्वागत आहे',

      // -- DASHBOARD & REGISTER KEYS --
      "Your Username": "तुमचे युजरनेम",
      "Your Password": "तुमचा पासवर्ड",
      "LOGIN": "लॉगिन",
      "Enter username and password": "युजरनेम आणि पासवर्ड टाका",
      "Invalid username or password": "चुकीचे युजरनेम किंवा पासवर्ड",
      "Active Jobs": "सक्रिय कामे",
      "Earnings": "कमाई",
      "Today": "आज",
      "Available for Jobs": "कामासाठी उपलब्ध",
      "Loading jobs…": "कामे लोड होत आहेत…",
      "No active jobs": "सध्या कोणतेही काम नाही",
      "Accept": "स्वीकारा",
      "Reject": "नकार द्या",
      "Mark Arrived": "पोहोचलो",
      "Complete Job": "काम पूर्ण करा",
      "Call Customer": "ग्राहकाला कॉल करा",
      "Open in Maps": "मॅपमध्ये उघडा",
      "New Job Arrived": "नवीन काम आले आहे",
      "Join FixZenix": "FixZenix मध्ये सामील व्हा",
      "Fill in your details to get jobs and start earning": "काम मिळवण्यासाठी आणि कमाई सुरू करण्यासाठी माहिती भरा",
      "Full Name": "पूर्ण नाव",
      "Mobile Number": "मोबाईल नंबर",
      "Username": "युजरनेम",
      "Password": "पासवर्ड",
      "Specialization": "विशेषता",
      "Experience": "अनुभव",
      "Aadhaar": "आधार",
      "Service Area": "सेवा क्षेत्र",
      "Select Specialization": "विशेषता निवडा",
      "AC Repair": "एसी रिपेअर",
      "Refrigerator": "फ्रिज",
      "Washing Machine": "वॉशिंग मशीन",
      "RO Water Purifier": "आरओ वॉटर प्युरिफायर",
      "Geyser": "गीझर",
      "Television": "टीव्ही",
      "Submit Application": "अर्ज सबमिट करा",
      "Registering...": "नोंदणी सुरू आहे...",
      "Application Sent!": "अर्ज पाठवला गेला!",
      "Return to Home": "होम वर जा"
    }
  }
};

// ======================================================
// AUTO LOAD ON EVERY PAGE
// ======================================================
// When any HTML page loads, this runs the translation engine instantly
window.addEventListener('DOMContentLoaded', () => {
  // A small timeout ensures that Alpine.js (if present) initializes first, 
  // preventing conflicts before the vanilla translator checks for standard tags.
  setTimeout(() => {
    FixZenI18n.translatePage();
  }, 50);
});
