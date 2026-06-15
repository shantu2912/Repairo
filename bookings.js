
        document.addEventListener('alpine:init', () => {
            Alpine.data('bookingsApp', () => ({
                items: [],
                loading: true,
                filter: 'active',
                errorMessage: '',
                user: null,

                async init() {
                    try {
                        if (!window.sb) { 
                            if(!window.initSupabase()) throw new Error("Supabase client mapping missing.");
                        }

                        const checkLogged = localStorage.getItem('local_user_logged');
                        const userPhone = localStorage.getItem('local_user_phone');

                        if (checkLogged !== 'true' || !userPhone) { 
                            window.location.href = 'loginuser.html'; 
                            return; 
                        }
                        
                        const { data: profile, error: profileError } = await window.sb
                            .from('profiles')
                            .select('*')
                            .eq('phone', userPhone.trim())
                            .maybeSingle();

                        if (profileError) throw profileError;
                        
                        if (!profile) {
                            this.user = { id: 'fallback_uid', phone: userPhone };
                        } else {
                            this.user = profile;
                        }

                        await this.fetchData(this.user.id);

                        // Realtime Updates listener
                        window.sb.channel('jobs-realtime')
                            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
                                this.fetchData(this.user.id);
                            })
                            .subscribe();

                    } catch (e) {
                        console.error(e);
                        this.errorMessage = e.message;
                        this.loading = false;
                    }
                },

                async fetchData(userId) {
                    try {
                        let allJobs = [];

                        const { data: jobsById, error: jErr } = await window.sb
                            .from('jobs')
                            .select('*')
                            .eq('user_id', userId);

                        if (jErr) throw jErr;
                        if (jobsById) allJobs = [...allJobs, ...jobsById];

                        if (this.user && this.user.phone) {
                            const { data: jobsByPhone } = await window.sb
                                .from('jobs')
                                .select('*')
                                .eq('phone', this.user.phone.trim());
                            if (jobsByPhone) allJobs = [...allJobs, ...jobsByPhone];
                        }

                        const uniqueJobs = Array.from(new Map(allJobs.map(item => [item.id, item])).values());
                        uniqueJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                        this.items = await Promise.all(uniqueJobs.map(async (job) => {
                            let technician = null;
                            if (job.tech_id) {
                                const { data: tech } = await window.sb
                                    .from('technicians')
                                    .select('*')
                                    .eq('id', job.tech_id)
                                    .maybeSingle();
                                technician = tech;
                            }
                            return { ...job, technician };
                        }));

                    } catch (err) {
                        console.error(err);
                        this.errorMessage = "Data Load Error: " + err.message;
                    } finally {
                        this.loading = false;
                    }
                },

                get filteredItems() {
                    // Added 'in_progress' state mapping parameter inside tracking array boundaries
                    const activeStatuses = ['pending', 'assigned', 'started', 'accepted', 'searching', 'arrived', 'in_progress'];
                    const s = (status) => (status || '').toLowerCase().trim();
                    
                    if (this.filter === 'active') {
                        return this.items.filter(i => activeStatuses.includes(s(i.status)));
                    } else {
                        return this.items.filter(i => !activeStatuses.includes(s(i.status)));
                    }
                },

                normalizeStatusText(status) {
                    let s = (status || 'pending').toLowerCase().trim();
                    if (s === 'in_progress') return 'In Progress';
                    return status;
                },

                formatDate(dateStr) {
                    if (!dateStr) return 'Date Pending';
                    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                },
                getIcon(cat) {
                    const c = (cat || '').toLowerCase();
                    if(c.includes('electric')) return 'fa-bolt';
                    if(c.includes('plumb')) return 'fa-faucet-drip';
                    if(c.includes('ac')) return 'fa-snowflake';
                    if(c.includes('clean')) return 'fa-broom';
                    return 'fa-toolbox';
                },
                getIconColor(cat) {
                    const c = (cat || '').toLowerCase();
                    if(c.includes('electric')) return 'bg-yellow-100 text-yellow-600';
                    if(c.includes('plumb')) return 'bg-blue-100 text-blue-600';
                    if(c.includes('ac')) return 'bg-cyan-100 text-cyan-600';
                    return 'bg-gray-100 text-gray-600';
                },
                getStatusClasses(status) {
                    const s = (status || 'pending').toLowerCase().trim();
                    if(s === 'pending' || s === 'searching') return 'bg-yellow-50 text-yellow-600 border-yellow-200';
                    if(s === 'assigned' || s === 'accepted' || s === 'arrived' || s === 'started' || s === 'in_progress') return 'bg-blue-50 text-blue-600 border-blue-200';
                    if(s === 'completed') return 'bg-green-50 text-green-600 border-green-200';
                    if(s === 'cancelled') return 'bg-red-50 text-red-600 border-red-200';
                    return 'bg-gray-50 text-gray-600';
                }
            }));
        });
