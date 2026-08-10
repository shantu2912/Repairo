const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('alpine:init', () => {
  Alpine.data('profileApp', () => ({
    loading: true,
    saving: false,
    locating: false,
    showPassword: false,
    activeTab: 'personal',
    userId: null,
    createdAt: null,
    
    // Mapped 1:1 to your 'profiles' database columns
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
        alert("Session identity missing. Redirecting to login...");
        window.location.href = 'loginuser.html';
        return;
      }

      const cleanPhone = storedPhone.trim();

      try {
        // Fetch strictly from 'profiles' table
        let { data: profile, error } = await sb
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          this.userId = profile.id;
          this.createdAt = profile.created_at;
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
        } else {
          // Initialize empty profile fallback if first time
          this.form.phone = cleanPhone;
          this.form.full_name = 'FixZenix Member';
        }
      } catch (err) {
        console.error("Profile load error:", err.message);
      } finally {
        this.loading = false;
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
          alert("Could not detect GPS location. Please ensure location permissions are enabled.");
          this.locating = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },

    async saveProfile() {
      this.saving = true;

      try {
        const cleanPhone = this.form.phone.trim();

        // Exact schema payload for 'profiles'
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
        } else {
          payload.username = this.form.username || 'user_' + Math.floor(1000 + Math.random() * 9000);
          const { error } = await sb
            .from('profiles')
            .insert([payload]);

          if (error) throw error;
        }

        // Sync local storage session phone
        localStorage.setItem('local_user_phone', cleanPhone);

        alert("✨ VIP Profile updated successfully!");
        window.location.href = 'index.html';
      } catch (err) {
        console.error("Profile save error:", err.message);
        alert("Failed to update profile: " + err.message);
      } finally {
        this.saving = false;
      }
    },

    logout() {
      if (!confirm("Are you sure you want to log out of FixZenix?")) return;
      localStorage.removeItem('local_user_logged');
      localStorage.removeItem('local_user_phone');
      localStorage.removeItem('active_job_id');
      window.location.href = 'index.html';
    }
  }));
});
