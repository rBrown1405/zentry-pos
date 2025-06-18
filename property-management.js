// Property Management Utilities

class PropertyManager {
    static generatePropertyCode(propertyName, businessType) {
        // Generate property code from name and type
        const cleaned = propertyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = cleaned.substring(0, 3).padEnd(3, 'X');
        const typeCode = this.getBusinessTypeCode(businessType);
        const timestamp = Date.now().toString().slice(-3);
        return `${prefix}${typeCode}${timestamp}`;
    }

    static getBusinessTypeCode(businessType) {
        const typeCodes = {
            'restaurant': 'RST',
            'cafe': 'CAF',
            'bar': 'BAR',
            'hotel': 'HTL',
            'retail': 'RTL',
            'food-truck': 'FTK',
            'catering': 'CTR'
        };
        return typeCodes[businessType] || 'GEN';
    }

    static addProperty(businessInfo, propertyInfo) {
        try {
            // Generate unique property code
            const propertyCode = this.generatePropertyCode(propertyInfo.propertyName, propertyInfo.businessType);
            
            // Create property object
            const property = {
                ...propertyInfo,
                propertyCode,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            // Add property to business properties array
            if (!businessInfo.properties) {
                businessInfo.properties = [];
            }
            businessInfo.properties.push(property);

            // Store property separately for easy access
            localStorage.setItem(`property_${propertyCode}`, JSON.stringify(property));

            // Update business info in storage
            localStorage.setItem(`business_id_${businessInfo.businessID}`, JSON.stringify(businessInfo));
            localStorage.setItem(`business_${businessInfo.businessCode}`, JSON.stringify(businessInfo));

            return propertyCode;
        } catch (error) {
            console.error('Error adding property:', error);
            throw new Error('Failed to add property');
        }
    }

    static getProperty(propertyCode) {
        const propertyData = localStorage.getItem(`property_${propertyCode}`);
        return propertyData ? JSON.parse(propertyData) : null;
    }

    static getPropertiesForBusiness(businessCode) {
        const properties = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('property_')) {
                const propertyData = JSON.parse(localStorage.getItem(key));
                // We need to check if this property belongs to the business
                // This would require storing business reference in property
                properties.push(propertyData);
            }
        }
        return properties;
    }

    static updateProperty(propertyCode, updates) {
        const property = this.getProperty(propertyCode);
        if (!property) {
            throw new Error('Property not found');
        }

        const updatedProperty = {
            ...property,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`property_${propertyCode}`, JSON.stringify(updatedProperty));
        return updatedProperty;
    }

    static deleteProperty(propertyCode) {
        localStorage.removeItem(`property_${propertyCode}`);
    }

    static validatePropertyCode(code) {
        // Property code should be 3 letters + 3 letters + 3 numbers (e.g., ABCRST123)
        return /^[A-Z]{3}[A-Z]{3}[0-9]{3}$/.test(code);
    }
}

// Enhanced ID Storage with business identifier generation
IDStorage.generateUniqueBusinessIdentifiers = async function(companyName, businessType) {
    try {
        // Generate business code
        const businessCode = await this.generateUniqueBusinessCode(companyName);
        
        // Generate business ID
        const businessID = await this.generateUniqueBusinessId(businessCode);

        return { businessCode, businessID };
    } catch (error) {
        console.error('Error generating business identifiers:', error);
        throw error;
    }
};

// Make available globally
window.PropertyManager = PropertyManager;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PropertyManager };
}
