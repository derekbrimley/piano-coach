import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePracticeGoal } from '../hooks/usePracticeGoal';
import type { PracticeGoalType, PracticeGoal } from '../types';
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

interface PracticeGoalSetupProps {
  onComplete: () => void;
  editingGoal?: PracticeGoal | null;
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

const PracticeGoalSetup: React.FC<PracticeGoalSetupProps> = ({ onComplete, editingGoal }) => {
  const { user } = useAuth();
  const { createGoal, updateGoal, loading } = usePracticeGoal(user?.uid);

  const [goalType, setGoalType] = useState<PracticeGoalType>(editingGoal?.goalType || 'general');
  const [specificDetails, setSpecificDetails] = useState(editingGoal?.specificDetails || '');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [customEndDate, setCustomEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Calculate dates
  const startDate = editingGoal?.startDate || new Date().toISOString();
  const calculateEndDate = (weeks: number) => {
    const start = editingGoal ? new Date(editingGoal.startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (weeks * 7));
    return end.toISOString();
  };

  useEffect(() => {
    if (editingGoal) {
      // Calculate duration from existing goal
      const start = new Date(editingGoal.startDate);
      const end = new Date(editingGoal.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      setDurationWeeks(diffWeeks);
    }
  }, [editingGoal]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const endDate = customEndDate || calculateEndDate(durationWeeks);

      if (editingGoal?.id) {
        // Update existing goal
        await updateGoal(editingGoal.id, {
          goalType,
          specificDetails: specificDetails.trim() || undefined,
          endDate
        });
      } else {
        // Create new goal
        await createGoal({
          goalType,
          specificDetails: specificDetails.trim() || undefined,
          startDate,
          endDate
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error saving practice goal:', error);
      alert('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 1 }}>
          {editingGoal ? 'Edit Practice Goal' : 'Set Your Practice Goal'}
        </Typography>
        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
          Define what you want to achieve in your piano practice
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            {/* Goal Type */}
            <FormControl>
              <FormLabel>What is your main practice objective?</FormLabel>
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

            {/* Specific Details */}
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
                maxRows={6}
                size="lg"
              />
            </FormControl>

            {/* Duration */}
            <FormControl>
              <FormLabel>Time frame</FormLabel>
              <Select
                value={durationWeeks}
                onChange={(_, value) => {
                  if (value) {
                    setDurationWeeks(value);
                    setCustomEndDate('');
                  }
                }}
                size="lg"
              >
                {DURATION_OPTIONS.map(option => (
                  <Option key={option.weeks} value={option.weeks}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
                Goal will end on: {new Date(customEndDate || calculateEndDate(durationWeeks)).toLocaleDateString()}
              </Typography>
            </FormControl>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                onClick={handleSave}
                loading={saving}
                size="lg"
                fullWidth
                disabled={!goalType}
              >
                {editingGoal ? 'Update Goal' : 'Set Goal'}
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                onClick={onComplete}
                size="lg"
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card variant="soft" sx={{ mt: 3 }}>
        <CardContent>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            <strong>Note:</strong> Your practice sessions will be tailored to support this goal.
            You can edit or complete your goal at any time from the dashboard.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PracticeGoalSetup;
