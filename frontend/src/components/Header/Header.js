import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AuthContext from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

function Header() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" sx={{ marginBottom: 3 }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Vending Machine
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
