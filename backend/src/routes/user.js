const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticate = require('../middlewares/authenticate');
const router = new express.Router();
const activeTokens = require('../middlewares/activeTokens');

router.post('/user', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.YOUR_SECRET_KEY);
    res.status(201).send({ user, token });
  } catch (e) {

    if (e.code === 11000) {
      return res.status(400).send({ error: 'Username already exists.' });
    }
    res.status(400).send({ error: e.message });
  }
});


router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).send({ error: 'Username not found.' });
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) throw new Error('Password does not match.');
    const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY');

    if (activeTokens.has(user._id.toString())) {
      return res.status(400).send({ error: 'There is already an active session using your account.', token, user: user._id });
    }

    activeTokens.add(user._id.toString(), token);
    res.send({ user, token });
  } catch (error) {
    console.error(error);
    if (error.message) {
      return res.status(400).send({ error: error.message });
    }
    res.status(400).send({ error: 'Invalid login credentials.' });
  }
});

router.post('/user/logout', authenticate, async (req, res) => {
  try {
    activeTokens.delete(req.user._id.toString());
    res.send({ message: 'Logged out successfully.' });
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/user/logout/all', authenticate, async (req, res) => {
  try {
    activeTokens.delete(req.user._id.toString());
    res.send({ message: 'All sessions terminated.' });
  } catch (e) {
    res.status(500).send();
  }
});


router.get('/user/me', authenticate, async (req, res) => {
  res.send(req.user);
});

router.put('/user/me', authenticate, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/user/me', authenticate, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});


module.exports = router;
