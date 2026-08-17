// Supabase Configuration
const SUPABASE_URL = "https://kzxdxnxgouthsywbsnvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let currentJob = null;
let jobId = null;
let otpInputs = [];

// DOM Elements
const loadingEl = document.getElementById("loading");
const errorStateEl = document.getElementById("errorState");
const jobBoxEl = document.getElementById("jobBox");

const categoryEl = document.getElementById("category");
const statusBadgeEl = document.getElementById("statusBadge");
const deviceEl = document.getElementById("device");
const issueEl = document.getElementById("issue");
const jobIdRefEl = document.getElementById("jobIdRef");
const customerEl = document.getElementById("customer");
const locationEl = document.getElementById("location");
const callBtn = document.getElementById("callBtn");
const smsBtn = document.getElementById("smsBtn");
const routeBtn = document.getElementById("routeBtn");

const arrivedBtn = document.getElementById("arrivedBtn");
const completeBtn = document.getElementById("completeBtn");

const otpOverlay = document.getElementById("otpOverlay");
const otpSheet = document.getElementById("otpSheet");
const otpErrorMessage = document.getElementById("otpErrorMessage");
const cancelOtpBtn = document.getElementById("cancelOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const completionOverlay = document.getElementById("completionOverlay");
const completionFeeText = document.getElementById("completionFeeText");
const completionDoneBtn = document.getElementById("completionDoneBtn");

const supportFloatBtn = document.getElementById("supportFloatBtn");
const supportOverlay = document.getElementById("supportOverlay");
const closeSupportBtn = document.getElementById("closeSupportBtn");

// ── INIT ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  setupOtpFields();
  setupEventListeners();

  const urlParams = new URLSearchParams(window.location.search);
  jobId = urlParams.get("job_id") || urlParams.get("id") || localStorage.getItem("active_tech_job_id");

  if (!jobId) {
    showError();
    return;
  }

  localStorage.setItem("active_tech_job_id", jobId);
  await loadJobDetails();
  subscribeToJobUpdates();
});

// ── FETCH JOB ──────────────────────────────────────────────────
async function loadJobDetails() {
  try {
    const { data: job, error } = await sb
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      showError();
      return;
    }

    currentJob = job;
    renderJob(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    showError();
  }
}

function renderJob(job) {
  loadingEl.classList.add("hidden");
  errorStateEl.classList.add("hidden");
  jobBoxEl.classList.remove("hidden");
  jobBoxEl.classList.add("reveal");

  categoryEl.textContent = job.category || "General Service";
  deviceEl.querySelector("span").textContent = job.device || job.category || "Home Appliance";
  issueEl.textContent = job.issue || "Standard service request";
  jobIdRefEl.querySelector("span").textContent = job.id.slice(0, 8).toUpperCase();
  customerEl.textContent = job.customer_name || "Customer";
  locationEl.textContent = job.location || job.address || "Service Location";

  if (job.phone) {
    callBtn.href = `tel:${job.phone}`;
    smsBtn.href = `https://wa.me/91${job.phone.replace(/\D/g, "")}`;
  }

  if (job.location) {
    routeBtn.onclick = () => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`, "_blank");
    };
  }

  updateStatusUI(job.status);
}

function updateStatusUI(status) {
  if (status === "arrived") {
    arrivedBtn.classList.add("hidden");
    statusBadgeEl.className = "inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full badge-arrived";
    statusBadgeEl.innerHTML = `<i class="fas fa-street-view text-[7px]"></i> <span>Arrived</span>`;
  } else if (status === "completed") {
    arrivedBtn.classList.add("hidden");
    completeBtn.classList.add("hidden");
    statusBadgeEl.className = "inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full badge-completed";
    statusBadgeEl.innerHTML = `<i class="fas fa-check text-[7px]"></i> <span>Completed</span>`;
  } else {
    statusBadgeEl.className = "inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full badge-progress";
    statusBadgeEl.innerHTML = `<i class="fas fa-play text-[7px]"></i> <span>In Progress</span>`;
  }
}

// ── REALTIME LISTENER ──────────────────────────────────────────
function subscribeToJobUpdates() {
  sb.channel(`tech_job_${jobId}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${jobId}` }, (payload) => {
      currentJob = payload.new;
      renderJob(currentJob);
    })
    .subscribe();
}

// ── ACTION HANDLERS (DIRECT OTP / NO RAZORPAY) ─────────────────
async function markArrived() {
  try {
    arrivedBtn.disabled = true;
    arrivedBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Updating...</span>`;

    const { error } = await sb.from("jobs").update({ status: "arrived" }).eq("id", jobId);
    if (error) throw error;

    showToast("Marked as arrived at customer location!", "success");
    arrivedBtn.classList.add("hidden");
  } catch (err) {
    showToast(err.message || "Failed to update arrival status", "error");
    arrivedBtn.disabled = false;
    arrivedBtn.innerHTML = `<i class="fas fa-flag-checkered"></i> <span>Mark Arrived at Location</span>`;
  }
}

