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

    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.contains('open') ? closeMobileNav() : openMobileNav();
        });

        // Close mobile nav on link click and handle scrolling
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.getAttribute('href');
                if (target && target.startsWith('#')) {
                    e.preventDefault();
                    closeMobileNav();
                    const section = document.querySelector(target);
                    if (section) {
                        // Account for sticky header
                        const headerOffset = document.getElementById('main-header').offsetHeight;
                        const elementPosition = section.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    // Let the browser navigate naturally to the new page.
                    // We don't need to close the menu because we're leaving the page.
                    closeMobileNav();
                }
            });
        });
    }


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

    if (backToTop) {
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


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


    // ——— Generic Form Handler (AJAX) ———
    function handleFormSubmission(formId, successId, resetBtnId, subjectPrefix) {
        const formEl = document.getElementById(formId);
        if (!formEl) return;
        
        console.log(`Initializing form: ${formId}`); // Debug check

        const successEl = document.getElementById(successId);
        const submitBtn = formEl.querySelector('button[type="submit"]');
        const resetBtn = document.getElementById(resetBtnId);

        function reset() {
            formEl.style.display = 'block';
            successEl.style.display = 'none';
            formEl.reset();
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || submitBtn.innerHTML;
            }
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', reset);
        }

        formEl.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Stop any other listeners
            
            console.log(`Form ${formId} submitted via AJAX`);

            // Basic Validation
            let isValid = true;
            formEl.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#d4534a';
                    field.addEventListener('input', function handler() {
                        this.style.borderColor = '';
                        this.removeEventListener('input', handler);
                    });
                }
            });

            if (!isValid) {
                const firstError = formEl.querySelector('[style*="border-color"]');
                if (firstError) firstError.focus();
                return;
            }

            // Prepare Submission
            const originalBtnHTML = submitBtn.innerHTML;
            if (!submitBtn.dataset.originalText) {
                submitBtn.dataset.originalText = originalBtnHTML;
            }
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(formEl);
            const nameField = formEl.querySelector('[name="name"]');
            const name = nameField ? nameField.value : 'Applicant';
            
            // Handle multiple checkboxes for "area"
            const areas = [];
            formEl.querySelectorAll('input[name="area"]:checked').forEach(cb => {
                areas.push(cb.value);
            });
            if (areas.length > 0) {
                formData.delete('area');
                formData.append('areas_preferred', areas.join(', '));
            }

            formData.append('_subject', `${subjectPrefix} from ${name}`);

            fetch(formEl.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    formEl.style.display = 'none';
                    if (successEl) {
                        successEl.style.display = 'block';
                        successEl.classList.add('reveal', 'visible');
                    }
                    // Scroll to top of the form area
                    const scrollTarget = formEl.closest('.contact-form-wrapper') || formEl.closest('.app-form-card') || formEl;
                    window.scrollTo({ top: scrollTarget.offsetTop - 100, behavior: 'smooth' });
                } else {
                    return response.json().then(data => {
                        throw new Error(data.errors ? data.errors.map(e => e.message).join(', ') : 'Submission failed');
                    });
                }
            })
            .catch(error => {
                console.error('Form error:', error);
                submitBtn.innerHTML = submitBtn.dataset.originalText;
                submitBtn.disabled = false;
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Submission failed. Please try again or call us.';
                errorMsg.style.cssText = 'color: #d4534a; font-size: 0.85rem; text-align: center; margin-top: 12px;';
                errorMsg.className = 'form-error-msg';
                const prev = formEl.querySelector('.form-error-msg');
                if (prev) prev.remove();
                formEl.appendChild(errorMsg);
            });
        });
    }

    // Initialize both forms
    handleFormSubmission('lead-form', 'form-success', 'form-reset', 'New Quote Request');
    handleFormSubmission('cleaner-app-form', 'app-success', 'app-reset', 'New Cleaner Application');


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
