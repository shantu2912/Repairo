import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://kzxdxnxgouthsywbsnvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag'
);

async function refreshDashboard() {
    console.log("Fetching data from Supabase...");
    const { data, error } = await supabase.from('technicians').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Error:", error.message);
        return;
    }

    console.log("Data received:", data);

    // Update Counts
    document.getElementById("pendingCount").innerText = data.filter(t => t.status === 'pending').length;
    document.getElementById("approvedCount").innerText = data.filter(t => t.status === 'approved').length;
    document.getElementById("rejectedCount").innerText = data.filter(t => t.status === 'rejected').length;

    const tbody = document.getElementById("techList");
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-gray-400">No applications found in database.</td></tr>';
        return;
    }

    data.forEach(t => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50 transition-colors";
        
        const statusColor = t.status === 'approved' ? 'text-green-600' : 
                            t.status === 'rejected' ? 'text-red-600' : 'text-yellow-600';

        tr.innerHTML = `
            <td class="p-4">
                <div class="font-bold text-gray-800">${t.name}</div>
                <div class="text-[10px] text-gray-400">${t.phone}</div>
            </td>
            <td class="p-4 text-sm text-gray-600">${t.category}</td>
            <td class="p-4 text-center">
                <span class="text-[10px] font-extrabold uppercase px-2 py-1 rounded bg-gray-100 ${statusColor}">
                    ${t.status}
                </span>
            </td>
            <td class="p-4 text-center">
                ${t.status === 'pending' ? `
                    <button onclick="updateStatus('${t.id}', 'approved')" class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold mr-1 hover:bg-green-700">Approve</button>
                    <button onclick="updateStatus('${t.id}', 'rejected')" class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700">Reject</button>
                ` : '<span class="text-gray-300 text-xs italic">Processed</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Global function for buttons
window.updateStatus = async (id, status) => {
    const { error } = await supabase.from('technicians').update({ status }).eq('id', id);
    if (error) alert(error.message);
    else refreshDashboard();
};

// Initial Load
refreshDashboard();