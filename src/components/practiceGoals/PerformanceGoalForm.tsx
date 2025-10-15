import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Card from '@mui/joy/Card';
import type { PerformanceGoalData, PerformancePiece, PerformanceReadiness } from '../../types';

interface PerformanceGoalFormProps {
  initialData?: PerformanceGoalData;
  onSave: (data: PerformanceGoalData) => void;
  onCancel: () => void;
}

const READINESS_LABELS: Record<PerformanceReadiness, string> = {
  shaky: 'Shaky',
  solid: 'Solid',
  performanceReady: 'Performance-Ready'
};

const PerformanceGoalForm: React.FC<PerformanceGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [eventDate, setEventDate] = useState(initialData?.eventDate || '');
  const [pieces, setPieces] = useState<PerformancePiece[]>(
    initialData?.pieces || [{ name: '', readiness: 'shaky' }]
  );

  const handleAddPiece = () => {
    setPieces([...pieces, { name: '', readiness: 'shaky' }]);
  };

  const handleRemovePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const handlePieceChange = (index: number, field: keyof PerformancePiece, value: string) => {
    const updated = [...pieces];
    if (field === 'name') {
      updated[index].name = value;
    } else if (field === 'readiness') {
      updated[index].readiness = value as PerformanceReadiness;
    }
    setPieces(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: PerformanceGoalData = {
      eventDate,
      pieces: pieces.filter(p => p.name.trim() !== ''),
      fullRunThroughs: initialData?.fullRunThroughs || 0,
      memoryConfidence: initialData?.memoryConfidence || 3,
      pressurePracticeSessions: initialData?.pressurePracticeSessions || 0
    };

    onSave(data);
  };

  const isValid = eventDate && pieces.some(p => p.name.trim() !== '');

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Performance/Recital Details</Typography>

        <FormControl required>
          <FormLabel>Event Date</FormLabel>
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            size="lg"
          />
        </FormControl>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <FormLabel>Pieces to Perform</FormLabel>
            <Button size="sm" variant="outlined" onClick={handleAddPiece}>
              + Add Piece
            </Button>
          </Stack>

          <Stack spacing={2}>
            {pieces.map((piece, index) => (
              <Card key={index} variant="outlined">
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <FormControl sx={{ flex: 2 }}>
                    <Input
                      placeholder="Piece name"
                      value={piece.name}
                      onChange={(e) => handlePieceChange(index, 'name', e.target.value)}
                      required
                    />
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <Select
                      value={piece.readiness}
                      onChange={(_, value) => value && handlePieceChange(index, 'readiness', value)}
                    >
                      {(Object.keys(READINESS_LABELS) as PerformanceReadiness[]).map(level => (
                        <Option key={level} value={level}>
                          {READINESS_LABELS[level]}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>

                  <IconButton
                    color="danger"
                    variant="plain"
                    onClick={() => handleRemovePiece(index)}
                    disabled={pieces.length === 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          After creating this goal, you'll be able to track: full run-throughs, memory confidence, and performance
          pressure practice sessions.
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

export default PerformanceGoalForm;
