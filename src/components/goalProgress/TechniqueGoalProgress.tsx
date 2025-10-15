import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Input from '@mui/joy/Input';
import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Divider from '@mui/joy/Divider';
import type { TechniqueGoalData, KeyPattern, TechniqueExercise } from '../../types';

interface TechniqueGoalProgressProps {
  goalData: TechniqueGoalData;
  onUpdate: (data: TechniqueGoalData) => Promise<void>;
  onClose: () => void;
}

const TechniqueGoalProgress: React.FC<TechniqueGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: TechniqueGoalData = {
    focusArea: goalData?.focusArea || '',
    startingBPM: goalData?.startingBPM || 60,
    currentBPM: goalData?.currentBPM || 60,
    targetBPM: goalData?.targetBPM || 120,
    keysPatterns: goalData?.keysPatterns || [],
    exercises: goalData?.exercises || [],
    daysPracticed: goalData?.daysPracticed || 0
  };

  const [data, setData] = useState<TechniqueGoalData>(initialData);
  const [newKeyPattern, setNewKeyPattern] = useState('');
  const [newExercise, setNewExercise] = useState('');
  const [saving, setSaving] = useState(false);

  const updateBPM = (value: string) => {
    const bpm = parseInt(value) || 0;
    setData({ ...data, currentBPM: bpm });
  };

  const toggleKeyPattern = (id: string) => {
    setData({
      ...data,
      keysPatterns: data.keysPatterns.map(kp =>
        kp.id === id ? { ...kp, mastered: !kp.mastered } : kp
      )
    });
  };

  const addKeyPattern = () => {
    if (newKeyPattern.trim()) {
      setData({
        ...data,
        keysPatterns: [
          ...data.keysPatterns,
          {
            id: Date.now().toString(),
            description: newKeyPattern,
            mastered: false
          }
        ]
      });
      setNewKeyPattern('');
    }
  };

  const removeKeyPattern = (id: string) => {
    setData({
      ...data,
      keysPatterns: data.keysPatterns.filter(kp => kp.id !== id)
    });
  };

  const toggleExercise = (id: string) => {
    setData({
      ...data,
      exercises: data.exercises.map(ex =>
        ex.id === id ? { ...ex, completed: !ex.completed } : ex
      )
    });
  };

  const addExercise = () => {
    if (newExercise.trim()) {
      setData({
        ...data,
        exercises: [
          ...data.exercises,
          {
            id: Date.now().toString(),
            description: newExercise,
            completed: false
          }
        ]
      });
      setNewExercise('');
    }
  };

  const removeExercise = (id: string) => {
    setData({
      ...data,
      exercises: data.exercises.filter(ex => ex.id !== id)
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Increment days practiced if saving after a practice session
      const updatedData = {
        ...data,
        daysPracticed: data.daysPracticed + 1
      };
      await onUpdate(updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progressPercentage = data.targetBPM > 0
    ? Math.min(100, Math.max(0, ((data.currentBPM - data.startingBPM) / (data.targetBPM - data.startingBPM)) * 100))
    : 0;

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3 }}>Update Technique Progress</Typography>

      <Stack spacing={3}>
        {/* Tempo Progress */}
        <Card variant="soft">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Starting BPM
              </Typography>
              <Typography level="title-lg">{data.startingBPM}</Typography>
            </Stack>
            <FormControl>
              <FormLabel>Current BPM</FormLabel>
              <Input
                type="number"
                value={data.currentBPM}
                onChange={(e) => updateBPM(e.target.value)}
                slotProps={{ input: { min: data.startingBPM, max: data.targetBPM } }}
                size="lg"
              />
            </FormControl>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Target BPM
              </Typography>
              <Typography level="title-lg">{data.targetBPM}</Typography>
            </Stack>
            <Typography level="body-sm" sx={{ textAlign: 'center', fontWeight: 'md', color: 'primary.500' }}>
              Progress: {Math.round(progressPercentage)}%
            </Typography>
          </Stack>
        </Card>

        <Divider />

        {/* Keys/Patterns */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Keys/Patterns Mastered</Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Input
              placeholder="e.g., C Major, All major scales"
              value={newKeyPattern}
              onChange={(e) => setNewKeyPattern(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyPattern()}
              sx={{ flex: 1 }}
            />
            <Button onClick={addKeyPattern} disabled={!newKeyPattern.trim()}>
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {data.keysPatterns.map((kp) => (
              <Card key={kp.id} variant="outlined" size="sm">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Checkbox
                    checked={kp.mastered}
                    onChange={() => toggleKeyPattern(kp.id)}
                    sx={{ flex: 1 }}
                    label={kp.description}
                  />
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={() => removeKeyPattern(kp.id)}
                  >
                    ×
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Exercises */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Exercises</Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Input
              placeholder="e.g., Hanon #1-5, Czerny Op. 299 #1"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExercise()}
              sx={{ flex: 1 }}
            />
            <Button onClick={addExercise} disabled={!newExercise.trim()}>
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {data.exercises.map((ex) => (
              <Card key={ex.id} variant="outlined" size="sm">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Checkbox
                    checked={ex.completed}
                    onChange={() => toggleExercise(ex.id)}
                    sx={{ flex: 1 }}
                    label={ex.description}
                  />
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={() => removeExercise(ex.id)}
                  >
                    ×
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Days Practiced */}
        <Card variant="soft">
          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Days Practiced
          </Typography>
          <Typography level="h2">{data.daysPracticed + 1}</Typography>
          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            (Will increment when you save)
          </Typography>
        </Card>

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

export default TechniqueGoalProgress;
