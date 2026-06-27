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
  const errorText = document.getElementById("errorText");
  
  // Reset error
  errorEl.classList.remove("show");
  errorText.textContent = "";

  // Show loading
  const loginBtn = document.getElementById("loginBtn");
  const loginText = document.getElementById("loginText");
  const loginSpinner = document.getElementById("loginSpinner");
  loginBtn.disabled = true;
  loginText.textContent = "Logging in...";
  loginSpinner.style.display = "inline-block";

  if (!username || !password) {
    showError("Please enter username and password");
    resetButton();
    return;
  }

  try {
    // 🔥 FIX: Use .then() approach instead of await to avoid single() issues
    const { data, error } = await supabaseClient
      .from("technicians")
      .select("id, name, username, phone, category, tech_id, is_available, status, image_url, experience, area")
      .eq("username", username)
      .eq("password", password);

    if (error) {
      console.error("Login error:", error);
      showError("Database error. Please try again.");
      resetButton();
      return;
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      showError("Invalid username or password");
      resetButton();
      return;
    }

    // Get the first matching user (should only be one)
    const user = data[0];

    // Check if technician is approved
    if (user.status === 'pending') {
      showError("Your account is pending approval. Please wait for admin confirmation.");
      resetButton();
      return;
    }

    if (user.status === 'rejected') {
      showError("Your application was rejected. Please contact support.");
      resetButton();
      return;
    }

    if (user.status === 'inactive') {
      showError("Your account is inactive. Please contact support.");
      resetButton();
      return;
    }

    // ✅ SAVE LANGUAGE
    localStorage.setItem("preferred_language", selectedLanguage);

    // ✅ APPLY LANGUAGE
    if (typeof setLanguage === "function") {
      setLanguage(selectedLanguage);
    }

    // ✅ SAVE LOGIN SESSION (includes image_url)
    localStorage.setItem("active_tech", JSON.stringify(user));

    // ✅ REDIRECT
    window.location.href = "techniciandashboard.html";

  } catch (err) {
    console.error("Login error:", err);
    showError("Something went wrong. Please try again.");
    resetButton();
  }
}

function resetButton() {
  const loginBtn = document.getElementById("loginBtn");
  const loginText = document.getElementById("loginText");
  const loginSpinner = document.getElementById("loginSpinner");
  loginBtn.disabled = false;
  loginText.textContent = "Login";
  loginSpinner.style.display = "none";
}

function showError(msg) {
  const el = document.getElementById("error");
  const errorText = document.getElementById("errorText");
  errorText.textContent = msg;
  el.classList.add("show");
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

// ✅ Add Enter key support
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        login();
      }
    });
  }
  
  const usernameInput = document.getElementById("username");
  if (usernameInput) {
    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("password").focus();
      }
    });
  }
});
