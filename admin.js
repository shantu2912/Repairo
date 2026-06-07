/* ✅ SUPABASE CLIENT INIT */
const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global variables
let allTechnicians = [];
let currentFilter = 'all';
let currentSearchTerm = '';

/* ✅ LOAD DASHBOARD DATA */
async function loadDashboard() {
    const loadingState = document.getElementById('loadingState');
    const techList = document.getElementById('techList');
    const emptyState = document.getElementById('emptyState');
    
    if (loadingState) loadingState.classList.remove('hidden');
    
    try {
        const { data: techs, error } = await sb
            .from('technicians')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allTechnicians = techs || [];
        
        // Update Stats
        updateStats();
        
        // Apply current filters and render
        applyFiltersAndRender();
        
        // Update last updated time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('lastUpdated').innerText = timeString;
        document.getElementById('sidebarLastSync').innerText = timeString;
        
    } catch (err) {
        console.error("Error loading technicians:", err);
        showToast('Failed to load technicians', 'error');
    } finally {
        if (loadingState) loadingState.classList.add('hidden');
    }
}

/* ✅ UPDATE STATS */
function updateStats() {
    const pending = allTechnicians.filter(t => t.status === 'pending').length;
    const approved = allTechnicians.filter(t => t.status === 'approved').length;
    const rejected = allTechnicians.filter(t => t.status === 'rejected').length;
    const total = allTechnicians.length;

    document.getElementById('pendingCount').innerText = pending;
    document.getElementById('approvedCount').innerText = approved;
    document.getElementById('rejectedCount').innerText = rejected;
    document.getElementById('totalCount').innerText = total;
}

