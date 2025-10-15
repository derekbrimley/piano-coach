import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';

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
                    <Chip size="sm" variant="soft" color="primary">
                      {session.activities?.filter(a => a.achieved).length || 0} /{' '}
                      {session.activities?.length || 0} completed
                    </Chip>
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
    </Box>
  );
};

export default Dashboard;
