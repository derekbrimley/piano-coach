import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
import NewPieceForm from './goals/NewPieceForm';
import type { Goal, NewPieceGoal, PracticeFocus } from '../types';

interface GoalSetupProps {
  onComplete: () => void;
  existingGoals?: Goal[];
  editGoal?: Goal | null;
  onEditGoal: (goal: Goal) => void;
  handleDeleteGoal: (goalId: string) => void;
}

const GoalSetup: React.FC<GoalSetupProps> = ({ onComplete, existingGoals = [], editGoal = null, onEditGoal, handleDeleteGoal }) => {
  const { user } = useAuth();
  const { preferences, loading: preferencesLoading, updatePracticeFocus } = useUserPreferences(user?.uid);
  const [showNewPieceForm, setShowNewPieceForm] = useState(false);

  // If editGoal is provided, show the form immediately
  useEffect(() => {
    if (editGoal && editGoal.type === 'newPiece') {
      setShowNewPieceForm(true);
    }
  }, [editGoal]);

  const handleBack = () => {
    setShowNewPieceForm(false);
  };

  const handlePracticeFocusChange = async (focus: PracticeFocus) => {
    try {
      await updatePracticeFocus(focus);
    } catch (error) {
      console.error('Error updating practice focus:', error);
    }
  };

  // Filter only newPiece goals
  const newPieceGoals = existingGoals.filter(goal => goal.type === 'newPiece') as NewPieceGoal[];

  const getPracticeFocusLabel = (focus: PracticeFocus): string => {
    switch (focus) {
      case 'newPieces':
        return 'Learning New Pieces';
      case 'technique':
        return 'Improving Technique';
      case 'earTraining':
        return 'Ear Training';
      case 'expressivity':
        return 'Expressivity';
      default:
        return '';
    }
  };

  const getPracticeFocusDescription = (focus: PracticeFocus): string => {
    switch (focus) {
      case 'newPieces':
        return 'Focus practice sessions on learning and mastering new pieces';
      case 'technique':
        return 'Emphasize scales, arpeggios, and technical exercises';
      case 'earTraining':
        return 'Prioritize interval recognition, chord identification, and listening skills';
      case 'expressivity':
        return 'Work on dynamics, phrasing, tone quality, and musical expression';
      default:
        return '';
    }
  };

  if (showNewPieceForm) {
    return <NewPieceForm onSave={() => { handleBack(); onComplete(); }} onCancel={handleBack} existingGoal={editGoal as NewPieceGoal | null} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Set Your Practice Goals</h1>
      <p className="text-gray-600 mb-8">Define what you're working on and how you want to focus your practice</p>

      {/* Practice Focus Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Practice Focus</h2>
        <p className="text-gray-600 mb-4">Choose your primary focus to guide practice session generation</p>

        {preferencesLoading ? (
          <div className="text-gray-600">Loading preferences...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['newPieces', 'technique', 'earTraining', 'expressivity'] as PracticeFocus[]).map((focus) => (
              <button
                key={focus}
                onClick={() => handlePracticeFocusChange(focus)}
                className={`p-6 border-2 rounded-lg text-left transition ${
                  preferences?.practiceFocus === focus
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{getPracticeFocusLabel(focus)}</h3>
                  {preferences?.practiceFocus === focus && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{getPracticeFocusDescription(focus)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Piece Goals Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pieces I'm Learning</h2>

        {newPieceGoals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-4">
            <p className="text-gray-600 mb-4">You haven't added any pieces yet</p>
            <button
              onClick={() => setShowNewPieceForm(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Your First Piece
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {newPieceGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{goal.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {goal.pieceType === 'traditional' ? 'Traditional Piece' : 'Lead Sheet'}
                      </p>
                      {goal.pieceType === 'traditional' && goal.sections && (
                        <p className="text-xs text-gray-500 mt-1">{goal.sections} sections</p>
                      )}
                      {goal.pieceType === 'leadSheet' && goal.leadSheetProgress && (
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div className={goal.leadSheetProgress.foundRecordings ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.foundRecordings ? '✓' : '○'} Found 3 recordings
                          </div>
                          <div className={goal.leadSheetProgress.learnedChordProgression ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.learnedChordProgression ? '✓' : '○'} Learned chord progression
                          </div>
                          <div className={goal.leadSheetProgress.learnedMelody ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.learnedMelody ? '✓' : '○'} Learned melody
                          </div>
                          <div className={goal.leadSheetProgress.handsTogetherSlowly ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.handsTogetherSlowly ? '✓' : '○'} Hands together slowly
                          </div>
                          <div className={goal.leadSheetProgress.handsTogetherAtSpeed ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.handsTogetherAtSpeed ? '✓' : '○'} Hands together at speed
                          </div>
                          <div className={goal.leadSheetProgress.appliedJazzLanguage ? 'text-green-600' : ''}>
                            {goal.leadSheetProgress.appliedJazzLanguage ? '✓' : '○'} Applied jazz language
                          </div>
                        </div>
                      )}
                      {goal.lastPracticed && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last practiced: {new Date(goal.lastPracticed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        title="Edit goal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete goal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {goal.currentProgress && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600"><strong>Progress:</strong> {goal.currentProgress}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNewPieceForm(true)}
              className="w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Another Piece
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoalSetup;
