/**
 * Notification System
 * Provides a simple notification system for the application
 */

// Notification types
const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 3000) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add notification container styles
        const style = document.createElement('style');
        style.textContent = `
            #notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .notification {
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                animation: notification-slide-in 0.3s ease;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .notification.removing {
                transform: translateX(120%);
                opacity: 0;
            }
            
            .notification-message {
                margin-right: 20px;
                flex-grow: 1;
                font-size: 14px;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
                padding: 0;
                color: inherit;
                opacity: 0.7;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification.success {
                background-color: #c6f6d5;
                color: #276749;
            }
            
            .notification.error {
                background-color: #fed7d7;
                color: #c53030;
            }
            
            .notification.warning {
                background-color: #feebc8;
                color: #c05621;
            }
            
            .notification.info {
                background-color: #bee3f8;
                color: #2b6cb0;
            }
            
            @keyframes notification-slide-in {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    notification.innerHTML = `
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Set auto-remove timeout
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    // Remove notification function
    function removeNotification(element) {
        // Add removing class for animation
        element.classList.add('removing');
        
        // Remove after animation completes
        setTimeout(() => {
            if (element.parentNode === notificationContainer) {
                notificationContainer.removeChild(element);
            }
        }, 300);
    }
}

// Expose notification function globally
window.showNotification = showNotification;
