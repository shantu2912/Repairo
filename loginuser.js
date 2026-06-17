import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://kzxdxnxgouthsywbsnvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag'
)
window.supabase = supabase;

function authApp() {
    return {
        step: 'lang',
        isNewUser: false,
        loading: false,
        message: '',
        lang: localStorage.getItem('fixzen_lang') || 'en',
        form: { name:'', phone:'', user:'', pass:'', birthplace:'' },
        errors: { name: false, phone: false, user: false, pass: false },
        
        // Password Reset Context Fields
        forgot: { phone: '', birthplace: '', newPass: '' },
        forgotVerified: false,
        recoveredUserId: null,

        t: {
            en: {
                tagline: 'Premium Home Care', choose_lang: 'Choose Your Language', lang_continue: 'CONTINUE',
                welcome: 'Welcome to FixZen', create_account: 'Create Account', login: 'Login',
                full_name: 'Full Name', username: 'Username', password: 'Password', mobile: 'Mobile Number',
                sign_in: 'Sign In', already_member: 'Already a member? Sign In', new_user: 'New User? Create Account',
                name_placeholder: 'Rahul Sharma', user_placeholder: 'username', pass_placeholder: '••••••••', phone_placeholder: '9876543210',
                err_phone: 'Must be a 10-digit Indian number starting with 6-9', err_exists: 'Mobile number already registered',
                err_user_exists: 'Username is already taken', err_user_format: 'Use alphabets and numbers only (No spaces)',
                err_not_found: 'Account not found with this mobile number', err_pass: 'Password must be at least 6 characters long',
                err_login: 'Incorrect mobile number or password.', msg_name_req: 'Enter letters only (Min 3 characters, no numbers)',
                welcome_back: 'Welcome Back', secret_question: 'Security Question: What is your birth place city?', secret_placeholder: 'e.g., Nagpur',
                forgot_link: 'Forgot Password?', reset_title: 'Reset Password', reset_subtitle: 'Provide registration phone and birth city answer to recover access.',
                answer_placeholder: 'Enter your birth place city name', verify_btn: 'Verify Details', new_password: 'Enter New Password', save_pass_btn: 'Update Password'
            },
            hi: {
                tagline: 'प्रीमियम होम केयर', choose_lang: 'अपनी भाषा चुनें', lang_continue: 'आगे बढ़ें',
                welcome: 'FixZen में स्वागत है', create_account: 'नया खाता बनाएं', login: 'लॉगिन करें',
                full_name: 'पूरा नाम', username: 'उपयोगकर्ता नाम', password: 'पासवर्ड', mobile: 'मोबाइल नंबर',
                sign_in: 'साइन इन करें', already_member: 'पहले से सदस्य हैं? साइन इन करें', new_user: 'नए उपयोगकर्ता? खाता बनाएं',
                name_placeholder: 'राहुल शर्मा', user_placeholder: 'उपयोगकर्ता नाम', pass_placeholder: '••••••••', phone_placeholder: '9876543210',
                err_phone: '6-9 से शुरू होने वाला 10-अंकीय भारतीय नंबर दर्ज करें', err_exists: 'यह मोबाइल नंबर पहले से पंजीकृत है',
                err_user_exists: 'यह उपयोगकर्ता नाम पहले से मौजूद है', err_user_format: 'केवल अक्षरों और अंकों का प्रयोग करें (स्पेस न दें)',
                err_not_found: 'इस नंबर के साथ कोई खाता नहीं मिला', err_pass: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
                err_login: 'गलत मोबाइल नंबर या पासवर्ड। कृपया पुनः प्रयास करें।', msg_name_req: 'केवल अक्षर दर्ज करें (न्यूनतम 3 अक्षर, संख्याएं नहीं)',
                welcome_back: 'वापसी पर स्वागत है', secret_question: 'सुरक्षा प्रश्न: आपका जन्म स्थान कौन सा शहर है?', secret_placeholder: 'उदा., नागपुर',
                forgot_link: 'पासवर्ड भूल गए?', reset_title: 'पासवर्ड रीसेट करें', reset_subtitle: 'पहुंच पुनः प्राप्त करने के लिए पंजीकरण फोन और जन्म शहर का उत्तर प्रदान करें।',
                answer_placeholder: 'अपने जन्म स्थान के शहर का नाम दर्ज करें', verify_btn: 'विवरण सत्यापित करें', new_password: 'नया पासवर्ड दर्ज करें', save_pass_btn: 'पासवर्ड अपडेट करें'
            },
            mr: {
                tagline: 'प्रीमियम होम केअर', choose_lang: 'तुमची भाषा निवडा', lang_continue: 'पुढे जा',
                welcome: 'FixZen मध्ये स्वागत आहे', create_account: 'नवीन खाते तयार करा', login: 'लॉगिन करा',
                full_name: 'पूर्ण नाव', username: 'वापरकर्ता नाव', password: 'पासवर्ड', mobile: 'मोबाइल नंबर',
                sign_in: 'साइन इन करा', already_member: 'आधीच सदस्य आहात? साइन इन करा', new_user: 'नवीन वापरकर्ता? खाते तयार करा',
                name_placeholder: 'राहुल शर्मा', user_placeholder: 'वापरकर्ता नाव', pass_placeholder: '••••••••', phone_placeholder: '9876543210',
                err_phone: '6-9 ने सुरू होणारा वैध 10-अंकीय भारतीय नंबर प्रविष्ट करा', err_exists: 'हा मोबाईल नंबर आधीपासून नोंदणीकृत आहे',
                err_user_exists: 'हे वापरकर्ता नाव आधीच घेतले आहे', err_user_format: 'फक्त अक्षरे आणि अंक वापरा (स्पेस देऊ नका)',
                err_not_found: 'या नंबरसह खाते सापडले नाही', err_pass: 'पासवर्ड किमान 6 अक्षरांचा असावा',
                err_login: 'चुकीचा मोबाईल नंबर किंवा पासवर्ड।', msg_name_req: 'फक्त अक्षरे प्रविष्ट करा (किमान 3 अक्षरे, संख्या नाही)',
                welcome_back: 'पुन्हा स्वागत आहे', secret_question: 'सुरक्षा प्रश्न: तुमचे जन्मस्थान कोणते शहर आहे?', secret_placeholder: 'उदा., नागपूर',
                forgot_link: 'पासवर्ड विसरलात?', reset_title: 'पासवर्ड रीसेट करा', reset_subtitle: 'अॅक्सेस रिकव्हर करण्यासाठी नोंदणीकृत फोन आणि जन्माचे शहर प्रविष्ट करा.',
                answer_placeholder: 'तुमच्या जन्मस्थानाच्या शहराचे नाव प्रविष्ट करा', verify_btn: 'माहिती सत्यापित करा', new_password: 'नवीन पासवर्ड प्रविष्ट करा', save_pass_btn: 'पासवर्ड अपडेट करा'
            }
        },

        tx(key) { return (this.t[this.lang] || this.t['en'])[key] || key; },
        setLang(l) { this.lang = l; localStorage.setItem('fixzen_lang', l); },
        proceedFromLang() { this.step = 'choose'; },
        normalizePhone() { return '+91' + this.form.phone.replace(/\s+/g, '').trim(); },
        
        resetErrors() {
            this.message = '';
            this.form = { name:'', phone:'', user:'', pass:'', birthplace:'' };
            this.errors = { name: false, phone: false, user: false, pass: false };
        },

        validateField(field) {
            this.message = '';
            let val = this.form[field] || '';

            if (field === 'name') {
                this.form.name = val.replace(/[^a-zA-Z\s]/g, '');
                this.errors.name = this.form.name.trim().length > 0 && this.form.name.trim().length < 3;
            }

            if (field === 'phone') {
                const digits = this.form.phone.replace(/\D/g, '');
                this.form.phone = digits; 
                if (digits.length > 0) {
                    const firstDigit = parseInt(digits[0]);
                    this.errors.phone = firstDigit < 6 || isNaN(firstDigit) || (digits.length === 10 && !/^[6-9]\d{9}$/.test(digits));
                } else {
                    this.errors.phone = false;
                }
            }

            if (field === 'pass') {
                this.errors.pass = this.form.pass.length > 0 && this.form.pass.length < 6;
            }

            if (this.isNewUser && field === 'user') {
                const cleanUser = this.form.user.trim();
                if (cleanUser.length > 0) {
                    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
                    this.errors.user = !alphaNumericRegex.test(cleanUser);
                } else {
                    this.errors.user = false;
                }
            }
        },

        async verifyRecoveryDetails() {
            const rawPhone = this.forgot.phone.trim();
            const cleanCityAnswer = this.forgot.birthplace.trim().toLowerCase();

            if (!/^[6-9]\d{9}$/.test(rawPhone) || !cleanCityAnswer) {
                this.message = 'Please enter a valid 10-digit phone number and birthplace city.';
                return;
            }

            this.loading = true;
            this.message = '';
            const fullPhone = '+91' + rawPhone;

            try {
                const { data: profile, error } = await window.supabase
                    .from('profiles')
                    .select('id')
                    .eq('phone', fullPhone)
                    .eq('preferred_lang', cleanCityAnswer)
                    .maybeSingle();

                if (error) throw error;

                if (!profile) {
                    this.message = 'Verification Failed: Phone number or birthplace answer does not match.';
                    this.loading = false;
                    return;
                }

                this.recoveredUserId = profile.id;
                this.forgotVerified = true;
            } catch (err) {
                this.message = "System error: " + err.message;
            } finally {
                this.loading = false;
            }
        },

        async saveNewPassword() {
            const updatedPass = this.forgot.newPass.trim();
            if (updatedPass.length < 6) {
                this.message = 'Password must be at least 6 characters long.';
                return;
            }

            this.loading = true;
            this.message = '';

            try {
                const { error } = await window.supabase
                    .from('profiles')
                    .update({ password_hash: updatedPass })
                    .eq('id', this.recoveredUserId);

                if (error) throw error;

                alert('Password successfully updated! Please sign in with your new credentials.');
                this.step = 'auth';
                this.resetErrors();
                this.forgot = { phone: '', birthplace: '', newPass: '' };
                this.forgotVerified = false;
            } catch (err) {
                this.message = "Update failure: " + err.message;
            } finally {
                this.loading = false;
            }
        },

        async processForm() {
            const cleanPhone = this.form.phone.trim();
            const indianPhoneRegex = /^[6-9]\d{9}$/;

            this.errors.phone = !indianPhoneRegex.test(cleanPhone);
            this.errors.pass = !this.form.pass || this.form.pass.length < 6;
            
            if (this.isNewUser) {
                this.errors.name = !this.form.name.trim() || this.form.name.trim().length < 3;
                const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
                this.errors.user = !alphaNumericRegex.test(this.form.user.trim());
                if (!this.form.birthplace.trim()) {
                    this.message = "Please fill out your birthplace city to secure account recovery checkpoints.";
                    return;
                }
            }

            if (this.errors.phone || this.errors.pass || (this.isNewUser && (this.errors.name || this.errors.user))) {
                this.message = 'Please correct the highlighted format errors before continuing.';
                return;
            }

            this.loading = true;
            this.message = '';
            const phone = this.normalizePhone();

            try {
                if (this.isNewUser) {
                    const { data: nameUser, error: nameError } = await window.supabase
                        .from('profiles')
                        .select('id')
                        .eq('username', this.form.user.trim())
                        .maybeSingle();

                    if (nameError) throw nameError;
                    if (nameUser) {
                        this.errors.user = true;
                        this.message = this.tx('err_user_exists');
                        this.loading = false;
                        return;
                    }

                    const { data: phoneUser, error: phoneCheckError } = await window.supabase
                        .from('profiles')
                        .select('id')
                        .eq('phone', phone)
                        .maybeSingle();

                    if (phoneCheckError) throw phoneCheckError;
                    if (phoneUser) {
                        this.errors.phone = true;
                        this.message = this.tx('err_exists');
                        this.loading = false;
                        return;
                    }

                    const databaseSafeUuid = crypto.randomUUID();

                    const { error: profileError } = await window.supabase
                        .from('profiles')
                        .insert([{
                            id: databaseSafeUuid,
                            full_name: this.form.name.trim(),
                            username: this.form.user.trim(),
                            phone: phone,
                            password_hash: this.form.pass,
                            preferred_lang: this.form.birthplace.trim().toLowerCase()
                        }]);

                    if (profileError) throw profileError;

                    localStorage.setItem('local_user_logged', 'true');
                    localStorage.setItem('local_user_phone', phone);
                    window.location.href = 'index.html';

                } else {
                    const { data: userProfile, error: loginError } = await window.supabase
                        .from('profiles')
                        .select('*')
                        .eq('phone', phone)
                        .eq('password_hash', this.form.pass)
                        .maybeSingle();

                    if (loginError || !userProfile) {
                        this.errors.pass = true;
                        this.message = this.tx('err_login');
                        this.loading = false;
                        return;
                    }

                    localStorage.setItem('local_user_logged', 'true');
                    localStorage.setItem('local_user_phone', phone);
                    window.location.href = 'index.html';
                }
            } catch (err) {
                this.message = err.message;
            } finally {
                this.loading = false;
            }
        }
    }
}

// ── CRITICAL FIX: EXPLICITLY BIND TO WINDOW OBJECT ──
window.authApp = authApp;
