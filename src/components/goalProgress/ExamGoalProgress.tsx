import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Textarea from '@mui/joy/Textarea';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import type { ExamGoalData } from '../../types';

interface ExamGoalProgressProps {
  goalData: ExamGoalData;
  onUpdate: (data: ExamGoalData) => Promise<void>;
  onClose: () => void;
}

const ExamGoalProgress: React.FC<ExamGoalProgressProps> = ({ goalData, onUpdate, onClose }) => {
  // Initialize with defaults if fields are missing
  const initialData: ExamGoalData = {
    examType: goalData?.examType || '',
    technicalRequirements: goalData?.technicalRequirements || [],
    mockExamAttempts: goalData?.mockExamAttempts || []
  };

  const [data, setData] = useState<ExamGoalData>(initialData);
  const [mockExamNotes, setMockExamNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleRequirement = (id: string) => {
    setData({
      ...data,
      technicalRequirements: data.technicalRequirements.map(req =>
        req.id === id ? { ...req, completed: !req.completed } : req
      )
    });
  };

  const updateConfidence = (id: string, rating: number) => {
    setData({
      ...data,
      technicalRequirements: data.technicalRequirements.map(req =>
        req.id === id ? { ...req, confidenceRating: rating } : req
      )
    });
  };

  const addMockExam = () => {
    setData({
      ...data,
      mockExamAttempts: [
        ...data.mockExamAttempts,
        {
          date: new Date().toISOString(),
          notes: mockExamNotes
        }
      ]
    });
    setMockExamNotes('');
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
      <Typography level="h3" sx={{ mb: 3 }}>Update Exam Progress</Typography>

      <Stack spacing={3}>
        {/* Requirements */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>Requirements</Typography>
          <Stack spacing={2}>
            {data.technicalRequirements.map((req) => (
              <Card key={req.id} variant="outlined">
                <Stack spacing={1.5}>
                  <Checkbox
                    label={req.description}
                    checked={req.completed}
                    onChange={() => toggleRequirement(req.id)}
                  />
                  <FormControl size="sm">
                    <FormLabel>Confidence (1-5)</FormLabel>
                    <Stack direction="row" spacing={0.5}>
                      {[1, 2, 3, 4, 5].map(value => (
                        <Button
                          key={value}
                          size="sm"
                          variant={req.confidenceRating === value ? 'solid' : 'outlined'}
                          color={req.confidenceRating === value ? 'primary' : 'neutral'}
                          onClick={() => updateConfidence(req.id, value)}
                          sx={{ flex: 1 }}
                        >
                          {value}
                        </Button>
                      ))}
                    </Stack>
                  </FormControl>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Mock Exams */}
        <Box>
          <Typography level="title-md" sx={{ mb: 2 }}>
            Mock Exam Attempts ({data.mockExamAttempts.length})
          </Typography>

          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Add Mock Exam</FormLabel>
              <Textarea
                placeholder="Notes from mock exam..."
                value={mockExamNotes}
                onChange={(e) => setMockExamNotes(e.target.value)}
                minRows={2}
                sx={{ mb: 1 }}
              />
              <Button onClick={addMockExam} disabled={!mockExamNotes.trim()} size="sm">
                Log Mock Exam
              </Button>
            </FormControl>

            {/* Recent mock exams */}
            {data.mockExamAttempts.slice(-3).reverse().map((attempt, index) => (
              <Card key={index} variant="soft" size="sm">
                <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                  {new Date(attempt.date).toLocaleDateString()}
                </Typography>
                {attempt.notes && (
                  <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    {attempt.notes}
                  </Typography>
                )}
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

export default ExamGoalProgress;
