import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, CircularProgress, Container, Box, Link, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Registration({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/user', { username, password, role });
      onRegister(response.data.token);
    } catch (error) {
      setError("Registration failed. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Card variant="outlined" sx={{ mt: 3, width: '100%' }}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {loading && <CircularProgress />}
              {error && <Typography color="error">{error}</Typography>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Register
              </Button>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Already have an account? <Link component={RouterLink} to="/login" variant="body2">Login</Link>
                </Typography>
              </Box>
            </Box>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
              >
                <MenuItem value={'buyer'}>Buyer</MenuItem>
                <MenuItem value={'seller'}>Seller</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Registration;
