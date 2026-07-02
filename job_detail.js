const sb = supabase.createClient(
  "https://kzxdxnxgouthsywbsnvl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag"
);

const jobId = localStorage.getItem("locked_job_id");

if (!jobId) {
  window.location.href = "techniciandashboard.html";
}

// ══════════════════════════════════════════════
// TOAST NOTIFICATIONS — non-blocking replacement for alert()
// ══════════════════════════════════════════════
const TOAST_ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-exclamation",
  warning: "fa-triangle-exclamation",
  info: "fa-circle-info"
};

function showToast(message, type = "info", duration = 3400) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${TOAST_ICONS[type] || TOAST_ICONS.info}"></i></div>
    <p class="text-sm font-medium leading-snug flex-1">${message}</p>
  `;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 250);
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener("click", () => { clearTimeout(timer); remove(); });
  return toast;
}

// ── LOCK VEHICLE & HISTORICAL NAVIGATION STATES ──
// Pushes dummy states onto the history stack to intercept and completely block back button/swipes
function lockBrowserNavigation() {
  history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
    history.pushState(null, null, window.location.href);
    showToast("Active Job Console Locked. Complete verification via the customer code to leave this window.", "warning", 3800);
  };
}
lockBrowserNavigation();

let jobData = null;
let etaInterval = null;
let elapsedInterval = null;
let destCoordsCache = null;
let lastGeocodeTime = 0;
let generatedOtpReference = null;
let realtimeChannel = null;
let jobStartTime = null;

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }),
      err => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'FixZenPro/2.0' } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.warn("Geocoding error:", err);
    return null;
  }
}

async function updateDistanceAndETA() {
  if (!jobData || !jobData.location) return;

  try {
    const current = await getCurrentLocation();
    const now = Date.now();
    if (!destCoordsCache || (now - lastGeocodeTime) > 600000) {
      lastGeocodeTime = now;
      destCoordsCache = await geocodeAddress(jobData.location);
    }

    if (destCoordsCache) {
      const distanceKm = calculateDistance(current.lat, current.lng, destCoordsCache.lat, destCoordsCache.lng);

      let avgSpeed = 28;
      if (distanceKm > 12) avgSpeed = 48;
      else if (distanceKm > 5) avgSpeed = 38;

      const etaMinutes = Math.max(1, Math.round((distanceKm / avgSpeed) * 60));

      const distanceElem = document.getElementById("distanceText");
      if (distanceKm < 0.15) {
        distanceElem.innerHTML = `<span class="text-success"><i class="fas fa-location-dot text-xs"></i> ${Math.round(distanceKm * 1000)} m</span>`;
      } else {
        distanceElem.innerHTML = `${distanceKm.toFixed(1)} km`;
      }

      const etaElem = document.getElementById("etaText");
      if (distanceKm < 0.1) {
        etaElem.innerHTML = `<span class="text-success"><i class="fas fa-hourglass-end"></i> Arrived</span>`;
        document.getElementById("etaProgressBar").style.width = "100%";
      } else if (etaMinutes < 60) {
        etaElem.innerHTML = `${etaMinutes} min`;
        const progress = Math.min(95, (1 - Math.min(1, distanceKm / 25)) * 100);
        document.getElementById("etaProgressBar").style.width = `${progress}%`;
      } else {
        const hours = Math.floor(etaMinutes / 60);
        const mins = etaMinutes % 60;
        etaElem.innerHTML = `${hours}h ${mins}m`;
        document.getElementById("etaProgressBar").style.width = `${Math.min(80, (1 - Math.min(1, distanceKm / 40)) * 80)}%`;
      }

      const timeElem = document.getElementById("lastUpdateTime");
      if (timeElem) {
        timeElem.innerHTML = `<i class="far fa-clock"></i> ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
      }

      // Only overlay a "Nearby" hint while still en-route (not once verifying/completed)
      if (distanceKm < 0.12 && jobData.status !== "in_progress" && jobData.status !== "completed") {
        const badge = document.getElementById("statusBadge");
        if (badge && !badge.dataset.nearby) {
          badge.dataset.nearby = "1";
          badge.innerHTML = '<i class="fas fa-map-marker-alt text-[7px] mr-1"></i> Nearby';
          badge.className = "inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full badge-nearby";
        }
      }
    } else {
      document.getElementById("distanceText").innerHTML = "📍 Use Nav";
      document.getElementById("etaText").innerHTML = "Open Maps";
    }
  } catch (err) {
    console.warn("ETA update:", err);
    document.getElementById("distanceText").innerHTML = '<span class="text-warning"><i class="fas fa-compass"></i> GPS off</span>';
    document.getElementById("etaText").innerHTML = "Enable location";
  }
}

