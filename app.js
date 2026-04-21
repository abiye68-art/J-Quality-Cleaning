/* =========================================================
   J Quality Cleaning — Interactive Behaviours
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // ——— Mobile Navigation ———
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');
    let overlay = null;

    function openMobileNav() {
        nav.classList.add('open');
        mobileBtn.classList.add('active');
        mobileBtn.setAttribute('aria-expanded', 'true');
        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay visible';
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        overlay.addEventListener('click', closeMobileNav);
    }

    function closeMobileNav() {
        nav.classList.remove('open');
        mobileBtn.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 350);
            overlay = null;
        }
    }

    mobileBtn.addEventListener('click', () => {
        nav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });

    // Close mobile nav on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });


    // ——— Sticky Header Shadow ———
    const header = document.getElementById('main-header');
    
    function updateHeaderState() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();


    // ——— Back to Top Button ———
    const backToTop = document.getElementById('back-to-top');

    function updateBackToTop() {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // ——— Scroll Reveal Animations ———
    const revealElements = document.querySelectorAll(
        '.trust-item, .testimonial-card, .service-card, .about-image, .about-content, .offer-card, .area-tag, .contact-info, .contact-form-wrapper'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ——— Smooth Anchor Scrolling ———
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // ——— Lead Capture Form ———
    const form = document.getElementById('lead-form');
    const formSuccess = document.getElementById('form-success');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic validation
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const postcode = document.getElementById('form-postcode').value.trim();
        const service = document.getElementById('form-service').value;

        if (!name || !email || !phone || !postcode || !service) {
            // Highlight empty fields
            form.querySelectorAll('input, select').forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#d4534a';
                    field.addEventListener('input', function handler() {
                        this.style.borderColor = '';
                        this.removeEventListener('input', handler);
                    });
                }
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const emailField = document.getElementById('form-email');
            emailField.style.borderColor = '#d4534a';
            emailField.focus();
            return;
        }

        // Submit to Formspree
        const submitBtn = document.getElementById('form-submit');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        // Add a hidden _subject for clear email subjects
        formData.append('_subject', `New Quote Request from ${name} (${postcode})`);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                // Success
                form.style.display = 'none';
                formSuccess.style.display = 'block';
                formSuccess.classList.add('reveal', 'visible');
                console.log('Lead submitted successfully:', { name, email, postcode, service });
            } else {
                return response.json().then(data => {
                    throw new Error(data.errors ? data.errors.map(e => e.message).join(', ') : 'Submission failed');
                });
            }
        })
        .catch(error => {
            console.error('Form error:', error);
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
            // Show a user-friendly error
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Something went wrong. Please call us on 07436 606 130 or try again.';
            errorMsg.style.cssText = 'color: #d4534a; font-size: 0.85rem; text-align: center; margin-top: 12px;';
            errorMsg.className = 'form-error-msg';
            // Remove any previous error
            const prev = form.querySelector('.form-error-msg');
            if (prev) prev.remove();
            form.appendChild(errorMsg);
        });
    });


    // ——— Active Nav Highlighting ———
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });


    // ——— Parallax on Hero (subtle) ———
    const heroImg = document.querySelector('.hero-img');
    
    if (heroImg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroImg.style.transform = `translateY(${scrolled * 0.25}px) scale(1.05)`;
            }
        }, { passive: true });
    }


    // ——— Counter Animation for Stats ———
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 40;
        const suffix = el.textContent.replace(/[0-9]/g, '');
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current) + suffix;
        }, 40);
    }


    // ——— Scroll indicator click ———
    const scrollIndicator = document.getElementById('hero-scroll');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const trustStrip = document.getElementById('trust-strip');
            if (trustStrip) {
                trustStrip.scrollIntoView({ behavior: 'smooth' });
            }
        });
        scrollIndicator.style.cursor = 'pointer';
    }
});
