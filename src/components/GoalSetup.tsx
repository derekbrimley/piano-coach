import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePracticeGoal } from '../hooks/usePracticeGoal';
import type { PracticeGoal, PracticeGoalType } from '../types';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';

interface GoalSetupProps {
  onComplete: () => void;
  existingGoals?: any[];
  editGoal?: any | null;
  onEditGoal: (goal: any) => void;
  handleDeleteGoal: (goalId: string) => void;
}

const GOAL_TYPE_LABELS: Record<PracticeGoalType, string> = {
  performance: 'Performance/Recital',
  specificPiece: 'Learning a Specific Piece',
  exam: 'Exam/Audition',
  sightReading: 'Improve Sight-Reading',
  improvisation: 'Build Improvisation Skills',
  general: 'General Skill Development',
  other: 'Other'
};

const DURATION_OPTIONS = [
  { weeks: 1, label: '1 week' },
  { weeks: 2, label: '2 weeks' },
  { weeks: 3, label: '3 weeks' },
  { weeks: 4, label: '4 weeks (default)' },
  { weeks: 6, label: '6 weeks' },
  { weeks: 8, label: '8 weeks' },
  { weeks: 12, label: '3 months' }
];

const GoalSetup: React.FC<GoalSetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { practiceGoals, loading, createGoal, updateGoal, completeGoal, abandonGoal, extendGoal } = usePracticeGoal(user?.uid);

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PracticeGoal | null>(null);
  const [goalType, setGoalType] = useState<PracticeGoalType>('general');
  const [specificDetails, setSpecificDetails] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [saving, setSaving] = useState(false);

  const handleOpenForm = (goal?: PracticeGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalType(goal.goalType);
      setSpecificDetails(goal.specificDetails || '');

      // Calculate duration from existing goal
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      setDurationWeeks(diffWeeks);
    } else {
      setEditingGoal(null);
      setGoalType('general');
      setSpecificDetails('');
      setDurationWeeks(4);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setGoalType('general');
    setSpecificDetails('');
    setDurationWeeks(4);
  };

  const calculateEndDate = (weeks: number, startDate?: string) => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (weeks * 7));
    return end.toISOString();
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (editingGoal?.id) {
        // Update existing goal
        const endDate = calculateEndDate(durationWeeks, editingGoal.startDate);
        const updates: any = {
          goalType,
          endDate
        };

        // Only add specificDetails if it has a value
        const trimmedDetails = specificDetails.trim();
        if (trimmedDetails) {
          updates.specificDetails = trimmedDetails;
        }

        await updateGoal(editingGoal.id, updates);
      } else {
        // Create new goal
        const startDate = new Date().toISOString();
        const endDate = calculateEndDate(durationWeeks);

        const goalData: any = {
          goalType,
          startDate,
          endDate
        };

        // Only add specificDetails if it has a value
        const trimmedDetails = specificDetails.trim();
        if (trimmedDetails) {
          goalData.specificDetails = trimmedDetails;
        }

        await createGoal(goalData);
      }

      handleCloseForm();
    } catch (error: any) {
      console.error('Error saving practice goal:', error);
      alert(error.message || 'Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress size="lg" />
      </Box>
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
                          {GOAL_TYPE_LABELS[goal.goalType]}
                        </Typography>
                        {goal.specificDetails && (
                          <Typography level="body-md" sx={{ mb: 1, color: 'text.secondary' }}>
                            {goal.specificDetails}
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
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => handleOpenForm(goal)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </IconButton>
                      </Stack>
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
          onClick={() => handleOpenForm()}
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

      {/* Goal Form Modal */}
      <Modal open={showForm} onClose={handleCloseForm}>
        <ModalDialog sx={{ maxWidth: 600, width: '90%' }}>
          <ModalClose />
          <Typography level="h2" sx={{ mb: 2 }}>
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </Typography>

          <Stack spacing={2}>
            <FormControl>
              <FormLabel>What is your practice objective?</FormLabel>
              <Select
                value={goalType}
                onChange={(_, value) => value && setGoalType(value as PracticeGoalType)}
                size="lg"
              >
                {(Object.keys(GOAL_TYPE_LABELS) as PracticeGoalType[]).map(type => (
                  <Option key={type} value={type}>
                    {GOAL_TYPE_LABELS[type]}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Specific details (optional)</FormLabel>
              <Textarea
                value={specificDetails}
                onChange={(e) => setSpecificDetails(e.target.value)}
                placeholder={
                  goalType === 'performance'
                    ? 'e.g., Playing Chopin Nocturne Op. 9 No. 2 at my recital'
                    : goalType === 'specificPiece'
                    ? 'e.g., Beethoven Moonlight Sonata, 1st movement'
                    : goalType === 'exam'
                    ? 'e.g., ABRSM Grade 8 exam in December'
                    : 'Describe your goal in more detail...'
                }
                minRows={3}
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Time frame</FormLabel>
              <Select
                value={durationWeeks}
                onChange={(_, value) => value && setDurationWeeks(value)}
                size="lg"
              >
                {DURATION_OPTIONS.map(option => (
                  <Option key={option.weeks} value={option.weeks}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
                Goal will end on: {new Date(calculateEndDate(durationWeeks, editingGoal?.startDate)).toLocaleDateString()}
              </Typography>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                onClick={handleSave}
                loading={saving}
                size="lg"
                fullWidth
                disabled={!goalType}
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleCloseForm}
                size="lg"
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default GoalSetup;
