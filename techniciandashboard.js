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

    // ─────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────
    async init() {
      // ✅ LOAD SAVED LANGUAGE
      const savedLang = localStorage.getItem("preferred_language") || "en";
      if (typeof setLanguage === "function") {
        setLanguage(savedLang);
      }
      this.tech = JSON.parse(localStorage.getItem("active_tech"));
      if (!this.tech) {
        window.location.href = "partnerlogin.html";
        return;
      }

      // ✅ Load tech_id if not present
      if (!this.tech.tech_id) {
        await this.loadTechId();
      }

      // Hard lock: if a job is in progress redirect to detail
      const lockedJobId = localStorage.getItem("locked_job_id");
      if (lockedJobId) {
        window.location.href = "job_detail.html";
        return;
      }

      this.techName = this.tech.name;
      
      // Set initial availability from DB
      await this.loadTechProfile();

      // ── FIX: setupNotifications must complete before onMessage is registered ──
      await this.setupNotifications();

      // Register foreground message handler AFTER setup is done
      // This is now safe because setupNotifications awaits SW registration
      this.registerForegroundHandler();

      await this.fetchJobs();
      this.subscribeRealtime();
    },

    // ─────────────────────────────────────────────────────────
    // Load tech_id from database if not in local storage
    // ─────────────────────────────────────────────────────────
    async loadTechId() {
      if (this.tech?.tech_id) return; // Already have it
      
      try {
        const { data, error } = await window.sb
          .from('technicians')
          .select('tech_id')
          .eq('id', this.tech.id)
          .single();

        if (!error && data?.tech_id) {
          this.tech.tech_id = data.tech_id;
          // Update localStorage
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
    // Load tech profile (availability, etc.)
    // ─────────────────────────────────────────────────────────
    async loadTechProfile() {
      const { data, error } = await window.sb
        .from('technicians')
        .select('is_available')
        .eq('id', this.tech.id)
        .single();

      if (!error && data) {
        this.available = data.is_available ?? false;
      }
    },

    // ─────────────────────────────────────────────────────────
    // FIX: setupNotifications — returns a promise so init() can await it
    // ─────────────────────────────────────────────────────────
    async setupNotifications() {
      try {
        if (!('serviceWorker' in navigator)) {
          console.error("❌ Service Worker not supported in this browser");
          this.notifStatus = 'denied';
          return;
        }

        // FIX: Check current permission state first — don't request yet
        this.notifStatus = Notification.permission;

        if (Notification.permission === 'denied') {
          console.warn("🔕 Notification permission has been denied by user");
          return;
        }

        // Register service worker — await it fully so messaging can use it
        let registration;
        try {
          registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
            // FIX: updateViaCache = 'none' ensures a fresh SW is always checked
            updateViaCache: 'none'
          });
          console.log("✅ Service Worker registered:", registration.scope);

          // FIX: Wait for the SW to be active before proceeding
          await navigator.serviceWorker.ready;
          console.log("✅ Service Worker is active and ready");
        } catch (swError) {
          console.error("❌ Service Worker registration failed:", swError);
          return;
        }

        // Request permission (only if not already granted)
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          this.notifStatus = permission;
          if (permission !== 'granted') {
            console.warn("🔕 Notification permission:", permission);
            return;
          }
        }

        this.notifStatus = 'granted';

        // FIX: Get FCM token — always pass the serviceWorkerRegistration
        //      so Firebase uses OUR SW, not a default one
        const token = await window.firebaseMessaging.getToken({
          vapidKey: "BBZpS8kGM1KZEP1f0L9TeEM-WHUAKND52kqpPPb-9I1EuWNlXItKHaRGqNkrmOKPzjhvtP3oysjZ8Dq1SuN4yBk",
          serviceWorkerRegistration: registration
        });

        if (!token) {
          console.error("❌ No FCM token received — check VAPID key and service worker");
          return;
        }

        console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");

        // Save token to DB
        await this.saveFCMToken(token);

        // FIX: Listen for token refresh and update DB automatically
        //      Firebase rotates tokens periodically; if you miss this the
        //      Edge Function will be sending to a dead token
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
    // FIX: Extracted token save into its own method — reused by onTokenRefresh
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
    // FIX: Foreground handler is separate from setup so there's
    //      no chance it runs before the SW is registered
    // ─────────────────────────────────────────────────────────
    registerForegroundHandler() {
      window.firebaseMessaging.onMessage((payload) => {
        console.log("📩 Foreground message received:", payload);

        const title = payload.notification?.title || "New Job";
        const body  = payload.notification?.body  || "You have a new job";

        // FIX: Check permission explicitly before calling new Notification()
        //      Without this check, the call silently fails when permission
        //      is not 'granted', causing the "no notification" bug
        if (Notification.permission === 'granted') {
          const notif = new Notification(title, {
            body: body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });

          // Open dashboard on click
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } else {
          console.warn("🔕 Permission not granted — showing in-app alert instead");
        }

        // FIX: Always update the in-app job list on foreground message,
        //      regardless of notification permission state
        this.fetchJobs();
      });
    },

    // ─────────────────────────────────────────────────────────
    openMaps(location) {
      const encoded = encodeURIComponent(location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    },

    scrollToJobs() {
      document.getElementById('jobsSection')?.scrollIntoView({ behavior: 'smooth' });
    },

    // ─────────────────────────────────────────────────────────
    // FIX: toggleAvailability now persists to DB so the Edge Function
    //      respects it when filtering technicians to notify
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
        // Revert on failure
        this.available = !newValue;
        alert("Failed to update availability. Please try again.");
      } else {
        console.log(`✅ Availability set to: ${newValue}`);
      }
    },

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
    },

    // ─────────────────────────────────────────────────────────
    subscribeRealtime() {
      window.sb
        .channel(`public-jobs`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "jobs" },
          (payload) => {
            const job = payload.new;

            // Remove rejected jobs from this tech's view
            if (job.rejected_by?.includes(this.tech.id)) {
              this.jobs = this.jobs.filter(j => j.id !== job.id);
              return;
            }

            const index = this.jobs.findIndex(j => j.id === job.id);
            if (index !== -1) {
              this.jobs[index] = job;
            } else {
              // Add new pending unassigned jobs
              if (job.status === "pending" && !job.tech_id) {
                this.jobs.unshift(job);
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

    // ─────────────────────────────────────────────────────────
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
    async completeJob(job) {
      const completedAt = new Date().toISOString();
      const fee = this.calculateFee(job);

      const { error } = await window.sb
        .from("jobs")
        .update({
          status: "completed",
          completed_at: completedAt,
          technician_earning: fee
        })
        .eq("id", job.id)
        .eq("tech_id", this.tech.id);

      if (error) {
        console.error(error);
        alert("Failed to complete job: " + error.message);
        return;
      }

      alert("Job marked as completed!");
      this.fetchJobs();
    },

    // ─────────────────────────────────────────────────────────
    async markArrived(job) {
      try {
        const { error } = await window.sb
          .from('jobs')
          .update({ arrived_at: new Date().toISOString() })
          .eq('id', job.id)
          .eq('tech_id', this.tech.id);

        if (error) {
          console.error("SUPABASE ERROR:", error);
          alert("DB Error: " + error.message);
          return;
        }

        job.arrived_at = new Date().toISOString();
        job.status = "arrived";

        alert("Arrival marked successfully");

      } catch (err) {
        console.error("ARRIVAL FULL ERROR:", err);
        alert("Failed to mark arrival: " + (err.message || "Unknown error"));
      }
    },

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

    // ─────────────────────────────────────────────────────────
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
    // Formats the customer-chosen scheduled date + time for display
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

      // Fallback: return raw string as-is if not a parseable datetime
      return raw;
    },

    // ─────────────────────────────────────────────────────────
    formatTime(dt) {
      if (!dt) return "-";
      const diff = Math.floor((Date.now() - new Date(dt)) / 60000);
      if (diff < 1)  return "just now";
      if (diff < 60) return diff + " mins ago";
      const hours = Math.floor(diff / 60);
      if (hours < 24) return hours + " hrs ago";
      return Math.floor(hours / 24) + " days ago";
    },

    // ─────────────────────────────────────────────────────────
    calculateFee(job) {
      const COMMISSION = 0.157;
      const servicePrice = job.discounted_price || job.original_price || job.price || 0;
      return Math.round(servicePrice * (1 - COMMISSION));
    },

    // ─────────────────────────────────────────────────────────
    logout() {
      localStorage.removeItem("active_tech");
      window.location.href = "partnerlogin.html";
    }
  }
}
