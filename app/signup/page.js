'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, firestore } from '@/firebase';
import { Box, Typography, TextField, Button, Stack, Paper, CircularProgress } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';

const backgroundImage = {
  backgroundImage: 'url(/images/signup-background.jpg)', // Replace with your image path
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const paperStyles = {
  padding: '30px',
  borderRadius: '15px',
  backgroundColor: 'rgba(28, 29, 64, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.5)',
};

const inputStyles = {
  bgcolor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '8px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: '#673AB7',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#673AB7',
    },
  },
};

const buttonStyles = {
  backgroundColor: '#673AB7',
  color: 'white',
  borderRadius: '20px',
  padding: '12px 25px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#5E35B1',
  },
};

const headingStyles = {
  color: 'white',
  marginBottom: '20px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true); // Start loading

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with the user's full name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Add user details to Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        firstName,
        lastName,
        email,
        uid: user.uid,
      });

      setLoading(false); // Stop loading

      // Redirect to login page
      router.push('/login');

      alert('Signup successful! Please check your email for verification.');
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Failed to sign up. Please try again.');
      setLoading(false); // Stop loading
    }
  };

  return (
    <Box sx={backgroundImage}>
      <Paper elevation={3} sx={paperStyles}>
        <Typography variant="h4" sx={headingStyles}>
          Create Account
        </Typography>
        {error && (
          <Typography variant="body1" sx={{ color: 'red', mb: 2 }}>
            {error}
          </Typography>
        )}
        <Stack spacing={2} width="100%">
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={inputStyles}
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={inputStyles}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={inputStyles}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={inputStyles}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={inputStyles}
          />
          <Button
            variant="contained"
            sx={buttonStyles}
            onClick={handleSignup}
            disabled={loading} // Disable the button when loading
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign Up'}
          </Button>
          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Already have an account? <a href="/login" style={{ color: '#673AB7' }}>Log in here</a>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
