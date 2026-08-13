function dashboardHandler() {
  return {
    tech: null,
    techName: '',
    loading: true,
    jobs: [],
    stats: { activeJobs: 0, earnings: 0, todayEarnings: 0 },
    incomingJob: null,
    available: false,
    notifStatus: 'default', // 'default' | 'prompt' | 'granted' | 'denied'

    // ── PAYMENT & OTP VERIFICATION STATE ──
    enteredOtp: '',
    paymentLoading: false,

    // ── DISTANCE TRACKING ──
    currentLoc: null, 
    locationStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'unavailable'
    geocodeCache: {},       // address string -> { lat, lng }
    distancesUpdating: false,

    // ─────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // LOAD TECH ID
    // ─────────────────────────────────────────────────────────
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
          console.log(`✅ Loaded technician ID: ${data.tech_id}`);
        } else {
          console.warn("⚠️ No tech_id found for this technician");
        }
      } catch (err) {
        console.error("Failed to load tech_id:", err);
      }
    },

    // ─────────────────────────────────────────────────────────
    // LOAD TECH PROFILE
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // SETUP NOTIFICATIONS
    // ─────────────────────────────────────────────────────────
    async setupNotifications() {
      try {
        if (!('serviceWorker' in navigator)) {
          console.error("❌ Service Worker not supported in this browser");
          this.notifStatus = 'denied';
          return;
        }

        this.notifStatus = Notification.permission;

        if (Notification.permission === 'denied') {
          console.warn("🔕 Notification permission has been denied by user");
          return;
        }

        let registration;
        try {
          registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
            updateViaCache: 'none'
          });
          console.log("✅ Service Worker registered:", registration.scope);

          await navigator.serviceWorker.ready;
          console.log("✅ Service Worker is active and ready");
        } catch (swError) {
          console.error("❌ Service Worker registration failed:", swError);
          return;
        }

        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          this.notifStatus = permission;
          if (permission !== 'granted') {
            console.warn("🔕 Notification permission:", permission);
            return;
          }
        }

        this.notifStatus = 'granted';

        const token = await window.firebaseMessaging.getToken({
          vapidKey: "BBZpS8kGM1KZEP1f0L9TeEM-WHUAKND52kqpPPb-9I1EuWNlXItKHaRGqNkrmOKPzjhvtP3oysjZ8Dq1SuN4yBk",
          serviceWorkerRegistration: registration
        });

        if (!token) {
          console.error("❌ No FCM token received");
          return;
        }

        console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");
        await this.saveFCMToken(token);

        window.firebaseMessaging.onTokenRefresh(async () => {
          console.log("🔄 FCM Token refreshed — updating DB");
          try {
            const newToken = await window.firebaseMessaging.getToken({
              vapidKey: "BBZpS8kGM1KZEP1f0L9TeEM-WHUAKND52kqpPPb-9I1EuWNlXItKHaRGqNkrmOKPzjhvtP3oysjZ8Dq1SuN4yBk",
              serviceWorkerRegistration: registration
            });
            if (newToken) {
              await this.saveFCMToken(newToken);
            }
          } catch (err) {
            console.error("❌ Failed to refresh FCM token:", err);
          }
        });

      } catch (err) {
        console.error("❌ Notification setup failed:", err);
      }
    },

    // ─────────────────────────────────────────────────────────
    // SAVE FCM TOKEN
    // ─────────────────────────────────────────────────────────
    async saveFCMToken(token) {
      const { error } = await window.sb
        .from("technicians")
        .update({ fcm_token: token })
        .eq("id", this.tech.id);

      if (error) {
        console.error("❌ Failed to save FCM token to DB:", error);
      } else {
        console.log("✅ FCM Token saved to Supabase for tech:", this.tech.id);
      }
    },

    // ─────────────────────────────────────────────────────────
    // REGISTER FOREGROUND HANDLER
    // ─────────────────────────────────────────────────────────
    registerForegroundHandler() {
      window.firebaseMessaging.onMessage((payload) => {
        console.log("📩 Foreground message received:", payload);

        const title = payload.notification?.title || "New Job";
        const body  = payload.notification?.body  || "You have a new job";

        if (Notification.permission === 'granted') {
          const notif = new Notification(title, {
            body: body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } else {
          console.warn("🔕 Permission not granted — showing in-app alert instead");
        }

        this.fetchJobs();
      });
    },

    // ─────────────────────────────────────────────────────────
    openMaps(location) {
      const encoded = encodeURIComponent(location);
      window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
    },

    // ─────────────────────────────────────────────────────────
    // DISTANCE TRACKING
    // ─────────────────────────────────────────────────────────
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
        console.warn("Geocode failed:", err);
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
        console.warn("Location unavailable:", err.message);
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

    // ─────────────────────────────────────────────────────────
    // TOGGLE AVAILABILITY
    // ─────────────────────────────────────────────────────────
    async toggleAvailability(e) {
      const newValue = e.target.checked;
      this.available = newValue;

      const { error } = await window.sb
        .from('technicians')
        .update({ is_available: newValue })
        .eq('id', this.tech.id);

      if (error) {
        console.error("❌ Failed to update availability:", error);
        this.available = !newValue;
        alert("Failed to update availability. Please try again.");
      } else {
        console.log(`✅ Availability set to: ${newValue}`);
      }
    },

    // ─────────────────────────────────────────────────────────
    // FETCH JOBS
    // ─────────────────────────────────────────────────────────
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

        this.stats.earnings = completedJobs.reduce((total, job) => {
          return total + this.calculateFee(job);
        }, 0);

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

    // ─────────────────────────────────────────────────────────
    // SUBSCRIBE REALTIME
    // ─────────────────────────────────────────────────────────
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
            this.stats.earnings = completedJobs.reduce((total, job) => {
              return total + this.calculateFee(job);
            }, 0);
            const today = new Date().toISOString().split('T')[0];
            this.stats.todayEarnings = completedJobs
              .filter(j => j.completed_at?.startsWith(today))
              .reduce((sum, j) => sum + this.calculateFee(j), 0);
          }
        )
        .subscribe();
    },

    // ─────────────────────────────────────────────────────────
    // ACCEPT / REJECT JOBS
    // ─────────────────────────────────────────────────────────
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

      if (error) {
        console.error("Accept error:", error);
        alert("Database error while accepting job");
        return;
      }

      if (!data || data.length === 0) {
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
        console.error("Reject failed:", error);
        alert("Reject failed");
        return;
      }

      this.jobs = this.jobs.filter(j => j.id !== jobId);
      this.stats.activeJobs = this.jobs.filter(j => j.status !== 'completed').length;
    },

    // ─────────────────────────────────────────────────────────
    // SINGLE-CLICK COMPLETE JOB (TRIGGERS CUSTOMER PAYMENT & OTP FLOW)
    // ─────────────────────────────────────────────────────────
    async completeJob(job) {
      try {
        const customerAmount = job.quoted_amount 
          || job.customer_price 
          || job.discounted_price 
          || job.original_price 
          || job.price 
          || 299;

        const { error } = await window.sb
          .from('jobs')
          .update({
            payment_status: 'PENDING_CUSTOMER_PAYMENT',
            payable_amount: Number(customerAmount)
          })
          .eq('id', job.id);

        if (error) throw error;

        alert("Payment request sent to customer screen! Ask the resident to complete payment to get the completion code.");
        await this.fetchJobs();
      } catch (err) {
        console.error("Complete job payment trigger error:", err);
        alert("Failed to send payment request: " + err.message);
      }
    },

    async verifyJobCompletionOtp(jobId) {
      if (!this.enteredOtp || this.enteredOtp.length !== 6) {
        alert("Please enter a valid 6-digit OTP provided by the customer.");
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
            completed_at: new Date().toISOString(),
            technician_earning: fee
          })
          .eq('id', jobId);

        if (updateError) throw updateError;

        alert("OTP Verified Successfully! Job marked as completed.");
        this.enteredOtp = '';
        localStorage.removeItem("locked_job_id");
        await this.fetchJobs();
      } catch (err) {
        console.error("OTP Verification Error:", err);
        alert("An error occurred during verification.");
      }
    },

    // ─────────────────────────────────────────────────────────
    // MARK ARRIVED
    // ─────────────────────────────────────────────────────────
    async markArrived(job) {
      try {
        const { error } = await window.sb
          .from('jobs')
          .update({ arrived_at: new Date().toISOString() })
          .eq('id', job.id)
          .eq('tech_id', this.tech.id);

        if (error) throw error;

        job.arrived_at = new Date().toISOString();
        job.status = "arrived";
        alert("Arrival marked successfully");
      } catch (err) {
        console.error("Arrival error:", err);
        alert("Failed to mark arrival: " + (err.message || "Unknown error"));
      }
    },

    // ─────────────────────────────────────────────────────────
    // INCOMING MODAL ACTIONS
    // ─────────────────────────────────────────────────────────
    async acceptIncoming() {
      const job = this.incomingJob;
      if (!job) return;

      const { data, error } = await window.sb
        .from("jobs")
        .update({
          tech_id: this.tech.id,
          status: "in_progress",
          started_at: new Date().toISOString()
        })
        .eq("id", job.id)
        .eq("status", "pending")
        .is("tech_id", null)
        .select();

      if (!data || data.length === 0) {
        alert("Too late. Another technician accepted this job.");
      }

      this.incomingJob = null;
      this.fetchJobs();
    },

    async rejectIncoming() {
      const job = this.incomingJob;
      if (!job) return;

      const currentRejected = job.rejected_by || [];

      await window.sb
        .from("jobs")
        .update({
          rejected_by: [...currentRejected, this.tech.id]
        })
        .eq("id", job.id);

      this.incomingJob = null;
    },

    // ─────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────
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

    formatTime(dt) {
      if (!dt) return "-";
      const diff = Math.floor((Date.now() - new Date(dt)) / 60000);
      if (diff < 1)  return "just now";
      if (diff < 60) return diff + " mins ago";
      const hours = Math.floor(diff / 60);
      if (hours < 24) return hours + " hrs ago";
      return Math.floor(hours / 24) + " days ago";
    },

    calculateFee(job) {
      const COMMISSION = 0.157;
      const servicePrice = job.discounted_price || job.original_price || job.price || 0;
      return Math.round(servicePrice * (1 - COMMISSION));
    },

    logout() {
      localStorage.removeItem("active_tech");
      window.location.href = "partnerlogin.html";
    }
  }
}
