import type { Activity, RepertoirePiece, Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

// Generate practice session activities based on repertoire and exercises
export const generateSessionFallback = (
  repertoire: RepertoirePiece[] = [],
  sessionLength: number = 60
): Activity[] => {
  const activities: Activity[] = [];

  // Add warm-up (5 minutes)
  activities.push({
    id: `activity-${Date.now()}-warmup`,
    type: 'warmup',
    title: 'Warm Up',
    description: 'Finger exercises and stretches',
    duration: 5,
    suggestions: [
      'Hanon exercises #1-5',
      'C major scale, 2 octaves, hands together',
      'Simple chord progressions (I-IV-V-I)'
    ],
  });

  // Generate session from repertoire and generic exercises
  const generatedActivities = generateSessionWithoutGoals(repertoire);
  activities.push(...generatedActivities);

  // Adjust durations to fit session length
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const scaleFactor = (sessionLength - 5) / (totalDuration - 5); // Keep warmup at 5 min

  activities.forEach((activity, index) => {
    if (index > 0) { // Don't scale warmup
      activity.duration = Math.round(activity.duration * scaleFactor);
    }
  });

  return activities;
};

// Generate session when user has no goals set up
const generateSessionWithoutGoals = (repertoire: RepertoirePiece[]): Activity[] => {
  const activities: Activity[] = [];

  // Add repertoire pieces if available
  const piecesToPractice = repertoire.slice(0, 2);
  piecesToPractice.forEach((piece, index) => {
    activities.push({
      id: `activity-${Date.now()}-repertoire-${index}`,
      type: 'repertoire',
      pieceId: piece.id,
      title: piece.name,
      description: `Review ${piece.name}`,
      duration: 15,
      suggestions: [
        'Play through once at performance tempo',
        'Focus on previously difficult sections',
        'Practice with expression and dynamics',
        'Record yourself and listen back',
        'Practice performing (imagine an audience)'
      ],
    });
  });

  // Add generic exercises from the library
  const selectedExercises = selectGenericExercises(4 - piecesToPractice.length);
  selectedExercises.forEach((exercise, index) => {
    activities.push(createActivityFromExerciseFallback(exercise, index));
  });

  return activities;
};

// Select a variety of exercises from different categories
const selectGenericExercises = (count: number): Exercise[] => {
  const categories = [
    'Scales',
    'Arpeggios',
    'Finger Independence & Strength',
    'Sight Reading'
  ];

  const selected: Exercise[] = [];

  categories.slice(0, count).forEach(category => {
    const exercisesInCategory = EXERCISE_LIBRARY.filter(ex => ex.category === category);
    if (exercisesInCategory.length > 0) {
      // Pick a random exercise from this category
      const randomIndex = Math.floor(Math.random() * exercisesInCategory.length);
      selected.push(exercisesInCategory[randomIndex]);
    }
  });

  return selected;
};

// Convert an Exercise to an Activity
export const createActivityFromExerciseFallback = (exercise: Exercise, index: number = 0): Activity => {
  return {
    id: `activity-${Date.now()}-exercise-${index}`,
    type: 'exercise',
    exerciseId: exercise.id,
    title: exercise.name,
    description: exercise.description,
    duration: exercise.defaultDuration,
    suggestions: [],
  };
};

