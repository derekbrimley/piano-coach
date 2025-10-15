// Repertoire pieces (separate from goals)
export interface RepertoirePiece {
  id: string;
  userId: string;
  name: string;
  addedAt: string;
  lastReviewed?: string;
  practiceHistory?: { date: string }[];
}

// Activity types
export type ActivityType = 'warmup' | 'technique' | 'repertoire' | 'exercise' | 'goal';

export interface Activity {
  id: string;
  type: ActivityType;
  exerciseId?: string;
  pieceId?: string; // For repertoire pieces
  practiceGoalId?: string; // For practice goal activities
  title: string;
  description: string;
  duration: number;
  suggestions?: string[];

  // Enhanced tracking fields
  completionType?: CompletionType; // 'completed' | 'progressed' | 'reviewed' | 'practiced'
  quality?: number; // 1-5 stars
  notes?: string; // Session-specific notes
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

export interface UserPreferences {
  id?: string;
  userId: string;
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
  | 'earTrainingGoal'
  | 'technique'
  | 'other';

export type PracticeGoalStatus = 'active' | 'completed' | 'abandoned';

export type CompletionType = 'completed' | 'progressed' | 'reviewed' | 'practiced';

// Session quality rating
export interface SessionActivityRating {
  quality: number; // 1-5 stars
  notes?: string;
}

// Performance/Recital Goal
export type PerformanceReadiness = 'shaky' | 'solid' | 'performanceReady';

export interface PerformancePiece {
  name: string;
  readiness: PerformanceReadiness;
}

export interface PerformanceGoalData {
  eventDate: string; // ISO date
  pieces: PerformancePiece[];
  fullRunThroughs: number;
  memoryConfidence: number; // 1-5 scale
  pressurePracticeSessions: number;
}

// Specific Piece Goal
export type LearningStage = 'handsSeparately' | 'handsTogether' | 'memory' | 'polish';

export interface ProblemSpot {
  id: string;
  description: string;
  status: 'identified' | 'working' | 'resolved';
}

export interface PieceSection {
  id: string;
  name: string;
  learned: boolean;
}

export interface SpecificPieceGoalData {
  pieceName: string;
  composer?: string;
  targetCompletionDate?: string; // ISO date
  sections: PieceSection[];
  currentBPM: number;
  targetBPM: number;
  learningStages: Record<LearningStage, boolean>;
  problemSpots: ProblemSpot[];
  daysWorked: number;
}

// Exam/Audition Goal
export interface ExamRequirement {
  id: string;
  description: string;
  completed: boolean;
  confidenceRating: number; // 1-5
}

export interface MockExamAttempt {
  date: string; // ISO date
  notes?: string;
}

export interface ExamGoalData {
  examDate: string; // ISO date
  examLevel: string; // e.g., "ABRSM Grade 5", "College audition"
  requiredPieces: string[];
  technicalRequirements: ExamRequirement[];
  mockExamAttempts: MockExamAttempt[];
}

// Sight-Reading Goal
export type SightReadingLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';
export type FrequencyTarget = 'daily' | 'threeTimes' | 'weekly';

export interface SightReadingSession {
  date: string; // ISO date
  accuracyRating: number; // 1-5
}

export interface SightReadingGoalData {
  targetLevel: SightReadingLevel;
  frequencyTarget: FrequencyTarget;
  currentLevel: SightReadingLevel;
  piecesRead: number;
  sessions: SightReadingSession[];
  consecutiveDays: number;
}

// Improvisation Goal
export type ImprovisationStyle = 'jazz' | 'blues' | 'gospel' | 'classical' | 'other';

export interface KeyProgression {
  id: string;
  description: string;
  mastered: boolean;
}

export interface ImprovisationGoalData {
  style: ImprovisationStyle;
  specificFocus: string;
  keysProgressions: KeyProgression[];
  patternsLearned: number;
  recordingSessions: number;
  backingTrackPlayAlongs: number;
}

// Ear Training Goal
export type EarTrainingSkillFocus = 'intervals' | 'chordQuality' | 'progressions' | 'melodies';

export interface EarTrainingSession {
  date: string; // ISO date
  exercisesCompleted: number;
  accuracyPercentage: number;
}

export interface EarTrainingGoalData {
  skillFocus: EarTrainingSkillFocus[];
  targetDescription: string;
  currentLevel: string;
  sessions: EarTrainingSession[];
  consecutiveDays: number;
}

// Technique Goal (Master Technique)
export interface TechniqueExercise {
  id: string;
  description: string;
  completed: boolean;
}

export interface KeyPattern {
  id: string;
  description: string; // e.g., "C Major"
  mastered: boolean;
}

export interface TechniqueGoalData {
  specificTechnique: string; // e.g., "Scales in all major keys at 120 BPM"
  technicalExerciseMethod?: string; // e.g., "Hanon", "Czerny"
  keysPatterns: KeyPattern[];
  startingBPM: number;
  currentBPM: number;
  targetBPM: number;
  daysPracticed: number;
  exercises: TechniqueExercise[];
}

// Union type for all goal-specific data
export type GoalSpecificData =
  | PerformanceGoalData
  | SpecificPieceGoalData
  | ExamGoalData
  | SightReadingGoalData
  | ImprovisationGoalData
  | EarTrainingGoalData
  | TechniqueGoalData;

// Enhanced Practice Goal
export interface PracticeGoal {
  id?: string;
  userId: string;
  goalType: PracticeGoalType;
  title: string; // User-friendly title
  specificDetails?: string; // Optional free-form description
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: PracticeGoalStatus;
  createdAt: string;
  updatedAt: string;

  // Goal-specific tracking data
  goalData?: GoalSpecificData;
}
