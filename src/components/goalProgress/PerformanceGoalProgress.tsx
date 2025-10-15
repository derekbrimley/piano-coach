import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import type { PerformanceGoalData, PerformanceReadiness } from '../../types';

interface PerformanceGoalProgressProps {
  goalData: PerformanceGoalData;
  onUpdate: (data: PerformanceGoalData) => Promise<void>;
  onClose: () => void;
}

const READINESS_LABELS: Record<PerformanceReadiness, string> = {
  shaky: 'Shaky',
  solid: 'Solid',
  performanceReady: 'Performance-Ready'
};

const READINESS_COLORS: Record<PerformanceReadiness, 'danger' | 'warning' | 'success'> = {
  shaky: 'danger',
  solid: 'warning',
  performanceReady: 'success'
};

const PerformanceGoalProgress: React.FC<PerformanceGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: PerformanceGoalData = {
    eventDate: goalData?.eventDate || '',
    pieces: goalData?.pieces || [],
    fullRunThroughs: goalData?.fullRunThroughs || 0,
    memoryConfidence: goalData?.memoryConfidence || 3,
    pressurePracticeSessions: goalData?.pressurePracticeSessions || 0
  };

  const [data, setData] = useState<PerformanceGoalData>(initialData);
  const [saving, setSaving] = useState(false);

  const handlePieceReadinessChange = (index: number, readiness: PerformanceReadiness) => {
    const updated = { ...data };
    updated.pieces[index].readiness = readiness;
    setData(updated);
  };

  const incrementCounter = (field: 'fullRunThroughs' | 'pressurePracticeSessions') => {
    setData({ ...data, [field]: data[field] + 1 });
  };

  const decrementCounter = (field: 'fullRunThroughs' | 'pressurePracticeSessions') => {
    if (data[field] > 0) {
      setData({ ...data, [field]: data[field] - 1 });
    }
  };

  const handleMemoryConfidenceChange = (value: number) => {
    setData({ ...data, memoryConfidence: value });
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
      <Typography level="h3" sx={{ mb: 3 }}>Update Performance Progress</Typography>

      <Stack spacing={3}>
        {/* Piece Readiness */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Piece Readiness</Typography>
          <Stack spacing={2}>
            {data.pieces.map((piece, index) => (
              <Card key={index} variant="outlined">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography sx={{ flex: 1, fontWeight: 'md' }}>{piece.name}</Typography>
                  <Select
                    value={piece.readiness}
                    onChange={(_, value) => value && handlePieceReadinessChange(index, value)}
                    size="sm"
                    color={READINESS_COLORS[piece.readiness]}
                    sx={{ minWidth: 160 }}
                  >
                    {(Object.keys(READINESS_LABELS) as PerformanceReadiness[]).map(level => (
                      <Option key={level} value={level}>
                        {READINESS_LABELS[level]}
                      </Option>
                    ))}
                  </Select>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Full Run-Throughs */}
        <FormControl>
          <FormLabel>Full Run-Throughs Completed</FormLabel>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => decrementCounter('fullRunThroughs')}
              disabled={data.fullRunThroughs === 0}
            >
              -
            </Button>
            <Input
              value={data.fullRunThroughs}
              readOnly
              sx={{ width: 80, textAlign: 'center', fontWeight: 'bold' }}
            />
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => incrementCounter('fullRunThroughs')}
            >
              +
            </Button>
          </Stack>
        </FormControl>

        {/* Memory Confidence */}
        <FormControl>
          <FormLabel>Memory Confidence (1-5)</FormLabel>
          <Stack direction="row" spacing={1}>
            {[1, 2, 3, 4, 5].map(value => (
              <Button
                key={value}
                variant={data.memoryConfidence === value ? 'solid' : 'outlined'}
                color={data.memoryConfidence === value ? 'primary' : 'neutral'}
                onClick={() => handleMemoryConfidenceChange(value)}
                sx={{ flex: 1 }}
              >
                {value}
              </Button>
            ))}
          </Stack>
        </FormControl>

        {/* Performance Pressure Practice */}
        <FormControl>
          <FormLabel>Performance Pressure Practice Sessions</FormLabel>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => decrementCounter('pressurePracticeSessions')}
              disabled={data.pressurePracticeSessions === 0}
            >
              -
            </Button>
            <Input
              value={data.pressurePracticeSessions}
              readOnly
              sx={{ width: 80, textAlign: 'center', fontWeight: 'bold' }}
            />
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => incrementCounter('pressurePracticeSessions')}
            >
              +
            </Button>
          </Stack>
        </FormControl>

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

export default PerformanceGoalProgress;
