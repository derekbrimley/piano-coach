import type {
  RepertoirePiece,
  ScaleSkill,
  EarTrainingSkills,
  PracticeGoal,
  PracticeGoalType
} from '../types';
import { SCALES, INTERVALS, CHORDS } from '../data/skillsData';

const GOAL_TYPE_LABELS: Record<PracticeGoalType, string> = {
  performance: 'Performance/Recital',
  specificPiece: 'Learning a Specific Piece',
  exam: 'Exam/Audition',
  sightReading: 'Improve Sight-Reading',
  improvisation: 'Build Improvisation Skills',
  earTrainingGoal: 'Ear Training',
  technique: 'Master Technique',
  other: 'Other'
};

interface UserSkillSummary {
  practiceGoal: PracticeGoal | null;
  repertoire: {
    name: string;
    lastReviewed?: string;
    daysSinceReview?: number;
  }[];
  scaleSkills: {
    overall: string;
    details: string[];
  };
  earTraining: {
    intervals: string;
    chords: string;
  };
}

export const generateUserSkillSummary = (
  repertoirePieces: RepertoirePiece[],
  scaleSkills: ScaleSkill[],
  earTraining: EarTrainingSkills | null,
  practiceGoal: PracticeGoal | null = null
): UserSkillSummary => {

  // Process repertoire with practice history
  const now = new Date();
  const repertoire = repertoirePieces.map(piece => {
    let daysSinceReview: number | undefined;
    if (piece.lastReviewed) {
      const lastReviewDate = new Date(piece.lastReviewed);
      daysSinceReview = Math.floor((now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return {
      name: piece.name,
      lastReviewed: piece.lastReviewed,
      daysSinceReview
    };
  }).sort((a, b) => {
    // Sort by days since review (descending) so least recently reviewed comes first
    if (a.daysSinceReview === undefined) return 1;
    if (b.daysSinceReview === undefined) return -1;
    return b.daysSinceReview - a.daysSinceReview;
  });

  // Analyze scale skills
  const scaleSkillsAnalysis = analyzeScaleSkills(scaleSkills);

  // Analyze ear training
  const earTrainingAnalysis = analyzeEarTraining(earTraining);

  return {
    practiceGoal,
    repertoire,
    scaleSkills: scaleSkillsAnalysis,
    earTraining: earTrainingAnalysis
  };
};

const analyzeScaleSkills = (scaleSkills: ScaleSkill[]): { overall: string; details: string[] } => {
  if (scaleSkills.length === 0) {
    return {
      overall: "No scale skills data recorded yet",
      details: []
    };
  }

  const details: string[] = [];
  const fieldNames = [
    { key: 'scales', label: 'scales' },
    { key: 'chords', label: 'chords' },
    { key: 'arpeggios', label: 'arpeggios' }
  ];

  // Analyze each technique type
  for (const field of fieldNames) {
    const values = scaleSkills
      .map(skill => (skill as any)[field.key] || 0)
      .filter(v => v > 0);

    if (values.length > 0) {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const max = Math.max(...values);
      const min = Math.min(...values.filter(v => v > 0));
      const mastered = values.filter(v => v >= 120).length;

      if (mastered > SCALES.length / 2) {
        details.push(`Has mastered ${field.label} for most keys (average ${avg} BPM)`);
      } else if (avg >= 100) {
        details.push(`Working on ${field.label} with good progress (average ${avg} BPM, range ${min}-${max})`);
      } else if (values.length >= SCALES.length / 2) {
        details.push(`Developing ${field.label} across multiple keys (average ${avg} BPM)`);
      } else if (values.length > 0) {
        details.push(`Beginning work on ${field.label} (${values.length} keys practiced, ${min}-${max} BPM)`);
      }
    }
  }

  // Overall assessment
  const totalEntries = scaleSkills.reduce((sum, skill) => {
    let count = 0;
    for (const field of fieldNames) {
      if ((skill as any)[field.key] > 0) count++;
    }
    return sum + count;
  }, 0);

  const maxPossible = SCALES.length * fieldNames.length;
  const coverage = (totalEntries / maxPossible) * 100;

  let overall = "";
  if (coverage < 10) {
    overall = "Just beginning scale work";
  } else if (coverage < 30) {
    overall = "Early stage of technical development";
  } else if (coverage < 60) {
    overall = "Intermediate technical skills";
  } else {
    overall = "Advanced technical foundation";
  }

  return { overall, details };
};

const analyzeEarTraining = (earTraining: EarTrainingSkills | null): { intervals: string; chords: string } => {
  if (!earTraining) {
    return {
      intervals: "No interval recognition data yet",
      chords: "No chord recognition data yet"
    };
  }

  const intervalCount = earTraining.intervals?.length || 0;
  const chordCount = earTraining.chords?.length || 0;

  let intervals = "";
  if (intervalCount === 0) {
    intervals = "Just starting interval recognition";
  } else if (intervalCount < 4) {
    intervals = `Can identify basic intervals (${intervalCount}/${INTERVALS.length})`;
  } else if (intervalCount < 8) {
    intervals = `Developing interval recognition (${intervalCount}/${INTERVALS.length} mastered)`;
  } else if (intervalCount < INTERVALS.length) {
    intervals = `Strong interval recognition (${intervalCount}/${INTERVALS.length}), working on advanced intervals like ${INTERVALS.filter(i => !earTraining.intervals.includes(i)).slice(0, 2).join(' and ')}`;
  } else {
    intervals = `Mastered all ${INTERVALS.length} intervals`;
  }

  let chords = "";
  if (chordCount === 0) {
    chords = "Just starting chord recognition";
  } else if (chordCount < 4) {
    chords = `Can identify basic chords (${chordCount}/${CHORDS.length})`;
  } else if (chordCount < 8) {
    chords = `Developing chord recognition (${chordCount}/${CHORDS.length} mastered)`;
  } else if (chordCount < CHORDS.length) {
    chords = `Strong chord recognition (${chordCount}/${CHORDS.length}), working on advanced chords`;
  } else {
    chords = `Mastered all ${CHORDS.length} chord types`;
  }

  return { intervals, chords };
};

export const formatSkillSummaryForLLM = (summary: UserSkillSummary): string => {
  let prompt = '';

  // Practice Goal Section
  if (summary.practiceGoal) {
    const goal = summary.practiceGoal;
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const now = new Date();
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeksRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));

    prompt += `Current Practice Goal:\n`;
    prompt += `  Title: ${goal.title}\n`;
    prompt += `  Type: ${GOAL_TYPE_LABELS[goal.goalType]}\n`;
    if (goal.specificDetails) {
      prompt += `  Details: ${goal.specificDetails}\n`;
    }
    prompt += `  Timeline: ${weeksRemaining} of ${totalWeeks} weeks remaining\n`;
    prompt += `  Started: ${startDate.toLocaleDateString()}\n`;
    prompt += `  Target End: ${endDate.toLocaleDateString()}\n\n`;
    prompt += `IMPORTANT: Weight your practice session recommendations to support this goal.\n\n`;
  } else {
    prompt += `No specific practice goal set.\n\n`;
  }

  // Repertoire section with practice history
  if (summary.repertoire.length > 0) {
    prompt += `Repertoire (Learned Pieces):\n`;
    summary.repertoire.forEach(piece => {
      if (piece.daysSinceReview !== undefined) {
        prompt += `- ${piece.name} (last reviewed ${piece.daysSinceReview} days ago)\n`;
      } else {
        prompt += `- ${piece.name} (never reviewed)\n`;
      }
    });
    prompt += `\nNote: Prioritize pieces that haven't been reviewed recently to maintain the repertoire.\n\n`;
  }

  // Scale skills section
  prompt += `Technical Skills (Scales):\n`;
  prompt += `${summary.scaleSkills.overall}\n`;
  if (summary.scaleSkills.details.length > 0) {
    summary.scaleSkills.details.forEach(detail => {
      prompt += `- ${detail}\n`;
    });
  }
  prompt += '\n';

  // Ear training section
  prompt += `Ear Training:\n`;
  prompt += `- Intervals: ${summary.earTraining.intervals}\n`;
  prompt += `- Chords: ${summary.earTraining.chords}\n`;

  return prompt;
};
