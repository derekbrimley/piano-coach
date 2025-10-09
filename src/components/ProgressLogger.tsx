import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';
import { useGoals } from '../hooks/useGoals';
import { useRepertoire } from '../hooks/useRepertoire';
import { Session } from '../types';

interface ProgressLoggerProps {
  session: Session;
  onComplete: () => void;
}

const ProgressLogger = ({ session, onComplete }: ProgressLoggerProps) => {
  const { user } = useAuth();
  const { addSession } = useSessions(user?.uid);
  const { updateGoal } = useGoals(user?.uid);
  const { markAsReviewed } = useRepertoire(user?.uid);
  const [activityProgress, setActivityProgress] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');

  const handleProgressChange = (activityId: string, achieved: boolean) => {
    setActivityProgress(prev => ({
      ...prev,
      [activityId]: achieved
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save session with progress
      await addSession({
        activities: session.activities.map(activity => ({
          ...activity,
          achieved: activityProgress[activity.id] || false
        })),
        notes,
        totalDuration: session.totalDuration,
        completedAt: new Date().toISOString()
      });

      // Update goal progress based on achievements
      const goalUpdates: Record<string, { lastPracticed: string; sessionsCompleted: number }> = {};
      session.activities.forEach(activity => {
        if (activity.goalId && activityProgress[activity.id]) {
          if (!goalUpdates[activity.goalId]) {
            goalUpdates[activity.goalId] = {
              lastPracticed: new Date().toISOString(),
              sessionsCompleted: 1
            };
          }
        }
      });

      // Update each goal
      for (const [goalId, updates] of Object.entries(goalUpdates)) {
        await updateGoal(goalId, updates as Partial<any>);
      }

      // Mark repertoire pieces as reviewed when practiced
      const repertoirePiecesToUpdate = session.activities.filter(
        activity => activity.type === 'repertoire' && activity.pieceId && activityProgress[activity.id]
      );

      for (const activity of repertoirePiecesToUpdate) {
        if (activity.pieceId) {
          await markAsReviewed(activity.pieceId);
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error logging progress:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
      <p className="text-gray-600 mb-8">How did it go?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Progress */}
        <div className="space-y-4">
          {session.activities.map((activity) => (
            <div key={activity.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">{activity.title}</h3>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`progress-${activity.id}`}
                    checked={activityProgress[activity.id] === true}
                    onChange={() => handleProgressChange(activity.id, true)}
                    className="mr-2"
                  />
                  <span className="text-green-600">✓ Achieved</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`progress-${activity.id}`}
                    checked={activityProgress[activity.id] === false}
                    onChange={() => handleProgressChange(activity.id, false)}
                    className="mr-2"
                  />
                  <span className="text-gray-600">Still working on it</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Session Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notes for Next Session (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What went well? What needs more work? Any insights or breakthroughs?"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg font-semibold"
        >
          Save Progress
        </button>
      </form>
    </div>
  );
};

export default ProgressLogger;
