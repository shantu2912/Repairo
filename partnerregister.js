const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Security: Hash password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate Technician ID with format FZ001, FZ002, etc.
async function generateTechnicianId() {
    try {
        // Get all technicians and find the highest ID number
        const { data, error } = await _supabase
            .from('technicians')
            .select('tech_id')
            .order('tech_id', { ascending: false })
            .limit(1);

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0) {
            const lastId = data[0].tech_id;
            // Extract number from FZ001 format
            const match = lastId.match(/FZ(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Format with leading zeros (3 digits)
        return `FZ${String(nextNumber).padStart(3, '0')}`;
    } catch (err) {
        console.error("Error generating technician ID:", err);
        // Fallback: use timestamp
        return `FZ${Date.now().toString().slice(-3)}`;
    }
}

// Validate Aadhaar with more security
function validateAadhaar(aadhaar) {
    // Remove any spaces or special characters
    const clean = aadhaar.replace(/\s/g, '');
    
    // Check if exactly 12 digits
    if (!/^\d{12}$/.test(clean)) return false;
    
    // Verhoeff algorithm or simple checksum can be added here
    // For now, basic validation
    return true;
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    const element = document.createElement('div');
    element.textContent = input;
    return element.innerHTML;
}

async function submitTechnician(state) {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const category = document.getElementById('regCategory').value;
    const experience = document.getElementById('regExp').value.trim();
    const aadhaar = document.getElementById('regAadhaar').value.trim();
    const area = document.getElementById('regArea').value.trim();

    // Enhanced validation
    if (!/^[A-Za-z ]{3,40}$/.test(name)) { 
        alert("Enter valid full name (3-40 characters, letters only)"); 
        return; 
    }

    if (!/^[6-9]\d{9}$/.test(phone)) { 
        alert("Enter valid 10 digit mobile number starting with 6-9"); 
        return; 
    }

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) { 
        alert("Username should be 4-20 characters (letters, numbers, underscore only)"); 
        return; 
    }

    // Password requirements: min 8 chars, at least 1 number and 1 special character
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
        alert("Password must be at least 8 characters with at least 1 letter, 1 number, and 1 special character (@$!%*#?&)");
        return;
    }

    const expNum = parseFloat(experience);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) { 
        alert("Enter valid experience (0-50 years)"); 
        return; 
    }

    if (!validateAadhaar(aadhaar)) {
        alert("Aadhaar must be 12 digits");
        return;
    }

    if (!/^[A-Za-z ]{3,40}$/.test(area)) { 
        alert("Enter valid service area (3-40 characters, letters only)"); 
        return; 
    }

    state.isSubmitting = true;

    try {
        // Check if username already exists
        const { data: existingUser, error: checkError } = await _supabase
            .from('technicians')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
            alert("Username already taken. Please choose another.");
            state.isSubmitting = false;
            return;
        }

        // Check if phone already exists
        const { data: existingPhone, error: phoneError } = await _supabase
            .from('technicians')
            .select('phone')
            .eq('phone', '+91' + phone)
            .maybeSingle();

        if (phoneError) throw phoneError;
        if (existingPhone) {
            alert("Phone number already registered. Please login or use another number.");
            state.isSubmitting = false;
            return;
        }

        // Generate Technician ID
        const techId = await generateTechnicianId();

        // Hash the password before storing
        const hashedPassword = await hashPassword(password);

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedArea = sanitizeInput(area);

        const { error } = await _supabase
            .from('technicians')
            .insert([{
                tech_id: techId,
                name: sanitizedName,
                phone: "+91" + phone,
                username: username,
                password: hashedPassword, // Store hashed password
                category: category,
                experience: expNum,
                aadhaar: aadhaar, // In production, encrypt this
                area: sanitizedArea,
                status: 'pending',
                created_at: new Date().toISOString(),
                registration_ip: '', // Would get from server-side
                is_active: true
            }]);

        if (error) throw error;
        state.isSuccess = true;

        // Log the generated ID for reference
        console.log(`Technician registered with ID: ${techId}`);

    } catch (err) {
        console.error("Registration error:", err);
        if (err.code === '23505') { // PostgreSQL unique violation
            alert("Username or Phone number already exists. Please use different credentials.");
        } else {
            alert("Registration failed: " + err.message);
        }
    } finally {
        state.isSubmitting = false;
    }
}

// Add rate limiting
let lastSubmitTime = 0;
const originalSubmit = submitTechnician;

submitTechnician = function(state) {
    const now = Date.now();
    if (now - lastSubmitTime < 3000) { // 3 seconds cooldown
        alert("Please wait 3 seconds before submitting again.");
        return;
    }
    lastSubmitTime = now;
    return originalSubmit(state);
};
