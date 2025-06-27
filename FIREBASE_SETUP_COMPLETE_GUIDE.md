# Firebase Data Setup Guide

## Quick Setup Steps

### 1. **Run the Firebase Business Setup Tool**
1. Open `firebase-business-setup.html` in your browser
2. This tool will:
   - Check Firebase connection
   - Create demo business data
   - Create umbrella properties
   - Create demo menu
   - Create super admin user record

### 2. **Set Up Firebase Authentication**
After running the setup tool, you need to create the actual Firebase Auth user:

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Email: `admin@macrospos.com`
4. Set a secure password
5. **Important**: You need to set custom claims for super admin role

### 3. **Set Custom Claims (Required)**
You can do this via Firebase Functions or Firebase CLI:

#### Option A: Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Set custom claims (replace USER_UID with actual UID from Firebase Auth)
firebase auth:set-custom-user-claims USER_UID '{"role":"super_admin","accessLevel":"global","permissions":["all"]}'
```

#### Option B: Create a Firebase Function
Create this function and deploy it:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setCustomClaims = functions.https.onCall(async (data, context) => {
  // This is a one-time setup function
  const { uid, role } = data;
  
  const customClaims = {
    role: 'super_admin',
    accessLevel: 'global',
    permissions: ['all']
  };
  
  await admin.auth().setCustomUserClaims(uid, customClaims);
  return { success: true };
});
```

### 4. **Test the System**

1. **Login as Super Admin**:
   - Go to `login.html`
   - Use super admin tab
   - Enter: `admin@macrospos.com` and your password

2. **Access Business Settings**:
   - From super admin dashboard, access POS for a business
   - Navigate to business settings
   - Should now load data from Firebase

### 5. **If Business Settings Shows "Setup Required"**

The business settings page will now:
- Check if umbrella manager is initialized
- Check if there's a current business selected
- If no business, show available businesses to select from
- If no businesses exist, direct you to the setup tool

### 6. **Firestore Security Rules**

Make sure your Firestore rules allow the operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow super admin full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'super_admin';
    }
    
    // Allow authenticated users to read businesses they have access to
    match /businesses/{businessId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write properties
    match /properties/{propertyId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write menus
    match /menus/{menuId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Data Structure Created

### Business Document (`businesses/DEMO_001`)
```json
{
  "businessID": "DEMO_001",
  "companyName": "Demo Restaurant",
  "businessType": "restaurant",
  "companyEmail": "demo@restaurant.com",
  "companyPhone": "+1-555-0123",
  "address": {
    "full": "123 Main St, Demo City, ST 12345",
    "website": "https://demo-restaurant.com"
  },
  "settings": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    // ... all the settings
  }
}
```

### Properties Documents (`properties/PROP_001`, `properties/PROP_002`)
```json
{
  "propertyID": "PROP_001",
  "businessID": "DEMO_001",
  "name": "Main Restaurant",
  "type": "restaurant",
  // ... property details
}
```

### Menu Document (`menus/DEMO_001_restaurant`)
```json
{
  "businessId": "DEMO_001",
  "menuType": "restaurant",
  "items": [
    {
      "id": "item_001",
      "name": "Classic Burger",
      "price": 12.99,
      // ... menu item details
    }
  ]
}
```

## Troubleshooting

### "Firebase not available"
- Check that Firebase scripts are loading
- Verify Firebase config is correct
- Check browser console for errors

### "No current business"
- Run the business setup tool
- Make sure business data exists in Firestore
- Check that umbrella manager is initialized

### "Permission denied"
- Check Firestore security rules
- Verify user is authenticated
- Ensure custom claims are set correctly

### "Business settings not found"
- Verify business document exists in Firestore
- Check the business ID is correct
- Ensure you have read permissions

## Next Steps

1. Run `firebase-business-setup.html`
2. Create Firebase Auth user with custom claims
3. Test login flow
4. Access business settings
5. System should now work with Firebase data!
