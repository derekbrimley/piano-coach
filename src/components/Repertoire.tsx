import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRepertoire } from '../hooks/useRepertoire';
import type { RepertoirePiece, ReviewFrequency } from '../types';

const Repertoire: React.FC = () => {
  const { user } = useAuth();
  const { pieces, loading, addPiece, updatePiece, deletePiece } = useRepertoire(user?.uid);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPiece, setEditingPiece] = useState<RepertoirePiece | null>(null);
  const [formData, setFormData] = useState({ name: '', frequency: 'weekly' as ReviewFrequency });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPiece) {
        await updatePiece(editingPiece.id, formData);
        setEditingPiece(null);
      } else {
        await addPiece(formData);
      }
      setFormData({ name: '', frequency: 'weekly' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving piece:', error);
    }
  };

  const handleEdit = (piece: RepertoirePiece) => {
    setEditingPiece(piece);
    setFormData({ name: piece.name, frequency: piece.frequency });
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
    setFormData({ name: '', frequency: 'weekly' });
  };

  const getFrequencyColor = (frequency: ReviewFrequency) => {
    switch (frequency) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Repertoire</h1>
        <p className="text-gray-600">Manage your learned pieces and review schedule</p>
      </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">Review Frequency</label>
              <div className="flex gap-3">
                {(['daily', 'weekly', 'monthly'] as ReviewFrequency[]).map((freq) => (
                  <label key={freq} className="flex items-center">
                    <input
                      type="radio"
                      value={freq}
                      checked={formData.frequency === freq}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ReviewFrequency })}
                      className="mr-2"
                    />
                    <span className="capitalize">{freq}</span>
                  </label>
                ))}
              </div>
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
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFrequencyColor(piece.frequency)}`}>
                    {piece.frequency}
                  </span>
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
  );
};

export default Repertoire;
