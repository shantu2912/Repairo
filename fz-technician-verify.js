const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const sb = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('alpine:init', () => {
    Alpine.data('verifyPage', () => ({
        loading: true,
        notFound: false,
        tech: null,

        async init() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (!id) { this.loading = false; this.notFound = true; return; }

            try {
                const { data, error } = await sb
                    .from('technicians')
                    .select('tech_id, name, phone, category, experience, area, status, image_url, created_at')
                    .eq('tech_id', id)
                    .single();

                if (error || !data) { this.notFound = true; }
                else { this.tech = data; }
            } catch (err) {
                console.error(err);
                this.notFound = true;
            } finally {
                this.loading = false;
            }
        },

        maskedPhone() {
            if (!this.tech?.phone) return '-';
            const p = this.tech.phone;
            return p.slice(0, -4).replace(/\d/g, '•') + p.slice(-4);
        }
    }));
});
