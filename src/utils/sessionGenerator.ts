import type { Goal, NewPieceGoal, TechniqueGoal, ListeningGoal, RepertoireGoal, Activity, RepertoirePiece, Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

// Generate practice session activities based on user goals and repertoire
export const generateSession = (
  goals: Goal[],
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

  // If no goals, generate session from repertoire and generic exercises
  if (goals.length === 0) {
    const generatedActivities = generateSessionWithoutGoals(repertoire);
    activities.push(...generatedActivities);
  } else {
    // Process each goal and add activities
    goals.forEach((goal) => {
      const goalActivities = generateActivitiesForGoal(goal);
      activities.push(...goalActivities);
    });
  }

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
    activities.push(createActivityFromExercise(exercise, index));
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
export const createActivityFromExercise = (exercise: Exercise, index: number = 0): Activity => {
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

const generateActivitiesForGoal = (goal: Goal): Activity[] => {
  const activities: Activity[] = [];

  switch (goal.type) {
    case 'newPiece':
      activities.push(...generateNewPieceActivities(goal));
      break;
    case 'technique':
      activities.push(...generateTechniqueActivities(goal));
      break;
    case 'listening':
      activities.push(...generateListeningActivities(goal));
      break;
    case 'repertoire':
      activities.push(...generateRepertoireActivities(goal));
      break;
  }

  return activities;
};

const generateNewPieceActivities = (goal: NewPieceGoal): Activity[] => {
  const activities: Activity[] = [];
  const baseDuration = 15;

  // Generate section-based activities
  const sectionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const numSections = Math.min(goal.sections || 1, 3); // Limit to 3 sections per session

  for (let i = 0; i < numSections; i++) {
    const section = sectionLabels[i];
    activities.push({
      id: `activity-${Date.now()}-${goal.id}-section-${i}`,
      type: 'newPiece',
      goalId: goal.id,
      title: `${goal.name} - Section ${section}`,
      description: `Work on Section ${section}`,
      duration: baseDuration,
      suggestions: [
        `Practice left hand alone in Section ${section}`,
        `Practice right hand alone in Section ${section}`,
        `Hands together slowly in Section ${section}`,
        `Focus on difficult measures in Section ${section}`,
        `Work on tempo transitions in Section ${section}`,
        `Practice with metronome, gradually increasing speed`
      ],
    });
  }

  return activities;
};

const generateTechniqueActivities = (goal: TechniqueGoal): Activity[] => {
  const activities: Activity[] = [];
  const focusAreas = goal.focus || [];

  focusAreas.slice(0, 2).forEach((focus, index) => {
    const suggestions = getTechniqueSuggestions(focus);
    activities.push({
      id: `activity-${Date.now()}-${goal.id}-${index}`,
      type: 'technique',
      goalId: goal.id,
      title: focus,
      description: `Practice ${focus.toLowerCase()}`,
      duration: 10,
      suggestions,
    });
  });

  return activities;
};

const getTechniqueSuggestions = (focus: string): string[] => {
  const suggestionMap: Record<string, string[]> = {
    'Scales': [
      'C major scale, all octaves',
      'A minor scale (natural, harmonic, melodic)',
      'Major scales with 1-2 sharps/flats',
      'Scale in contrary motion'
    ],
    'Arpeggios': [
      'Major arpeggios (C, G, F)',
      'Minor arpeggios (A, D, E)',
      'Dominant 7th arpeggios',
      'Broken chords in various inversions'
    ],
    'Sight Reading': [
      'Read new piece at easy level',
      'Practice 5 new short pieces',
      'Sight read hymns or simple songs',
      'Read one hand at a time first'
    ],
    'Hand Independence': [
      'Contrary motion exercises',
      'Different rhythms each hand',
      'Hanon exercises focusing on evenness',
      'Play melody with one hand, chords with other'
    ],
    'Fingering': [
      'Practice problematic passages with marked fingering',
      'Exercises for finger strength (Hanon)',
      'Practice thumb-under technique',
      'Slow practice with perfect fingering'
    ],
    'Dynamics': [
      'Practice crescendo/diminuendo',
      'Contrast forte and piano sections',
      'Control soft playing (pp)',
      'Practice sudden dynamic changes'
    ],
    'Rhythm': [
      'Practice with metronome',
      'Clap complex rhythms',
      'Practice dotted rhythms',
      'Work on syncopation'
    ]
  };

  return suggestionMap[focus] || [
    `Practice ${focus} fundamentals`,
    `Work on ${focus} technique`,
    `Focus on improving ${focus}`
  ];
};

const generateListeningActivities = (goal: ListeningGoal): Activity[] => {
  const activities: Activity[] = [];
  const skills = goal.skills || [];

  skills.slice(0, 2).forEach((skill, index) => {
    activities.push({
      id: `activity-${Date.now()}-${goal.id}-${index}`,
      type: 'listening',
      goalId: goal.id,
      title: skill,
      description: `Practice ${skill.toLowerCase()}`,
      duration: 8,
      suggestions: [
        `Use musictheory.net trainer`,
        `Practice with teoria.com exercises`,
        `Play intervals/chords on piano and identify`,
        `Use ear training app for 5-10 minutes`
      ],
    });
  });

  return activities;
};

const generateRepertoireActivities = (goal: RepertoireGoal): Activity[] => {
  const activities: Activity[] = [];
  const pieces = goal.pieces || [];

  // Rotate through repertoire pieces
  const piecesToPractice = pieces.slice(0, 2);

  piecesToPractice.forEach((piece, index) => {
    activities.push({
      id: `activity-${Date.now()}-${goal.id}-${index}`,
      type: 'repertoire',
      goalId: goal.id,
      title: piece,
      description: `Maintain ${piece}`,
      duration: 10,
      suggestions: [
        'Play through once at performance tempo',
        'Focus on previously difficult sections',
        'Practice with expression and dynamics',
        'Record yourself and listen back',
        'Practice performing (imagine an audience)'
      ],
    });
  });

  return activities;
};
