const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

tailwind.config = {
    theme: {
        extend: {
            colors: { 'brand-dark': '#1a1a1a', 'brand-gold': '#A07D54', 'brand-green': '#10B981' },
            fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
            animation: {
                'ripple': 'ripple 2s linear infinite',
                'slide-up-fade': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            },
            keyframes: {
                ripple: { '0%': { transform: 'scale(0.8)', opacity: '1' }, '100%': { transform: 'scale(2.5)', opacity: '0' } },
                slideUpFade: { '0%': { opacity: '0', transform: 'translateY(40px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
            }
        }
    }
}

document.addEventListener('alpine:init', () => {
Alpine.data('trackingApp', () => ({
    jobId: null,
    technicianFound: false,
    techData: null,
    secondsElapsed: 0,
    timerInterval: null,
    
    otpCode: null,
    jobStatus: 'pending',
    quoteAmount: 0,
    quoteDescription: '',
    quoteStatus: '',
    inspectionFee: 299,
    showQuoteCard: false,
    quoteLabour: 0,
    quoteMaterial: 0,
    quoteExtra: 0,
    
    // Bill modal variables
    showBill: false,
    fullJobData: null,
    billLineItems: [],
    billServiceName: '',
    billVariantName: '',
    isInspectionJob: false,
    billSubtotal: 0,
    billPlatformFee: 0,
    billGrandTotal: 0,
    billInspectionFee: 299,
    billQuoteAmount: 0,
    billAdvancePaid: 0,
    billBalancePaid: 0,
    billRefundDue: 0,
    billAmountInWords: '',
    isPrinting: false,
    billTechId: 'N/A', // ✅ Added for technician ID display

    showFeedback: false,
    feedbackStep: 1,
    feedbackRating: 0,
    feedbackComment: '',
    feedbackTags: [],
    feedbackLoading: false,
    feedbackDone: false,
    
    map: null,
    techMarker: null,
    etaMins: 12,

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.jobId = params.get('job_id');

        if (!this.jobId) {
            alert("Invalid tracking link.");
            window.location.href = 'index.html';
            return;
        }

        this.startTimer();
        await this.checkJobStatus();

        // Real-time listener for job updates
        const channel = sb.channel('waiting-room-' + this.jobId);
        channel
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'jobs', filter: `id=eq.${this.jobId}` }, 
                (payload) => {
                    console.log('Real-time updates payload:', payload);
                    
                    if (payload.new) {
                        if (payload.new.status) {
                            this.jobStatus = payload.new.status;
                            if (this.jobStatus !== 'pending' && this.jobStatus !== 'searching') {
                                this.technicianFound = true;
                            }
                        }
                        
                        // Handle quote data updates
                        if (payload.new.quote_status !== undefined) {
                            this.quoteStatus = payload.new.quote_status;
                            this.quoteAmount = payload.new.quoted_amount || 0;
                            this.quoteDescription = payload.new.quote_description || '';
                            this.quoteLabour = payload.new.quoted_labour || 0;
                            this.quoteMaterial = payload.new.quoted_material || 0;
                            this.quoteExtra = payload.new.quoted_extra || 0;
                            this.showQuoteCard = payload.new.quote_status === 'submitted';
                            
                            if (payload.new.quote_status === 'approved') {
                                this.showQuoteCard = false;
                                this.refreshJobData();
                            }
                            if (payload.new.quote_status === 'rejected') {
                                this.showQuoteCard = false;
                            }
                        }
                        
                        // Capture OTP
                        if (payload.new.otp) {
                            this.otpCode = payload.new.otp;
                        } else if (payload.new.otp === null) {
                            this.otpCode = null;
                        }
                        
                        if (payload.new.tech_id && !this.techData) {
                            this.fetchTechnician(payload.new.tech_id);
                        }
                    }
                }
            )
            .subscribe();
    },

    async refreshJobData() {
        const { data: job } = await sb
            .from('jobs')
            .select('*')
            .eq('id', this.jobId)
            .single();
        if (job) {
            this.fullJobData = job;
            this.updateBillAmounts(job);
        }
    },

    updateBillAmounts(job) {
        this.fullJobData = job;
    },

    // Converts a number to Indian-style words for the invoice
    numberToWords(num) {
        num = Math.round(Math.max(0, num || 0));
        if (num === 0) return 'Zero';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                       'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const twoDigits = n => n < 20 ? ones[n] : (tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : ''));
        const threeDigits = n => n < 100 ? twoDigits(n) : (ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : ''));

        let result = '';
        const crore = Math.floor(num / 10000000); num %= 10000000;
        const lakh = Math.floor(num / 100000); num %= 100000;
        const thousand = Math.floor(num / 1000); num %= 1000;
        const hundred = num;

        if (crore) result += threeDigits(crore) + ' Crore ';
        if (lakh) result += threeDigits(lakh) + ' Lakh ';
        if (thousand) result += threeDigits(thousand) + ' Thousand ';
        if (hundred) result += threeDigits(hundred);

        return result.trim();
    },

    async openBillModal() {
        try {
            const { data: job, error: jobError } = await sb
                .from('jobs')
                .select('*')
                .eq('id', this.jobId)
                .single();

            if (jobError) throw jobError;

            this.fullJobData = job;

            // ✅ Fetch technician with tech_id if available
            let techIdDisplay = 'N/A';
            if (job.tech_id) {
                const { data: tech, error: techError } = await sb
                    .from('technicians')
                    .select('tech_id, name')
                    .eq('id', job.tech_id)
                    .single();
                
                if (!techError && tech) {
                    techIdDisplay = tech.tech_id || tech.id.slice(0,8).toUpperCase();
                    // Store tech name if not already set
                    if (!this.techData) {
                        this.techData = tech;
                    }
                } else {
                    // Fallback: use database ID if tech_id not found
                    techIdDisplay = job.tech_id.slice(0,8).toUpperCase();
                }
            }

            this.billServiceName = job.service_name || job.category || 'Expert Service';
            this.billVariantName = job.variant_name || job.device || 'Service';

            const OTHER_LABEL = 'Other Issue';
            const inspFee = Number(job.inspection_fee_amount || 299);
            const totalPrice = parseFloat(job.original_price || job.discounted_price || 0);

            const servicesSelected = job.services_selected || job.device || '';
            const serviceNames = servicesSelected
                ? servicesSelected.split(',').map(s => s.trim()).filter(Boolean)
                : ['Service'];

            const fixedServiceNames = serviceNames.filter(n => n !== OTHER_LABEL);
            const hasOtherService = !!job.is_inspection_job || serviceNames.some(n => n === OTHER_LABEL);

            const fixedTotal = hasOtherService ? Math.max(0, totalPrice - inspFee) : totalPrice;

            let priceMap = null;
            if (job.service_price_breakdown) {
                try {
                    const parsed = typeof job.service_price_breakdown === 'string'
                        ? JSON.parse(job.service_price_breakdown)
                        : job.service_price_breakdown;
                    if (parsed && typeof parsed === 'object') priceMap = parsed;
                } catch (e) { priceMap = null; }
            }

            const lineItems = [];

            if (fixedServiceNames.length > 0) {
                if (priceMap) {
                    fixedServiceNames.forEach(name => {
                        const price = Number(priceMap[name] ?? 0);
                        if (price > 0) {
                            lineItems.push({
                                type: 'simple',
                                name: name,
                                desc: job.category ? `${job.category} • Service Charge` : 'Service Charge',
                                price: price
                            });
                        }
                    });
                } else {
                    const per = fixedServiceNames.length > 0 ? (fixedTotal / fixedServiceNames.length) : 0;
                    fixedServiceNames.forEach(name => {
                        lineItems.push({
                            type: 'simple',
                            name: name,
                            desc: job.category ? `${job.category} • Service Charge` : 'Service Charge',
                            price: per
                        });
                    });
                }
            }

            let quotedTotal = 0;
            if (hasOtherService) {
                const labour = Number(job.quoted_labour || 0);
                const material = Number(job.quoted_material || 0);
                const extra = Number(job.quoted_extra || 0);
                quotedTotal = Number(job.quoted_amount || (labour + material + extra) || 0);

                const issueDesc = job.other_issue
                    ? job.other_issue
                    : 'Issue diagnosed and resolved on-site by the technician.';

                lineItems.push({
                    type: 'quote',
                    name: 'Other Service (On-Site Diagnosis & Repair)',
                    desc: issueDesc,
                    workDesc: job.quote_description || '',
                    labour: labour,
                    material: material,
                    extra: extra,
                    price: quotedTotal
                });
            }

            this.billLineItems = lineItems;
            this.isInspectionJob = hasOtherService;
            this.billInspectionFee = inspFee;
            this.billQuoteAmount = quotedTotal;
            this.billSubtotal = lineItems.reduce((s, i) => s + (i.price || 0), 0);

            if (hasOtherService) {
                this.billPlatformFee = 0;
                this.billGrandTotal = this.billSubtotal;
                this.billAdvancePaid = fixedTotal + inspFee;

                if (quotedTotal >= inspFee) {
                    this.billBalancePaid = quotedTotal - inspFee;
                    this.billRefundDue = 0;
                } else {
                    this.billBalancePaid = 0;
                    this.billRefundDue = inspFee - quotedTotal;
                }
            } else {
                this.billPlatformFee = 49;
                this.billGrandTotal = this.billSubtotal + this.billPlatformFee;
                this.billAdvancePaid = this.billGrandTotal;
                this.billBalancePaid = 0;
                this.billRefundDue = 0;
            }

            this.billAmountInWords = this.numberToWords(this.billGrandTotal);

            // ✅ Store the tech ID for display in the bill
            this.billTechId = techIdDisplay;

            this.$nextTick(() => {
                this.showBill = true;
            });

        } catch (err) {
            console.error('Error opening bill:', err);
            alert('Could not load bill details. Please try again.');
        }
    },

    downloadPDF() {
        this.isPrinting = true;
        const element = document.getElementById('invoice-content');
        
        const opt = {
            margin: 0.5,
            filename: `FixZen_Invoice_${this.jobId.slice(0,6).toUpperCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save()
            .then(() => { this.isPrinting = false; })
            .catch((err) => { 
                console.error(err);
                this.isPrinting = false;
                alert('Error generating PDF. Please try again.');
            });
    },

    startTimer() {
        this.timerInterval = setInterval(() => { this.secondsElapsed++; }, 1000);
    },

    get formattedTime() {
        const m = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    get searchMessage() {
        if (this.secondsElapsed < 15) return "Alerting nearby experts...";
        if (this.secondsElapsed < 45) return "Connecting with top-rated pros...";
        return "High demand. Still searching...";
    },

    async checkJobStatus() {
        const { data: job, error } = await sb
            .from('jobs')
            .select('*')
            .eq('id', this.jobId)
            .single();
            
        if (error) {
            console.error('Error fetching job:', error);
            return;
        }
        
        if (job) {
            this.fullJobData = job;
            if (job.status) this.jobStatus = job.status;
            
            if (job.quote_status) {
                this.quoteStatus = job.quote_status;
                this.quoteAmount = job.quoted_amount || 0;
                this.quoteDescription = job.quote_description || '';
                this.quoteLabour = job.quoted_labour || 0;
                this.quoteMaterial = job.quoted_material || 0;
                this.quoteExtra = job.quoted_extra || 0;
                this.inspectionFee = job.inspection_fee_amount || 299;
                this.showQuoteCard = job.quote_status === 'submitted';
            }
            
            if (job.tech_id) this.fetchTechnician(job.tech_id);
            if (job.otp) this.otpCode = job.otp;
            
            this.updateBillAmounts(job);
            
            if (this.jobStatus !== 'pending' && this.jobStatus !== 'searching') {
                this.technicianFound = true;
                if (this.timerInterval) clearInterval(this.timerInterval);
            }
        }
    },

    async fetchTechnician(techId) {
        const { data: tech, error } = await sb
            .from('technicians')
            .select('*')
            .eq('id', techId)
            .single();
            
        if (error) {
            console.error('Error fetching technician:', error);
            return;
        }
        
        if (tech) {
            this.techData = tech;
            this.technicianFound = true;
            clearInterval(this.timerInterval);
            
            if(this.jobStatus !== 'completed' && !this.otpCode) {
                this.$nextTick(() => {
                    this.initMap();
                });
            }
        }
    },

    initMap() {
        if (this.map) return; 

        const customerLat = 21.1458;
        const customerLng = 79.0882;
        let techLat = 21.1200; 
        let techLng = 79.0600;

        this.map = L.map('trackingMap', { zoomControl: false }).setView([customerLat, customerLng], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(this.map);

        const customerIcon = L.divIcon({
            html: `<div class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i class="fa-solid fa-house text-xs"></i></div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 32]
        });

        const techIcon = L.divIcon({
            html: `<div class="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white relative"><div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-50"></div><i class="fa-solid fa-truck-fast text-sm relative z-10"></i></div>`,
            className: '', iconSize: [40, 40], iconAnchor: [20, 40]
        });

        L.marker([customerLat, customerLng], {icon: customerIcon}).addTo(this.map);
        this.techMarker = L.marker([techLat, techLng], {icon: techIcon}).addTo(this.map);

        const bounds = L.latLngBounds([[customerLat, customerLng], [techLat, techLng]]);
        this.map.fitBounds(bounds, { padding: [30, 30] });

        const interval = setInterval(() => {
            if (this.jobStatus !== 'arrived' && this.jobStatus !== 'started' && this.jobStatus !== 'in_progress') {
                techLat += (customerLat - techLat) * 0.08;
                techLng += (customerLng - techLng) * 0.08;
                if (this.techMarker) {
                    this.techMarker.setLatLng([techLat, techLng]);
                }
                
                if(Math.random() > 0.7 && this.etaMins > 1) {
                    this.etaMins--;
                }
            } else {
                clearInterval(interval);
            }
        }, 2000);
    },

    async cancelJob() {
        if(!confirm("Cancel your search?")) return;
        await sb.from('jobs').update({ status: 'cancelled' }).eq('id', this.jobId);
        window.location.href = 'index.html';
    },

    async acceptQuote() {
        if (!confirm("Approve this quote? The technician will begin work immediately.")) return;
        
        const finalAmount = Math.max(0, this.quoteAmount - this.inspectionFee);
        
        try {
            const { error } = await sb
                .from('jobs')
                .update({
                    quote_status: 'approved',
                    customer_approved: true,
                    customer_price: finalAmount,
                    status: 'in_progress'
                })
                .eq('id', this.jobId);
            
            if (error) throw error;
            
            this.showQuoteCard = false;
            this.quoteStatus = 'approved';
            
            await this.refreshJobData();
            
            alert(`✅ Quote Approved!\n\n` +
                  `Total Quote: ₹${this.quoteAmount}\n` +
                  `Inspection Fee Paid: ₹${this.inspectionFee}\n` +
                  `Amount Due After Job: ₹${finalAmount}\n\n` +
                  `The technician will now start the repair work.`);
            
        } catch (err) {
            console.error('Error approving quote:', err);
            alert("Error approving quote: " + err.message);
        }
    },

    async rejectQuote() {
        const reason = prompt("Please share why you're rejecting this quote (optional):");
        
        try {
            const { error } = await sb
                .from('jobs')
                .update({
                    quote_status: 'rejected',
                    customer_approved: false,
                    status: 'cancelled'
                })
                .eq('id', this.jobId);
            
            if (error) throw error;
            
            alert("Quote rejected. Your booking has been closed. The inspection fee paid (₹" + this.inspectionFee + ") is non-refundable as the technician visited your location.");
            window.location.href = 'index.html';
            
        } catch (err) {
            console.error('Error rejecting quote:', err);
            alert("Error rejecting quote: " + err.message);
        }
    },

    setFeedbackRating(i) {
        this.feedbackRating = i;
        if (navigator.vibrate) navigator.vibrate(30);
    },
    
    getFeedbackEmoji(i) {
        return ['😞','😕','😊','😄','🤩'][i-1] || '';
    },
    
    getFeedbackLabel(i) {
        return ['Poor','Fair','Good','Excellent','Incredible!'][i-1] || '';
    },
    
    getFeedbackTags() {
        if (this.feedbackRating >= 4) return [
            {icon:'⚡',label:'Fast Arrival'},{icon:'👔',label:'Professional'},
            {icon:'✨',label:'Clean Work'},{icon:'😊',label:'Polite'},
            {icon:'🔧',label:'Genuine Parts'},{icon:'💯',label:'Worth Every Rupee'}
        ];
        if (this.feedbackRating === 3) return [
            {icon:'⏱️',label:'On Time'},{icon:'👍',label:'Decent Work'},{icon:'📞',label:'Good Communication'}
        ];
        return [
            {icon:'⏰',label:'Late Arrival'},{icon:'🔁',label:'Needs Redo'},
            {icon:'📵',label:'Poor Communication'},{icon:'💸',label:'Overcharged'}
        ];
    },
    
    toggleFeedbackTag(tag) {
        if (this.feedbackTags.includes(tag)) {
            this.feedbackTags = this.feedbackTags.filter(t => t !== tag);
        } else {
            this.feedbackTags.push(tag);
            if (navigator.vibrate) navigator.vibrate(20);
        }
    },
    
    launchConfetti() {
        const colors = ['#A07D54','#1a1a1a','#c9a050','#f4f4f5','#fff'];
        for (let i = 0; i < 55; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.cssText = `left:${Math.random()*100}vw;top:-20px;width:${Math.random()*8+5}px;height:${Math.random()*8+5}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation-duration:${Math.random()*2+1.5}s;animation-delay:${Math.random()*0.8}s;`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 4000);
        }
    },

    async submitFeedback() {
        if (!this.feedbackRating) return;
        
        const storedPhone = localStorage.getItem('local_user_phone');
        if (!storedPhone) {
            alert("Session identity missing. Please login again.");
            window.location.href = 'loginuser.html';
            return;
        }

        this.feedbackLoading = true;
        
        try {
            const { data: profile, error: profileError } = await sb
                .from('profiles')
                .select('id')
                .eq('phone', storedPhone.trim())
                .maybeSingle();

            if (profileError || !profile) {
                throw new Error(profileError?.message || "Profile identity reference missing.");
            }

            const combinedComment = this.feedbackTags.length > 0
                ? `[${this.feedbackTags.join(', ')}] ${this.feedbackComment}`
                : this.feedbackComment;

            const { error: feedbackError } = await sb.from('feedback').insert([{
                job_id: this.jobId,
                rating: this.feedbackRating,
                comment: combinedComment,
                technician_id: this.techData?.id || null,
                user_id: profile.id
            }]);

            if (feedbackError) throw feedbackError;

            await sb.from('jobs').update({ feedback_provided: true }).eq('id', this.jobId);
            
            this.feedbackStep = 'done';
            this.launchConfetti();
            
            if (navigator.vibrate) navigator.vibrate([100,60,100,60,200]);
            
            setTimeout(() => {
                this.showFeedback = false;
                this.feedbackDone = true;
            }, 2800);

        } catch (err) {
            console.error(err);
            alert("Review Submission Error: " + err.message);
        } finally {
            this.feedbackLoading = false;
        }
    }
}));
});
