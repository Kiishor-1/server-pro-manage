const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcrypt');

exports.addPeople = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { email } = req.body;

        const newUser = await User.findOne({ email: email });
        console.log(newUser);
        if (!newUser) {
            return res.status(404).json({
                success: false,
                error: 'User to add not found'
            });
        }

        const tasks = await Task.find({ author: currentUserId });
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No tasks to grant access to'
            });
        }

        for (let task of tasks) {
            if (!task.haveAccess.includes(newUser._id)) {
                task.haveAccess.push(newUser._id);
                await task.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: `Access granted to ${newUser.email} for all tasks`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error granting task access'
        });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({
            success: true,
            message: 'Users data fetched successfully',
            users
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
        })
    }
}

exports.updateUserData = async (req, res) => {
    const { name, email, oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!userId) {
        return res.status(403).json({
            success: false,
            error: 'Unauthorized'
        });
    }

    let fieldCount = 0;
    if (name) fieldCount++;
    if (email) fieldCount++;
    if (newPassword) fieldCount++;

    if (fieldCount > 1) {
        return res.status(400).json({
            success: false,
            error: 'You cannot update more than one field at a time'
        });
    }

    try {
        const user = await User.findById(userId);

        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Old password is required to update the password'
                });
            }

            if(newPassword === oldPassword){
                return res.status(400).json({
                    success: false,
                    error: 'New password cannot be same as old password'
                });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    error: 'Old password is incorrect'
                });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'Password updated successfully',
                user: { _id: user._id, name: user.name, email: user.email },
            });
        }

        if (name) {
            user.name = name;
        } else if (email) {
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User data updated successfully',
            user: { _id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user data'
        });
    }
};
