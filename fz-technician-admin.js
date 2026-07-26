const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// ── canvas helpers ──────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function roundRectTop(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
}
function drawPlaceholderIcon(ctx, x, y, size) {
    ctx.fillStyle = '#B0A89E';
    ctx.font = `${Math.round(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('👤', x + size / 2, y + size * 0.65);
    ctx.textAlign = 'left';
}
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ── QR generation (self-hosted qrcode-generator lib, synchronous, no network) ──
function makeQrDataUrl(text, cellSize = 4, margin = 8) {
    const qr = qrcode(0, 'M'); // typeNumber 0 = auto-size, 'M' = medium error correction
    qr.addData(text);
    qr.make();
    return qr.createDataURL(cellSize, margin);
}

document.addEventListener('alpine:init', () => {
    Alpine.data('adminPanel', () => ({
        // ── auth (client-side gate only — swap for real auth in production) ──
        authed: false,
        pwInput: '',
        pwError: '',
        ADMIN_PASSWORD: 'fixzen@admin',

        loading: true,
        technicians: [],
        search: '',
        statusFilter: 'all',

        selectedTech: null,
        cardDataUrl: null,
        generatingCard: false,

        init() {
            if (sessionStorage.getItem('fz_admin_authed') === '1') {
                this.authed = true;
                this.loadTechnicians();
            }
        },

        checkPassword() {
            if (this.pwInput === this.ADMIN_PASSWORD) {
                this.authed = true;
                this.pwError = '';
                sessionStorage.setItem('fz_admin_authed', '1');
                this.loadTechnicians();
            } else {
                this.pwError = 'Incorrect password';
            }
        },

        logout() {
            sessionStorage.removeItem('fz_admin_authed');
            this.authed = false;
            this.pwInput = '';
        },

        async loadTechnicians() {
            this.loading = true;
            try {
                const { data, error } = await sb
                    .from('technicians')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                this.technicians = data || [];
            } catch (err) {
                console.error('Failed to load technicians:', err);
                alert('Failed to load technicians: ' + err.message);
            } finally {
                this.loading = false;
            }
        },

        get filteredTechs() {
            const q = this.search.trim().toLowerCase();
            return this.technicians.filter(t => {
                const matchesSearch = !q ||
                    (t.name && t.name.toLowerCase().includes(q)) ||
                    (t.tech_id && t.tech_id.toLowerCase().includes(q)) ||
                    (t.phone && t.phone.includes(q)) ||
                    (t.category && t.category.toLowerCase().includes(q)) ||
                    (t.area && t.area.toLowerCase().includes(q));
                const matchesStatus = this.statusFilter === 'all' || t.status === this.statusFilter;
                return matchesSearch && matchesStatus;
            });
        },

        // Public verification URL that the QR code points to
        verifyUrl(techId) {
            const base = window.location.href.replace(/fz-technician-admin\.html.*$/, '');
            return `${base}fz-technician-verify.html?id=${encodeURIComponent(techId)}`;
        },

        // Called directly from the template: :src="qrDataUrl(t.tech_id)"
        qrDataUrl(techId) {
            try {
                return makeQrDataUrl(this.verifyUrl(techId));
            } catch (err) {
                console.error('QR generation failed:', err);
                return '';
            }
        },

        async updateStatus(tech, newStatus) {
            if (newStatus === tech.status) return; // ignore no-op / spurious change events
            const prev = tech.status;
            tech.status = newStatus;
            try {
                const { error } = await sb.from('technicians').update({ status: newStatus }).eq('tech_id', tech.tech_id);
                if (error) throw error;
            } catch (err) {
                tech.status = prev;
                alert('Failed to update status: ' + err.message);
            }
        },

        // ── ID card generation ──────────────────────────────────
        openCard(tech) {
            this.selectedTech = tech;
            this.cardDataUrl = null;
            this.generatingCard = true;
            this.$nextTick(() => this.buildIdCard(tech));
        },

        closeCard() {
            this.selectedTech = null;
            this.cardDataUrl = null;
        },

        async buildIdCard(tech) {
            const W = 1013, H = 638; // CR80 card ratio @ ~300dpi, landscape
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            roundRect(ctx, 0, 0, W, H, 28); ctx.fill();

            const grad = ctx.createLinearGradient(0, 0, W, 0);
            grad.addColorStop(0, '#B58B5B'); grad.addColorStop(1, '#9a764d');
            ctx.fillStyle = grad;
            roundRectTop(ctx, 0, 0, W, 150, 28); ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 42px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText('FixZen', 40, 70);
            ctx.font = '600 20px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText('VERIFIED SERVICE PARTNER', 40, 105);

            // photo
            const photoX = 40, photoY = 180, photoSize = 220;
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.fillStyle = '#E8E2D8';
            ctx.fillRect(photoX, photoY, photoSize, photoSize);
            if (tech.image_url) {
                try {
                    const img = await loadImage(tech.image_url);
                    ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
                } catch (e) {
                    drawPlaceholderIcon(ctx, photoX, photoY, photoSize);
                }
            } else {
                drawPlaceholderIcon(ctx, photoX, photoY, photoSize);
            }
            ctx.restore();
            ctx.strokeStyle = '#B58B5B'; ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.stroke();

            // details
            const tx = 300, ty = 210;
            ctx.fillStyle = '#1A1A1A';
            ctx.font = '700 34px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText(tech.name || '-', tx, ty);

            ctx.font = '600 20px monospace';
            ctx.fillStyle = '#B58B5B';
            ctx.fillText('ID: ' + tech.tech_id, tx, ty + 40);

            ctx.font = '400 20px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillStyle = '#4A4A4A';
            ctx.fillText('Specialization: ' + (tech.category || '-'), tx, ty + 80);
            ctx.fillText('Area: ' + (tech.area || '-'), tx, ty + 112);
            ctx.fillText('Experience: ' + (tech.experience != null ? tech.experience + ' yrs' : '-'), tx, ty + 144);
            ctx.fillText('Phone: ' + (tech.phone || '-'), tx, ty + 176);

            const badgeColor = tech.status === 'active' ? '#10B981' : (tech.status === 'rejected' ? '#DC2626' : '#F59E0B');
            ctx.fillStyle = badgeColor;
            roundRect(ctx, tx, ty + 200, 160, 36, 18); ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 16px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText((tech.status || 'pending').toUpperCase(), tx + 20, ty + 224);

            // QR code
            try {
                const qrDataUrl = makeQrDataUrl(this.verifyUrl(tech.tech_id), 6, 8);
                const qrImg = await loadImage(qrDataUrl);
                ctx.drawImage(qrImg, W - 220, H - 220, 180, 180);
                ctx.fillStyle = '#8B8580';
                ctx.font = '400 14px -apple-system, Segoe UI, Roboto, sans-serif';
                ctx.fillText('Scan to verify', W - 218, H - 30);
            } catch (e) {
                console.error('QR generation failed', e);
            }

            ctx.fillStyle = '#B0A89E';
            ctx.font = '400 14px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText('This card certifies the holder as a registered FixZen technician.', 40, H - 30);

            this.cardDataUrl = canvas.toDataURL('image/png');
            this.generatingCard = false;
        },

        downloadCard() {
            if (!this.cardDataUrl || !this.selectedTech) return;
            const a = document.createElement('a');
            a.href = this.cardDataUrl;
            a.download = `${this.selectedTech.tech_id}_id_card.png`;
            a.click();
        },

        printCard() {
            if (!this.cardDataUrl) return;
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>Print ID Card</title></head>
                <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#eee;">
                <img src="${this.cardDataUrl}" style="max-width:95%;box-shadow:0 4px 20px rgba(0,0,0,0.2);" onload="window.print();">
                </body></html>`);
            w.document.close();
        }
    }));
});
