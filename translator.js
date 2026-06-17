document.addEventListener("DOMContentLoaded", function() {
    // 1. Inject CSS to completely hide Google Translate UI and fix spacing
    const style = document.createElement('style');
    style.innerHTML = `
        .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; position: static !important; }
        #google_translate_element { display: none !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
    `;
    document.head.appendChild(style);

    // 2. Create the hidden Google Translate Container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = "google_translate_element";
    document.body.appendChild(widgetContainer);

    // 3. Check for saved language, default to English
    const savedLang = localStorage.getItem('fixzen_lang') || 'en';

    // 4. Inject the Top Pill UI exactly like the image
    // This will automatically appear on ANY page that links this JS file
    const uiContainer = document.createElement('div');
    uiContainer.className = "fixed top-[70px] left-1/2 transform -translate-x-1/2 z-[55] flex justify-center w-full max-w-sm pointer-events-none";
    
    // We use the brand colors: #5D5646 (Brand Olive) and #EEEAE2 (Brand Cream)
    uiContainer.innerHTML = `
        <div id="custom-lang-pill" class="bg-white/95 backdrop-blur-md rounded-full p-1.5 flex shadow-md pointer-events-auto gap-1 border border-[#EEEAE2]">
            <button onclick="changeAppLanguage('en', true)" id="btn-lang-en" class="text-[10px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${savedLang === 'en' ? 'bg-[#5D5646] text-white shadow-sm' : 'text-[#5D5646] hover:bg-[#EEEAE2]'}">🇬🇧 ENG</button>
            <button onclick="changeAppLanguage('hi', true)" id="btn-lang-hi" class="text-[10px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${savedLang === 'hi' ? 'bg-[#5D5646] text-white shadow-sm' : 'text-[#5D5646] hover:bg-[#EEEAE2]'}">🇮🇳 हिंदी</button>
            <button onclick="changeAppLanguage('mr', true)" id="btn-lang-mr" class="text-[10px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${savedLang === 'mr' ? 'bg-[#5D5646] text-white shadow-sm' : 'text-[#5D5646] hover:bg-[#EEEAE2]'}">🇮🇳 मराठी</button>
        </div>
    `;
    
    // Do not show the UI on index.html until loading is done, show immediately on other pages
    if(window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        uiContainer.style.opacity = '0';
        uiContainer.style.transition = 'opacity 1s ease-in-out';
        setTimeout(() => { uiContainer.style.opacity = '1'; }, 4500); // Fades in after 4 seconds
    }
    document.body.appendChild(uiContainer);

    // 5. Initialize Google Translate
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr',
            autoDisplay: false
        }, 'google_translate_element');

        // Automatically apply the saved language when the script loads
        if(savedLang !== 'en') {
            setTimeout(() => window.changeAppLanguage(savedLang, false), 800);
        }
    };

    // 6. Load the external Google Translate Script
    const googleScript = document.createElement('script');
    googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(googleScript);
});

// 7. Global Function to Change Language
window.changeAppLanguage = function(langCode, userClicked = false) {
    // If the user clicked the button manually, update the UI and save to local storage
    if (userClicked) {
        localStorage.setItem('fixzen_lang', langCode);
        
        // Update Button Styles Dynamically
        const btns = ['en', 'hi', 'mr'];
        btns.forEach(code => {
            const btn = document.getElementById('btn-lang-' + code);
            if (btn) {
                if (code === langCode) {
                    btn.className = "text-[10px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 bg-[#5D5646] text-white shadow-sm";
                } else {
                    btn.className = "text-[10px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 text-[#5D5646] hover:bg-[#EEEAE2]";
                }
            }
        });
    }

    // Trigger the hidden Google Translate dropdown
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
    } else {
        // If the widget hasn't loaded yet, try again in 300ms
        setTimeout(() => window.changeAppLanguage(langCode, false), 300);
    }
};
