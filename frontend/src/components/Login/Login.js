import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, CircularProgress, Container, Box, Link, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [hasActiveSessionToken, setHasActiveSessionToken] = useState(false);
    const [hasActiveSessionId, setHasActiveSessionId] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/user/login', { username, password });
            login(response.data.token);
            if (response.data.user.role === 'seller') {
                navigate('/add-product');
            } else {
                navigate('/deposit');
            }
        } catch (error) {
            if (error.response.data.error === 'There is already an active session using your account.') {
                setHasActiveSession(true);
                setError(error.response.data.error);
                setHasActiveSessionToken(error.response.data.token)
                setHasActiveSessionId(error.response.data.token)
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateAllSessions = async () => {
        try {
            await axios.post('/user/logout/all', {hasActiveSessionId},{
                headers: {
                    'Authorization': `Bearer ${hasActiveSessionToken}`
                }
            });
            setHasActiveSession(false);
            // Optionally, automatically try to log in again or show a message
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Login
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
                                Login
                            </Button>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="body2">
                                    Don't have an account? <Link component={RouterLink} to="/register" variant="body2">Register</Link>
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
                {hasActiveSession && (
                <div>
                    <p>There is already an active session using your account.</p>
                    <button onClick={handleTerminateAllSessions}>Terminate All Sessions</button>
                </div>
            )}
            </Box>
        </Container>
    );
}

export default Login;
