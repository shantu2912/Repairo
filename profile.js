const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('alpine:init', () => {
  Alpine.data('profileApp', () => ({
    loading: true,
    saving: false,
    showPassword: false,
    userId: null,
    createdAt: null,
    form: {
      full_name: '',
      username: '',
      mobile: '',
      birthplace: '',
      secret: '',
      password: ''
    },

    async init() {
      const storedPhone = localStorage.getItem('local_user_phone');
      const storedLogged = localStorage.getItem('local_user_logged');

      if (storedLogged !== 'true' || !storedPhone) {
        alert("Session expired. Please log in.");
        window.location.href = 'loginuser.html';
        return;
      }

      try {
        const { data: user, error } = await sb
          .from('users')
          .select('*')
          .eq('mobile', storedPhone.trim())
          .maybeSingle();

        if (error) throw error;

        if (user) {
          this.userId = user.id;
          this.createdAt = user.created_at;
          this.form = {
            full_name: user.full_name || '',
            username: user.username || '',
            mobile: user.mobile || '',
            birthplace: user.birthplace || '',
            secret: user.secret || '',
            password: user.password || ''
          };
        } else {
          alert("User record not found in database.");
        }
      } catch (err) {
        console.error("Profile load error:", err.message);
        alert("Failed to load user profile: " + err.message);
      } finally {
        this.loading = false;
      }
    },

    getInitials(name) {
      if (!name) return 'U';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    },

    formatDate(dateStr) {
      if (!dateStr) return 'Recently';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    },

    async saveProfile() {
      if (!this.userId) return;
      this.saving = true;

      try {
        const { error } = await sb
          .from('users')
          .update({
            full_name: this.form.full_name,
            mobile: this.form.mobile,
            birthplace: this.form.birthplace,
            secret: this.form.secret,
            password: this.form.password
          })
          .eq('id', this.userId);

        if (error) throw error;

        // Sync local storage session phone
        localStorage.setItem('local_user_phone', this.form.mobile.trim());

        alert("✅ Profile updated successfully!");
        window.location.href = 'index.html';
      } catch (err) {
        console.error("Profile update error:", err.message);
        alert("Could not save changes: " + err.message);
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
