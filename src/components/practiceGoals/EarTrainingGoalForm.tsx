import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import type { EarTrainingGoalData, EarTrainingSkillFocus } from '../../types';

interface EarTrainingGoalFormProps {
  initialData?: EarTrainingGoalData;
  onSave: (data: EarTrainingGoalData) => void;
  onCancel: () => void;
}

const SKILL_LABELS: Record<EarTrainingSkillFocus, string> = {
  intervals: 'Intervals',
  chordQuality: 'Chord Quality',
  progressions: 'Progressions',
  melodies: 'Melodies'
};

const EarTrainingGoalForm: React.FC<EarTrainingGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [skillFocus, setSkillFocus] = useState<EarTrainingSkillFocus[]>(initialData?.skillFocus || ['intervals']);
  const [targetDescription, setTargetDescription] = useState(initialData?.targetDescription || '');

  const toggleSkill = (skill: EarTrainingSkillFocus) => {
    if (skillFocus.includes(skill)) {
      setSkillFocus(skillFocus.filter(s => s !== skill));
    } else {
      setSkillFocus([...skillFocus, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: EarTrainingGoalData = {
      skillFocus,
      targetDescription,
      currentLevel: 'Beginner',
      sessions: [],
      consecutiveDays: 0
    };

    onSave(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Ear Training Goal</Typography>

        <Box>
          <FormLabel>Skill Focus</FormLabel>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {(Object.keys(SKILL_LABELS) as EarTrainingSkillFocus[]).map(skill => (
              <Checkbox
                key={skill}
                label={SKILL_LABELS[skill]}
                checked={skillFocus.includes(skill)}
                onChange={() => toggleSkill(skill)}
              />
            ))}
          </Stack>
        </Box>

        <FormControl>
          <FormLabel>Target/Goal</FormLabel>
          <Textarea
            value={targetDescription}
            onChange={(e) => setTargetDescription(e.target.value)}
            placeholder="e.g., Identify major/minor triads by ear"
            minRows={3}
            size="lg"
          />
        </FormControl>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Track exercises completed, accuracy percentage, and build your practice streak.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button type="submit" size="lg" fullWidth disabled={skillFocus.length === 0}>
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

export default EarTrainingGoalForm;
