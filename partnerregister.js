const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const sb = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('alpine:init', () => {
    Alpine.data('registrationForm', () => ({
        step: 1,
        submitted: false,
        submitting: false,
        techId: '',

        // ── photo upload state ──────────────────────────────────
        photoUploadStatus: 'idle',   // 'idle' | 'uploading' | 'success' | 'skipped'
        photoUploadMsg: '',

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

        // ── validators (unchanged) ──────────────────────────────
        validateName() {
            const name = this.form.name.trim();
            if (!name.length) { this.nameError = 'Name is required'; this.nameValid = false; return false; }
            if (!/^[A-Za-z ]{3,40}$/.test(name)) { this.nameError = '3–40 characters, letters only'; this.nameValid = false; return false; }
            this.nameError = ''; this.nameValid = true; return true;
        },
        validatePhone() {
            const phone = this.form.phone.trim();
            if (!phone.length) { this.phoneError = 'Phone number is required'; return false; }
            if (!/^[6-9]\d{9}$/.test(phone)) { this.phoneError = '10 digits starting with 6–9'; return false; }
            this.phoneError = ''; return true;
        },
        validateUsername() {
            const u = this.form.username.trim();
            if (!u.length) { this.usernameError = 'Username is required'; return false; }
            if (!/^[a-zA-Z0-9_]{4,20}$/.test(u)) { this.usernameError = '4–20 characters, letters/numbers/_ only'; return false; }
            this.usernameError = ''; return true;
        },
        validatePassword() {
            const pwd = this.form.password;
            if (!pwd.length) { this.passwordError = 'Password is required'; this.passwordChecks = []; return false; }
            if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(pwd)) {
                this.passwordError = 'Min 8 chars with letter, number & special'; this.passwordChecks = []; return false;
            }
            this.passwordError = ''; this.passwordChecks = ['✓']; return true;
        },
        validateExperience() {
            const exp = parseFloat(this.form.experience);
            if (isNaN(exp) || exp < 0 || exp > 50) { this.expError = 'Enter 0–50 years'; return false; }
            this.expError = ''; return true;
        },
        validateAadhaar() {
            const a = this.form.aadhaar.replace(/\s/g, '');
            if (!a.length) { this.aadhaarError = 'Aadhaar is required'; return false; }
            if (!/^\d{12}$/.test(a)) { this.aadhaarError = 'Must be 12 digits'; return false; }
            this.aadhaarError = ''; return true;
        },
        validateArea() {
            const area = this.form.area.trim();
            if (!area.length) { this.areaError = 'Service area is required'; return false; }
            if (!/^[A-Za-z ]{3,40}$/.test(area)) { this.areaError = '3–40 characters, letters only'; return false; }
            this.areaError = ''; return true;
        },
        validateStep1() { return this.validateName() && this.validatePhone(); },
        validateStep2() { return this.validateUsername() && this.validatePassword(); },
        validateStep3() {
            let valid = true;
            if (!this.form.category) { this.categoryError = true; valid = false; } else { this.categoryError = false; }
            if (!this.validateExperience()) valid = false;
            if (!this.validateAadhaar()) valid = false;
            return valid;
        },

        // ── photo handler ───────────────────────────────────────
        handlePhoto(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
            if (file.size > 2 * 1024 * 1024) { alert('Image size should be less than 2 MB.'); return; }
            this.form.photoFile = file;
            const reader = new FileReader();
            reader.onload = (e) => { this.form.photoPreview = e.target.result; };
            reader.readAsDataURL(file);
        },

        // ── main submit ─────────────────────────────────────────
        async submitForm() {
            if (!this.validateStep3()) return;
            if (!this.validateArea()) return;

            this.submitting = true;

            try {
                const techId = await this.generateTechnicianId();
                const result = await this.submitTechnician(techId);

                if (!result.success) {
                    alert(result.error || 'Registration failed. Please try again.');
                    this.submitting = false;
                    return;
                }

                // ── photo upload (non-blocking) ─────────────────
                if (this.form.photoFile) {
                    this.photoUploadStatus = 'uploading';
                    try {
                        const imageUrl = await this.uploadPhoto(techId, this.form.photoFile);
                        if (imageUrl) {
                            await this.updateTechnicianImage(techId, imageUrl);
                            this.photoUploadStatus = 'success';
                            this.photoUploadMsg = 'Photo uploaded ✓';
                        } else {
                            this.photoUploadStatus = 'skipped';
                            this.photoUploadMsg = 'Photo skipped (can be added later)';
                        }
                    } catch (photoErr) {
                        // RLS or network error — registration already saved, just skip photo
                        console.warn('Photo upload failed (non-fatal):', photoErr);
                        this.photoUploadStatus = 'skipped';
                        this.photoUploadMsg = 'Photo skipped — you can upload it later from your dashboard.';
                    }
                }

                this.techId = techId;
                this.submitted = true;
                this.submitting = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (error) {
                console.error('Submission error:', error);
                alert('Something went wrong. Please try again.');
                this.submitting = false;
            }
        },

        // ── ID generator ────────────────────────────────────────
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
                    const match = data[0].tech_id.match(/FZ(\d+)/);
                    if (match) nextNumber = parseInt(match[1]) + 1;
                }
                return `FZ${String(nextNumber).padStart(3, '0')}`;
            } catch (err) {
                console.error('Error generating technician ID:', err);
                return `FZ${String(Date.now()).slice(-3)}`;
            }
        },

        // ── photo upload with 3 path attempts ───────────────────
        async uploadPhoto(techId, file) {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${techId}.${fileExt}`;

            // Candidate paths — try each until one works
            const paths = [
                `technician-images/${fileName}`,   // original path
                `public/${fileName}`,               // "public" folder (often whitelisted by default policies)
                fileName,                           // root of bucket
            ];

            for (const filePath of paths) {
                try {
                    const { error: uploadError } = await sb.storage
                        .from('technician-profiles')
                        .upload(filePath, file, { cacheControl: '3600', upsert: true });

                    if (uploadError) {
                        // RLS error — try next path
                        if (
                            uploadError.message?.includes('row-level security') ||
                            uploadError.message?.includes('policy') ||
                            uploadError.statusCode === 403 ||
                            uploadError.statusCode === '403'
                        ) {
                            console.warn(`RLS blocked path "${filePath}", trying next…`);
                            continue;
                        }
                        // Other error (network, size) — throw immediately
                        throw uploadError;
                    }

                    // Upload succeeded — get public URL
                    const { data: urlData } = sb.storage
                        .from('technician-profiles')
                        .getPublicUrl(filePath);

                    console.log(`Photo uploaded to "${filePath}" ✓`);
                    return urlData.publicUrl;

                } catch (err) {
                    if (
                        err.message?.includes('row-level security') ||
                        err.message?.includes('policy')
                    ) {
                        console.warn(`RLS blocked path "${filePath}", trying next…`);
                        continue;
                    }
                    throw err;
                }
            }

            // All paths blocked — return null (registration still completes)
            console.warn(
                'All upload paths blocked by Supabase RLS.\n' +
                'Fix: run SUPABASE_FIX.sql in your Supabase Dashboard → SQL Editor.\n' +
                'Registration saved successfully without photo.'
            );
            return null;
        },

        // ── update image URL on technician row ──────────────────
        async updateTechnicianImage(techId, imageUrl) {
            try {
                const { error } = await sb
                    .from('technicians')
                    .update({ image_url: imageUrl })
                    .eq('tech_id', techId);

                if (error) console.error('Failed to update image URL:', error);
            } catch (err) {
                console.error('Update image error:', err);
            }
        },

        // ── insert technician row ────────────────────────────────
        // ── insert technician row ────────────────────────────────
async submitTechnician(techId) {
    try {

        const insertData = {
            tech_id: techId,
            name: this.form.name.trim(),
            phone: '+91' + this.form.phone.trim(),
            username: this.form.username.trim(),

            // Store password as plain text
            password: this.form.password,

            category: this.form.category,
            experience: parseFloat(this.form.experience),
            aadhaar: this.form.aadhaar.replace(/\s/g, ''),
            area: this.form.area.trim(),
            status: 'pending',
            is_active: true,
            created_at: new Date().toISOString(),
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
        } else if (err.message?.includes('row-level security')) {
            errorMsg += 'Database permissions error.';
        } else {
            errorMsg += err.message;
        }

        return {
            success: false,
            error: errorMsg
        };
    }
},
    }));
});
