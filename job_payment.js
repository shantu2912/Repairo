
        // Use the same client setup as your dashboard
        window.sb = supabase.createClient(
            "https://kzxdxnxgouthsywbsnvl.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag"
        );

        function jobDetailHandler() {
            return {
                loading: true,
                job: null,
                jobId: new URLSearchParams(window.location.search).get('id'),

                async init() {
                    if (!this.jobId) {
                        window.location.href = 'techniciandashboard.html';
                        return;
                    }
                    await this.loadJob();
                    this.subscribeToChanges();
                },

                async loadJob() {
                    const { data, error } = await window.sb
                        .from('jobs')
                        .select('*')
                        .eq('id', this.jobId)
                        .single();

                    if (error) {
                        console.error(error);
                        alert("Error loading job details");
                    } else {
                        this.job = data;
                    }
                    this.loading = false;
                },

                subscribeToChanges() {
                    window.sb
                        .channel(`job-${this.jobId}`)
                        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${this.jobId}` }, 
                        payload => {
                            this.job = payload.new;
                        })
                        .subscribe();
                },

                async verifyPayment() {
                    const confirmed = confirm("Are you sure you have received ₹" + this.calculateFee(this.job) + "?");
                    if (!confirmed) return;

                    const { error } = await window.sb
                        .from('jobs')
                        .update({ payment_status: 'paid' })
                        .eq('id', this.jobId);

                    if (error) alert("Update failed: " + error.message);
                },

                async markArrived() {
                    const { error } = await window.sb
                        .from('jobs')
                        .update({ status: 'arrived', arrived_at: new Date().toISOString() })
                        .eq('id', this.jobId);

                    if (error) alert("Error: " + error.message);
                },

                async completeJob() {
                    const { error } = await window.sb
                        .from('jobs')
                        .update({ 
                            status: 'completed', 
                            completed_at: new Date().toISOString(),
                            technician_fee: this.calculateFee(this.job)
                        })
                        .eq('id', this.jobId);

                    if (error) {
                        alert("Error: " + error.message);
                    } else {
                        // UNLOCK TECH: Remove the local storage lock
                        localStorage.removeItem("current_active_job_id");
                        alert("Job Successful! Returning to Dashboard.");
                        window.location.href = 'techniciandashboard.html';
                    }
                },

                calculateFee(job) {
                    const BASE = { "Carpenter": 800, "Plumber": 600, "Electrician": 600, "AC Tech": 600 };
                    return BASE[job.category] ?? 400;
                },

                goBack() {
                    window.location.href = 'techniciandashboard.html';
                }
            }
        }
