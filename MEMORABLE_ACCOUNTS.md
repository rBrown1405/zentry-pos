# Memorable Account Name Generation

## Overview

The POS system now generates memorable account names for staff members using a user-friendly format that combines business and property information with random numbers.

## Format

**New Format**: `{business_letter}{property_letters}{3_numbers}`

Examples:
- `Wine Inc` + `John Wine Inc` → `wjwin470`
- `Pizza Palace` + `Downtown Location` → `pdown234` 
- `Coffee Corner` + `Main Street Cafe` → `cmain567`

## Implementation

### Core Functions

#### `IDGenerator.generateMemorableAccountName(businessName, propertyName, fullName)`
Generates a memorable account name using:
- **Business Letter**: First letter of business name (lowercase)
- **Property Letters**: Up to 4 letters from property name (lowercase, letters only)
- **3 Numbers**: Random numbers from 100-999

#### `IDStorage.generateUniqueMemorableAccountName(businessName, propertyName, fullName, position)`
- Generates unique account names by checking against existing accounts
- Retries with different random numbers if conflicts occur
- Throws error after 10 failed attempts

### Updated Registration Process

The staff registration process in `MultiPropertyManager.registerStaff()` now:

1. **Extracts Business Info**: Gets business name from connection code
2. **Determines Property**: Uses main property or first available property
3. **Generates Account**: Creates memorable account name
4. **Validates Uniqueness**: Ensures no conflicts with existing accounts

### Validation

The `validateStaffID()` function now accepts both formats:
- **Legacy**: `ABSV1234` (2 letters + 2 letters + 4 numbers)
- **Memorable**: `wjwin470` (2-6 lowercase letters + 3 numbers)

## Usage Examples

### Staff Registration
```javascript
// When registering new staff
const staffData = {
    firstName: 'Alice',
    lastName: 'Manager', 
    connectionCode: '123456'
};

const result = await MultiPropertyManager.registerStaff(staffData);
// result.staffId might be: 'wjwin470'
```

### Manual Generation
```javascript
// Generate account name manually
const accountName = IDGenerator.generateMemorableAccountName(
    'Wine Inc',           // Business name
    'John Wine Inc',      // Property name  
    'Alice Manager'       // Staff name (optional)
);
// Returns: 'wjwin470'
```

### Validation
```javascript
// Validate account name format
const isValid = IDGenerator.validateStaffID('wjwin470');
// Returns: true

// Also validates legacy format
const isValidLegacy = IDGenerator.validateStaffID('ABMG1234');
// Returns: true
```

## Benefits

1. **Memorable**: Easier for staff to remember their login names
2. **Contextual**: Account names relate to their business/property
3. **Professional**: Clean, lowercase format
4. **Unique**: Built-in uniqueness validation
5. **Backward Compatible**: Still validates legacy format accounts

## Migration Strategy

- **New Accounts**: Automatically use memorable format
- **Existing Accounts**: Continue working with legacy format
- **Mixed Environment**: System supports both formats simultaneously

## Testing

Use the test files to verify functionality:

### Browser Test
Open `test-memorable-accounts.html` in a browser to:
- Run automated tests
- Try custom business/property combinations
- Verify format validation

### Example Output
```
Test 1: Wine Inc + John Wine Inc → wjwin470 (Valid: Yes)
Test 2: Pizza Palace + Downtown Location → pdown234 (Valid: Yes)  
Test 3: Coffee Corner + Main Street Cafe → cmain567 (Valid: Yes)
```

## Technical Notes

- Account names are always lowercase for consistency
- Property letters are extracted from property name (letters only)
- Numbers are guaranteed to be 3 digits (100-999)
- Collision handling automatically retries with new numbers
- Maximum 10 attempts before throwing error

## Files Modified

- `id-utils.js`: Core generation functions
- `multi-property-manager.js`: Updated staff registration
- `multi-property-manager-new.js`: Updated registration (new version)
- Added test files for verification
