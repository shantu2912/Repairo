// ======================================================
// FIXZENIX GLOBAL LANGUAGE SYSTEM (i18n.js)
// ======================================================

window.FixZenI18n = {
  // 1. Get the saved language, default to English
  getSavedLang: function() {
    return localStorage.getItem('fixzen_lang') || 'en';
  },

  // 2. Save the language to the browser
  setLang: function(lang) {
    localStorage.setItem('fixzen_lang', lang);
  },

  // 3. The Master Dictionary (Usable on all pages)
  translations: {
    en: {
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
      
      // Dashboard Extras
      active_jobs: "Active Jobs",
      earnings: "Earnings",
      accept: "Accept",
      reject: "Reject"
    },
    hi: {
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
      
      // Dashboard Extras
      active_jobs: "सक्रिय कार्य",
      earnings: "कमाई",
      accept: "स्वीकार करें",
      reject: "अस्वीकार करें"
    },
    mr: {
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
      
      // Dashboard Extras
      active_jobs: "सक्रिय कामे",
      earnings: "कमाई",
      accept: "स्वीकारा",
      reject: "नकार द्या"
    }
  }
};
