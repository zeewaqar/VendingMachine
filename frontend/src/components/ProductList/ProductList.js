import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Button, Typography, Card, CardContent, CardActions, TextField, CircularProgress, Grid, Container, Box } from '@mui/material';
import AuthContext from '../../context/authContext'; // Import the useAuth hook
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

function ProductList() {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({}); 
    const [purchaseResponse, setPurchaseResponse] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/products', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProducts(response.data);
            } catch (err) {
                setError('Failed to fetch products.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [token]);

    const handleBuy = async (productId) => {
        const quantity = quantities[productId] || 1; // Default to 1 if not set

        try {
            const response = await axios.post('/buy', {
                productId,
                quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPurchaseResponse(response.data);
            setProducts(prevProducts => prevProducts.map(product =>
                product._id === productId ? { ...product, amountAvailable: product.amountAvailable - quantity } : product
            ));
            setTimeout(() => setPurchaseResponse(null), 10000); // Reset after 10 seconds
        } catch (err) {
            if (err.response.data.error) {
                setError(err.response.data.error);
                return;
            }
        }
    };

    const handleQuantityChange = (productId, quantity) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: quantity
        }));
    };


    const resetDeposit = async () => {
        try {
            const response = await axios.post('/reset', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data && response.data.deposit === 0) {
                alert('Your deposit has been reset.');
            }
            navigate('/deposit');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed to reset deposit.');
            }
        }
    };


    return (
        <Container component="main" maxWidth="md">
            <Header />
            {loading && <CircularProgress sx={{ mb: 2 }} />}

            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>Available Products</Typography>
                {purchaseResponse && purchaseResponse.remainingDeposit > 0 && (
                    <Button variant="contained" color="secondary" onClick={resetDeposit}>
                        Reset Deposit
                    </Button>
                )}
                {purchaseResponse && (
                    <Box sx={{ mt: 3, mb: 3, p: 2, border: '1px solid', borderColor: 'divider', width: '100%' }}>
                        <Typography variant="h6">Purchase Details:</Typography>
                        <Typography>{purchaseResponse.message}</Typography>
                        <Typography>Spent: {purchaseResponse.spent}</Typography>
                        <Typography>Product Purchased: {purchaseResponse.productsPurchased.productName}</Typography>
                        <Typography>Amount Purchased: {purchaseResponse.productsPurchased.amountPurchased}</Typography>
                        <Typography>Change: {purchaseResponse.change.join(', ')}</Typography>
                        <Typography>Remaining Deposit: {purchaseResponse.remainingDeposit}</Typography>

                    </Box>

                )}
                <Grid container spacing={3}>
                    {products.map(product => (
                        <Grid item xs={12} sm={6} md={4} key={product._id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{product.productName}</Typography>
                                    <Typography color="textSecondary" gutterBottom>Price: {product.cost}</Typography>
                                    <Typography color="textSecondary">Available: {product.amountAvailable}</Typography>
                                   
                                    <TextField
                                        sx={{ mt: 3}}
                                        label="Quantity"
                                        type="number"
                                        defaultValue={1}
                                        onChange={e => handleQuantityChange(product._id, e.target.value)}
                                    />
                                </CardContent>
                                <CardActions>
                                    <Button size="small" color="primary" onClick={() => handleBuy(product._id)}>
                                        Buy
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                {error && typeof error === 'object' && error.message
                    ? <Typography color="error">{error.message}</Typography>
                    : <Typography color="error">{error}</Typography>}
            </Box>
        </Container>
    );
}

export default ProductList;
