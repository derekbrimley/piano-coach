# Piano Practice Coach

A smart practice session planner that helps pianists structure their practice time based on goals and current progress.

## Features

- **User Authentication**: Secure sign-up/sign-in with email and password
- **Goal Setup**: Define what you're working on (new pieces, technique, listening skills)
- **Profile Management**:
  - Add learned pieces with review frequency (daily, weekly, monthly)
  - Track scale BPM progress for all 24 major/minor scales across 6 techniques
  - Mark mastered intervals and chords for ear training
- **Session Generation**: Get personalized practice sessions with 5-7 activities
- **Session Customization**: Adjust timing, reorder, or modify activities
- **Practice Timer**: Countdown timer with auto-advance and notifications
- **Progress Tracking**: Log achievements and notes after each session
- **Personal Data**: All goals, profile data, and sessions are private to your account

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Enable Firebase Authentication:**
   - Go to Authentication → Get Started
   - Enable "Email/Password" sign-in method

3. **Enable Firestore Database:**
   - Go to Firestore Database → Create Database
   - Start in production mode

4. **Set up Firestore Security Rules:**
   - Go to Firestore Database → Rules
   - Copy the contents of `firestore.rules` and paste them
   - Click "Publish"

5. **Get your Firebase configuration:**
   - Go to Project Settings → General
   - Scroll down to "Your apps" and copy the config
   - Your config is already in `src/firebase.js` if you're using the provided credentials

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with your email
2. **Set Your Goals**: Click "Goals" to add what you're working on
3. **Manage Profile**: Click "Profile" to:
   - Add learned pieces and set review frequency
   - Track your scale BPM progress
   - Mark mastered intervals and chords
4. **Start a Session**: Click "Practice" to generate a plan
5. **Customize**: Adjust timing, add/replace exercises, or reorder activities as needed
6. **Practice**: Use the timer to guide your practice
7. **Log Progress**: Record what you achieved after each session

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore

## Data Structure

### Goals Collection
- `userId`: User's unique ID (for security)
- `type`: newPiece | technique | listening | repertoire
- Type-specific fields (name, sections, focus, skills, pieces, etc.)
- `createdAt`, `updatedAt`, `lastPracticed`

### Sessions Collection
- `userId`: User's unique ID (for security)
- `activities[]`: Array of activity objects with progress
- `notes`: Session notes
- `totalDuration`: Total session time
- `date`: Session date/time
- `completedAt`: When session was completed

### Repertoire Collection
- `userId`: User's unique ID (for security)
- `name`: Name of the piece
- `frequency`: Review frequency (daily | weekly | monthly)
- `addedAt`: When piece was added
- `lastReviewed`: Last review date (optional)

### Scale Skills Collection
- `userId`: User's unique ID (for security)
- `key`: Scale key (e.g., "C Major", "A Minor")
- BPM fields: `parallelMotion`, `parallelMotionThirds`, `parallelMotionSixths`, `cadences`, `arpeggios`, `dominantSeventhArpeggios`
- `updatedAt`: Last update timestamp

### Ear Training Collection
- `userId`: User's unique ID (for security)
- `intervals[]`: Array of mastered interval names
- `chords[]`: Array of mastered chord names
- `updatedAt`: Last update timestamp

## License

MIT
