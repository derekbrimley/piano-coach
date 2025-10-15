import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import type { ImprovisationGoalData, ImprovisationStyle } from '../../types';

interface ImprovisationGoalFormProps {
  initialData?: ImprovisationGoalData;
  onSave: (data: ImprovisationGoalData) => void;
  onCancel: () => void;
}

const STYLE_LABELS: Record<ImprovisationStyle, string> = {
  jazz: 'Jazz',
  blues: 'Blues',
  gospel: 'Gospel',
  classical: 'Classical',
  other: 'Other'
};

const ImprovisationGoalForm: React.FC<ImprovisationGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [style, setStyle] = useState<ImprovisationStyle>(initialData?.style || 'jazz');
  const [specificFocus, setSpecificFocus] = useState(initialData?.specificFocus || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: ImprovisationGoalData = {
      style,
      specificFocus,
      keysProgressions: [],
      patternsLearned: 0,
      recordingSessions: 0,
      backingTrackPlayAlongs: 0
    };

    onSave(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Improvisation Goal</Typography>

        <FormControl>
          <FormLabel>Style</FormLabel>
          <Select value={style} onChange={(_, val) => val && setStyle(val)} size="lg">
            {(Object.keys(STYLE_LABELS) as ImprovisationStyle[]).map(s => (
              <Option key={s} value={s}>
                {STYLE_LABELS[s]}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Specific Focus</FormLabel>
          <Textarea
            value={specificFocus}
            onChange={(e) => setSpecificFocus(e.target.value)}
            placeholder="e.g., 12-bar blues in 3 keys, ii-V-I progressions"
            minRows={3}
            size="lg"
          />
        </FormControl>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Track keys/progressions mastered, patterns learned, recordings, and play-alongs.
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

export default ImprovisationGoalForm;
