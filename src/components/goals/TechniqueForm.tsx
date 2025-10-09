import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import type { TechniqueGoal, TechniqueFormData } from '../../types';

interface TechniqueFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingGoal?: TechniqueGoal | null;
}

const TechniqueForm: React.FC<TechniqueFormProps> = ({ onSave, onCancel, existingGoal = null }) => {
  const { user } = useAuth();
  const { addGoal, updateGoal } = useGoals(user?.uid);
  const [formData, setFormData] = useState<TechniqueFormData>({
    type: 'technique',
    focus: existingGoal?.focus || [],
    details: existingGoal?.details || ''
  });

  const isEditing = !!existingGoal;

  const techniqueOptions = [
    'Scales',
    'Arpeggios',
    'Sight Reading',
    'Hand Independence',
    'Fingering',
    'Dynamics',
    'Rhythm',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && existingGoal) {
        await updateGoal(existingGoal.id, formData);
      } else {
        await addGoal(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleCheckboxChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      focus: prev.focus.includes(option)
        ? prev.focus.filter(f => f !== option)
        : [...prev.focus, option]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Technique Goal' : 'Technique Practice'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Areas of Focus</label>
          <div className="grid grid-cols-2 gap-3">
            {techniqueOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.focus.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Additional Details</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any specific exercises, goals, or areas you want to focus on..."
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
            disabled={formData.focus.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TechniqueForm;
