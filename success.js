const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-dark': '#1a1a1a',
                'brand-gold': '#A07D54',
                'brand-green': '#10B981'
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif']
            },
            animation: {
                'ripple': 'ripple 2s linear infinite',
                'slide-up-fade': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            },
            keyframes: {
                ripple: {
                    '0%': {
                        transform: 'scale(0.8)',
                        opacity: '1'
                    },
                    '100%': {
                        transform: 'scale(2.5)',
                        opacity: '0'
                    }
                },
                slideUpFade: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(40px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                }
            }
        }
    }
};

document.addEventListener('alpine:init', () => {

    Alpine.data('trackingApp', () => ({

        // =========================================================
        // JOB / TECHNICIAN STATE
        // =========================================================

        jobId: null,
        technicianFound: false,
        techData: null,
        secondsElapsed: 0,
        timerInterval: null,

        otpCode: null,

        jobStatus: 'pending',

        // =========================================================
        // PAYMENT STATE
        // =========================================================

        paymentStatus: 'UNPAID',

        // IMPORTANT:
        // This is the FINAL amount customer must pay.
        payableAmount: 0,

        paymentModalOpen: false,

        // =========================================================
        // QUOTE STATE
        // =========================================================

        quoteAmount: 0,
        quoteDescription: '',
        quoteStatus: '',

        inspectionFee: 299,

        showQuoteCard: false,

        quoteLabour: 0,
        quoteMaterial: 0,
        quoteExtra: 0,

        // =========================================================
        // BILL STATE
        // =========================================================

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

        billInspectionFee: 299,
        billQuoteAmount: 0,

        billAdvancePaid: 0,
        billBalancePaid: 0,
        billRefundDue: 0,

        billAmountInWords: '',

        isPrinting: false,

        billTechId: 'N/A',

        // =========================================================
        // FEEDBACK
        // =========================================================

        showFeedback: false,
        feedbackStep: 1,
        feedbackRating: 0,
        feedbackComment: '',
        feedbackTags: [],
        feedbackLoading: false,
        feedbackDone: false,

        // =========================================================
        // LOYALTY
        // =========================================================

        loyaltyReward: null,
        loyaltyChecked: false,

        // =========================================================
        // MAP
        // =========================================================

        map: null,
        techMarker: null,
        etaMins: 12,

        // =========================================================
        // INIT
        // =========================================================

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

            // =====================================================
            // REALTIME JOB LISTENER
            // =====================================================

            const channel = sb.channel(
                'waiting-room-' + this.jobId
            );

            channel
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'jobs',
                        filter: `id=eq.${this.jobId}`
                    },
                    async (payload) => {

                        console.log(
                            'Real-time updates payload:',
                            payload
                        );

                        if (!payload.new) return;

                        // =================================================
                        // JOB STATUS
                        // =================================================

                        if (payload.new.status) {

                            this.jobStatus =
                                payload.new.status;

                            if (
                                this.jobStatus !== 'pending' &&
                                this.jobStatus !== 'searching'
                            ) {
                                this.technicianFound = true;
                            }

                            if (
                                this.jobStatus === 'completed'
                            ) {

                                const uid =
                                    payload.new.user_id ||
                                    this.fullJobData?.user_id;

                                if (uid) {
                                    this.checkLoyaltyReward(uid);
                                }
                            }
                        }

                        // =================================================
                        // IMPORTANT PAYMENT UPDATE
                        // =================================================

                        if (
                            payload.new.payment_status !== undefined
                        ) {

                            this.paymentStatus =
                                payload.new.payment_status;
                        }

                        // =================================================
                        // FINAL PAYABLE AMOUNT
                        // =================================================

                        if (
                            payload.new.payable_amount !== undefined
                        ) {

                            const amount = Number(
                                payload.new.payable_amount || 0
                            );

                            if (amount > 0) {
                                this.payableAmount = amount;
                            }
                        }

                        // =================================================
                        // CUSTOMER PRICE
                        // =================================================

                        if (
                            payload.new.customer_price !== undefined
                        ) {

                            const customerPrice = Number(
                                payload.new.customer_price || 0
                            );

                            if (customerPrice >= 0) {
                                this.payableAmount =
                                    customerPrice;
                            }
                        }

                        // =================================================
                        // QUOTE UPDATE
                        // =================================================

                        if (
                            payload.new.quote_status !== undefined
                        ) {

                            this.quoteStatus =
                                payload.new.quote_status;

                            this.quoteAmount =
                                Number(
                                    payload.new.quoted_amount || 0
                                );

                            this.quoteDescription =
                                payload.new.quote_description || '';

                            this.quoteLabour =
                                Number(
                                    payload.new.quoted_labour || 0
                                );

                            this.quoteMaterial =
                                Number(
                                    payload.new.quoted_material || 0
                                );

                            this.quoteExtra =
                                Number(
                                    payload.new.quoted_extra || 0
                                );

                            this.inspectionFee =
                                Number(
                                    payload.new.inspection_fee_amount ||
                                    299
                                );

                            // Quote is shown only before approval.
                            this.showQuoteCard =
                                payload.new.quote_status ===
                                'submitted';

                            // =================================================
                            // QUOTE APPROVED
                            // =================================================

                            if (
                                payload.new.quote_status ===
                                'approved'
                            ) {

                                this.showQuoteCard = false;

                                // Calculate final balance.
                                const quoteTotal =
                                    Number(
                                        payload.new.quoted_amount ||
                                        0
                                    );

                                const inspection =
                                    Number(
                                        payload.new.inspection_fee_amount ||
                                        299
                                    );

                                const customerPrice =
                                    Number(
                                        payload.new.customer_price ??
                                        Math.max(
                                            0,
                                            quoteTotal - inspection
                                        )
                                    );

                                this.payableAmount =
                                    Math.max(
                                        0,
                                        customerPrice
                                    );

                                await this.refreshJobData();
                            }

                            if (
                                payload.new.quote_status ===
                                'rejected'
                            ) {

                                this.showQuoteCard = false;
                            }
                        }

                        // =================================================
                        // OTP
                        // =================================================

                        if (
                            payload.new.completion_otp ||
                            payload.new.otp
                        ) {

                            this.otpCode =
                                payload.new.completion_otp ||
                                payload.new.otp;

                        } else if (
                            payload.new.otp === null &&
                            payload.new.completion_otp === null
                        ) {

                            this.otpCode = null;
                        }

                        // =================================================
                        // TECHNICIAN
                        // =================================================

                        if (
                            payload.new.tech_id &&
                            !this.techData
                        ) {

                            this.fetchTechnician(
                                payload.new.tech_id
                            );
                        }

                        // =================================================
                        // KEEP LOCAL DATA UPDATED
                        // =================================================

                        this.fullJobData = {
                            ...(this.fullJobData || {}),
                            ...payload.new
                        };
                    }
                )
                .subscribe();
        },

        // =========================================================
        // RAZORPAY
        // =========================================================

        async triggerRazorpayCheckout(job) {

            if (typeof Razorpay === 'undefined') {

                console.error(
                    "Razorpay SDK not loaded in head."
                );

                return;
            }

            // -----------------------------------------------------
            // NEVER blindly charge ₹299 here.
            // The database must contain the final payable amount.
            // -----------------------------------------------------

            let finalAmount = Number(
                job?.payable_amount ??
                job?.customer_price ??
                this.payableAmount ??
                0
            );

            // If quote exists and customer_price exists,
            // customer_price is authoritative.
            if (
                job?.customer_price !== undefined &&
                job?.customer_price !== null
            ) {

                finalAmount = Number(
                    job.customer_price
                );
            }

            // For approved quote, calculate remaining balance
            // if customer_price wasn't stored.
            if (
                (!finalAmount || finalAmount <= 0) &&
                job?.quote_status === 'approved'
            ) {

                const quoteTotal =
                    Number(job.quoted_amount || 0);

                const inspection =
                    Number(
                        job.inspection_fee_amount ||
                        299
                    );

                finalAmount =
                    Math.max(
                        0,
                        quoteTotal - inspection
                    );
            }

            if (finalAmount <= 0) {

                console.error(
                    'Invalid final payable amount:',
                    finalAmount,
                    job
                );

                alert(
                    "Final payment amount is not available yet. Please wait for the technician to complete the job."
                );

                return;
            }

            this.payableAmount = finalAmount;

            this.paymentModalOpen = true;

            const payableAmountInPaise =
                Math.round(finalAmount * 100);

            try {

                // =================================================
                // CREATE RAZORPAY ORDER
                // =================================================

                const {
                    data: order,
                    error
                } = await sb.functions.invoke(
                    'create-razorpay-order',
                    {
                        body: {
                            jobId: job.id,
                            amount: payableAmountInPaise
                        }
                    }
                );

                if (
                    error ||
                    !order ||
                    !order.id
                ) {

                    console.error(
                        "Order creation error:",
                        error
                    );

                    this.paymentModalOpen = false;

                    alert(
                        "Could not initialize secure payment gateway."
                    );

                    return;
                }

                // =================================================
                // GENERATE COMPLETION OTP
                // =================================================

                const generatedOtp =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();

                // =================================================
                // RAZORPAY OPTIONS
                // =================================================

                const options = {

                    key:
                        "rzp_test_TI4hJKB1B4rwKx",

                    amount:
                        order.amount,

                    currency:
                        order.currency,

                    name:
                        "FixZenix Home Services",

                    description:
                        `Final payment for ${
                            job.device ||
                            job.category ||
                            'Service'
                        }`,

                    order_id:
                        order.id,

                    handler:
                        async (response) => {

                            // =====================================
                            // VERIFY PAYMENT
                            // =====================================

                            const {
                                data: verifyResult,
                                error: verifyError
                            } =
                                await sb.functions.invoke(
                                    'verify-razorpay-payment',
                                    {
                                        body: {

                                            jobId:
                                                job.id,

                                            razorpay_order_id:
                                                response.razorpay_order_id,

                                            razorpay_payment_id:
                                                response.razorpay_payment_id,

                                            razorpay_signature:
                                                response.razorpay_signature,

                                            completion_otp:
                                                generatedOtp
                                        }
                                    }
                                );

                            this.paymentModalOpen =
                                false;

                            // =====================================
                            // PAYMENT SUCCESS
                            // =====================================

                            if (
                                !verifyError &&
                                verifyResult?.status ===
                                "success"
                            ) {

                                this.otpCode =
                                    generatedOtp;

                                this.paymentStatus =
                                    'PAID';

                                // Store exact amount locally.
                                this.payableAmount =
                                    finalAmount;

                                await this.refreshJobData();

                                alert(
                                    `Payment successful!\n\n` +
                                    `Amount Paid: ₹${finalAmount}\n\n` +
                                    `Your completion code has been generated.`
                                );

                            } else {

                                console.error(
                                    "Payment verification failed:",
                                    verifyError,
                                    verifyResult
                                );

                                alert(
                                    "Payment verification failed. Please contact support if money was deducted."
                                );
                            }
                        },

                    prefill: {

                        name:
                            job.customer_name ||
                            "Customer",

                        contact:
                            job.phone ||
                            "9876543210"
                    },

                    theme: {
                        color: "#A07D54"
                    },

                    modal: {

                        ondismiss: () => {

                            this.paymentModalOpen =
                                false;
                        }
                    }
                };

                const rzp =
                    new Razorpay(options);

                rzp.open();

            } catch (err) {

                console.error(
                    "Razorpay Checkout Error:",
                    err
                );

                this.paymentModalOpen = false;

                alert(
                    "Unable to start payment. Please try again."
                );
            }
        },

        // =========================================================
        // REFRESH JOB
        // =========================================================

        async refreshJobData() {

            const {
                data: job,
                error
            } = await sb
                .from('jobs')
                .select('*')
                .eq('id', this.jobId)
                .single();

            if (error) {

                console.error(
                    'Error refreshing job:',
                    error
                );

                return;
            }

            if (!job) return;

            this.fullJobData = job;

            if (job.status) {
                this.jobStatus =
                    job.status;
            }

            if (job.payment_status) {
                this.paymentStatus =
                    job.payment_status;
            }

            // -----------------------------------------------------
            // IMPORTANT:
            // customer_price is the final amount to pay.
            // -----------------------------------------------------

            if (
                job.customer_price !== null &&
                job.customer_price !== undefined
            ) {

                this.payableAmount =
                    Math.max(
                        0,
                        Number(job.customer_price)
                    );

            } else if (
                job.payable_amount !== null &&
                job.payable_amount !== undefined
            ) {

                this.payableAmount =
                    Math.max(
                        0,
                        Number(job.payable_amount)
                    );

            } else if (
                job.quote_status === 'approved'
            ) {

                const quoteTotal =
                    Number(
                        job.quoted_amount || 0
                    );

                const inspection =
                    Number(
                        job.inspection_fee_amount ||
                        299
                    );

                this.payableAmount =
                    Math.max(
                        0,
                        quoteTotal - inspection
                    );
            }

            // -----------------------------------------------------
            // QUOTE DATA
            // -----------------------------------------------------

            if (job.quote_status) {

                this.quoteStatus =
                    job.quote_status;

                this.quoteAmount =
                    Number(
                        job.quoted_amount || 0
                    );

                this.quoteDescription =
                    job.quote_description || '';

                this.quoteLabour =
                    Number(
                        job.quoted_labour || 0
                    );

                this.quoteMaterial =
                    Number(
                        job.quoted_material || 0
                    );

                this.quoteExtra =
                    Number(
                        job.quoted_extra || 0
                    );

                this.inspectionFee =
                    Number(
                        job.inspection_fee_amount ||
                        299
                    );

                this.showQuoteCard =
                    job.quote_status ===
                    'submitted';
            }

            // -----------------------------------------------------
            // TECHNICIAN
            // -----------------------------------------------------

            if (job.tech_id) {
                this.fetchTechnician(
                    job.tech_id
                );
            }

            // -----------------------------------------------------
            // OTP
            // -----------------------------------------------------

            if (
                job.completion_otp ||
                job.otp
            ) {

                this.otpCode =
                    job.completion_otp ||
                    job.otp;
            }

            // -----------------------------------------------------
            // BILL
            // -----------------------------------------------------

            this.updateBillAmounts(job);

            // -----------------------------------------------------
            // TECHNICIAN ACCEPTED
            // -----------------------------------------------------

            if (
                this.jobStatus !== 'pending' &&
                this.jobStatus !== 'searching'
            ) {

                this.technicianFound =
                    true;

                if (this.timerInterval) {
                    clearInterval(
                        this.timerInterval
                    );
                }
            }

            // -----------------------------------------------------
            // COMPLETED
            // -----------------------------------------------------

            if (
                this.jobStatus === 'completed' &&
                job.user_id
            ) {

                this.checkLoyaltyReward(
                    job.user_id
                );
            }
        },

        // =========================================================
        // BILL AMOUNTS
        // =========================================================

        updateBillAmounts(job) {

            this.fullJobData = job;

            if (
                job.customer_price !== null &&
                job.customer_price !== undefined
            ) {

                this.payableAmount =
                    Math.max(
                        0,
                        Number(job.customer_price)
                    );
            }
        },

        // =========================================================
        // LOYALTY REWARD
        // =========================================================

        async checkLoyaltyReward(userId) {

            if (
                this.loyaltyChecked ||
                !userId
            ) {
                return;
            }

            this.loyaltyChecked = true;

            try {

                // -------------------------------------------------
                // CHECK EXISTING REWARD
                // -------------------------------------------------

                const {
                    data: existing
                } = await sb
                    .from('promos')
                    .select('*')
                    .eq(
                        'milestone_job_id',
                        this.jobId
                    )
                    .maybeSingle();

                if (existing) {

                    this.loyaltyReward =
                        existing;

                    return;
                }

                // -------------------------------------------------
                // COUNT COMPLETED JOBS
                // -------------------------------------------------

                const {
                    count,
                    error: countError
                } = await sb
                    .from('jobs')
                    .select(
                        'id',
                        {
                            count: 'exact',
                            head: true
                        }
                    )
                    .eq(
                        'user_id',
                        userId
                    )
                    .eq(
                        'status',
                        'completed'
                    );

                if (countError) {
                    throw countError;
                }

                if (
                    !count ||
                    count % 5 !== 0
                ) {
                    return;
                }

                // -------------------------------------------------
                // CREATE REWARD
                // -------------------------------------------------

                const code =
                    'LOYAL' +
                    Math.floor(
                        1000 +
                        Math.random() * 9000
                    );

                const expiry =
                    new Date();

                expiry.setDate(
                    expiry.getDate() + 60
                );

                const {
                    data: created,
                    error: insertError
                } = await sb
                    .from('promos')
                    .insert([{

                        code: code,

                        type: 'percent',

                        value: 15,

                        expiry:
                            expiry
                                .toISOString()
                                .split('T')[0],

                        usage_count: 0,

                        created_at:
                            new Date()
                                .toISOString(),

                        user_id:
                            userId,

                        milestone_job_id:
                            this.jobId

                    }])
                    .select()
                    .single();

                if (insertError) {

                    console.error(
                        'Loyalty reward creation failed:',
                        insertError.message
                    );

                    return;
                }

                this.loyaltyReward =
                    created;

            } catch (err) {

                console.error(
                    'Loyalty reward check failed:',
                    err
                );
            }
        },

        // =========================================================
        // NUMBER TO WORDS
        // =========================================================

        numberToWords(num) {

            num =
                Math.round(
                    Math.max(
                        0,
                        num || 0
                    )
                );

            if (num === 0) {
                return 'Zero';
            }

            const ones = [
                '',
                'One',
                'Two',
                'Three',
                'Four',
                'Five',
                'Six',
                'Seven',
                'Eight',
                'Nine',
                'Ten',
                'Eleven',
                'Twelve',
                'Thirteen',
                'Fourteen',
                'Fifteen',
                'Sixteen',
                'Seventeen',
                'Eighteen',
                'Nineteen'
            ];

            const tens = [
                '',
                '',
                'Twenty',
                'Thirty',
                'Forty',
                'Fifty',
                'Sixty',
                'Seventy',
                'Eighty',
                'Ninety'
            ];

            const twoDigits = n =>
                n < 20
                    ? ones[n]
                    : (
                        tens[
                            Math.floor(
                                n / 10
                            )
                        ] +
                        (
                            n % 10
                                ? ' ' +
                                  ones[n % 10]
                                : ''
                        )
                    );

            const threeDigits = n =>
                n < 100
                    ? twoDigits(n)
                    : (
                        ones[
                            Math.floor(
                                n / 100
                            )
                        ] +
                        ' Hundred' +
                        (
                            n % 100
                                ? ' ' +
                                  twoDigits(
                                      n % 100
                                  )
                                : ''
                        )
                    );

            let result = '';

            const crore =
                Math.floor(
                    num / 10000000
                );

            num %= 10000000;

            const lakh =
                Math.floor(
                    num / 100000
                );

            num %= 100000;

            const thousand =
                Math.floor(
                    num / 1000
                );

            num %= 1000;

            const hundred = num;

            if (crore) {
                result +=
                    threeDigits(crore) +
                    ' Crore ';
            }

            if (lakh) {
                result +=
                    threeDigits(lakh) +
                    ' Lakh ';
            }

            if (thousand) {
                result +=
                    threeDigits(thousand) +
                    ' Thousand ';
            }

            if (hundred) {
                result +=
                    threeDigits(hundred);
            }

            return result.trim();
        },

        // =========================================================
        // OPEN BILL
        // =========================================================

        async openBillModal() {

            // -----------------------------------------------------
            // BILL SHOULD ONLY BE GENERATED AFTER PAYMENT.
            // -----------------------------------------------------

            if (
                this.paymentStatus !== 'PAID' &&
                !this.otpCode
            ) {

                alert(
                    "The final bill will be available after successful payment."
                );

                return;
            }

            try {

                const {
                    data: job,
                    error: jobError
                } = await sb
                    .from('jobs')
                    .select('*')
                    .eq('id', this.jobId)
                    .single();

                if (jobError) {
                    throw jobError;
                }

                if (!job) {
                    throw new Error(
                        'Job not found.'
                    );
                }

                this.fullJobData =
                    job;

                // =================================================
                // TECHNICIAN
                // =================================================

                let techIdDisplay =
                    'N/A';

                if (job.tech_id) {

                    const {
                        data: tech,
                        error: techError
                    } = await sb
                        .from('technicians')
                        .select(
                            'tech_id, name'
                        )
                        .eq(
                            'id',
                            job.tech_id
                        )
                        .single();

                    if (
                        !techError &&
                        tech
                    ) {

                        techIdDisplay =
                            tech.tech_id ||
                            (
                                job.tech_id
                                    .slice(
                                        0,
                                        8
                                    )
                                    .toUpperCase()
                            );

                        if (!this.techData) {
                            this.techData =
                                tech;
                        }

                    } else {

                        techIdDisplay =
                            job.tech_id
                                .slice(
                                    0,
                                    8
                                )
                                .toUpperCase();
                    }
                }

                // =================================================
                // BASIC BILL INFO
                // =================================================

                this.billServiceName =
                    job.service_name ||
                    job.category ||
                    'Expert Service';

                this.billVariantName =
                    job.variant_name ||
                    job.device ||
                    'Service';

                const OTHER_LABEL =
                    'Other Issue';

                const inspFee =
                    Number(
                        job.inspection_fee_amount ||
                        299
                    );

                const grossPrice =
                    parseFloat(
                        job.original_price ??
                        job.discounted_price ??
                        0
                    );

                const totalPrice =
                    parseFloat(
                        job.discounted_price ??
                        job.original_price ??
                        0
                    );

                const discountAmount =
                    Math.max(
                        0,
                        grossPrice -
                        totalPrice
                    );

                const servicesSelected =
                    job.services_selected ||
                    job.device ||
                    '';

                const serviceNames =
                    servicesSelected
                        ? servicesSelected
                            .split(',')
                            .map(
                                s =>
                                    s.trim()
                            )
                            .filter(Boolean)
                        : ['Service'];

                const fixedServiceNames =
                    serviceNames.filter(
                        n =>
                            n !== OTHER_LABEL
                    );

                const hasOtherService =
                    !!job.is_inspection_job ||
                    serviceNames.some(
                        n =>
                            n ===
                            OTHER_LABEL
                    );

                const fixedTotal =
                    hasOtherService
                        ? Math.max(
                            0,
                            totalPrice -
                            inspFee
                        )
                        : totalPrice;

                // =================================================
                // PRICE BREAKDOWN
                // =================================================

                let priceMap = null;

                if (
                    job.service_price_breakdown
                ) {

                    try {

                        const parsed =
                            typeof job.service_price_breakdown ===
                            'string'
                                ? JSON.parse(
                                    job.service_price_breakdown
                                )
                                : job.service_price_breakdown;

                        if (
                            parsed &&
                            typeof parsed ===
                            'object'
                        ) {

                            priceMap =
                                parsed;
                        }

                    } catch (e) {

                        priceMap =
                            null;
                    }
                }

                const lineItems = [];

                // =================================================
                // FIXED SERVICES
                // =================================================

                if (
                    fixedServiceNames.length >
                    0
                ) {

                    if (priceMap) {

                        fixedServiceNames.forEach(
                            name => {

                                const price =
                                    Number(
                                        priceMap[name] ??
                                        0
                                    );

                                if (
                                    price > 0
                                ) {

                                    lineItems.push({

                                        type:
                                            'simple',

                                        name:
                                            name,

                                        desc:
                                            job.category
                                                ? `${job.category} • Service Charge`
                                                : 'Service Charge',

                                        price:
                                            price
                                    });
                                }
                            }
                        );

                    } else {

                        const per =
                            fixedServiceNames.length >
                            0
                                ? (
                                    fixedTotal /
                                    fixedServiceNames.length
                                )
                                : 0;

                        fixedServiceNames.forEach(
                            name => {

                                lineItems.push({

                                    type:
                                        'simple',

                                    name:
                                        name,

                                    desc:
                                        job.category
                                            ? `${job.category} • Service Charge`
                                            : 'Service Charge',

                                    price:
                                        per
                                });
                            }
                        );
                    }
                }

                // =================================================
                // QUOTED SERVICE
                // =================================================

                let quotedTotal = 0;

                if (
                    hasOtherService
                ) {

                    const labour =
                        Number(
                            job.quoted_labour ||
                            0
                        );

                    const material =
                        Number(
                            job.quoted_material ||
                            0
                        );

                    const extra =
                        Number(
                            job.quoted_extra ||
                            0
                        );

                    quotedTotal =
                        Number(
                            job.quoted_amount ||
                            (
                                labour +
                                material +
                                extra
                            ) ||
                            0
                        );

                    const issueDesc =
                        job.other_issue
                            ? job.other_issue
                            : 'Issue diagnosed and resolved on-site by the technician.';

                    lineItems.push({

                        type:
                            'quote',

                        name:
                            'Other Service (On-Site Diagnosis & Repair)',

                        desc:
                            issueDesc,

                        workDesc:
                            job.quote_description ||
                            '',

                        labour:
                            labour,

                        material:
                            material,

                        extra:
                            extra,

                        price:
                            quotedTotal
                    });
                }

                // =================================================
                // CALCULATE BILL
                // =================================================

                this.billLineItems =
                    lineItems;

                this.isInspectionJob =
                    hasOtherService;

                this.billInspectionFee =
                    inspFee;

                this.billQuoteAmount =
                    quotedTotal;

                this.billSubtotal =
                    lineItems.reduce(
                        (s, i) =>
                            s +
                            (
                                i.price ||
                                0
                            ),
                        0
                    );

                this.billDiscountAmount =
                    discountAmount;

                // =================================================
                // INSPECTION / QUOTE BILL
                // =================================================

                if (
                    hasOtherService
                ) {

                    this.billPlatformFee =
                        0;

                    this.billGrandTotal =
                        Math.max(
                            0,
                            this.billSubtotal -
                            discountAmount
                        );

                    this.billAdvancePaid =
                        fixedTotal +
                        inspFee;

                    // Actual balance paid
                    // should match the final amount.
                    const finalPayment =
                        Number(
                            job.customer_price ??
                            job.payable_amount ??
                            Math.max(
                                0,
                                quotedTotal -
                                inspFee
                            )
                        );

                    this.billBalancePaid =
                        Math.max(
                            0,
                            finalPayment
                        );

                    if (
                        quotedTotal <
                        inspFee
                    ) {

                        this.billRefundDue =
                            inspFee -
                            quotedTotal;

                    } else {

                        this.billRefundDue =
                            0;
                    }

                } else {

                    // =================================================
                    // NORMAL SERVICE
                    // =================================================

                    this.billPlatformFee =
                        49;

                    this.billGrandTotal =
                        Math.max(
                            0,
                            this.billSubtotal -
                            discountAmount
                        ) +
                        this.billPlatformFee;

                    this.billAdvancePaid =
                        this.billGrandTotal;

                    this.billBalancePaid =
                        0;

                    this.billRefundDue =
                        0;
                }

                this.billAmountInWords =
                    this.numberToWords(
                        this.billGrandTotal
                    );

                this.billTechId =
                    techIdDisplay;

                this.$nextTick(
                    () => {
                        this.showBill =
                            true;
                    }
                );

            } catch (err) {

                console.error(
                    'Error opening bill:',
                    err
                );

                alert(
                    'Could not load bill details. Please try again.'
                );
            }
        },

        // =========================================================
        // PDF
        // =========================================================

        downloadPDF() {

            this.isPrinting = true;

            const element =
                document.getElementById(
                    'invoice-content'
                );

            const opt = {

                margin:
                    0.5,

                filename:
                    `FixZen_Invoice_${this.jobId
                        .slice(0, 6)
                        .toUpperCase()}.pdf`,

                image: {
                    type:
                        'jpeg',
                    quality:
                        0.98
                },

                html2canvas: {
                    scale:
                        2,
                    useCORS:
                        true
                },

                jsPDF: {
                    unit:
                        'in',
                    format:
                        'letter',
                    orientation:
                        'portrait'
                }
            };

            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(
                    () => {
                        this.isPrinting =
                            false;
                    }
                )
                .catch(
                    err => {

                        console.error(
                            err
                        );

                        this.isPrinting =
                            false;

                        alert(
                            'Error generating PDF. Please try again.'
                        );
                    }
                );
        },

        // =========================================================
        // TIMER
        // =========================================================

        startTimer() {

            this.timerInterval =
                setInterval(
                    () => {

                        this.secondsElapsed++;

                    },
                    1000
                );
        },

        get formattedTime() {

            const m =
                Math.floor(
                    this.secondsElapsed /
                    60
                )
                    .toString()
                    .padStart(
                        2,
                        '0'
                    );

            const s =
                (
                    this.secondsElapsed %
                    60
                )
                    .toString()
                    .padStart(
                        2,
                        '0'
                    );

            return `${m}:${s}`;
        },

        get searchMessage() {

            if (
                this.secondsElapsed <
                15
            ) {

                return "Alerting nearby experts...";
            }

            if (
                this.secondsElapsed <
                45
            ) {

                return "Connecting with top-rated pros...";
            }

            return "High demand. Still searching...";
        },

        // =========================================================
        // CHECK INITIAL JOB STATUS
        // =========================================================

        async checkJobStatus() {

            const {
                data: job,
                error
            } = await sb
                .from('jobs')
                .select('*')
                .eq(
                    'id',
                    this.jobId
                )
                .single();

            if (error) {

                console.error(
                    'Error fetching job:',
                    error
                );

                return;
            }

            if (!job) return;

            this.fullJobData =
                job;

            if (job.status) {
                this.jobStatus =
                    job.status;
            }

            if (job.payment_status) {
                this.paymentStatus =
                    job.payment_status;
            }

            // =====================================================
            // FINAL PRICE
            // =====================================================

            if (
                job.customer_price !==
                null &&
                job.customer_price !==
                undefined
            ) {

                this.payableAmount =
                    Math.max(
                        0,
                        Number(
                            job.customer_price
                        )
                    );

            } else if (
                job.payable_amount !==
                null &&
                job.payable_amount !==
                undefined
            ) {

                this.payableAmount =
                    Math.max(
                        0,
                        Number(
                            job.payable_amount
                        )
                    );
            }

            // =====================================================
            // QUOTE
            // =====================================================

            if (
                job.quote_status
            ) {

                this.quoteStatus =
                    job.quote_status;

                this.quoteAmount =
                    Number(
                        job.quoted_amount ||
                        0
                    );

                this.quoteDescription =
                    job.quote_description ||
                    '';

                this.quoteLabour =
                    Number(
                        job.quoted_labour ||
                        0
                    );

                this.quoteMaterial =
                    Number(
                        job.quoted_material ||
                        0
                    );

                this.quoteExtra =
                    Number(
                        job.quoted_extra ||
                        0
                    );

                this.inspectionFee =
                    Number(
                        job.inspection_fee_amount ||
                        299
                    );

                this.showQuoteCard =
                    job.quote_status ===
                    'submitted';

                // Approved quote
                // => final amount = customer_price
                // or quote - inspection fee.
                if (
                    job.quote_status ===
                    'approved'
                ) {

                    const quoteTotal =
                        Number(
                            job.quoted_amount ||
                            0
                        );

                    const inspection =
                        Number(
                            job.inspection_fee_amount ||
                            299
                        );

                    const finalAmount =
                        Number(
                            job.customer_price ??
                            Math.max(
                                0,
                                quoteTotal -
                                inspection
                            )
                        );

                    this.payableAmount =
                        Math.max(
                            0,
                            finalAmount
                        );
                }
            }

            // =====================================================
            // TECHNICIAN
            // =====================================================

            if (
                job.tech_id
            ) {

                this.fetchTechnician(
                    job.tech_id
                );
            }

            // =====================================================
            // OTP
            // =====================================================

            if (
                job.completion_otp ||
                job.otp
            ) {

                this.otpCode =
                    job.completion_otp ||
                    job.otp;
            }

            // =====================================================
            // BILL
            // =====================================================

            this.updateBillAmounts(
                job
            );

            // =====================================================
            // TECHNICIAN ACCEPTED
            // =====================================================

            if (
                this.jobStatus !==
                    'pending' &&
                this.jobStatus !==
                    'searching'
            ) {

                this.technicianFound =
                    true;

                if (
                    this.timerInterval
                ) {

                    clearInterval(
                        this.timerInterval
                    );
                }
            }

            // =====================================================
            // COMPLETED
            // =====================================================

            if (
                this.jobStatus ===
                    'completed' &&
                job.user_id
            ) {

                this.checkLoyaltyReward(
                    job.user_id
                );
            }
        },

        // =========================================================
        // FETCH TECHNICIAN
        // =========================================================

        async fetchTechnician(
            techId
        ) {

            const {
                data: tech,
                error
            } = await sb
                .from('technicians')
                .select('*')
                .eq(
                    'id',
                    techId
                )
                .single();

            if (error) {

                console.error(
                    'Error fetching technician:',
                    error
                );

                return;
            }

            if (tech) {

                this.techData =
                    tech;

                this.technicianFound =
                    true;

                clearInterval(
                    this.timerInterval
                );

                if (
                    this.jobStatus !==
                        'completed' &&
                    !this.otpCode
                ) {

                    this.$nextTick(
                        () => {
                            this.initMap();
                        }
                    );
                }
            }
        },

        // =========================================================
        // MAP
        // =========================================================

        initMap() {

            if (this.map) return;

            const customerLat =
                21.1458;

            const customerLng =
                79.0882;

            let techLat =
                21.1200;

            let techLng =
                79.0600;

            this.map =
                L.map(
                    'trackingMap',
                    {
                        zoomControl:
                            false
                    }
                )
                    .setView(
                        [
                            customerLat,
                            customerLng
                        ],
                        13
                    );

            L.tileLayer(
                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                {
                    attribution:
                        '&copy; OpenStreetMap contributors &copy; CARTO',

                    maxZoom:
                        19
                }
            )
                .addTo(
                    this.map
                );

            const customerIcon =
                L.divIcon({

                    html:
                        `<div class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <i class="fa-solid fa-house text-xs"></i>
                        </div>`,

                    className:
                        '',

                    iconSize:
                        [
                            32,
                            32
                        ],

                    iconAnchor:
                        [
                            16,
                            32
                        ]
                });

            const techIcon =
                L.divIcon({

                    html:
                        `<div class="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white relative">
                            <div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-50"></div>
                            <i class="fa-solid fa-truck-fast text-sm relative z-10"></i>
                        </div>`,

                    className:
                        '',

                    iconSize:
                        [
                            40,
                            40
                        ],

                    iconAnchor:
                        [
                            20,
                            40
                        ]
                });

            L.marker(
                [
                    customerLat,
                    customerLng
                ],
                {
                    icon:
                        customerIcon
                }
            )
                .addTo(
                    this.map
                );

            this.techMarker =
                L.marker(
                    [
                        techLat,
                        techLng
                    ],
                    {
                        icon:
                            techIcon
                    }
                )
                    .addTo(
                        this.map
                    );

            const bounds =
                L.latLngBounds(
                    [
                        [
                            customerLat,
                            customerLng
                        ],
                        [
                            techLat,
                            techLng
                        ]
                    ]
                );

            this.map.fitBounds(
                bounds,
                {
                    padding:
                        [
                            30,
                            30
                        ]
                }
            );

            const interval =
                setInterval(
                    () => {

                        if (
                            this.jobStatus !==
                                'arrived' &&
                            this.jobStatus !==
                                'started' &&
                            this.jobStatus !==
                                'in_progress'
                        ) {

                            techLat +=
                                (
                                    customerLat -
                                    techLat
                                ) *
                                0.08;

                            techLng +=
                                (
                                    customerLng -
                                    techLng
                                ) *
                                0.08;

                            if (
                                this.techMarker
                            ) {

                                this.techMarker.setLatLng(
                                    [
                                        techLat,
                                        techLng
                                    ]
                                );
                            }

                            if (
                                Math.random() >
                                    0.7 &&
                                this.etaMins >
                                    1
                            ) {

                                this.etaMins--;
                            }

                        } else {

                            clearInterval(
                                interval
                            );
                        }

                    },
                    2000
                );
        },

        // =========================================================
        // CANCEL JOB
        // =========================================================

        async cancelJob() {

            if (
                !confirm(
                    "Cancel your search?"
                )
            ) {
                return;
            }

            await sb
                .from('jobs')
                .update({
                    status:
                        'cancelled'
                })
                .eq(
                    'id',
                    this.jobId
                );

            window.location.href =
                'index.html';
        },

        // =========================================================
        // ACCEPT QUOTE
        // =========================================================

        async acceptQuote() {

            if (
                !confirm(
                    "Approve this quote? The technician will begin work immediately."
                )
            ) {
                return;
            }

            // -----------------------------------------------------
            // QUOTE TOTAL
            // -----------------------------------------------------

            const quoteTotal =
                Math.max(
                    0,
                    Number(
                        this.quoteAmount ||
                        0
                    )
                );

            // -----------------------------------------------------
            // INSPECTION FEE ALREADY PAID
            // -----------------------------------------------------

            const inspection =
                Math.max(
                    0,
                    Number(
                        this.inspectionFee ||
                        299
                    )
                );

            // -----------------------------------------------------
            // FINAL PRICE CUSTOMER WILL PAY AFTER WORK
            // -----------------------------------------------------

            const finalAmount =
                Math.max(
                    0,
                    quoteTotal -
                    inspection
                );

            try {

                const {
                    error
                } = await sb
                    .from('jobs')
                    .update({

                        quote_status:
                            'approved',

                        customer_approved:
                            true,

                        // This is the authoritative
                        // final payment amount.
                        customer_price:
                            finalAmount,

                        // Keep payable_amount synchronized.
                        payable_amount:
                            finalAmount,

                        status:
                            'in_progress',

                        // Payment should happen only
                        // after technician finishes.
                        payment_status:
                            'UNPAID'

                    })
                    .eq(
                        'id',
                        this.jobId
                    );

                if (error) {
                    throw error;
                }

                // -------------------------------------------------
                // UPDATE LOCAL STATE
                // -------------------------------------------------

                this.showQuoteCard =
                    false;

                this.quoteStatus =
                    'approved';

                this.payableAmount =
                    finalAmount;

                // -------------------------------------------------
                // REFRESH
                // -------------------------------------------------

                await this.refreshJobData();

                // -------------------------------------------------
                // CUSTOMER MESSAGE
                // -------------------------------------------------

                alert(
                    `✅ Quote Approved!\n\n` +

                    `Total Quote: ₹${quoteTotal}\n` +

                    `Inspection Fee Already Paid: ₹${inspection}\n\n` +

                    `FINAL PRICE TO PAY: ₹${finalAmount}\n\n` +

                    `The technician will now start the repair work.\n\n` +

                    `You will pay this amount after the technician completes the service.`
                );

            } catch (err) {

                console.error(
                    'Error approving quote:',
                    err
                );

                alert(
                    "Error approving quote: " +
                    err.message
                );
            }
        },

        // =========================================================
        // REJECT QUOTE
        // =========================================================

        async rejectQuote() {

            const reason =
                prompt(
                    "Please share why you're rejecting this quote (optional):"
                );

            try {

                const {
                    error
                } = await sb
                    .from('jobs')
                    .update({

                        quote_status:
                            'rejected',

                        customer_approved:
                            false,

                        status:
                            'cancelled'

                    })
                    .eq(
                        'id',
                        this.jobId
                    );

                if (error) {
                    throw error;
                }

                alert(
                    "Quote rejected. Your booking has been closed. The inspection fee paid (₹" +
                    this.inspectionFee +
                    ") is non-refundable as the technician visited your location."
                );

                window.location.href =
                    'index.html';

            } catch (err) {

                console.error(
                    'Error rejecting quote:',
                    err
                );

                alert(
                    "Error rejecting quote: " +
                    err.message
                );
            }
        },

        // =========================================================
        // FEEDBACK
        // =========================================================

        setFeedbackRating(i) {

            this.feedbackRating =
                i;

            if (
                navigator.vibrate
            ) {

                navigator.vibrate(
                    30
                );
            }
        },

        getFeedbackEmoji(i) {

            return [
                '😞',
                '😕',
                '😊',
                '😄',
                '🤩'
            ][i - 1] || '';
        },

        getFeedbackLabel(i) {

            return [
                'Poor',
                'Fair',
                'Good',
                'Excellent',
                'Incredible!'
            ][i - 1] || '';
        },

        getFeedbackTags() {

            if (
                this.feedbackRating >=
                4
            ) {

                return [

                    {
                        icon:
                            '⚡',
                        label:
                            'Fast Arrival'
                    },

                    {
                        icon:
                            '👔',
                        label:
                            'Professional'
                    },

                    {
                        icon:
                            '✨',
                        label:
                            'Clean Work'
                    },

                    {
                        icon:
                            '😊',
                        label:
                            'Polite'
                    },

                    {
                        icon:
                            '🔧',
                        label:
                            'Genuine Parts'
                    },

                    {
                        icon:
                            '💯',
                        label:
                            'Worth Every Rupee'
                    }
                ];
            }

            if (
                this.feedbackRating ===
                3
            ) {

                return [

                    {
                        icon:
                            '⏱️',
                        label:
                            'On Time'
                    },

                    {
                        icon:
                            '👍',
                        label:
                            'Decent Work'
                    },

                    {
                        icon:
                            '📞',
                        label:
                            'Good Communication'
                    }
                ];
            }

            return [

                {
                    icon:
                        '⏰',
                    label:
                        'Late Arrival'
                },

                {
                    icon:
                        '🔁',
                    label:
                        'Needs Redo'
                },

                {
                    icon:
                        '📵',
                    label:
                        'Poor Communication'
                },

                {
                    icon:
                        '💸',
                    label:
                        'Overcharged'
                }
            ];
        },

        toggleFeedbackTag(tag) {

            if (
                this.feedbackTags.includes(
                    tag
                )
            ) {

                this.feedbackTags =
                    this.feedbackTags.filter(
                        t =>
                            t !== tag
                    );

            } else {

                this.feedbackTags.push(
                    tag
                );

                if (
                    navigator.vibrate
                ) {

                    navigator.vibrate(
                        20
                    );
                }
            }
        },

        // =========================================================
        // CONFETTI
        // =========================================================

        launchConfetti() {

            const colors = [
                '#A07D54',
                '#1a1a1a',
                '#c9a050',
                '#f4f4f5',
                '#fff'
            ];

            for (
                let i = 0;
                i < 55;
                i++
            ) {

                const p =
                    document.createElement(
                        'div'
                    );

                p.className =
                    'confetti-piece';

                p.style.cssText =
                    `left:${Math.random() * 100}vw;` +
                    `top:-20px;` +
                    `width:${Math.random() * 8 + 5}px;` +
                    `height:${Math.random() * 8 + 5}px;` +
                    `background:${colors[Math.floor(Math.random() * colors.length)]};` +
                    `border-radius:${Math.random() > 0.5 ? '50%' : '2px'};` +
                    `animation-duration:${Math.random() * 2 + 1.5}s;` +
                    `animation-delay:${Math.random() * 0.8}s;`;

                document.body.appendChild(
                    p
                );

                setTimeout(
                    () => p.remove(),
                    4000
                );
            }
        },

        // =========================================================
        // SUBMIT FEEDBACK
        // =========================================================

        async submitFeedback() {

            if (
                !this.feedbackRating
            ) {
                return;
            }

            const storedPhone =
                localStorage.getItem(
                    'local_user_phone'
                );

            if (!storedPhone) {

                alert(
                    "Session identity missing. Please login again."
                );

                window.location.href =
                    'loginuser.html';

                return;
            }

            this.feedbackLoading =
                true;

            try {

                const {
                    data: profile,
                    error: profileError
                } = await sb
                    .from('profiles')
                    .select('id')
                    .eq(
                        'phone',
                        storedPhone.trim()
                    )
                    .maybeSingle();

                if (
                    profileError ||
                    !profile
                ) {

                    throw new Error(
                        profileError?.message ||
                        "Profile identity reference missing."
                    );
                }

                const combinedComment =
                    this.feedbackTags.length >
                    0

                        ? `[${this.feedbackTags.join(', ')}] ${this.feedbackComment}`

                        : this.feedbackComment;

                const {
                    error: feedbackError
                } = await sb
                    .from('feedback')
                    .insert([{

                        job_id:
                            this.jobId,

                        rating:
                            this.feedbackRating,

                        comment:
                            combinedComment,

                        technician_id:
                            this.techData?.id ||
                            null,

                        user_id:
                            profile.id

                    }]);

                if (feedbackError) {
                    throw feedbackError;
                }

                await sb
                    .from('jobs')
                    .update({
                        feedback_provided:
                            true
                    })
                    .eq(
                        'id',
                        this.jobId
                    );

                this.feedbackStep =
                    'done';

                this.launchConfetti();

                if (
                    navigator.vibrate
                ) {

                    navigator.vibrate(
                        [
                            100,
                            60,
                            100,
                            60,
                            200
                        ]
                    );
                }

                setTimeout(
                    () => {

                        this.showFeedback =
                            false;

                        this.feedbackDone =
                            true;

                    },
                    2800
                );

            } catch (err) {

                console.error(
                    err
                );

                alert(
                    "Review Submission Error: " +
                    err.message
                );

            } finally {

                this.feedbackLoading =
                    false;
            }
        }

    }));
});
