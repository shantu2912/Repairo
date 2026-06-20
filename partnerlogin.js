// ✅ SUPABASE INIT
const supabaseClient = window.supabase.createClient(
  "https://kzxdxnxgouthsywbsnvl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag"
);

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const selectedLanguage = document.getElementById("languageSelect").value;
  const errorEl = document.getElementById("error");
  errorEl.classList.add("hidden");

  if (!username || !password) {
    showError("Enter username and password");
    return;
  }

  const { data, error } = await supabaseClient
    .from("technicians")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    showError("Invalid username or password");
    return;
  }

  // ✅ SAVE LANGUAGE
  localStorage.setItem("preferred_language", selectedLanguage);

  // ✅ APPLY LANGUAGE
  if (typeof setLanguage === "function") {
    setLanguage(selectedLanguage);
  }

  // ✅ SAVE LOGIN SESSION
  localStorage.setItem("active_tech", JSON.stringify(data));

  // ✅ REDIRECT
  window.location.href = "techniciandashboard.html";
}

function showError(msg) {
  const el = document.getElementById("error");
  el.innerText = msg;
  el.classList.remove("hidden");
}

// ✅ AUTO LOAD SAVED LANGUAGE
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferred_language") || "en";
  const select = document.getElementById("languageSelect");
  if (select) {
    select.value = savedLang;
  }
  if (typeof setLanguage === "function") {
    setLanguage(savedLang);
  }
});
