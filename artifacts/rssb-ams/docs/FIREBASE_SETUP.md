# Firebase Setup Guide

## Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `RSSB-SNE-RDP`
3. Click through and create

## Step 2 — Enable Firestore Database
1. Left sidebar → Build → Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select region: `asia-south1` (India)
5. Click Enable

## Step 3 — Enable Authentication
1. Left sidebar → Build → Authentication
2. Click "Get started"
3. Click "Email/Password" → Enable → Save

## Step 4 — Register Web App & Get Config
1. Click gear icon ⚙ → Project settings
2. Scroll to "Your apps" → click `</>` icon
3. App nickname: `RSSB-AMS` → Register app
4. Copy the firebaseConfig values

## Step 5 — Update Firestore Security Rules
Go to Firestore → Rules and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click Publish.

## Step 6 — Environment Variables
Set these in Replit Secrets:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
