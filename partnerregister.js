const supabaseUrl = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Store the uploaded file for later upload
let uploadedImageFile = null;
let uploadedImagePreview = null;

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB.');
        return;
    }

    uploadedImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('profilePreview');
        preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
        uploadedImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Security: Hash password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Upload image to Supabase Storage
async function uploadProfileImage(techId, file) {
    if (!file) return null;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${techId}.${fileExt}`;
        const filePath = `technician-images/${fileName}`;

        const { error: uploadError } = await _supabase.storage
            .from('technician-profiles')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = _supabase.storage
            .from('technician-profiles')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (err) {
        console.error('Image upload error:', err);
        return null;
    }
}

// Generate Technician ID with format FZ001, FZ002, etc.
async function generateTechnicianId() {
    try {
        const { data, error } = await _supabase
            .from('technicians')
            .select('tech_id')
            .not('tech_id', 'is', null)
            .order('tech_id', { ascending: false })
            .limit(1);

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0 && data[0].tech_id) {
            const lastId = data[0].tech_id;
            const match = lastId.match(/FZ(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return `FZ${String(nextNumber).padStart(3, '0')}`;
    } catch (err) {
        console.error("Error generating technician ID:", err);
        return `FZ${String(Date.now()).slice(-3)}`;
    }
}

// Validate Aadhaar
function validateAadhaar(aadhaar) {
    const clean = aadhaar.replace(/\s/g, '');
    if (!/^\d{12}$/.test(clean)) return false;
    return true;
}

// Sanitize input
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

    // Validations
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

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedArea = sanitizeInput(area);

        // Upload image if provided
        let imageUrl = null;
        if (uploadedImageFile) {
            imageUrl = await uploadProfileImage(techId, uploadedImageFile);
        }

        // Insert technician data
        const insertData = {
            tech_id: techId,
            name: sanitizedName,
            phone: "+91" + phone,
            username: username,
            password: hashedPassword,
            category: category,
            experience: expNum,
            aadhaar: aadhaar,
            area: sanitizedArea,
            status: 'pending',
            is_active: true,
            image_url: imageUrl, // Store the image URL
            created_at: new Date().toISOString()
        };

        console.log("Inserting technician with ID:", techId);
        console.log("Data being inserted:", { ...insertData, password: '[HIDDEN]' });

        const { error } = await _supabase
            .from('technicians')
            .insert([insertData]);

        if (error) throw error;
        
        state.isSuccess = true;
        console.log(`✅ Technician registered successfully with ID: ${techId}`);

    } catch (err) {
        console.error("Registration error:", err);
        
        if (err.code === '23505') {
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
    if (now - lastSubmitTime < 3000) {
        alert("Please wait 3 seconds before submitting again.");
        return;
    }
    lastSubmitTime = now;
    return originalSubmit(state);
};
