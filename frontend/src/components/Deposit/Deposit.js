import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Button, Typography, Box, Paper, Grid, CircularProgress, Container } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext'; // Import the useAuth hook
import Header from '../Header/Header';

const StyledPaper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(4)};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CoinButton = styled(Button)`
  margin: ${(props) => props.theme.spacing(1)};
`;

function DepositCoin() {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleCoinClick = async (value) => {
    setLoading(true);
    try {
       await axios.post('/deposit', { amount: value }, {
        headers: {
          'Authorization': `Bearer ${token}` // Send the token in the request header
        }
      });
      setAmount(prevAmount => prevAmount + value);
      setSuccessMessage(`Successfully deposited ${value} coins!`);
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      setErrorMessage('Failed to deposit coins. Please try again.');
      setSuccessMessage(''); // Clear any previous success messages
    } finally {
      setLoading(false);
    }
  };
  const goToProducts = () => {
    navigate('/products');
  };
  return (
    <Container component="main" maxWidth="md">
      <Header />
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60vh">
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Deposit Coins
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[5, 10, 20, 50, 100].map(coin => (
              <Grid item key={coin}>
                <CoinButton variant="contained" onClick={() => handleCoinClick(coin)}>
                  {coin} cents
                </CoinButton>
              </Grid>
            ))}
          </Grid>
          <Box mt={4}>
            <Typography variant="h6">
              Total Deposited: {amount} cents
            </Typography>
          </Box>
          {successMessage &&
            <Button
              variant="contained"
              color="secondary"
              style={{ marginTop: 20 }}
              onClick={goToProducts}
            >
              Show Products
            </Button>
          }
          {loading && <CircularProgress style={{ marginTop: 20 }} />}
          {successMessage && <Typography color="primary" style={{ marginTop: 20 }}>{successMessage}</Typography>}
          {errorMessage && <Typography color="error" style={{ marginTop: 20 }}>{errorMessage}</Typography>}
        </StyledPaper>
      </Box>
    </Container>
  );
}

export default DepositCoin;
