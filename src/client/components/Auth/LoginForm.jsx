// src/client/components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';

const LoginForm = () => {
	const navigate = useNavigate();
	const [credentials, setCredentials] = useState({ email: '', senha: '' });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                setError(data.message || 'Erro ao fazer login');
            }
        } catch (error) {
            setError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
  };

  return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h5" align="center" mb={3}>Login</Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        value={credentials.email}
                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Senha"
                        margin="normal"
                        value={credentials.senha}
                        onChange={e => setCredentials({...credentials, senha: e.target.value})}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <Button 
                        fullWidth 
                        variant="contained" 
                        type="submit" 
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </Paper>
        </Box>
  );
};

export default LoginForm;
