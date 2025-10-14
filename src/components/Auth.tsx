import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsEvents } from '../utils/analytics';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        analyticsEvents.userSignedIn();
      } else {
        await signup(email, password);
        analyticsEvents.userSignedUp();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, var(--joy-palette-primary-50) 0%, var(--joy-palette-primary-100) 100%)'
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: 'lg'
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography level="h1" sx={{ mb: 1 }}>🎹 Piano Practice Coach</Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary' }}>
              {isLogin ? 'Welcome back!' : 'Start your practice journey'}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && (
                <Alert color="danger" variant="soft">
                  {error}
                </Alert>
              )}

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  slotProps={{ input: { minLength: 6 } }}
                  placeholder="••••••••"
                />
              </FormControl>

              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="plain"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Auth;
