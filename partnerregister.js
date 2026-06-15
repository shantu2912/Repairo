
const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function submitTechnician(state) {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const category = document.getElementById('regCategory').value;
    const experience = document.getElementById('regExp').value.trim();
    const aadhaar = document.getElementById('regAadhaar').value.trim();
    const area = document.getElementById('regArea').value.trim();

    if (!/^[A-Za-z ]{3,40}$/.test(name)) { alert("Enter valid full name"); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { alert("Enter valid 10 digit mobile number"); return; }
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) { alert("Username should be 4-20 characters"); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters"); return; }
    if (experience < 0 || experience > 50) { alert("Enter valid experience"); return; }
    if (!/^\d{12}$/.test(aadhaar)) { alert("Aadhaar must be 12 digits"); return; }
    if (!/^[A-Za-z ]{3,40}$/.test(area)) { alert("Enter valid service area"); return; }

    state.isSubmitting = true;

    try {
        const { error } = await _supabase
        .from('technicians')
        .insert([{
            name: name,
            phone: "+91" + phone,
            username: username,
            password: password,
            category: category,
            experience: parseFloat(experience),
            aadhaar: aadhaar,
            area: area,
            status: 'pending'
        }]);

        if (error) throw error;
        state.isSuccess = true;

    } catch (err) {
        alert("Database Error: " + err.message);
    } finally {
        state.isSubmitting = false;
    }
}

