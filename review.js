
       const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';

// CHANGED: Variable renamed to 'supabaseClient' to prevent conflicts
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('reviewForm');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');

// 2. Form Submission Event
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const customerName = document.getElementById('customerName').value;
    const serviceBooked = document.getElementById('serviceBooked').value;
    const pastServices = parseInt(document.getElementById('pastServices').value, 10);
    const serviceRating = parseInt(document.getElementById('serviceRating').value, 10);
    const reviewDescription = document.getElementById('reviewDescription').value;

    try {
        // CHANGED: Using 'supabaseClient' here to talk to your database
        const { data, error } = await supabaseClient
            .from('reviews')
            .insert([
                { 
                    customer_name: customerName, 
                    service_booked: serviceBooked, 
                    past_services_count: pastServices, 
                    service_rating: serviceRating, 
                    review_description: reviewDescription 
                }
            ]);

        if (error) throw error;

        statusMessage.textContent = "Thank you! Your review has been submitted.";
        statusMessage.className = "mt-4 text-center text-sm font-medium text-green-600 block";
        form.reset();

    } catch (error) {
        console.error("Error submitting review:", error);
        statusMessage.textContent = "Something went wrong. Please try again.";
        statusMessage.className = "mt-4 text-center text-sm font-medium text-red-600 block";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
    }
});
   
