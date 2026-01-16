/**
 * ITEasier Landing Page - Main JavaScript
 * Handles: smooth scroll, mobile menu, animations, form validation
 */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // DOM Elements
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const scrollTopBtn = document.getElementById('scrollTop');
    const contactForm = document.getElementById('contactForm');
    const navLinks = document.querySelectorAll('.header__nav-link');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    /**
     * Initialize all functionality
     */
    function init() {
        setupSmoothScroll();
        setupMobileMenu();
        setupHeaderScroll();
        setupScrollToTop();
        setupScrollAnimations();
        setupContactForm();
    }

    /**
     * Smooth scroll to anchor links
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                    return;
                }

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    if (mainNav.classList.contains('is-open')) {
                        closeMobileMenu();
                    }

                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });

                    // Update focus for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                }
            });
        });
    }

    /**
     * Mobile menu toggle
     */
    function setupMobileMenu() {
        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener('click', toggleMobileMenu);

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });

        // Close menu when clicking a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('is-open')) {
                    closeMobileMenu();
                }
            });
        });
    }

    function toggleMobileMenu() {
        const isOpen = mainNav.classList.contains('is-open');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mainNav.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Zamknij menu');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Otwórz menu');
        document.body.style.overflow = '';
    }

    /**
     * Header scroll behavior
     */
    function setupHeaderScroll() {
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            // Add scrolled class when scrolled past threshold
            if (scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        updateHeader();
    }

    /**
     * Scroll to top button
     */
    function setupScrollToTop() {
        if (!scrollTopBtn) return;

        let ticking = false;

        function updateScrollTopVisibility() {
            const scrollY = window.scrollY;
            const threshold = window.innerHeight * 0.5;

            if (scrollY > threshold) {
                scrollTopBtn.classList.add('is-visible');
            } else {
                scrollTopBtn.classList.remove('is-visible');
            }

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateScrollTopVisibility);
                ticking = true;
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });

        // Initial check
        updateScrollTopVisibility();
    }

    /**
     * Scroll animations using Intersection Observer
     */
    function setupScrollAnimations() {
        if (prefersReducedMotion || !animatedElements.length) {
            // If reduced motion, show all elements immediately
            animatedElements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Contact form handling
     */
    function setupContactForm() {
        if (!contactForm) return;

        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const phoneInput = contactForm.querySelector('#phone');
        const messageInput = contactForm.querySelector('#message');

        // Real-time validation on blur
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input) {
                input.addEventListener('blur', function() {
                    validateField(this);
                });

                input.addEventListener('input', function() {
                    // Clear error on input
                    clearFieldError(this);
                });
            }
        });

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate all required fields
            let isValid = true;

            if (!validateField(nameInput)) isValid = false;
            if (!validateField(emailInput)) isValid = false;
            if (!validateField(messageInput)) isValid = false;

            if (isValid) {
                // Build mailto link
                const subject = encodeURIComponent('Zapytanie ze strony ITEasier');
                const body = buildEmailBody(
                    nameInput.value.trim(),
                    emailInput.value.trim(),
                    phoneInput ? phoneInput.value.trim() : '',
                    messageInput.value.trim()
                );

                const mailtoLink = `mailto:kontakt@iteasier.pl?subject=${subject}&body=${body}`;
                
                // Open email client
                window.location.href = mailtoLink;

                // Show success message (optional - since mailto opens)
                showFormSuccess();
            }
        });
    }

    /**
     * Validate a form field
     */
    function validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        const fieldName = field.name;
        let errorMessage = '';

        // Check required fields
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'To pole jest wymagane';
        }
        // Check email format
        else if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Podaj prawidłowy adres e-mail';
            }
        }

        if (errorMessage) {
            showFieldError(field, errorMessage);
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }

    /**
     * Show field error
     */
    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup ? formGroup.querySelector('.form-error') : null;

        field.classList.add('is-invalid');
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    /**
     * Clear field error
     */
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup ? formGroup.querySelector('.form-error') : null;

        field.classList.remove('is-invalid');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    /**
     * Build email body
     */
    function buildEmailBody(name, email, phone, message) {
        let body = `Imię i nazwisko: ${name}\n`;
        body += `E-mail: ${email}\n`;
        
        if (phone) {
            body += `Telefon: ${phone}\n`;
        }
        
        body += `\nWiadomość:\n${message}`;
        
        return encodeURIComponent(body);
    }

    /**
     * Show form success message
     */
    function showFormSuccess() {
        // Create a temporary success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.setAttribute('role', 'alert');
        successMessage.innerHTML = `
            <p style="color: var(--color-success); text-align: center; padding: var(--space-4); margin-top: var(--space-4);">
                Otwieramy Twój program pocztowy. Jeśli nie widzisz okna, 
                <a href="mailto:kontakt@iteasier.pl" style="color: var(--color-accent);">kliknij tutaj</a>.
            </p>
        `;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.insertAdjacentElement('afterend', successMessage);

            // Remove after 10 seconds
            setTimeout(function() {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 10000);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();