const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(403).send({
                success: false,
                error: "All Fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(403).send({
                success: false,
                error: "Passwords do not match",
            });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "User Already Exists, Please login to continue",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 16);

        let user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: "User cannot be registered. Please try again.",
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: `Please Fill up All the Required Fields`,
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: `User is not found. Please signup`,
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email, id: user._id },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            )

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user: { _id: user._id, name: user.name, email: user.email },
                message: `User Login Success`,
            })
        } else {
            return res.status(401).json({
                success: false,
                error: `Password is incorrect`,
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            error: `Login Failure Please Try Again`,
        })
    }
}