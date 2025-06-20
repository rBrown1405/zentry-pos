// ID Generation and Validation Utilities

class IDGenerator {    static generateBusinessCode(businessName) {
        // Generate a business code from business name
        const cleaned = businessName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = cleaned.substring(0, 3).padEnd(3, 'X');
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${timestamp}`;
    }

    static generateBusinessId(businessCode) {
        // Generate a more readable business ID that includes the business name
        const businessNamePart = businessCode.substring(0, 3); // First 3 letters from business name
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const random = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2 random chars
        return `${businessNamePart}${random}${timestamp}`;
    }static generateStaffId(fullName, position) {
        // Generate staff ID from name and position
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[nameParts.length - 1] || '';
        
        // Get initials
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        
        // Position code
        const positionCode = this.getPositionCode(position);
        
        // Random number for uniqueness
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        
        return `${initials}${positionCode}${randomNum}`;
    }

    static generateMemorableAccountName(businessName, propertyName, fullName) {
        // Generate memorable account name: business letter + property letters + 3 numbers
        // Example: "Wine Inc" + "John Wine Inc" → "wjwin470"
        
        // Get business letter - first letter of business name
        const businessLetter = (businessName || '').trim().charAt(0).toLowerCase();
        
        // Get property letters - extract letters from property name
        const cleanPropertyName = (propertyName || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
        const propertyLetters = cleanPropertyName.substring(0, 4); // Take up to 4 letters
        
        // Generate 3 random numbers
        const randomNumbers = Math.floor(Math.random() * 900) + 100; // 100-999
        
        // Combine: business letter + property letters + 3 numbers
        const accountName = `${businessLetter}${propertyLetters}${randomNumbers}`;
        
        return accountName.toLowerCase();
    }

    static generateStaffAccountName(businessName, propertyName, fullName, position) {
        // New method to generate memorable staff account names
        // Uses business + property + numbers format for better memorability
        return this.generateMemorableAccountName(businessName, propertyName, fullName);
    }

    static getPositionCode(position) {
        const positionCodes = {
            'server': 'SV',
            'cashier': 'CS',
            'kitchen': 'KC',
            'manager': 'MG',
            'host': 'HS',
            'bartender': 'BT',
            'chef': 'CH',
            'admin': 'AD'
        };
        return positionCodes[position.toLowerCase()] || 'ST';
    }

    static validateBusinessCode(code) {
        // Business code should be 3 letters + 4 numbers (e.g., ABC1234)
        return /^[A-Z]{3}[0-9]{4}$/.test(code);
    }    static validateStaffID(staffId) {
        // Original format: 2 letters + 2 letters + 4 numbers (e.g., ABSV1234)
        const originalFormat = /^[A-Z]{2}[A-Z]{2}[0-9]{4}$/.test(staffId);
        
        // New memorable format: 1 letter + 1-4 letters + 3 numbers (e.g., wjwin470)
        const memorableFormat = /^[a-z]{2,6}[0-9]{3}$/.test(staffId);
        
        return originalFormat || memorableFormat;
    }    static validateBusinessId(businessId) {
        // Updated formats:
        // Old format: BIZ + businessCode + random + numbers (e.g., BIZABC1234XY567)
        const oldFormat = /^BIZ[A-Z0-9]+$/.test(businessId);
        
        // New format: 3 letters + 2 random chars + 6 numbers (e.g., ABC8X123456)
        const newFormat = /^[A-Z]{3}[A-Z0-9]{2}[0-9]{6}$/.test(businessId);
        
        return oldFormat || newFormat;
    }
}

class IDStorage {    static async generateUniqueStaffID(fullName, position) {
        let attempts = 0;
        let staffId;
        
        do {
            staffId = IDGenerator.generateStaffId(fullName, position);
            attempts++;
            
            // Check if ID already exists
            if (!localStorage.getItem(`staff_${staffId}`)) {
                break;
            }
            
            // Add random suffix if duplicate
            if (attempts > 1) {
                const suffix = Math.floor(Math.random() * 99).toString().padStart(2, '0');
                staffId = staffId.slice(0, -2) + suffix;
            }
        } while (attempts < 10);
        
        if (attempts >= 10) {
            throw new Error('Unable to generate unique staff ID');
        }
        
        return staffId;
    }

    static async generateUniqueMemorableAccountName(businessName, propertyName, fullName, position) {
        let attempts = 0;
        let accountName;
        
        do {
            accountName = IDGenerator.generateStaffAccountName(businessName, propertyName, fullName, position);
            attempts++;
            
            // Check if account name already exists
            if (!localStorage.getItem(`staff_${accountName}`) && !localStorage.getItem(`staffMember_${accountName}`)) {
                break;
            }
            
            // Add random suffix if duplicate
            if (attempts > 1) {
                const extraRandom = Math.floor(Math.random() * 90) + 10; // 10-99
                // Replace last 2 digits with new random numbers
                accountName = accountName.slice(0, -2) + extraRandom;
            }
        } while (attempts < 10);
        
        if (attempts >= 10) {
            throw new Error('Unable to generate unique memorable account name');
        }
        
        return accountName;
    }

    static async generateUniqueBusinessCode(businessName) {
        let attempts = 0;
        let businessCode;
        
        do {
            businessCode = IDGenerator.generateBusinessCode(businessName);
            attempts++;
            
            // Check if code already exists
            if (!localStorage.getItem(`business_${businessCode}`)) {
                break;
            }
            
            // Add random suffix if duplicate
            if (attempts > 1) {
                const suffix = Math.floor(Math.random() * 99).toString().padStart(2, '0');
                businessCode = businessCode.slice(0, -2) + suffix;
            }
        } while (attempts < 10);
        
        if (attempts >= 10) {
            throw new Error('Unable to generate unique business code');
        }
        
        return businessCode;
    }

    static async generateUniqueBusinessId(businessCode) {
        let attempts = 0;
        let businessId;
        
        do {
            businessId = IDGenerator.generateBusinessId(businessCode);
            attempts++;
            
            // Check if ID already exists
            if (!localStorage.getItem(`business_id_${businessId}`)) {
                break;
            }
        } while (attempts < 10);
        
        if (attempts >= 10) {
            throw new Error('Unable to generate unique business ID');
        }
        
        return businessId;
    }

    static getAllStaffForBusiness(businessCode) {
        const staff = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('staff_')) {
                const staffData = JSON.parse(localStorage.getItem(key));
                if (staffData.businessCode === businessCode) {
                    staff.push({
                        ...staffData,
                        id: key.replace('staff_', '')
                    });
                }
            }
        }
        return staff;
    }

    static getAllBusinesses() {
        const businesses = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('business_') && !key.startsWith('business_id_')) {
                const businessData = JSON.parse(localStorage.getItem(key));
                businesses.push({
                    ...businessData,
                    code: key.replace('business_', '')
                });
            }
        }
        return businesses;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IDGenerator, IDStorage };
}

// Make available globally
window.IDGenerator = IDGenerator;
window.IDStorage = IDStorage;
