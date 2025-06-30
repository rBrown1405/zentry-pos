// Modern Page Enhancement Script
// This script provides global enhancements for all HTML pages

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeModernEffects();
        initializeAccessibility();
        initializeAnimations();
        initializeMobileOptimizations();
    });

    function initializeModernEffects() {
        // Add modern background effects
        addAnimatedBackground();
        
        // Enhance form interactions
        enhanceFormElements();
        
        // Add loading states
        initializeLoadingStates();
        
        // Add scroll effects
        initializeScrollEffects();
    }

    function addAnimatedBackground() {
        // Only add if not already present
        if (document.querySelector('.modern-bg')) return;

        const bg = document.createElement('div');
        bg.className = 'modern-bg';
        bg.innerHTML = `
            <div class="bg-gradient bg-gradient-1"></div>
            <div class="bg-gradient bg-gradient-2"></div>
            <div class="bg-gradient bg-gradient-3"></div>
        `;
        
        // Add CSS for modern background
        const style = document.createElement('style');
        style.textContent = `
            .modern-bg {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
                pointer-events: none;
            }
            
            .bg-gradient {
                position: absolute;
                border-radius: 50%;
                filter: blur(60px);
                opacity: 0.3;
                animation: float 20s infinite ease-in-out;
            }
            
            .bg-gradient-1 {
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
                top: -100px;
                left: -100px;
                animation-delay: 0s;
            }
            
            .bg-gradient-2 {
                width: 500px;
                height: 500px;
                background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%);
                top: 40%;
                right: -100px;
                animation-delay: -8s;
            }
            
            .bg-gradient-3 {
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
                bottom: -100px;
                left: 40%;
                animation-delay: -4s;
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg) scale(1);
                }
                25% {
                    transform: translate(100px, 50px) rotate(90deg) scale(1.1);
                }
                50% {
                    transform: translate(50px, 150px) rotate(180deg) scale(1);
                }
                75% {
                    transform: translate(-50px, 100px) rotate(270deg) scale(1.2);
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .bg-gradient {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(bg);
    }

    function enhanceFormElements() {
        // Add floating label effects
        const formInputs = document.querySelectorAll('.form-input, input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
        
        formInputs.forEach(input => {
            // Add focus/blur effects
            input.addEventListener('focus', function() {
                this.parentElement?.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement?.classList.remove('focused');
            });
            
            // Add real-time validation feedback
            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.classList.remove('error');
                    this.classList.add('valid');
                } else {
                    this.classList.remove('valid');
                }
            });
        });

        // Enhanced button interactions
        const buttons = document.querySelectorAll('.btn, button');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation CSS
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyle);
    }

    function initializeLoadingStates() {
        // Show loading overlay for navigation
        document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript:"]), button[onclick]').forEach(element => {
            element.addEventListener('click', function() {
                showLoadingOverlay();
            });
        });

        // Auto-hide loading overlay
        window.addEventListener('load', hideLoadingOverlay);
        window.addEventListener('pageshow', hideLoadingOverlay);
    }

    function showLoadingOverlay() {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    function initializeAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        document.querySelectorAll('.card, .feature-card, .menu-item, .form-group').forEach(el => {
            observer.observe(el);
        });

        // Add animation CSS
        const animationStyle = document.createElement('style');
        animationStyle.textContent = `
            .card, .feature-card, .menu-item, .form-group {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .card, .feature-card, .menu-item, .form-group {
                    opacity: 1;
                    transform: none;
                    transition: none;
                }
            }
        `;
        document.head.appendChild(animationStyle);
    }

    function initializeScrollEffects() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header shadow on scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const header = document.querySelector('.pos-header, .page-header');
            
            if (header) {
                if (currentScroll > 50) {
                    header.style.boxShadow = 'var(--shadow-lg)';
                } else {
                    header.style.boxShadow = 'var(--shadow-sm)';
                }
            }
            
            lastScroll = currentScroll;
        });
    }

    function initializeAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content landmark if it doesn't exist
        if (!document.getElementById('main-content')) {
            const main = document.querySelector('main, .page-content, .container');
            if (main) {
                main.id = 'main-content';
            }
        }

        // Enhance keyboard navigation
        document.addEventListener('keydown', function(e) {
            // ESC key handling
            if (e.key === 'Escape') {
                // Close modals, overlays, etc.
                hideLoadingOverlay();
                document.querySelectorAll('.modal, .overlay').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });
    }

    function initializeMobileOptimizations() {
        // Add viewport meta tag if missing
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
        }

        // Touch-friendly interactions
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // Add touch feedback
            const touchStyle = document.createElement('style');
            touchStyle.textContent = `
                .touch-device .btn:active,
                .touch-device .card:active,
                .touch-device .interactive:active {
                    transform: scale(0.98);
                }
                
                .touch-device .btn {
                    min-height: 44px;
                }
            `;
            document.head.appendChild(touchStyle);
        }

        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }

    // Global utility functions
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface-primary);
            color: var(--text-primary);
            padding: var(--space-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

})();
