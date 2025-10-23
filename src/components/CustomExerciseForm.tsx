import { useState } from 'react';
import {
  Modal,
  ModalClose,
  Sheet,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Stack,
  Typography,
} from '@mui/joy';
import type { Exercise } from '../types';

interface CustomExerciseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (exercise: Exercise) => void;
}

export function CustomExerciseForm({
  open,
  onClose,
  onSubmit,
}: CustomExerciseFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    if (duration < 1 || duration > 120) {
      setError('Duration must be between 1 and 120 minutes');
      return;
    }

    // Create a temporary exercise object
    const exercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom exercise',
      category: 'Memory & Mental Practice', // Default category for custom exercises
      defaultDuration: duration,
    };

    onSubmit(exercise);
    // Reset form on success
    setName('');
    setDescription('');
    setDuration(15);
    onClose();
  };

  return (
    <Modal
      aria-labelledby="custom-exercise-modal"
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="outlined"
        sx={{
          maxWidth: 500,
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="custom-exercise-modal"
          level="h4"
          textColor="inherit"
          fontWeight="lg"
          mb={1}
        >
          Add Custom Exercise
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Exercise Name *</FormLabel>
              <Input
                placeholder="e.g., Finger Drills, Metronome Practice, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea
                placeholder="What is this exercise for? Any notes or tips?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Default Duration (minutes)</FormLabel>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                slotProps={{
                  input: {
                    min: 1,
                    max: 120,
                  },
                }}
              />
            </FormControl>

            {error && (
              <Typography color="danger" level="body-sm">
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={onClose}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                sx={{ flex: 1 }}
              >
                Add Exercise
              </Button>
            </Stack>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  );
}
