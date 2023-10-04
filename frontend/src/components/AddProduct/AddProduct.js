import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Container, Box, List, ListItem, Card, CardContent, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Header from '../Header/Header';

import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../context/authContext';

function AddProduct() {
    const { token } = useContext(AuthContext);
    const [productName, setProductName] = useState('');
    const [productCost, setProductCost] = useState(0);
    const [amountAvailable, setAmountAvailable] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);



    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const response = await axios.get('/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setProducts(response.data);
            setLoading(false)
        } catch (err) {
            setError('Failed to fetch products.');
            setLoading(false)
        }
    }, [token]);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddOrUpdateProduct = async () => {
        setLoading(true)
        try {
            if (selectedProductId) {
                await axios.put(`/product/${selectedProductId}`, {
                    productName,
                    cost: productCost,
                    amountAvailable
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                await axios.post('/product', {
                    productName,
                    cost: productCost,
                    amountAvailable
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            fetchProducts();
            clearForm();
            setLoading(false)
        } catch (err) {
            setError('Failed to add/update the product.');
            setLoading(false)
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`/product/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchProducts();
        } catch (err) {
            setError('Failed to delete the product.');
        }
    };

    const handleEditProduct = (product) => {
        setSelectedProductId(product._id);
        setProductName(product.productName);
        setProductCost(product.cost);
        setAmountAvailable(product.amountAvailable);
        setIsEditMode(true);
    };


    const clearForm = () => {
        setSelectedProductId(null);
        setProductName('');
        setProductCost(0);
        setAmountAvailable(0);
        setIsEditMode(false);
    };

    return (
        <Container component="main" maxWidth="md">
            <Header />
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {loading && <CircularProgress sx={{ mb: 2 }} />}
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                <Typography variant="h5" gutterBottom>{isEditMode ? 'Update Product' : 'Add New Product'}</Typography>
                <Card variant="outlined" sx={{ mt: 3, width: '100%' }}>
                    <CardContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Product Name"
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Cost"
                            value={productCost}
                            onChange={e => setProductCost(Number(e.target.value))}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Amount Available"
                            value={amountAvailable}
                            onChange={e => setAmountAvailable(Number(e.target.value))}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 3 }}
                            onClick={handleAddOrUpdateProduct}
                        >
                            {isEditMode ? 'Update' : 'Add'}
                        </Button>
                    </CardContent>
                </Card>
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Your Products</Typography>
                <List>
                    {products.map(product => (
                        <ListItem key={product._id}>
                            {product.productName} - {product.cost} - {product.amountAvailable}
                            <IconButton onClick={() => handleEditProduct(product)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteProduct(product._id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Container>
    );
}

export default AddProduct;