/* ✅ APPLY FILTERS AND RENDER */
function applyFiltersAndRender() {
    let filtered = [...allTechnicians];
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(t => t.status === currentFilter);
    }
    
    // Apply search filter
    if (currentSearchTerm) {
        filtered = filtered.filter(t => 
            t.name?.toLowerCase().includes(currentSearchTerm) ||
            t.phone?.includes(currentSearchTerm) ||
            t.email?.toLowerCase().includes(currentSearchTerm) ||
            t.category?.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    renderTechnicians(filtered);
}

/* ✅ RENDER TECHNICIANS LIST */
function renderTechnicians(technicians) {
    const tbody = document.getElementById('techList');
    const emptyState = document.getElementById('emptyState');
    
    if (!technicians.length) {
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const statusColors = {
        pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
        approved: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
        rejected: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' }
    };
    
    tbody.innerHTML = technicians.map(tech => {
        const colors = statusColors[tech.status] || statusColors.pending;
        
        return `
            <tr class="table-row-hover border-b border-brand-beige/20">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-brand-olive flex items-center justify-center text-white font-bold text-sm">
                            ${tech.name ? tech.name.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                            <p class="font-bold text-brand-dark text-sm">${escapeHtml(tech.name || 'Unknown')}</p>
                            <p class="text-[10px] text-brand-dark/40 font-mono">ID: ${tech.id?.slice(0, 8) || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm text-brand-dark">${escapeHtml(tech.phone || 'N/A')}</p>
                    <p class="text-[10px] text-brand-dark/40">${escapeHtml(tech.email || 'No email')}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-semibold text-brand-olive">${escapeHtml(tech.category || 'General')}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-brand-dark">${tech.experience || 0} years</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}">
                        <span class="w-1.5 h-1.5 rounded-full ${colors.dot}"></span>
                        ${tech.status || 'pending'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        ${tech.status === 'pending' ? `
                            <button onclick="updateStatus('${tech.id}', 'approved')" 
                                    class="w-8 h-8 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all flex items-center justify-center tooltip"
                                    title="Approve">
                                <i class="fa-solid fa-check text-xs"></i>
                            </button>
                            <button onclick="updateStatus('${tech.id}', 'rejected')" 
                                    class="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center justify-center tooltip"
                                    title="Reject">
                                <i class="fa-solid fa-times text-xs"></i>
                            </button>
                        ` : `
                            <button onclick="viewDetails('${tech.id}')" 
                                    class="w-8 h-8 rounded-lg bg-info/10 text-info hover:bg-info hover:text-white transition-all flex items-center justify-center tooltip"
                                    title="View Details">
                                <i class="fa-solid fa-eye text-xs"></i>
                            </button>
                            <button onclick="deleteTechnician('${tech.id}')" 
                                    class="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center justify-center tooltip"
                                    title="Delete">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/* ✅ UPDATE STATUS FUNCTION */
window.updateStatus = async (id, status) => {
    const actionText = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionText} this technician?`)) return;
    
    try {
        const { error } = await sb
            .from('technicians')
            .update({ status: status })
            .eq('id', id);

        if (error) throw error;
        
        showToast(`Technician ${status === 'approved' ? 'approved' : 'rejected'} successfully`, 'success');
        await loadDashboard();
        
    } catch (err) {
        console.error("Error updating status:", err);
        showToast('Failed to update status', 'error');
    }
};

/* ✅ DELETE TECHNICIAN */
window.deleteTechnician = async (id) => {
    if (!confirm('⚠️ Are you sure you want to delete this technician?\n\nThis action cannot be undone.')) return;
    
    try {
        const { error } = await sb
            .from('technicians')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        showToast('Technician deleted successfully', 'success');
        await loadDashboard();
        
    } catch (err) {
        console.error("Error deleting technician:", err);
        showToast('Failed to delete technician', 'error');
    }
};

/* ✅ VIEW DETAILS */
window.viewDetails = (id) => {
    const tech = allTechnicians.find(t => t.id === id);
    if (tech) {
        alert(`📋 TECHNICIAN DETAILS\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 Name: ${tech.name || 'N/A'}\n` +
              `📞 Phone: ${tech.phone || 'N/A'}\n` +
              `📧 Email: ${tech.email || 'N/A'}\n` +
              `🔧 Category: ${tech.category || 'N/A'}\n` +
              `⭐ Experience: ${tech.experience || 0} years\n` +
              `📍 Address: ${tech.address || 'N/A'}\n` +
              `📊 Status: ${tech.status || 'pending'}\n` +
              `🆔 ID: ${tech.id}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
};

/* ✅ FILTER TECHNICIANS */
window.filterTechnicians = (filter) => {
    currentFilter = filter;
    
    // Update active filter button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-brand-olive', 'text-white');
        btn.classList.add('text-brand-dark/60', 'bg-transparent', 'hover:bg-brand-cream');
    });
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-brand-olive', 'text-white');
        activeBtn.classList.remove('text-brand-dark/60', 'bg-transparent', 'hover:bg-brand-cream');
    }
    
    applyFiltersAndRender();
};

/* ✅ REFRESH DATA */
window.refreshData = async () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn?.querySelector('i');
    if (icon) {
        icon.classList.add('refresh-spin');
    }
    
    await loadDashboard();
    showToast('Data refreshed successfully', 'success');
    
    setTimeout(() => {
        if (icon) {
            icon.classList.remove('refresh-spin');
        }
    }, 500);
};

/* ✅ SHOW TOAST NOTIFICATION */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    const color = type === 'success' ? 'text-success' : type === 'error' ? 'text-danger' : 'text-info';
    
    toast.className = `glass-card rounded-xl p-3 min-w-[200px] toast-show flex items-center gap-2 shadow-lg animate__animated animate__fadeInRight`;
    toast.innerHTML = `
        <i class="fas ${icon} ${color}"></i>
        <span class="text-sm text-brand-dark">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ✅ ESCAPE HTML */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/* ✅ LOGOUT */
window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_logged_in');
        window.location.href = 'admin-login.html';
    }
};

/* ✅ SETUP SEARCH LISTENER */
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            applyFiltersAndRender();
        });
    }
}

/* ✅ SETUP REALTIME SUBSCRIPTION */
function setupRealtime() {
    const channel = sb.channel('technicians-changes');
    channel
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'technicians' }, 
            () => {
                loadDashboard();
                showToast('Technician list updated', 'info');
            }
        )
        .subscribe();
}

/* ✅ INITIALIZE */
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupSearchListener();
    setupRealtime();
});