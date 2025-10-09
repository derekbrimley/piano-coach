import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';

interface DashboardProps {
  numGoals: number;
  onNewSession: () => void;
  onManageGoals: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ numGoals, onNewSession, onManageGoals }) => {
  const { user } = useAuth();

  const { sessions, loading: sessionsLoading } = useSessions(user?.uid);

  

  const totalSessions = sessions.length;
  const totalPracticeTime = sessions.reduce((sum, session) => sum + (session.totalDuration || 0), 0);
  const recentSessions = sessions.slice(0, 5);

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Piano Practice Coach</h1>
        <p className="text-gray-600">Track your practice and achieve your musical goals</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={onNewSession}
          className="p-6 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 transition text-left"
        >
          <h3 className="text-2xl font-bold mb-2">Start Practice Session</h3>
          <p className="text-gray-600">Generate a personalized practice plan</p>
        </button>

        <button
          onClick={onManageGoals}
          className="p-6 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 transition text-left"
        >
          <h3 className="text-2xl font-bold mb-2">Manage Goals</h3>
          <p className="text-gray-600">Add or update your practice goals</p>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-blue-500">{totalSessions}</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Practice Time</p>
          <p className="text-3xl font-bold text-blue-500">{totalPracticeTime} min</p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Goals</p>
          <p className="text-3xl font-bold text-blue-500">{numGoals}</p>
        </div>
      </div>

      

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {new Date(session.date).toLocaleDateString()} at{' '}
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-600">{session.totalDuration} minutes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      {session.activities?.filter(a => a.achieved).length || 0} /{' '}
                      {session.activities?.length || 0} completed
                    </span>
                  </div>
                </div>
                {session.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{session.notes}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {numGoals === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Get Started</h3>
          <p className="text-gray-600 mb-4">Set up your first practice goal to begin</p>
          <button
            onClick={onManageGoals}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
