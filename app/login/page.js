'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { signInWithEmail } from '@/services/firebaseAuth'; // Import the signInWithEmail function
import { Box, Typography, TextField, Button, Stack, Paper, Grid } from '@mui/material';

const gradientBackground = {
  background: 'linear-gradient(135deg, #0c0d34 0%, #1c1d40 100%)',
  height: '100vh',
  width: '100vw',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Roboto, sans-serif',
};

const paperStyles = {
  padding: '20px',
  borderRadius: '12px',
  bgcolor: '#1c1d40',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '400px',
};

const buttonStyles = {
  backgroundColor: '#673AB7',
  color: 'white',
  borderRadius: '20px',
  padding: '10px 20px',
  fontFamily: 'Roboto, sans-serif',
  '&:hover': {
    backgroundColor: '#5E35B1',
  },
};

const leftSectionStyles = {
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: { xs: 'center', md: 'left' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password); // Use the signInWithEmail function
      router.push('/'); // Redirect to home page after successful login
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <Box sx={gradientBackground}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-around">
        {/* Left section */}
        <Grid item xs={12} md={5} sx={leftSectionStyles}>
          <Typography variant="h2" sx={{ color: '#673AB7', mb: 4, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Inventory Pro
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Efficiently manage and track your inventory with our robust system,
            ensuring your stock levels are always accurate and up-to-date.
          </Typography>
        </Grid>

        {/* Sign-in form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={paperStyles}>
            <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
              Login
            </Typography>
            {error && (
              <Typography variant="body1" sx={{ color: 'red', mb: 2 }}>
                {error}
              </Typography>
            )}
            <Stack spacing={2} width="100%">
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: '8px' }}
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: '8px' }}
              />
              <Button variant="contained" sx={buttonStyles} onClick={handleLogin}>
                Sign In
              </Button>
              <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
                Dont have an account? <a href="/signup" style={{ color: '#673AB7' }}>Sign up here</a>
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
