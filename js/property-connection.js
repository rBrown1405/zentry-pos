/**
 * Property Connection Module
 * Handles UI and functionality for connecting to properties using connection codes
 */
class PropertyConnection {
    constructor(umbrellaManager) {
        this.umbrellaManager = umbrellaManager;
        
        // Check if Firebase and umbrella manager are ready
        this.checkDependencies();
    }
    
    /**
     * Initialize the property connection
     */
    initialize() {
        // Register any UI elements or events if needed
        this.createConnectionModal();
    }
    
    /**
     * Check if dependencies are loaded
     */
    checkDependencies() {
        // Wait for umbrella manager to be ready
        const checkInterval = setInterval(() => {
            if (window.umbrellaManager) {
                clearInterval(checkInterval);
                this.umbrellaManager = window.umbrellaManager;
                this.initialize();
            }
        }, 500);
    }
    
    /**
     * Create connection modal HTML
     */
    createConnectionModal() {
        // Check if modal already exists
        if (document.getElementById('propertyConnectionModal')) return;
        
        // Create modal element
        const modalHtml = `
            <div id="propertyConnectionModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Connect to Property</h3>
                        <button class="close-button" onclick="window.propertyConnection.closeConnectionModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Enter the property connection code provided by your property administrator:</p>
                        <div class="form-group">
                            <input type="text" id="connectionCodeInput" class="form-control" 
                                   placeholder="e.g. CON-XXXX1234" autocomplete="off">
                        </div>
                        <div id="connectionErrorMessage" class="error-message" style="display: none;"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" onclick="window.propertyConnection.closeConnectionModal()">Cancel</button>
                        <button class="primary-button" onclick="window.propertyConnection.connectToProperty()">Connect</button>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add modal styles if not already in document
        this.addModalStyles();
    }
    
    /**
     * Add modal styles to document
     */
    addModalStyles() {
        // Check if styles already exist
        if (document.getElementById('propertyConnectionStyles')) return;
        
        const styles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: none;
                justify-content: center;
                align-items: center;
            }
            
            .modal-overlay.active {
                display: flex;
            }
            
            .modal-content {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                width: 100%;
                max-width: 500px;
                padding: 0;
                animation: modal-appear 0.3s ease;
            }
            
            .modal-header {
                background: linear-gradient(135deg, #4a5568, #2d3748);
                color: #fff;
                padding: 1rem 1.5rem;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
            }
            
            .close-button {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-footer {
                padding: 1rem 1.5rem;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                border-top: 1px solid #e2e8f0;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #cbd5e0;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.15s ease;
            }
            
            .form-control:focus {
                border-color: #4299e1;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                outline: none;
            }
            
            .error-message {
                color: #e53e3e;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }
            
            .primary-button {
                background-color: #4299e1;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.15s ease;
            }
            
            .primary-button:hover {
                background-color: #3182ce;
            }
            
            .cancel-button {
                background-color: #edf2f7;
                color: #4a5568;
                border: none;
                border-radius: 4px;
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.15s ease;
            }
            
            .cancel-button:hover {
                background-color: #e2e8f0;
            }
            
            @keyframes modal-appear {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'propertyConnectionStyles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Show the connection modal
     */
    showConnectionModal() {
        const modal = document.getElementById('propertyConnectionModal');
        if (!modal) {
            this.createConnectionModal();
            setTimeout(() => this.showConnectionModal(), 100);
            return;
        }
        
        // Reset error message
        const errorMessage = document.getElementById('connectionErrorMessage');
        if (errorMessage) errorMessage.style.display = 'none';
        
        // Reset input
        const codeInput = document.getElementById('connectionCodeInput');
        if (codeInput) codeInput.value = '';
        
        // Show modal
        modal.classList.add('active');
    }
    
    /**
     * Close the connection modal
     */
    closeConnectionModal() {
        const modal = document.getElementById('propertyConnectionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Connect to property using connection code
     */
    async connectToProperty() {
        try {
            const codeInput = document.getElementById('connectionCodeInput');
            const errorMessage = document.getElementById('connectionErrorMessage');
            
            if (!codeInput || !errorMessage) return;
            
            // Get connection code
            const connectionCode = codeInput.value.trim();
            
            if (!connectionCode) {
                errorMessage.textContent = 'Please enter a connection code.';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Disable input and show loading
            codeInput.disabled = true;
            
            // Connect to property
            const success = await this.umbrellaManager.connectToPropertyByCode(connectionCode);
            
            if (success) {
                // Close modal on success
                this.closeConnectionModal();
                
                // Show success notification
                if (typeof showNotification === 'function') {
                    showNotification('Successfully connected to property!', 'success');
                }
            } else {
                // Show error
                errorMessage.textContent = 'Invalid connection code or unable to connect to property.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error connecting to property:', error);
            // Show error message
            const errorMessage = document.getElementById('connectionErrorMessage');
            if (errorMessage) {
                errorMessage.textContent = error.message || 'An error occurred while connecting to property.';
                errorMessage.style.display = 'block';
            }
        } finally {
            // Re-enable input
            const codeInput = document.getElementById('connectionCodeInput');
            if (codeInput) codeInput.disabled = false;
        }
    }
}

// Add a global function to show the connection modal
window.showPropertyConnectionModal = () => {
    if (window.propertyConnection) {
        window.propertyConnection.showConnectionModal();
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the property connection with a delay to ensure umbrella manager is loaded
    setTimeout(() => {
        window.propertyConnection = new PropertyConnection(window.umbrellaManager);
    }, 1500);
});