import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePracticeGoal } from '../hooks/usePracticeGoal';
import type { PracticeGoal, PracticeGoalType } from '../types';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import EnhancedPracticeGoalSetup from './practiceGoals/EnhancedPracticeGoalSetup';

interface EnhancedGoalSetupProps {
  onComplete: () => void;
}

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

const EnhancedGoalSetup: React.FC<EnhancedGoalSetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { practiceGoals, loading, completeGoal, abandonGoal, extendGoal } = usePracticeGoal(user?.uid);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleExtend = async (goalId: string, currentEndDate: string) => {
    const currentEnd = new Date(currentEndDate);
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + 28); // Extend by 4 weeks

    try {
      await extendGoal(goalId, newEnd.toISOString());
    } catch (error) {
      console.error('Error extending goal:', error);
      alert('Failed to extend goal. Please try again.');
    }
  };

  const handleComplete = async (goalId: string) => {
    if (window.confirm('Mark this goal as completed?')) {
      try {
        await completeGoal(goalId);
      } catch (error) {
        console.error('Error completing goal:', error);
        alert('Failed to complete goal. Please try again.');
      }
    }
  };

  const handleAbandon = async (goalId: string) => {
    if (window.confirm('Abandon this goal? You can always create a new one later.')) {
      try {
        await abandonGoal(goalId);
      } catch (error) {
        console.error('Error abandoning goal:', error);
        alert('Failed to abandon goal. Please try again.');
      }
    }
  };

  const isGoalExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getGoalProgress = (goal: PracticeGoal): string | null => {
    if (!goal.goalData) return null;

    const type = goal.goalType;
    const data = goal.goalData as any;

    switch (type) {
      case 'performance':
        const readyPieces = data.pieces?.filter((p: any) => p.readiness === 'performanceReady').length || 0;
        const totalPieces = data.pieces?.length || 0;
        return `${readyPieces}/${totalPieces} pieces ready`;

      case 'specificPiece':
        const learnedSections = data.sections?.filter((s: any) => s.learned).length || 0;
        const totalSections = data.sections?.length || 0;
        return `${learnedSections}/${totalSections} sections • ${data.currentBPM || 0} BPM`;

      case 'exam':
        const completedReqs = data.technicalRequirements?.filter((r: any) => r.completed).length || 0;
        const totalReqs = data.technicalRequirements?.length || 0;
        return `${completedReqs}/${totalReqs} requirements completed`;

      case 'sightReading':
        return `${data.piecesRead || 0} pieces read • ${data.consecutiveDays || 0} day streak`;

      case 'improvisation':
        const masteredKeys = data.keysProgressions?.filter((k: any) => k.mastered).length || 0;
        return `${masteredKeys} keys mastered • ${data.patternsLearned || 0} patterns`;

      case 'earTrainingGoal':
        return `${data.sessions?.length || 0} sessions • ${data.consecutiveDays || 0} day streak`;

      case 'technique':
        return `${data.currentBPM || data.startingBPM || 0} BPM → ${data.targetBPM || 0} BPM`;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <EnhancedPracticeGoalSetup
        onComplete={() => {
          setShowCreateForm(false);
          // Don't call onComplete here - we want to stay on the goals page
        }}
      />
    );
  }

  const canAddMore = practiceGoals.length < 3;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 1 }}>Practice Goals</Typography>
        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
          Set up to 3 goals to guide your practice sessions
        </Typography>
      </Box>

      {/* Active Goals */}
      {practiceGoals.length > 0 ? (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {practiceGoals.map((goal) => {
            const daysRemaining = getDaysRemaining(goal.endDate);
            const isExpiring = isGoalExpiringSoon(goal.endDate);
            const progress = getGoalProgress(goal);

            return (
              <Card
                key={goal.id}
                variant="outlined"
                color={isExpiring ? 'warning' : 'neutral'}
                sx={{ borderWidth: 2 }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography level="title-lg" sx={{ mb: 0.5 }}>
                          {goal.title}
                        </Typography>
                        <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
                          {GOAL_TYPE_LABELS[goal.goalType]}
                        </Typography>
                        {goal.specificDetails && (
                          <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
                            {goal.specificDetails}
                          </Typography>
                        )}
                        {progress && (
                          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'md' }}>
                            {progress}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip size="sm" variant="soft" color={daysRemaining > 0 ? 'primary' : 'danger'}>
                            {daysRemaining > 0
                              ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
                              : 'Ended'}
                          </Chip>
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            Ends {new Date(goal.endDate).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="sm"
                        variant="soft"
                        color="success"
                        onClick={() => goal.id && handleComplete(goal.id)}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="primary"
                        onClick={() => goal.id && handleExtend(goal.id, goal.endDate)}
                      >
                        Extend 4 Weeks
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="danger"
                        onClick={() => goal.id && handleAbandon(goal.id)}
                      >
                        Abandon
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card variant="outlined" sx={{ mb: 3, borderStyle: 'dashed' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography level="title-md" sx={{ mb: 1 }}>
              No practice goals set
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
              Set a goal to get AI-tailored practice sessions
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add Goal Button */}
      {canAddMore && (
        <Button
          size="lg"
          variant="outlined"
          fullWidth
          onClick={() => setShowCreateForm(true)}
          sx={{ borderStyle: 'dashed' }}
        >
          + Add Goal ({practiceGoals.length}/3)
        </Button>
      )}

      {!canAddMore && (
        <Typography level="body-sm" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
          You have reached the maximum of 3 active goals. Complete or abandon a goal to add more.
        </Typography>
      )}

      {/* Back Button */}
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" color="neutral" onClick={onComplete} fullWidth>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedGoalSetup;
