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
    paymentStatus: 'UNPAID',
    payableAmount: 0,
    finalPayableAmount: 0,


    quoteAmount: 0,
    quoteDescription: '',
    quoteStatus: '',
    inspectionFee: 149,          // ✅ changed from 299 → 149
    showQuoteCard: false,
    quoteLabour: 0,
    quoteMaterial: 0,
    quoteExtra: 0,

    // Additional issue reported separately by the technician (job_detail "Save Issue")
    additionalIssueText: '',
    additionalIssuePrice: 0,

    // Bill modal variables
    showBill: false,
    fullJobData: null,
    billLineItems: [],
    billServiceName: '',
    billVariantName: '',
    isInspectionJob: false,
    billSubtotal: 0,
    billDiscountAmount: 0,
    billPlatformFee: 0,
    billGrandTotal: 0,
    billInspectionFee: 149,       // ✅ changed from 299 → 149
    billQuoteAmount: 0,
    billAdvancePaid: 0,
    billBalancePaid: 0,
    billRefundDue: 0,
    billAmountInWords: '',
    isPrinting: false,
    billTechId: 'N/A',

    showFeedback: false,
    feedbackStep: 1,
    feedbackRating: 0,
    feedbackComment: '',
    feedbackTags: [],
    feedbackLoading: false,
    feedbackDone: false,

    loyaltyReward: null,
    loyaltyChecked: false,

    map: null,
    techMarker: null,
    routeLine: null,
    customerLat: null,
    customerLng: null,
    etaMins: 12,
    techLocationLive: false,
    techLocationUpdatedAt: null,
    techLocationStale: false,
    usingRealRoute: false,
    routeUpdatedAt: null,

    

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
                async (payload) => {
                    console.log('Real-time updates payload:', payload);

                    if (payload.new) {
                        if (payload.new.status) {
                            this.jobStatus = payload.new.status;
                            if (this.jobStatus !== 'pending' && this.jobStatus !== 'searching') {
                                this.technicianFound = true;
                            }
                            if (this.jobStatus === 'completed') {
                                const uid = payload.new.user_id || this.fullJobData?.user_id;
                                if (uid) this.checkLoyaltyReward(uid);
                            }
                        }

                        if (payload.new.payment_status) {
                            this.paymentStatus = String(payload.new.payment_status).toUpperCase();
                        }

                        if (payload.new.payable_amount != null) {
                            this.payableAmount = Number(payload.new.payable_amount);
                        }

                        await this.refreshJobData();

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
                                const quote = Number(payload.new.quoted_amount || 0);
                                this.payableAmount = Number(
                                    payload.new.customer_price ??
                                    payload.new.payable_amount ??
                                    quote
                                );
                                this.refreshJobData();
                            }
                            if (payload.new.quote_status === 'rejected') {
                                this.showQuoteCard = false;
                            }
                        }

                        // Tech writes status="in_progress" + otp when they broadcast the code.
                        // Show OTP as soon as the otp field exists (or when job is completed).
                        const otpReady = ['in_progress', 'completed'].includes(
                            String(payload.new.status || '').toLowerCase()
                        );
                        const incomingOtp = payload.new.completion_otp || payload.new.otp || null;
                        this.otpCode = otpReady ? incomingOtp : null;

                        if (payload.new.tech_id && !this.techData) {
                            this.fetchTechnician(payload.new.tech_id);
                        }

                        // Live GPS ping from the technician's device
                        if (payload.new.tech_lat != null && payload.new.tech_lng != null) {
                            this.updateTechMarker(
                                Number(payload.new.tech_lat),
                                Number(payload.new.tech_lng),
                                payload.new.tech_location_updated_at
                            );
                        }

                        // Real road route computed by the technician's device (OpenRouteService)
                        if (payload.new.route_geometry) {
                            this.updateRoute(
                                payload.new.route_geometry,
                                Number(payload.new.route_distance_km),
                                Number(payload.new.route_duration_min),
                                payload.new.route_updated_at
                            );
                        }
                    }
                }
            )
            .subscribe();

        // Flags the marker as stale if no GPS ping has arrived recently
        // (e.g. technician lost signal or closed the app). Also falls back
        // to straight-line ETA if the real route goes stale (ORS down/quota'd).
        setInterval(() => {
            if (this.techLocationUpdatedAt) {
                const ageMs = Date.now() - new Date(this.techLocationUpdatedAt).getTime();
                this.techLocationStale = ageMs > 45000;
            }
            if (this.routeUpdatedAt) {
                const routeAgeMs = Date.now() - new Date(this.routeUpdatedAt).getTime();
                if (routeAgeMs > 60000) this.usingRealRoute = false;
            }
        }, 5000);
    },

   

   get showFinalPayment() {
    const activeStatuses = ['arrived', 'started', 'in_progress', 'awaiting_payment'];
    return activeStatuses.includes(this.jobStatus) &&
           Number(this.finalPayableAmount || 0) > 0;
},

