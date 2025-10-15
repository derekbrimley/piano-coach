import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Card from '@mui/joy/Card';
import type { ExamGoalData, ExamRequirement } from '../../types';

interface ExamGoalFormProps {
  initialData?: ExamGoalData;
  onSave: (data: ExamGoalData) => void;
  onCancel: () => void;
}

const ExamGoalForm: React.FC<ExamGoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [examDate, setExamDate] = useState(initialData?.examDate || '');
  const [examLevel, setExamLevel] = useState(initialData?.examLevel || '');
  const [pieces, setPieces] = useState<string[]>(initialData?.requiredPieces || ['']);
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.technicalRequirements?.map(r => r.description) || ['']
  );

  const handleAddField = (type: 'piece' | 'requirement') => {
    if (type === 'piece') setPieces([...pieces, '']);
    else setRequirements([...requirements, '']);
  };

  const handleRemoveField = (type: 'piece' | 'requirement', index: number) => {
    if (type === 'piece') setPieces(pieces.filter((_, i) => i !== index));
    else setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleChange = (type: 'piece' | 'requirement', index: number, value: string) => {
    if (type === 'piece') {
      const updated = [...pieces];
      updated[index] = value;
      setPieces(updated);
    } else {
      const updated = [...requirements];
      updated[index] = value;
      setRequirements(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: ExamGoalData = {
      examDate,
      examLevel,
      requiredPieces: pieces.filter(p => p.trim() !== ''),
      technicalRequirements: requirements
        .filter(r => r.trim() !== '')
        .map((desc, i) => ({
          id: `req-${i}`,
          description: desc,
          completed: false,
          confidenceRating: 3
        })),
      mockExamAttempts: []
    };

    onSave(data);
  };

  const isValid = examDate && examLevel.trim() !== '';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography level="h3">Exam/Audition Details</Typography>

        <FormControl required>
          <FormLabel>Exam Date</FormLabel>
          <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} size="lg" />
        </FormControl>

        <FormControl required>
          <FormLabel>Exam Level/Type</FormLabel>
          <Input
            value={examLevel}
            onChange={(e) => setExamLevel(e.target.value)}
            placeholder="e.g., ABRSM Grade 5, College audition"
            size="lg"
          />
        </FormControl>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <FormLabel>Required Pieces</FormLabel>
            <Button size="sm" variant="outlined" onClick={() => handleAddField('piece')}>
              + Add
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {pieces.map((piece, index) => (
              <Stack key={index} direction="row" spacing={1}>
                <Input
                  value={piece}
                  onChange={(e) => handleChange('piece', index, e.target.value)}
                  placeholder="Piece name"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  color="danger"
                  variant="plain"
                  size="sm"
                  onClick={() => handleRemoveField('piece', index)}
                  disabled={pieces.length === 1}
                >
                  ×
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <FormLabel>Technical Requirements</FormLabel>
            <Button size="sm" variant="outlined" onClick={() => handleAddField('requirement')}>
              + Add
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {requirements.map((req, index) => (
              <Stack key={index} direction="row" spacing={1}>
                <Input
                  value={req}
                  onChange={(e) => handleChange('requirement', index, e.target.value)}
                  placeholder="e.g., All major scales, Sight reading"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  color="danger"
                  variant="plain"
                  size="sm"
                  onClick={() => handleRemoveField('requirement', index)}
                  disabled={requirements.length === 1}
                >
                  ×
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          Track mock exams and confidence ratings for each requirement as you practice.
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

export default ExamGoalForm;
