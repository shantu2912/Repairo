const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE"; // Replace with your actual Razorpay Key ID

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function trackingApp() {
  return {
    jobId: null,
    jobStatus: 'pending',
    paymentStatus: 'pending',
    payableAmount: 299,
    otpCode: null,
    technicianFound: false,
    techData: null,
    fullJobData: null,
    etaMins: '15',
    searchMessage: 'Searching for nearby technicians...',
    formattedTime: '00:00',
    timerInterval: null,
    secondsElapsed: 0,

    showQuoteCard: false,
    quoteStatus: null,
    quoteLabour: 0,
    quoteMaterial: 0,
    quoteExtra: 0,
    quoteAmount: 0,
    inspectionFee: 99,
    quoteDescription: '',

    loyaltyReward: null,
    showFeedback: false,
    feedbackStep: 1,
    feedbackRating: 0,
    feedbackTags: [],
    feedbackComment: '',
    feedbackLoading: false,
    feedbackDone: false,

    showBill: false,
    isPrinting: false,

    async init() {
      const urlParams = new URLSearchParams(window.location.search);
      this.jobId = urlParams.get('job_id') || localStorage.getItem('active_job_id');

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

    startSearchTimer() {
      this.timerInterval = setInterval(() => {
        this.secondsElapsed++;
        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.formattedTime = `${mins}:${secs}`;
      }, 1000);
    },

    async fetchJobDetails() {
      try {
        const { data: job, error } = await sb
          .from('jobs')
          .select('*')
          .eq('id', this.jobId)
          .single();

        if (error || !job) return;

        this.fullJobData = job;
        this.jobStatus = job.status || 'pending';
        this.paymentStatus = job.payment_status || 'pending';
        
        this.payableAmount = job.original_price 
          || job.payable_amount 
          || job.quoted_amount 
          || job.price 
          || 299;

        if (job.completion_otp || job.otp) {
          if (this.paymentStatus === 'PAID' || this.jobStatus === 'completed') {
            this.otpCode = job.completion_otp || job.otp;
          }
        }

        if (job.tech_id) {
          this.technicianFound = true;
          await this.fetchTechnicianDetails(job.tech_id);
        }

        if (this.paymentStatus === 'PENDING_CUSTOMER_PAYMENT' && !this.otpCode && this.jobStatus !== 'completed') {
          this.triggerRazorpayCheckout();
        }
      } catch (err) {
        console.error("Fetch job error:", err);
      }
    },

    async fetchTechnicianDetails(techId) {
      try {
        const { data: tech } = await sb
          .from('technicians')
          .select('*')
          .eq('id', techId)
          .maybeSingle();

        if (tech) {
          this.techData = tech;
        }
      } catch (err) {
        console.error("Fetch tech error:", err);
      }
    },

    subscribeRealtimeJob() {
      sb.channel(`customer_job_${this.jobId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${this.jobId}`
        }, async (payload) => {
          const updatedJob = payload.new;
          this.fullJobData = updatedJob;
          this.jobStatus = updatedJob.status;
          this.paymentStatus = updatedJob.payment_status;

          this.payableAmount = updatedJob.original_price 
            || updatedJob.payable_amount 
            || updatedJob.quoted_amount 
            || updatedJob.price 
            || 299;

          if (updatedJob.tech_id && !this.techData) {
            this.technicianFound = true;
            await this.fetchTechnicianDetails(updatedJob.tech_id);
          }

          if (updatedJob.payment_status === 'PENDING_CUSTOMER_PAYMENT' && !this.otpCode && this.jobStatus !== 'completed') {
            this.triggerRazorpayCheckout();
          }

          if (updatedJob.payment_status === 'PAID' || updatedJob.status === 'completed') {
            this.otpCode = updatedJob.completion_otp || updatedJob.otp;
          }
        })
        .subscribe();
    },

    triggerRazorpayCheckout() {
      const amountInPaise = Math.round(parseFloat(this.payableAmount) * 100);

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "FixZenix Services",
        description: `Payment for ${this.fullJobData?.category || 'Home Repair'}`,
        prefill: {
          name: this.fullJobData?.customer_name || "Valued Customer",
          contact: this.fullJobData?.phone || "",
        },
        theme: {
          color: "#5D5646"
        },
        handler: async (response) => {
          await this.handlePaymentSuccess(response.razorpay_payment_id);
        },
        modal: {
          ondismiss: () => {
            alert("Payment dismissed. You can click 'Pay Now' anytime to complete your booking.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },

    async handlePaymentSuccess(paymentId) {
      try {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        const { error } = await sb
          .from('jobs')
          .update({
            payment_status: 'PAID',
            payment_id: paymentId,
            completion_otp: generatedOtp,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.jobId);

        if (error) throw error;

        this.paymentStatus = 'PAID';
        this.otpCode = generatedOtp;
        alert("🎉 Payment Successful! Your 6-Digit completion code is now unlocked.");
      } catch (err) {
        console.error("Payment update error:", err);
        alert("Payment was processed, but updating job record failed. Please contact support.");
      }
    },

    async submitFeedback() {
      this.feedbackLoading = true;
      try {
        await sb.from('reviews').insert([{
          job_id: this.jobId,
          rating: this.feedbackRating,
          comment: this.feedbackComment
        }]);

        this.feedbackDone = true;
        this.showFeedback = false;
        alert("Thank you for your feedback!");
      } catch (err) {
        console.error("Feedback error:", err);
        alert("Failed to submit review.");
      } finally {
        this.feedbackLoading = false;
      }
    },

    async cancelJob() {
      if (!confirm("Are you sure you want to cancel this request?")) return;

      try {
        await sb.from('jobs').update({ status: 'cancelled' }).eq('id', this.jobId);
        alert("Job request cancelled.");
        window.location.href = "index.html";
      } catch (err) {
        alert("Could not cancel job: " + err.message);
      }
    },

    openBillModal() {
      this.showBill = true;
    },

    downloadPDF() {
      this.isPrinting = true;
      const element = document.getElementById('invoice-content');
      const opt = {
        margin: 0.5,
        filename: `Invoice_FXN_${this.jobId.slice(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        this.isPrinting = false;
      });
    }
  };
}
