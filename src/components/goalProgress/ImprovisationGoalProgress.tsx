import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Input from '@mui/joy/Input';
import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import Divider from '@mui/joy/Divider';
import type { ImprovisationGoalData, KeyProgression } from '../../types';

interface ImprovisationGoalProgressProps {
  goalData: ImprovisationGoalData;
  onUpdate: (data: ImprovisationGoalData) => Promise<void>;
  onClose: () => void;
}

const ImprovisationGoalProgress: React.FC<ImprovisationGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: ImprovisationGoalData = {
    style: goalData?.style || '',
    keysProgressions: goalData?.keysProgressions || [],
    patternsLearned: goalData?.patternsLearned || 0,
    recordingSessions: goalData?.recordingSessions || 0,
    backingTrackPlayAlongs: goalData?.backingTrackPlayAlongs || 0
  };

  const [data, setData] = useState<ImprovisationGoalData>(initialData);
  const [newKeyProgression, setNewKeyProgression] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleKeyProgression = (id: string) => {
    setData({
      ...data,
      keysProgressions: data.keysProgressions.map(kp =>
        kp.id === id ? { ...kp, mastered: !kp.mastered } : kp
      )
    });
  };

  const addKeyProgression = () => {
    if (newKeyProgression.trim()) {
      setData({
        ...data,
        keysProgressions: [
          ...data.keysProgressions,
          {
            id: Date.now().toString(),
            description: newKeyProgression,
            mastered: false
          }
        ]
      });
      setNewKeyProgression('');
    }
  };

  const removeKeyProgression = (id: string) => {
    setData({
      ...data,
      keysProgressions: data.keysProgressions.filter(kp => kp.id !== id)
    });
  };

  const incrementCounter = (field: 'patternsLearned' | 'recordingSessions' | 'backingTrackPlayAlongs') => {
    setData({ ...data, [field]: data[field] + 1 });
  };

  const decrementCounter = (field: 'patternsLearned' | 'recordingSessions' | 'backingTrackPlayAlongs') => {
    if (data[field] > 0) {
      setData({ ...data, [field]: data[field] - 1 });
    }
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
      <Typography level="h3" sx={{ mb: 3 }}>Update Improvisation Progress</Typography>

      <Stack spacing={3}>
        {/* Keys/Progressions */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Keys/Progressions</Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Input
              placeholder="e.g., C Major Blues, ii-V-I in F"
              value={newKeyProgression}
              onChange={(e) => setNewKeyProgression(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyProgression()}
              sx={{ flex: 1 }}
            />
            <Button onClick={addKeyProgression} disabled={!newKeyProgression.trim()}>
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {data.keysProgressions.map((kp) => (
              <Card key={kp.id} variant="outlined" size="sm">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Checkbox
                    checked={kp.mastered}
                    onChange={() => toggleKeyProgression(kp.id)}
                    sx={{ flex: 1 }}
                    label={kp.description}
                  />
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={() => removeKeyProgression(kp.id)}
                  >
                    ×
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Patterns Learned */}
        <Box>
          <Typography level="title-sm" sx={{ mb: 1 }}>Patterns/Licks Learned</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => decrementCounter('patternsLearned')}
              disabled={data.patternsLearned === 0}
            >
              -
            </Button>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography level="h2">{data.patternsLearned}</Typography>
            </Box>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => incrementCounter('patternsLearned')}
            >
              +
            </Button>
          </Stack>
        </Box>

        {/* Recording Sessions */}
        <Box>
          <Typography level="title-sm" sx={{ mb: 1 }}>Recording Sessions</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => decrementCounter('recordingSessions')}
              disabled={data.recordingSessions === 0}
            >
              -
            </Button>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography level="h2">{data.recordingSessions}</Typography>
            </Box>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => incrementCounter('recordingSessions')}
            >
              +
            </Button>
          </Stack>
        </Box>

        {/* Backing Track Play-Alongs */}
        <Box>
          <Typography level="title-sm" sx={{ mb: 1 }}>Backing Track Play-Alongs</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => decrementCounter('backingTrackPlayAlongs')}
              disabled={data.backingTrackPlayAlongs === 0}
            >
              -
            </Button>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography level="h2">{data.backingTrackPlayAlongs}</Typography>
            </Box>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => incrementCounter('backingTrackPlayAlongs')}
            >
              +
            </Button>
          </Stack>
        </Box>

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

export default ImprovisationGoalProgress;
