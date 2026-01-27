/* ✅ SUPABASE CLIENT INIT */
const sb = supabase.createClient(
  'https://kzxdxnxgouthsywbsnvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag'
);

/* ✅ LOAD DASHBOARD DATA */
async function loadDashboard() {
    const { data: techs, error } = await sb
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error loading technicians:", error);
        return;
    }

    // Update Stats
    document.getElementById('pendingCount').innerText = techs.filter(t => t.status === 'pending').length;
    document.getElementById('approvedCount').innerText = techs.filter(t => t.status === 'approved').length;
    document.getElementById('rejectedCount').innerText = techs.filter(t => t.status === 'rejected').length;

    // Render List
    const list = document.getElementById('techList');
    list.innerHTML = "";

    techs.forEach(t => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };

        list.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-5">
                    <p class="font-bold text-brand-olive">${t.name}</p>
                    <p class="text-[10px] text-gray-400 font-mono">${t.phone}</p>
                </td>
                <td class="px-8 py-5 text-sm text-brand-dark/70">${t.category}</td>
                <td class="px-8 py-5 text-center">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusColors[t.status] || 'bg-gray-100'}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-8 py-5 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="updateStatus('${t.id}', 'approved')" class="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button onclick="updateStatus('${t.id}', 'rejected')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

/* ✅ UPDATE STATUS FUNCTION */
window.updateStatus = async (id, status) => {
    const { error } = await sb
        .from('technicians')
        .update({ status: status })
        .eq('id', id);

    if (error) alert("Action failed");
    else loadDashboard();
};

// Initialize
loadDashboard();