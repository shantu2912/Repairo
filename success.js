const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";

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
    billLineItems: [],
    billSubtotal: 0,
    billPlatformFee: 0,
    billDiscountAmount: 0,
    billGrandTotal: 0,
    billTechId: 'N/A',

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

        this.setupInvoiceItems(job);
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
          this.billTechId = tech.tech_id || 'N/A';
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

          this.setupInvoiceItems(updatedJob);
        })
        .subscribe();
    },

    // Step 1: Call Supabase Edge Function 'smooth-service' to Create Order
    async triggerRazorpayCheckout() {
      try {
        const cleanAmount = parseFloat(this.payableAmount) || 299;

        const { data, error } = await sb.functions.invoke('smooth-service', {
          body: { 
            amount: cleanAmount, 
            jobId: this.jobId,
            customerName: this.fullJobData?.customer_name || "Valued Customer",
            customerPhone: this.fullJobData?.phone || ""
          }
        });

        if (error) {
          console.error("Edge Function 'smooth-service' error:", error);
          throw new Error(error.message || "Failed to initialize payment order");
        }

        const orderId = data?.order_id || data?.id || data?.order?.id;
        const keyId = data?.key_id || data?.razorpay_key_id;

        if (!orderId) {
          throw new Error("Order creation failed: missing order ID from server.");
        }

        const options = {
          key: keyId,
          amount: data?.amount || Math.round(cleanAmount * 100),
          currency: data?.currency || "INR",
          name: "FixZenix Services",
          description: `Payment for ${this.fullJobData?.category || 'Home Repair'}`,
          order_id: orderId,
          prefill: {
            name: this.fullJobData?.customer_name || "Valued Customer",
            contact: this.fullJobData?.phone || "",
          },
          theme: {
            color: "#5D5646"
          },
          handler: async (response) => {
            await this.verifyAndCompletePayment(response);
          },
          modal: {
            ondismiss: () => {
              console.log("Customer closed payment modal.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', (response) => {
          console.error("Razorpay Payment Failure:", response.error);
          alert(`Payment Failed: ${response.error.description || 'Transaction declined.'}`);
        });

        rzp.open();

      } catch (err) {
        console.error("Trigger Razorpay Error:", err);
        alert("Could not open payment gateway: " + err.message);
      }
    },

    // Step 2: Call Supabase Edge Function 'verify-payment' to Verify Signature & Unlock OTP
    async verifyAndCompletePayment(razorpayResponse) {
      try {
        const { data, error } = await sb.functions.invoke('verify-payment', {
          body: {
            jobId: this.jobId,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature
          }
        });

        if (error) {
          console.error("Edge Function 'verify-payment' error:", error);
          throw new Error(error.message || "Payment verification failed");
        }

        this.paymentStatus = 'PAID';
        
        if (data?.completion_otp || data?.otp) {
          this.otpCode = data.completion_otp || data.otp;
        } else {
          await this.fetchJobDetails();
        }

        alert("🎉 Payment Verified! Your 6-digit completion code is unlocked.");

      } catch (err) {
        console.error("Verification error:", err);
        alert("Payment was submitted, but verification failed: " + err.message);
      }
    },

    setupInvoiceItems(job) {
      const price = parseFloat(this.payableAmount) || 299;
      this.billLineItems = [
        {
          name: job.category || 'Home Repair Service',
          desc: job.issue || 'Standard Service Package',
          price: price,
          type: 'standard'
        }
      ];
      this.billSubtotal = price;
      this.billGrandTotal = price;
    },

    setFeedbackRating(r) {
      this.feedbackRating = r;
    },

    getFeedbackTags() {
      return [
        { label: 'On Time', icon: '⚡' },
        { label: 'Clean Work', icon: '✨' },
        { label: 'Polite', icon: '😊' },
        { label: 'Expert Knowledge', icon: '🛠️' }
      ];
    },

    toggleFeedbackTag(tag) {
      if (this.feedbackTags.includes(tag)) {
        this.feedbackTags = this.feedbackTags.filter(t => t !== tag);
      } else {
        this.feedbackTags.push(tag);
      }
    },

    async submitFeedback() {
      this.feedbackLoading = true;
      try {
        await sb.from('reviews').insert([{
          job_id: this.jobId,
          rating: this.feedbackRating,
          comment: this.feedbackComment,
          tags: this.feedbackTags
        }]);

        this.feedbackDone = true;
        this.feedbackStep = 'done';
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
