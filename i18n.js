/**
 * FixZen i18n — Multi-language support (English / हिंदी / मराठी)
 * 
 * HOW TO USE ON ANY PAGE:
 * 1. Add this script tag to your HTML <head>:
 *    <script src="i18n.js"></script>
 * 
 * 2. Add data-i18n="key" attribute to any HTML element you want translated:
 *    <h1 data-i18n="home_title">Home Services</h1>
 *    <button data-i18n="book_now">Book Now</button>
 * 
 * 3. For placeholders:
 *    <input data-i18n-placeholder="search_placeholder" placeholder="Search...">
 * 
 * 4. Add a language switcher anywhere on your page:
 *    <div id="fixzen-lang-switcher"></div>
 *    The script will auto-inject a floating language switcher.
 * 
 * 5. That's it! Language is auto-detected from localStorage on every page load.
 */

// ─────────────────────────────────────────────────────────────
//  ALL TRANSLATIONS — Add your page keys here
// ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {

  en: {
    // ── Navigation ──
    nav_home: 'Home',
    nav_services: 'Services',
    nav_bookings: 'My Bookings',
    nav_profile: 'Profile',
    nav_logout: 'Logout',

    // ── Home Page ──
    home_title: 'Premium Home Services',
    home_subtitle: 'Expert technicians at your doorstep',
    home_search_placeholder: 'Search for a service...',
    home_popular: 'Popular Services',
    home_nearby: 'Nearby Providers',

    // ── Services ──
    service_plumbing: 'Plumbing',
    service_electrical: 'Electrical',
    service_cleaning: 'Cleaning',
    service_carpentry: 'Carpentry',
    service_painting: 'Painting',
    service_ac: 'AC Repair',
    service_appliance: 'Appliance Repair',

    // ── Booking ──
    book_now: 'Book Now',
    book_title: 'Book a Service',
    book_date: 'Select Date',
    book_time: 'Select Time',
    book_address: 'Service Address',
    book_confirm: 'Confirm Booking',
    book_cancel: 'Cancel',
    book_success: 'Booking Confirmed!',
    book_pending: 'Booking Pending',
    book_cancelled: 'Booking Cancelled',

    // ── Profile ──
    profile_title: 'My Profile',
    profile_name: 'Full Name',
    profile_phone: 'Phone Number',
    profile_language: 'Preferred Language',
    profile_save: 'Save Changes',
    profile_saved: 'Changes Saved',

    // ── Common ──
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    price: 'Price',
    rating: 'Rating',
    reviews: 'Reviews',
    view_all: 'View All',
    see_more: 'See More',
    no_results: 'No results found',
    confirm: 'Confirm',

    // ── Auth ──
    login: 'Login',
    logout: 'Logout',
    sign_up: 'Sign Up',
    welcome_back: 'Welcome Back',

    // ── Sidebar ──
    sidebar_for_experts: 'For Experts',
    sidebar_register_tech: 'Register as Technician',
    sidebar_tech_login: 'Technician Login',
    sidebar_utility: 'Utility',
    sidebar_admin: 'Admin Dashboard',
    sidebar_contact: 'Contact Us',
    sidebar_legal: 'Legal',
    sidebar_privacy: 'Privacy Policy',
    sidebar_terms: 'Terms & Policy',
    sidebar_log_out: 'Log Out',
    sidebar_log_in: 'Log In',

    // ── Index Page ──
    index_top_rated: 'Top Rated',
    index_search_for: 'Search for',
    index_no_service: 'No service found matching',
    index_try_search: 'Try "AC", "Clean", or "Repair"',
    index_section_home: 'Construction & Home',
    index_section_appliance: 'Appliance Repair',
    index_section_electronics: 'Electronics & IT',
    index_section_auto: 'Automobile',
    index_section_industrial: 'Industrial',
    index_section_other: 'Other Services',

    // ── Service Page ──
    svc_verified: 'Verified Pro',
    svc_select: 'Select Services',
    svc_tap_add: 'Tap to add',
    svc_total: 'Total Estimate',
    svc_book_now: 'Book Now',
    svc_select_prompt: 'Select a Service',
    svc_confirm_title: 'Confirm Booking',
    svc_name_placeholder: 'Enter Your Full Name',
    svc_phone_placeholder: 'Enter Phone Number',
    svc_address_placeholder: 'Enter Full Address',
    svc_fetch_gps: '📍 Fetch Current GPS Location',
    svc_fetching_gps: 'Pinpointing Location...',
    svc_add_photo: 'Add Photo (Optional)',
    svc_live_camera: 'Live Camera',
    svc_gallery: 'Gallery',
    svc_photo_note: 'Take a live photo or upload from gallery (not saved to database)',
    svc_terms_title: 'Terms & Conditions:',
    svc_agree: 'I agree to the Terms & Conditions and authorize the job broadcast.',
    svc_cancel: 'Cancel',
    svc_confirm_btn: 'Confirm Booking',
    svc_time_warning: '⚠️ Please select a time at least 30 minutes from now',
    svc_items: 'Item(s)',
    svc_select_to_enable: 'Select items to enable booking',

    // ── Technician Dashboard ──
    tech_pro_partner: 'Pro Partner',
    tech_active_jobs: 'Active Jobs',
    tech_earnings: 'Earnings',
    tech_today: 'Today',
    tech_available: 'Available for Jobs',
    tech_notif_blocked: '🔕 Notifications blocked. You won\'t receive job alerts. Please enable notifications in your browser settings and reload.',
    tech_notif_enable: '🔔 Enable notifications to receive instant job alerts.',
    tech_enable_now: 'Enable now',
    tech_loading_jobs: 'Loading jobs…',
    tech_no_jobs: 'No active jobs',
    tech_new_job: 'New Job Arrived',
    tech_your_earnings: 'Your Earnings',
    tech_call_customer: '📞 Call Customer',
    tech_open_maps: 'Open in Maps →',
    tech_accept: 'Accept',
    tech_reject: 'Reject',
    tech_mark_arrived: 'Mark Arrived',
    tech_complete_job: 'Complete Job',

    // ── Partner Login ──
    partner_title: 'FixZenix',
    partner_username: 'Your Username',
    partner_password: 'Your Password',
    partner_login_btn: 'Login',
    partner_err_fields: 'Enter username and password',
    partner_err_invalid: 'Invalid username or password',

    // ── Partner Register ──
    partner_reg_title: 'Join FixZenix',
    partner_reg_subtitle: 'Fill in your details to get jobs and start earning',
    partner_reg_name: 'Full Name',
    partner_reg_mobile: 'Mobile Number',
    partner_reg_username: 'Username',
    partner_reg_password: 'Password',
    partner_reg_specialization: 'Specialization',
    partner_reg_select_spec: 'Select Specialization',
    partner_reg_experience: 'Experience',
    partner_reg_exp_placeholder: 'Years',
    partner_reg_aadhaar: 'Aadhaar',
    partner_reg_area: 'Service Area',
    partner_reg_area_placeholder: 'City or Locality',
    partner_reg_submit: 'Submit Application',
    partner_reg_submitting: 'Registering...',
    partner_reg_success_title: 'Application Sent!',
    partner_reg_success_msg: 'Our onboarding team will reach out to you within',
    partner_reg_success_hours: '24 hours',
    partner_reg_return: 'Return to Home',
  },

  hi: {
    // ── Navigation ──
    nav_home: 'होम',
    nav_services: 'सेवाएं',
    nav_bookings: 'मेरी बुकिंग',
    nav_profile: 'प्रोफ़ाइल',
    nav_logout: 'लॉगआउट',

    // ── Home Page ──
    home_title: 'प्रीमियम होम सेवाएं',
    home_subtitle: 'आपके घर पर विशेषज्ञ तकनीशियन',
    home_search_placeholder: 'सेवा खोजें...',
    home_popular: 'लोकप्रिय सेवाएं',
    home_nearby: 'नज़दीकी प्रदाता',

    // ── Services ──
    service_plumbing: 'प्लंबिंग',
    service_electrical: 'इलेक्ट्रिकल',
    service_cleaning: 'सफाई',
    service_carpentry: 'बढ़ईगीरी',
    service_painting: 'पेंटिंग',
    service_ac: 'AC मरम्मत',
    service_appliance: 'उपकरण मरम्मत',

    // ── Booking ──
    book_now: 'अभी बुक करें',
    book_title: 'सेवा बुक करें',
    book_date: 'तारीख चुनें',
    book_time: 'समय चुनें',
    book_address: 'सेवा पता',
    book_confirm: 'बुकिंग पक्की करें',
    book_cancel: 'रद्द करें',
    book_success: 'बुकिंग हो गई!',
    book_pending: 'बुकिंग प्रतीक्षारत',
    book_cancelled: 'बुकिंग रद्द',

    // ── Profile ──
    profile_title: 'मेरी प्रोफ़ाइल',
    profile_name: 'पूरा नाम',
    profile_phone: 'फ़ोन नंबर',
    profile_language: 'पसंदीदा भाषा',
    profile_save: 'बदलाव सहेजें',
    profile_saved: 'बदलाव सहेजे गए',

    // ── Common ──
    loading: 'लोड हो रहा है...',
    error: 'कुछ गलत हुआ',
    retry: 'दोबारा कोशिश करें',
    back: 'वापस',
    next: 'आगे',
    done: 'हो गया',
    yes: 'हाँ',
    no: 'नहीं',
    submit: 'जमा करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    price: 'कीमत',
    rating: 'रेटिंग',
    reviews: 'समीक्षाएं',
    view_all: 'सभी देखें',
    see_more: 'और देखें',
    no_results: 'कोई परिणाम नहीं मिला',
    confirm: 'पुष्टि करें',

    // ── Auth ──
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    sign_up: 'साइन अप',
    welcome_back: 'वापसी पर स्वागत है',

    // ── Sidebar ──
    sidebar_for_experts: 'विशेषज्ञों के लिए',
    sidebar_register_tech: 'तकनीशियन के रूप में पंजीकरण करें',
    sidebar_tech_login: 'तकनीशियन लॉगिन',
    sidebar_utility: 'उपयोगिता',
    sidebar_admin: 'एडमिन डैशबोर्ड',
    sidebar_contact: 'संपर्क करें',
    sidebar_legal: 'कानूनी',
    sidebar_privacy: 'गोपनीयता नीति',
    sidebar_terms: 'नियम और शर्तें',
    sidebar_log_out: 'लॉग आउट',
    sidebar_log_in: 'लॉग इन',

    // ── Index Page ──
    index_top_rated: 'टॉप रेटेड',
    index_search_for: 'खोजें',
    index_no_service: 'कोई सेवा नहीं मिली',
    index_try_search: '"AC", "सफाई", या "मरम्मत" आज़माएं',
    index_section_home: 'निर्माण और घर',
    index_section_appliance: 'उपकरण मरम्मत',
    index_section_electronics: 'इलेक्ट्रॉनिक्स और IT',
    index_section_auto: 'ऑटोमोबाइल',
    index_section_industrial: 'औद्योगिक',
    index_section_other: 'अन्य सेवाएं',

    // ── Service Page ──
    svc_verified: 'सत्यापित प्रो',
    svc_select: 'सेवाएं चुनें',
    svc_tap_add: 'जोड़ने के लिए टैप करें',
    svc_total: 'कुल अनुमान',
    svc_book_now: 'अभी बुक करें',
    svc_select_prompt: 'सेवा चुनें',
    svc_confirm_title: 'बुकिंग पक्की करें',
    svc_name_placeholder: 'अपना पूरा नाम दर्ज करें',
    svc_phone_placeholder: 'फ़ोन नंबर दर्ज करें',
    svc_address_placeholder: 'पूरा पता दर्ज करें',
    svc_fetch_gps: '📍 वर्तमान GPS लोकेशन लाएं',
    svc_fetching_gps: 'लोकेशन ढूंढ रहे हैं...',
    svc_add_photo: 'फ़ोटो जोड़ें (वैकल्पिक)',
    svc_live_camera: 'लाइव कैमरा',
    svc_gallery: 'गैलरी',
    svc_photo_note: 'लाइव फ़ोटो लें या गैलरी से अपलोड करें',
    svc_terms_title: 'नियम और शर्तें:',
    svc_agree: 'मैं नियमों और शर्तों से सहमत हूं और जॉब ब्रॉडकास्ट की अनुमति देता/देती हूं।',
    svc_cancel: 'रद्द करें',
    svc_confirm_btn: 'बुकिंग पक्की करें',
    svc_time_warning: '⚠️ कृपया अभी से कम से कम 30 मिनट बाद का समय चुनें',
    svc_items: 'आइटम',
    svc_select_to_enable: 'बुकिंग सक्षम करने के लिए आइटम चुनें',

    // ── Technician Dashboard ──
    tech_pro_partner: 'प्रो पार्टनर',
    tech_active_jobs: 'सक्रिय काम',
    tech_earnings: 'कमाई',
    tech_today: 'आज',
    tech_available: 'काम के लिए उपलब्ध',
    tech_notif_blocked: '🔕 नोटिफिकेशन ब्लॉक है। आपको जॉब अलर्ट नहीं मिलेंगे।',
    tech_notif_enable: '🔔 तुरंत जॉब अलर्ट पाने के लिए नोटिफिकेशन सक्षम करें।',
    tech_enable_now: 'अभी सक्षम करें',
    tech_loading_jobs: 'काम लोड हो रहे हैं…',
    tech_no_jobs: 'कोई सक्रिय काम नहीं',
    tech_new_job: 'नया काम आया',
    tech_your_earnings: 'आपकी कमाई',
    tech_call_customer: '📞 ग्राहक को कॉल करें',
    tech_open_maps: 'मैप में खोलें →',
    tech_accept: 'स्वीकार करें',
    tech_reject: 'अस्वीकार करें',
    tech_mark_arrived: 'पहुंचा हुआ बताएं',
    tech_complete_job: 'काम पूरा करें',

    // ── Partner Login ──
    partner_title: 'FixZenix',
    partner_username: 'आपका उपयोगकर्ता नाम',
    partner_password: 'आपका पासवर्ड',
    partner_login_btn: 'लॉगिन',
    partner_err_fields: 'उपयोगकर्ता नाम और पासवर्ड दर्ज करें',
    partner_err_invalid: 'गलत उपयोगकर्ता नाम या पासवर्ड',

    // ── Partner Register ──
    partner_reg_title: 'FixZenix से जुड़ें',
    partner_reg_subtitle: 'काम पाने और कमाई शुरू करने के लिए अपनी जानकारी भरें',
    partner_reg_name: 'पूरा नाम',
    partner_reg_mobile: 'मोबाइल नंबर',
    partner_reg_username: 'उपयोगकर्ता नाम',
    partner_reg_password: 'पासवर्ड',
    partner_reg_specialization: 'विशेषज्ञता',
    partner_reg_select_spec: 'विशेषज्ञता चुनें',
    partner_reg_experience: 'अनुभव',
    partner_reg_exp_placeholder: 'वर्ष',
    partner_reg_aadhaar: 'आधार',
    partner_reg_area: 'सेवा क्षेत्र',
    partner_reg_area_placeholder: 'शहर या इलाका',
    partner_reg_submit: 'आवेदन जमा करें',
    partner_reg_submitting: 'पंजीकरण हो रहा है...',
    partner_reg_success_title: 'आवेदन भेजा गया!',
    partner_reg_success_msg: 'हमारी टीम आपसे संपर्क करेगी',
    partner_reg_success_hours: '24 घंटे के अंदर',
    partner_reg_return: 'होम पर वापस जाएं',
  },

  mr: {
    // ── Navigation ──
    nav_home: 'मुख्यपृष्ठ',
    nav_services: 'सेवा',
    nav_bookings: 'माझ्या बुकिंग',
    nav_profile: 'प्रोफाइल',
    nav_logout: 'लॉगआउट',

    // ── Home Page ──
    home_title: 'प्रीमियम घरगुती सेवा',
    home_subtitle: 'तज्ञ तंत्रज्ञ तुमच्या दारावर',
    home_search_placeholder: 'सेवा शोधा...',
    home_popular: 'लोकप्रिय सेवा',
    home_nearby: 'जवळचे प्रदाता',

    // ── Services ──
    service_plumbing: 'प्लंबिंग',
    service_electrical: 'इलेक्ट्रिकल',
    service_cleaning: 'स्वच्छता',
    service_carpentry: 'सुतारकाम',
    service_painting: 'रंगकाम',
    service_ac: 'AC दुरुस्ती',
    service_appliance: 'उपकरण दुरुस्ती',

    // ── Booking ──
    book_now: 'आत्ता बुक करा',
    book_title: 'सेवा बुक करा',
    book_date: 'तारीख निवडा',
    book_time: 'वेळ निवडा',
    book_address: 'सेवेचा पत्ता',
    book_confirm: 'बुकिंग पक्की करा',
    book_cancel: 'रद्द करा',
    book_success: 'बुकिंग झाली!',
    book_pending: 'बुकिंग प्रलंबित',
    book_cancelled: 'बुकिंग रद्द',

    // ── Profile ──
    profile_title: 'माझे प्रोफाइल',
    profile_name: 'पूर्ण नाव',
    profile_phone: 'फोन नंबर',
    profile_language: 'पसंतीची भाषा',
    profile_save: 'बदल जतन करा',
    profile_saved: 'बदल जतन केले',

    // ── Common ──
    loading: 'लोड होत आहे...',
    error: 'काहीतरी चुकले',
    retry: 'पुन्हा प्रयत्न करा',
    back: 'मागे',
    next: 'पुढे',
    done: 'झाले',
    yes: 'हो',
    no: 'नाही',
    submit: 'सबमिट करा',
    search: 'शोधा',
    filter: 'फिल्टर',
    sort: 'क्रमवारी',
    price: 'किंमत',
    rating: 'रेटिंग',
    reviews: 'पुनरावलोकने',
    view_all: 'सर्व पहा',
    see_more: 'अधिक पहा',
    no_results: 'कोणतेही परिणाम सापडले नाही',
    confirm: 'पुष्टी करा',

    // ── Auth ──
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    sign_up: 'साइन अप',
    welcome_back: 'पुन्हा स्वागत आहे',

    // ── Sidebar ──
    sidebar_for_experts: 'तज्ञांसाठी',
    sidebar_register_tech: 'तंत्रज्ञ म्हणून नोंदणी करा',
    sidebar_tech_login: 'तंत्रज्ञ लॉगिन',
    sidebar_utility: 'उपयुक्तता',
    sidebar_admin: 'अॅडमिन डॅशबोर्ड',
    sidebar_contact: 'संपर्क करा',
    sidebar_legal: 'कायदेशीर',
    sidebar_privacy: 'गोपनीयता धोरण',
    sidebar_terms: 'अटी व शर्ती',
    sidebar_log_out: 'लॉग आउट',
    sidebar_log_in: 'लॉग इन',

    // ── Index Page ──
    index_top_rated: 'टॉप रेटेड',
    index_search_for: 'शोधा',
    index_no_service: 'कोणतीही सेवा सापडली नाही',
    index_try_search: '"AC", "स्वच्छता", किंवा "दुरुस्ती" वापरून पहा',
    index_section_home: 'बांधकाम आणि घर',
    index_section_appliance: 'उपकरण दुरुस्ती',
    index_section_electronics: 'इलेक्ट्रॉनिक्स आणि IT',
    index_section_auto: 'ऑटोमोबाइल',
    index_section_industrial: 'औद्योगिक',
    index_section_other: 'इतर सेवा',

    // ── Service Page ──
    svc_verified: 'सत्यापित प्रो',
    svc_select: 'सेवा निवडा',
    svc_tap_add: 'जोडण्यासाठी टॅप करा',
    svc_total: 'एकूण अंदाज',
    svc_book_now: 'आत्ता बुक करा',
    svc_select_prompt: 'सेवा निवडा',
    svc_confirm_title: 'बुकिंग पक्की करा',
    svc_name_placeholder: 'तुमचे पूर्ण नाव टाका',
    svc_phone_placeholder: 'फोन नंबर टाका',
    svc_address_placeholder: 'पूर्ण पत्ता टाका',
    svc_fetch_gps: '📍 सध्याचे GPS ठिकाण मिळवा',
    svc_fetching_gps: 'ठिकाण शोधत आहे...',
    svc_add_photo: 'फोटो जोडा (पर्यायी)',
    svc_live_camera: 'थेट कॅमेरा',
    svc_gallery: 'गॅलरी',
    svc_photo_note: 'थेट फोटो काढा किंवा गॅलरीतून अपलोड करा',
    svc_terms_title: 'अटी व शर्ती:',
    svc_agree: 'मी अटी व शर्तींशी सहमत आहे आणि जॉब ब्रॉडकास्टला परवानगी देतो/देते.',
    svc_cancel: 'रद्द करा',
    svc_confirm_btn: 'बुकिंग पक्की करा',
    svc_time_warning: '⚠️ कृपया आत्तापासून किमान 30 मिनिटांनंतरची वेळ निवडा',
    svc_items: 'आयटम',
    svc_select_to_enable: 'बुकिंग सक्षम करण्यासाठी आयटम निवडा',

    // ── Technician Dashboard ──
    tech_pro_partner: 'प्रो पार्टनर',
    tech_active_jobs: 'सक्रिय कामे',
    tech_earnings: 'कमाई',
    tech_today: 'आज',
    tech_available: 'कामासाठी उपलब्ध',
    tech_notif_blocked: '🔕 सूचना ब्लॉक आहेत. तुम्हाला जॉब अलर्ट मिळणार नाहीत.',
    tech_notif_enable: '🔔 त्वरित जॉब अलर्ट मिळवण्यासाठी सूचना सक्षम करा.',
    tech_enable_now: 'आत्ता सक्षम करा',
    tech_loading_jobs: 'कामे लोड होत आहेत…',
    tech_no_jobs: 'कोणतेही सक्रिय काम नाही',
    tech_new_job: 'नवीन काम आले',
    tech_your_earnings: 'तुमची कमाई',
    tech_call_customer: '📞 ग्राहकाला कॉल करा',
    tech_open_maps: 'नकाशात उघडा →',
    tech_accept: 'स्वीकारा',
    tech_reject: 'नाकारा',
    tech_mark_arrived: 'पोहोचलो म्हणून नोंदवा',
    tech_complete_job: 'काम पूर्ण करा',

    // ── Partner Login ──
    partner_title: 'FixZenix',
    partner_username: 'तुमचे वापरकर्ता नाव',
    partner_password: 'तुमचा पासवर्ड',
    partner_login_btn: 'लॉगिन',
    partner_err_fields: 'वापरकर्ता नाव आणि पासवर्ड टाका',
    partner_err_invalid: 'चुकीचे वापरकर्ता नाव किंवा पासवर्ड',

    // ── Partner Register ──
    partner_reg_title: 'FixZenix मध्ये सामील व्हा',
    partner_reg_subtitle: 'काम मिळवण्यासाठी आणि कमाई सुरू करण्यासाठी तपशील भरा',
    partner_reg_name: 'पूर्ण नाव',
    partner_reg_mobile: 'मोबाइल नंबर',
    partner_reg_username: 'वापरकर्ता नाव',
    partner_reg_password: 'पासवर्ड',
    partner_reg_specialization: 'विशेषीकरण',
    partner_reg_select_spec: 'विशेषीकरण निवडा',
    partner_reg_experience: 'अनुभव',
    partner_reg_exp_placeholder: 'वर्षे',
    partner_reg_aadhaar: 'आधार',
    partner_reg_area: 'सेवा क्षेत्र',
    partner_reg_area_placeholder: 'शहर किंवा परिसर',
    partner_reg_submit: 'अर्ज सबमिट करा',
    partner_reg_submitting: 'नोंदणी होत आहे...',
    partner_reg_success_title: 'अर्ज पाठवला!',
    partner_reg_success_msg: 'आमची टीम तुमच्याशी संपर्क करेल',
    partner_reg_success_hours: '24 तासांच्या आत',
    partner_reg_return: 'मुख्यपृष्ठावर परत जा',
  }
};

