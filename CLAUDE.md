# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Piano Practice Coach is a React + TypeScript web app that helps pianists structure personalized practice sessions. Users authenticate via Firebase, set up to 3 concurrent practice goals (performances, specific pieces, exams, technique, sight-reading, improvisation, ear training), manage their repertoire and skill progress, and generate AI-powered practice sessions using Claude or OpenAI APIs via Firebase Cloud Functions.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (Vite on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend**: React 19, TypeScript, MUI Joy (UI components), Tailwind CSS
- **Build Tool**: Vite
- **Backend/Database**: Firebase Authentication + Firestore
- **AI Integration**: Firebase Cloud Functions calling Anthropic Claude API or OpenAI API
- **Drag & Drop**: Atlaskit Pragmatic Drag and Drop
- **Routing**: React Router v7

## Architecture

### Application Flow

1. **Authentication** (`src/contexts/AuthContext.tsx`): Wraps the entire app, manages Firebase auth state
2. **Routing** (`src/App.tsx`): React Router manages navigation between views with session state preserved in memory
3. **Navigation Flow**:
   - Dashboard → Goals Setup → Session Generator → Practice Timer → Progress Logger → back to Dashboard
   - Profile page accessible from navigation for managing repertoire, scale skills, and ear training data
   - Navigation is shown on all pages except timer and progress logger

### Key State Management Patterns

- **Auth State**: Context provider (`AuthContext`) wrapping entire app
- **Session State**: React Router navigation handles transitions, `App.tsx` holds in-memory `currentSession` state during practice flow
- **Firebase Data**: Custom hooks (see below) use Firestore real-time listeners with `onSnapshot`
- **User Profile Data**: Separate hooks for repertoire, scale skills, ear training, and user preferences

### Custom Hooks (src/hooks/)

All hooks follow this pattern: accept `userId`, return data + loading state + CRUD operations, use Firestore `onSnapshot` for real-time updates:

- `usePracticeGoal(userId)`: Manages up to 3 active practice goals (7 types: performance, specificPiece, exam, sightReading, improvisation, earTrainingGoal, technique). Returns `practiceGoals` (active only), `allGoals`, and operations like `createGoal`, `updateGoal`, `completeGoal`, `abandonGoal`, `extendGoal`
- `useSessions(userId)`: Manages completed practice sessions
- `useRepertoire(userId)`: Manages learned pieces with review tracking
- `useScaleSkills(userId)`: Tracks BPM progress for all 24 scales across 6 techniques
- `useEarTraining(userId)`: Tracks mastered intervals and chords
- `useUserPreferences(userId)`: Stores default session length preference

### Session Generation

Session generation is now handled by **Firebase Cloud Functions** (`functions/index.js`):

1. **Frontend** (`src/services/claudeApi.ts`): Calls the Firebase Cloud Function endpoint with user skill summary and session length
2. **Cloud Function** (`functions/index.js`):
   - Receives request with skill summary and session length
   - Calls Claude API (`claude-3-5-haiku-latest`) or OpenAI API (`gpt-4o-mini`) based on `LLM_PROVIDER` environment variable
   - Returns JSON array of activities
3. **Fallback** (`src/utils/sessionGeneratorFallback.ts`): Rule-based generation if Cloud Function fails

**Environment variable**: Set `LLM_PROVIDER` in Firebase Cloud Functions config to 'claude' or 'openai'. API keys are also stored in Cloud Functions environment.

**Frontend environment variables** (`.env.local`):
```
VITE_CLOUD_FUNCTION_URL=your_cloud_function_url
```

### Data Model (TypeScript)

All types defined in `src/types/index.ts`:

#### Practice Goals
- **PracticeGoal**: Main goal type with 7 goal types (performance, specificPiece, exam, sightReading, improvisation, earTrainingGoal, technique)
- **GoalSpecificData**: Union type containing type-specific tracking data:
  - `PerformanceGoalData`: Tracks pieces, readiness, run-throughs, memory confidence
  - `SpecificPieceGoalData`: Tracks sections, BPM progress, learning stages, problem spots
  - `ExamGoalData`: Tracks exam date, level, requirements, mock attempts
  - `SightReadingGoalData`: Tracks level progression, pieces read, sessions, streaks
  - `ImprovisationGoalData`: Tracks style, keys/progressions, patterns, recording sessions
  - `EarTrainingGoalData`: Tracks skill focus, sessions, accuracy, streaks
  - `TechniqueGoalData`: Tracks specific technique, BPM progression, keys/patterns, exercises
