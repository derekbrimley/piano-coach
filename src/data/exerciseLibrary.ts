import type { Exercise, ExerciseCategory } from '../types';

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'Finger Independence & Strength',
  'Scales',
  'Arpeggios',
  'Chord Work',
  'Rhythm & Coordination',
  'Hand Position & Technique',
  'Speed Development',
  'Sight Reading',
  'Ear Training',
  'Advanced Techniques',
  'Warm-up Exercises',
  'Expression & Musicality',
  'Contemporary Techniques',
  'Memory & Mental Practice'
];

export const EXERCISE_LIBRARY: Exercise[] = [
  // Finger Independence & Strength
  {
    id: 'hanon-1',
    name: 'Hanon Exercises',
    category: 'Finger Independence & Strength',
    description: 'Classic finger exercises for building strength and independence',
    defaultDuration: 10
  },
  {
    id: 'czerny-1',
    name: 'Czerny Studies',
    category: 'Finger Independence & Strength',
    description: 'Technical studies for developing finger dexterity',
    defaultDuration: 10
  },
  {
    id: 'trill-practice',
    name: 'Trill Practice',
    category: 'Finger Independence & Strength',
    description: 'Practice trills between different finger combinations',
    defaultDuration: 5
  },
  {
    id: 'finger-crossing',
    name: 'Finger Crossing Exercises',
    category: 'Finger Independence & Strength',
    description: 'Exercises for smooth finger crossings and thumb-under technique',
    defaultDuration: 5
  },

  // Scales
  {
    id: 'major-scales',
    name: 'Major Scales',
    category: 'Scales',
    description: 'Practice all major scales in various patterns',
    defaultDuration: 10
  },
  {
    id: 'minor-scales',
    name: 'Minor Scales (Natural, Harmonic, Melodic)',
    category: 'Scales',
    description: 'Practice all three forms of minor scales',
    defaultDuration: 10
  },
  {
    id: 'chromatic-scales',
    name: 'Chromatic Scales',
    category: 'Scales',
    description: 'Practice chromatic scales for finger coordination',
    defaultDuration: 5
  },
  {
    id: 'scale-thirds',
    name: 'Scales in Thirds, Sixths, Octaves',
    category: 'Scales',
    description: 'Practice scales in intervals for advanced technique',
    defaultDuration: 10
  },
  {
    id: 'modes',
    name: 'Modal Scales',
    category: 'Scales',
    description: 'Practice Dorian, Phrygian, Lydian, and other modes',
    defaultDuration: 10
  },

  // Arpeggios
  {
    id: 'major-arpeggios',
    name: 'Major Arpeggios',
    category: 'Arpeggios',
    description: 'Practice major arpeggios in all keys',
    defaultDuration: 8
  },
  {
    id: 'minor-arpeggios',
    name: 'Minor Arpeggios',
    category: 'Arpeggios',
    description: 'Practice minor arpeggios in all keys',
    defaultDuration: 8
  },
  {
    id: 'diminished-arpeggios',
    name: 'Diminished Arpeggios',
    category: 'Arpeggios',
    description: 'Practice diminished seventh arpeggios',
    defaultDuration: 5
  },
  {
    id: 'dominant-arpeggios',
    name: 'Dominant 7th Arpeggios',
    category: 'Arpeggios',
    description: 'Practice dominant seventh arpeggios',
    defaultDuration: 8
  },
  {
    id: 'broken-chords',
    name: 'Broken Chord Patterns',
    category: 'Arpeggios',
    description: 'Practice various broken chord patterns',
    defaultDuration: 8
  },

  // Chord Work
  {
    id: 'chord-progressions',
    name: 'Chord Progressions',
    category: 'Chord Work',
    description: 'Practice common chord progressions (I-IV-V-I, ii-V-I)',
    defaultDuration: 10
  },
  {
    id: 'inversions',
    name: 'Chord Inversions',
    category: 'Chord Work',
    description: 'Practice triads and seventh chords in all inversions',
    defaultDuration: 8
  },
  {
    id: 'voicings',
    name: 'Voicing Practice',
    category: 'Chord Work',
    description: 'Practice different chord voicings and voicing techniques',
    defaultDuration: 8
  },
  {
    id: 'cadences',
    name: 'Cadence Practice',
    category: 'Chord Work',
    description: 'Practice authentic, plagal, and deceptive cadences',
    defaultDuration: 5
  },

  // Rhythm & Coordination
  {
    id: 'polyrhythms',
    name: 'Polyrhythms',
    category: 'Rhythm & Coordination',
    description: 'Practice 3 against 2, 4 against 3, and other polyrhythms',
    defaultDuration: 10
  },
  {
    id: 'hand-independence',
    name: 'Hand Independence Exercises',
    category: 'Rhythm & Coordination',
    description: 'Practice different rhythms in each hand simultaneously',
    defaultDuration: 10
  },
  {
    id: 'syncopation',
    name: 'Syncopation Practice',
    category: 'Rhythm & Coordination',
    description: 'Practice syncopated rhythms and off-beat accents',
    defaultDuration: 8
  },
  {
    id: 'metronome',
    name: 'Metronome Work',
    category: 'Rhythm & Coordination',
    description: 'Practice with metronome at various tempos and subdivisions',
    defaultDuration: 10
  },

  // Hand Position & Technique
  {
    id: 'wrist-rotation',
    name: 'Wrist Rotation Exercises',
    category: 'Hand Position & Technique',
    description: 'Practice proper wrist rotation for fluid playing',
    defaultDuration: 5
  },
  {
    id: 'arm-weight',
    name: 'Arm Weight Transfer',
    category: 'Hand Position & Technique',
    description: 'Practice transferring arm weight for better tone',
    defaultDuration: 5
  },
  {
    id: 'finger-legato',
    name: 'Finger Legato',
    category: 'Hand Position & Technique',
    description: 'Practice smooth legato technique with finger connection',
    defaultDuration: 8
  },
  {
    id: 'staccato',
    name: 'Staccato Technique',
    category: 'Hand Position & Technique',
    description: 'Practice various staccato touches and articulations',
    defaultDuration: 5
  },
  {
    id: 'thumb-positioning',
    name: 'Thumb Positioning',
    category: 'Hand Position & Technique',
    description: 'Practice proper thumb placement and movement',
    defaultDuration: 5
  },

  // Speed Development
  {
    id: 'graduated-tempo',
    name: 'Graduated Tempo Practice',
    category: 'Speed Development',
    description: 'Gradually increase tempo from slow to fast',
    defaultDuration: 10
  },
  {
    id: 'burst-practice',
    name: 'Burst Practice',
    category: 'Speed Development',
    description: 'Practice short bursts at target tempo',
    defaultDuration: 8
  },
  {
    id: 'accent-patterns',
    name: 'Accent Patterns',
    category: 'Speed Development',
    description: 'Practice with varying accent patterns for evenness',
    defaultDuration: 8
  },
  {
    id: 'rhythmic-variations',
    name: 'Rhythmic Variations',
    category: 'Speed Development',
    description: 'Practice passages in dotted rhythms and other variations',
    defaultDuration: 10
  },

  // Sight Reading
  {
    id: 'sight-reading-easy',
    name: 'Easy Sight Reading',
    category: 'Sight Reading',
    description: 'Practice sight reading simpler pieces',
    defaultDuration: 10
  },
  {
    id: 'sight-reading-intervals',
    name: 'Interval Recognition',
    category: 'Sight Reading',
    description: 'Practice reading and playing intervals quickly',
    defaultDuration: 5
  },
  {
    id: 'sight-reading-patterns',
    name: 'Pattern Recognition',
    category: 'Sight Reading',
    description: 'Practice identifying and playing common patterns',
    defaultDuration: 8
  },
  {
    id: 'sight-reading-clefs',
    name: 'Clef Reading',
    category: 'Sight Reading',
    description: 'Practice reading bass, treble, and other clefs',
    defaultDuration: 5
  },

  // Ear Training
  {
    id: 'interval-training',
    name: 'Interval Ear Training',
    category: 'Ear Training',
    description: 'Practice identifying intervals by ear',
    defaultDuration: 10
  },
  {
    id: 'chord-recognition',
    name: 'Chord Recognition',
    category: 'Ear Training',
    description: 'Practice identifying chords and progressions by ear',
    defaultDuration: 10
  },
  {
    id: 'melodic-dictation',
    name: 'Melodic Dictation',
    category: 'Ear Training',
    description: 'Practice transcribing melodies by ear',
    defaultDuration: 10
  },
  {
    id: 'playing-by-ear',
    name: 'Playing by Ear',
    category: 'Ear Training',
    description: 'Practice playing familiar tunes without sheet music',
    defaultDuration: 10
  },

  // Advanced Techniques
  {
    id: 'octave-technique',
    name: 'Octave Technique',
    category: 'Advanced Techniques',
    description: 'Practice octave passages with proper technique',
    defaultDuration: 10
  },
  {
    id: 'double-notes',
    name: 'Double Notes',
    category: 'Advanced Techniques',
    description: 'Practice thirds, sixths, and other double notes',
    defaultDuration: 10
  },
  {
    id: 'leaps',
    name: 'Large Leaps',
    category: 'Advanced Techniques',
    description: 'Practice accuracy in large interval leaps',
    defaultDuration: 8
  },
  {
    id: 'ornamentation',
    name: 'Ornamentation',
    category: 'Advanced Techniques',
    description: 'Practice trills, mordents, turns, and other ornaments',
    defaultDuration: 8
  },
  {
    id: 'tremolo',
    name: 'Tremolo',
    category: 'Advanced Techniques',
    description: 'Practice tremolo technique for sustained sound',
    defaultDuration: 5
  },

  // Warm-up Exercises
  {
    id: 'five-finger',
    name: 'Five-Finger Patterns',
    category: 'Warm-up Exercises',
    description: 'Warm up with basic five-finger patterns',
    defaultDuration: 5
  },
  {
    id: 'stretches',
    name: 'Hand and Finger Stretches',
    category: 'Warm-up Exercises',
    description: 'Gentle stretches to prepare hands for playing',
    defaultDuration: 3
  },
  {
    id: 'block-chords',
    name: 'Block Chord Warm-up',
    category: 'Warm-up Exercises',
    description: 'Play block chords to warm up fingers and arms',
    defaultDuration: 5
  },
  {
    id: 'slow-scales',
    name: 'Slow Scale Warm-up',
    category: 'Warm-up Exercises',
    description: 'Play scales slowly to warm up and focus on tone',
    defaultDuration: 5
  },

  // Expression & Musicality
  {
    id: 'dynamics',
    name: 'Dynamic Control',
    category: 'Expression & Musicality',
    description: 'Practice crescendo, diminuendo, and dynamic contrasts',
    defaultDuration: 10
  },
  {
    id: 'phrasing',
    name: 'Phrasing Practice',
    category: 'Expression & Musicality',
    description: 'Practice musical phrasing and breathing',
    defaultDuration: 10
  },
  {
    id: 'tone-production',
    name: 'Tone Production',
    category: 'Expression & Musicality',
    description: 'Focus on beautiful tone quality and color',
    defaultDuration: 10
  },
  {
    id: 'rubato',
    name: 'Rubato Practice',
    category: 'Expression & Musicality',
    description: 'Practice expressive tempo flexibility',
    defaultDuration: 8
  },

  // Contemporary Techniques
  {
    id: 'cluster-chords',
    name: 'Cluster Chords',
    category: 'Contemporary Techniques',
    description: 'Practice playing tone clusters',
    defaultDuration: 5
  },
  {
    id: 'prepared-piano',
    name: 'Prepared Piano Techniques',
    category: 'Contemporary Techniques',
    description: 'Explore extended piano techniques',
    defaultDuration: 8
  },
  {
    id: 'string-damping',
    name: 'String Damping',
    category: 'Contemporary Techniques',
    description: 'Practice muting strings inside the piano',
    defaultDuration: 5
  },
  {
    id: 'glissando',
    name: 'Glissando',
    category: 'Contemporary Techniques',
    description: 'Practice white key and black key glissandos',
    defaultDuration: 5
  },

  // Memory & Mental Practice
  {
    id: 'memorization',
    name: 'Memorization Techniques',
    category: 'Memory & Mental Practice',
    description: 'Practice systematic memorization strategies',
    defaultDuration: 10
  },
  {
    id: 'away-from-piano',
    name: 'Away-from-Piano Practice',
    category: 'Memory & Mental Practice',
    description: 'Mental practice without the instrument',
    defaultDuration: 10
  },
  {
    id: 'score-analysis',
    name: 'Score Analysis',
    category: 'Memory & Mental Practice',
    description: 'Analyze structure, harmony, and form of pieces',
    defaultDuration: 10
  },
  {
    id: 'hands-separate',
    name: 'Hands Separate Practice',
    category: 'Memory & Mental Practice',
    description: 'Practice each hand separately for better understanding',
    defaultDuration: 10
  }
];
