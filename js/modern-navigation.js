// Modern Navigation Enhancement
// Enhanced navigation with modern transitions and better UX

(function() {
    'use strict';

    // Enhanced page transitions
    let isNavigating = false;

    // Override default navigation function if it exists
    if (typeof navigateWithTransition !== 'undefined') {
        const originalNavigate = window.navigateWithTransition;
        window.navigateWithTransition = function(url) {
            modernNavigate(url);
        };
    } else {
        window.navigateWithTransition = function(url) {
            modernNavigate(url);
        };
    }

    function modernNavigate(url) {
        if (isNavigating) return;
        isNavigating = true;

        // Show loading overlay
        const overlay = getOrCreateLoadingOverlay();
        overlay.classList.add('active');

        // Add exit animation to current page
        document.body.classList.add('page-transition-out');

        // Small delay to allow exit animation
        setTimeout(() => {
            window.location.href = url;
        }, 150);
    }

    function getOrCreateLoadingOverlay() {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    // Enhanced form submissions
    function enhanceFormSubmissions() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitButton = this.querySelector('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    // Add loading state to submit button
                    submitButton.classList.add('loading');
                    submitButton.disabled = true;
                    
                    const originalText = submitButton.textContent;
                    submitButton.textContent = 'Processing...';
                    
                    // Reset after 10 seconds (fallback)
                    setTimeout(() => {
                        submitButton.classList.remove('loading');
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }, 10000);
                }
            });
        });
    }

    // Enhanced link handling
    function enhanceLinkHandling() {
        document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript:"]):not([target="_blank"])').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                modernNavigate(this.href);
            });
        });
    }

    // Tab switching functionality
    function initializeTabSwitching() {
        window.switchLoginTab = function(tabName) {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            document.querySelectorAll('.login-tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Add active class to clicked tab and corresponding content
            const activeButton = document.querySelector(`[onclick="switchLoginTab('${tabName}')"]`);
            const activeContent = document.getElementById(`${tabName}Login`);

            if (activeButton && activeContent) {
                activeButton.classList.add('active');
                activeButton.setAttribute('aria-selected', 'true');
                activeContent.classList.add('active');

                // Focus first input in the active tab
                const firstInput = activeContent.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        };
    }

    // Enhanced back button
    function enhanceBackButton() {
        // Handle browser back button
        window.addEventListener('popstate', function(e) {
            document.body.classList.add('page-transition-in');
        });

        // Add back button functionality where needed
        document.querySelectorAll('[href="javascript:history.back()"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    modernNavigate('index.html');
                }
            });
        });
    }

    // Form validation enhancements
    function enhanceFormValidation() {
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }

    function validateField(field) {
        const errorElement = field.parentElement.querySelector('.form-error');
        
        if (field.validity.valid) {
            field.classList.remove('error');
            field.classList.add('valid');
            if (errorElement) {
                errorElement.remove();
            }
        } else {
            field.classList.add('error');
            field.classList.remove('valid');
            
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'form-error';
                error.textContent = getErrorMessage(field);
                field.parentElement.appendChild(error);
            }
        }
    }

    function getErrorMessage(field) {
        if (field.validity.valueMissing) {
            return `${field.labels[0]?.textContent || 'This field'} is required.`;
        }
        if (field.validity.typeMismatch) {
            return `Please enter a valid ${field.type}.`;
        }
        if (field.validity.patternMismatch) {
            return 'Please match the requested format.';
        }
        if (field.validity.tooShort) {
            return `Please enter at least ${field.minLength} characters.`;
        }
        if (field.validity.tooLong) {
            return `Please enter no more than ${field.maxLength} characters.`;
        }
        return 'Please check your input.';
    }

    // Keyboard navigation enhancements
    function enhanceKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // ESC key
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-backdrop.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
                
                const activeOverlay = document.querySelector('.loading-overlay.active');
                if (activeOverlay) {
                    activeOverlay.classList.remove('active');
                }
            }

            // Enter key on buttons
            if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                e.target.click();
            }

            // Tab navigation enhancement
            if (e.key === 'Tab') {
                const focusableElements = document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        enhanceFormSubmissions();
        enhanceLinkHandling();
        initializeTabSwitching();
        enhanceBackButton();
        enhanceFormValidation();
        enhanceKeyboardNavigation();

        // Add page entry animation
        document.body.classList.add('page-transition-in');
        
        // Mark navigation as complete
        isNavigating = false;
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Reset any stuck loading states
            document.querySelectorAll('.loading').forEach(el => {
                el.classList.remove('loading');
            });
            
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    });

    // Export utilities for other scripts
    window.modernNavigation = {
        navigate: modernNavigate,
        showLoading: function() {
            const overlay = getOrCreateLoadingOverlay();
            overlay.classList.add('active');
        },
        hideLoading: function() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        },
        validateForm: function(form) {
            let isValid = true;
            form.querySelectorAll('input[required]').forEach(field => {
                validateField(field);
                if (!field.validity.valid) {
                    isValid = false;
                }
            });
            return isValid;
        }
    };

})();
