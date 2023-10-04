const express = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const authenticate = require('../middlewares/authenticate');

const router = new express.Router();

// POST /deposit
router.post('/deposit', authenticate, async (req, res) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).send({ error: 'Only buyers can deposit coins.' });
    }
    const { amount } = req.body;
    const validCoins = [5, 10, 20, 50, 100];

    if (!validCoins.includes(amount)) {
        return res.status(400).send({ error: 'Invalid coin denomination.' });
    }

    try {
        req.user.deposit += amount;
        await req.user.save();
        res.send({ deposit: req.user.deposit });
    } catch (e) {
        res.status(500).send();
    }
});

// POST /buy

router.post('/buy', authenticate, async (req, res) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).send({ error: 'Only buyers can buy products.' });
    }

    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found.' });
        }

        const totalCost = product.cost * quantity;
        if (req.user.deposit < totalCost) {
            return res.status(400).send({ error: 'Insufficient funds.' });
        }

        if (product.amountAvailable < quantity) {
            return res.status(400).send({ error: 'Product stock is insufficient.' });
        }

        // Calculate change
        let change = req.user.deposit - totalCost;
        const coins = [100, 50, 20, 10, 5];
        const changeArray = [];

        for (let coin of coins) {
            while (change >= coin) {
                changeArray.push(coin);
                change -= coin;
            }
        }

        req.user.deposit -= totalCost;
        product.amountAvailable -= quantity;

        await req.user.save();
        await product.save();

        res.send({
            message: 'Purchase successful',
            spent: totalCost,
            productsPurchased: {
                productName: product.productName,
                amountPurchased: quantity
            },
            change: changeArray,
            remainingDeposit: req.user.deposit
        });
    } catch (e) {
        console.error(e); // Log the error for debugging
        res.status(500).send();
    }
});


// POST /reset
router.post('/reset', authenticate, async (req, res) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).send({ error: 'Only buyers can reset their deposit.' });
    }
    try {
        req.user.deposit = 0;
        await req.user.save();
        res.send({ deposit: req.user.deposit });
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
