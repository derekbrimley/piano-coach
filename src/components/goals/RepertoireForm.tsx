import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import type { RepertoireGoal, RepertoireFormData } from '../../types';

interface RepertoireFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingGoal?: RepertoireGoal | null;
}

const RepertoireForm: React.FC<RepertoireFormProps> = ({ onSave, onCancel, existingGoal = null }) => {
  const { user } = useAuth();
  const { addGoal, updateGoal } = useGoals(user?.uid);
  const [pieces, setPieces] = useState<string[]>(existingGoal?.pieces || ['']);

  const isEditing = !!existingGoal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPieces = pieces.filter(p => p.trim() !== '');

    try {
      const goalData: RepertoireFormData = {
        type: 'repertoire',
        pieces: validPieces
      };

      if (isEditing && existingGoal) {
        await updateGoal(existingGoal.id, goalData);
      } else {
        await addGoal(goalData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handlePieceChange = (index: number, value: string) => {
    const newPieces = [...pieces];
    newPieces[index] = value;
    setPieces(newPieces);
  };

  const addPiece = () => {
    setPieces([...pieces, '']);
  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Repertoire Goal' : 'Maintain Repertoire'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Pieces to Maintain</label>
          <div className="space-y-3">
            {pieces.map((piece, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={piece}
                  onChange={(e) => handlePieceChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Piece name"
                />
                {pieces.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePiece(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPiece}
            className="mt-3 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg"
          >
            + Add Another Piece
          </button>
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
            disabled={pieces.filter(p => p.trim() !== '').length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepertoireForm;
