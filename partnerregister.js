const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const sb = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('alpine:init', () => {
    Alpine.data('registrationForm', () => ({
        step: 1,
        submitted: false,
        submitting: false,
        techId: '',
        form: {
            name: '',
            phone: '',
            username: '',
            password: '',
            category: '',
            experience: '',
            aadhaar: '',
            area: '',
            photoFile: null,
            photoPreview: null
        },
        // Validation states
        nameValid: null,
        nameError: '',
        phoneError: '',
        usernameError: '',
        passwordError: '',
        categoryError: false,
        expError: '',
        aadhaarError: '',
        areaError: '',
        passwordChecks: [],

        init() {
            this.$nextTick(() => {
                const firstInput = document.querySelector('input');
                if (firstInput) firstInput.focus();
            });
        },

        nextStep() {
            if (this.step === 1 && !this.validateStep1()) return;
            if (this.step === 2 && !this.validateStep2()) return;
            if (this.step === 3 && !this.validateStep3()) return;
            if (this.step < 4) this.step++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        prevStep() {
            if (this.step > 1) this.step--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        validateName() {
            const name = this.form.name.trim();
            if (name.length === 0) {
                this.nameError = 'Name is required';
                this.nameValid = false;
                return false;
            }
            if (!/^[A-Za-z ]{3,40}$/.test(name)) {
                this.nameError = '3-40 characters, letters only';
                this.nameValid = false;
                return false;
            }
            this.nameError = '';
            this.nameValid = true;
            return true;
        },

        validatePhone() {
            const phone = this.form.phone.trim();
            if (phone.length === 0) {
                this.phoneError = 'Phone number is required';
                return false;
            }
            if (!/^[6-9]\d{9}$/.test(phone)) {
                this.phoneError = '10 digits starting with 6-9';
                return false;
            }
            this.phoneError = '';
            return true;
        },

        validateUsername() {
            const username = this.form.username.trim();
            if (username.length === 0) {
                this.usernameError = 'Username is required';
                return false;
            }
            if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
                this.usernameError = '4-20 characters, letters/numbers/_ only';
                return false;
            }
            this.usernameError = '';
            return true;
        },

        validatePassword() {
            const pwd = this.form.password;
            if (pwd.length === 0) {
                this.passwordError = 'Password is required';
                this.passwordChecks = [];
                return false;
            }
            if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(pwd)) {
                this.passwordError = 'Min 8 chars, with letter, number & special';
                this.passwordChecks = [];
                return false;
            }
            this.passwordError = '';
            this.passwordChecks = ['✓'];
            return true;
        },

        validateExperience() {
            const exp = parseFloat(this.form.experience);
            if (isNaN(exp) || exp < 0 || exp > 50) {
                this.expError = 'Enter 0-50 years';
                return false;
            }
            this.expError = '';
            return true;
        },

        validateAadhaar() {
            const aadhaar = this.form.aadhaar.replace(/\s/g, '');
            if (aadhaar.length === 0) {
                this.aadhaarError = 'Aadhaar is required';
                return false;
            }
            if (!/^\d{12}$/.test(aadhaar)) {
                this.aadhaarError = 'Must be 12 digits';
                return false;
            }
            this.aadhaarError = '';
            return true;
        },

        validateArea() {
            const area = this.form.area.trim();
            if (area.length === 0) {
                this.areaError = 'Service area is required';
                return false;
            }
            if (!/^[A-Za-z ]{3,40}$/.test(area)) {
                this.areaError = '3-40 characters, letters only';
                return false;
            }
            this.areaError = '';
            return true;
        },

        validateStep1() {
            return this.validateName() && this.validatePhone();
        },

        validateStep2() {
            return this.validateUsername() && this.validatePassword();
        },

        validateStep3() {
            let valid = true;
            if (!this.form.category) {
                this.categoryError = true;
                valid = false;
            } else {
                this.categoryError = false;
            }
            if (!this.validateExperience()) valid = false;
            if (!this.validateAadhaar()) valid = false;
            return valid;
        },

        handlePhoto(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB.');
                return;
            }

            this.form.photoFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.form.photoPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        async submitForm() {
            if (!this.validateStep3()) return;
            if (!this.validateArea()) return;

            this.submitting = true;

            try {
                // First, generate technician ID
                const techId = await this.generateTechnicianId();
                
                // Upload photo if exists
                let imageUrl = null;
                if (this.form.photoFile) {
                    imageUrl = await this.uploadPhoto(techId, this.form.photoFile);
                }

                // Submit technician data
                const result = await this.submitTechnician(techId, imageUrl);
                
                if (result.success) {
                    this.techId = techId;
                    this.submitted = true;
                    this.submitting = false;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    alert(result.error || 'Registration failed. Please try again.');
                    this.submitting = false;
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Something went wrong. Please try again.');
                this.submitting = false;
            }
        },

        async generateTechnicianId() {
            try {
                const { data, error } = await sb
                    .from('technicians')
                    .select('tech_id')
                    .not('tech_id', 'is', null)
                    .order('tech_id', { ascending: false })
                    .limit(1);

                if (error) throw error;

                let nextNumber = 1;
                if (data && data.length > 0 && data[0].tech_id) {
                    const lastId = data[0].tech_id;
                    const match = lastId.match(/FZ(\d+)/);
                    if (match) {
                        nextNumber = parseInt(match[1]) + 1;
                    }
                }

                return `FZ${String(nextNumber).padStart(3, '0')}`;
            } catch (err) {
                console.error("Error generating technician ID:", err);
                return `FZ${String(Date.now()).slice(-3)}`;
            }
        },

        async uploadPhoto(techId, file) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${techId}.${fileExt}`;
                const filePath = `technician-images/${fileName}`;

                const { error: uploadError } = await sb.storage
                    .from('technician-profiles')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = sb.storage
                    .from('technician-profiles')
                    .getPublicUrl(filePath);

                return urlData.publicUrl;
            } catch (err) {
                console.error('Image upload error:', err);
                return null;
            }
        },

        async submitTechnician(techId, imageUrl) {
            try {
                // Hash password
                const encoder = new TextEncoder();
                const data = encoder.encode(this.form.password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                const insertData = {
                    tech_id: techId,
                    name: this.form.name.trim(),
                    phone: "+91" + this.form.phone.trim(),
                    username: this.form.username.trim(),
                    password: hashedPassword,
                    category: this.form.category,
                    experience: parseFloat(this.form.experience),
                    aadhaar: this.form.aadhaar.replace(/\s/g, ''),
                    area: this.form.area.trim(),
                    status: 'pending',
                    is_active: true,
                    image_url: imageUrl,
                    created_at: new Date().toISOString()
                };

                const { error } = await sb
                    .from('technicians')
                    .insert([insertData]);

                if (error) throw error;

                return { success: true };
            } catch (err) {
                console.error('Submit error:', err);
                let errorMsg = 'Registration failed. ';
                if (err.code === '23505') {
                    errorMsg += 'Username or phone already exists.';
                } else {
                    errorMsg += err.message;
                }
                return {
                    success: false,
                    error: errorMsg
                };
            }
        }
    }));
});
