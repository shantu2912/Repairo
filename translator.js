document.addEventListener("DOMContentLoaded", function() {
    // 1. Inject CSS to COMPLETELY hide all Google Translate UI
    const style = document.createElement('style');
    style.innerHTML = `
        .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; position: static !important; }
        #google_translate_element { display: none !important; } /* Hides the widget */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
    `;
    document.head.appendChild(style);

    // 2. Inject the Hidden Google Container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = "google_translate_element";
    document.body.appendChild(widgetContainer);

    // 3. Initialize Google Translate silently
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr', // English, Hindi, Marathi
            autoDisplay: false
        }, 'google_translate_element');
    };

    // 4. Load the Google Script
    const googleScript = document.createElement('script');
    googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(googleScript);
});

// 5. Create a function for your custom buttons to use
window.changeAppLanguage = function(langCode) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change')); // Forces Google to translate
    } else {
        // Fallback if the widget hasn't fully loaded yet
        setTimeout(() => window.changeAppLanguage(langCode), 300);
    }
};
