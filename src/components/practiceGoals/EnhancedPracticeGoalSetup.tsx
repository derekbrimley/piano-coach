import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { useAuth } from '../../contexts/AuthContext';
import { usePracticeGoal } from '../../hooks/usePracticeGoal';
import type { PracticeGoalType, GoalSpecificData } from '../../types';
import PerformanceGoalForm from './PerformanceGoalForm';
import SpecificPieceGoalForm from './SpecificPieceGoalForm';
import ExamGoalForm from './ExamGoalForm';
import SightReadingGoalForm from './SightReadingGoalForm';
import ImprovisationGoalForm from './ImprovisationGoalForm';
import EarTrainingGoalForm from './EarTrainingGoalForm';
import TechniqueGoalForm from './TechniqueGoalForm';

interface EnhancedPracticeGoalSetupProps {
  onComplete: () => void;
}

const GOAL_TYPE_LABELS: Record<PracticeGoalType, string> = {
  performance: 'Performance/Recital',
  specificPiece: 'Learning a Specific Piece',
  exam: 'Exam/Audition',
  sightReading: 'Improve Sight-Reading',
  improvisation: 'Build Improvisation Skills',
  earTrainingGoal: 'Ear Training',
  technique: 'Master Technique',
  other: 'Other'
};

const GOAL_TYPE_DESCRIPTIONS: Record<PracticeGoalType, string> = {
  performance: 'Prepare for a specific performance or recital',
  specificPiece: 'Master a particular piece from start to finish',
  exam: 'Prepare for an exam, audition, or assessment',
  sightReading: 'Improve your sight-reading skills',
  improvisation: 'Develop improvisation skills in a specific style',
  earTrainingGoal: 'Build your ear training abilities',
  technique: 'Master a specific technical skill or exercise',
  other: 'Custom goal with your own tracking'
};

const DURATION_OPTIONS = [
  { weeks: 2, label: '2 weeks' },
  { weeks: 4, label: '4 weeks' },
  { weeks: 8, label: '8 weeks' },
  { weeks: 12, label: '12 weeks (3 months)' },
  { weeks: 24, label: '24 weeks (6 months)' }
];

const EnhancedPracticeGoalSetup: React.FC<EnhancedPracticeGoalSetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { createGoal } = usePracticeGoal(user?.uid);

  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [goalType, setGoalType] = useState<PracticeGoalType>('performance');
  const [title, setTitle] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [saving, setSaving] = useState(false);

  const handleGoalTypeSelect = (type: PracticeGoalType) => {
    setGoalType(type);
    setStep('configure');
  };

  const handleGoalDataSave = async (goalData: GoalSpecificData) => {
    if (!user) return;

    setSaving(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = calculateEndDate(durationWeeks);

      // Generate title if not provided
      let finalTitle = title.trim();
      if (!finalTitle) {
        finalTitle = generateDefaultTitle(goalType, goalData);
      }

      await createGoal({
        goalType,
        title: finalTitle,
        startDate,
        endDate,
        goalData
      });

      onComplete();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateEndDate = (weeks: number) => {
    const end = new Date();
    end.setDate(end.getDate() + weeks * 7);
    return end.toISOString();
  };

  const generateDefaultTitle = (type: PracticeGoalType, data: GoalSpecificData): string => {
    switch (type) {
      case 'performance':
        return `Performance: ${(data as any).pieces?.[0]?.name || 'Recital'}`;
      case 'specificPiece':
        return `Learn ${(data as any).pieceName}`;
      case 'exam':
        return `${(data as any).examLevel} Exam`;
      case 'sightReading':
        return `Sight-Reading to ${(data as any).targetLevel}`;
      case 'improvisation':
        return `${(data as any).style} Improvisation`;
      case 'earTrainingGoal':
        return 'Ear Training';
      case 'technique':
        return (data as any).specificTechnique || 'Technique Goal';
      default:
        return 'Practice Goal';
    }
  };

  const renderGoalForm = () => {
    const commonProps = {
      onCancel: () => setStep('select')
    };

    switch (goalType) {
      case 'performance':
        return <PerformanceGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'specificPiece':
        return <SpecificPieceGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'exam':
        return <ExamGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'sightReading':
        return <SightReadingGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'improvisation':
        return <ImprovisationGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'earTrainingGoal':
        return <EarTrainingGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      case 'technique':
        return <TechniqueGoalForm {...commonProps} onSave={handleGoalDataSave} />;
      default:
        return (
          <Stack spacing={2}>
            <Typography>Custom goal tracking coming soon!</Typography>
            <Button onClick={() => setStep('select')}>Go Back</Button>
          </Stack>
        );
    }
  };

  if (step === 'configure') {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Goal Title (optional)</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave blank for auto-generated title"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Duration</FormLabel>
                <Select value={durationWeeks} onChange={(_, val) => val && setDurationWeeks(val)} size="lg">
                  {DURATION_OPTIONS.map(opt => (
                    <Option key={opt.weeks} value={opt.weeks}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
                <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
                  Goal will end on: {new Date(calculateEndDate(durationWeeks)).toLocaleDateString()}
                </Typography>
              </FormControl>

              {renderGoalForm()}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Step: select goal type
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 1 }}>
          Create a Practice Goal
        </Typography>
        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
          Choose the type of goal you'd like to work towards
        </Typography>
      </Box>

      <Stack spacing={2}>
        {(Object.keys(GOAL_TYPE_LABELS) as PracticeGoalType[])
          .filter(type => type !== 'other')
          .map(type => (
            <Card
              key={type}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.500',
                  boxShadow: 'sm'
                }
              }}
              onClick={() => handleGoalTypeSelect(type)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography level="title-lg" sx={{ mb: 0.5 }}>
                      {GOAL_TYPE_LABELS[type]}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      {GOAL_TYPE_DESCRIPTIONS[type]}
                    </Typography>
                  </Box>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ minWidth: '24px' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" color="neutral" onClick={onComplete} fullWidth>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EnhancedPracticeGoalSetup;
