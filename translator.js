document.addEventListener("DOMContentLoaded", function() {
    // 1. Inject the Custom CSS to make it look premium
    const style = document.createElement('style');
    style.innerHTML = `
        .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; position: static !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0px !important; margin: 0 !important; padding: 0 !important; }
        .goog-te-combo { padding: 8px 12px; border-radius: 8px; border: none; background-color: transparent; color: #5D5646; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; outline: none; cursor: pointer; width: 100%; }
        .goog-te-gadget .goog-te-combo { margin: 4px 0 !important; }
    `;
    document.head.appendChild(style);

    // 2. Inject the HTML Widget Container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = "fixed top-4 right-4 z-[9999]";
    widgetContainer.innerHTML = `<div id="google_translate_element" class="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-[#E5E1DA] overflow-hidden hover:border-[#A07D54] transition-colors"></div>`;
    document.body.appendChild(widgetContainer);

    // 3. Initialize Google Translate
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr', // Add more language codes here if needed
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    // 4. Load the external Google Script
    const googleScript = document.createElement('script');
    googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(googleScript);
});
