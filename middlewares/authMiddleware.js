const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }
        console.log('Received token:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
        console.log('Authenticated user:', user);

        req.user = user;
        next();
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
};

module.exports = authMiddleware;