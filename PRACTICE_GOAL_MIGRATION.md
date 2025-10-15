# Practice Goal System Migration Guide

## Overview

This guide documents the migration from the simple 4-option practice focus system to the new goal-based practice system.

## What Changed

### Old System (DEPRECATED)
- **Location**: `userPreferences` collection, `practiceFocus` field
- **Options**: 4 simple choices: 'newPieces', 'technique', 'earTraining', 'expressivity'
- **Storage**: Single enum value per user

### New System
- **Location**: New `practiceGoals` collection
- **Options**: 7 goal types with detailed metadata
  - Performance/Recital
  - Learning a Specific Piece
  - Exam/Audition
  - Improve Sight-Reading
  - Build Improvisation Skills
  - General Skill Development
  - Other
- **Storage**: Full goal objects with:
  - Goal type
  - Optional specific details (free text)
  - Start date
  - End date
  - Status (active/completed/abandoned)
  - Timestamps

## Migration Strategy

### For Existing Users

The system handles migration gracefully:

1. **Existing users with old `practiceFocus`**:
   - The old focus is still read as a fallback
   - Users will see a prompt to set a new practice goal on their dashboard
   - LLM session generation will use the old focus until a goal is set

2. **New users**:
   - Prompted to set a practice goal immediately
   - No fallback needed

### Data Migration Script (Optional)

If you want to automatically migrate existing users from old focus to new goals, you can run this script:

```typescript
// Migration script to convert old practiceFocus to new practiceGoals
// Run this in a Firebase Cloud Function or locally with admin SDK

import { getFirestore } from 'firebase-admin/firestore';

const FOCUS_TO_GOAL_TYPE = {
  'newPieces': 'specificPiece',
  'technique': 'general',
  'earTraining': 'general',
  'expressivity': 'general'
};

async function migrateUserPreferencesToGoals() {
  const db = getFirestore();

  // Get all user preferences
  const prefsSnapshot = await db.collection('userPreferences').get();

  for (const doc of prefsSnapshot.docs) {
    const data = doc.data();
    const userId = data.userId;
    const oldFocus = data.practiceFocus;

    // Check if user already has a practice goal
    const existingGoals = await db.collection('practiceGoals')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    if (existingGoals.empty) {
      // Create new practice goal based on old focus
      const now = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28); // 4 weeks default

      await db.collection('practiceGoals').add({
        userId,
        goalType: FOCUS_TO_GOAL_TYPE[oldFocus] || 'general',
        startDate: now,
        endDate: endDate.toISOString(),
        status: 'active',
        createdAt: now,
        updatedAt: now
      });

      console.log(`Migrated user ${userId} from focus '${oldFocus}'`);
    }
  }
}
```

## Code Changes Summary

### New Files
- `src/types/index.ts` - Added `PracticeGoal`, `PracticeGoalType`, `PracticeGoalStatus`
- `src/hooks/usePracticeGoal.ts` - Hook for managing practice goals
- `src/components/PracticeGoalSetup.tsx` - UI for creating/editing goals
- `src/components/SessionStartMessage.tsx` - Shows goal context at session start
- `firestore.rules` - Added security rules for `practiceGoals` collection

### Modified Files
- `src/utils/userSkillSummary.ts` - Now accepts and formats practice goal for LLM
- `src/components/Dashboard.tsx` - Shows current active goal with expiration warnings
- `src/components/SessionGenerator.tsx` - Passes practice goal to LLM
- `src/App.tsx` - Added route for `/practice-goal`

### Backwards Compatibility
- Old `practiceFocus` field is maintained in `UserPreferences` type (marked as DEPRECATED)
- `generateUserSkillSummary()` accepts both old and new systems
- If no practice goal exists, falls back to old `practiceFocus`
- No breaking changes for existing users

## Testing Checklist

- [ ] New user can set their first practice goal
- [ ] Existing user without goal sees prompt to set one
- [ ] Dashboard shows active goal with correct information
- [ ] Goal expiration warning appears when < 7 days remaining
- [ ] User can extend goal by 4 weeks
- [ ] User can complete goal
- [ ] User can edit goal details
- [ ] Session generator shows "Today's session supports your goal" message
- [ ] LLM receives properly formatted goal information
- [ ] Firestore security rules prevent cross-user access

## Future Enhancements

Consider these for future iterations:

1. **Multiple Concurrent Goals**: Allow users to have multiple active goals
2. **Goal Templates**: Pre-defined goal templates with suggested timelines
3. **Progress Tracking**: Track completion percentage toward goal
4. **Goal History**: View completed/abandoned goals with analytics
5. **Milestone Tracking**: Break large goals into smaller milestones
6. **Smart Notifications**: Remind users about goals via email/push notifications
7. **Goal Recommendations**: Suggest goals based on user's skill level and history
