document.addEventListener('DOMContentLoaded', () => {
    // Global Announcement Banner
    const banner = document.createElement('div');
    banner.className = 'global-banner';
    banner.innerHTML = '🚀 Skill Atlas is in Beta — all features are free. Give us feedback!';
    document.body.prepend(banner);

    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) navbarElement.classList.add('has-banner');

    const ptNavbar = document.querySelector('.pt-navbar');
    if (ptNavbar) ptNavbar.classList.add('has-banner');

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Toggle icon between menu and x
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            navbar.style.background = 'rgba(15, 15, 15, 0.95)';
            navbar.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'rgba(15, 15, 15, 0.85)';
            navbar.style.borderBottom = '1px solid transparent';
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            }
        });
    });
});
