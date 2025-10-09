# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Piano Practice Coach is a React + TypeScript web app that helps pianists structure personalized practice sessions. Users authenticate via Firebase, set practice goals (new pieces, technique, listening skills), manage their repertoire and skill progress, and generate AI-powered practice sessions using Claude or OpenAI APIs.

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

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend/Database**: Firebase Authentication + Firestore
- **AI Integration**: Anthropic Claude API and OpenAI API (configurable)
- **Drag & Drop**: Atlaskit Pragmatic Drag and Drop
- **Routing**: React Router v7

## Architecture

### Application Flow

1. **Authentication** (`src/contexts/AuthContext.tsx`): Wraps the entire app, manages Firebase auth state
2. **Routing** (`src/App.tsx`): React Router manages navigation between views with session state preserved in memory
3. **Navigation Flow**:
   - Dashboard → Goal Setup → Session Generator → (optionally) Session Customizer → Practice Timer → Progress Logger → back to Dashboard
   - Profile page accessible from sidebar for managing repertoire, scale skills, and ear training data

### Key State Management Patterns

- **Auth State**: Context provider (`AuthContext`) wrapping entire app
- **Goal/Session State**: React Router navigation handles transitions, `App.tsx` holds in-memory session state during practice flow
- **Firebase Data**: Custom hooks (see below) use Firestore real-time listeners with `onSnapshot`
- **User Profile Data**: Separate hooks for repertoire, scale skills, and ear training

### Custom Hooks (src/hooks/)

All hooks follow this pattern: accept `userId`, return data + loading state + CRUD operations, use Firestore `onSnapshot` for real-time updates:

- `useGoals(userId)`: Manages practice goals (4 types: newPiece, technique, listening, repertoire)
- `useSessions(userId)`: Manages completed practice sessions
- `useRepertoire(userId)`: Manages learned pieces with review frequency tracking
- `useScaleSkills(userId)`: Tracks BPM progress for all 24 scales across 6 techniques
- `useEarTraining(userId)`: Tracks mastered intervals and chords
- `useUserPreferences(userId)`: Stores practice focus preference

### Session Generation

Two approaches implemented in parallel:

1. **Rule-based** (`src/utils/sessionGenerator.ts`): Generates activities from goals using predefined templates and exercise library
2. **LLM-based** (`src/services/claudeApi.ts`): Sends user profile summary + goals to Claude/OpenAI, receives JSON array of activities

Switch LLM provider by changing `LLM_PROVIDER` constant in `src/services/claudeApi.ts` (values: 'claude' or 'openai').

### Data Model (TypeScript)

All types defined in `src/types/index.ts`:

- **Goals**: 4 types (NewPieceGoal, TechniqueGoal, ListeningGoal, RepertoireGoal), all extend BaseGoal
- **Activities**: Used in sessions, can link to goals, exercises, or repertoire pieces via `goalId`, `exerciseId`, or `pieceId`
- **Session**: Array of activities with metadata (duration, notes, completion timestamp)

### Firestore Collections

All collections scoped by `userId` with security rules enforcing user isolation:

- `goals`: Practice goals
- `sessions`: Completed practice sessions
- `repertoire`: Learned pieces with frequency
- `scaleSkills`: One doc per scale key with BPM values
- `earTraining`: Single doc per user with arrays of mastered intervals/chords
- `userPreferences`: Practice focus setting

Security rules in `firestore.rules` enforce: users can only read/write their own data.

## Firebase Configuration

Firebase config is currently hardcoded in `src/firebase.ts`. For development:
1. Create project at console.firebase.google.com
2. Enable Email/Password authentication
3. Create Firestore database
4. Deploy security rules from `firestore.rules`

## Environment Variables

Create `.env.local`:

```
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
```

## Component Organization

- **Pages/Views**: Dashboard, GoalSetup, SessionGenerator, PracticeTimer, ProgressLogger, Profile
- **Goal Forms**: Separate form components in `src/components/goals/` for each goal type
- **Shared Components**: Navigation, Auth, ExerciseSelector

## Notable Implementation Details

- **Session State Persistence**: Sessions only exist in memory during practice flow (not persisted until completion in ProgressLogger)
- **Drag & Drop**: SessionGenerator uses Atlaskit's pragmatic-drag-and-drop for reordering activities
- **Practice Timer**: Countdown timer with auto-advance between activities, browser notifications support
- **AI Prompt Engineering**: Session generation prompt in `claudeApi.ts` includes user skill summary generated by `src/utils/userSkillSummary.ts`