function openNavigation(location) {
  if (!location) {
    showToast("Customer location not available.", "warning");
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        window.open(`https://maps.google.com/?saddr=${origin}&destination=${encodeURIComponent(location)}&travelmode=driving`, '_blank');
      },
      () => {
        window.open(`https://maps.google.com/?daddr=${encodeURIComponent(location)}&travelmode=driving`, '_blank');
      },
      { timeout: 3000 }
    );
  } else {
    window.open(`https://maps.google.com/?daddr=${encodeURIComponent(location)}`, '_blank');
  }
}

function manualRefresh() {
  const btn = document.getElementById("refreshLocationBtn");
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating';
    updateDistanceAndETA().finally(() => {
      btn.innerHTML = '<i class="fas fa-sync-alt text-[8px]"></i> Refresh';
    });
  } else {
    updateDistanceAndETA();
  }
}

// ══════════════════════════════════════════════
// STATUS BADGE — single source of truth (was duplicated 4x before)
// ══════════════════════════════════════════════
const STATUS_CONFIG = {
  arrived:     { icon: "fa-flag-checkered", label: "Arrived",        class: "badge-arrived" },
  in_progress: { icon: "fa-shield-check",   label: "Verifying Code", class: "badge-progress" },
  completed:   { icon: "fa-circle-check",   label: "Completed",      class: "badge-completed" }
};

function setStatusBadge(status) {
  const badge = document.getElementById("statusBadge");
  if (!badge) return;
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return;
  delete badge.dataset.nearby;
  badge.innerHTML = `<i class="fas ${cfg.icon} text-[7px] mr-1"></i> ${cfg.label}`;
  badge.className = `inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full ${cfg.class}`;
}

function syncActionButtons(status) {
  const arrivedBtn = document.getElementById("arrivedBtn");
  if (!arrivedBtn) return;
  // Prevent re-marking "arrived" once the job has already moved past that step
  if (status === "arrived" || status === "in_progress" || status === "completed") {
    arrivedBtn.disabled = true;
    arrivedBtn.querySelector("span").textContent = "Arrival Confirmed";
    arrivedBtn.querySelector("i").className = "fas fa-check-circle";
  }
}

