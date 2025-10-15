# Enhanced Practice Goals Implementation

## Overview

This document describes the enhanced practice goals system that provides rich, goal-specific tracking capabilities for pianists. The system supports 7 different goal types, each with customized tracking fields and progress metrics.

## Goal Types

### 1. Performance/Recital (`performance`)
**Purpose**: Prepare for a specific performance or recital

**Setup Fields**:
- Event date
- List of pieces to perform

**Trackable Metrics**:
- Performance readiness per piece (Shaky / Solid / Performance-Ready)
- Full run-throughs completed (counter)
- Memory confidence rating (1-5 scale)
- Performance pressure practice sessions (counter)

### 2. Learning a Specific Piece (`specificPiece`)
**Purpose**: Master a particular piece from start to finish

**Setup Fields**:
- Piece name
- Composer (optional)
- Target completion date (optional)
- Configurable sections (e.g., Section A, B, Bridge, Coda)
- Current BPM and target BPM

**Trackable Metrics**:
- Sections learned (checklist)
- Tempo progress (current vs target BPM)
- Learning stages (Hands separately, Hands together, Memory, Polish)
- Problem spots (list with status: identified/working/resolved)
- Days worked on this piece (auto-tracked)

### 3. Exam/Audition (`exam`)
**Purpose**: Prepare for an exam, audition, or assessment

**Setup Fields**:
- Exam date
- Exam level/type (e.g., "ABRSM Grade 5")
- Required pieces (list)
- Technical requirements (list)

**Trackable Metrics**:
- Each requirement checked off
- Mock exam attempts (counter with dates)
- Confidence rating per requirement (1-5)

### 4. Improve Sight-Reading (`sightReading`)
**Purpose**: Build sight-reading skills systematically

**Setup Fields**:
- Current level (Beginner/Elementary/Intermediate/Advanced/Expert)
- Target level
- Frequency target (Daily / 3x per week / Weekly)

**Trackable Metrics**:
- Pieces sight-read (counter with dates)
- Current difficulty level (can progress)
- Accuracy self-rating per session (1-5)
- Consecutive days practiced (streak)

### 5. Build Improvisation Skills (`improvisation`)
**Purpose**: Develop improvisation abilities in a specific style

**Setup Fields**:
- Style (Jazz / Blues / Gospel / Classical / Other)
- Specific focus (free text, e.g., "12-bar blues in 3 keys")

**Trackable Metrics**:
- Keys/progressions mastered (checklist)
- Patterns or licks learned (counter)
- Recording sessions completed (counter)
- Backing track play-alongs (counter)

### 6. Ear Training (`earTrainingGoal`)
**Purpose**: Improve ear training abilities

**Setup Fields**:
- Skill focus (checkboxes: Intervals, Chord quality, Progressions, Melodies)
- Target description (free text)

**Trackable Metrics**:
- Exercises completed (counter)
- Accuracy percentage (per session and overall average)
- Current level/difficulty
- Consecutive days practiced (streak)

### 7. Master Technique (`technique`)
**Purpose**: Master a specific technical skill or exercise

**Setup Fields**:
- Specific technique (e.g., "Scales in all major keys at 120 BPM")
- Technical exercise/method (optional: Hanon, Czerny, etc.)
- Starting BPM and target BPM

**Trackable Metrics**:
- Keys/patterns mastered (checklist)
- Tempo progression (starting → current → target BPM)
- Days practiced (counter)
- Individual exercises completed (checklist)

## Technical Implementation

### Type Definitions (`src/types/index.ts`)

The system uses TypeScript discriminated unions to ensure type safety for different goal types:

```typescript
export type PracticeGoalType =
  | 'performance'
  | 'specificPiece'
  | 'exam'
  | 'sightReading'
  | 'improvisation'
  | 'earTrainingGoal'
  | 'technique'
  | 'other';

export interface PracticeGoal {
  id?: string;
  userId: string;
  goalType: PracticeGoalType;
  title: string;
  specificDetails?: string;
  startDate: string;
  endDate: string;
  status: PracticeGoalStatus;
  createdAt: string;
  updatedAt: string;
  goalData?: GoalSpecificData; // Union type of all goal-specific data structures
}
```

Each goal type has its own data interface (e.g., `PerformanceGoalData`, `SpecificPieceGoalData`, etc.).

### Form Components

Goal-specific form components are located in `src/components/practiceGoals/`:

- `PerformanceGoalForm.tsx`
- `SpecificPieceGoalForm.tsx`
- `ExamGoalForm.tsx`
- `SightReadingGoalForm.tsx`
- `ImprovisationGoalForm.tsx`
- `EarTrainingGoalForm.tsx`
- `TechniqueGoalForm.tsx`

The master component `EnhancedPracticeGoalSetup.tsx` routes to the appropriate form based on selected goal type.

### Database Schema (Firestore)

Collection: `practiceGoals`

