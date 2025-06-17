// ID Generation and Validation Utilities

class IDGenerator {
    static generateBusinessCode(businessName) {
        // Generate a business code from business name
        const cleaned = businessName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = cleaned.substring(0, 3).padEnd(3, 'X');
        const timestamp = Date.now().toString().slice(-4);
        return `${prefix}${timestamp}`;
    }

    static generateBusinessId(businessCode) {
        // Generate a unique business ID
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BIZ${businessCode}${random}${timestamp.slice(-3)}`;
    }

    static generateStaffId(fullName, position) {
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
    }

    static validateStaffID(staffId) {
        // Staff ID should be 2 letters + 2 letters + 4 numbers (e.g., ABSV1234)
        return /^[A-Z]{2}[A-Z]{2}[0-9]{4}$/.test(staffId);
    }

    static validateBusinessId(businessId) {
        // Business ID should start with BIZ (e.g., BIZABC1234XY567)
        return /^BIZ[A-Z0-9]+$/.test(businessId);
    }
}

class IDStorage {
    static async generateUniqueStaffID(fullName, position) {
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
