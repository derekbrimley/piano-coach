import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import type { TechniqueGoalData } from '../../types';

interface TechniqueGoalFormProps {
  initialData?: TechniqueGoalData;
  onSave: (data: TechniqueGoalData) => void;
  onCancel: () => void;
}

const TechniqueGoalForm: React.FC<TechniqueGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [specificTechnique, setSpecificTechnique] = useState(initialData?.specificTechnique || '');
  const [method, setMethod] = useState(initialData?.technicalExerciseMethod || '');
  const [startingBPM, setStartingBPM] = useState(initialData?.startingBPM?.toString() || '60');
  const [targetBPM, setTargetBPM] = useState(initialData?.targetBPM?.toString() || '120');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: TechniqueGoalData = {
      specificTechnique,
      technicalExerciseMethod: method.trim() || undefined,
      keysPatterns: [],
      startingBPM: parseInt(startingBPM) || 60,
      currentBPM: parseInt(startingBPM) || 60,
      targetBPM: parseInt(targetBPM) || 120,
      daysPracticed: 0,
      exercises: []
    };

    onSave(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Master Technique Goal</Typography>

        <FormControl required>
          <FormLabel>Specific Technique</FormLabel>
          <Textarea
            value={specificTechnique}
            onChange={(e) => setSpecificTechnique(e.target.value)}
            placeholder="e.g., Scales in all major keys at 120 BPM"
            minRows={2}
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Technical Exercise/Method (optional)</FormLabel>
          <Input
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="e.g., Hanon, Czerny, Schmitt"
            size="lg"
          />
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Starting BPM</FormLabel>
            <Input
              type="number"
              value={startingBPM}
              onChange={(e) => setStartingBPM(e.target.value)}
              slotProps={{ input: { min: 20, max: 300 } }}
              size="lg"
            />
          </FormControl>

          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Target BPM</FormLabel>
            <Input
              type="number"
              value={targetBPM}
              onChange={(e) => setTargetBPM(e.target.value)}
              slotProps={{ input: { min: 20, max: 300 } }}
              size="lg"
            />
          </FormControl>
        </Stack>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Track keys/patterns mastered, tempo progression, and practice days.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button type="submit" size="lg" fullWidth disabled={!specificTechnique.trim()}>
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

export default TechniqueGoalForm;
