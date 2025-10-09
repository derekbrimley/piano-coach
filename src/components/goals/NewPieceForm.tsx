import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import type { NewPieceGoal, NewPieceFormData, LeadSheetProgress } from '../../types';
import { analyticsEvents } from '../../utils/analytics';

interface NewPieceFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingGoal?: NewPieceGoal | null;
}

const NewPieceForm: React.FC<NewPieceFormProps> = ({ onSave, onCancel, existingGoal = null }) => {
  const { user } = useAuth();
  const { addGoal, updateGoal } = useGoals(user?.uid);
  const [formData, setFormData] = useState<NewPieceFormData>({
    type: 'newPiece',
    name: existingGoal?.name || '',
    pieceType: existingGoal?.pieceType || 'traditional',
    sections: existingGoal?.sections || 1,
    leadSheetProgress: existingGoal?.leadSheetProgress || {
      foundRecordings: false,
      learnedChordProgression: false,
      learnedMelody: false,
      handsTogetherSlowly: false,
      handsTogetherAtSpeed: false,
      appliedJazzLanguage: false
    },
    currentProgress: existingGoal?.currentProgress || '',
    challenges: existingGoal?.challenges || ''
  });

  const isEditing = !!existingGoal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && existingGoal) {
        await updateGoal(existingGoal.id, formData);
      } else {
        await addGoal(formData);
        analyticsEvents.goalCreated('newPiece');
      }
      onSave();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (progressKey: keyof LeadSheetProgress) => {
    setFormData(prev => ({
      ...prev,
      leadSheetProgress: {
        ...prev.leadSheetProgress!,
        [progressKey]: !prev.leadSheetProgress![progressKey]
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Piece' : 'Learning a New Piece'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Piece Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Moonlight Sonata, All of Me"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="pieceType"
                value="traditional"
                checked={formData.pieceType === 'traditional'}
                onChange={handleChange}
                className="mr-2"
              />
              Traditional Piece
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pieceType"
                value="leadSheet"
                checked={formData.pieceType === 'leadSheet'}
                onChange={handleChange}
                className="mr-2"
              />
              Lead Sheet
            </label>
          </div>
        </div>

        {formData.pieceType === 'traditional' ? (
          <div>
            <label className="block text-sm font-medium mb-2">Number of Sections</label>
            <input
              type="number"
              name="sections"
              value={formData.sections}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-3">Progress Stages</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.foundRecordings || false}
                  onChange={() => handleCheckboxChange('foundRecordings')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Found 3 recordings</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.learnedChordProgression || false}
                  onChange={() => handleCheckboxChange('learnedChordProgression')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Learned chord progression</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.learnedMelody || false}
                  onChange={() => handleCheckboxChange('learnedMelody')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Learned melody</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.handsTogetherSlowly || false}
                  onChange={() => handleCheckboxChange('handsTogetherSlowly')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Hands together slowly</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.handsTogetherAtSpeed || false}
                  onChange={() => handleCheckboxChange('handsTogetherAtSpeed')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Hands together at speed</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.leadSheetProgress?.appliedJazzLanguage || false}
                  onChange={() => handleCheckboxChange('appliedJazzLanguage')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Applied jazz language</span>
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Current Progress</label>
          <textarea
            name="currentProgress"
            value={formData.currentProgress}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe where you are with this piece..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Challenges</label>
          <textarea
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What are you struggling with?"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {isEditing ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPieceForm;
