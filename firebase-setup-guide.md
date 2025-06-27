# Firebase Setup Guide for Zentry POS

## 1. Firebase Authentication Setup

### Create Super Admin User
Since we've migrated to Firebase-only authentication, you need to create the super admin user in Firebase Auth:

1. **Go to Firebase Console Authentication**:
   - Navigate to your Firebase project
   - Click "Authentication" in the left sidebar
   - Go to the "Users" tab
   - Click "Add user"

2. **Create Super Admin Account**:
   - Email: `admin@macrospos.com`
   - Password: `Armoured@2025!` (or your preferred secure password)
   - Click "Add user"

3. **Set Custom Claims** (Required for Super Admin):
   You need to set custom claims for the super admin role. This must be done server-side or via Firebase CLI.

   **Option A: Firebase CLI (Recommended)**
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase Functions (if not already done)
   firebase init functions
   
   # Create a script to set custom claims
   ```

   **Option B: Firebase Functions**
   Create a Firebase Function to set custom claims:
   ```javascript
   const admin = require('firebase-admin');
   
   exports.setCustomClaims = functions.https.onCall(async (data, context) => {
     // Only allow this for initial setup or from authenticated super admin
     const uid = data.uid;
     const customClaims = {
       role: 'super_admin',
       accessLevel: 'global',
       permissions: ['all']
     };
     
     await admin.auth().setCustomUserClaims(uid, customClaims);
     return { success: true };
   });
   ```

## 2. Create Business Data in Firestore

### Option A: Manual Creation in Firebase Console
1. Go to Firestore Database in Firebase Console
2. Create a new collection called `businesses`
3. Add a document with the following structure:

```json
{
  "businessID": "BUSINESS_001",
  "companyName": "Demo Restaurant",
  "businessType": "restaurant",
  "companyEmail": "demo@restaurant.com",
  "companyPhone": "+1-555-0123",
  "address": {
    "full": "123 Main St, City, State 12345",
    "website": "https://demo-restaurant.com"
  },
  "settings": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "logoText": "DR",
    "autoPrintReceipts": false,
    "showTableNumbers": true,
    "enableTips": true,
    "taxRate": 8.25,
    "currency": "USD",
    "orderNotifications": true,
    "staffAlerts": true,
    "systemUpdates": false,
    "dailyReports": false,
    "weeklySummaries": false,
    "hotelBrand": "independent",
    "serviceCharge": 18,
    "deliveryTime": 30,
    "hotelMode": false
  },
  "createdAt": "2025-06-27T00:00:00.000Z",
  "updatedAt": "2025-06-27T00:00:00.000Z",
  "status": "active"
}
```

### Option B: Create via Registration System
Use the existing registration system to create a business:
1. Go to `registration.html`
2. Fill out the business registration form
3. This will create the business data in Firebase

## 3. Update Firestore Security Rules

Make sure your Firestore security rules allow authenticated users to read/write business data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow super admin full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'super_admin';
    }
    
    // Allow business owners/admins to access their business data
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.role in ['admin', 'owner'] || 
         request.auth.token.businessId == businessId);
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## 4. Test the System

1. **Login as Super Admin**:
   - Go to `login.html`
   - Use the super admin tab
   - Enter: `admin@macrospos.com` and your password
   - Should redirect to super admin dashboard

2. **Access Business Settings**:
   - From super admin dashboard, click "Access POS" for your business
   - Navigate to business settings
   - Should load settings from Firebase

## 5. Troubleshooting

### If Business Settings Won't Load:
1. Check browser console for errors
2. Verify Firebase connection
3. Ensure business document exists in Firestore
4. Check Firestore security rules

### If Super Admin Login Fails:
1. Verify user exists in Firebase Auth
2. Check custom claims are set
3. Verify email/password are correct
4. Check browser console for auth errors

## 6. Quick Setup Script

You can create a quick setup by running this in your browser console after logging in as super admin:

```javascript
// Quick business creation script
async function createDemoBusiness() {
  if (!window.firebaseServices) {
    console.error('Firebase not available');
    return;
  }
  
  const db = window.firebaseServices.getDb();
  
  const businessData = {
    businessID: 'DEMO_001',
    companyName: 'Demo Restaurant',
    businessType: 'restaurant',
    companyEmail: 'demo@restaurant.com',
    companyPhone: '+1-555-0123',
    address: {
      full: '123 Main St, City, State 12345',
      website: 'https://demo-restaurant.com'
    },
    settings: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logoText: 'DR',
      autoPrintReceipts: false,
      showTableNumbers: true,
      enableTips: true,
      taxRate: 8.25,
      currency: 'USD',
      orderNotifications: true,
      staffAlerts: true,
      systemUpdates: false,
      dailyReports: false,
      weeklySummaries: false,
      hotelBrand: 'independent',
      serviceCharge: 18,
      deliveryTime: 30,
      hotelMode: false
    },
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  };
  
  try {
    await db.collection('businesses').doc('DEMO_001').set(businessData);
    console.log('Demo business created successfully!');
  } catch (error) {
    console.error('Error creating demo business:', error);
  }
}

// Run the function
createDemoBusiness();
```

This should get your system up and running with Firebase data!
