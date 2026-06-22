document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');

    if (!toggle || !nav) {
        return;
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)');

    function setMenuOpen(isOpen) {
        nav.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('nav-open', isOpen);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    toggle.addEventListener('click', () => {
        setMenuOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileQuery.matches) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    mobileQuery.addEventListener('change', () => {
        if (!mobileQuery.matches) {
            closeMenu();
        }
    });
});
