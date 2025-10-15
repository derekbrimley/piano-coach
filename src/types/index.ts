// Goal types
export type GoalType = 'newPiece' | 'technique' | 'listening' | 'repertoire';

export interface BaseGoal {
  id: string;
  type: GoalType;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  lastPracticed?: string;
  sessionsCompleted?: number;
}

export interface LeadSheetProgress {
  foundRecordings: boolean;
  learnedChordProgression: boolean;
  learnedMelody: boolean;
  handsTogetherSlowly: boolean;
  handsTogetherAtSpeed: boolean;
  appliedJazzLanguage: boolean;
}

export interface NewPieceGoal extends BaseGoal {
  type: 'newPiece';
  name: string;
  pieceType: 'traditional' | 'leadSheet';
  sections?: number; // For traditional pieces
  leadSheetProgress?: LeadSheetProgress; // For lead sheet pieces
  currentProgress?: string;
  challenges?: string;
}

export interface TechniqueGoal extends BaseGoal {
  type: 'technique';
  focus: string[];
  details?: string;
}

export interface ListeningGoal extends BaseGoal {
  type: 'listening';
  skills: string[];
  details?: string;
}

export interface RepertoirePieceData {
  name: string;
  addedAt?: string;
  lastReviewed?: string;
  practiceHistory?: { date: string }[];
}

export interface RepertoireGoal extends BaseGoal {
  type: 'repertoire';
  pieces: string[]; // Kept for backward compatibility
}

// New separate model for repertoire pieces
export interface RepertoirePiece {
  id: string;
  userId: string;
  name: string;
  addedAt: string;
  lastReviewed?: string;
  practiceHistory?: { date: string }[];
}

export type Goal = NewPieceGoal | TechniqueGoal | ListeningGoal | RepertoireGoal;

// Activity types
export type ActivityType = 'warmup' | 'newPiece' | 'technique' | 'listening' | 'repertoire' | 'exercise';

export interface Activity {
  id: string;
  type: ActivityType;
  goalId?: string;
  exerciseId?: string;
  pieceId?: string; // For repertoire pieces
  title: string;
  description: string;
  duration: number;
  suggestions?: string[];
  achieved?: boolean;
}

// Exercise types
export type ExerciseCategory =
  | 'Finger Independence & Strength'
  | 'Scales'
  | 'Arpeggios'
  | 'Chord Work'
  | 'Rhythm & Coordination'
  | 'Hand Position & Technique'
  | 'Speed Development'
  | 'Sight Reading'
  | 'Ear Training'
  | 'Advanced Techniques'
  | 'Warm-up Exercises'
  | 'Expression & Musicality'
  | 'Contemporary Techniques'
  | 'Memory & Mental Practice';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  defaultDuration: number;
}

// Session types
export interface Session {
  id?: string;
  userId?: string;
  activities: Activity[];
  totalDuration: number;
  date: string;
  createdAt?: string;
  completedAt?: string;
  notes?: string;
}

// Form data types (before being saved to Firebase)
export interface NewPieceFormData {
  type: 'newPiece';
  name: string;
  pieceType: 'traditional' | 'leadSheet';
  sections?: number;
  leadSheetProgress?: LeadSheetProgress;
  currentProgress?: string;
  challenges?: string;
}

export interface TechniqueFormData {
  type: 'technique';
  focus: string[];
  details?: string;
}

export interface ListeningFormData {
  type: 'listening';
  skills: string[];
  details?: string;
}

export interface RepertoireFormData {
  type: 'repertoire';
  pieces: string[];
}

export type GoalFormData = NewPieceFormData | TechniqueFormData | ListeningFormData | RepertoireFormData;

// Profile/Skill tracking types
export interface ScaleSkill {
  id: string;
  userId: string;
  key: string; // e.g., "C Major", "A Minor"
  scales: number;
  chords: number;
  arpeggios: number;
  updatedAt: string;
}

export interface ScaleSkillData {
  key: string;
  scales: number;
  chords: number;
  arpeggios: number;
}

export interface EarTrainingSkills {
  id?: string;
  userId: string;
  intervals: string[]; // Array of mastered intervals
  chords: string[]; // Array of mastered chords
  updatedAt: string;
}

// Practice Focus preference (DEPRECATED - use PracticeGoal instead)
export type PracticeFocus = 'newPieces' | 'technique' | 'earTraining' | 'expressivity';

export interface UserPreferences {
  id?: string;
  userId: string;
  practiceFocus: PracticeFocus;
  defaultSessionLength?: number; // Default: 60 minutes
  updatedAt: string;
}

// Practice Goal types (overall practice objective)
export type PracticeGoalType =
  | 'performance'
  | 'specificPiece'
  | 'exam'
  | 'sightReading'
  | 'improvisation'
  | 'general'
  | 'other';

export type PracticeGoalStatus = 'active' | 'completed' | 'abandoned';

export interface PracticeGoal {
  id?: string;
  userId: string;
  goalType: PracticeGoalType;
  specificDetails?: string; // Optional free-form description
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: PracticeGoalStatus;
  createdAt: string;
  updatedAt: string;
}
