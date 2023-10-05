import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AuthContext from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- Import axios

function Header() {
    const { logout, token } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Call the /user/logout API endpoint
            await axios.post('/user/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            logout(); 
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
           
        }
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
