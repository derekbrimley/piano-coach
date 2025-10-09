import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import type { ListeningGoal, ListeningFormData } from '../../types';

interface ListeningFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingGoal?: ListeningGoal | null;
}

const ListeningForm: React.FC<ListeningFormProps> = ({ onSave, onCancel, existingGoal = null }) => {
  const { user } = useAuth();
  const { addGoal, updateGoal } = useGoals(user?.uid);
  const [formData, setFormData] = useState<ListeningFormData>({
    type: 'listening',
    skills: existingGoal?.skills || [],
    details: existingGoal?.details || ''
  });

  const isEditing = !!existingGoal;

  const listeningSkills = [
    'Interval Identification',
    'Chord Identification',
    'Melody Recognition',
    'Rhythm Recognition',
    'Harmonic Progressions'
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

  const handleCheckboxChange = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Listening Goal' : 'Listening Skills'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Skills to Practice</label>
          <div className="space-y-2">
            {listeningSkills.map((skill) => (
              <label key={skill} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleCheckboxChange(skill)}
                  className="mr-2"
                />
                {skill}
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
            placeholder="Specific goals or areas you want to improve..."
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
            disabled={formData.skills.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListeningForm;
