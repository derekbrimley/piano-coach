# Firestore Rules Deployment Guide

## ⚠️ Permission Error Fix

If you're seeing this error in the console:
```
@firebase/firestore: Firestore (12.3.0): Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

This means the Firestore security rules need to be deployed to include the new `practiceGoals` collection.

## 🚀 Quick Fix

### Option 1: Deploy Rules to Production Firebase

```bash
# Deploy the updated Firestore rules
firebase deploy --only firestore:rules
```

This will update the production Firestore database with the new rules that allow access to the `practiceGoals` collection.

### Option 2: Use Firestore Emulator for Local Development

If you want to test locally without touching production:

1. **Start the Firebase emulators**:
   ```bash
   firebase emulators:start
   ```

2. **Update your Firebase config** to use the emulator:

   In `src/firebase.ts`, add after initializing Firestore:
   ```typescript
   import { connectFirestoreEmulator } from 'firebase/firestore';

   // Only connect to emulator in development
   if (location.hostname === 'localhost') {
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

### Option 3: Temporarily Test Without Goals (Not Recommended)

The app has backwards compatibility, so it will fall back to showing "No practice goal set" and won't crash. However, you won't be able to create goals until rules are deployed.

## 📋 What the New Rules Include

The updated `firestore.rules` file adds this section:

```
// Practice goals collection - users can only access their own practice goals
match /practiceGoals/{practiceGoalId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.userId;
}
```

This ensures:
- ✅ Users can only read their own goals
- ✅ Users can only create goals for themselves
- ✅ Users can only update their own goals
- ✅ No cross-user data access

## 🔍 Verify Rules Are Deployed

After deploying, you can verify in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. You should see the `practiceGoals` rule section

## ✅ After Deployment

Once rules are deployed:
1. Refresh your browser at `http://localhost:5173`
2. The permission error will disappear
3. You can now create and manage practice goals
4. Test the full flow:
   - Click "Set Goal" on dashboard
   - Create a goal
   - Verify it appears on dashboard
   - Generate a practice session
   - See "Today's session supports your goal" message

## 🆘 Still Having Issues?

If you continue to see permission errors after deploying:

1. **Check you're deploying to the right project**:
   ```bash
   firebase use
   ```

2. **Force deploy rules**:
   ```bash
   firebase deploy --only firestore:rules --force
   ```

3. **Check Firebase Console** to ensure the rules were updated

4. **Clear browser cache** and refresh

5. **Verify authentication** - make sure you're logged in to the app

## 📝 Notes

- The query in `usePracticeGoal.ts` was simplified to avoid requiring a Firestore index
- It uses `where('userId', '==', userId)` and sorts in memory
- This is more efficient than creating a compound index for a small dataset
- Error handling was added to gracefully handle permission issues
