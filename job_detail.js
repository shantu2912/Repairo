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

// ══════════════════════════════════════════════
// LIVE LOCATION BROADCAST — pushes technician's real GPS to Supabase
// so the customer's tracking map shows a real position, not a simulation.
// ══════════════════════════════════════════════
let locationWatchId = null;
let lastBroadcastTime = 0;
let lastBroadcastCoords = null;

// Statuses during which the technician is still travelling and should be tracked live.
// This app has no "accepted"/"assigned" status — techniciandashboard.js's
// acceptJob() jumps straight from "pending" to "in_progress" on acceptance.
// "in_progress" is then reused again later for the quote-approval wait and
// for the completion-code broadcast, so status alone can't identify "en
// route". A technician is en route exactly when status is "in_progress"
// AND arrived_at hasn't been set yet.
function isTechEnRoute(job) {
  return job.status === "in_progress" && !job.arrived_at;
}

function startLiveLocationBroadcast() {
  if (locationWatchId !== null) return; // already watching

  if (!navigator.geolocation) {
    showToast("This device/browser doesn't support location sharing — customer won't see live tracking.", "warning", 5000);
    return;
  }

  locationWatchId = navigator.geolocation.watchPosition(
    pos => {
      console.log("[live-tracking] GPS fix:", pos.coords.latitude, pos.coords.longitude);
      broadcastLocation(pos.coords.latitude, pos.coords.longitude);
    },
    err => {
      console.warn("[live-tracking] watchPosition error:", err.code, err.message);
      if (err.code === err.PERMISSION_DENIED) {
        showToast("Location access is blocked. Enable it in your browser's site settings so the customer can see your live location.", "warning", 6000);
      } else {
        showToast("Couldn't get GPS signal for live tracking. Check your location settings.", "warning", 4200);
      }
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
  console.log("[live-tracking] watchPosition started, id:", locationWatchId);
}

function stopLiveLocationBroadcast() {
  if (locationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}

async function broadcastLocation(lat, lng) {
  const now = Date.now();

  // Throttle writes: skip if barely moved (<10m) and it's been under 8s,
  // and always enforce a hard floor of 4s between writes either way.
  if (lastBroadcastCoords) {
    const movedKm = calculateDistance(lat, lng, lastBroadcastCoords.lat, lastBroadcastCoords.lng);
    if (movedKm < 0.01 && (now - lastBroadcastTime) < 8000) return;
  }
  if ((now - lastBroadcastTime) < 4000) return;

  lastBroadcastTime = now;
  lastBroadcastCoords = { lat, lng };

  try {
    const { error } = await sb.from("jobs").update({
      tech_lat: lat,
      tech_lng: lng,
      tech_location_updated_at: new Date().toISOString()
    }).eq("id", jobId);

    // IMPORTANT: supabase-js does not throw on DB/RLS errors — it resolves
    // with { error }. Missing this check means failures fail 100% silently.
    if (error) {
      console.error("[live-tracking] broadcastLocation DB error:", error.message, error);
      if (!window.__locErrorToastShown) {
        window.__locErrorToastShown = true;
        showToast("Live tracking isn't reaching the server: " + error.message, "error", 6000);
      }
    } else {
      console.log("[live-tracking] location broadcast OK:", lat, lng);
    }
  } catch (err) {
    console.error("[live-tracking] broadcastLocation network/exception:", err.message);
  }
}

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

// ══════════════════════════════════════════════
// REAL ROAD ROUTING — OpenRouteService (free tier, no card required)
// Falls back silently to straight-line distance if it fails or is unavailable.
// ══════════════════════════════════════════════
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ1OTc5OWRiMzEwZDRlZDc4MGRhMzcyMmRhZGJiYTlmIiwiaCI6Im11cm11cjY0In0=";

let lastRouteFetchTime = 0;
let lastRouteFetchCoords = null;
let lastRouteResult = null; // { distanceKm, durationMin, coordinates: [[lat,lng], ...] }

async function fetchRoute(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car` +
      `?api_key=${ORS_API_KEY}&start=${fromLng},${fromLat}&end=${toLng},${toLat}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[routing] ORS request failed:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;

    const distanceKm = feature.properties.summary.distance / 1000;
    const durationMin = feature.properties.summary.duration / 60;
    // ORS returns [lng, lat] pairs; Leaflet wants [lat, lng]
    const coordinates = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return { distanceKm, durationMin, coordinates };
  } catch (err) {
    console.warn("[routing] ORS fetch error:", err.message);
    return null;
  }
}

// Pulls a fresh route at most every ~15-20s (or when the technician has
// moved meaningfully), and pushes it to Supabase so the customer's map can
// draw the same road route. Never blocks the ETA display — if this fails,
// the caller falls back to straight-line distance automatically.
async function maybeRefreshRoute(currentLat, currentLng, destLat, destLng) {
  const now = Date.now();
  const movedKm = lastRouteFetchCoords
    ? calculateDistance(currentLat, currentLng, lastRouteFetchCoords.lat, lastRouteFetchCoords.lng)
    : Infinity;
  const routeIsStale = (now - lastRouteFetchTime) > 20000;

  if (!((movedKm > 0.05 || routeIsStale) && (now - lastRouteFetchTime) > 8000)) {
    return; // too soon / hasn't moved enough — reuse lastRouteResult
  }

  lastRouteFetchTime = now;
  lastRouteFetchCoords = { lat: currentLat, lng: currentLng };

  const route = await fetchRoute(currentLat, currentLng, destLat, destLng);
  if (!route) return; // keep whatever lastRouteResult we already had

  lastRouteResult = route;

  const { error } = await sb.from("jobs").update({
    route_geometry: JSON.stringify(route.coordinates),
    route_distance_km: route.distanceKm,
    route_duration_min: route.durationMin,
    route_updated_at: new Date().toISOString()
  }).eq("id", jobId);

  if (error) console.warn("[routing] Could not save route to Supabase:", error.message);
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
      // Fire-and-forget: don't let a slow/failed ORS call block the display.
      maybeRefreshRoute(current.lat, current.lng, destCoordsCache.lat, destCoordsCache.lng);

      let distanceKm, etaMinutes;
      if (lastRouteResult) {
        distanceKm = lastRouteResult.distanceKm;
        etaMinutes = Math.max(1, Math.round(lastRouteResult.durationMin));
      } else {
        // Fallback straight-line estimate — used until the first route
        // arrives, or permanently if ORS is unreachable/quota'd out.
        distanceKm = calculateDistance(current.lat, current.lng, destCoordsCache.lat, destCoordsCache.lng);
        let avgSpeed = 28;
        if (distanceKm > 12) avgSpeed = 48;
        else if (distanceKm > 5) avgSpeed = 38;
        etaMinutes = Math.max(1, Math.round((distanceKm / avgSpeed) * 60));
      }

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
  setupAdditionalIssue();

  // ── One-time geocode of the customer's address, cached on the job row ──
  // This lets the customer's tracking page place its home marker at a real
  // location instead of guessing, and saves us re-hitting Nominatim later.
  if (data.customer_lat != null && data.customer_lng != null) {
    destCoordsCache = { lat: Number(data.customer_lat), lng: Number(data.customer_lng) };
  } else if (data.location) {
    geocodeAddress(data.location).then(coords => {
      if (!coords) return;
      destCoordsCache = coords;
      jobData.customer_lat = coords.lat;
      jobData.customer_lng = coords.lng;
      sb.from("jobs").update({
        customer_lat: coords.lat,
        customer_lng: coords.lng
      }).eq("id", jobId).then(({ error }) => {
        if (error) console.warn("Could not cache customer coordinates:", error.message);
      });
    });
  }

  // ── Start/stop live GPS broadcast based on job status ──
  console.log(`[live-tracking] status="${data.status}", arrived_at=${data.arrived_at || "null"} — tracking ${isTechEnRoute(data) ? "ENABLED" : "disabled"}`);
  if (isTechEnRoute(data)) {
    startLiveLocationBroadcast();
  } else {
    stopLiveLocationBroadcast();
  }

  initRepairPassport();

  // Quote is available for EVERY active job. A customer can report an additional
  // issue even when the original booking was a normal fixed-price service.
  const quoteCard = document.getElementById("inspectionQuoteCard");
  if (quoteCard) quoteCard.classList.remove("hidden");

  const isInspectionJob = data.is_inspection_job === true;
  const inspectionFee = isInspectionJob ? (Number(data.inspection_fee_amount) || 0) : 0;

  const title = document.getElementById("quoteCardTitle");
  const subtitle = document.getElementById("quoteCardSubtitle");
  const feeBadgeWrap = document.getElementById("inspectionFeeBadgeWrap");
  const adjustmentBox = document.getElementById("inspectionAdjustmentBox");
  const normalInfoBox = document.getElementById("normalQuoteInfoBox");
  const adjustmentRow = document.getElementById("adjustmentRow");

  if (isInspectionJob) {
    if (title) title.innerText = "Inspection Quote";
    if (subtitle) subtitle.innerText = "Enter the repair cost after inspection and send it to the customer for approval.";
    if (feeBadgeWrap) feeBadgeWrap.classList.remove("hidden");
    if (adjustmentBox) adjustmentBox.classList.remove("hidden");
    if (normalInfoBox) normalInfoBox.classList.add("hidden");
    if (adjustmentRow) adjustmentRow.classList.remove("hidden");

    const feeLabel = document.getElementById("inspectionFeeLabel");
    const feeBadge = document.getElementById("inspectionFeeBadge");
    if (feeLabel) feeLabel.innerText = inspectionFee;
    if (feeBadge) feeBadge.innerText = inspectionFee;
  } else {
    if (title) title.innerText = "Additional Work Quote";
    if (subtitle) subtitle.innerText = "Customer has another issue? Quote the extra work here.";
    if (feeBadgeWrap) feeBadgeWrap.classList.add("hidden");
    if (adjustmentBox) adjustmentBox.classList.add("hidden");
    if (normalInfoBox) normalInfoBox.classList.remove("hidden");
    if (adjustmentRow) adjustmentRow.classList.add("hidden");
  }

  if (data.other_issue && data.other_issue.trim()) {
    const otherBox = document.getElementById("customerOtherIssueBox");
    const otherText = document.getElementById("customerOtherIssueText");
    if (otherBox && otherText) {
      otherText.innerText = data.other_issue.trim();
      otherBox.classList.remove("hidden");
    }
  }

  // Show all booked services whenever there is more than one service.
  if (data.device && data.device.includes(',')) {
    const mixedBox = document.getElementById("mixedServicesBox");
    const mixedText = document.getElementById("mixedServicesText");
    if (mixedBox && mixedText) {
      mixedText.innerText = data.device;
      mixedBox.classList.remove("hidden");
    }
  }

  // Once any quote has been approved, hide the quote editor for that quote.
  if (data.quote_status === "approved") {
    showToast("Customer approved the quote. You can continue the repair work now.", "success", 4200);
    if (quoteCard) quoteCard.style.display = "none";
  } else if (data.quote_status === "submitted") {
    // Restore waiting state after refresh/reopen.
    const submitBtn = document.getElementById("submitQuoteBtn");
    const cancelBtn = document.getElementById("cancelQuoteBtn");
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Waiting for Approval';
      submitBtn.disabled = true;
    }
    if (cancelBtn) cancelBtn.style.display = "none";
    ["labourCost", "materialCost", "extraCharges", "quoteDescription"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
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
    stopLiveLocationBroadcast(); // job no longer "en route" — stop pushing GPS updates
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
        pendingCompletionFee = fee;

        verifyBtn.innerHTML = '<i class="fas fa-circle-check"></i> Code Verified!';
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);

        closeOtpBottomSheet();
        openPassportCaptureSheet(); // diagnosis/parts/warranty, then this actually marks the job completed

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

// ══════════════════════════════════════════════
// ADDITIONAL ISSUE (SEPARATE FROM QUOTE LOGIC)
// ══════════════════════════════════════════════
function setupAdditionalIssue() {
    const issueInput = document.getElementById("additionalIssueText");
    const priceInput = document.getElementById("additionalIssuePrice");
    const preview = document.getElementById("additionalIssuePreview");
    const saveBtn = document.getElementById("saveAdditionalIssueBtn");
    const status = document.getElementById("additionalIssueStatus");

    if (!issueInput || !priceInput || !saveBtn) return;

    // Load existing values when the job already has an additional issue saved.
    if (jobData?.additional_issue) issueInput.value = jobData.additional_issue;
    if (jobData?.additional_issue_price != null) priceInput.value = jobData.additional_issue_price;

    const updatePreview = () => {
        const price = Math.max(0, Number(priceInput.value) || 0);
        if (preview) preview.textContent = `₹${price}`;
    };

    priceInput.addEventListener("input", updatePreview);
    updatePreview();

    saveBtn.addEventListener("click", async () => {
        const issue = issueInput.value.trim();
        const price = Math.max(0, Number(priceInput.value) || 0);

        if (!issue) {
            showToast("Please enter the additional issue.", "warning", 2600);
            issueInput.focus();
            return;
        }

        if (price <= 0) {
            showToast("Please enter the additional price.", "warning", 2600);
            priceInput.focus();
            return;
        }

        const originalHtml = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            // IMPORTANT: These fields are intentionally separate from quoted_amount,
            // quoted_labour, quoted_material, quoted_extra and quote_status.
            const { data, error } = await sb
                .from("jobs")
                .update({
                    additional_issue: issue,
                    additional_issue_price: price
                })
                .eq("id", jobId)
                .select("additional_issue, additional_issue_price")
                .single();

            if (error) throw error;

            jobData.additional_issue = data?.additional_issue ?? issue;
            jobData.additional_issue_price = data?.additional_issue_price ?? price;

            if (status) {
                status.textContent = `✓ Saved: ${issue} — ₹${price}`;
                status.classList.remove("hidden");
            }
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
            showToast("Additional issue saved separately from the quote.", "success", 3000);

            setTimeout(() => {
                saveBtn.innerHTML = originalHtml;
                saveBtn.disabled = false;
            }, 1400);
        } catch (err) {
            console.error("Additional issue save error:", err);
            showToast("Could not save additional issue. Make sure the jobs table has additional_issue and additional_issue_price columns.", "error", 5000);
            saveBtn.innerHTML = originalHtml;
            saveBtn.disabled = false;
        }
    });
}

function getQuotePricing() {
    const isInspectionJob = jobData?.is_inspection_job === true;
    const inspectionFee = isInspectionJob ? (Number(jobData?.inspection_fee_amount) || 0) : 0;
    return { isInspectionJob, inspectionFee };
}

function setupQuotePreview() {
    const inputs = ["labourCost", "materialCost", "extraCharges"];

    function updatePreview() {
        const labour = Number(document.getElementById("labourCost")?.value) || 0;
        const material = Number(document.getElementById("materialCost")?.value) || 0;
        const extra = Number(document.getElementById("extraCharges")?.value) || 0;
        const total = labour + material + extra;
        const { inspectionFee } = getQuotePricing();

        // For inspection jobs the already-paid inspection fee is deducted.
        // For normal bookings there is NO fake/default inspection deduction.
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
        if (el && !el.dataset.quotePreviewBound) {
            el.dataset.quotePreviewBound = "1";
            el.addEventListener("input", updatePreview);
        }
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
    const { isInspectionJob, inspectionFee } = getQuotePricing();
    const customerPayable = Math.max(0, totalQuote - inspectionFee);

    const inspectionLine = isInspectionJob
        ? `Inspection Fee Paid: ₹${inspectionFee}\n`
        : "";

    const quoteTypeLine = isInspectionJob
        ? "Inspection / Repair Quote"
        : "Additional Work Quote";

    const confirmMsg = `📋 ${quoteTypeLine}\n\n` +
        `Labour: ₹${labour}\n` +
        `Material: ₹${material}\n` +
        `Extra Charges: ₹${extra}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `Total Quote: ₹${totalQuote}\n` +
        inspectionLine +
        `━━━━━━━━━━━━━━━\n` +
        `Customer Payable for this quote: ₹${customerPayable}\n\n` +
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

        showToast(`Quote submitted — ₹${totalQuote} total, ₹${customerPayable} payable for this quote. Waiting for approval.`, "success", 4200);

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



// ══════════════════════════════════════════════
// FIXZENIX REPAIR PASSPORT™
// Links this job to a persistent per-appliance asset record and surfaces
// its full repair history to the technician before they start work.
// ══════════════════════════════════════════════
const passportLoading = document.getElementById("passportLoading");
const passportLinkSection = document.getElementById("passportLinkSection");
const passportLinkedSection = document.getElementById("passportLinkedSection");
const passportExistingAssets = document.getElementById("passportExistingAssets");
const passportShowNewAssetForm = document.getElementById("passportShowNewAssetForm");
const passportNewAssetForm = document.getElementById("passportNewAssetForm");
const passportCreateAssetBtn = document.getElementById("passportCreateAssetBtn");
const passportHistoryList = document.getElementById("passportHistoryList");
const passportNoHistory = document.getElementById("passportNoHistory");
const linkedAssetLabel = document.getElementById("linkedAssetLabel");
const linkedAssetMeta = document.getElementById("linkedAssetMeta");
const repeatIssueBanner = document.getElementById("repeatIssueBanner");
const repeatIssueDetail = document.getElementById("repeatIssueDetail");

if (passportShowNewAssetForm) {
  passportShowNewAssetForm.onclick = () => {
    passportNewAssetForm.classList.toggle("hidden");
  };
}

async function initRepairPassport() {
  const card = document.getElementById("passportCard");
  if (!jobData.user_id) {
    // Guest booking with no account — can't build a persistent history for them.
    if (card) card.classList.add("hidden");
    return;
  }
  if (card) card.classList.remove("hidden");

  if (jobData.asset_id) {
    await loadLinkedAssetAndHistory(jobData.asset_id);
  } else {
    await loadCandidateAssets();
  }
}

async function loadCandidateAssets() {
  passportLoading.classList.remove("hidden");
  passportLinkedSection.classList.add("hidden");

  const { data: assets, error } = await sb
    .from("assets")
    .select("*")
    .eq("user_id", jobData.user_id)
    .order("created_at", { ascending: false });

  passportLoading.classList.add("hidden");
  passportLinkSection.classList.remove("hidden");

  if (error) {
    console.warn("[passport] Could not load assets:", error.message);
    passportExistingAssets.innerHTML = "";
    return;
  }

  // Same-category assets first, since that's the most likely match.
  const sorted = [...(assets || [])].sort((a, b) => {
    const aMatch = a.category === jobData.category ? 0 : 1;
    const bMatch = b.category === jobData.category ? 0 : 1;
    return aMatch - bMatch;
  });

  if (sorted.length === 0) {
    passportExistingAssets.innerHTML = `<p class="text-xs text-brand-dark/40 py-1">No appliances on file for this customer yet.</p>`;
    return;
  }

  passportExistingAssets.innerHTML = sorted.map(asset => `
    <button type="button" class="w-full text-left bg-brand-beige/15 hover:bg-brand-beige/30 border border-brand-beige/30 rounded-xl p-3 transition passport-pick-asset" data-asset-id="${asset.id}">
      <p class="text-sm font-bold text-brand-dark">${escapeHtml(asset.device_label)}</p>
      <p class="text-[10px] text-brand-dark/40 mt-0.5">${escapeHtml([asset.category, asset.brand, asset.model].filter(Boolean).join(" · ") || "No details on file")}</p>
    </button>
  `).join("");

  passportExistingAssets.querySelectorAll(".passport-pick-asset").forEach(btn => {
    btn.onclick = () => linkAssetToJob(btn.dataset.assetId);
  });
}

if (passportCreateAssetBtn) {
  passportCreateAssetBtn.onclick = async () => {
    const label = document.getElementById("assetLabelInput").value.trim();
    if (!label) {
      showToast("Give the appliance a name first.", "warning", 2400);
      return;
    }
    passportCreateAssetBtn.disabled = true;
    passportCreateAssetBtn.textContent = "Saving…";

    const brand = document.getElementById("assetBrandInput").value.trim() || null;
    const model = document.getElementById("assetModelInput").value.trim() || null;
    const yearVal = document.getElementById("assetYearInput").value;
    const purchase_year = yearVal ? parseInt(yearVal, 10) : null;

    const { data: newAsset, error } = await sb.from("assets").insert({
      user_id: jobData.user_id,
      category: jobData.category || null,
      device_label: label,
      brand, model, purchase_year
    }).select().single();

    if (error || !newAsset) {
      showToast("Could not save appliance: " + (error?.message || "unknown error"), "error");
      passportCreateAssetBtn.disabled = false;
      passportCreateAssetBtn.textContent = "Save & Link";
      return;
    }

    await linkAssetToJob(newAsset.id);
  };
}

async function linkAssetToJob(assetId) {
  const { error } = await sb.from("jobs").update({ asset_id: assetId }).eq("id", jobId);
  if (error) {
    showToast("Could not link appliance: " + error.message, "error");
    return;
  }
  jobData.asset_id = assetId;
  await loadLinkedAssetAndHistory(assetId);
}

async function loadLinkedAssetAndHistory(assetId) {
  passportLoading.classList.remove("hidden");
  passportLinkSection.classList.add("hidden");
  passportLinkedSection.classList.add("hidden");

  const { data: asset, error: assetErr } = await sb.from("assets").select("*").eq("id", assetId).single();
  if (assetErr || !asset) {
    console.warn("[passport] Could not load asset:", assetErr?.message);
    passportLoading.classList.add("hidden");
    return;
  }

  const { data: history, error: histErr } = await sb
    .from("jobs")
    .select("id, issue, diagnosis, parts_installed, final_amount, customer_price, quoted_amount, completed_at, warranty_until, is_repeat_issue, tech_id")
    .eq("asset_id", assetId)
    .eq("status", "completed")
    .neq("id", jobId)
    .order("completed_at", { ascending: false });

  if (histErr) console.warn("[passport] Could not load history:", histErr.message);

  const historyRows = history || [];

  // Resolve technician names for the history rows in one batch query.
  const techIds = [...new Set(historyRows.map(h => h.tech_id).filter(Boolean))];
  let techNames = {};
  if (techIds.length > 0) {
    const { data: techs } = await sb.from("technicians").select("id, name").in("id", techIds);
    (techs || []).forEach(t => { techNames[t.id] = t.name; });
  }

  passportLoading.classList.add("hidden");
  passportLinkedSection.classList.remove("hidden");

  linkedAssetLabel.textContent = asset.device_label;
  linkedAssetMeta.textContent = [asset.category, asset.brand, asset.model, asset.purchase_year ? `~${new Date().getFullYear() - asset.purchase_year} yrs old` : null]
    .filter(Boolean).join(" · ");

  // Warranty callback check: most recent history entry still under warranty.
  const now = new Date();
  const activeWarrantyEntry = historyRows.find(h => h.warranty_until && new Date(h.warranty_until) > now);
  if (activeWarrantyEntry && !jobData.is_repeat_issue) {
    const untilStr = new Date(activeWarrantyEntry.warranty_until).toLocaleDateString();
    repeatIssueDetail.textContent = `Prior repair "${activeWarrantyEntry.diagnosis || activeWarrantyEntry.issue || "—"}" is still under warranty until ${untilStr}.`;
    repeatIssueBanner.classList.remove("hidden");

    jobData.is_repeat_issue = true;
    jobData.repeat_of_job_id = activeWarrantyEntry.id;
    sb.from("jobs").update({
      is_repeat_issue: true,
      repeat_of_job_id: activeWarrantyEntry.id
    }).eq("id", jobId).then(({ error }) => {
      if (error) console.warn("[passport] Could not flag repeat issue:", error.message);
    });
  } else {
    repeatIssueBanner.classList.add("hidden");
  }

  if (historyRows.length === 0) {
    passportNoHistory.classList.remove("hidden");
    passportHistoryList.innerHTML = "";
    return;
  }
  passportNoHistory.classList.add("hidden");

  passportHistoryList.innerHTML = historyRows.map(h => {
    const cost = h.final_amount ?? h.customer_price ?? h.quoted_amount;
    const dateStr = h.completed_at ? new Date(h.completed_at).toLocaleDateString() : "—";
    const techName = techNames[h.tech_id] || "Technician";
    const warrantyBadge = h.warranty_until
      ? (new Date(h.warranty_until) > now
          ? `<span class="text-[9px] font-bold text-green-600">Under warranty until ${new Date(h.warranty_until).toLocaleDateString()}</span>`
          : `<span class="text-[9px] text-brand-dark/30">Warranty expired</span>`)
      : "";
    const repeatTag = h.is_repeat_issue ? `<span class="text-[9px] font-bold text-amber-600 ml-1"><i class="fas fa-rotate-left"></i> Repeat</span>` : "";

    return `
      <div class="bg-brand-beige/10 border border-brand-beige/30 rounded-xl p-3">
        <div class="flex items-center justify-between mb-1">
          <p class="text-[10px] font-bold text-brand-dark/60">${dateStr} · ${escapeHtml(techName)}</p>
          ${cost != null ? `<p class="text-[10px] font-mono text-brand-dark/50">₹${cost}</p>` : ""}
        </div>
        <p class="text-xs text-brand-dark"><span class="font-bold">Complaint:</span> ${escapeHtml(h.issue || "—")}</p>
        ${h.diagnosis ? `<p class="text-xs text-brand-dark mt-0.5"><span class="font-bold">Diagnosis:</span> ${escapeHtml(h.diagnosis)}</p>` : ""}
        ${h.parts_installed ? `<p class="text-xs text-brand-dark mt-0.5"><span class="font-bold">Parts:</span> ${escapeHtml(h.parts_installed)}</p>` : ""}
        <div class="mt-1.5">${warrantyBadge}${repeatTag}</div>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ══════════════════════════════════════════════
// REPAIR PASSPORT™ CAPTURE — shown after OTP verification, before the job closes
// ══════════════════════════════════════════════
const passportCaptureOverlay = document.getElementById("passportCaptureOverlay");
const passportCaptureSheet = document.getElementById("passportCaptureSheet");
const passportCaptureError = document.getElementById("passportCaptureError");
const passportCaptureSaveBtn = document.getElementById("passportCaptureSaveBtn");
let pendingCompletionFee = 0;

function openPassportCaptureSheet() {
  passportCaptureOverlay.classList.remove("hidden");
  setTimeout(() => {
    passportCaptureOverlay.classList.add("opacity-100");
    passportCaptureSheet.classList.remove("translate-y-full");
  }, 50);
}

function closePassportCaptureSheet() {
  passportCaptureSheet.classList.add("translate-y-full");
  passportCaptureOverlay.classList.remove("opacity-100");
  setTimeout(() => passportCaptureOverlay.classList.add("hidden"), 300);
}

if (passportCaptureSaveBtn) {
  passportCaptureSaveBtn.onclick = async () => {
    const diagnosis = document.getElementById("passportDiagnosisInput").value.trim();
    const partsInstalled = document.getElementById("passportPartsInput").value.trim() || null;
    const warrantyDaysVal = document.getElementById("passportWarrantyInput").value;
    const warrantyDays = warrantyDaysVal ? parseInt(warrantyDaysVal, 10) : 0;

    if (!diagnosis) {
      passportCaptureError.classList.remove("hidden");
      return;
    }
    passportCaptureError.classList.add("hidden");

    passportCaptureSaveBtn.disabled = true;
    passportCaptureSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const now = new Date();
    const warranty_until = warrantyDays > 0
      ? new Date(now.getTime() + warrantyDays * 86400000).toISOString()
      : null;

    try {
      const { error } = await sb.from("jobs").update({
        status: "completed",
        completed_at: now.toISOString(),
        technician_fee: pendingCompletionFee,
        diagnosis,
        parts_installed: partsInstalled,
        warranty_days: warrantyDays || null,
        warranty_until
      }).eq("id", jobId);

      if (error) throw error;

      localStorage.removeItem("locked_job_id");
      window.onpopstate = null;
      if (etaInterval) clearInterval(etaInterval);
      if (elapsedInterval) clearInterval(elapsedInterval);
      if (realtimeChannel) sb.removeChannel(realtimeChannel);

      closePassportCaptureSheet();
      showCompletionModal(pendingCompletionFee);
    } catch (err) {
      showToast("Could not save Repair Passport entry: " + err.message, "error");
      passportCaptureSaveBtn.disabled = false;
      passportCaptureSaveBtn.innerHTML = '<span>Save &amp; Close Job</span> <i class="fas fa-arrow-right text-xs"></i>';
    }
  };
}

loadJob();

window.addEventListener("beforeunload", () => {
  if (etaInterval) clearInterval(etaInterval);
  if (elapsedInterval) clearInterval(elapsedInterval);
  if (realtimeChannel) sb.removeChannel(realtimeChannel);
  stopLiveLocationBroadcast();
});
