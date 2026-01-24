/* REPLACE THE window.openAssign FUNCTION IN YOUR admin-jobs.html WITH THIS */

window.openAssign = async (jobId, category, area) => {
  selectedJobId = jobId;
  const select = document.getElementById("techSelect");
  select.innerHTML = "<option>Searching...</option>";

  console.log(`Searching for all technicians in category: ${category}`);

  // 1. Query only by category and status (ignoring area)
  // 2. Using 'name' to match your SQL schema
  const { data, error } = await sb
    .from("technicians")
    .select("id, name, category, area, experience")
    .eq("status", "approved") 
    .eq("category", category); 

  if (error) {
    console.error("Supabase error detail:", error.message);
    select.innerHTML = `<option>Error: Check Console</option>`;
    return;
  }

  select.innerHTML = "";

  if (!data || data.length === 0) {
    // Helpful message if no one is approved in this category yet
    select.innerHTML = `<option>No approved experts found for "${category}"</option>`;
  } else {
    select.innerHTML = `<option value="">Select Technician (${data.length} found)</option>`;
    
    data.forEach(t => {
      // Highlight if they happen to be in the same area as the job
      const isLocal = t.area.toLowerCase() === area.toLowerCase();
      const areaLabel = isLocal ? "⭐ (Same Area)" : `(${t.area})`;
      
      select.innerHTML += `
        <option value="${t.id}">
          ${t.name} | ${t.experience} yrs exp | ${areaLabel}
        </option>`;
    });
  }

  document.getElementById("assignModal").classList.remove("hidden");
  document.getElementById("assignModal").classList.add("flex");
};