import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Card from '@mui/joy/Card';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Divider from '@mui/joy/Divider';
import type { EarTrainingGoalData } from '../../types';

interface EarTrainingGoalProgressProps {
  goalData: EarTrainingGoalData;
  onUpdate: (data: EarTrainingGoalData) => Promise<void>;
  onClose: () => void;
}

const EarTrainingGoalProgress: React.FC<EarTrainingGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: EarTrainingGoalData = {
    focusArea: goalData?.focusArea || '',
    sessions: goalData?.sessions || [],
    consecutiveDays: goalData?.consecutiveDays || 0
  };

  const [data, setData] = useState<EarTrainingGoalData>(initialData);
  const [exercisesCompleted, setExercisesCompleted] = useState(10);
  const [accuracy, setAccuracy] = useState(80);
  const [saving, setSaving] = useState(false);

  const logSession = () => {
    const lastSessionDate = data.sessions.length > 0
      ? new Date(data.sessions[data.sessions.length - 1].date)
      : null;
    const today = new Date();
    const isConsecutiveDay = lastSessionDate &&
      today.getDate() - lastSessionDate.getDate() === 1 &&
      today.getMonth() === lastSessionDate.getMonth();

    setData({
      ...data,
      sessions: [
        ...data.sessions,
        {
          date: new Date().toISOString(),
          exercisesCompleted,
          accuracyPercentage: accuracy
        }
      ],
      consecutiveDays: isConsecutiveDay ? data.consecutiveDays + 1 : 1
    });
    setExercisesCompleted(10);
    setAccuracy(80);
  };

  const getAverageAccuracy = () => {
    if (data.sessions.length === 0) return 0;
    const sum = data.sessions.reduce((acc, session) => acc + session.accuracyPercentage, 0);
    return Math.round(sum / data.sessions.length);
  };

  const getTotalExercises = () => {
    return data.sessions.reduce((acc, session) => acc + session.exercisesCompleted, 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3 }}>Update Ear Training Progress</Typography>

      <Stack spacing={3}>
        {/* Current Stats */}
        <Card variant="soft">
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Exercises</Typography>
              <Typography level="h2">{getTotalExercises()}</Typography>
            </Box>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Avg Accuracy</Typography>
              <Typography level="h2">{getAverageAccuracy()}%</Typography>
            </Box>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Day Streak</Typography>
              <Typography level="h2">{data.consecutiveDays}</Typography>
            </Box>
          </Stack>
        </Card>

        <Divider />

        {/* Log Session */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Log Today's Session</Typography>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Exercises Completed</FormLabel>
            <Input
              type="number"
              value={exercisesCompleted}
              onChange={(e) => setExercisesCompleted(parseInt(e.target.value) || 0)}
              slotProps={{ input: { min: 1, max: 100 } }}
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Accuracy Percentage</FormLabel>
            <Stack direction="row" spacing={2} alignItems="center">
              <Input
                type="number"
                value={accuracy}
                onChange={(e) => setAccuracy(parseInt(e.target.value) || 0)}
                slotProps={{ input: { min: 0, max: 100 } }}
                endDecorator="%"
                sx={{ width: 120 }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={accuracy}
                onChange={(e) => setAccuracy(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
            </Stack>
          </FormControl>

          <Button onClick={logSession} fullWidth>
            Log Session
          </Button>
        </Box>

        {/* Recent Sessions */}
        {data.sessions.length > 0 && (
          <Box>
            <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
              Last 5 Sessions
            </Typography>
            <Stack spacing={1}>
              {data.sessions.slice(-5).reverse().map((session, index) => (
                <Card key={index} variant="outlined" size="sm">
                  <Stack direction="row" justifyContent="space-between">
                    <Typography level="body-sm">
                      {new Date(session.date).toLocaleDateString()}
                    </Typography>
                    <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                      {session.exercisesCompleted} exercises • {session.accuracyPercentage}% accuracy
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button onClick={handleSave} loading={saving} size="lg" fullWidth>
            Save Progress
          </Button>
          <Button variant="outlined" color="neutral" onClick={onClose} size="lg" disabled={saving}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EarTrainingGoalProgress;
