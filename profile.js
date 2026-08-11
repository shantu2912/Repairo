const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('alpine:init', () => {
  Alpine.data('profileApp', () => ({
    loading: true,
    saving: false,
    locating: false,
    showPassword: false,
    copied: false,
    applyingCode: false,
    activeTab: 'account', // 'account', 'address', 'referral'
    userId: null,
    createdAt: null,
    walletBalance: 0,
    referralCode: '',
    referredBy: '',
    inputReferralCode: '',
    
    form: {
      full_name: '',
      username: '',
      password_hash: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
      preferred_lang: 'English'
    },

    async init() {
      const storedPhone = localStorage.getItem('local_user_phone');
      const storedLogged = localStorage.getItem('local_user_logged');

      if (storedLogged !== 'true' || !storedPhone) {
        alert("Session expired. Please log in.");
        window.location.href = 'loginuser.html';
        return;
      }

      const cleanPhone = storedPhone.trim();

      try {
        let { data: profile, error } = await sb
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          this.userId = profile.id;
          this.createdAt = profile.created_at;
          this.walletBalance = profile.wallet_balance || 0;
          this.referredBy = profile.referred_by || '';

          this.form = {
            full_name: profile.full_name || '',
            username: profile.username || '',
            password_hash: profile.password_hash || '',
            phone: profile.phone || cleanPhone,
            address: profile.address || '',
            latitude: profile.latitude || '',
            longitude: profile.longitude || '',
            preferred_lang: profile.preferred_lang || 'English'
          };

          if (profile.referral_code) {
            this.referralCode = profile.referral_code;
          } else {
            this.referralCode = await this.generateAndStoreReferralCode(profile);
          }

        } else {
          this.form.phone = cleanPhone;
          this.form.full_name = 'Customer Account';
        }
      } catch (err) {
        console.error("Profile load error:", err.message);
      } finally {
        this.loading = false;
      }
    },

    async generateAndStoreReferralCode(profile) {
      let base = (profile.username || profile.full_name || 'FIX')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 6);

      if (!base || base.length < 3) base = 'FIX';
      
      const randomDigits = Math.floor(100 + Math.random() * 900);
      const generatedCode = `${base}${randomDigits}`;

      try {
        await sb
          .from('profiles')
          .update({ referral_code: generatedCode })
          .eq('id', profile.id);

        return generatedCode;
      } catch (err) {
        console.error("Failed to store referral code:", err.message);
        return generatedCode;
      }
    },

    getInitials(name) {
      if (!name) return 'FX';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    },

    formatDate(dateStr) {
      if (!dateStr) return '2026';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    },

    copyReferralCode() {
      navigator.clipboard.writeText(this.referralCode);
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2500);
    },

    shareWhatsApp() {
      const text = `Hey! Need home repairs? Use FixZenix with my referral code *${this.referralCode}* to get ₹100 OFF your 1st booking! Download here: https://shantu2912.github.io/Repairo/`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    async applyReferralCode() {
      if (!this.inputReferralCode.trim()) return;
      
      const codeToApply = this.inputReferralCode.trim().toUpperCase();

      if (codeToApply === this.referralCode) {
        alert("You cannot redeem your own referral code!");
        return;
      }

      this.applyingCode = true;

      try {
        const { data: owner, error } = await sb
          .from('profiles')
          .select('id, referral_code')
          .eq('referral_code', codeToApply)
          .maybeSingle();

        if (error || !owner) {
          alert("Invalid referral code. Please check and try again.");
          return;
        }

        const { error: updateError } = await sb
          .from('profiles')
          .update({ referred_by: codeToApply })
          .eq('id', this.userId);

        if (updateError) throw updateError;

        this.referredBy = codeToApply;
        this.inputReferralCode = '';
        alert("🎉 Referral code applied! Rewards will trigger on your 1st completed job.");
      } catch (err) {
        alert("Failed to apply code: " + err.message);
      } finally {
        this.applyingCode = false;
      }
    },

    detectGPS() {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      this.locating = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.form.latitude = position.coords.latitude.toFixed(6).toString();
          this.form.longitude = position.coords.longitude.toFixed(6).toString();
          this.locating = false;
        },
        (error) => {
          console.error("GPS error:", error);
          alert("Could not detect GPS coordinates. Please enable location permissions.");
          this.locating = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },

    async saveProfile() {
      this.saving = true;

      try {
        const cleanPhone = this.form.phone.trim();

        const payload = {
          full_name: this.form.full_name,
          phone: cleanPhone,
          password_hash: this.form.password_hash,
          address: this.form.address,
          latitude: this.form.latitude,
          longitude: this.form.longitude,
          preferred_lang: this.form.preferred_lang
        };

        if (this.userId) {
          const { error } = await sb
            .from('profiles')
            .update(payload)
            .eq('id', this.userId);

          if (error) throw error;
        }

        localStorage.setItem('local_user_phone', cleanPhone);
        alert("✅ Profile details updated successfully!");
        window.location.href = 'index.html';
      } catch (err) {
        console.error("Profile save error:", err.message);
        alert("Failed to update profile: " + err.message);
      } finally {
        this.saving = false;
      }
    },

    logout() {
      if (!confirm("Are you sure you want to log out?")) return;
      localStorage.removeItem('local_user_logged');
      localStorage.removeItem('local_user_phone');
      localStorage.removeItem('active_job_id');
      window.location.href = 'index.html';
    }
  }));
});
