// All 24 major and minor scales
export const SCALES = [
  // Major scales
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major',
  'B Major',
  'F♯ Major',
  'C♯ Major',
  'F Major',
  'B♭ Major',
  'E♭ Major',
  'A♭ Major',
  // Minor scales
  'A Minor',
  'E Minor',
  'B Minor',
  'F♯ Minor',
  'C♯ Minor',
  'G♯ Minor',
  'D♯ Minor',
  'A♯ Minor',
  'D Minor',
  'G Minor',
  'C Minor',
  'F Minor'
];

// Interval ear training
export const INTERVALS = [
  'Minor 2nd',
  'Major 2nd',
  'Minor 3rd',
  'Major 3rd',
  'Perfect 4th',
  'Tritone',
  'Perfect 5th',
  'Minor 6th',
  'Major 6th',
  'Minor 7th',
  'Major 7th',
  'Octave'
];

// Chord ear training
export const CHORDS = [
  'Major Triad',
  'Minor Triad',
  'Diminished Triad',
  'Augmented Triad',
  'Major 7th',
  'Minor 7th',
  'Dominant 7th',
  'Minor 7th ♭5 (Half-Diminished)',
  'Diminished 7th',
  'Major 6th',
  'Minor 6th',
  'Suspended 2nd',
  'Suspended 4th'
];

export const SCALE_SKILL_FIELDS = [
  { key: 'scales', label: 'Scales' },
  { key: 'chords', label: 'Chords' },
  { key: 'arpeggios', label: 'Arpeggios' }
] as const;