Document structure:
```json
{
  "userId": "string",
  "goalType": "performance" | "specificPiece" | ...,
  "title": "string",
  "specificDetails": "string (optional)",
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "status": "active" | "completed" | "abandoned",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string",
  "goalData": {
    // Goal-specific tracking data (flexible JSON structure)
    // Structure depends on goalType
  }
}
```

### Hooks

**`usePracticeGoal` hook** (`src/hooks/usePracticeGoal.ts`):
- Manages CRUD operations for practice goals
- Enforces limit of 3 active goals per user
- Handles goal-specific data serialization

## Session Tracking Enhancements

### New Activity Fields

Activities now support enhanced tracking:

```typescript
export interface Activity {
  // ... existing fields
  completionType?: CompletionType; // 'completed' | 'progressed' | 'reviewed' | 'practiced'
  quality?: number; // 1-5 stars
  notes?: string; // Session-specific notes
  practiceGoalId?: string; // Link to enhanced practice goal
}
```

### Completion Types

Replace the simple "achieved" boolean with context-appropriate completion types:

- **Completed**: For discrete exercises, ear training sessions
- **Progressed**: For pieces in progress, technique building
- **Reviewed**: For repertoire maintenance
- **Practiced**: Neutral default

## UI/UX Flow

### Creating a Goal

1. User clicks "Add Goal" (maximum 3 active goals)
2. Goal type selection screen shows all available goal types
3. User selects a goal type
4. Form shows:
   - Goal title input (optional, auto-generated if blank)
   - Duration selector (2 weeks to 6 months)
   - Goal-specific configuration fields
5. Goal is created with initial tracking structure

### Tracking Progress

*Note: Progress tracking UI components are planned for future implementation. They will include:*

- Dashboard widgets showing progress for each active goal
- Goal-specific detail views with relevant metrics
- Visual progress indicators (progress bars, charts, streaks)
- Quick-action buttons for common tracking operations

### Managing Goals

Users can:
- View all active goals on dashboard
- Edit goal details and tracking data
- Extend goal duration
- Mark goals as completed or abandoned
- View history of completed/abandoned goals

## Migration Path

### For Existing Goals

The old `PracticeGoal` structure (simple goals with just type, dates, and description) remains backward compatible. Old goals will:

1. Continue to work with existing functionality
2. Display without enhanced tracking features
3. Can be completed/extended/abandoned normally

### Optional Migration

Users can:
1. Keep old goals as-is until they expire
2. Create new enhanced goals alongside old ones
3. No automatic migration required

## Future Enhancements

### Progress Display Components (To Be Implemented)

Each goal type should have a dedicated progress display component:

- `PerformanceGoalProgress.tsx` - Show readiness levels, run-throughs, confidence
- `SpecificPieceGoalProgress.tsx` - Show section completion, BPM chart, problem spots
- `ExamGoalProgress.tsx` - Show requirements checklist, mock exam history
- `SightReadingGoalProgress.tsx` - Show streak, pieces read count, accuracy trend
- `ImprovisationGoalProgress.tsx` - Show keys mastered, patterns learned, recordings
- `EarTrainingGoalProgress.tsx` - Show accuracy percentage, streak, exercises completed
- `TechniqueGoalProgress.tsx` - Show BPM progression chart, keys/patterns mastered

### AI Integration

Enhanced goals can inform AI-generated practice sessions:
- Generate activities targeting weak areas (low-confidence requirements, unlearned sections)
- Suggest appropriate difficulty based on current level
- Recommend focus areas based on goal deadlines

### Analytics

Track and display:
- Goal completion rates
- Average time to complete different goal types
- Most common problem spots across users
- Correlation between practice frequency and progress

## API Reference

### Creating a Goal

```typescript
const { createGoal } = usePracticeGoal(userId);

await createGoal({
  goalType: 'specificPiece',
  title: 'Learn Moonlight Sonata',
  startDate: new Date().toISOString(),
  endDate: calculateEndDate(12), // 12 weeks
  goalData: {
    pieceName: 'Moonlight Sonata',
    composer: 'Beethoven',
    sections: [
      { id: '1', name: 'Section A', learned: false },
      { id: '2', name: 'Section B', learned: false }
    ],
    currentBPM: 60,
    targetBPM: 120,
    learningStages: {
      handsSeparately: false,
      handsTogether: false,
      memory: false,
      polish: false
    },
    problemSpots: [],
    daysWorked: 0
  }
});
```

### Updating Goal Progress

```typescript
const { updateGoal } = usePracticeGoal(userId);

// Update specific tracking data
await updateGoal(goalId, {
  goalData: {
    ...existingGoalData,
    currentBPM: 80, // Updated BPM
    learningStages: {
      ...existingGoalData.learningStages,
      handsSeparately: true // Mark stage as complete
    }
  }
});
```

## Notes

- Goal-specific tracking data is stored as a flexible JSON object in Firestore
- Type safety is maintained through TypeScript discriminated unions
- The system is designed to be extensible for adding new goal types
- Firestore security rules should enforce that users can only access their own goals

## Questions or Issues?

For questions about implementation details or to report issues, please see the main project documentation or create an issue in the repository.
