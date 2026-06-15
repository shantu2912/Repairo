
        function feedbackApp() {
            const sb = supabase.createClient(
                "https://kzxdxnxgouthsywbsnvl.supabase.co",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag"
            );

            const urlParams = new URLSearchParams(window.location.search);
            const jobId = urlParams.get('job_id');

            return {
                // State
                pageLoading: true,
                jobCompleted: false,
                jobStatus: null,
                jobData: null,
                step: 1,
                rating: 0,
                comment: '',
                selectedTags: [],
                loading: false,
                submitted: false,

                async init() {
                    if (!jobId) {
                        this.pageLoading = false;
                        this.jobStatus = 'unknown';
                        return;
                    }

                    // Fetch job status from Supabase
                    try {
                        const { data, error } = await sb
                            .from('jobs')
                            .select('id, status, category, customer_name, feedback_provided, technician_id, user_id')
                            .eq('id', jobId)
                            .single();

                        if (error || !data) {
                            this.jobStatus = 'not_found';
                            this.pageLoading = false;
                            return;
                        }

                        this.jobData = data;
                        this.jobStatus = data.status;

                        // Allow feedback only if job is completed
                        // Also block if feedback already given
                        this.jobCompleted = (data.status === 'completed') && !data.feedback_provided;

                    } catch (err) {
                        console.error(err);
                        this.jobStatus = 'error';
                    }

                    this.pageLoading = false;
                },

                setRating(i) {
                    this.rating = i;
                    if (navigator.vibrate) navigator.vibrate(30);
                },

                getRatingEmoji(i) {
                    return ['😞', '😕', '😊', '😄', '🤩'][i - 1] || '';
                },

                getRatingLabel(i) {
                    return ['Poor', 'Fair', 'Good', 'Excellent', 'Incredible!'][i - 1] || '';
                },

                getTagsForRating() {
                    if (this.rating >= 4) {
                        return [
                            { icon: '⚡', label: 'Fast Arrival' },
                            { icon: '👔', label: 'Professional' },
                            { icon: '✨', label: 'Clean Work' },
                            { icon: '😊', label: 'Polite' },
                            { icon: '🔧', label: 'Genuine Parts' },
                            { icon: '💯', label: 'Worth Every Rupee' },
                        ];
                    } else if (this.rating === 3) {
                        return [
                            { icon: '⏱️', label: 'On Time' },
                            { icon: '👍', label: 'Decent Work' },
                            { icon: '📞', label: 'Good Communication' },
                        ];
                    } else {
                        return [
                            { icon: '⏰', label: 'Late Arrival' },
                            { icon: '🔁', label: 'Needs Redo' },
                            { icon: '📵', label: 'Poor Communication' },
                            { icon: '💸', label: 'Overcharged' },
                        ];
                    }
                },

                toggleTag(tag) {
                    if (this.selectedTags.includes(tag)) {
                        this.selectedTags = this.selectedTags.filter(t => t !== tag);
                    } else {
                        this.selectedTags.push(tag);
                        if (navigator.vibrate) navigator.vibrate(20);
                    }
                },

                launchConfetti() {
                    const colors = ['#A07D54', '#5D5646', '#c9a050', '#EEEAE2', '#fff'];
                    const container = document.getElementById('confetti-container');
                    for (let i = 0; i < 60; i++) {
                        const piece = document.createElement('div');
                        piece.className = 'confetti-piece';
                        piece.style.left = Math.random() * 100 + 'vw';
                        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        piece.style.width = (Math.random() * 8 + 6) + 'px';
                        piece.style.height = (Math.random() * 8 + 6) + 'px';
                        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                        piece.style.animationDelay = (Math.random() * 0.8) + 's';
                        container.appendChild(piece);
                        setTimeout(() => piece.remove(), 4000);
                    }
                },

                async submitReview() {
                    if (!jobId) return alert("Error: No Job ID found.");
                    this.loading = true;

                    const combinedFeedback = this.selectedTags.length > 0
                        ? `[${this.selectedTags.join(', ')}] ${this.comment}`
                        : this.comment;

                    const { error } = await sb.from('feedback').insert([{
                        job_id: jobId,
                        rating: this.rating,
                        comment: combinedFeedback,
                        technician_id: this.jobData?.technician_id || null,
                        user_id: this.jobData?.user_id || null
                    }]);

                    if (error) {
                        alert(error.message);
                        this.loading = false;
                        return;
                    }

                    // Mark job feedback as provided
                    await sb.from('jobs').update({ feedback_provided: true }).eq('id', jobId);

                    this.loading = false;
                    this.submitted = true;

                    // Celebrations
                    this.launchConfetti();
                    if (navigator.vibrate) navigator.vibrate([100, 60, 100, 60, 200]);
                }
            }
        }
