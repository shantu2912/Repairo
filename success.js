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
        paymentModalOpen: false,
        paymentLoading: false,

        quoteAmount: 0,
        quoteDescription: '',
        quoteStatus: '',
        inspectionFee: 299,
        showQuoteCard: false,
        quoteLabour: 0,
        quoteMaterial: 0,
        quoteExtra: 0,

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

            const channel = sb.channel('waiting-room-' + this.jobId);

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
                        console.log('Real-time updates payload:', payload);

                        if (!payload.new) return;

                        if (payload.new.status) {
                            this.jobStatus = payload.new.status;

                            if (
                                this.jobStatus !== 'pending' &&
                                this.jobStatus !== 'searching'
                            ) {
                                this.technicianFound = true;
                            }

                            if (
                                this.jobStatus === 'completed' &&
                                payload.new.user_id
                            ) {
                                this.checkLoyaltyReward(payload.new.user_id);
                            }
                        }

                        if (payload.new.payment_status) {
                            this.paymentStatus = String(
                                payload.new.payment_status
                            ).toUpperCase();
                        }

                        if (payload.new.payable_amount != null) {
                            this.payableAmount = Number(
                                payload.new.payable_amount
                            );
                        }

                        await this.refreshJobData();

                        if (payload.new.quote_status !== undefined) {
                            this.quoteStatus =
                                payload.new.quote_status || '';

                            this.quoteAmount = Number(
                                payload.new.quoted_amount || 0
                            );

                            this.quoteDescription =
                                payload.new.quote_description || '';

                            this.quoteLabour = Number(
                                payload.new.quoted_labour || 0
                            );

                            this.quoteMaterial = Number(
                                payload.new.quoted_material || 0
                            );

                            this.quoteExtra = Number(
                                payload.new.quoted_extra || 0
                            );

                            this.showQuoteCard =
                                payload.new.quote_status === 'submitted';

                            if (
                                payload.new.quote_status ===
                                'approved'
                            ) {
                                this.showQuoteCard = false;

                                const quote = Number(
                                    payload.new.quoted_amount || 0
                                );

                                const inspection = Number(
                                    payload.new.inspection_fee_amount ||
                                    299
                                );

                                this.payableAmount = Number(
                                    payload.new.customer_price ??
                                    payload.new.payable_amount ??
                                    Math.max(
                                        0,
                                        quote - inspection
                                    )
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

                        if (
                            this.isPaymentComplete &&
                            (
                                payload.new.completion_otp ||
                                payload.new.otp
                            )
                        ) {
                            this.otpCode =
                                payload.new.completion_otp ||
                                payload.new.otp;
                        } else if (!this.isPaymentComplete) {
                            this.otpCode = null;
                        }

                        if (
                            payload.new.tech_id &&
                            !this.techData
                        ) {
                            await this.fetchTechnician(
                                payload.new.tech_id
                            );
                        }
                    }
                )
                .subscribe();
        },

        get isPaymentComplete() {
            const status = String(
                this.paymentStatus || ''
            ).toUpperCase();

            return [
                'PAID',
                'SUCCESS',
                'COMPLETED'
            ].includes(status);
        },

        get showFinalPayment() {
            const activeStatuses = [
                'arrived',
                'started',
                'in_progress',
                'awaiting_payment'
            ];

            return (
                activeStatuses.includes(this.jobStatus) &&
                Number(this.finalPayableAmount || 0) > 0 &&
                !this.isPaymentComplete
            );
        },

        calculateFinalBillAmount(job) {
            if (!job) return 0;

            const n = (v) => {
                const x = Number(v);
                return Number.isFinite(x) ? x : 0;
            };

            const inspectionFee = n(
                job.inspection_fee_amount || 299
            );

            const originalPrice = n(
                job.original_price ??
                job.discounted_price
            );

            const discountedPrice = n(
                job.discounted_price ??
                job.original_price
            );

            const servicesSelected = String(
                job.services_selected ||
                job.device ||
                ''
            );

            const serviceNames = servicesSelected
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const isInspectionJob =
                !!job.is_inspection_job ||
                serviceNames.some(
                    name =>
                        name.toLowerCase() ===
                        'other issue'
                );

            const quoteTotal = n(
                job.quoted_amount ||
                (
                    n(job.quoted_labour) +
                    n(job.quoted_material) +
                    n(job.quoted_extra)
                )
            );

            const quoteApproved =
                job.quote_status === 'approved';

            let approvedQuoteBalance = 0;

            if (quoteApproved || quoteTotal > 0) {
                if (
                    job.customer_price !== null &&
                    job.customer_price !== undefined
                ) {
                    approvedQuoteBalance = Math.max(
                        0,
                        n(job.customer_price)
                    );
                } else {
                    approvedQuoteBalance = Math.max(
                        0,
                        quoteTotal -
                        (
                            isInspectionJob
                                ? inspectionFee
                                : 0
                        )
                    );
                }
            }

            const additionalIssuePrice = Math.max(
                0,
                n(job.additional_issue_price)
            );

            let payable = 0;

            if (quoteApproved || quoteTotal > 0) {
                payable =
                    approvedQuoteBalance +
                    additionalIssuePrice;
            } else if (isInspectionJob) {
                payable = additionalIssuePrice;
            } else {
                const base =
                    discountedPrice ||
                    originalPrice;

                payable = Math.max(
                    0,
                    base +
                    49 +
                    additionalIssuePrice
                );
            }

            return Number(
                Math.max(0, payable).toFixed(2)
            );
        },

        async payFinalAmount() {
            if (
                this.paymentLoading ||
                this.isPaymentComplete
            ) {
                return;
            }

            this.paymentLoading = true;

            try {
                const {
                    data: job,
                    error
                } = await sb
                    .from('jobs')
                    .select('*')
                    .eq('id', this.jobId)
                    .single();

                if (error || !job) {
                    throw new Error(
                        error?.message ||
                        'Could not load the final bill.'
                    );
                }

                const finalAmount =
                    this.calculateFinalBillAmount(job);

                if (
                    !Number.isFinite(finalAmount) ||
                    finalAmount <= 0
                ) {
                    throw new Error(
                        'The final bill amount is not available yet.'
                    );
                }

                this.fullJobData = job;
                this.finalPayableAmount = finalAmount;
                this.payableAmount = finalAmount;

                if (
                    typeof Razorpay === 'undefined'
                ) {
                    throw new Error(
                        'Secure payment gateway is not loaded. Please refresh the page and try again.'
                    );
                }

                this.paymentModalOpen = true;

                const {
                    data: order,
                    error: orderError
                } = await sb.functions.invoke(
                    'create-razorpay-order',
                    {
                        body: {
                            jobId: job.id,
                            amount: Math.round(
                                finalAmount * 100
                            ),
                            final_bill_amount:
                                finalAmount
                        }
                    }
                );

                if (
                    orderError ||
                    !order?.id
                ) {
                    throw new Error(
                        orderError?.message ||
                        'Could not initialize secure payment.'
                    );
                }

                const options = {
                    key: 'rzp_test_TI4hJKB1B4rwKx',
                    amount: order.amount,
                    currency:
                        order.currency || 'INR',
                    name:
                        'FixZenix Home Services',
                    description:
                        `Final bill payment for ${
                            job.device ||
                            job.category ||
                            'Service'
                        }`,
                    order_id: order.id,

                    handler: async (response) => {
                        try {
                            const generatedOtp =
                                Math.floor(
                                    100000 +
                                    Math.random() *
                                    900000
                                ).toString();

                            const {
                                data: verifyResult,
                                error: verifyError
                            } =
                                await sb.functions.invoke(
                                    'verify-razorpay-payment',
                                    {
                                        body: {
                                            jobId: job.id,
                                            razorpay_order_id:
                                                response.razorpay_order_id,
                                            razorpay_payment_id:
                                                response.razorpay_payment_id,
                                            razorpay_signature:
                                                response.razorpay_signature,
                                            amount:
                                                Math.round(
                                                    finalAmount *
                                                    100
                                                ),
                                            final_bill_amount:
                                                finalAmount,
                                            completion_otp:
                                                generatedOtp
                                        }
                                    }
                                );

                            if (
                                verifyError ||
                                verifyResult?.status !==
                                'success'
                            ) {
                                throw new Error(
                                    verifyError?.message ||
                                    'Payment verification failed. OTP was not released.'
                                );
                            }

                            this.paymentStatus = 'PAID';
                            this.finalPayableAmount =
                                finalAmount;
                            this.payableAmount =
                                finalAmount;
                            this.otpCode =
                                generatedOtp;

                            await this.refreshJobData();

                            alert(
                                `✅ Payment Successful!\n\n` +
                                `Final Bill: ₹${finalAmount.toFixed(2)}\n\n` +
                                `Your completion code is now available. Share it with the technician.`
                            );
                        } catch (err) {
                            console.error(
                                'Payment verification error:',
                                err
                            );

                            this.otpCode = null;

                            alert(
                                'Payment was received, but verification could not be completed. Please contact FixZenix support before making another payment.'
                            );
                        } finally {
                            this.paymentModalOpen = false;
                            this.paymentLoading = false;
                        }
                    },

                    prefill: {
                        name:
                            job.customer_name ||
                            'Customer',
                        contact:
                            job.phone || ''
                    },

                    theme: {
                        color: '#A07D54'
                    },

                    modal: {
                        ondismiss: () => {
                            this.paymentModalOpen =
                                false;
                            this.paymentLoading =
                                false;
                        }
                    }
                };

                const rzp =
                    new Razorpay(options);

                rzp.open();

            } catch (err) {
                console.error(
                    'Final payment error:',
                    err
                );

                this.paymentModalOpen = false;
                this.paymentLoading = false;

                alert(
                    err.message ||
                    'Could not start payment.'
                );
            }
        },

        async refreshJobData() {
            const {
                data: job,
                error
            } = await sb
                .from('jobs')
                .select('*')
                .eq('id', this.jobId)
                .single();

            if (error || !job) return;

            this.fullJobData = job;

            this.paymentStatus = String(
                job.payment_status ||
                this.paymentStatus ||
                'UNPAID'
            ).toUpperCase();

            this.finalPayableAmount =
                this.calculateFinalBillAmount(job);

            this.payableAmount =
                this.finalPayableAmount;

            this.otpCode =
                this.isPaymentComplete
                    ? (
                        job.completion_otp ||
                        job.otp ||
                        this.otpCode ||
                        null
                    )
                    : null;

            this.updateBillAmounts(job);
        },

        updateBillAmounts(job) {
            if (!job) return;

            this.fullJobData = job;

            const n = (v) => {
                const x = Number(v);
                return Number.isFinite(x) ? x : 0;
            };

            const inspectionFee = n(
                job.inspection_fee_amount || 299
            );

            const grossPrice = n(
                job.original_price ??
                job.discounted_price
            );

            const totalPrice = n(
                job.discounted_price ??
                job.original_price
            );

            const discountAmount = Math.max(
                0,
                grossPrice - totalPrice
            );

            const servicesSelected = String(
                job.services_selected ||
                job.device ||
                ''
            );

            const serviceNames = servicesSelected
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const isInspectionJob =
                !!job.is_inspection_job ||
                serviceNames.some(
                    name =>
                        name.toLowerCase() ===
                        'other issue'
                );

            this.isInspectionJob =
                isInspectionJob;

            this.billInspectionFee =
                inspectionFee;

            this.billDiscountAmount =
                discountAmount;

            let priceMap = null;

            if (job.service_price_breakdown) {
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
                        typeof parsed === 'object'
                    ) {
                        priceMap = parsed;
                    }
                } catch (e) {
                    priceMap = null;
                }
            }

            const fixedServiceNames =
                serviceNames.filter(
                    name =>
                        name.toLowerCase() !==
                        'other issue'
                );

            const fixedTotal =
                isInspectionJob
                    ? Math.max(
                        0,
                        totalPrice -
                        inspectionFee
                    )
                    : totalPrice;

            const lineItems = [];

            if (fixedServiceNames.length > 0) {
                if (priceMap) {
                    fixedServiceNames.forEach(
                        name => {
                            const price = n(
                                priceMap[name]
                            );

                            if (price > 0) {
                                lineItems.push({
                                    type: 'simple',
                                    name: name,
                                    desc: job.category
                                        ? `${job.category} • Booked Service`
                                        : 'Booked Service',
                                    price: price
                                });
                            }
                        }
                    );
                } else {
                    const per =
                        fixedServiceNames.length
                            ? fixedTotal /
                              fixedServiceNames.length
                            : 0;

                    fixedServiceNames.forEach(
                        name => {
                            lineItems.push({
                                type: 'simple',
                                name: name,
                                desc: job.category
                                    ? `${job.category} • Booked Service`
                                    : 'Booked Service',
                                price: per
                            });
                        }
                    );
                }
            } else if (
                !isInspectionJob &&
                totalPrice > 0
            ) {
                lineItems.push({
                    type: 'simple',
                    name:
                        job.service_name ||
                        job.category ||
                        'Booked Service',
                    desc:
                        'Original booked service',
                    price: totalPrice
                });
            }

            const quoteTotal = n(
                job.quoted_amount ||
                (
                    n(job.quoted_labour) +
                    n(job.quoted_material) +
                    n(job.quoted_extra)
                )
            );

            if (
                quoteTotal > 0 &&
                (
                    job.quote_status ===
                    'approved' ||
                    isInspectionJob
                )
            ) {
                lineItems.push({
                    type: 'quote',
                    name:
                        'Additional Service / Repair',
                    desc:
                        job.other_issue ||
                        'New service requested during the booking.',
                    workDesc:
                        job.quote_description || '',
                    labour:
                        n(job.quoted_labour),
                    material:
                        n(job.quoted_material),
                    extra:
                        n(job.quoted_extra),
                    price: quoteTotal
                });
            }

            const additionalIssue =
                String(
                    job.additional_issue || ''
                ).trim();

            const additionalIssuePrice =
                n(job.additional_issue_price);

            if (
                additionalIssue &&
                additionalIssuePrice > 0
            ) {
                lineItems.push({
                    type:
                        'additional_issue',
                    name:
                        'Additional Issue',
                    desc:
                        additionalIssue,
                    price:
                        additionalIssuePrice
                });
            }

            this.billLineItems =
                lineItems;

            this.billQuoteAmount =
                quoteTotal;

            this.billSubtotal =
                lineItems.reduce(
                    (sum, item) =>
                        sum + n(item.price),
                    0
                );

            this.billPlatformFee =
                isInspectionJob
                    ? 0
                    : 49;

            this.billGrandTotal =
                Math.max(
                    0,
                    this.billSubtotal -
                    discountAmount
                ) +
                this.billPlatformFee;

            this.finalPayableAmount =
                this.calculateFinalBillAmount(
                    job
                );

            this.payableAmount =
                this.finalPayableAmount;

            if (this.isPaymentComplete) {
                this.billBalancePaid =
                    this.finalPayableAmount;

                this.billAdvancePaid =
                    Math.max(
                        0,
                        this.billGrandTotal -
                        this.finalPayableAmount
                    );
            } else {
                this.billBalancePaid = 0;

                this.billAdvancePaid =
                    Math.max(
                        0,
                        this.billGrandTotal -
                        this.finalPayableAmount
                    );
            }

            this.billRefundDue = 0;

            this.billAmountInWords =
                this.numberToWords(
                    this.billGrandTotal
                );
        },

        async checkLoyaltyReward(userId) {
            if (
                this.loyaltyChecked ||
                !userId
            ) {
                return;
            }

            this.loyaltyChecked = true;

            try {
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

                const code =
                    'LOYAL' +
                    Math.floor(
                        1000 +
                        Math.random() *
                        9000
                    );

                const expiry =
                    new Date();

                expiry.setDate(
                    expiry.getDate() +
                    60
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
                            new Date().toISOString(),
                        user_id: userId,
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

        numberToWords(num) {
            num = Math.round(
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
                            Math.floor(n / 10)
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

        async openBillModal() {
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

                this.fullJobData = job;

                if (job.tech_id) {
                    const {
                        data: tech,
                        error: techError
                    } = await sb
                        .from('technicians')
                        .select(
                            'tech_id, name, phone, image_url'
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
                        this.billTechId =
                            tech.tech_id ||
                            tech.id
                                ?.slice(
                                    0,
                                    8
                                )
                                .toUpperCase() ||
                            'N/A';

                        if (!this.techData) {
                            this.techData =
                                tech;
                        }
                    } else {
                        this.billTechId =
                            String(
                                job.tech_id
                            )
                                .slice(
                                    0,
                                    8
                                )
                                .toUpperCase();
                    }
                }

                this.billServiceName =
                    job.service_name ||
                    job.category ||
                    'Expert Service';

                this.billVariantName =
                    job.variant_name ||
                    job.device ||
                    'Service';

                this.paymentStatus =
                    String(
                        job.payment_status ||
                        this.paymentStatus ||
                        'UNPAID'
                    ).toUpperCase();

                this.quoteStatus =
                    job.quote_status ||
                    this.quoteStatus ||
                    '';

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

                this.updateBillAmounts(
                    job
                );

                this.$nextTick(() => {
                    this.showBill = true;
                });

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

        downloadPDF() {
            this.isPrinting = true;

            const element =
                document.getElementById(
                    'invoice-content'
                );

            const opt = {
                margin: 0.5,
                filename:
                    `FixZen_Invoice_${this.jobId
                        .slice(0, 6)
                        .toUpperCase()}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true
                },
                jsPDF: {
                    unit: 'in',
                    format: 'letter',
                    orientation: 'portrait'
                }
            };

            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => {
                    this.isPrinting = false;
                })
                .catch(err => {
                    console.error(err);
                    this.isPrinting = false;

                    alert(
                        'Error generating PDF. Please try again.'
                    );
                });
        },

        startTimer() {
            this.timerInterval =
                setInterval(() => {
                    this.secondsElapsed++;
                }, 1000);
        },

        get formattedTime() {
            const m =
                Math.floor(
                    this.secondsElapsed /
                    60
                )
                    .toString()
                    .padStart(2, '0');

            const s =
                (
                    this.secondsElapsed %
                    60
                )
                    .toString()
                    .padStart(2, '0');

            return `${m}:${s}`;
        },

        get searchMessage() {
            if (
                this.secondsElapsed <
                15
            ) {
                return 'Alerting nearby experts...';
            }

            if (
                this.secondsElapsed <
                45
            ) {
                return 'Connecting with top-rated pros...';
            }

            return 'High demand. Still searching...';
        },

        async checkJobStatus() {
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
                    'Error fetching job:',
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
                    String(
                        job.payment_status
                    ).toUpperCase();
            }

            if (job.quote_status) {
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
            }

            if (job.tech_id) {
                await this.fetchTechnician(
                    job.tech_id
                );
            }

            if (
                this.isPaymentComplete &&
                (
                    job.completion_otp ||
                    job.otp
                )
            ) {
                this.otpCode =
                    job.completion_otp ||
                    job.otp;
            } else {
                this.otpCode = null;
            }

            this.updateBillAmounts(
                job
            );

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

        async fetchTechnician(techId) {
            const {
                data: tech,
                error
            } = await sb
                .from('technicians')
                .select('*')
                .eq('id', techId)
                .single();

            if (error) {
                console.error(
                    'Error fetching technician:',
                    error
                );
                return;
            }

            if (!tech) return;

            this.techData = tech;
            this.technicianFound = true;

            if (this.timerInterval) {
                clearInterval(
                    this.timerInterval
                );
            }

            if (
                this.jobStatus !==
                    'completed' &&
                !this.otpCode
            ) {
                this.$nextTick(() => {
                    this.initMap();
                });
            }
        },

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
                ).setView(
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
                    maxZoom: 19
                }
            ).addTo(
                this.map
            );

            const customerIcon =
                L.divIcon({
                    html:
                        `<div class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i class="fa-solid fa-house text-xs"></i></div>`,
                    className: '',
                    iconSize: [
                        32,
                        32
                    ],
                    iconAnchor: [
                        16,
                        32
                    ]
                });

            const techIcon =
                L.divIcon({
                    html:
                        `<div class="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white relative"><div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-50"></div><i class="fa-solid fa-truck-fast text-sm relative z-10"></i></div>`,
                    className: '',
                    iconSize: [
                        40,
                        40
                    ],
                    iconAnchor: [
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
            ).addTo(
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
                ).addTo(
                    this.map
                );

            const bounds =
                L.latLngBounds([
                    [
                        customerLat,
                        customerLng
                    ],
                    [
                        techLat,
                        techLng
                    ]
                ]);

            this.map.fitBounds(
                bounds,
                {
                    padding: [
                        30,
                        30
                    ]
                }
            );

            const interval =
                setInterval(() => {
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
                            ) * 0.08;

                        techLng +=
                            (
                                customerLng -
                                techLng
                            ) * 0.08;

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
                            this.etaMins > 1
                        ) {
                            this.etaMins--;
                        }
                    } else {
                        clearInterval(
                            interval
                        );
                    }
                }, 2000);
        },

        async cancelJob() {
            if (
                !confirm(
                    'Cancel your search?'
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

        async acceptQuote() {
            if (
                !confirm(
                    'Approve this quote? The technician will begin work immediately.'
                )
            ) {
                return;
            }

            const finalAmount =
                Math.max(
                    0,
                    this.quoteAmount -
                    this.inspectionFee
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
                        customer_price:
                            finalAmount,
                        status:
                            'in_progress'
                    })
                    .eq(
                        'id',
                        this.jobId
                    );

                if (error) {
                    throw error;
                }

                this.showQuoteCard =
                    false;

                this.quoteStatus =
                    'approved';

                await this.refreshJobData();

                alert(
                    `✅ Quote Approved!\n\n` +
                    `Total Quote: ₹${this.quoteAmount}\n` +
                    `Inspection Fee Paid: ₹${this.inspectionFee}\n` +
                    `Amount Due After Job: ₹${finalAmount}\n\n` +
                    `The technician will now start the repair work.`
                );

            } catch (err) {
                console.error(
                    'Error approving quote:',
                    err
                );

                alert(
                    'Error approving quote: ' +
                    err.message
                );
            }
        },

        async rejectQuote() {
            prompt(
                'Please share why you\'re rejecting this quote (optional):'
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
                    'Quote rejected. Your booking has been closed. The inspection fee paid (₹' +
                    this.inspectionFee +
                    ') is non-refundable as the technician visited your location.'
                );

                window.location.href =
                    'index.html';

            } catch (err) {
                console.error(
                    'Error rejecting quote:',
                    err
                );

                alert(
                    'Error rejecting quote: ' +
                    err.message
                );
            }
        },

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
                        icon: '⚡',
                        label: 'Fast Arrival'
                    },
                    {
                        icon: '👔',
                        label: 'Professional'
                    },
                    {
                        icon: '✨',
                        label: 'Clean Work'
                    },
                    {
                        icon: '😊',
                        label: 'Polite'
                    },
                    {
                        icon: '🔧',
                        label: 'Genuine Parts'
                    },
                    {
                        icon: '💯',
                        label: 'Worth Every Rupee'
                    }
                ];
            }

            if (
                this.feedbackRating ===
                3
            ) {
                return [
                    {
                        icon: '⏱️',
                        label: 'On Time'
                    },
                    {
                        icon: '👍',
                        label: 'Decent Work'
                    },
                    {
                        icon: '📞',
                        label: 'Good Communication'
                    }
                ];
            }

            return [
                {
                    icon: '⏰',
                    label: 'Late Arrival'
                },
                {
                    icon: '🔁',
                    label: 'Needs Redo'
                },
                {
                    icon: '📵',
                    label: 'Poor Communication'
                },
                {
                    icon: '💸',
                    label: 'Overcharged'
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
                        t => t !== tag
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
                    `left:${Math.random() * 100}vw;top:-20px;width:${Math.random() * 8 + 5}px;height:${Math.random() * 8 + 5}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-duration:${Math.random() * 2 + 1.5}s;animation-delay:${Math.random() * 0.8}s;`;

                document.body.appendChild(
                    p
                );

                setTimeout(
                    () =>
                        p.remove(),
                    4000
                );
            }
        },

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
                    'Session identity missing. Please login again.'
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
                        'Profile identity reference missing.'
                    );
                }

                const combinedComment =
                    this.feedbackTags
                        .length > 0
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

                if (
                    feedbackError
                ) {
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
                console.error(err);

                alert(
                    'Review Submission Error: ' +
                    err.message
                );
            } finally {
                this.feedbackLoading =
                    false;
            }
        }
    }));
});
