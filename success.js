const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function trackingApp() {
  return {
    // =========================================================
    // JOB
    // =========================================================
    jobId: null,
    jobStatus: 'pending',

    // Original/base price
    payableAmount: 299,

    // Final payment values
    finalServicePrice: 0,
    finalPayableAmount: 0,

    // Quote state
    isQuoteJob: false,
    showQuoteCard: false,
    quoteStatus: null,

    quoteLabour: 0,
    quoteMaterial: 0,
    quoteExtra: 0,
    quoteAmount: 0,
    quoteDescription: '',

    // Inspection fee already paid
    inspectionFee: 99,

    // =========================================================
    // PAYMENT
    // =========================================================
    canShowPayment: false,
    paymentConfirmed: false,
    paidAmount: 0,
    paymentMethod: '',
    paymentLoading: false,

    // =========================================================
    // TECHNICIAN / TRACKING
    // =========================================================
    otpCode: null,
    technicianFound: false,
    techData: null,
    fullJobData: null,

    etaMins: '15',
    searchMessage: 'Searching for nearby technicians...',
    formattedTime: '00:00',
    timerInterval: null,
    secondsElapsed: 0,

    // =========================================================
    // LOYALTY / FEEDBACK
    // =========================================================
    loyaltyReward: null,

    showFeedback: false,
    feedbackStep: 1,
    feedbackRating: 0,
    feedbackTags: [],
    feedbackComment: '',
    feedbackLoading: false,
    feedbackDone: false,

    // =========================================================
    // BILL
    // =========================================================
    showBill: false,
    isPrinting: false,

    billLineItems: [],
    billSubtotal: 0,
    billPlatformFee: 0,
    billDiscountAmount: 0,
    billGrandTotal: 0,
    billTechId: 'N/A',

    // =========================================================
    // INITIALIZATION
    // =========================================================
    async init() {
      const urlParams = new URLSearchParams(window.location.search);

      this.jobId =
        urlParams.get('job_id') ||
        localStorage.getItem('active_job_id');

      if (!this.jobId) {
        alert("No active booking found.");
        window.location.href = "index.html";
        return;
      }

      localStorage.setItem('active_job_id', this.jobId);

      this.startSearchTimer();

      await this.fetchJobDetails();

      this.subscribeRealtimeJob();
    },

    // =========================================================
    // TIMER
    // =========================================================
    startSearchTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      this.timerInterval = setInterval(() => {
        this.secondsElapsed++;

        const mins = Math.floor(this.secondsElapsed / 60)
          .toString()
          .padStart(2, '0');

        const secs = (this.secondsElapsed % 60)
          .toString()
          .padStart(2, '0');

        this.formattedTime = `${mins}:${secs}`;
      }, 1000);
    },

    // =========================================================
    // FETCH JOB
    // =========================================================
    async fetchJobDetails() {
      try {
        const {
          data: job,
          error
        } = await sb
          .from('jobs')
          .select('*')
          .eq('id', this.jobId)
          .single();

        if (error) {
          console.error("Job fetch error:", error);
          return;
        }

        if (!job) {
          console.error("Job not found.");
          return;
        }

        this.fullJobData = job;

        this.jobStatus = job.status || 'pending';

        // Apply all price/payment logic
        this.applyPriceAndPaymentState(job);

        // Technician
        if (job.tech_id) {
          this.technicianFound = true;

          await this.fetchTechnicianDetails(job.tech_id);
        }

        // Quote details
        this.loadQuoteData(job);

        // Completion code
        // NEVER show OTP before payment.
        if (
          this.paymentConfirmed &&
          (job.completion_otp || job.otp)
        ) {
          this.otpCode =
            job.completion_otp ||
            job.otp;
        } else {
          this.otpCode = null;
        }

        // Invoice
        this.setupInvoiceItems(job);

      } catch (err) {
        console.error("Fetch job error:", err);
      }
    },

    // =========================================================
    // TECHNICIAN DETAILS
    // =========================================================
    async fetchTechnicianDetails(techId) {
      try {
        const {
          data: tech,
          error
        } = await sb
          .from('technicians')
          .select('*')
          .eq('id', techId)
          .maybeSingle();

        if (error) {
          console.error("Technician fetch error:", error);
          return;
        }

        if (tech) {
          this.techData = tech;

          this.billTechId =
            tech.tech_id ||
            'N/A';
        }

      } catch (err) {
        console.error("Fetch tech error:", err);
      }
    },

    // =========================================================
    // REALTIME JOB LISTENER
    // =========================================================
    subscribeRealtimeJob() {
      sb.channel(`customer_job_${this.jobId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'jobs',
            filter: `id=eq.${this.jobId}`
          },
          async (payload) => {

            const updatedJob = payload.new;

            if (!updatedJob) return;

            this.fullJobData = updatedJob;

            this.jobStatus =
              updatedJob.status ||
              'pending';

            // Recalculate everything
            this.applyPriceAndPaymentState(
              updatedJob
            );

            // Load quote
            this.loadQuoteData(
              updatedJob
            );

            // Technician
            if (
              updatedJob.tech_id &&
              !this.techData
            ) {
              this.technicianFound = true;

              await this.fetchTechnicianDetails(
                updatedJob.tech_id
              );
            }

            // Completion code is ONLY visible
            // after payment has been confirmed.
            if (
              this.paymentConfirmed &&
              (
                updatedJob.completion_otp ||
                updatedJob.otp
              )
            ) {
              this.otpCode =
                updatedJob.completion_otp ||
                updatedJob.otp;
            } else {
              this.otpCode = null;
            }

            // Update invoice
            this.setupInvoiceItems(
              updatedJob
            );
          }
        )
        .subscribe();
    },

    // =========================================================
    // PRICE + PAYMENT STATE
    // =========================================================
    applyPriceAndPaymentState(job) {

      // -------------------------------------------------------
      // BASE / FIXED PRICE
      // -------------------------------------------------------
      const basePrice =
        parseFloat(job.original_price) ||
        parseFloat(job.payable_amount) ||
        parseFloat(job.price) ||
        299;

      // -------------------------------------------------------
      // QUOTE PRICE
      // -------------------------------------------------------
      const quoteAmount =
        parseFloat(job.quoted_amount) ||
        0;

      // -------------------------------------------------------
      // DETERMINE WHETHER THIS IS A QUOTE JOB
      // -------------------------------------------------------
      this.isQuoteJob =
        quoteAmount > 0 ||
        job.quote_status === 'submitted' ||
        job.quote_status === 'approved';

      // -------------------------------------------------------
      // FINAL SERVICE PRICE
      //
      // Fixed job:
      //     technician accepts
      //     => fixed price
      //
      // Quote job:
      //     technician sends quote
      //     => customer approves
      //     => approved quote becomes final price
      // -------------------------------------------------------
      if (this.isQuoteJob) {
        this.finalServicePrice =
          quoteAmount;
      } else {
        this.finalServicePrice =
          basePrice;
      }

      // -------------------------------------------------------
      // INSPECTION FEE
      // -------------------------------------------------------
      const inspection =
        parseFloat(job.inspection_fee);

      if (
        Number.isFinite(inspection) &&
        inspection >= 0
      ) {
        this.inspectionFee = inspection;
      }

      // -------------------------------------------------------
      // AMOUNT CUSTOMER PAYS NOW
      //
      // FIXED JOB:
      //     Service price = ₹X
      //     Pay now = ₹X
      //
      // QUOTE JOB:
      //     Quote = ₹X
      //     Inspection already paid = ₹99
      //     Pay now = ₹X - ₹99
      // -------------------------------------------------------
      if (this.isQuoteJob) {

        this.finalPayableAmount =
          Math.max(
            0,
            this.finalServicePrice -
            this.inspectionFee
          );

      } else {

        this.finalPayableAmount =
          Math.max(
            0,
            this.finalServicePrice
          );
      }

      // Keep old variable synchronized
      this.payableAmount =
        this.finalPayableAmount;

      // -------------------------------------------------------
      // PAYMENT STATUS
      // -------------------------------------------------------
      this.paymentConfirmed =
        job.payment_status === 'paid';

      this.paidAmount =
        parseFloat(job.paid_amount) ||
        (
          this.paymentConfirmed
            ? this.finalPayableAmount
            : 0
        );

      this.paymentMethod =
        job.payment_method ||
        '';

      // -------------------------------------------------------
      // TECHNICIAN ACCEPTANCE
      // -------------------------------------------------------
      const technicianAccepted =
        !!job.tech_id &&
        [
          'accepted',
          'assigned',
          'arrived',
          'started',
          'in_progress'
        ].includes(
          job.status
        );

      // -------------------------------------------------------
      // QUOTE APPROVAL
      // -------------------------------------------------------
      const quoteApproved =
        !this.isQuoteJob ||
        job.quote_status === 'approved';

      // -------------------------------------------------------
      // PAYMENT CAN ONLY APPEAR WHEN:
      //
      // 1. Technician accepted
      // 2. Quote approved if quote exists
      // 3. Payment is not already done
      // -------------------------------------------------------
      this.canShowPayment =
        technicianAccepted &&
        quoteApproved &&
        !this.paymentConfirmed;

      // -------------------------------------------------------
      // QUOTE CARD
      // -------------------------------------------------------
      this.showQuoteCard =
        this.isQuoteJob &&
        job.quote_status === 'submitted' &&
        !this.paymentConfirmed;

      // -------------------------------------------------------
      // NEVER SHOW COMPLETION CODE BEFORE PAYMENT
      // -------------------------------------------------------
      if (!this.paymentConfirmed) {
        this.otpCode = null;
      }
    },

    // =========================================================
    // LOAD QUOTE DATA
    // =========================================================
    loadQuoteData(job) {

      this.quoteStatus =
        job.quote_status ||
        null;

      this.quoteAmount =
        parseFloat(job.quoted_amount) ||
        0;

      this.quoteLabour =
        parseFloat(job.quote_labour) ||
        parseFloat(job.labour_amount) ||
        0;

      this.quoteMaterial =
        parseFloat(job.quote_material) ||
        parseFloat(job.material_amount) ||
        0;

      this.quoteExtra =
        parseFloat(job.quote_extra) ||
        parseFloat(job.extra_amount) ||
        0;

      this.quoteDescription =
        job.quote_description ||
        '';

      const inspection =
        parseFloat(job.inspection_fee);

      if (
        Number.isFinite(inspection) &&
        inspection >= 0
      ) {
        this.inspectionFee =
          inspection;
      }
    },

    // =========================================================
    // APPROVE QUOTE
    // =========================================================
    async acceptQuote() {

      if (!this.jobId) {
        alert("Invalid job.");
        return;
      }

      if (!this.quoteAmount) {
        alert("No quote amount available.");
        return;
      }

      try {

        const {
          data,
          error
        } = await sb
          .from('jobs')
          .update({
            quote_status: 'approved',
            customer_approved: true
          })
          .eq('id', this.jobId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        this.fullJobData =
          data ||
          this.fullJobData;

        this.quoteStatus =
          'approved';

        this.showQuoteCard =
          false;

        this.applyPriceAndPaymentState(
          data ||
          this.fullJobData
        );

        alert(
          `Quote approved.\n\nFinal amount to pay: ₹${this.finalPayableAmount.toFixed(2)}`
        );

      } catch (err) {

        console.error(
          'Quote approval error:',
          err
        );

        alert(
          'Could not approve the quote: ' +
          (
            err.message ||
            'Unknown error'
          )
        );
      }
    },

    // =========================================================
    // REJECT QUOTE
    // =========================================================
    async rejectQuote() {

      if (!this.jobId) {
        return;
      }

      const confirmed =
        confirm(
          'Reject this quote and stop the quoted service?'
        );

      if (!confirmed) {
        return;
      }

      try {

        const {
          data,
          error
        } = await sb
          .from('jobs')
          .update({
            quote_status: 'rejected',
            customer_approved: false
          })
          .eq('id', this.jobId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        this.fullJobData =
          data ||
          this.fullJobData;

        this.quoteStatus =
          'rejected';

        this.showQuoteCard =
          false;

        this.canShowPayment =
          false;

        alert(
          'Quote rejected.'
        );

      } catch (err) {

        console.error(
          'Quote rejection error:',
          err
        );

        alert(
          'Could not reject the quote: ' +
          (
            err.message ||
            'Unknown error'
          )
        );
      }
    },

    // =========================================================
    // PAYMENT
    // =========================================================
    async payNow(method = 'UPI') {

      if (
        this.paymentLoading ||
        this.paymentConfirmed
      ) {
        return;
      }

      // Payment must not be available
      // before technician acceptance.
      if (!this.canShowPayment) {

        alert(
          'Payment is not available yet.\n\nThe technician must accept the job first.'
        );

        return;
      }

      const amount =
        Number(
          this.finalPayableAmount
        );

      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {

        alert(
          'Invalid payable amount.'
        );

        return;
      }

      // -------------------------------------------------------
      // UPI CONFIRMATION
      //
      // IMPORTANT:
      // This is NOT a real payment gateway.
      // Replace with Razorpay/other gateway in production.
      // -------------------------------------------------------
      if (method === 'UPI') {

        const confirmed =
          confirm(
            `Final amount to pay: ₹${amount.toFixed(2)}\n\n` +
            `Proceed with UPI payment?\n\n` +
            `For production, connect this action to your verified payment gateway.`
          );

        if (!confirmed) {
          return;
        }
      }

      // -------------------------------------------------------
      // CASH CONFIRMATION
      // -------------------------------------------------------
      if (method === 'Cash') {

        const confirmed =
          confirm(
            `Confirm that you paid ₹${amount.toFixed(2)} in cash to the technician?`
          );

        if (!confirmed) {
          return;
        }
      }

      this.paymentLoading =
        true;

      try {

        // -----------------------------------------------------
        // SAVE PAYMENT
        // -----------------------------------------------------
        const {
          data,
          error
        } = await sb
          .from('jobs')
          .update({
            payment_status: 'paid',
            paid_amount: amount,
            payment_method: method,
            payment_at:
              new Date().toISOString()
          })
          .eq('id', this.jobId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        this.fullJobData =
          data ||
          this.fullJobData;

        this.paymentConfirmed =
          true;

        this.paidAmount =
          amount;

        this.paymentMethod =
          method;

        this.canShowPayment =
          false;

        // -----------------------------------------------------
        // ONLY AFTER PAYMENT:
        // show completion OTP
        // -----------------------------------------------------
        if (
          data &&
          (
            data.completion_otp ||
            data.otp
          )
        ) {

          this.otpCode =
            data.completion_otp ||
            data.otp;

        } else {

          this.otpCode =
            null;
        }

        // -----------------------------------------------------
        // UPDATE BILL
        // -----------------------------------------------------
        this.setupInvoiceItems(
          data ||
          this.fullJobData
        );

        alert(
          `Payment confirmed successfully.\n\n` +
          `Amount Paid: ₹${amount.toFixed(2)}\n` +
          `Payment Method: ${method}\n\n` +
          `The completion code is now available.`
        );

      } catch (err) {

        console.error(
          'Payment error:',
          err
        );

        alert(
          'Payment could not be confirmed: ' +
          (
            err.message ||
            'Unknown error'
          )
        );

      } finally {

        this.paymentLoading =
          false;
      }
    },

    // =========================================================
    // INVOICE / BILL
    // =========================================================
    setupInvoiceItems(job) {

      if (!job) {
        return;
      }

      // -------------------------------------------------------
      // BILL MUST USE ACTUAL PAID AMOUNT
      // AFTER PAYMENT.
      // -------------------------------------------------------
      let price = 0;

      if (
        job.payment_status === 'paid' &&
        parseFloat(job.paid_amount) >= 0
      ) {

        price =
          parseFloat(
            job.paid_amount
          );

      } else if (
        this.paymentConfirmed
      ) {

        price =
          parseFloat(
            this.paidAmount
          );

      } else {

        // Before payment, do not treat this
        // as a final settled invoice.
        price = 0;
      }

      this.billLineItems = [];

      // Only create settled bill items after payment.
      if (
        job.payment_status === 'paid' ||
        this.paymentConfirmed
      ) {

        this.billLineItems = [
          {
            name:
              job.category ||
              'Home Repair Service',

            desc:
              job.issue ||
              'Service completed',

            price:
              price,

            type:
              'standard'
          }
        ];
      }

      this.billSubtotal =
        price;

      this.billGrandTotal =
        price;
    },

    // =========================================================
    // FEEDBACK
    // =========================================================
    setFeedbackRating(r) {
      this.feedbackRating =
        r;
    },

    // =========================================================
    // FEEDBACK TAGS
    // =========================================================
    getFeedbackTags() {

      return [
        {
          label: 'On Time',
          icon: '⚡'
        },
        {
          label: 'Clean Work',
          icon: '✨'
        },
        {
          label: 'Polite',
          icon: '😊'
        },
        {
          label: 'Expert Knowledge',
          icon: '🛠️'
        }
      ];
    },

    // =========================================================
    // TOGGLE FEEDBACK TAG
    // =========================================================
    toggleFeedbackTag(tag) {

      if (
        this.feedbackTags.includes(tag)
      ) {

        this.feedbackTags =
          this.feedbackTags.filter(
            t => t !== tag
          );

      } else {

        this.feedbackTags.push(tag);
      }
    },

    // =========================================================
    // SUBMIT FEEDBACK
    // =========================================================
    async submitFeedback() {

      this.feedbackLoading =
        true;

      try {

        const {
          error
        } = await sb
          .from('reviews')
          .insert([
            {
              job_id:
                this.jobId,

              rating:
                this.feedbackRating,

              comment:
                this.feedbackComment,

              tags:
                this.feedbackTags
            }
          ]);

        if (error) {
          throw error;
        }

        this.feedbackDone =
          true;

        this.feedbackStep =
          'done';

      } catch (err) {

        console.error(
          "Feedback error:",
          err
        );

        alert(
          "Failed to submit review."
        );

      } finally {

        this.feedbackLoading =
          false;
      }
    },

    // =========================================================
    // CANCEL JOB
    // =========================================================
    async cancelJob() {

      const confirmed =
        confirm(
          "Are you sure you want to cancel this request?"
        );

      if (!confirmed) {
        return;
      }

      try {

        const {
          error
        } = await sb
          .from('jobs')
          .update({
            status: 'cancelled'
          })
          .eq(
            'id',
            this.jobId
          );

        if (error) {
          throw error;
        }

        alert(
          "Job request cancelled."
        );

        window.location.href =
          "index.html";

      } catch (err) {

        alert(
          "Could not cancel job: " +
          err.message
        );
      }
    },

    // =========================================================
    // OPEN BILL
    // =========================================================
    openBillModal() {

      if (!this.paymentConfirmed) {

        alert(
          'The bill will be available after payment is confirmed and the service is completed.'
        );

        return;
      }

      this.showBill =
        true;
    },

    // =========================================================
    // DOWNLOAD PDF
    // =========================================================
    downloadPDF() {

      if (!this.paymentConfirmed) {

        alert(
          'Invoice is available only after payment.'
        );

        return;
      }

      this.isPrinting =
        true;

      const element =
        document.getElementById(
          'invoice-content'
        );

      if (!element) {

        this.isPrinting =
          false;

        alert(
          'Invoice content not found.'
        );

        return;
      }

      const opt = {

        margin:
          0.5,

        filename:
          `Invoice_FXN_${this.jobId.slice(0, 8)}.pdf`,

        image: {
          type:
            'jpeg',

          quality:
            0.98
        },

        html2canvas: {
          scale:
            2
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
        .then(() => {

          this.isPrinting =
            false;

        })
        .catch((err) => {

          console.error(
            'PDF error:',
            err
          );

          this.isPrinting =
            false;

          alert(
            'Could not generate invoice PDF.'
          );
        });
    }
  };
}