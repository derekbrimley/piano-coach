import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Card from '@mui/joy/Card';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Divider from '@mui/joy/Divider';
import type { SightReadingGoalData, SightReadingLevel } from '../../types';

interface SightReadingGoalProgressProps {
  goalData: SightReadingGoalData;
  onUpdate: (data: SightReadingGoalData) => Promise<void>;
  onClose: () => void;
}

const LEVEL_LABELS: Record<SightReadingLevel, string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

const SightReadingGoalProgress: React.FC<SightReadingGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: SightReadingGoalData = {
    currentLevel: goalData?.currentLevel || 'beginner',
    targetLevel: goalData?.targetLevel || 'intermediate',
    piecesRead: goalData?.piecesRead || 0,
    sessions: goalData?.sessions || [],
    consecutiveDays: goalData?.consecutiveDays || 0
  };

  const [data, setData] = useState<SightReadingGoalData>(initialData);
  const [sessionRating, setSessionRating] = useState(3);
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
      piecesRead: data.piecesRead + 1,
      sessions: [
        ...data.sessions,
        {
          date: new Date().toISOString(),
          accuracyRating: sessionRating
        }
      ],
      consecutiveDays: isConsecutiveDay ? data.consecutiveDays + 1 : 1
    });
    setSessionRating(3);
  };

  const updateLevel = (level: SightReadingLevel) => {
    setData({ ...data, currentLevel: level });
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
      <Typography level="h3" sx={{ mb: 3 }}>Update Sight-Reading Progress</Typography>

      <Stack spacing={3}>
        {/* Current Stats */}
        <Card variant="soft">
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pieces Read</Typography>
              <Typography level="h2">{data.piecesRead}</Typography>
            </Box>
            <Box>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Day Streak</Typography>
              <Typography level="h2">{data.consecutiveDays}</Typography>
            </Box>
          </Stack>
        </Card>

        {/* Current Level */}
        <FormControl>
          <FormLabel>Current Level</FormLabel>
          <Select
            value={data.currentLevel}
            onChange={(_, value) => value && updateLevel(value)}
            size="lg"
          >
            {(Object.keys(LEVEL_LABELS) as SightReadingLevel[]).map(level => (
              <Option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </Option>
            ))}
          </Select>
          <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
            Target: {LEVEL_LABELS[data.targetLevel]}
          </Typography>
        </FormControl>

        <Divider />

        {/* Log Session */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Log Today's Session</Typography>
          <FormControl>
            <FormLabel>Accuracy Rating (1-5)</FormLabel>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4, 5].map(value => (
                <Button
                  key={value}
                  variant={sessionRating === value ? 'solid' : 'outlined'}
                  color={sessionRating === value ? 'primary' : 'neutral'}
                  onClick={() => setSessionRating(value)}
                  sx={{ flex: 1 }}
                >
                  {value}
                </Button>
              ))}
            </Stack>
          </FormControl>
          <Button onClick={logSession} sx={{ mt: 2 }} fullWidth>
            Log Session (+1 Piece)
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
                      Accuracy: {session.accuracyRating}/5
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

export default SightReadingGoalProgress;