// ─────────────────────────────────────────────────────────────
//  CORE ENGINE — Don't edit below unless you know what you're doing
// ─────────────────────────────────────────────────────────────

const FixZenI18n = {

  currentLang: 'en',

  /**
   * Get translation for a key in current language
   */
  t(key) {
    const lang = this.currentLang;
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
      || (TRANSLATIONS['en'] && TRANSLATIONS['en'][key])
      || key;
  },

  /**
   * Apply translations to all elements on the page
   */
  applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', this.t(key));
    });

    // Translate title attributes (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', this.t(key));
    });

    // Set html lang attribute
    document.documentElement.lang = this.currentLang === 'hi' ? 'hi'
      : this.currentLang === 'mr' ? 'mr' : 'en';
  },

  /**
   * Switch language and re-apply
   */
  setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('fixzen_lang', lang);
    this.applyTranslations();
    this.updateSwitcherUI();

    // Try saving to Supabase profile (non-blocking)
    this.syncLangToSupabase(lang);
  },

  /**
   * Sync language preference to Supabase (if supabase is available on page)
   */
  async syncLangToSupabase(lang) {
    try {
      if (window.supabase) {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) {
          await window.supabase.from('profiles')
            .update({ preferred_lang: lang })
            .eq('id', user.id);
        }
      }
    } catch (e) { /* non-critical */ }
  },

  /**
   * Load language — first from Supabase profile, then localStorage
   */
  async loadLang() {
    // Try Supabase first
    try {
      if (window.supabase) {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) {
          const { data: profile } = await window.supabase
            .from('profiles')
            .select('preferred_lang')
            .eq('id', user.id)
            .maybeSingle();

          if (profile && profile.preferred_lang) {
            this.currentLang = profile.preferred_lang;
            localStorage.setItem('fixzen_lang', profile.preferred_lang);
            this.applyTranslations();
            this.updateSwitcherUI();
            return;
          }
        }
      }
    } catch (e) { /* fallback to localStorage */ }

    // Fallback: localStorage
    const saved = localStorage.getItem('fixzen_lang') || 'en';
    this.currentLang = saved;
    this.applyTranslations();
    this.updateSwitcherUI();
  },

  /**
   * Inject a floating language switcher button into the page
   */
  injectSwitcher() {
    // Check if custom placeholder exists
    const placeholder = document.getElementById('fixzen-lang-switcher');

    const switcher = document.createElement('div');
    switcher.id = 'fixzen-lang-widget';
    switcher.style.cssText = `
      display: flex; gap: 4px; align-items: center;
      font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif;
    `;
    switcher.innerHTML = `
      <button onclick="FixZenI18n.setLang('en')" id="lang-en" style="
        padding: 4px 10px; border-radius: 20px; border: 1.5px solid #DFD4C3;
        font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        background: white; color: #5D5646;">EN</button>
      <button onclick="FixZenI18n.setLang('hi')" id="lang-hi" style="
        padding: 4px 10px; border-radius: 20px; border: 1.5px solid #DFD4C3;
        font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        background: white; color: #5D5646; font-family: 'Noto Sans Devanagari', sans-serif;">हि</button>
      <button onclick="FixZenI18n.setLang('mr')" id="lang-mr" style="
        padding: 4px 10px; border-radius: 20px; border: 1.5px solid #DFD4C3;
        font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        background: white; color: #5D5646; font-family: 'Noto Sans Devanagari', sans-serif;">म</button>
    `;

    if (placeholder) {
      placeholder.appendChild(switcher);
    } else {
      // Auto-inject as floating widget
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: white; padding: 8px 12px; border-radius: 30px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12); border: 1px solid #DFD4C3;
        display: flex; gap: 4px; align-items: center;
      `;
      wrapper.appendChild(switcher);
      document.body.appendChild(wrapper);
    }

    this.updateSwitcherUI();
  },

  /**
   * Highlight the active language button in the switcher
   */
  updateSwitcherUI() {
    ['en', 'hi', 'mr'].forEach(l => {
      const btn = document.getElementById('lang-' + l);
      if (!btn) return;
      if (l === this.currentLang) {
        btn.style.background = '#5D5646';
        btn.style.color = 'white';
        btn.style.borderColor = '#5D5646';
      } else {
        btn.style.background = 'white';
        btn.style.color = '#5D5646';
        btn.style.borderColor = '#DFD4C3';
      }
    });
  },

  /**
   * Initialize — call this automatically on page load
   */
  async init() {
    // Inject Devanagari font if not present
    if (!document.querySelector('link[href*="Noto+Sans+Devanagari"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }

    // Apply immediately from localStorage (fast, no flicker)
    const savedLang = localStorage.getItem('fixzen_lang') || 'en';
    this.currentLang = savedLang;
    this.applyTranslations();

    // Inject switcher
    this.injectSwitcher();

    // Then sync from Supabase in background (after supabase loads)
    setTimeout(() => this.loadLang(), 500);
  }
};

// Make globally available
window.FixZenI18n = FixZenI18n;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => FixZenI18n.init());
} else {
  FixZenI18n.init();
}