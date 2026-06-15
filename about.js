
        // 1. MOUSE PARALLAX (Move background blobs)
        document.addEventListener("mousemove", (e) => {
            const orbs = document.querySelectorAll(".orb");
            const x = (e.clientX * -1) / 30;
            const y = (e.clientY * -1) / 30;

            orbs.forEach(orb => {
                const speed = orb.getAttribute('data-speed');
                orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });

        // 2. SCROLL REVEAL + LINE DRAWING
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Reveal Process Cards
                    if(entry.target.classList.contains('step-card')) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                    // Draw the connector line
                    if(entry.target.classList.contains('process-grid')) {
                        document.getElementById('line-fill').style.width = '100%';
                    }
                }
            });
        }, { threshold: 0.2 });

        // Observe Cards
        document.querySelectorAll('.step-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
        
        // Observe Grid for Line animation
        observer.observe(document.querySelector('.process-grid'));

 
