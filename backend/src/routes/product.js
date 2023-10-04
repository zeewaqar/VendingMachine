const express = require('express');
const Product = require('../models/product');
const authenticate = require('../middlewares/authenticate');

const router = new express.Router();

router.post('/product', authenticate, async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).send({ error: 'Only sellers can add products.' });
  }
  const product = new Product({
    ...req.body,
    sellerId: req.user._id
  });
  try {
    await product.save();
    res.status(201).send(product);
  } catch (e) {
    res.status(400).send(e);
  }
});


router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/product/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (e) {
    res.status(500).send();
  }
});

router.put('/product/:id', authenticate, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['productName', 'cost', 'amountAvailable'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).send();
    }

    updates.forEach((update) => product[update] = req.body[update]);
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(400).send(e);
  }
});


router.delete('/product/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (e) {
    res.status(500).send();
  }
});


module.exports = router;
