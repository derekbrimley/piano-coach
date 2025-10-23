import React from 'react';
import { usePracticeGoal } from '../hooks/usePracticeGoal';
import { useAuth } from '../contexts/AuthContext';
import type { PracticeGoalType } from '../types';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';

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

const SessionStartMessage: React.FC = () => {
  const { user } = useAuth();
  const { practiceGoals } = usePracticeGoal(user?.uid);

  if (practiceGoals.length === 0) {
    return null;
  }

  return (
    <Alert color="primary" size="sm" sx={{ mb: 3 }}>
      <Typography level="body-sm">
        <strong>Today's session supports your {practiceGoals.length === 1 ? 'goal' : 'goals'}:</strong>{' '}
        {practiceGoals.map((goal, index) => (
          <span key={goal.id}>
            {index > 0 && ', '}
            {GOAL_TYPE_LABELS[goal.goalType]}
            {goal.specificDetails && ` (${goal.specificDetails})`}
          </span>
        ))}
      </Typography>
    </Alert>
  );
};

export default SessionStartMessage;
