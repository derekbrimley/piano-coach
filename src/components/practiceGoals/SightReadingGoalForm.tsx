import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import type { SightReadingGoalData, SightReadingLevel, FrequencyTarget } from '../../types';

interface SightReadingGoalFormProps {
  initialData?: SightReadingGoalData;
  onSave: (data: SightReadingGoalData) => void;
  onCancel: () => void;
}

const LEVEL_LABELS: Record<SightReadingLevel, string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

const FREQUENCY_LABELS: Record<FrequencyTarget, string> = {
  daily: 'Daily',
  threeTimes: '3x per week',
  weekly: 'Weekly'
};

const SightReadingGoalForm: React.FC<SightReadingGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [currentLevel, setCurrentLevel] = useState<SightReadingLevel>(initialData?.currentLevel || 'beginner');
  const [targetLevel, setTargetLevel] = useState<SightReadingLevel>(initialData?.targetLevel || 'intermediate');
  const [frequency, setFrequency] = useState<FrequencyTarget>(initialData?.frequencyTarget || 'daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: SightReadingGoalData = {
      targetLevel,
      frequencyTarget: frequency,
      currentLevel,
      piecesRead: 0,
      sessions: [],
      consecutiveDays: 0
    };

    onSave(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Sight-Reading Goal</Typography>

        <FormControl>
          <FormLabel>Current Level</FormLabel>
          <Select value={currentLevel} onChange={(_, val) => val && setCurrentLevel(val)} size="lg">
            {(Object.keys(LEVEL_LABELS) as SightReadingLevel[]).map(level => (
              <Option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Target Level</FormLabel>
          <Select value={targetLevel} onChange={(_, val) => val && setTargetLevel(val)} size="lg">
            {(Object.keys(LEVEL_LABELS) as SightReadingLevel[]).map(level => (
              <Option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Practice Frequency</FormLabel>
          <Select value={frequency} onChange={(_, val) => val && setFrequency(val)} size="lg">
            {(Object.keys(FREQUENCY_LABELS) as FrequencyTarget[]).map(freq => (
              <Option key={freq} value={freq}>
                {FREQUENCY_LABELS[freq]}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Track pieces read, accuracy ratings, and build your practice streak.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button type="submit" size="lg" fullWidth>
            Save Goal
          </Button>
          <Button type="button" variant="outlined" color="neutral" onClick={onCancel} size="lg">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SightReadingGoalForm;
