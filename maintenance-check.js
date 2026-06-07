// maintenance-check.js
const MAINTENANCE_KEY = 'fixzen_maintenance_mode';

async function isMaintenanceMode() {
    // Check localStorage first (fast)
    let isMaintenance = localStorage.getItem(MAINTENANCE_KEY) === 'true';
    
    // Verify with Supabase if available
    if (window.sb) {
        try {
            const { data, error } = await window.sb
                .from('settings')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();
            
            if (!error && data) {
                isMaintenance = data.value === 'true';
                localStorage.setItem(MAINTENANCE_KEY, isMaintenance);
            }
        } catch (err) {
            console.warn('Could not fetch maintenance status');
        }
    }
    
    return isMaintenance;
}

async function blockIfMaintenance() {
    if (await isMaintenanceMode()) {
        alert('🔧 Platform is under maintenance. Service booking is temporarily disabled. Please try again later.');
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

function showMaintenanceBanner() {
    const banner = document.getElementById('maintenanceBanner');
    if (banner && localStorage.getItem(MAINTENANCE_KEY) === 'true') {
        banner.classList.remove('hidden');
    }
}

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isMaintenanceMode, blockIfMaintenance, showMaintenanceBanner };
}