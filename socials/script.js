document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 1. Resume Toggle Logic --- */
    const button = document.getElementById('toggleButton');
    const surprise = document.getElementById('surpriseText');

    if (button && surprise) {
        button.addEventListener('click', () => {
            const isHidden = surprise.style.display === 'none' || surprise.style.display === '';

            if (isHidden) {
                surprise.style.display = 'block';
                button.textContent = 'Hide Resume Snippet';
            } else {
                surprise.style.display = 'none';
                button.textContent = 'View Resume Snippet';
            }
        });
    }

    /* --- 2. Scroll Reveal Logic (Intersection Observer) --- */
    const observerOptions = { 
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, observerOptions);

    // Select all cards and start observing them
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('reveal-hidden');
        observer.observe(card);
    });

});