// ══════════════════════════════════════════════
// ELAPSED JOB TIMER
// ══════════════════════════════════════════════
function startElapsedTimer(startIso) {
  jobStartTime = startIso ? new Date(startIso).getTime() : Date.now();
  const elapsedEl = document.querySelector("#elapsedTime span");
  if (!elapsedEl) return;
  if (elapsedInterval) clearInterval(elapsedInterval);

  const tick = () => {
    const diff = Math.max(0, Date.now() - jobStartTime);
    const totalMin = Math.floor(diff / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    elapsedEl.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  tick();
  elapsedInterval = setInterval(tick, 30000);
}

async function loadJob() {
  const { data, error } = await sb
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    document.getElementById("loading").style.display = "none";
    const errorState = document.getElementById("errorState");
    if (errorState) errorState.classList.remove("hidden");
    showToast("Job data sync exception or sequence missing.", "error", 3000);
    localStorage.removeItem("locked_job_id");
    window.onpopstate = null; // Open up native navigation scope securely
    setTimeout(() => { window.location.href = "techniciandashboard.html"; }, 2200);
    return;
  }
  jobData = data;

  if (data.is_inspection_job) {
    document.getElementById("inspectionQuoteCard").classList.remove("hidden");

    if (data.other_issue && data.other_issue.trim()) {
        const otherBox = document.getElementById("customerOtherIssueBox");
        const otherText = document.getElementById("customerOtherIssueText");
        if (otherBox && otherText) {
            otherText.innerText = data.other_issue.trim();
            otherBox.classList.remove("hidden");
        }
    }

    if (data.device && data.device.includes(',')) {
        const mixedBox = document.getElementById("mixedServicesBox");
        const mixedText = document.getElementById("mixedServicesText");
        if (mixedBox && mixedText) {
            mixedText.innerText = data.device;
            mixedBox.classList.remove("hidden");
        }
    }

    const feeAmount = data.inspection_fee_amount;
    const feeLabel = document.getElementById("inspectionFeeLabel");
    if (feeLabel && feeAmount) feeLabel.innerText = feeAmount;
    const feeBadge = document.getElementById("inspectionFeeBadge");
    if (feeBadge && feeAmount) feeBadge.innerText = feeAmount;
  }

  if (data.is_inspection_job && data.quote_status === "approved") {
    showToast("Customer approved the quote. You can start repair work now.", "success", 4200);
    document.getElementById("inspectionQuoteCard").style.display = "none";
  }

  document.getElementById("category").innerText = data.category || "Service";
  const deviceNames = (data.device || 'Work Order').split(',');
  document.getElementById("device").querySelector("span").innerText = deviceNames[0].trim();

  const finalIssue = data.issue || (data.other_issue ? `Other Issue: ${data.other_issue}` : "No issue description provided");
  document.getElementById("issue").innerText = finalIssue;
  document.getElementById("customer").innerText = data.customer_name || "Valued Customer";
  document.getElementById("location").innerText = data.location || "Address not specified";
  document.getElementById("jobIdRef").querySelector("span").innerText = `JOB-${data.id.slice(-8).toUpperCase()}`;

  const phone = data.phone || "";
  const callBtn = document.getElementById("callBtn");
  const smsBtn = document.getElementById("smsBtn");

  if (phone) {
    callBtn.href = `tel:${phone}`;
    smsBtn.href = `sms:${phone}`;
  } else {
    callBtn.style.opacity = "0.5";
    smsBtn.style.opacity = "0.5";
    callBtn.style.pointerEvents = "none";
    smsBtn.style.pointerEvents = "none";
  }

  if (data.status === "arrived" || data.status === "in_progress") {
    setStatusBadge(data.status);
  }
  syncActionButtons(data.status);

  if (data.status === "in_progress" && data.otp) {
    generatedOtpReference = data.otp;
    openOtpBottomSheet();
  }

  document.getElementById("routeBtn").onclick = () => openNavigation(data.location);

  document.getElementById("loading").style.display = "none";
  const jobBox = document.getElementById("jobBox");
  jobBox.classList.remove("hidden");
  jobBox.classList.add("reveal");

  startElapsedTimer(data.arrived_at || data.created_at);

  await updateDistanceAndETA();
  if (etaInterval) clearInterval(etaInterval);
  etaInterval = setInterval(updateDistanceAndETA, 10000);
}

// ══════════════════════════════════════════════
// COPY JOB ID
// ══════════════════════════════════════════════
const copyIdBtn = document.getElementById("copyIdBtn");
if (copyIdBtn) {
  copyIdBtn.addEventListener("click", async () => {
    const idText = document.getElementById("jobIdRef")?.querySelector("span")?.innerText || "";
    try {
      await navigator.clipboard.writeText(idText);
      showToast("Job ID copied to clipboard.", "success", 1800);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch {
      showToast("Couldn't copy — long-press to select instead.", "warning", 2400);
    }
  });
}

document.getElementById("arrivedBtn").onclick = async () => {
  if (!jobData) return;
  if (!confirm("Confirm you have arrived at customer's location?")) return;

  const btn = document.getElementById("arrivedBtn");
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
  btn.disabled = true;

  try {
    await sb.from("jobs").update({
      status: "arrived",
      arrived_at: new Date().toISOString()
    }).eq("id", jobId);

    jobData.status = "arrived";
    jobData.arrived_at = new Date().toISOString();
    setStatusBadge("arrived");
    startElapsedTimer(jobData.arrived_at);

    btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Arrival Confirmed</span>';
    // Stays disabled — arriving is a one-way step, prevents accidental status reversion
    if (navigator.vibrate) navigator.vibrate(100);
    showToast("Arrival marked!", "success", 2200);
  } catch (err) {
    showToast("Error: " + err.message, "error");
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
};

const otpOverlay = document.getElementById("otpOverlay");
const otpSheet = document.getElementById("otpSheet");
const otpInputs = document.querySelectorAll(".otp-box");
const otpErrorMsg = document.getElementById("otpErrorMessage");

function openOtpBottomSheet() {
    otpOverlay.classList.remove("hidden");
    setTimeout(() => {
        otpOverlay.classList.add("opacity-100");
        otpSheet.classList.remove("translate-y-full");
        otpInputs[0].focus();
    }, 50);
}

function closeOtpBottomSheet() {
    otpSheet.classList.add("translate-y-full");
    otpOverlay.classList.remove("opacity-100");
    setTimeout(() => {
        otpOverlay.classList.add("hidden");
        resetOtpFields();
    }, 300);
}

function resetOtpFields() {
    otpInputs.forEach(input => { input.value = ""; input.classList.remove("filled"); });
    otpErrorMsg.classList.add("hidden");
    otpSheet.classList.remove("animate__headShake");
}

otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        // Digits only — guards against soft keyboards that ignore inputmode/pattern
        const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = digitsOnly.slice(-1);
        const val = e.target.value;
        if (val.length > 0) {
            input.classList.add("filled");
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else {
            input.classList.remove("filled");
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
            otpInputs[index - 1].value = "";
            otpInputs[index - 1].classList.remove("filled");
            otpInputs[index - 1].focus();
        }
    });

    // Support pasting the full 6-digit code (e.g. from an SMS or the customer's screen)
    input.addEventListener("paste", (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "");
        if (!pasted) return;
        e.preventDefault();
        pasted.slice(0, 6).split("").forEach((digit, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = digit;
                otpInputs[i].classList.add("filled");
            }
        });
        const nextIdx = Math.min(pasted.length, 5);
        otpInputs[nextIdx].focus();
    });
});

