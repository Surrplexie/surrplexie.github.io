document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Resume Snippet Toggle ---
       Uses aria-expanded to communicate state to assistive technology.
       Visibility is driven by the CSS class .is-open rather than inline styles. */
    const toggleBtn = document.getElementById('resumeToggle');
    const snippet   = document.getElementById('resumeSnippet');

    if (toggleBtn && snippet) {
        toggleBtn.addEventListener('click', () => {
            const isOpen = snippet.classList.contains('is-open');
            snippet.classList.toggle('is-open', !isOpen);
            toggleBtn.setAttribute('aria-expanded', String(!isOpen));
            toggleBtn.textContent = isOpen ? 'View Key Qualifications' : 'Hide Key Qualifications';
        });
    }

    /* --- 2. Scroll Reveal ---
       Gated behind prefers-reduced-motion so users who opt out of motion
       never see content start invisible and potentially miss it. */
    const prefersMotion = window.matchMedia('(prefers-reduced-motion: no-preference)');

    if (prefersMotion.matches) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.card').forEach((card) => {
            card.classList.add('reveal-hidden');
            observer.observe(card);
        });
    }

});