- **PracticeGoalStatus**: 'active' | 'completed' | 'abandoned'

#### Sessions and Activities
- **Activity**: Individual practice task with type, title, description, duration, suggestions, and optional tracking fields (completionType, quality, notes)
- **ActivityType**: 'warmup' | 'technique' | 'repertoire' | 'exercise' | 'goal'
- **Session**: Array of activities with metadata (totalDuration, date, completedAt, notes)
- **CompletionType**: 'completed' | 'progressed' | 'reviewed' | 'practiced'

#### Profile Data
- **RepertoirePiece**: Learned pieces with review history
- **ScaleSkill**: BPM tracking for each of 24 scales across 6 techniques
- **EarTrainingSkills**: Arrays of mastered intervals and chords
- **UserPreferences**: Default session length

### Firestore Collections

All collections scoped by `userId` with security rules enforcing user isolation:

- `practiceGoals`: Practice goals (up to 3 active per user, with goal-specific tracking data)
- `sessions`: Completed practice sessions
- `repertoire`: Learned pieces
- `scaleSkills`: One doc per scale key with BPM values for each technique
- `earTraining`: Single doc per user with arrays of mastered intervals/chords
- `userPreferences`: User preferences (default session length)

Security rules in `firestore.rules` enforce: users can only read/write their own data.

### Firebase Configuration

Firebase config is in `src/firebase.ts`. For development:
1. Create project at console.firebase.google.com
2. Enable Email/Password authentication
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Set up Firebase Cloud Functions with environment config for API keys

**Cloud Functions Environment Config**:
```bash
firebase functions:config:set anthropic.api_key="your_key" openai.api_key="your_key" llm.provider="claude"
```

## Component Organization

### Main Views
- **Dashboard** (`Dashboard.tsx`): Shows stats, active goals with progress, recent sessions
- **EnhancedGoalSetup** (`EnhancedGoalSetup.tsx`): Manages up to 3 active goals, allows complete/extend/abandon
- **SessionGenerator** (`SessionGenerator.tsx`): Generates session, allows drag-reorder, replace activities, caches session
- **PracticeTimer** (`PracticeTimer.tsx`): Countdown timer with auto-advance, notifications
- **ProgressLogger** (`ProgressLogger.tsx`): Log completion, quality, notes for each activity and overall session
- **Profile** (`Profile.tsx`): Manage repertoire, scale skills, ear training

### Goal Components
- **Goal Forms** (`src/components/practiceGoals/`): Separate form components for each goal type:
  - `PerformanceGoalForm.tsx`
  - `SpecificPieceGoalForm.tsx`
  - `ExamGoalForm.tsx`
  - `SightReadingGoalForm.tsx`
  - `ImprovisationGoalForm.tsx`
  - `EarTrainingGoalForm.tsx`
  - `TechniqueGoalForm.tsx`
- **Goal Progress** (`src/components/goalProgress/`): Progress tracking components for each goal type:
  - `GoalProgressTracker.tsx`: Modal wrapper
  - Individual progress components for each goal type

### Shared Components
- **Navigation** (`Navigation.tsx`): Top navigation with logo, nav items, logout
- **Auth** (`Auth.tsx`): Login/signup forms
- **ExerciseSelector** (`ExerciseSelector.tsx`): Modal to select from exercise library

## Notable Implementation Details

- **Session State Persistence**: Sessions exist in memory (`App.tsx` state) during practice flow, persisted to Firestore only on completion in ProgressLogger. Sessions are also cached in localStorage for the current user.
- **Drag & Drop**: SessionGenerator uses Atlaskit's pragmatic-drag-and-drop for reordering activities with drop indicators and auto-scroll
- **Practice Timer**: Countdown timer with auto-advance between activities, browser notifications support, exit confirmation
- **AI Prompt Engineering**: Cloud Function builds prompt including user skill summary (generated by `src/utils/userSkillSummary.ts`) and prioritizes least-recently-reviewed repertoire
- **Goal Limits**: Users can have max 3 active goals simultaneously. Must complete or abandon before adding more.
- **Session Caching**: Generated sessions are cached in localStorage by user to survive page refreshes
- **Goal Progress Tracking**: Each goal type has detailed progress tracking with type-specific fields (sections, BPM, requirements, etc.)
- **Analytics**: Analytics events tracked in `src/utils/analytics.ts` (currently logs to console, can be extended for Firebase Analytics)