document.getElementById("completeBtn").onclick = async () => {
  if (!jobData) return;

  const paymentConfirmed = confirm("⚠️ IMPORTANT: Have you collected full payment?\n\nPress OK to broadcast completion code to customer and open verification panel.");
  if (!paymentConfirmed) return;

  const btn = document.getElementById("completeBtn");
  const originalHtml = btn.innerHTML;

  generatedOtpReference = Math.floor(100000 + Math.random() * 900000).toString();
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Broadcasting Code...';
  btn.disabled = true;

  try {
    const { error: otpPostError } = await sb.from("jobs").update({
      status: "in_progress",
      otp: generatedOtpReference
    }).eq("id", jobId);

    if (otpPostError) throw otpPostError;

    jobData.status = "in_progress";
    setStatusBadge("in_progress");

    btn.innerHTML = originalHtml;
    btn.disabled = false;

    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    showToast("Code broadcast to customer. Ask them for the 6-digit code.", "info", 3200);
    openOtpBottomSheet();

  } catch (err) {
    showToast("Broadcast failure: " + err.message, "error");
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
};

document.getElementById("cancelOtpBtn").onclick = async () => {
    if (!confirm("Are you sure you want to cancel the code entry window?")) return;
    closeOtpBottomSheet();

    try {
      await sb.from("jobs").update({ status: "arrived", otp: null }).eq("id", jobId);
      jobData.status = "arrived";
      setStatusBadge("arrived");
    } catch (err) {
      showToast("Couldn't cancel verification: " + err.message, "error");
    }
};

document.getElementById("verifyOtpBtn").onclick = async () => {
    let collectedCodeString = "";
    otpInputs.forEach(input => collectedCodeString += input.value.trim());

    if (collectedCodeString.length < 6) {
        showToast("Please completely fill out all 6 digit blocks.", "warning", 2400);
        return;
    }

    const verifyBtn = document.getElementById("verifyOtpBtn");
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

    if (collectedCodeString !== generatedOtpReference) {
        setTimeout(async () => {
            if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
            otpErrorMsg.classList.remove("hidden");
            otpSheet.classList.add("animate__animated", "animate__headShake");
            verifyBtn.innerHTML = 'Verify Code <i class="fas fa-arrow-right text-xs"></i>';
            verifyBtn.disabled = false;

            setTimeout(() => otpSheet.classList.remove("animate__animated", "animate__headShake"), 600);
        }, 400);
        return;
    }

    try {
        const BASE_FEES = {
          "Carpenter": 800, "Plumber": 600, "Electrician": 600,
          "Painter": 600, "Mason": 600, "Welder": 600, "Roofer": 600, "AC Tech": 600
        };
        const fee = BASE_FEES[jobData.category] || 450;

        await sb.from("jobs").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          technician_fee: fee
        }).eq("id", jobId);

        localStorage.removeItem("locked_job_id");
        window.onpopstate = null; // Unbind system locks on successful validation lifecycle
        if (etaInterval) clearInterval(etaInterval);
        if (elapsedInterval) clearInterval(elapsedInterval);
        if (realtimeChannel) sb.removeChannel(realtimeChannel);

        verifyBtn.innerHTML = '<i class="fas fa-circle-check"></i> Code Success!';
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);

        closeOtpBottomSheet();
        showCompletionModal(fee);

    } catch (err) {
        showToast("Verification workflow terminal error: " + err.message, "error");
        verifyBtn.innerHTML = 'Verify Code <i class="fas fa-arrow-right text-xs"></i>';
        verifyBtn.disabled = false;
    }
};

