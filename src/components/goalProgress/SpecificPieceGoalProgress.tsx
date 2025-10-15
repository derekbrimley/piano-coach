import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import type { SpecificPieceGoalData, LearningStage, ProblemSpot } from '../../types';

interface SpecificPieceGoalProgressProps {
  goalData: SpecificPieceGoalData;
  onUpdate: (data: SpecificPieceGoalData) => Promise<void>;
  onClose: () => void;
}

const LEARNING_STAGE_LABELS: Record<LearningStage, string> = {
  handsSeparately: 'Hands Separately',
  handsTogether: 'Hands Together',
  memory: 'Memory',
  polish: 'Polish'
};

const SpecificPieceGoalProgress: React.FC<SpecificPieceGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: SpecificPieceGoalData = {
    pieceName: goalData?.pieceName || '',
    composer: goalData?.composer,
    targetCompletionDate: goalData?.targetCompletionDate,
    sections: goalData?.sections || [],
    currentBPM: goalData?.currentBPM || 0,
    targetBPM: goalData?.targetBPM || 0,
    learningStages: goalData?.learningStages || {
      handsSeparately: false,
      handsTogether: false,
      memory: false,
      polish: false
    },
    problemSpots: goalData?.problemSpots || [],
    daysWorked: goalData?.daysWorked || 0
  };

  const [data, setData] = useState<SpecificPieceGoalData>(initialData);
  const [newProblemSpot, setNewProblemSpot] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSection = (sectionId: string) => {
    const updated = { ...data };
    const section = updated.sections.find(s => s.id === sectionId);
    if (section) {
      section.learned = !section.learned;
      setData(updated);
    }
  };

  const toggleStage = (stage: LearningStage) => {
    setData({
      ...data,
      learningStages: {
        ...data.learningStages,
        [stage]: !data.learningStages[stage]
      }
    });
  };

  const updateBPM = (value: string) => {
    const bpm = parseInt(value) || 0;
    setData({ ...data, currentBPM: bpm });
  };

  const addProblemSpot = () => {
    if (newProblemSpot.trim()) {
      setData({
        ...data,
        problemSpots: [
          ...data.problemSpots,
          {
            id: Date.now().toString(),
            description: newProblemSpot,
            status: 'identified'
          }
        ]
      });
      setNewProblemSpot('');
    }
  };

  const updateProblemSpotStatus = (id: string, status: ProblemSpot['status']) => {
    setData({
      ...data,
      problemSpots: data.problemSpots.map(spot =>
        spot.id === id ? { ...spot, status } : spot
      )
    });
  };

  const removeProblemSpot = (id: string) => {
    setData({
      ...data,
      problemSpots: data.problemSpots.filter(spot => spot.id !== id)
    });
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
      <Typography level="h3" sx={{ mb: 3 }}>Update Piece Progress</Typography>

      <Stack spacing={3}>
        {/* Sections */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Sections Learned</Typography>
          <Stack spacing={1}>
            {data.sections.map((section) => (
              <Checkbox
                key={section.id}
                label={section.name}
                checked={section.learned}
                onChange={() => toggleSection(section.id)}
              />
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Tempo Progress */}
        <FormControl>
          <FormLabel>Current Tempo (BPM)</FormLabel>
          <Stack direction="row" spacing={2} alignItems="center">
            <Input
              type="number"
              value={data.currentBPM}
              onChange={(e) => updateBPM(e.target.value)}
              slotProps={{ input: { min: 20, max: 300 } }}
              sx={{ width: 120 }}
            />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Target: {data.targetBPM} BPM
            </Typography>
          </Stack>
        </FormControl>

        <Divider />

        {/* Learning Stages */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Learning Stages</Typography>
          <Stack spacing={1}>
            {(Object.keys(LEARNING_STAGE_LABELS) as LearningStage[]).map(stage => (
              <Checkbox
                key={stage}
                label={LEARNING_STAGE_LABELS[stage]}
                checked={data.learningStages[stage]}
                onChange={() => toggleStage(stage)}
              />
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Problem Spots */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Problem Spots</Typography>

          {/* Add new problem spot */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Input
              placeholder="Describe problem spot..."
              value={newProblemSpot}
              onChange={(e) => setNewProblemSpot(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProblemSpot()}
              sx={{ flex: 1 }}
            />
            <Button onClick={addProblemSpot} disabled={!newProblemSpot.trim()}>
              Add
            </Button>
          </Stack>

          {/* Problem spot list */}
          <Stack spacing={1.5}>
            {data.problemSpots.map((spot) => (
              <Card key={spot.id} variant="outlined" size="sm">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography sx={{ flex: 1 }} level="body-sm">
                    {spot.description}
                  </Typography>
                  <Select
                    value={spot.status}
                    onChange={(_, value) => value && updateProblemSpotStatus(spot.id, value)}
                    size="sm"
                    sx={{ minWidth: 120 }}
                  >
                    <Option value="identified">Identified</Option>
                    <Option value="working">Working</Option>
                    <Option value="resolved">Resolved</Option>
                  </Select>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={() => removeProblemSpot(spot.id)}
                  >
                    ×
                  </IconButton>
                </Stack>
              </Card>
            ))}
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

export default SpecificPieceGoalProgress;
