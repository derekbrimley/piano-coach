# Practice Goal System - Quick Start Guide

## ⚡ Deploy in 2 Steps

### Step 1: Deploy Firestore Rules (REQUIRED)

```bash
firebase deploy --only firestore:rules
```

This adds security rules for the new `practiceGoals` collection. **Without this, you'll see permission errors.**

### Step 2: Test the Feature

1. Open `http://localhost:5173` in your browser
2. Log in to your app
3. You should see a card: **"No practice goal set"**
4. Click **"Set Goal"**
5. Select a goal type (e.g., "Performance/Recital")
6. Add optional details
7. Choose a timeframe
8. Click **"Set Goal"**
9. You're redirected to the dashboard with your goal displayed
10. Click **"Start Practice Session"**
11. See the message: **"Today's session supports your goal: [your goal]"**

## 🎯 What You Built

The practice focus has been refactored from a simple 4-option selector to a comprehensive goal-based system:

**Before:**
- User selects: "learning new pieces", "ear training", "improving technique", or "expressivity"
- Stored as a single enum

**After:**
- User creates a detailed goal with:
  - Goal type (7 options including Performance, Exam, Sight-Reading, etc.)
  - Optional specific details (free text)
  - Start and end dates (1 week to 3 months)
  - Status tracking (active/completed/abandoned)
- Dashboard shows goal prominently with days remaining
- LLM receives structured goal information in the prompt
- Expiration warnings and quick extend/complete actions

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/hooks/usePracticeGoal.ts` | Firestore hook for goals CRUD |
| `src/components/PracticeGoalSetup.tsx` | Goal creation/edit form |
| `src/components/Dashboard.tsx` | Shows active goal card |
| `src/components/SessionStartMessage.tsx` | "Today's session supports..." message |
| `src/utils/userSkillSummary.ts` | Formats goal for LLM prompt |
| `firestore.rules` | Security rules for practiceGoals |

## 🔧 Troubleshooting

### "Permission denied" error?
→ Run `firebase deploy --only firestore:rules`

### Goal not showing on dashboard?
→ Check browser console for errors
→ Verify you're logged in
→ Refresh the page after deploying rules

### Want to use Firebase Emulator?
→ See `FIRESTORE_RULES_DEPLOYMENT.md` for setup

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - Complete feature documentation
- **PRACTICE_GOAL_MIGRATION.md** - Migration guide for existing users
- **FIRESTORE_RULES_DEPLOYMENT.md** - Detailed deployment instructions

## ✅ Testing Checklist

- [ ] Create a new goal
- [ ] Edit an existing goal
- [ ] Complete a goal
- [ ] Extend a goal (works when < 7 days remaining)
- [ ] Generate a practice session and verify goal message appears
- [ ] Verify LLM-generated session aligns with goal type

## 🚀 Deploy to Production

```bash
# Build the app
npm run build

# Deploy rules and hosting
firebase deploy
```

## 🎉 You're Done!

The goal-based practice system is now live. Users can set meaningful practice objectives and get AI-tailored sessions that support their goals.