calculateFinalBillAmount(job) {
    if (!job) return 0;

    // ── Base service price (what the customer originally booked) ──
    const grossPrice = parseFloat(job.original_price ?? job.discounted_price ?? 0);
    const basePrice  = parseFloat(job.discounted_price ?? job.original_price ?? 0);
    const discountAmount = Math.max(0, grossPrice - basePrice);

    // ── Is this a pure inspection / "Other Issue" booking? ──
    const OTHER_LABEL = 'Other Issue';
    const servicesSelected = job.services_selected || job.device || '';
    const serviceNames = servicesSelected
        ? String(servicesSelected).split(',').map(s => s.trim()).filter(Boolean)
        : ['Service'];
    const isInspectionJob = !!job.is_inspection_job ||
        serviceNames.some(n => n === OTHER_LABEL);

    // ── Technician's quote for additional work ──
    const labour   = Number(job.quoted_labour   || 0);
    const material = Number(job.quoted_material || 0);
    const extra    = Number(job.quoted_extra    || 0);
    const quotedTotal = Number(
        job.quoted_amount || (labour + material + extra) || 0
    );

    // ── Additional issue saved separately by the technician ──
    const additionalIssueAmount = Number(job.additional_issue_price || 0);

    // ── Platform fee only on normal fixed-price bookings ──
    const platformFee = isInspectionJob ? 0 : 19;

    // ── Sum everything ──
    // NOTE: We deliberately do NOT use job.customer_price / job.payable_amount
    // here. acceptQuote() writes the quote amount into customer_price, so using
    // it as an override would wipe out the base service price.
    let grandTotal = basePrice + quotedTotal + additionalIssueAmount;
    grandTotal = Math.max(0, grandTotal - discountAmount) + platformFee;

    return Number(grandTotal.toFixed(2));
},

    async refreshJobData() {
        const { data: job } = await sb
            .from('jobs')
            .select('*')
            .eq('id', this.jobId)
            .single();
        if (job) {
            this.fullJobData = job;
            this.paymentStatus = String(
                job.payment_status || this.paymentStatus || 'UNPAID'
            ).toUpperCase();

            this.finalPayableAmount = this.calculateFinalBillAmount(job);
            this.payableAmount = this.finalPayableAmount;

            const otpReady = ['in_progress', 'completed'].includes(
    String(job.status || '').toLowerCase()
);
this.otpCode = otpReady
    ? (job.otp || job.completion_otp || null)
    : null;

            this.updateBillAmounts(job);
        }
    },

    updateBillAmounts(job) {
        this.fullJobData = job;
        this.finalPayableAmount = this.calculateFinalBillAmount(job);
        this.payableAmount = this.finalPayableAmount;

        this.additionalIssueText = job.additional_issue || '';
        this.additionalIssuePrice = Number(job.additional_issue_price || 0);
    },

    // Every 5th completed job earns the customer a one-time reward code.
    // Tied to milestone_job_id so reopening the page never creates duplicates.
    async checkLoyaltyReward(userId) {
        if (this.loyaltyChecked || !userId) return;
        this.loyaltyChecked = true;

        try {
            const { data: existing } = await sb
                .from('promos')
                .select('*')
                .eq('milestone_job_id', this.jobId)
                .maybeSingle();

            if (existing) {
                this.loyaltyReward = existing;
                return;
            }

            const { count, error: countError } = await sb
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('status', 'completed');

            if (countError) throw countError;
            if (!count || count % 5 !== 0) return;

            const code = 'LOYAL' + Math.floor(1000 + Math.random() * 9000);
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 60);

            const { data: created, error: insertError } = await sb
                .from('promos')
                .insert([{
                    code: code,
                    type: 'percent',
                    value: 15,
                    expiry: expiry.toISOString().split('T')[0],
                    usage_count: 0,
                    created_at: new Date().toISOString(),
                    user_id: userId,
                    milestone_job_id: this.jobId
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Loyalty reward creation failed:', insertError.message);
                return;
            }

            this.loyaltyReward = created;
        } catch (err) {
            console.error('Loyalty reward check failed:', err);
        }
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

            // Fetch technician with tech_id if available
            let techIdDisplay = 'N/A';
            if (job.tech_id) {
                const { data: tech, error: techError } = await sb
                    .from('technicians')
                    .select('tech_id, name')
                    .eq('id', job.tech_id)
                    .single();

                if (!techError && tech) {
                    techIdDisplay = tech.tech_id || tech.id.slice(0,8).toUpperCase();
                    if (!this.techData) {
                        this.techData = tech;
                    }
                } else {
                    techIdDisplay = job.tech_id.slice(0,8).toUpperCase();
                }
            }

            this.billServiceName = job.service_name || job.category || 'Expert Service';
            this.billVariantName = job.variant_name || job.device || 'Service';

            const OTHER_LABEL = 'Other Issue';
            const inspFee = Number(job.inspection_fee_amount || 149);  // ✅ 149
            const grossPrice = parseFloat(job.original_price ?? job.discounted_price ?? 0);
            const totalPrice = parseFloat(job.discounted_price ?? job.original_price ?? 0);
            const discountAmount = Math.max(0, grossPrice - totalPrice);

            const servicesSelected = job.services_selected || job.device || '';
            const serviceNames = servicesSelected
                ? servicesSelected.split(',').map(s => s.trim()).filter(Boolean)
                : ['Service'];

            const fixedServiceNames = serviceNames.filter(n => n !== OTHER_LABEL);
            const hasOtherService = !!job.is_inspection_job || serviceNames.some(n => n === OTHER_LABEL);

            const fixedTotal = hasOtherService ? 0 : totalPrice;

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
            {
                const labour   = Number(job.quoted_labour   || 0);
                const material = Number(job.quoted_material || 0);
                const extra    = Number(job.quoted_extra    || 0);
                quotedTotal = Number(job.quoted_amount || (labour + material + extra) || 0);
            
                // Add the quote line whenever the technician actually quoted extra work,
                // regardless of whether the original booking was a fixed-price service.
                if (quotedTotal > 0) {
                    const issueDesc = job.other_issue
                        ? job.other_issue
                        : 'Issue diagnosed and resolved on-site by the technician.';
            
                    lineItems.push({
                        type: 'quote',
                        name: 'Additional Work (On-Site Quote)',
                        desc: issueDesc,
                        workDesc: job.quote_description || '',
                        labour: labour,
                        material: material,
                        extra: extra,
                        price: quotedTotal
                    });
                }
            }
            const additionalIssueAmount = Number(job.additional_issue_price || 0);
            const additionalIssueDesc = (job.additional_issue || '').trim();
            if (additionalIssueAmount > 0 || additionalIssueDesc) {
                lineItems.push({
                    type: 'simple',
                    name: 'Additional Issue Found',
                    desc: additionalIssueDesc || 'Extra issue identified and resolved during the visit.',
                    price: additionalIssueAmount
                });
            }

            this.billLineItems = lineItems;
            this.isInspectionJob = hasOtherService;
            this.billInspectionFee = inspFee;
            this.billQuoteAmount = quotedTotal;
            this.billSubtotal = lineItems.reduce((s, i) => s + (i.price || 0), 0);
            this.billDiscountAmount = discountAmount;

            if (hasOtherService) {
                this.billPlatformFee = 0;
                this.billGrandTotal = Math.max(0, this.billSubtotal - discountAmount);
                this.billAdvancePaid = 0;          // ✅ no inspection fee paid upfront
                this.billBalancePaid = this.billGrandTotal;
                this.billRefundDue = 0;
            } else {
                this.billPlatformFee = 49;
                this.billGrandTotal = Math.max(0, this.billSubtotal - discountAmount) + this.billPlatformFee;
                this.billAdvancePaid = 0;          // ✅ nothing paid upfront
                this.billBalancePaid = this.billGrandTotal;
                this.billRefundDue = 0;
            }

            this.billAmountInWords = this.numberToWords(this.billGrandTotal);

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
            if (job.payment_status) this.paymentStatus = job.payment_status;

            if (job.quote_status) {
                this.quoteStatus = job.quote_status;
                this.quoteAmount = job.quoted_amount || 0;
                this.quoteDescription = job.quote_description || '';
                this.quoteLabour = job.quoted_labour || 0;
                this.quoteMaterial = job.quoted_material || 0;
                this.quoteExtra = job.quoted_extra || 0;
                this.inspectionFee = job.inspection_fee_amount || 149;  // ✅ 149
                this.showQuoteCard = job.quote_status === 'submitted';
            }

            if (job.tech_id) this.fetchTechnician(job.tech_id);

          const otpReady = ['in_progress', 'completed'].includes(
    String(job.status || '').toLowerCase()
);
this.otpCode = otpReady
    ? (job.otp || job.completion_otp || null)
    : null;

            this.updateBillAmounts(job);

            if (this.jobStatus !== 'pending' && this.jobStatus !== 'searching') {
                this.technicianFound = true;
                if (this.timerInterval) clearInterval(this.timerInterval);
            }

            if (this.jobStatus === 'completed' && job.user_id) {
                this.checkLoyaltyReward(job.user_id);
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

    // Falls back to the city-centre coordinates only if we truly have nothing
    // (e.g. the address hasn't been geocoded yet). Real jobs should have
    // customer_lat/customer_lng cached by the technician's app on load.
    _techMarkerIcon() {
        return L.divIcon({
            html: `<div class="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white relative"><div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-50"></div><i class="fa-solid fa-truck-fast text-sm relative z-10"></i></div>`,
            className: '', iconSize: [40, 40], iconAnchor: [20, 40]
        });
    },

    haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    // Mirrors the technician app's own ETA heuristic so both sides agree.
    updateEtaFromCoords(techLat, techLng) {
        if (this.customerLat == null || this.customerLng == null) return;
        const distanceKm = this.haversineKm(techLat, techLng, this.customerLat, this.customerLng);
        let avgSpeed = 28;
        if (distanceKm > 12) avgSpeed = 48;
        else if (distanceKm > 5) avgSpeed = 38;
        this.etaMins = distanceKm < 0.1 ? 0 : Math.max(1, Math.round((distanceKm / avgSpeed) * 60));
    },

    // Draws/updates the real road route line computed by the technician's
    // device via OpenRouteService, and uses its real duration for the ETA.
    updateRoute(geometryJson, distanceKm, durationMin, updatedAt) {
        if (!this.map || !geometryJson) return;

        let coords;
        try {
            coords = JSON.parse(geometryJson);
        } catch (e) {
            console.warn("Could not parse route geometry:", e.message);
            return;
        }
        if (!Array.isArray(coords) || coords.length < 2) return;

        if (this.routeLine) {
            this.routeLine.setLatLngs(coords);
        } else {
            this.routeLine = L.polyline(coords, {
                color: '#10B981', weight: 4, opacity: 0.85, lineJoin: 'round'
            }).addTo(this.map);
            this.routeLine.bringToBack();
        }

        this.routeUpdatedAt = updatedAt || new Date().toISOString();
        this.usingRealRoute = true;
        if (Number.isFinite(durationMin)) {
            this.etaMins = Math.max(0, Math.round(durationMin));
        }
    },

    // Called on every real GPS ping received over Supabase realtime.
    updateTechMarker(techLat, techLng, updatedAt) {
        if (!this.map || techLat == null || techLng == null) return;

        this.techLocationLive = true;
        this.techLocationStale = false;
        this.techLocationUpdatedAt = updatedAt || new Date().toISOString();

        if (!this.techMarker) {
            this.techMarker = L.marker([techLat, techLng], { icon: this._techMarkerIcon() }).addTo(this.map);
        } else {
            this.techMarker.setLatLng([techLat, techLng]);
        }

        // Only fall back to the straight-line ETA estimate when we don't have
        // a real (and reasonably fresh) road route — the route update itself
        // sets a more accurate ETA, and GPS pings arrive far more often than
        // routes, so we don't want to overwrite a good ETA with a rough one.
        if (!this.usingRealRoute) {
            this.updateEtaFromCoords(techLat, techLng);
        }

        const bounds = this.routeLine
            ? this.routeLine.getBounds()
            : (this.customerLat != null && this.customerLng != null
                ? L.latLngBounds([[this.customerLat, this.customerLng], [techLat, techLng]])
                : null);
        if (bounds) {
            this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
    },

    initMap() {
        if (this.map) return;

        const job = this.fullJobData || {};
        const hasRealCustomerCoords = job.customer_lat != null && job.customer_lng != null;
        const customerLat = hasRealCustomerCoords ? Number(job.customer_lat) : 21.1458;
        const customerLng = hasRealCustomerCoords ? Number(job.customer_lng) : 79.0882;

        this.customerLat = customerLat;
        this.customerLng = customerLng;

        this.map = L.map('trackingMap', { zoomControl: false }).setView([customerLat, customerLng], 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(this.map);

        const customerIcon = L.divIcon({
            html: `<div class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i class="fa-solid fa-house text-xs"></i></div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 32]
        });
        L.marker([customerLat, customerLng], {icon: customerIcon}).addTo(this.map);

        // Draw the last known real route immediately if we already have one.
        if (job.route_geometry) {
            this.updateRoute(job.route_geometry, Number(job.route_distance_km), Number(job.route_duration_min), job.route_updated_at);
        }

        // Only place the technician marker if we already have a real GPS ping.
        // Otherwise wait for the first realtime update — no simulated position.
        const hasRealTechCoords = job.tech_lat != null && job.tech_lng != null;
        if (hasRealTechCoords) {
            this.updateTechMarker(Number(job.tech_lat), Number(job.tech_lng), job.tech_location_updated_at);
        }
    },

    async cancelJob() {
        if(!confirm("Cancel your search?")) return;
        await sb.from('jobs').update({ status: 'cancelled' }).eq('id', this.jobId);
        window.location.href = 'index.html';
    },

    async acceptQuote() {
    if (!confirm("Approve this quote? The technician will begin work immediately.")) return;

    const finalAmount = Math.max(0, this.quoteAmount);  // ✅ full quote, no deduction

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
              `Amount Due After Job: ₹${finalAmount}\n\n` +
              `The technician will now start the repair work. ` +
              `Please pay via the QR shown by your technician once the job is completed.`);

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

            alert("Quote rejected. Your booking has been closed.");
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
