const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function trackingApp() {
  return {
    jobId: null,
    jobStatus: 'pending',
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
        
        this.payableAmount = job.original_price 
          || job.payable_amount 
          || job.quoted_amount 
          || job.price 
          || 299;

        // Directly display OTP if available in DB
        if (job.completion_otp || job.otp) {
          this.otpCode = job.completion_otp || job.otp;
        }

        if (job.tech_id) {
          this.technicianFound = true;
          await this.fetchTechnicianDetails(job.tech_id);
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

          this.payableAmount = updatedJob.original_price 
            || updatedJob.payable_amount 
            || updatedJob.quoted_amount 
            || updatedJob.price 
            || 299;

          if (updatedJob.tech_id && !this.techData) {
            this.technicianFound = true;
            await this.fetchTechnicianDetails(updatedJob.tech_id);
          }

          // Real-time listener captures completion code directly from DB update
          if (updatedJob.completion_otp || updatedJob.otp) {
            this.otpCode = updatedJob.completion_otp || updatedJob.otp;
          }

          this.setupInvoiceItems(updatedJob);
        })
        .subscribe();
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
