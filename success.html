<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Tracking Booking - FixZenix</title>

<!-- Frameworks & Utilities -->
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

<!-- Leaflet Map -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Styles & Fonts -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>
body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f4f4f5; }
.bg-grid { background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 20px 20px; }
.glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); }
.leaflet-container { z-index: 10 !important; font-family: 'Plus Jakarta Sans', sans-serif; }
@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
.star-lit { color: #A07D54; filter: drop-shadow(0 0 6px rgba(160,125,84,0.5)); }
.star-dim { color: #e5e7eb; }
.tag-chip { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.tag-chip.on { background:#1a1a1a; color:white; transform:scale(1.05); }
.sheet-enter { animation: sheetUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes sheetUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes popIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
.pop-in { animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
@keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
.confetti-piece { position:fixed; border-radius:2px; animation:confettiFall linear forwards; pointer-events:none; z-index:9999; }
</style>
</head>

<body class="bg-grid min-h-screen flex flex-col items-center justify-center p-4 relative" x-data="trackingApp()">

<a href="index.html" class="absolute top-6 left-6 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-black hover:scale-105 transition z-50">
  <i class="fa-solid fa-house"></i>
</a>

<div class="w-full max-w-md glass-card rounded-[2.5rem] shadow-2xl border border-white p-6 relative overflow-hidden z-20">

  <!-- Header & Status Tracker -->
  <div x-show="jobStatus !== 'completed'" class="text-center mb-6" x-transition>
    <span class="inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 shadow-sm border border-green-200">
      <i class="fa-solid fa-shield-check mr-1"></i> Secure Booking
    </span>
    <h1 class="text-2xl font-extrabold text-brand-dark">Request Received</h1>
    <p class="text-xs text-gray-500 font-mono mt-1">ID: <span x-text="jobId ? jobId.slice(0,8) : 'Loading...'"></span></p>
  </div>

  <!-- Progress Bar -->
  <div x-show="jobStatus !== 'completed' && jobStatus !== 'cancelled'" class="relative flex justify-between items-center mb-8 px-2" x-transition>
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
    <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green rounded-full -z-10 transition-all duration-1000 ease-out"
         :style="`width: ${jobStatus === 'pending' || jobStatus === 'searching' ? '33%' : (jobStatus === 'accepted' || jobStatus === 'assigned' ? '66%' : '100%')}`"></div>

    <div class="flex flex-col items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center shadow-md border-2 border-white">
        <i class="fa-solid fa-check text-xs"></i>
      </div>
      <span class="text-[10px] font-bold text-gray-800">Requested</span>
    </div>

    <div class="flex flex-col items-center gap-2">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors duration-500"
           :class="jobStatus !== 'pending' && jobStatus !== 'searching' ? 'bg-brand-green text-white' : 'bg-brand-gold text-white animate-pulse'">
        <i class="fa-solid" :class="jobStatus !== 'pending' && jobStatus !== 'searching' ? 'fa-check' : 'fa-radar'"></i>
      </div>
      <span class="text-[10px] font-bold transition-colors" :class="jobStatus !== 'pending' && jobStatus !== 'searching' ? 'text-gray-800' : 'text-brand-gold'">
        <span x-text="jobStatus === 'pending' || jobStatus === 'searching' ? 'Searching' : 'Accepted'"></span>
      </span>
    </div>

    <div class="flex flex-col items-center gap-2">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors duration-500"
           :class="jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress' ? 'bg-brand-green text-white animate-bounce' : (jobStatus === 'accepted' || jobStatus === 'assigned' ? 'bg-brand-gold text-white animate-pulse' : 'bg-gray-100 text-gray-400')">
        <i class="fa-solid text-xs" :class="jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress' ? 'fa-street-view' : 'fa-user-astronaut'"></i>
      </div>
      <span class="text-[10px] font-bold text-gray-400" 
            :class="{'text-brand-gold': jobStatus === 'accepted' || jobStatus === 'assigned', 'text-brand-green font-extrabold': jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress'}"
            x-text="jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress' ? 'Arrived' : 'Assigned'">
      </span>
    </div>
  </div>

  <!-- Searching State -->
  <div x-show="!technicianFound && (jobStatus === 'pending' || jobStatus === 'searching')" class="text-center py-6">
    <div class="relative w-32 h-32 mx-auto flex items-center justify-center mb-6">
      <div class="absolute w-full h-full rounded-full bg-brand-gold opacity-50 animate-ripple"></div>
      <div class="absolute w-full h-full rounded-full bg-brand-gold opacity-30 animate-ripple" style="animation-delay: 0.6s"></div>
      <div class="absolute w-full h-full rounded-full bg-brand-gold opacity-10 animate-ripple" style="animation-delay: 1.2s"></div>
      <div class="relative w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border border-gray-100">
        <i class="fa-solid fa-location-crosshairs text-3xl text-brand-gold animate-pulse"></i>
      </div>
    </div>
    <h3 class="text-lg font-bold text-gray-900" x-text="searchMessage"></h3>
    <div class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-full mt-3 border border-gray-200">
      <i class="fa-regular fa-clock text-brand-gold animate-spin-slow"></i>
      <span class="text-sm font-mono font-bold text-gray-700" x-text="formattedTime"></span>
    </div>
    <button @click="cancelJob()" class="mt-8 text-xs font-bold text-red-500 hover:text-red-700 underline decoration-red-200 underline-offset-4 transition">
      Cancel Request
    </button>
  </div>

  <!-- Assigned & Active Tracking Container -->
  <div x-show="technicianFound || (jobStatus !== 'pending' && jobStatus !== 'searching')" style="display: none;" class="animate-slide-up-fade">

    <div class="text-center mb-4 bg-white py-2 rounded-xl border border-gray-100 shadow-sm">
      <h3 class="text-sm font-extrabold" 
          :class="{'text-brand-gold': jobStatus === 'accepted' || jobStatus === 'assigned', 'text-brand-green': jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress'}"
          x-text="jobStatus === 'arrived' ? '🎉 Your Expert Has Arrived!' : (jobStatus === 'started' ? '🛠️ Service Execution Started' : (jobStatus === 'in_progress' ? (paymentStatus === 'PAID' ? '🔑 Share Completion Code' : (paymentStatus === 'PENDING_CUSTOMER_PAYMENT' ? '💳 Payment Requested' : '🛠️ Work In Progress')) : 'Your Expert is En Route'))">
      </h3>
    </div>

    <!-- Map View -->
    <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-gray-200 mb-4 bg-gray-100" x-show="!otpCode && jobStatus !== 'completed'" x-transition.opacity>
      <div id="trackingMap" class="w-full h-full"></div>
      <div class="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-2 border border-gray-100">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span class="text-[10px] font-extrabold text-gray-800 uppercase tracking-wide">ETA: <span x-text="jobStatus === 'arrived' || jobStatus === 'started' || jobStatus === 'in_progress' ? '0' : etaMins"></span> Mins</span>
      </div>
    </div>

    <!-- Technician Profile Card -->
    <div class="bg-gradient-to-b from-green-50 to-white rounded-2xl p-4 border border-green-100 shadow-sm relative mb-4" x-show="!otpCode && jobStatus !== 'completed'" x-transition.opacity>
      <div class="absolute top-0 right-0 bg-brand-green text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
        <i class="fa-solid fa-shield-check"></i> Verified Partner
      </div>
      <div class="flex items-center gap-4 mb-4">
        <div class="relative">
          <img :src="techData?.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" class="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md">
          <div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div class="flex-1">
          <h4 class="text-lg font-extrabold text-gray-900 leading-tight" x-text="techData?.name || 'Expert Partner'"></h4>
          <p class="text-[10px] text-gray-500 font-bold mb-1" x-text="(techData?.experience || '5') + ' Years Exp'"></p>
          <div class="flex gap-2">
            <div class="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-700 border border-yellow-100">
              <i class="fa-solid fa-star text-yellow-500"></i> <span x-text="techData?.rating || '4.9'"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-2">
        <a :href="'tel:' + techData?.phone" class="py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition flex items-center justify-center gap-2 text-sm">
          <i class="fa-solid fa-phone"></i> Call Partner
        </a>
        <a :href="'https://wa.me/91' + techData?.phone" target="_blank" class="py-2.5 bg-green-500 text-white rounded-xl font-bold shadow-md shadow-green-200 hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm">
          <i class="fa-brands fa-whatsapp text-lg"></i> WhatsApp
        </a>
      </div>
    </div>

    <!-- Razorpay Payment Request Prompt -->
    <div x-show="paymentStatus === 'PENDING_CUSTOMER_PAYMENT' && !otpCode && jobStatus !== 'completed'" 
         class="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 mb-4 text-center shadow-xl animate-pulse">
      <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
        <i class="fa-solid fa-credit-card text-xl"></i>
      </div>
      <h3 class="text-lg font-black text-amber-900">Work Finished! Complete Payment</h3>
      <p class="text-xs text-amber-700 mt-1 mb-2">The technician finished the service. Pay now to unlock your 6-digit OTP code.</p>
      <p class="text-2xl font-extrabold text-amber-900 font-mono mb-4">Amount Due: ₹<span x-text="payableAmount"></span></p>
      <button @click="triggerRazorpayCheckout()" 
              class="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base">
        <i class="fa-solid fa-lock"></i> Pay ₹<span x-text="payableAmount"></span> via Razorpay
      </button>
    </div>

    <!-- Technician Quote Review Card -->
    <div x-show="showQuoteCard && quoteStatus === 'submitted'"
         class="bg-white border-2 border-brand-gold rounded-2xl p-5 mb-4 shadow-lg animate-slide-up-fade">
      <div class="text-center mb-4">
        <div class="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <i class="fa-solid fa-file-invoice-dollar text-brand-gold text-xl"></i>
        </div>
        <h3 class="text-lg font-extrabold text-brand-dark">Quote Received from Technician</h3>
        <p class="text-xs text-gray-500">Review the estimate below before work begins</p>
      </div>
      <div class="space-y-3">
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="flex justify-between text-sm py-1">
            <span class="text-gray-600">Labour Cost:</span>
            <span class="font-mono font-bold">₹<span x-text="quoteLabour"></span></span>
          </div>
          <div class="flex justify-between text-sm py-1">
            <span class="text-gray-600">Material Cost:</span>
            <span class="font-mono font-bold">₹<span x-text="quoteMaterial"></span></span>
          </div>
          <div class="flex justify-between text-sm py-1" x-show="quoteExtra > 0">
            <span class="text-gray-600">Extra Charges:</span>
            <span class="font-mono font-bold">₹<span x-text="quoteExtra"></span></span>
          </div>
          <div class="border-t border-gray-200 my-2"></div>
          <div class="flex justify-between font-bold text-base">
            <span>Total Quote:</span>
            <span class="text-brand-gold">₹<span x-text="quoteAmount"></span></span>
          </div>
        </div>
        <div class="bg-green-50 rounded-xl p-3 border border-green-100">
          <div class="flex justify-between text-sm">
            <span class="text-green-700">Inspection Fee Paid:</span>
            <span class="font-mono text-green-700">-₹<span x-text="inspectionFee"></span></span>
          </div>
          <div class="flex justify-between font-bold text-lg mt-1 pt-1 border-t border-green-200">
            <span class="text-brand-dark">Amount Due After Job:</span>
            <span class="text-green-600">₹<span x-text="Math.max(0, quoteAmount - inspectionFee)"></span></span>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Work Description</p>
          <p class="text-sm text-brand-dark" x-text="quoteDescription || 'No description provided'"></p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-5">
        <button @click="rejectQuote()" 
                class="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95">
          <i class="fas fa-times mr-1"></i> Reject Quote
        </button>
        <button @click="acceptQuote()" 
                class="py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all active:scale-95 shadow-md">
          <i class="fas fa-check mr-1"></i> Approve Quote
        </button>
      </div>
    </div>

    <!-- OTP Completion Code Display -->
    <div x-show="otpCode && (paymentStatus === 'PAID' || jobStatus === 'completed')" x-transition.opacity class="text-center py-4">
      <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm animate-bounce">
        <i class="fa-solid fa-shield-check text-3xl text-green-500"></i>
      </div>
      <h2 class="text-2xl font-black text-brand-dark mb-2">Payment Complete!</h2>
      <p class="text-sm text-gray-500 mb-6 px-4">Please share this secure 6-digit completion code with your technician to close out the job.</p>

      <div class="bg-white border-2 border-dashed border-brand-gold rounded-2xl p-6 mb-6 shadow-inner relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-brand-gold animate-pulse"></div>
        <p class="text-xs text-brand-gold font-bold uppercase mb-2">Job Completion Code</p>
        <p class="text-6xl font-black text-brand-dark tracking-[0.2em] font-mono" x-text="otpCode"></p>
      </div>

      <div class="bg-gray-50 rounded-xl p-3 flex items-center justify-center gap-3 border border-gray-200">
        <img :src="techData?.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" class="w-8 h-8 rounded-full border-2 border-white shadow-sm">
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900" x-text="'Waiting for ' + (techData?.name || 'Technician')"></p>
        </div>
      </div>
    </div>

    <!-- Completed Screen & Loyalty Rewards -->
    <div x-show="jobStatus === 'completed'" x-transition.opacity class="text-center py-8">
      <div class="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate__animated animate__jackInTheBox">
        <i class="fa-solid fa-check text-4xl text-white"></i>
      </div>
      <h2 class="text-3xl font-black text-brand-dark mb-2">Job Completed!</h2>
      <p class="text-sm text-gray-500 mb-6 px-2">Thank you for choosing FixZenix. The technician has successfully verified your code and completed the service.</p>

      <!-- Loyalty Banner -->
      <div x-show="loyaltyReward" x-cloak x-transition
           class="mb-6 mx-1 rounded-2xl p-5 text-left relative overflow-hidden"
           style="background: linear-gradient(135deg,#A07D54 0%,#5D5646 100%);">
        <p class="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">
          <i class="fa-solid fa-gift mr-1"></i> 5 Services Completed — Loyalty Reward!
        </p>
        <div class="flex items-center justify-between mt-2">
          <div>
            <p class="text-white font-black text-2xl tracking-wider" x-text="loyaltyReward?.code"></p>
            <p class="text-white/70 text-xs mt-1" x-text="'Get ' + loyaltyReward?.value + '% off your next booking'"></p>
          </div>
          <button @click="navigator.clipboard.writeText(loyaltyReward.code)"
                  class="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all">
            <i class="fa-solid fa-copy"></i> Copy
          </button>
        </div>
      </div>

      <!-- Rating Button -->
      <button x-show="!feedbackDone" @click="showFeedback = true"
              class="w-full py-4 mb-3 rounded-2xl font-extrabold text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-white"
              style="background: linear-gradient(110deg,#A07D54 40%,#c9a87a 50%,#A07D54 60%); background-size:200% auto; animation: shimmer 2.5s linear infinite;">
        <i class="fa-solid fa-star"></i> Rate Your Experience
      </button>

      <div x-show="feedbackDone" class="w-full py-3 mb-3 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center gap-2">
        <i class="fa-solid fa-circle-check text-green-500"></i>
        <span class="text-sm font-bold text-green-700">Review Submitted — Thank you!</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button @click="openBillModal()" class="py-3.5 bg-white border-2 border-brand-dark text-brand-dark rounded-xl font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 text-sm">
          <i class="fa-solid fa-file-invoice"></i> View Bill
        </button>
        <button @click="window.location.href='index.html'" class="py-3.5 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2 text-sm">
          <i class="fa-solid fa-house"></i> Home
        </button>
      </div>
    </div>

  </div>
</div>

<!-- Invoice Modal -->
<div x-show="showBill" 
     class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
     x-transition.opacity
     style="display: none;">

  <div class="bg-white w-full max-w-md rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
    <div class="p-6 overflow-y-auto bg-white" id="invoice-content">
      <div class="flex items-start justify-between pb-4 mb-4 border-b-2 border-brand-dark">
        <div>
          <h1 class="font-serif italic text-2xl text-brand-dark font-extrabold leading-none">FixZenix</h1>
          <p class="text-[10px] text-gray-500 mt-1">Premium Home Services</p>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="inline-block px-2 py-0.5 bg-brand-dark text-white text-[9px] font-bold uppercase tracking-widest rounded">Service Invoice</span>
          <p class="text-xs font-extrabold text-brand-dark font-mono mt-1" x-text="'FXN-' + (jobId ? jobId.slice(0,8).toUpperCase() : '')"></p>
        </div>
      </div>

      <div class="space-y-1.5 text-sm text-gray-600 border-t-2 border-dashed border-gray-300 pt-3 mb-4">
        <div class="flex justify-between font-black text-base pt-2 text-brand-dark">
          <span>Total Paid</span>
          <span x-text="'₹' + payableAmount"></span>
        </div>
      </div>
    </div>

    <div class="p-4 bg-gray-50 border-t flex gap-3">
      <button @click="showBill = false" class="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100">
        Close
      </button>
      <button @click="downloadPDF()" :disabled="isPrinting" class="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold shadow-md hover:bg-green-600 flex items-center justify-center gap-2">
        <span x-show="!isPrinting"><i class="fa-solid fa-download"></i> Save PDF</span>
        <span x-show="isPrinting"><i class="fa-solid fa-spinner fa-spin"></i> Saving...</span>
      </button>
    </div>
  </div>
</div>

<!-- Feedback Sheet Modal -->
<div x-show="showFeedback" class="fixed inset-0 z-[200] flex items-end justify-center" style="display:none;">
  <div @click="showFeedback = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

  <div class="relative w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl z-10 overflow-hidden sheet-enter max-h-[92vh] overflow-y-auto">
    <div class="flex justify-center pt-4 pb-2">
      <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
    </div>

    <div x-show="feedbackStep === 1" class="px-6 pb-8 pt-2">
      <div class="text-center mb-5">
        <h3 class="text-xl font-black text-brand-dark">How was your experience?</h3>
        <p class="text-xs text-gray-400 mt-1">Rate your FixZenix technician</p>
      </div>

      <div class="flex justify-center gap-4 mb-5">
        <template x-for="i in 5" :key="i">
          <button @click="feedbackRating = i" class="transition-all active:scale-75">
            <i class="fa-solid fa-star text-4xl" :class="i <= feedbackRating ? 'star-lit' : 'star-dim'"></i>
          </button>
        </template>
      </div>

      <textarea x-model="feedbackComment" placeholder="Share what you loved..." rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none mb-4"></textarea>

      <button @click="submitFeedback()" :disabled="feedbackRating === 0 || feedbackLoading"
              class="w-full py-4 rounded-2xl bg-brand-dark text-white font-extrabold text-sm uppercase tracking-widest shadow-lg">
        <span x-show="!feedbackLoading">Submit Review</span>
        <span x-show="feedbackLoading"><i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...</span>
      </button>
    </div>
  </div>
</div>

<script src="success.js"></script>
</body>
</html>
