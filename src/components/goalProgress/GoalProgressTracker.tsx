import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import type { PracticeGoal } from '../../types';
import { usePracticeGoal } from '../../hooks/usePracticeGoal';
import PerformanceGoalProgress from './PerformanceGoalProgress';
import SpecificPieceGoalProgress from './SpecificPieceGoalProgress';
import ExamGoalProgress from './ExamGoalProgress';
import SightReadingGoalProgress from './SightReadingGoalProgress';
import ImprovisationGoalProgress from './ImprovisationGoalProgress';
import EarTrainingGoalProgress from './EarTrainingGoalProgress';
import TechniqueGoalProgress from './TechniqueGoalProgress';

interface GoalProgressTrackerProps {
  goal: PracticeGoal | null;
  open: boolean;
  onClose: () => void;
  userId: string;
}

const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({ goal, open, onClose, userId }) => {
  const { updateGoal } = usePracticeGoal(userId);

  if (!goal) {
    return null;
  }

  const handleUpdate = async (updatedGoalData: any) => {
    try {
      await updateGoal(goal.id, {
        goalData: updatedGoalData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  };

  const renderProgressComponent = () => {
    switch (goal.goalType) {
      case 'performance':
        return (
          <PerformanceGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'specificPiece':
        return (
          <SpecificPieceGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'exam':
        return (
          <ExamGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'sightReading':
        return (
          <SightReadingGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'improvisation':
        return (
          <ImprovisationGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'earTraining':
        return (
          <EarTrainingGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      case 'technique':
        return (
          <TechniqueGoalProgress
            goalData={goal.goalData}
            onUpdate={handleUpdate}
            onClose={onClose}
          />
        );
      default:
        return <div>Unknown goal type</div>;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 600,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <ModalClose />
        {renderProgressComponent()}
      </ModalDialog>
    </Modal>
  );
};

export default GoalProgressTracker;
