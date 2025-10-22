import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';
import { usePracticeGoal } from '../hooks/usePracticeGoal';
import type { PracticeGoal, PracticeGoalType } from '../types';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import LinearProgress from '@mui/joy/LinearProgress';
import GoalProgressTracker from './goalProgress/GoalProgressTracker';

interface DashboardProps {
  numGoals: number;
  onNewSession: () => void;
  onManageGoals: () => void;
}

const GOAL_TYPE_LABELS: Record<PracticeGoalType, string> = {
  performance: 'Performance/Recital',
  specificPiece: 'Learning a Specific Piece',
  exam: 'Exam/Audition',
  sightReading: 'Improve Sight-Reading',
  improvisation: 'Build Improvisation Skills',
  earTrainingGoal: 'Ear Training',
  technique: 'Master Technique',
  other: 'Other'
};

const Dashboard: React.FC<DashboardProps> = ({ numGoals, onNewSession, onManageGoals }) => {
  const { user } = useAuth();

  const { sessions, loading: sessionsLoading } = useSessions(user?.uid);
  const { practiceGoals, loading: goalsLoading } = usePracticeGoal(user?.uid);
  const [selectedGoal, setSelectedGoal] = useState<PracticeGoal | null>(null);

  const totalSessions = sessions.length;
  const totalPracticeTime = sessions.reduce((sum, session) => sum + (session.totalDuration || 0), 0);
  const recentSessions = sessions.slice(0, 5);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getGoalProgress = (goal: PracticeGoal): { text: string; percentage?: number } => {
    if (!goal.goalData) return { text: 'Not started' };

    const type = goal.goalType;
    const data = goal.goalData as any;

    switch (type) {
      case 'performance':
        const readyPieces = data.pieces?.filter((p: any) => p.readiness === 'performanceReady').length || 0;
        const totalPieces = data.pieces?.length || 0;
        return {
          text: `${readyPieces}/${totalPieces} pieces ready`,
          percentage: totalPieces > 0 ? (readyPieces / totalPieces) * 100 : 0
        };

      case 'specificPiece':
        const learnedSections = data.sections?.filter((s: any) => s.learned).length || 0;
        const totalSections = data.sections?.length || 0;
        return {
          text: `${learnedSections}/${totalSections} sections • ${data.currentBPM || 0} BPM`,
          percentage: totalSections > 0 ? (learnedSections / totalSections) * 100 : 0
        };

      case 'exam':
        const completedReqs = data.technicalRequirements?.filter((r: any) => r.completed).length || 0;
        const totalReqs = data.technicalRequirements?.length || 0;
        return {
          text: `${completedReqs}/${totalReqs} requirements`,
          percentage: totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0
        };

      case 'sightReading':
        return {
          text: `${data.piecesRead || 0} pieces • ${data.consecutiveDays || 0} day streak`,
          percentage: undefined
        };

      case 'improvisation':
        const masteredKeys = data.keysProgressions?.filter((k: any) => k.mastered).length || 0;
        return {
          text: `${masteredKeys} keys • ${data.patternsLearned || 0} patterns`,
          percentage: undefined
        };

      case 'earTrainingGoal':
        return {
          text: `${data.sessions?.length || 0} sessions • ${data.consecutiveDays || 0} day streak`,
          percentage: undefined
        };

      case 'technique':
        const progress = data.targetBPM > 0
          ? ((data.currentBPM - data.startingBPM) / (data.targetBPM - data.startingBPM)) * 100
          : 0;
        return {
          text: `${data.currentBPM || data.startingBPM || 0} → ${data.targetBPM || 0} BPM`,
          percentage: Math.min(100, Math.max(0, progress))
        };

      default:
        return { text: 'In progress' };
    }
  };

  if (sessionsLoading || goalsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 1 }}>Piano Practice Coach</Typography>
        <Typography level="body-md" sx={{ color: 'text.secondary' }}>
          Track your practice and achieve your musical goals
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 4 }}>
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.500', boxShadow: 'md' }
          }}
          onClick={onNewSession}
        >
          <CardContent>
            <Typography level="h3" sx={{ mb: 1 }}>Start Practice Session</Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Generate a personalized practice plan
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.500', boxShadow: 'md' }
          }}
          onClick={onManageGoals}
        >
          <CardContent>
            <Typography level="h3" sx={{ mb: 1 }}>Manage Goals</Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Set up to 3 practice goals
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Stats */}
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 4 }}>
        <Card variant="soft" sx={{ flex: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Total Sessions
            </Typography>
            <Typography level="h2" sx={{ color: 'primary.500' }}>
              {totalSessions}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="soft" sx={{ flex: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Total Practice Time
            </Typography>
            <Typography level="h2" sx={{ color: 'primary.500' }}>
              {totalPracticeTime} min
            </Typography>
          </CardContent>
        </Card>

        <Card variant="soft" sx={{ flex: 1 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Active Goals
            </Typography>
            <Typography level="h2" sx={{ color: 'primary.500' }}>
              {numGoals}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Active Goals */}
      {practiceGoals.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 2 }}>Active Goals</Typography>
          <Stack spacing={2}>
            {practiceGoals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.endDate);
              const progress = getGoalProgress(goal);
              const isExpiring = daysRemaining <= 7 && daysRemaining > 0;

              return (
                <Card
                  key={goal.id}
                  variant="outlined"
                  color={isExpiring ? 'warning' : 'neutral'}
                  sx={{
                    borderWidth: 2,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.500', boxShadow: 'sm' }
                  }}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography level="title-lg" sx={{ mb: 0.5 }}>
                            {goal.title}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                            {GOAL_TYPE_LABELS[goal.goalType]}
                          </Typography>
                        </Box>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={daysRemaining > 7 ? 'primary' : isExpiring ? 'warning' : 'danger'}
                        >
                          {daysRemaining > 0
                            ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
                            : 'Ended'}
                        </Chip>
                      </Stack>

                      {/* Progress */}
                      {progress.percentage !== undefined ? (
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
                              {progress.text}
                            </Typography>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                              {Math.round(progress.percentage)}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            determinate
                            value={progress.percentage}
                            sx={{ height: 8 }}
                            color={progress.percentage >= 80 ? 'success' : progress.percentage >= 40 ? 'primary' : 'warning'}
                          />
                        </Box>
                      ) : (
                        <Typography level="body-sm" sx={{ fontWeight: 'md', color: 'text.secondary' }}>
                          {progress.text}
                        </Typography>
                      )}

                      {/* Details */}
                      {goal.specificDetails && (
                        <Typography level="body-sm" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {goal.specificDetails}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={onManageGoals} fullWidth>
              Manage Goals
            </Button>
          </Box>
        </Box>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 2 }}>Recent Sessions</Typography>
          <Stack spacing={2}>
            {recentSessions.map((session) => (
              <Card key={session.id} variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography level="title-md">
                        {new Date(session.date).toLocaleDateString()} at{' '}
                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {session.totalDuration} minutes
                      </Typography>
                    </Box>
                  </Stack>
                  {session.notes && (
                    <Typography level="body-sm" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                      "{session.notes}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {numGoals === 0 && (
        <Card variant="soft" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography level="h3" sx={{ mb: 1 }}>Get Started</Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary', mb: 3 }}>
              Set a practice goal to get personalized AI-powered sessions
            </Typography>
            <Button size="lg" onClick={onManageGoals}>
              Set Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goal Progress Tracker Modal */}
      <GoalProgressTracker
        goal={selectedGoal}
        open={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        userId={user?.uid || ''}
      />
    </Box>
  );
};

export default Dashboard;
