function dashboardHandler() {
  return {
    tech: null,
    techName: '',
    loading: true,
    jobs: [],
    stats: { activeJobs: 0, earnings: 0, todayEarnings: 0 },
    incomingJob: null,
    available: false,
    notifStatus: 'default',

    enteredOtp: '',
    paymentLoading: false,

    currentLoc: null, 
    locationStatus: 'idle',
    geocodeCache: {}, 
    distancesUpdating: false,

    async init() {
      const savedLang = localStorage.getItem("preferred_language") || "en";
      if (typeof setLanguage === "function") {
        setLanguage(savedLang);
      }
      this.tech = JSON.parse(localStorage.getItem("active_tech"));
      if (!this.tech) {
        window.location.href = "partnerlogin.html";
        return;
      }

      if (!this.tech.tech_id) {
        await this.loadTechId();
      }

      const lockedJobId = localStorage.getItem("locked_job_id");
      if (lockedJobId) {
        window.location.href = "job_detail.html";
        return;
      }

      this.techName = this.tech.name;
      
      await this.loadTechProfile();
      await this.setupNotifications();
      this.registerForegroundHandler();

      await this.fetchJobs();
      this.subscribeRealtime();
      this.updateJobDistances();
    },

    async loadTechId() {
      if (this.tech?.tech_id) return;
      
      try {
        const { data, error } = await window.sb
          .from('technicians')
          .select('tech_id')
          .eq('id', this.tech.id)
          .single();

        if (!error && data?.tech_id) {
          this.tech.tech_id = data.tech_id;
          localStorage.setItem("active_tech", JSON.stringify(this.tech));
        }
      } catch (err) {
        console.error("Failed to load tech_id:", err);
      }
    },

    async loadTechProfile() {
      try {
        const { data, error } = await window.sb
          .from('technicians')
          .select('is_available, image_url')
          .eq('id', this.tech.id)
          .single();

        if (!error && data) {
          this.available = data.is_available ?? false;
          
          if (data.image_url) {
            this.tech.image_url = data.image_url;
            localStorage.setItem("active_tech", JSON.stringify(this.tech));
          }
        }
      } catch (err) {
        console.error("Failed to load tech profile:", err);
      }
    },

    async setupNotifications() {
      try {
        if (!('serviceWorker' in navigator)) {
          this.notifStatus = 'denied';
          return;
        }

        this.notifStatus = Notification.permission;

        if (Notification.permission === 'denied') return;

        let registration;
        try {
          registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
            updateViaCache: 'none'
          });
          await navigator.serviceWorker.ready;
        } catch (swError) {
          return;
        }

        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          this.notifStatus = permission;
          if (permission !== 'granted') return;
        }

        this.notifStatus = 'granted';

        const token = await window.firebaseMessaging.getToken({
          vapidKey: "BBZpS8kGM1KZEP1f0L9TeEM-WHUAKND52kqpPPb-9I1EuWNlXItKHaRGqNkrmOKPzjhvtP3oysjZ8Dq1SuN4yBk",
          serviceWorkerRegistration: registration
        });

        if (token) {
          await this.saveFCMToken(token);
        }
      } catch (err) {
        console.error("Notification setup failed:", err);
      }
    },

    async saveFCMToken(token) {
      await window.sb
        .from("technicians")
        .update({ fcm_token: token })
        .eq("id", this.tech.id);
    },

    registerForegroundHandler() {
      window.firebaseMessaging.onMessage((payload) => {
        this.fetchJobs();
      });
    },

    openMaps(location) {
      const encoded = encodeURIComponent(location);
      window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
    },

    getCurrentLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => reject(new Error(err.message)),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
        );
      });
    },

    calculateDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    async geocodeAddress(address) {
      if (!address) return null;
      if (address in this.geocodeCache) return this.geocodeCache[address];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'FixZenPro/2.0' } }
        );
        const data = await res.json();
        const coords = (data && data.length > 0)
          ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
          : null;
        this.geocodeCache[address] = coords;
        return coords;
      } catch (err) {
        return null;
      }
    },

    async updateJobDistances() {
      if (this.distancesUpdating) return;
      this.distancesUpdating = true;
      this.locationStatus = 'loading';

      try {
        this.currentLoc = await this.getCurrentLocation();
        this.locationStatus = 'ready';
      } catch (err) {
        this.locationStatus = 'unavailable';
        this.distancesUpdating = false;
        return;
      }

      for (const job of this.jobs) {
        if (job.status === 'completed' || !job.location) continue;

        const cached = this.geocodeCache[job.location];
        const coords = cached !== undefined ? cached : await this.geocodeAddress(job.location);

        if (coords) {
          const km = this.calculateDistanceKm(this.currentLoc.lat, this.currentLoc.lng, coords.lat, coords.lng);
          job.distanceKm = km;
          job.distanceText = km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
        } else {
          job.distanceKm = null;
          job.distanceText = null;
        }

        if (cached === undefined) await new Promise(r => setTimeout(r, 1100));
      }

      this.jobs.sort((a, b) => {
        if ((a.status === 'completed') !== (b.status === 'completed')) {
          return a.status === 'completed' ? 1 : -1;
        }
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });

      this.distancesUpdating = false;
    },

    scrollToJobs() {
      document.getElementById('jobsSection')?.scrollIntoView({ behavior: 'smooth' });
    },

    async toggleAvailability(e) {
      const newValue = e.target.checked;
      this.available = newValue;

      const { error } = await window.sb
        .from('technicians')
        .update({ is_available: newValue })
        .eq('id', this.tech.id);

      if (error) {
        this.available = !newValue;
        alert("Failed to update availability. Please try again.");
      }
    },

    async fetchJobs() {
      this.loading = true;
      const { data, error } = await window.sb
        .from("jobs")
        .select("*")
        .or(`and(status.eq.pending,tech_id.is.null),tech_id.eq.${this.tech.id}`)
        .not("rejected_by", "cs", `{${this.tech.id}}`)
        .order("created_at", { ascending: false });

      if (!error) {
        this.jobs = data;
        this.stats.activeJobs = data.filter(j => j.status !== 'completed').length;

        const completedJobs = data.filter(
          j => j.status === 'completed' && j.tech_id === this.tech.id
        );

        this.stats.earnings = completedJobs.reduce((total, job) => total + this.calculateFee(job), 0);

        const today = new Date().toISOString().split('T')[0];
        this.stats.todayEarnings = data
          .filter(j =>
            j.status === 'completed' &&
            j.tech_id === this.tech.id &&
            j.completed_at?.startsWith(today)
          )
          .reduce((sum, j) => sum + this.calculateFee(j), 0);
      }

      this.loading = false;
      this.updateJobDistances();
    },

    subscribeRealtime() {
      window.sb
        .channel(`public-jobs`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "jobs" },
          (payload) => {
            const job = payload.new;

            if (job.rejected_by?.includes(this.tech.id)) {
              this.jobs = this.jobs.filter(j => j.id !== job.id);
              return;
            }

            const index = this.jobs.findIndex(j => j.id === job.id);
            if (index !== -1) {
              this.jobs[index] = job;
            } else {
              if (job.status === "pending" && !job.tech_id) {
                this.jobs.unshift(job);
                this.updateJobDistances();
              }
            }

            this.stats.activeJobs = this.jobs.filter(j => j.status !== 'completed').length;

            const completedJobs = this.jobs.filter(
              j => j.status === 'completed' && j.tech_id === this.tech.id
            );
            this.stats.earnings = completedJobs.reduce((total, job) => total + this.calculateFee(job), 0);
            const today = new Date().toISOString().split('T')[0];
            this.stats.todayEarnings = completedJobs
              .filter(j => j.completed_at?.startsWith(today))
              .reduce((sum, j) => sum + this.calculateFee(j), 0);
          }
        )
        .subscribe();
    },

    async acceptJob(jobId) {
      const { data, error } = await window.sb
        .from("jobs")
        .update({
          tech_id: this.tech.id,
          status: "in_progress",
          started_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .is("tech_id", null)
        .eq("status", "pending")
        .select();

      if (error || !data || data.length === 0) {
        alert("Too late. Another technician already took this job.");
        return;
      }

      const index = this.jobs.findIndex(j => j.id === jobId);
      if (index !== -1) {
        this.jobs[index].status = "in_progress";
        this.jobs[index].tech_id = this.tech.id;
      }

      localStorage.setItem("locked_job_id", jobId);
      window.location.href = "job_detail.html";
    },

    async rejectJob(jobId) {
      const job = this.jobs.find(j => j.id === jobId);
      if (!job) return;

      const currentRejected = job.rejected_by || [];

      const { error } = await window.sb
        .from("jobs")
        .update({
          rejected_by: [...currentRejected, this.tech.id]
        })
        .eq("id", jobId);

      if (error) {
        alert("Reject failed");
        return;
      }

      this.jobs = this.jobs.filter(j => j.id !== jobId);
      this.stats.activeJobs = this.jobs.filter(j => j.status !== 'completed').length;
    },

    async completeJob(job) {
      try {
        const customerAmount = job.original_price 
          || job.payable_amount 
          || job.quoted_amount 
          || job.customer_price 
          || job.discounted_price 
          || job.price 
          || 299;

        const { error } = await window.sb
          .from('jobs')
          .update({
            payment_status: 'PENDING_CUSTOMER_PAYMENT',
            payable_amount: Number(customerAmount),
            status: 'in_progress'
          })
          .eq('id', job.id);

        if (error) throw error;

        alert("💳 Payment request sent to customer screen! The customer must complete payment to get their 6-digit completion OTP.");
        await this.fetchJobs();
      } catch (err) {
        console.error("Complete job payment trigger error:", err);
        alert("Failed to send payment request: " + err.message);
      }
    },

    async verifyJobCompletionOtp(jobId) {
      if (!this.enteredOtp || String(this.enteredOtp).trim().length !== 6) {
        alert("Please enter the 6-digit OTP provided by the customer.");
        return;
      }

      try {
        const { data: job, error } = await window.sb
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error || !job) {
          alert("Job record not found.");
          return;
        }

        const validOtp = job.completion_otp || job.otp;

        if (String(validOtp) !== String(this.enteredOtp).trim()) {
          alert("Invalid OTP! Please check with the customer.");
          return;
        }

        const fee = this.calculateFee(job);
        const { error: updateError } = await window.sb
          .from('jobs')
          .update({
            status: 'completed',
            payment_status: 'PAID',
            completed_at: new Date().toISOString(),
            technician_earning: fee
          })
          .eq('id', jobId);

        if (updateError) throw updateError;

        alert("🎉 OTP Verified! Job marked as completed.");
        this.enteredOtp = '';
        localStorage.removeItem("locked_job_id");
        await this.fetchJobs();
      } catch (err) {
        console.error("OTP Verification Error:", err);
        alert("An error occurred during verification: " + err.message);
      }
    },

    formatScheduled(job) {
      const raw = job?.scheduled_time;
      if (!raw) return null;

      const d = new Date(raw);
      if (!isNaN(d)) {
        return d.toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      }
      return raw;
    },

    calculateFee(job) {
      const COMMISSION = 0.157;
      const servicePrice = job.original_price || job.discounted_price || job.price || 0;
      return Math.round(servicePrice * (1 - COMMISSION));
    },

    logout() {
      localStorage.removeItem("active_tech");
      window.location.href = "partnerlogin.html";
    }
  }
}
