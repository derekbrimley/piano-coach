import React, { useState, useMemo } from 'react';
import { EXERCISE_LIBRARY, EXERCISE_CATEGORIES } from '../data/exerciseLibrary';
import type { Exercise } from '../types';
import { CustomExerciseForm } from './CustomExerciseForm';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter(exercise => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || exercise.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const exercisesByCategory = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {};

    filteredExercises.forEach(exercise => {
      const category = exercise.category as string;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(exercise);
    });

    return grouped;
  }, [filteredExercises]);

  const handleExerciseClick = (exercise: Exercise) => {
    onSelect(exercise);
    onClose();
  };

  const handleCreateCustomExercise = (exercise: Exercise) => {
    onSelect(exercise);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Exercise</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Add Custom Exercise */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowCustomForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium whitespace-nowrap"
              title="Create a custom exercise"
            >
              + Add Custom
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedCategory === 'All'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {EXERCISE_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No exercises found matching your search.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(exercisesByCategory).map(([category, exercises]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold mb-3 text-gray-800">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exercises.map(exercise => (
                      <button
                        key={exercise.id}
                        onClick={() => handleExerciseClick(exercise)}
                        className="text-left p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-300 border border-gray-200 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                          <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">
                            {exercise.defaultDuration} min
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Exercise Form Modal */}
        <CustomExerciseForm
          open={showCustomForm}
          onClose={() => setShowCustomForm(false)}
          onSubmit={handleCreateCustomExercise}
        />
      </div>
    </div>
  );
};

export default ExerciseSelector;
