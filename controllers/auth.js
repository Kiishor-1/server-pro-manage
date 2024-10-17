const User = require('../models/User');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(409).json({
                success: false,
                message: 'Please provide all the required fields',
            });
        }
        console.log('name', name);
        console.log('email', email);
        console.log('password', password);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.log('Error during registration', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(409).json({
                success: false,
                message: 'Please provide all the required fields',
            });
        }
        console.log('email', email);
        console.log('password', password);
        res.status(201).json({
            success: true,
            message: 'User Logged In successfully',
        });
    } catch (error) {
        console.log('Error during login', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        });
    }
}