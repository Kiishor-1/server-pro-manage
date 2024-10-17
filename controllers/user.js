const User = require('../models/User');
const Task = require('../models/Task');

exports.addPeople = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { email } = req.body;

        const currentUser = await User.findById(currentUserId).populate('tasks');
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Current user not found',
            });
        }

        const newUser = await User.findOne({ email });
        if (!newUser) {
            return res.status(404).json({
                success: false,
                message: 'User to add is not found',
            });
        }

        const tasks = currentUser.tasks;
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tasks to grant access to',
            });
        }

        for (let task of tasks) {
            if (!task.assignees.includes(newUser._id)) {
                task.assignees.push(newUser._id);
                await task.save();
            }
        }

        newUser.tasks = [...new Set([...newUser.tasks, ...tasks.map(task => task._id)])];
        await newUser.save();

        return res.status(200).json({
            success: true,
            message: `Access granted to ${newUser.email} for all tasks`,
            tasks: newUser.tasks
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error granting task access',
        });
    }
};