// ══════════════════════════════════════════════
// COMPLETION CELEBRATION MODAL
// ══════════════════════════════════════════════
function showCompletionModal(fee) {
  const overlay = document.getElementById("completionOverlay");
  const feeText = document.getElementById("completionFeeText");
  if (feeText) feeText.textContent = `₹${fee}`;
  if (overlay) overlay.classList.remove("hidden");
}

const completionDoneBtn = document.getElementById("completionDoneBtn");
if (completionDoneBtn) {
  completionDoneBtn.addEventListener("click", () => {
    window.location.href = "techniciandashboard.html";
  });
}

// ══════════════════════════════════════════════
// SUPPORT MODAL
// ══════════════════════════════════════════════
const supportOverlay = document.getElementById("supportOverlay");
document.getElementById("supportFloatBtn").onclick = () => {
  if (supportOverlay) supportOverlay.classList.remove("hidden");
};
const closeSupportBtn = document.getElementById("closeSupportBtn");
if (closeSupportBtn) {
  closeSupportBtn.addEventListener("click", () => {
    if (supportOverlay) supportOverlay.classList.add("hidden");
  });
}

const errorBackBtn = document.getElementById("errorBackBtn");
if (errorBackBtn) {
  errorBackBtn.addEventListener("click", () => {
    window.onpopstate = null;
    window.location.href = "techniciandashboard.html";
  });
}

document.getElementById("refreshLocationBtn").onclick = manualRefresh;

function setupQuotePreview() {
    const inputs = ["labourCost", "materialCost", "extraCharges"];
    const inspectionFee = jobData?.inspection_fee_amount || 149;

    function updatePreview() {
        const labour = Number(document.getElementById("labourCost")?.value) || 0;
        const material = Number(document.getElementById("materialCost")?.value) || 0;
        const extra = Number(document.getElementById("extraCharges")?.value) || 0;
        const total = labour + material + extra;
        const payable = Math.max(0, total - inspectionFee);

        const previewLabour = document.getElementById("previewLabour");
        const previewMaterial = document.getElementById("previewMaterial");
        const previewExtra = document.getElementById("previewExtra");
        const previewTotal = document.getElementById("previewTotal");
        const previewPayable = document.getElementById("previewPayable");
        const adjustmentInfo = document.getElementById("adjustmentInfo");

        if (previewLabour) previewLabour.innerHTML = `₹${labour}`;
        if (previewMaterial) previewMaterial.innerHTML = `₹${material}`;
        if (previewExtra) previewExtra.innerHTML = `₹${extra}`;
        if (previewTotal) previewTotal.innerHTML = `₹${total}`;
        if (previewPayable) previewPayable.innerHTML = `₹${payable}`;
        if (adjustmentInfo) adjustmentInfo.innerHTML = `-₹${inspectionFee} (already paid)`;
    }

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", updatePreview);
    });
    updatePreview();
}