// Generates 6-Digit OTP directly to Supabase and opens verify sheet
async function handleCompleteJob() {
  try {
    completeBtn.disabled = true;
    completeBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Generating Code...</span>`;

    // 1. Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Direct database update (bypasses any payment gateway trigger)
    const { error } = await sb
      .from("jobs")
      .update({
        otp: generatedOtp,
        completion_otp: generatedOtp,
        status: "in_progress"
      })
      .eq("id", jobId);

    if (error) throw error;

    showToast("Completion code generated on customer app!", "info");
    openOtpModal();
  } catch (err) {
    console.error("Complete job error:", err);
    showToast("Failed to initiate completion: " + err.message, "error");
  } finally {
    completeBtn.disabled = false;
    completeBtn.innerHTML = `<i class="fas fa-circle-check"></i> Complete Job & Unlock`;
  }
}

// Verify entered 6-digit OTP
async function verifyOtp() {
  const enteredOtp = otpInputs.map((input) => input.value).join("");

  if (enteredOtp.length < 6) {
    showOtpError("Please enter all 6 digits.");
    return;
  }

  try {
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Verifying...</span>`;

    // Fetch latest OTP from database
    const { data: job, error } = await sb.from("jobs").select("otp, completion_otp, price, payable_amount, quoted_amount").eq("id", jobId).single();

    if (error || !job) throw new Error("Could not verify OTP");

    const validOtp = job.completion_otp || job.otp;

    if (enteredOtp === String(validOtp)) {
      // Mark job closed
      await sb.from("jobs").update({ status: "completed" }).eq("id", jobId);

      closeOtpModal();
      const earned = job.quoted_amount || job.payable_amount || job.price || 299;
      completionFeeText.textContent = `₹${earned}`;
      completionOverlay.classList.remove("hidden");
    } else {
      showOtpError("Mismatched verification digits. Please check with customer.");
    }
  } catch (err) {
    showOtpError(err.message || "Verification failed");
  } finally {
    verifyOtpBtn.disabled = false;
    verifyOtpBtn.innerHTML = `<span>Verify Code</span> <i class="fas fa-arrow-right text-xs"></i>`;
  }
}

// ── OTP MODAL UTILITIES ────────────────────────────────────────
function setupOtpFields() {
  otpInputs = Array.from(document.querySelectorAll(".otp-box"));
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\D/g, "");
      e.target.value = val ? val[0] : "";
      if (val && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      e.target.classList.toggle("filled", !!val);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
      pasteData.split("").forEach((char, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = char;
          otpInputs[i].classList.add("filled");
        }
      });
      if (pasteData.length === 6) {
        otpInputs[5].focus();
      }
    });
  });
}

function openOtpModal() {
  otpErrorMessage.classList.add("hidden");
  otpInputs.forEach((i) => {
    i.value = "";
    i.classList.remove("filled");
  });
  otpOverlay.classList.remove("hidden");
  setTimeout(() => {
    otpOverlay.classList.remove("opacity-0");
    otpSheet.classList.remove("translate-y-full");
    otpInputs[0].focus();
  }, 10);
}

function closeOtpModal() {
  otpSheet.classList.add("translate-y-full");
  otpOverlay.classList.add("opacity-0");
  setTimeout(() => {
    otpOverlay.classList.add("hidden");
  }, 300);
}

function showOtpError(msg) {
  otpErrorMessage.textContent = msg;
  otpErrorMessage.classList.remove("hidden");
}

// ── TOAST & MODAL HELPERS ──────────────────────────────────────
function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas fa-${type === "success" ? "check" : type === "error" ? "triangle-exclamation" : "info"}"></i></div>
    <div class="flex-1 text-xs font-semibold leading-tight mt-0.5">${msg}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function showError() {
  loadingEl.classList.add("hidden");
  jobBoxEl.classList.add("hidden");
  errorStateEl.classList.remove("hidden");
}

function setupEventListeners() {
  arrivedBtn.addEventListener("click", markArrived);
  completeBtn.addEventListener("click", handleCompleteJob);
  cancelOtpBtn.addEventListener("click", closeOtpModal);
  verifyOtpBtn.addEventListener("click", verifyOtp);

  completionDoneBtn.addEventListener("click", () => {
    window.location.href = "technician-dashboard.html";
  });

  const errorBackBtn = document.getElementById("errorBackBtn");
  if (errorBackBtn) {
    errorBackBtn.addEventListener("click", () => (window.location.href = "technician-dashboard.html"));
  }

  supportFloatBtn.addEventListener("click", () => supportOverlay.classList.remove("hidden"));
  closeSupportBtn.addEventListener("click", () => supportOverlay.classList.add("hidden"));
}
