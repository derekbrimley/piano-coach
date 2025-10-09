import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRepertoire } from '../hooks/useRepertoire';
import { useScaleSkills } from '../hooks/useScaleSkills';
import { useEarTraining } from '../hooks/useEarTraining';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { SCALES, INTERVALS, CHORDS, SCALE_SKILL_FIELDS } from '../data/skillsData';
import type { RepertoirePiece } from '../types';

type TabType = 'repertoire' | 'scales' | 'earTraining' | 'preferences';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { pieces, loading: repertoireLoading, addPiece, updatePiece, deletePiece } = useRepertoire(user?.uid);
  const { scaleSkills, loading: scalesLoading, updateScaleSkill } = useScaleSkills(user?.uid);
  const { earTraining, loading: earTrainingLoading, toggleInterval, toggleChord } = useEarTraining(user?.uid);
  const { preferences, loading: preferencesLoading, updateDefaultSessionLength } = useUserPreferences(user?.uid);

  const [activeTab, setActiveTab] = useState<TabType>('repertoire');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPiece, setEditingPiece] = useState<RepertoirePiece | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPiece) {
        await updatePiece(editingPiece.id, formData);
        setEditingPiece(null);
      } else {
        await addPiece(formData);
      }
      setFormData({ name: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving piece:', error);
    }
  };

  const handleEdit = (piece: RepertoirePiece) => {
    setEditingPiece(piece);
    setFormData({ name: piece.name });
    setShowAddForm(true);
  };

  const handleDelete = async (pieceId: string) => {
    if (window.confirm('Are you sure you want to delete this piece from your repertoire?')) {
      try {
        await deletePiece(pieceId);
      } catch (error) {
        console.error('Error deleting piece:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPiece(null);
    setFormData({ name: '' });
  };

  const getTimeSinceReview = (lastReviewed?: string) => {
    if (!lastReviewed) return 'Never reviewed';

    const now = new Date();
    const reviewedDate = new Date(lastReviewed);
    const daysSince = Math.floor((now.getTime() - reviewedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) return 'Reviewed today';
    if (daysSince === 1) return 'Reviewed yesterday';
    return `Reviewed ${daysSince} days ago`;
  };

  const getScaleSkillValue = (scaleKey: string, field: string): number => {
    const skill = scaleSkills.find(s => s.key === scaleKey);
    return skill ? (skill as any)[field] || 0 : 0;
  };

  const handleScaleSkillChange = async (scaleKey: string, field: string, value: number) => {
    try {
      await updateScaleSkill(scaleKey, { [field]: value } as any);
    } catch (error) {
      console.error('Error updating scale skill:', error);
    }
  };

  const handleSessionLengthChange = async (length: number) => {
    try {
      await updateDefaultSessionLength(length);
    } catch (error) {
      console.error('Error updating default session length:', error);
    }
  };

  const loading = repertoireLoading || scalesLoading || earTrainingLoading || preferencesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Track your repertoire, scales, and ear training progress</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('repertoire')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'repertoire'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Repertoire
          </button>
          <button
            onClick={() => setActiveTab('scales')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'scales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scale Skills
          </button>
          <button
            onClick={() => setActiveTab('earTraining')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'earTraining'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ear Training
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Repertoire Tab */}
      {activeTab === 'repertoire' && (
        <div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Piece
            </button>
          )}

          {showAddForm && (
            <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold mb-4">{editingPiece ? 'Edit Piece' : 'Add New Piece'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Piece Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Moonlight Sonata"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingPiece ? 'Update' : 'Add'} Piece
                  </button>
                </div>
              </form>
            </div>
          )}

          {pieces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">No Pieces Yet</h3>
              <p className="text-gray-600">Add pieces you've learned to maintain your repertoire</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pieces.map((piece) => (
                <div key={piece.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{piece.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(piece)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        title="Edit piece"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(piece.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete piece"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {getTimeSinceReview(piece.lastReviewed)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scale Skills Tab */}
      {activeTab === 'scales' && (
        <div>
          <p className="text-gray-600 mb-6">Track your BPM progress for each scale and technique</p>
          <div className="space-y-6">
            {SCALES.map((scale) => (
              <div key={scale} className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold mb-4">{scale}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SCALE_SKILL_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium mb-2">{field.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={getScaleSkillValue(scale, field.key)}
                          onChange={(e) => handleScaleSkillChange(scale, field.key, parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-600">BPM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ear Training Tab */}
      {activeTab === 'earTraining' && (
        <div className="space-y-8">
          {/* Intervals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Interval Recognition</h3>
            <p className="text-gray-600 mb-4">Check off intervals you can consistently identify</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTERVALS.map((interval) => (
                <label key={interval} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={earTraining?.intervals.includes(interval) || false}
                    onChange={() => toggleInterval(interval)}
                    className="w-5 h-5 mr-3 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{interval}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Progress: <span className="font-semibold">{earTraining?.intervals.length || 0} / {INTERVALS.length}</span> mastered
              </p>
            </div>
          </div>

          {/* Chords */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Chord Recognition</h3>
            <p className="text-gray-600 mb-4">Check off chords you can consistently identify</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CHORDS.map((chord) => (
                <label key={chord} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={earTraining?.chords.includes(chord) || false}
                    onChange={() => toggleChord(chord)}
                    className="w-5 h-5 mr-3 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{chord}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Progress: <span className="font-semibold">{earTraining?.chords.length || 0} / {CHORDS.length}</span> mastered
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Session Preferences</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Default Session Length</label>
                <p className="text-sm text-gray-600 mb-4">This will be pre-selected when you start a new practice session</p>
                <select
                  value={preferences?.defaultSessionLength || 60}
                  onChange={(e) => handleSessionLengthChange(parseInt(e.target.value))}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
