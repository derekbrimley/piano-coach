import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Card from '@mui/joy/Card';
import Checkbox from '@mui/joy/Checkbox';
import type { SpecificPieceGoalData, PieceSection, LearningStage } from '../../types';

interface SpecificPieceGoalFormProps {
  initialData?: SpecificPieceGoalData;
  onSave: (data: SpecificPieceGoalData) => void;
  onCancel: () => void;
}

const LEARNING_STAGE_LABELS: Record<LearningStage, string> = {
  handsSeparately: 'Hands Separately',
  handsTogether: 'Hands Together',
  memory: 'Memory',
  polish: 'Polish'
};

const SpecificPieceGoalForm: React.FC<SpecificPieceGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [pieceName, setPieceName] = useState(initialData?.pieceName || '');
  const [composer, setComposer] = useState(initialData?.composer || '');
  const [targetCompletionDate, setTargetCompletionDate] = useState(initialData?.targetCompletionDate || '');
  const [sections, setSections] = useState<PieceSection[]>(
    initialData?.sections || [{ id: '1', name: 'Section A', learned: false }]
  );
  const [currentBPM, setCurrentBPM] = useState(initialData?.currentBPM?.toString() || '60');
  const [targetBPM, setTargetBPM] = useState(initialData?.targetBPM?.toString() || '120');

  const handleAddSection = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextLetter = letters[sections.length] || `Section ${sections.length + 1}`;
    setSections([
      ...sections,
      { id: Date.now().toString(), name: `Section ${nextLetter}`, learned: false }
    ]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSectionChange = (id: string, name: string) => {
    setSections(sections.map(s => (s.id === id ? { ...s, name } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: SpecificPieceGoalData = {
      pieceName,
      composer: composer.trim() || undefined,
      targetCompletionDate: targetCompletionDate || undefined,
      sections: sections.filter(s => s.name.trim() !== ''),
      currentBPM: parseInt(currentBPM) || 60,
      targetBPM: parseInt(targetBPM) || 120,
      learningStages: {
        handsSeparately: false,
        handsTogether: false,
        memory: false,
        polish: false
      },
      problemSpots: [],
      daysWorked: 0
    };

    onSave(data);
  };

  const isValid = pieceName.trim() !== '';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Learning a Specific Piece</Typography>

        <FormControl required>
          <FormLabel>Piece Name</FormLabel>
          <Input
            value={pieceName}
            onChange={(e) => setPieceName(e.target.value)}
            placeholder="e.g., Moonlight Sonata"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Composer (optional)</FormLabel>
          <Input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="e.g., Beethoven"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Target Completion Date (optional)</FormLabel>
          <Input
            type="date"
            value={targetCompletionDate}
            onChange={(e) => setTargetCompletionDate(e.target.value)}
            size="lg"
          />
        </FormControl>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <FormLabel>Sections to Learn</FormLabel>
            <Button size="sm" variant="outlined" onClick={handleAddSection}>
              + Add Section
            </Button>
          </Stack>

          <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
            Break your piece into logical sections (e.g., Intro, A, B, Bridge, Coda)
          </Typography>

          <Stack spacing={1.5}>
            {sections.map((section) => (
              <Card key={section.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Input
                    value={section.name}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    placeholder="Section name"
                    sx={{ flex: 1 }}
                  />

                  <IconButton
                    color="danger"
                    variant="plain"
                    size="sm"
                    onClick={() => handleRemoveSection(section.id)}
                    disabled={sections.length === 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Current BPM</FormLabel>
            <Input
              type="number"
              value={currentBPM}
              onChange={(e) => setCurrentBPM(e.target.value)}
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
          After creating this goal, you'll be able to track: learning stages, tempo progress, problem spots, and
          practice days.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button type="submit" size="lg" fullWidth disabled={!isValid}>
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

export default SpecificPieceGoalForm;