async function submitInspectionQuote() {
    const labour = Number(document.getElementById("labourCost")?.value) || 0;
    const material = Number(document.getElementById("materialCost")?.value) || 0;
    const extra = Number(document.getElementById("extraCharges")?.value) || 0;
    const description = document.getElementById("quoteDescription")?.value || "";

    if (!description.trim()) {
        showToast("Please provide a description of the work needed.", "warning", 2600);
        return;
    }

    if (labour === 0 && material === 0 && extra === 0) {
        showToast("Please enter at least one cost component for the quote.", "warning", 2600);
        return;
    }

    const totalQuote = labour + material + extra;
    const inspectionFee = jobData?.inspection_fee_amount || 299;
    const fixedServicesTotal = jobData?.original_price ? (jobData.original_price - inspectionFee) : 0;
    const customerPayable = Math.max(0, totalQuote - inspectionFee);

    const fixedLine = fixedServicesTotal > 0
        ? `Fixed Services (already included): ₹${fixedServicesTotal}\n`
        : "";
    const confirmMsg = `📋 Quote Summary\n\n` +
        `Labour: ₹${labour}\n` +
        `Material: ₹${material}\n` +
        `Extra Charges: ₹${extra}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `Total Quote: ₹${totalQuote}\n` +
        `Inspection Fee Paid: ₹${inspectionFee}\n` +
        fixedLine +
        `━━━━━━━━━━━━━━━\n` +
        `Customer Payable: ₹${customerPayable}\n\n` +
        `Send this quote to the customer for approval?`;

    if (!confirm(confirmMsg)) return;

    const submitBtn = document.getElementById("submitQuoteBtn");
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const { error } = await sb
            .from("jobs")
            .update({
                quoted_amount: totalQuote,
                quoted_labour: labour,
                quoted_material: material,
                quoted_extra: extra,
                quote_description: description,
                quote_status: "submitted",
                status: "in_progress"
            })
            .eq("id", jobId);

        if (error) throw error;

        showToast(`Quote submitted — ₹${totalQuote} total, ₹${customerPayable} payable. Waiting for approval.`, "success", 4200);

        submitBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Waiting for Approval';
        submitBtn.disabled = true;

        const cancelBtn = document.getElementById("cancelQuoteBtn");
        if (cancelBtn) cancelBtn.style.display = "none";

        ["labourCost", "materialCost", "extraCharges", "quoteDescription"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });

        jobData.quote_status = "submitted";
        jobData.quoted_amount = totalQuote;

    } catch (err) {
        showToast("Error submitting quote: " + err.message, "error");
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;
    }
}

const cancelQuoteBtn = document.getElementById("cancelQuoteBtn");
if (cancelQuoteBtn) {
    cancelQuoteBtn.addEventListener("click", () => {
        if (confirm("Cancel this quote? The customer will be notified.")) {
            document.getElementById("inspectionQuoteCard").classList.add("hidden");
        }
    });
}

const submitQuoteBtn = document.getElementById("submitQuoteBtn");
if (submitQuoteBtn) {
    submitQuoteBtn.addEventListener("click", submitInspectionQuote);
}

const quoteCard = document.getElementById("inspectionQuoteCard");
if (quoteCard) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === "class") {
                if (quoteCard && !quoteCard.classList.contains("hidden")) {
                    setTimeout(() => setupQuotePreview(), 100);
                    observer.disconnect();
                }
            }
        });
    });
    observer.observe(quoteCard, { attributes: true });

    if (!quoteCard.classList.contains("hidden")) {
        setupQuotePreview();
    }
}

if (jobId) {
    realtimeChannel = sb.channel("quote-approval-" + jobId)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "jobs",
                filter: `id=eq.${jobId}`
            },
            payload => {
                if (payload.new.quote_status === "approved") {
                    showToast("Customer approved the quote. You can start the repair work now.", "success", 4200);
                    jobData.quote_status = "approved";
                    const quoteCardElement = document.getElementById("inspectionQuoteCard");
                    if (quoteCardElement) {
                        quoteCardElement.style.display = "none";
                    }
                    sb.from("jobs").update({ status: "accepted" }).eq("id", jobId);
                }
                if (payload.new.quote_status === "rejected") {
                    showToast("Customer rejected the quote. The job has been closed.", "error", 3200);
                    window.onpopstate = null; // Open native navigation frame safely before redirecting out
                    setTimeout(() => { window.location.href = "techniciandashboard.html"; }, 1800);
                }
            }
        )
        .subscribe();
}

loadJob();

window.addEventListener("beforeunload", () => {
  if (etaInterval) clearInterval(etaInterval);
  if (elapsedInterval) clearInterval(elapsedInterval);
  if (realtimeChannel) sb.removeChannel(realtimeChannel);
});
