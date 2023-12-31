const jwt = require('jsonwebtoken');
const User = require('../models/user');
const activeTokens = require('./activeTokens');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.YOUR_SECRET_KEY);

        if (!activeTokens.has(decoded.userId, token)) {
            throw new Error('Token is no longer active');
        }

        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('Authentication Failed');

        req.user = user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
